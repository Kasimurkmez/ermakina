import React, { useState } from 'react';
import { FixtureData } from '../hooks/useFixtureData';
import toast from 'react-hot-toast';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FixtureData[];
  onMarkAsLost: (items: FixtureData[]) => Promise<void>;
  onBulkUpdate: (
    items: FixtureData[],
    loc: { raf: string; palet: string; kutu: string }
  ) => Promise<void>;
}

const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  data,
  onBulkUpdate,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [searchRack, setSearchRack] = useState("");
  const [targetRaf, setTargetRaf] = useState("");
  const [targetPalet, setTargetPalet] = useState("");
  const [targetKutu, setTargetKutu] = useState("Kutu 1");
  const [expectedItems, setExpectedItems] = useState<FixtureData[]>([]);
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());

  const normalize = (value: unknown): string => {
    return String(value || "")
      .toLocaleUpperCase("tr-TR")
      .replace(/\s+/g, "")
      .replace(/-/g, "")
      .replace(/\//g, "")
      .replace(/KUTU0?(\d+)/g, "KUTU$1")
      .replace(/P0*(\d+)/g, "P$1")
      .replace(/[^A-Z0-9]/g, "");
  };

  const formatForDisplay = (value: unknown): string =>
    String(value || "")
      .toLocaleUpperCase("tr-TR")
      .trim();

  const getItemAddress = (item: FixtureData): string => {
    const adres = formatForDisplay(item.adres);
    const raf = formatForDisplay(item.raf);
    const palet = formatForDisplay(item.palet);
    const kutu = formatForDisplay(item.kutu);

    if (raf || palet || kutu) {
      return [raf, palet, kutu].filter(Boolean).join(" / ");
    }

    if (adres) return adres;

    return "-";
  };

  const buildSearchAddress = (item: FixtureData): string => {
    return normalize(
      [item.raf, item.palet, item.kutu, item.adres].filter(Boolean).join(" ")
    );
  };

  const handleStart = () => {
    const cleanSearch = normalize(searchRack);
    const displaySearch = formatForDisplay(searchRack);

    if (!cleanSearch) {
      return toast.error("Lütfen mevcut adres girin.");
    }

    if (!Array.isArray(data) || data.length === 0) {
      return toast.error("Aranacak veri bulunamadı.");
    }

    const searchParts = formatForDisplay(searchRack)
      .split(/[\/\s\-]+/)
      .map((p) => normalize(p))
      .filter(Boolean);

    const filtered = data.filter((item) => {
      const itemRaf = normalize(item.raf);
      const itemPalet = normalize(item.palet);
      const itemKutu = normalize(item.kutu);
      const itemAdres = normalize(item.adres);
      const fullAddress = buildSearchAddress(item);

      if (searchParts.length >= 2) {
        return searchParts.every((part) => fullAddress.includes(part));
      }

      return (
        itemRaf === cleanSearch ||
        itemPalet === cleanSearch ||
        itemKutu === cleanSearch ||
        itemAdres === cleanSearch ||
        itemAdres.includes(cleanSearch) ||
        fullAddress.includes(cleanSearch)
      );
    });

    if (filtered.length === 0) {
      return toast.error(
        `"${displaySearch}" ile eşleşen bir konum bulunamadı.`
      );
    }

    setExpectedItems(filtered);
    setFoundIds(new Set());
    setStep(2);
  };

  const handleFinish = async () => {
    const selectedItems = expectedItems.filter((i) =>
      foundIds.has(String(i.id))
    );

    if (selectedItems.length === 0) {
      return toast.error("Lütfen taşınacak en az bir parça seçin.");
    }

    if (!targetRaf.trim()) {
      return toast.error("Hedef raf girin.");
    }

    if (!targetPalet.trim()) {
      return toast.error("Hedef palet girin.");
    }

    try {
      await onBulkUpdate(selectedItems, {
        raf: formatForDisplay(targetRaf),
        palet: formatForDisplay(targetPalet || "-"),
        kutu: formatForDisplay(targetKutu || "Kutu 1"),
      });

      handleClose();
      toast.success("Seçilen parçalar yeni adrese aktarıldı.");
    } catch (error) {
      console.error("Adres güncelleme hatası:", error);
      toast.error("İşlem sırasında bir hata oluştu.");
    }
  };

  const handleClose = () => {
    setStep(1);
    setSearchRack('');
    setTargetRaf('');
    setTargetPalet('');
    setTargetKutu('Kutu 1');
    setExpectedItems([]);
    setFoundIds(new Set());
    onClose();
  };

  const toggleFoundItem = (id: string | number) => {
    const stringId = String(id);

    setFoundIds((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(stringId)) {
        newSet.delete(stringId);
      } else {
        newSet.add(stringId);
      }

      return newSet;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-sans">
      <div className="bg-[#1a222e] border border-teal-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        {step === 1 && (
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-white font-black text-2xl tracking-tight">
                Sayım ve Adresleme
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Mevcut adresi girin ve yeni adresi belirleyin.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-teal-400 text-[10px] font-bold uppercase ml-1">
                  Şu An Taranan Mevcut Adres
                </label>
                <input
                  type="text"
                  placeholder="Örn: A1 veya A1 / P-001 / Kutu 1"
                  value={searchRack}
                  onChange={(e) => setSearchRack(e.target.value)}
                  className="w-full p-4 bg-[#111827] border border-gray-700 rounded-2xl text-white outline-none focus:border-teal-500 transition-all uppercase"
                />
              </div>

              <div className="bg-gray-800/40 p-5 rounded-2xl border border-gray-700/50 space-y-4">
                <p className="text-gray-400 text-[10px] font-bold uppercase text-center border-b border-gray-700 pb-2">
                  Hedef Adres Bilgileri
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Hedef Raf No"
                    value={targetRaf}
                    onChange={(e) => setTargetRaf(e.target.value)}
                    className="p-4 bg-[#0f172a] border border-gray-700 rounded-xl text-white outline-none focus:border-teal-500 transition-all uppercase"
                  />

                  <input
                    type="text"
                    placeholder="Palet No (P-0001)"
                    value={targetPalet}
                    onChange={(e) => setTargetPalet(e.target.value)}
                    className="p-4 bg-[#0f172a] border border-gray-700 rounded-xl text-white outline-none focus:border-teal-500 transition-all uppercase"
                  />
                </div>

                <select
                  value={targetKutu}
                  onChange={(e) => setTargetKutu(e.target.value)}
                  className="w-full p-4 bg-[#0f172a] border border-gray-700 rounded-xl text-white outline-none cursor-pointer focus:border-teal-500"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={`Kutu ${num}`}>
                      {`Kutu ${num}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-teal-600 hover:bg-teal-500 p-4 rounded-2xl text-white font-black shadow-lg transition-all active:scale-95"
            >
              SAYIMA BAŞLA
            </button>

            <button
              onClick={handleClose}
              className="w-full text-gray-500 text-sm font-medium"
            >
              Vazgeç
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 space-y-4">
            <div className="flex justify-between items-end gap-4">
              <h2 className="text-white font-bold text-xl">
                Seçim Yapın ({foundIds.size}/{expectedItems.length})
              </h2>
              <span className="text-teal-500 text-xs font-mono text-right break-all">
                {formatForDisplay(searchRack)}
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {expectedItems.map((item) => {
                const isSelected = foundIds.has(String(item.id));

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleFoundItem(item.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                      isSelected
                        ? "bg-teal-900/30 border-teal-500 ring-1 ring-teal-500"
                        : "bg-gray-800 border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "bg-teal-500 border-teal-500"
                          : "border-gray-500"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <p className="text-white text-sm font-bold truncate">
                        {item["seri no"]}
                      </p>

                      <p className="text-gray-400 text-[11px] truncate">
                        {item["parça adı"]}
                      </p>

                      <p className="text-teal-400 text-[11px] truncate mt-1 font-bold">
                        {getItemAddress(item)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleFinish}
              className="w-full bg-teal-600 hover:bg-teal-500 p-4 rounded-2xl text-white font-black shadow-xl mt-4"
            >
              KAYDET VE BİTİR
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full text-gray-500 text-sm"
            >
              Geri Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditModal;