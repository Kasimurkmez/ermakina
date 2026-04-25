import React, { useState, useEffect } from 'react';
import { XIcon, RefreshCwIcon, UploadCloudIcon } from './Icons';
// import { uploadImageToCloudinary } from '../cloudinary'; // Gerekirse açarsın

type DataRow = Record<string, any>;
type Operator = { no: string; name: string; };

interface AddDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rowData: DataRow, imageFileOrUrl?: File | string | null, removeImage?: boolean) => Promise<void>; 
    initialData?: DataRow | null;
    operators: Operator[];
    headers: string[];
}

const AddDataModal: React.FC<AddDataModalProps> = ({ isOpen, onClose, onSave, initialData, operators, headers }) => {
    const [formData, setFormData] = useState<DataRow>({});
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isImageDeleted, setIsImageDeleted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
                setPreviewUrl(initialData['resim'] || null);
            } else {
                const empty: DataRow = {};
                headers.forEach(h => empty[h] = '');
                // Varsayılan ömür değeri boş veya 1000 olarak başlatılabilir
                empty['total_life'] = ''; 
                setFormData(empty);
                setPreviewUrl(null);
            }
            setSelectedImage(null);
            setIsImageDeleted(false);
            setIsSubmitting(false);
        }
    }, [isOpen, initialData, headers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return; 
        if (!formData['seri no']) return alert("Seri no zorunlu!");

        setIsSubmitting(true);
        try {
            const dataToPass = selectedImage || (isImageDeleted ? null : (initialData?.['resim'] || null));
            
            // --- YENİ EKLENEN MANTIK ---
            // Form verilerini kopyala
            const finalData = { ...formData };

            // Eğer 'total_life' girildiyse sayıya çevir
            if (finalData['total_life']) {
                finalData['total_life'] = Number(finalData['total_life']);
            }

            // Eğer bu YENİ bir kayıt ise ve total_life girilmişse,
            // current_life (kalan ömür) değerini de total_life ile aynı yap.
            if (!initialData && finalData['total_life']) {
                finalData['current_life'] = finalData['total_life'];
            }
            // ---------------------------

            await onSave(finalData, dataToPass, isImageDeleted);
            onClose();
        } catch (error: any) {
            console.error("Hata:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4" onClick={onClose}>
            <div className="bg-gray-900 rounded-xl p-8 w-full max-w-2xl border border-gray-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-teal-400">{initialData ? 'Veriyi Düzenle' : 'Yeni Veri Ekle'}</h2>
                    <button onClick={onClose} disabled={isSubmitting}><XIcon className="w-7 h-7 text-gray-400 hover:text-white" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Görsel Yükleme Alanı */}
                    <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-6 border border-gray-700">
                        <div className="w-24 h-24 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center border border-gray-600">
                            {previewUrl ? <img src={previewUrl} className="object-cover w-full h-full" alt="Önizleme" /> : <UploadCloudIcon className="w-10 h-10 text-gray-500" />}
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm font-bold text-gray-400 uppercase">Fikstür Görseli</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                disabled={isSubmitting}
                                onChange={e => {
                                    const f = e.target.files?.[0];
                                    if(f) { 
                                        setSelectedImage(f); 
                                        setPreviewUrl(URL.createObjectURL(f)); 
                                        setIsImageDeleted(false); 
                                    }
                                }} 
                                className="text-xs text-gray-400" 
                            />
                        </div>
                        {previewUrl && !isSubmitting && (
                            <button type="button" onClick={() => { setPreviewUrl(null); setSelectedImage(null); setIsImageDeleted(true); }} className="px-3 py-1.5 bg-red-900/50 text-red-400 rounded-lg text-xs hover:bg-red-800 border border-red-800">Sil</button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        
                        {/* --- YENİ EKLENEN INPUT: FİKSTÜR ÖMRÜ --- */}
                        {/* Bunu manuel olarak en başa ekliyoruz ki operatör kolayca görsün */}
                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                            <label className="block text-xs font-bold text-teal-400 uppercase mb-1">
                                Fikstür Ömrü / Sayaç Limiti (Adet)
                            </label>
                            <input 
                                type="number" 
                                placeholder="Örn: 1000"
                                disabled={isSubmitting} 
                                value={formData['total_life'] || ''} 
                                onChange={e => setFormData({...formData, 'total_life': e.target.value})} 
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-teal-500 outline-none transition-all font-mono" 
                            />
                            <p className="text-[10px] text-gray-500 mt-1">* Bu değerden geriye doğru sayım yapılacaktır.</p>
                        </div>
                        {/* ---------------------------------------- */}

                        {/* Diğer Dinamik Header Inputları */}
                        {/* total_life ve current_life'ı buradan filtreliyoruz ki iki kere çıkmasın */}
                        {headers
                            .filter(h => h !== 'resim' && h !== 'total_life' && h !== 'current_life')
                            .map(h => (
                            <div key={h}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{h}</label>
                                <input 
                                    type="text" 
                                    disabled={isSubmitting} 
                                    value={formData[h] || ''} 
                                    onChange={e => setFormData({...formData, [h]: e.target.value})} 
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-teal-500 outline-none transition-all" 
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-800">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-lg font-bold">İptal</button>
                        <button type="submit" disabled={isSubmitting} className={`flex-[2] py-3 rounded-lg font-bold flex justify-center items-center gap-3 transition-all ${isSubmitting ? 'bg-gray-700 text-gray-500' : 'bg-teal-600 hover:bg-teal-500 text-white'}`}>
                            {isSubmitting ? <RefreshCwIcon className="animate-spin w-5 h-5" /> : null}
                            {isSubmitting ? 'İşleniyor...' : (initialData ? 'Kaydet' : 'Ekle')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDataModal;