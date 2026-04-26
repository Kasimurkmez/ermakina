import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import ExcelJS from "exceljs";
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from "./components/firebase";
import { doc, writeBatch } from "firebase/firestore";
import { Scanner } from "@yudiel/react-qr-scanner";
import toast, { Toaster } from "react-hot-toast";
import logoResmi from "./assets/ermlogo.png";

import { useFixtureData, FixtureData } from "./hooks/useFixtureData";

import SearchBar from "./components/SearchBar";
import DataTable from "./components/DataTable";
import Pagination from "./components/Pagination";
import AddDataModal from "./components/AddDataModal";
import OperatorSelectionModal from "./components/OperatorSelectionModal";
import LabelPrintingModal from "./components/LabelPrintingModal";
import Login from "./components/Login";
import ImageModal from "./components/ImageModal";
import HistoryModal from "./components/HistoryModal";
import AuditModal from "./components/AuditModal";
import DashboardStats, {
  DashboardFilterType,
} from "./components/DashboardStats";

const appEnv = import.meta.env.VITE_APP_ENV || "prod";

const CameraIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

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

const EnvBadge = () => {
  const isTest = appEnv === "test";

  return (
    <div
      className={`fixed top-3 right-3 z-[9999] px-4 py-2 rounded-lg font-black text-xs shadow-lg border ${
        isTest
          ? "bg-yellow-500 text-black border-yellow-300"
          : "bg-green-600 text-white border-green-400"
      }`}
    >
      {isTest ? "TEST ORTAMI" : "CANLI ORTAM"}
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "guest" | null>(null);
  const [dashboardFilter, setDashboardFilter] =
    useState<DashboardFilterType>("ALL");

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [selectedLabelSerial, setSelectedLabelSerial] = useState<string | null>(
    null
  );
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedRowForHistory, setSelectedRowForHistory] =
    useState<FixtureData | null>(null);
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [selectedRowForOperator, setSelectedRowForOperator] =
    useState<FixtureData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data,
    rawData,
    isOperationLoading,
    searchQuery,
    setSearchQuery,
    sortConfig,
    setSortConfig,
    saveData,
    deleteData,
  } = useFixtureData(user, userRole);

  const isGuest = userRole !== "admin";

  const cleanText = useCallback(
    (v: any) =>
      String(v || "")
        .toLocaleUpperCase("tr-TR")
        .trim(),
    []
  );

  const buildFullAddress = useCallback(
    (item: any) => {
      if (item?.adres && String(item.adres).trim() !== "") {
        return cleanText(item.adres);
      }

      return [item?.raf, item?.palet, item?.kutu]
        .filter(Boolean)
        .map(cleanText)
        .join(" / ");
    },
    [cleanText]
  );

  const normalizedData = useMemo(
    () =>
      (data || []).map((item: any) => ({
        ...item,
        adres: buildFullAddress(item) || item.adres,
      })),
    [data, buildFullAddress]
  );

  const normalizedRawData = useMemo(
    () =>
      (rawData || []).map((item: any) => ({
        ...item,
        adres: buildFullAddress(item) || item.adres,
      })),
    [rawData, buildFullAddress]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Excel'deki tüm sayfalar taranıyor...");

    try {
      const workbook = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();

      await workbook.xlsx.load(buffer);

      const batch = writeBatch(db);
      let count = 0;

      const getCellValue = (cell: any): string => {
        const value = cell?.value;

        if (!value) return "";
        if (typeof value === "string" || typeof value === "number")
          return String(value).trim();
        if (value.text) return String(value.text).trim();
        if (value.richText)
          return value.richText
            .map((t: any) => t.text)
            .join("")
            .trim();
        if (value.result) return String(value.result).trim();

        return "";
      };

      workbook.eachSheet((worksheet) => {
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber < 6) return;

          const seriNo = getCellValue(row.getCell(1));

          if (seriNo && !seriNo.toUpperCase().includes("LİSTESİ")) {
            const docId = seriNo.replace(/\s+/g, "-").toUpperCase();
            const docRef = doc(db, "fixtures", docId);

            batch.set(
              docRef,
              {
                "seri no": seriNo.toUpperCase(),
                "parça no": getCellValue(row.getCell(2)),
                "parça adı": getCellValue(row.getCell(3)),
                müşteri: getCellValue(row.getCell(4)),
                proje: getCellValue(row.getCell(6)),
                "operasyon adı": getCellValue(row.getCell(7)),
                "fikstür tanımı": getCellValue(row.getCell(8)),
                adres: getCellValue(row.getCell(9)),
                durum: "KULLANILABİLİR",
                operatör: "BOŞTA",
                tarih: new Date().toLocaleString("tr-TR"),
                resim: "",
                gecmis: [],
              },
              { merge: true }
            );

            count++;
          }
        });
      });

      if (count > 0) {
        await batch.commit();

        toast.success(`${count} adet kayıt başarıyla yüklendi!`, {
          id: toastId,
        });

        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast.error(
          "Excel'de uygun veri bulunamadı! A sütununu kontrol edin.",
          {
            id: toastId,
          }
        );
      }
    } catch (error: any) {
      console.error(error);

      toast.error("Excel okunamadı! Dosya formatı desteklenmiyor olabilir.", {
        id: toastId,
      });
    }
  };

  const handleBulkUpdate = async (
    items: FixtureData[],
    location: { raf: string; palet: string; kutu: string }
  ) => {
    if (!items || items.length === 0) {
      toast.error("Seçili parça yok.");
      return;
    }

    const toastId = toast.loading("Adresler güncelleniyor...");

    try {
      const batch = writeBatch(db);

      const raf = cleanText(location.raf);
      const palet = cleanText(location.palet);
      const kutu = cleanText(location.kutu || "KUTU 1");

      const adres = [raf, palet, kutu]
        .filter((x) => x && x !== "-")
        .join(" / ");

      items.forEach((item) => {
        const itemId = String(item.id || item["seri no"]);
        const docRef = doc(db, "fixtures", itemId);

        batch.set(
          docRef,
          {
            raf,
            konum: "",
            palet,
            kutu,
            adres,
            durum: "KULLANILABİLİR",
            operatör: "BOŞTA",
            tarih: new Date().toLocaleString("tr-TR"),
          },
          { merge: true }
        );
      });

      await batch.commit();

      toast.success(`${items.length} parça yeni adrese aktarıldı.`, {
        id: toastId,
      });

      setTimeout(() => window.location.reload(), 800);
    } catch (e: any) {
      console.error("Toplu adres güncelleme hatası:", e);
      toast.error("Adres güncellenemedi: " + e.message, { id: toastId });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setUserRole(sessionStorage.getItem("userRole") as any);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);
  const sortedData = useMemo(() => {
    if (!normalizedData) return [];

    return [...normalizedData].sort((a: any, b: any) => {
      const getNumber = (val: string) =>
        Number(String(val || "").replace(/[^\d]/g, ""));

      const numA = getNumber(a["seri no"]);
      const numB = getNumber(b["seri no"]);

      return numA - numB;
    });
  }, [normalizedData]);
  const paginatedData = useMemo(
    () =>
      normalizedData.slice(
        (currentPage - 1) * itemsPerPage,
        (currentPage - 1) * itemsPerPage + itemsPerPage
      ),
    [normalizedData, currentPage, itemsPerPage]
  );

  if (authLoading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center text-teal-500 font-bold italic">
        ER MAKİNA YÜKLENİYOR...
      </div>
    );
  }

  if (!userRole) return <Login onLoginSuccess={setUserRole} />;

  return (
    <div className="h-screen w-screen overflow-hidden font-sans relative text-gray-200 flex flex-col bg-gray-900">
      <EnvBadge />
      <Toaster position="top-right" />

      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-sm bg-gray-800 rounded-3xl overflow-hidden border-2 border-teal-500 shadow-[0_0_50px_rgba(20,184,166,0.3)]">
            <div className="p-5 flex justify-between items-center bg-gray-700/50">
              <span className="font-black tracking-widest text-teal-400">
                QR OKUYUCU
              </span>

              <button
                onClick={() => setIsScannerOpen(false)}
                className="bg-red-500/20 text-red-500 px-3 py-1 rounded-lg text-xs font-bold"
              >
                KAPAT
              </button>
            </div>

            <div className="aspect-square relative">
              <Scanner
                onScan={(res) => {
                  if (res) {
                    const val = Array.isArray(res) ? res[0].rawValue : res;
                    setSearchQuery(val);
                    setIsScannerOpen(false);
                    toast.success("Kod Okundu: " + val);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {isOperationLoading && (
        <div className="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center">
          <div className="text-teal-400 font-bold">İşlem yapılıyor...</div>
        </div>
      )}

      <header className="relative z-20 flex justify-between items-center border-b border-gray-800 p-4 bg-gray-900">
        <div className="flex items-center px-4 py-2 rounded-xl bg-white">
          <img src={logoResmi} alt="Logo" className="h-8 w-auto" />
        </div>

        <div className="flex items-center gap-4 pr-28">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
            {userRole} PANELİ
          </span>

          <button
            onClick={() => {
              signOut(auth);
              sessionStorage.clear();
              window.location.reload();
            }}
            className="text-xs font-bold text-red-500 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 uppercase"
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

        <div className="flex flex-col xl:flex-row gap-4 bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
          <div className="flex-1 flex gap-2">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />

            <button
              onClick={() => setIsScannerOpen(true)}
              className="bg-teal-600 p-3 rounded-xl hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/20"
            >
              <CameraIcon />
            </button>
          </div>

          <div className="flex gap-2">
            {!isGuest && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx"
                  onChange={handleFileUpload}
                />

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-teal-600 px-5 rounded-xl text-xs font-black uppercase"
                >
                  EKLE
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-600 px-5 rounded-xl text-xs font-black uppercase"
                >
                  EXCEL YÜKLE
                </button>
              </>
            )}

            <button
              onClick={() => setIsLabelModalOpen(true)}
              className="bg-purple-700 px-5 rounded-xl text-xs font-black uppercase"
            >
              ETİKET
            </button>

            {!isGuest && (
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="bg-gradient-to-br from-orange-500 to-red-600 px-6 rounded-xl text-xs font-black uppercase shadow-lg"
              >
                SAYIM
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur-md">
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
            onEdit={(row) => {
              setEditingRow(row);
              setIsAddModalOpen(true);
            }}
            onDelete={(id) => deleteData(id)}
            onViewImage={setSelectedImageUrl}
            onViewHistory={(row) => {
              setSelectedRowForHistory(row);
              setIsHistoryModalOpen(true);
            }}
            onAssignOperatorClick={(row) => {
              setSelectedRowForOperator(row);
              setIsOperatorModalOpen(true);
            }}
            onCancel={() => {}}
            onRepair={() => {}}
            onGenerateDeliveryForm={() => {}}
            onPrintLabel={(row) => {
              setSelectedLabelSerial(row["seri no"]);
              setIsLabelModalOpen(true);
            }}
            readOnly={isGuest}
            primaryKey="seri no"
            displayKey="seri no"
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(normalizedData.length / itemsPerPage)}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={normalizedData.length}
        />
      </main>

      <AddDataModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={async (row: any, img?: File | null) => {
          await saveData(row, img);
          setIsAddModalOpen(false);
        }}
        initialData={editingRow}
        operators={[]}
        headers={HEADERS}
      />

      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        data={normalizedRawData}
        onMarkAsLost={async () => {}}
        onBulkUpdate={handleBulkUpdate}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        fixtureName={selectedRowForHistory?.["parça adı"]}
        historyData={selectedRowForHistory?.["gecmis"] || []}
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

      <OperatorSelectionModal
        isOpen={isOperatorModalOpen}
        onClose={() => setIsOperatorModalOpen(false)}
        onSelect={() => {}}
        operators={[]}
        currentOperator={selectedRowForOperator?.["operatör"]}
        fixtureName={selectedRowForOperator?.["parça adı"]}
      />
    </div>
  );
};

export default App;