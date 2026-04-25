import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

import { db, storage } from '../components/firebase';

const COLLECTION_NAME = 'fixtures';

export interface FixtureData {
  [key: string]: any;
}

/* ===============================
   METİN / ADRES YARDIMCILARI
=================================*/

const cleanText = (value: unknown): string => {
  return String(value || '')
    .toLocaleUpperCase('tr-TR')
    .replace(/\s+/g, ' ')
    .trim();
};

const splitParts = (value: unknown): string[] => {
  return String(value || '')
    .split('/')
    .map((p) => cleanText(p))
    .filter(Boolean);
};


const buildFullAddress = (item: any): string => {
  if (item?.adres && String(item.adres).trim() !== "") {
    return cleanText(item.adres);
  }

  const parts = [
    ...splitParts(item?.raf),
    ...splitParts(item?.palet),
    ...splitParts(item?.kutu),
  ];

  const unique: string[] = [];

  parts.forEach((p) => {
    if (p && !unique.includes(p)) {
      unique.push(p);
    }
  });

  return unique.join(" / ");
};

const normalizeSearchText = (value: unknown): string => {
  return String(value || '')
    .toLocaleUpperCase('tr-TR')
    .replace(/KUTU\s*[-]?\s*0*(\d+)/g, 'KUTU$1')
    .replace(/P\s*[-]?\s*0*(\d+)/g, 'P$1')
    .replace(/K\s*0*(\d+)/g, 'K$1')
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/\//g, '')
    .trim();
};

const buildSearchText = (item: any): string => {
  return [
    item['seri no'],
    item['parça no'],
    item['parça adı'],
    item['müşteri'],
    item['müşteri mülkiyeti'],
    item['proje'],
    item['operasyon adı'],
    item['fikstür tanımı'],
    item['adet'],
    item['raf'],
    item['konum'],
    item['palet'],
    item['kutu'],
    item['adres'] || buildFullAddress(item),
    item['ömür'],
    item['operatör'],
    item['tarih'],
    item['durum'],
  ].join(' ');
};

/* ===============================
   HOOK
=================================*/

export const useFixtureData = (
  user: any,
  userRole: 'admin' | 'guest' | null
) => {
  const [rawData, setRawData] = useState<FixtureData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string[] }>({});

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  /* ===============================
     VERİYİ FIRESTORE'DAN ÇEK
  =================================*/

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('seri no', 'asc'));

      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setRawData(list);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Veriler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user || userRole === 'guest') {
      fetchData();
    }
  }, [user, userRole]);

  /* ===============================
     KAYDET
  =================================*/

  const saveData = async (
    rowData: any,
    imageFile?: File | null,
    removeImage?: boolean
  ) => {
    setIsOperationLoading(true);

    try {
      let imageUrl = rowData.resim || '';

      if (removeImage && rowData.resim) {
        try {
          await deleteObject(ref(storage, rowData.resim));
        } catch {}

        imageUrl = '';
      }

      if (imageFile) {
        const uniqueName = Date.now() + '_' + imageFile.name.replace(/\s+/g, '_');
        const storageRef = ref(storage, 'fixtures/' + uniqueName);
        const snap = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snap.ref);
      }

      const dataToSave = {
        ...rowData,
        resim: imageUrl,
      };

      delete dataToSave.id;

      if (rowData.id) {
        await updateDoc(doc(db, COLLECTION_NAME, rowData.id), dataToSave);
      } else {
        await addDoc(collection(db, COLLECTION_NAME), dataToSave);
      }

      await fetchData();
    } finally {
      setIsOperationLoading(false);
    }
  };

  /* ===============================
     SİL
  =================================*/

  const deleteData = async (id: string) => {
    setIsOperationLoading(true);

    try {
      const item = rawData.find((x) => x.id === id);

      if (item?.resim) {
        try {
          await deleteObject(ref(storage, item.resim));
        } catch {}
      }

      await deleteDoc(doc(db, COLLECTION_NAME, id));

      setRawData((prev) => prev.filter((x) => x.id !== id));
    } finally {
      setIsOperationLoading(false);
    }
  };

  /* ===============================
     FİLTRE + SEARCH + SORT
  =================================*/

  const data = useMemo(() => {
    let filtered = [...rawData];

    /* SEARCH */

    if (searchQuery) {
      const q = normalizeSearchText(searchQuery);

      filtered = filtered.filter((item) => {
        const rowSearchText = normalizeSearchText(buildSearchText(item));

        return rowSearchText.includes(q);
      });
    }

    /* FILTER */

    Object.keys(activeFilters).forEach((key) => {
      const values = activeFilters[key];

      if (!values?.length) return;

      filtered = filtered.filter((item) => {
        let value = item[key];

        if (key === 'adres') {
          value = item.adres || buildFullAddress(item);
        }

        return values.includes(String(value));
      });
    });

    /* SORT */

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';

        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }

        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }

        return 0;
      });
    }

    return filtered;
  }, [rawData, searchQuery, activeFilters, sortConfig]);

  return {
    data,
    rawData,

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
  };
};