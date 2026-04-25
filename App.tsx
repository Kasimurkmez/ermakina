import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from "./components/firebase";
import { doc, writeBatch } from 'firebase/firestore';
import toast, { Toaster } from "react-hot-toast";
import logoResmi from "./assets/ermlogo.png";

import { useFixtureData, FixtureData } from "./hooks/useFixtureData";

import SearchBar from "./components/SearchBar";
import DataTable from "./components/DataTable";
import Pagination from "./components/Pagination";
import AddDataModal from "./components/AddDataModal";
import OperatorSelectionModal from "./components/OperatorSelectionModal";
import DeliveryFormModal from "./components/DeliveryFormModal";
import LabelPrintingModal from "./components/LabelPrintingModal";
import Login from "./components/Login";
import AdvancedFilters from "./components/AdvancedFilters";
import ImageModal from "./components/ImageModal";
import HistoryModal from "./components/HistoryModal";
import CancellationModal from "./components/CancellationModal";
import RepairModal from "./components/RepairModal";
import AuditModal from "./components/AuditModal";
import DashboardStats, { DashboardFilterType } from "./components/DashboardStats";

const CameraIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

type Operator = { no: string; name: string };

const HEADERS = [
  "resim",
  "seri no",
  "parça no",
  "parça adı",
  "müşteri",
  "müşteri mülkiyeti",
  "proje",
  "operasyon adı",
  "fikstür tanımı",
  "adet",
  "adres",
  "ömür",
  "operatör",
  "tarih",
  "durum",
];

const FILTER_COLUMNS = [
  { key: "müşteri", label: "Müşteri" },
  { key: "proje", label: "Proje" },
  { key: "parça no", label: "Parça No" },
  { key: "parça adı", label: "Parça Adı" },
  { key: "operasyon adı", label: "Operasyon" },
  { key: "operatör", label: "Operatör" },

  // ÖNEMLİ:
  // Filtre boş sonuç verirse burayı geçici olarak "raf" yap.
  // Asıl kalıcı çözüm için useFixtureData veya AdvancedFilters dosyasını da güncellemek gerekir.
  { key: "adres", label: "Tam Adres" },

  { key: "tarih", label: "İşlem Tarihi" },
];

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

