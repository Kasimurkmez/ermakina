
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    collection, 
    doc, 
    setDoc, 
    deleteDoc, 
    onSnapshot, 
    writeBatch, 
    query 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../components/firebase';
import * as XLSX from 'xlsx';

// Ham Malzeme Veri Modeli
export interface MaterialData {
    id: string; // Firestore Document ID (Benzersiz)
    'girdi no': string;
    'parça no': string;
    'malzeme türü': string;
    'malzeme ölçüsü': string;
    'malzeme kalitesi': string;
    'adet': string | number;
    'raf no': string;
    'açıklama'?: string;
    [key: string]: any;
}

// Nükleer Normalizasyon: Türkçe karakterleri ve noktalama işaretlerini tamamen söker atar.
const normalizeHeader = (header: string): string => {
    return (header || '')
        .trim()
        .toLocaleLowerCase('tr-TR')
        .replace(/['".,\/#@!$%\^&\*;:{}=\-_`~()\[\]]/g, '') // Noktalama işaretlerini kaldır
        .replace(/\s+/g, '') // Boşlukları kaldır
        .replace(/ı/g, 'i').replace(/İ/g, 'i')
        .replace(/ş/g, 's').replace(/Ş/g, 's')
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'g')
        .replace(/ü/g, 'u').replace(/Ü/g, 'u')
        .replace(/ö/g, 'o').replace(/Ö/g, 'o')
        .replace(/ç/g, 'c').replace(/Ç/g, 'c');
};

// Arama için metni temizleyen fonksiyon
const normalizeForSearch = (text: string) => {
    return String(text).toLocaleLowerCase('tr-TR')
               .replace(/\s+/g, '') 
               .replace(/['".,\/#@!$%\^&\*;:{}=\-_`~()Ø]/g, '');
};

const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const chunked_arr = [];
    let index = 0;
    while (index < array.length) {
        chunked_arr.push(array.slice(index, size + index));
        index += size;
    }
    return chunked_arr;
};

// Validasyon
const validateMaterial = (data: Partial<MaterialData>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    // Parça No veya Girdi No'dan en az biri dolu olmalı
    const hasParcaNo = data['parça no'] && String(data['parça no']).trim() !== '';
    const hasGirdiNo = data['girdi no'] && String(data['girdi no']).trim() !== '';

    if (!hasParcaNo && !hasGirdiNo) {
        errors.push("HATA: Satırda 'Parça No' veya 'Girdi No' bulunamadı.");
    }
    return { isValid: errors.length === 0, errors };
};

export const useMaterialData = (user: User | null, role: 'admin' | 'guest' | null) => {
    const [data, setData] = useState<MaterialData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOperationLoading, setIsOperationLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>({ key: 'parça no', direction: 'ascending' });

    useEffect(() => {
        if (!user) {
            setData([]);
            return;
        }

        setIsLoading(true);
        const q = query(collection(db, 'raw_materials'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const firestoreData: MaterialData[] = [];
            snapshot.forEach((doc) => {
                firestoreData.push({ ...doc.data(), id: doc.id } as MaterialData);
            });
            setData(firestoreData);
            setIsLoading(false);
        }, (err) => {
            console.error("Firestore Error:", err);
            setError("Veritabanı bağlantı hatası.");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const sortData = useCallback((dataToSort: MaterialData[]) => {
        if (!sortConfig) return dataToSort;
        return [...dataToSort].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            const strA = String(aValue ?? '').toLocaleLowerCase('tr-TR');
            const strB = String(bValue ?? '').toLocaleLowerCase('tr-TR');
            if (strA < strB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (strA > strB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [sortConfig]);

    const processedData = useMemo(() => {
        let filtered = data;

        if (searchQuery) {
            const rawQuery = searchQuery.toLocaleLowerCase('tr-TR');
            const strippedQuery = normalizeForSearch(searchQuery);

            filtered = filtered.filter(row => {
                const { id, ...rest } = row;
                const rowValues = Object.values(rest).join(' ');
                
                const rawRowText = rowValues.toLocaleLowerCase('tr-TR');
                const words = rawQuery.split(' ').filter(w => w.length > 0);
                const matchesWords = words.every(term => rawRowText.includes(term));

                const strippedRowText = normalizeForSearch(rowValues);
                const matchesStripped = strippedRowText.includes(strippedQuery);

                return matchesWords || matchesStripped;
            });
        }
        
        Object.entries(activeFilters).forEach(([key, val]) => {
            const filterValues = val as string[];
            if (filterValues && filterValues.length > 0) {
                filtered = filtered.filter(row => {
                    const rowVal = String(row[key]);
                    return filterValues.includes(rowVal);
                });
            }
        });

        return sortData(filtered);
    }, [data, searchQuery, activeFilters, sortData]);

    const checkPermission = () => {
        if (!user) throw new Error("Oturum açmanız gerekiyor.");
        if (role !== 'admin') throw new Error("Bu işlem için yetkiniz yok. (Sadece Okunabilir Mod)");
    };

    const saveData = async (rowData: Partial<MaterialData>) => {
        checkPermission();
        const validation = validateMaterial(rowData);
        if (!validation.isValid) throw new Error(validation.errors.join('\n'));

        const finalData = rowData as MaterialData;
        // Yeni kayıt ise benzersiz ID oluştur
        const docId = finalData.id || `mat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const dataToSave = { ...finalData, id: docId };

        setIsOperationLoading(true);
        try {
            await setDoc(doc(db, 'raw_materials', docId), dataToSave);
            setError(null);
        } catch (err: any) {
            throw new Error(`Kayıt hatası: ${err.message}`);
        } finally {
            setIsOperationLoading(false);
        }
    };

    const deleteData = async (id: string) => {
        checkPermission();
        setIsOperationLoading(true);
        try {
            await deleteDoc(doc(db, 'raw_materials', id));
            setError(null);
        } catch (err: any) {
            throw new Error(`Silme hatası: ${err.message}`);
        } finally {
            setIsOperationLoading(false);
        }
    };

    const clearAllData = async () => {
        checkPermission();
        setIsOperationLoading(true);
        try {
            const chunks = chunkArray<MaterialData>(data, 400);
            for (const chunk of chunks) {
                const writeBatchInst = writeBatch(db);
                chunk.forEach((row) => {
                    if (row.id) {
                        const docRef = doc(db, 'raw_materials', row.id);
                        writeBatchInst.delete(docRef);
                    }
                });
                await writeBatchInst.commit();
            }
            setSearchQuery('');
        } catch (err: any) {
            throw new Error(`Temizleme hatası: ${err.message}`);
        } finally {
            setIsOperationLoading(false);
        }
    };

    const processExcelFile = async (file: File, staticHeaders: string[]) => {
        checkPermission();
        setIsOperationLoading(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const dataAsArray = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });

            if (dataAsArray.length < 1) throw new Error("Excel dosyası boş.");
            
            // GELİŞMİŞ BAŞLIK EŞLEŞTİRME (Mapping)
            const headerMapping: Record<string, string> = {
                'girdino': 'girdi no', 'girdinumara': 'girdi no', 'girdinumarasi': 'girdi no',
                'parcano': 'parça no', 'parcanumarasi': 'parça no', 'kod': 'parça no', 'malzemekodu': 'parça no', 'parcapno': 'parça no',
                'malzemeturu': 'malzeme türü', 'malzemecinsi': 'malzeme türü', 'cins': 'malzeme türü', 'tur': 'malzeme türü', 'malzemetur': 'malzeme türü',
                'malzemeolcusu': 'malzeme ölçüsü', 'olcu': 'malzeme ölçüsü', 'ebat': 'malzeme ölçüsü', 'boyut': 'malzeme ölçüsü',
                'malzemekalitesi': 'malzeme kalitesi', 'kalite': 'malzeme kalitesi', 'nitelik': 'malzeme kalitesi',
                'adet': 'adet', 'stok': 'adet', 'miktar': 'adet',
                'rafno': 'raf no', 'raf': 'raf no', 'konum': 'raf no', 'depoyer': 'raf no',
                'aciklama': 'açıklama', 'not': 'açıklama'
            };

            // Başlık satırını bulmak için "girdi no" veya "parça no"ya benzeyen satırı ara
            let headerRowIndex = -1;
            let excelHeaders: string[] = [];
            const criticalKeywords = ['girdino', 'parcano', 'malzemekodu', 'kod', 'urun'];

            for (let i = 0; i < Math.min(30, dataAsArray.length); i++) {
                const rowNormalized = dataAsArray[i].map(String).map(normalizeHeader);
                if (rowNormalized.some(cell => criticalKeywords.some(key => cell.includes(key)))) {
                    headerRowIndex = i;
                    excelHeaders = dataAsArray[i].map(String);
                    break;
                }
            }

            if (headerRowIndex === -1) {
                // Hata durumunda detaylı bilgi ver
                const firstRowPreview = dataAsArray[0]?.map(String).join(' | ');
                throw new Error(`Başlık satırı bulunamadı. Excel'de 'Girdi No', 'Parça No' veya 'Malzeme Kodu' sütunları olduğundan emin olun. (İlk Satır: ${firstRowPreview})`);
            }

            const dataRows = dataAsArray.slice(headerRowIndex + 1);
            const validData: MaterialData[] = [];
            let skippedCount = 0;

            dataRows.forEach((rowArray, index) => {
                const newData: any = {};
                let hasData = false;

                // Başlık eşleştirmesi ile veriyi oku
                excelHeaders.forEach((headerText, colIndex) => {
                    const normalizedHeader = normalizeHeader(headerText);
                    const mappedKey = headerMapping[normalizedHeader];
                    
                    if (mappedKey) {
                        let cellValue = rowArray[colIndex];
                        if (cellValue !== undefined && cellValue !== null && String(cellValue).trim() !== '') {
                            newData[mappedKey] = String(cellValue).trim();
                            hasData = true;
                        }
                    }
                });

                if (hasData) {
                    // Eksik standart başlıkları tamamla
                    staticHeaders.forEach(h => {
                        if (newData[h] === undefined) newData[h] = '';
                    });

                    // BENZERSİZ ID OLUŞTURMA (CRITICAL)
                    // Aynı parça numarasından 10 tane de olsa, hepsini ayrı kaydetmek için unique ID.
                    newData.id = `mat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`;

                    validData.push(newData);
                } else {
                    skippedCount++;
                }
            });

            if (validData.length === 0) throw new Error("Yüklenecek geçerli veri bulunamadı.");

            // Batch Write (Toplu Yazma)
            const chunks = chunkArray(validData, 400);
            for(const chunk of chunks) {
                const batch = writeBatch(db);
                chunk.forEach(row => {
                    batch.set(doc(db, 'raw_materials', row.id), row);
                });
                await batch.commit();
            }
            
            return { success: true, count: validData.length, skipped: skippedCount };

        } catch (err: any) {
            throw new Error(err.message || "Dosya işlenemedi.");
        } finally {
            setIsOperationLoading(false);
        }
    };

    return {
        data: processedData, 
        rawData: data, 
        isLoading,
        isOperationLoading,
        error,
        setError,
        searchQuery,
        setSearchQuery,
        activeFilters,
        setActiveFilters,
        sortConfig,
        setSortConfig,
        saveData,
        deleteData,
        clearAllData,
        processExcelFile
    };
};