const OPERATORS_LIST: Operator[] = [
  { no: "OPR01", name: "FATİH ERDOĞAN" },
  { no: "OPR02", name: "ALPER ŞAFAK KARAGÖZ" },
  { no: "OPR03", name: "UFUK KARAGÖZ" },
  { no: "OPR04", name: "MAHMUT ÜÇER" },
  { no: "OPR05", name: "ÖMER YETİŞKEN" },
  { no: "OPR06", name: "SEZAİ ÇELEN" },
  { no: "OPR07", name: "FURKAN BİÇİCİ" },
  { no: "OPR08", name: "EMRE ÇETİN" },
  { no: "OPR09", name: "OSMAN KUŞTUR" },
  { no: "OPR10", name: "ALPAY IŞIKLI" },
  { no: "OPR11", name: "ADEM SARIKAYA" },
  { no: "OPR12", name: "ÖMER ÇOBAN" },
  { no: "OPR13", name: "HALİT EKİCİ" },
  { no: "OPR14", name: "ERCAN KARAHÖYÜKLÜ" },
  { no: "OPR15", name: "EMRE ÖZMEN" },
  { no: "OPR16", name: "ONUR KEMİKÇİOĞLU" },
  { no: "OPR18", name: "MEHMET DURAN" },
  { no: "OPR19", name: "İSA ERGEN" },
  { no: "OPR20", name: "DOĞAN ÇELİK" },
  { no: "OPR21", name: "GÖRKEM BİÇİCİ" },
  { no: "OPR22", name: "SÜLEYMAN E.OSMANOĞLU" },
  { no: "OPR23", name: "BURAK KILINÇ" },
  { no: "OPR24", name: "BARIŞ BAKKAL" },
  { no: "OPR25", name: "KÜRŞAT SARITAŞ" },
  { no: "OPR26", name: "ÖMER ÖZKAN" },
  { no: "OPR27", name: "DERVİŞ ÇETİN" },
  { no: "OPR30", name: "HÜSEYİN SÖNMEZ" },
  { no: "OPR31", name: "YUSUF ÖZKAN" },
  { no: "OPR32", name: "SAMET EMİROSMANOĞLU" },
  { no: "DURUM", name: "ARIZALI" },
  { no: "DURUM", name: "boşta" },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "guest" | null>(null);
  const [dashboardFilter, setDashboardFilter] = useState<DashboardFilterType>("ALL");

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const isGuest = userRole !== "admin";

  const {
    data,
    rawData,
    isOperationLoading,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
    sortConfig,
    setSortConfig,
    saveData,
    deleteData,
  } = useFixtureData(user, userRole);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);

  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [selectedRowForOperator, setSelectedRowForOperator] = useState<FixtureData | null>(null);

  const [isDeliveryFormModalOpen, setIsDeliveryFormModalOpen] = useState(false);
  const [selectedRowForDeliveryForm, setSelectedRowForDeliveryForm] = useState<FixtureData | null>(null);

  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [selectedLabelSerial, setSelectedLabelSerial] = useState<string | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedRowForHistory, setSelectedRowForHistory] = useState<FixtureData | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedRowForCancel, setSelectedRowForCancel] = useState<FixtureData | null>(null);

  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [selectedRowForRepair, setSelectedRowForRepair] = useState<FixtureData | null>(null);

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanText = useCallback((value: unknown): string => {
    return String(value || "")
      .toLocaleUpperCase("tr-TR")
      .replace(/\s+/g, " ")
      .replace(/KUTU\s*(\d+)/gi, "KUTU $1")
      .trim();
  }, []);

  const splitAddressParts = useCallback((value: unknown): string[] => {
    return String(value || "")
      .split("/")
      .map((part) => cleanText(part))
      .filter((part) => part && part !== "-");
  }, [cleanText]);

  const buildFullAddress = useCallback((item: any): string => {
    const rawParts = [
      ...splitAddressParts(item?.raf),
      ...splitAddressParts(item?.palet),
      ...splitAddressParts(item?.kutu),
    ];
  
    const uniqueParts: string[] = [];
  
    rawParts.forEach((part) => {
      if (!part) return;
      if (uniqueParts.includes(part)) return;
      uniqueParts.push(part);
    });
  
    if (uniqueParts.length === 0 && item?.adres) {
      return splitAddressParts(item.adres).join(" / ");
    }
  
    return uniqueParts.join(" / ");
  }, [splitAddressParts]);
  const enrichWithAddress = useCallback((items: FixtureData[]) => {
    return (items || []).map((item: any) => ({
      ...item,

      // Eski bozuk adresi kullanmıyoruz.
      // Her zaman raf/konum/palet/kutu alanlarından temiz yeniden üretiyoruz.
      adres: buildFullAddress(item),
    }));
  }, [buildFullAddress]);

  const handleLogout = useCallback(async (autoLogout = false) => {
    sessionStorage.removeItem("userRole");
    setUserRole(null);
    await signOut(auth);

    if (autoLogout) {
      toast("Güvenlik nedeniyle oturumunuz kapatıldı.", { icon: "🔒" });
    } else {
      toast.success("Başarıyla çıkış yapıldı.");
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.has("serial")) {
      sessionStorage.setItem("userRole", "guest");
      setUserRole("guest");
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      const storedRole = sessionStorage.getItem("userRole") as "admin" | "guest" | null;

      if (params.has("serial")) {
        setUserRole("guest");
      } else if (currentUser && storedRole) {
        setUserRole(storedRole);
      } else if (storedRole === "guest") {
        setUserRole("guest");
      } else {
        setUserRole(null);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userRole !== "admin") return;

    let timeoutId: any;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleLogout(true), INACTIVITY_TIMEOUT);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];

    resetTimer();
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [userRole, handleLogout]);

  const normalizedRawData = useMemo(() => {
    return enrichWithAddress(rawData || []);
  }, [rawData, enrichWithAddress]);

  const normalizedData = useMemo(() => {
    return enrichWithAddress(data || []);
  }, [data, enrichWithAddress]);

  const handleOpenAddModal = () => {
    setEditingRow(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (row: any) => {
    setEditingRow(row);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingRow(null);
  };

  const handleOpenOperatorModal = (row: any) => {
    setSelectedRowForOperator(row);
    setIsOperatorModalOpen(true);
  };

  const handleCloseOperatorModal = () => {
    setIsOperatorModalOpen(false);
    setSelectedRowForOperator(null);
  };

  const handleOpenDeliveryForm = (row: any) => {
    setSelectedRowForDeliveryForm(row);
    setIsDeliveryFormModalOpen(true);
  };

  const handleCloseDeliveryForm = () => {
    setIsDeliveryFormModalOpen(false);
    setSelectedRowForDeliveryForm(null);
  };

  const handleOpenLabelModal = (serialNo?: string) => {
    setSelectedLabelSerial(serialNo || null);
    setIsLabelModalOpen(true);
  };

  const handleViewImage = (url: string) => {
    setSelectedImageUrl(url);
  };

  const handleOpenHistoryModal = (row: any) => {
    setSelectedRowForHistory(row);
    setIsHistoryModalOpen(true);
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedRowForHistory(null);
  };

  const handleOpenCancelModal = (row: any) => {
    setSelectedRowForCancel(row);
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedRowForCancel(null);
  };

  const handleOpenRepairModal = (row: any) => {
    setSelectedRowForRepair(row);
    setIsRepairModalOpen(true);
  };

  const handleCloseRepairModal = () => {
    setIsRepairModalOpen(false);
    setSelectedRowForRepair(null);
  };

  const onSaveHandler = async (
    rowData: any,
    imageFile?: File | null,
    removeImage?: boolean
  ) => {
    const toastId = toast.loading("İşlem yapılıyor...");
  
    try {
      const generatedAddress = buildFullAddress(rowData);
  
      const enrichedRow = {
        ...rowData,
  
        // Elle adres yazıldıysa onu korur.
        // Raf/konum/palet/kutu varsa tam adresi üretir.
        adres: generatedAddress || cleanText(rowData?.adres),
      };
  
      await saveData(enrichedRow, imageFile, removeImage);
  
      handleCloseModal();
      toast.success("Başarılı", { id: toastId });
    } catch (e: any) {
      toast.error(`Hata: ${e.message}`, { id: toastId });
    }
  };
  const onDeleteHandler = async (id: string) => {
    if (!window.confirm("Silmek istediğinize emin misiniz?")) return;
  
    const toastId = toast.loading("Siliniyor...");
  
    try {
      await deleteData(id);
      toast.success("Silindi.", { id: toastId });
    } catch (e: any) {
      toast.error(`Hata: ${e.message}`, { id: toastId });
    }
  };

  const onOperatorAssignHandler = async (operatorName: string) => {
    if (!selectedRowForOperator) return;

    const isUnassigning = operatorName === "";
    const toastId = toast.loading(isUnassigning ? "Boşa alınıyor..." : "Atanıyor...");
    const simdi = new Date().toLocaleString("tr-TR");

    try {
      const currentHistory = selectedRowForOperator["gecmis"] || [];

      let newLife = Number(
        selectedRowForOperator["current_life"] ??
        selectedRowForOperator["total_life"] ??
        1000
      );

      if (!isUnassigning) {
        newLife = Math.max(0, newLife - 1);
      }

      const updatedData = {
        ...selectedRowForOperator,
        adres: buildFullAddress(selectedRowForOperator),
        operatör: isUnassigning ? "BOŞTA" : operatorName,
        tarih: isUnassigning ? "" : simdi,
        gecmis: [
          ...currentHistory,
          {
            islem: isUnassigning ? "GERİ ALINDI" : "VERİLDİ",
            operator: operatorName || "BOŞTA",
            tarih: simdi,
          },
        ],
        current_life: newLife,
      };

      await saveData(updatedData);
      handleCloseOperatorModal();
      toast.success("Güncellendi", { id: toastId });
    } catch (e: any) {
      toast.error(e.message, { id: toastId });
    }
  };

  const onCancelConfirmHandler = async (type: string, reason: string) => {
    if (!selectedRowForCancel) return;

    const toastId = toast.loading(`${type} işlemi yapılıyor...`);
    const simdi = new Date().toLocaleString("tr-TR");

    try {
      const updatedData = {
        ...selectedRowForCancel,
        adres: buildFullAddress(selectedRowForCancel),
        operatör: type,
        durum: type,
        tarih: simdi,
        gecmis: [
          ...(selectedRowForCancel["gecmis"] || []),
          {
            islem: type,
            operator: "YÖNETİCİ",
            tarih: simdi,
            aciklama: reason,
          },
        ],
      };

      await saveData(updatedData);
      handleCloseCancelModal();
      toast.success(`Durum güncellendi: ${type}`, { id: toastId });
    } catch (e: any) {
      toast.error(e.message, { id: toastId });
    }
  };

  const onRepairConfirmHandler = async (note: string) => {
    if (!selectedRowForRepair) return;

    const toastId = toast.loading("Veriler onarılıyor...");
    const simdi = new Date().toLocaleString("tr-TR");

    try {
      const totalLife = Number(selectedRowForRepair["total_life"]) || 1000;

      const updatedData = {
        ...selectedRowForRepair,
        adres: buildFullAddress(selectedRowForRepair),
        operatör: "BOŞTA",
        durum: "KULLANILABİLİR",
        tarih: simdi,
        current_life: totalLife,
        total_life: totalLife,
        gecmis: [
          ...(selectedRowForRepair["gecmis"] || []),
          {
            islem: "ONARIM",
            operator: "SİSTEM",
            tarih: simdi,
            aciklama: note,
          },
        ],
      };

      await saveData(updatedData);
      handleCloseRepairModal();
      toast.success("Parça kurtarıldı!", { id: toastId });
    } catch (e: any) {
      toast.error("Hata: " + e.message, { id: toastId });
    }
  };

  const handleBulkUpdate = async (
    items: any[],
    location: {
      raf: string;
      palet: string;
      kutu: string;
    }
  ) => {
    if (!items.length) {
      toast.error("Seçili kayıt yok!");
      return;
    }
  
    const toastId = toast.loading("Adresler güncelleniyor...");
  
    try {
      const batch = writeBatch(db);
  
      const raf = location.raf.trim().toUpperCase();
      const palet = location.palet.trim().toUpperCase();
      const kutu = location.kutu.trim().toUpperCase();
  
      const adres = `${raf} / ${palet} / ${kutu}`;
  
      items.forEach((item) => {
        const docRef = doc(db, "fixtures", String(item.id));
  
        batch.update(docRef, {
          raf,
          palet,
          kutu,
          adres,
          durum: "KULLANILABİLİR",
          operatör: "BOŞTA",
          tarih: new Date().toLocaleString("tr-TR"),
        });
      });
  
      await batch.commit();
  
      toast.success(`${items.length} parça başarıyla güncellendi!`, {
        id: toastId,
      });
    } catch (e: any) {
      toast.error("Hata: " + e.message, {
        id: toastId,
      });
    }
  };

  const handleAuditMarkAsLost = async (missingItems: FixtureData[]) => {
    const simdi = new Date().toLocaleString("tr-TR");

    const promises = missingItems.map((item: any) =>
      saveData({
        ...item,
        adres: buildFullAddress(item),
        operatör: "KAYIP",
        durum: "KAYIP",
        tarih: simdi,
        gecmis: [
          ...(item["gecmis"] || []),
          {
            islem: "KAYIP",
            operator: "SAYIM",
            tarih: simdi,
          },
        ],
      })
    );

    try {
      const toastId = toast.loading("Eksikler kaydediliyor...");
      await Promise.all(promises);
      toast.success("İşlem tamamlandı.", { id: toastId });
    } catch (e) {
      toast.error("Hata!");
    }
  };

  const dashboardFilteredData = useMemo(() => {
    let result = normalizedData;

    if (dashboardFilter === "ACTIVE") {
      result = result.filter(
        (item: any) =>
          item["operatör"] &&
          item["operatör"] !== "BOŞTA" &&
          !["KAYIP", "ARIZALI"].includes(String(item.durum))
      );
    } else if (dashboardFilter === "IDLE") {
      result = result.filter(
        (item: any) =>
          (!item["operatör"] || item["operatör"] === "BOŞTA") &&
          !["KAYIP", "ARIZALI"].includes(String(item.durum))
      );
    }

    return result;
  }, [normalizedData, dashboardFilter]);

  const totalPages = useMemo(() => {
    if (itemsPerPage === -1) return 1;
    return Math.ceil(dashboardFilteredData.length / itemsPerPage);
  }, [dashboardFilteredData, itemsPerPage]);

  const paginatedData = useMemo(() => {
    if (itemsPerPage === -1) return dashboardFilteredData;

    return dashboardFilteredData.slice(
      (currentPage - 1) * itemsPerPage,
      (currentPage - 1) * itemsPerPage + itemsPerPage
    );
  }, [dashboardFilteredData, currentPage, itemsPerPage]);

  const handleExportData = async () => {
    if (normalizedData.length === 0) {
      return toast.error("İndirilecek veri yok.");
    }

    const toastId = toast.loading("Excel dosyası hazırlanıyor...");

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Liste");

      worksheet.addRow(HEADERS.map((h) => h.toLocaleUpperCase("tr-TR")));

      normalizedData.forEach((item: any) => {
        worksheet.addRow(HEADERS.map((h) => item[h] || ""));
      });

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(new Blob([buffer]), "Liste.xlsx");

      toast.success("Excel indirildi.", { id: toastId });
    } catch (err) {
      toast.error("Hata oluştu.", { id: toastId });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters, dashboardFilter, itemsPerPage]);

  if (authLoading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center font-bold text-teal-500">
        YÜKLENİYOR...
      </div>
    );
  }

  if (!userRole) {
    return <Login onLoginSuccess={setUserRole} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden font-sans relative text-gray-200 flex flex-col">
      <Toaster position="top-right" />
      <div className="fixed inset-0 z-0 bg-gray-900/95" />

      {isOperationLoading && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-teal-500"></div>
        </div>
      )}

      <header className="relative z-20 flex justify-between items-center border-b border-gray-700/50 p-4 bg-gray-900 shadow-lg flex-shrink-0">
        <div className="flex items-center px-4 py-2 rounded-xl bg-white">
          <img src={logoResmi} alt="Logo" className="h-8 w-auto" />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-teal-400 uppercase">
            {userRole === "admin" ? "Yönetici" : "Misafir"}
          </span>

          <button
            onClick={() => handleLogout(false)}
            className="text-xs font-bold text-red-500 bg-red-900/20 px-3 py-1 rounded-lg border border-red-500/30"
          >
            ÇIKIŞ
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 p-4 md:p-6 space-y-4 overflow-y-auto custom-scrollbar">
        <DashboardStats
          data={normalizedRawData}
          activeFilter={dashboardFilter}
          onFilterClick={setDashboardFilter}
        />

        <div className="flex flex-col xl:flex-row gap-4 bg-gray-800/90 p-4 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex-1 flex gap-2">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />

            <button
              onClick={() => setIsScannerOpen(true)}
              className="bg-teal-600 p-2 rounded-lg"
            >
              <CameraIcon />
            </button>

            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="bg-gray-700 px-4 rounded-lg text-sm"
            >
              Filtre
            </button>
          </div>

          <div className="flex gap-2">
            {!isGuest && (
              <>
                <input type="file" ref={fileInputRef} className="hidden" />

                <button
                  onClick={handleOpenAddModal}
                  className="bg-teal-600 px-4 py-2 rounded-lg text-sm font-bold"
                >
                  EKLE
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-600 px-4 py-2 rounded-lg text-sm font-bold"
                >
                  EXCEL
                </button>
              </>
            )}

            <button
              onClick={() => setIsLabelModalOpen(true)}
              className="bg-purple-700 px-4 py-2 rounded-lg text-sm font-bold"
            >
              ETİKET
            </button>

            <button
              onClick={handleExportData}
              className="bg-emerald-700 px-4 py-2 rounded-lg text-sm font-bold"
            >
              İNDİR
            </button>

            {!isGuest && (
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-2 rounded-lg text-sm font-black shadow-lg transition-all hover:scale-105"
              >
                SAYIM
              </button>
            )}
          </div>
        </div>

        {isFilterPanelOpen && (
          <AdvancedFilters
            data={normalizedRawData}
            filters={activeFilters}
            onFilterChange={(k, v) =>
              setActiveFilters((prev: any) => ({
                ...prev,
                [k]: v,
              }))
            }
            onClearFilters={() => setActiveFilters({})}
            filterableColumns={FILTER_COLUMNS}
          />
        )}

        <div className="flex-1 overflow-hidden flex flex-col rounded-xl border border-gray-700 bg-gray-900/60 shadow-2xl">
          <DataTable
            headers={HEADERS}
            data={paginatedData}
            searchQuery={searchQuery}
            sortConfig={sortConfig}
            onSort={(key) =>
              setSortConfig((prev: any) =>
                prev?.key === key
                  ? prev.direction === "ascending"
                    ? { key, direction: "descending" }
                    : null
                  : { key, direction: "ascending" }
              )
            }
            onEdit={handleOpenEditModal}
            onDelete={onDeleteHandler}
            onCancel={handleOpenCancelModal}
            onRepair={handleOpenRepairModal}
            onAssignOperatorClick={handleOpenOperatorModal}
            onGenerateDeliveryForm={handleOpenDeliveryForm}
            onPrintLabel={handleOpenLabelModal}
            onViewImage={handleViewImage}
            onViewHistory={handleOpenHistoryModal}
            readOnly={isGuest}
            primaryKey="seri no"
            displayKey="seri no"
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={dashboardFilteredData.length}
        />
      </main>

      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        data={normalizedRawData}
        onMarkAsLost={handleAuditMarkAsLost}
        onBulkUpdate={handleBulkUpdate}
      />

      <RepairModal
        isOpen={isRepairModalOpen}
        onClose={handleCloseRepairModal}
        onConfirm={onRepairConfirmHandler}
        fixtureName={selectedRowForRepair?.["parça adı"]}
      />

      <CancellationModal
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
        onConfirm={onCancelConfirmHandler}
        fixtureName={selectedRowForCancel?.["parça adı"]}
      />

      <AddDataModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSave={onSaveHandler}
        initialData={editingRow}
        operators={OPERATORS_LIST}
        headers={HEADERS}
      />

      <OperatorSelectionModal
        isOpen={isOperatorModalOpen}
        onClose={handleCloseOperatorModal}
        onSelect={onOperatorAssignHandler}
        operators={OPERATORS_LIST}
        currentOperator={selectedRowForOperator?.["operatör"]}
        fixtureName={selectedRowForOperator?.["parça adı"]}
      />

      <DeliveryFormModal
        isOpen={isDeliveryFormModalOpen}
        onClose={handleCloseDeliveryForm}
        rowData={selectedRowForDeliveryForm}
      />

      <LabelPrintingModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        allData={normalizedRawData}
        initialSerialNo={selectedLabelSerial}
      />

      <ImageModal
        imageUrl={selectedImageUrl}
        onClose={() => setSelectedImageUrl(null)}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={handleCloseHistoryModal}
        fixtureName={selectedRowForHistory?.["parça adı"]}
        historyData={selectedRowForHistory?.["gecmis"] || []}
      />
    </div>
  );
};

export default App;