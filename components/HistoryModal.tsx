import React from "react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixtureName: string;
  historyData: Array<{
    islem: string;
    operator: string;
    tarih: string;
    aciklama?: string;
  }>;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  fixtureName,
  historyData,
}) => {
  if (!isOpen) return null;

  // Tarihe göre yeniden eskiye sıralama
  const sortedHistory = [...historyData].reverse();

  const getActionStyle = (action: string) => {
    const act = action ? action.toUpperCase().trim() : "";

    if (
      act.includes("KAYIP") ||
      act.includes("İPTAL") ||
      act.includes("HURDA")
    ) {
      return {
        dotColor: "bg-red-500",
        cardBorder: "border-red-500/20",
        badgeBg: "bg-red-500/20 text-red-400 border border-red-500/30",
        icon: (
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ),
        userIconBg: "bg-gray-700 text-gray-300",
      };
    } else if (
      act.includes("BAKIM") ||
      act.includes("TAMİR") ||
      act.includes("DÜZELTİLDİ")
    ) {
      return {
        dotColor: "bg-amber-500",
        cardBorder: "border-amber-500/20",
        badgeBg: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
        icon: (
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        ),
        userIconBg: "bg-gray-700 text-gray-300",
      };
    } else if (act.includes("VERİLDİ")) {
      return {
        dotColor: "bg-emerald-500",
        cardBorder: "border-emerald-500/20",
        badgeBg:
          "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
        icon: (
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        ),
        userIconBg: "bg-gray-700 text-gray-300",
      };
    } else {
      return {
        dotColor: "bg-blue-500",
        cardBorder: "border-blue-500/20",
        badgeBg: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        icon: (
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            />
          </svg>
        ),
        userIconBg: "bg-gray-700 text-gray-300",
      };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Özel Scrollbar CSS'i (Sadece bu modal için) */}
      <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #111827; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
            `}</style>

      {/* Modal Container: 
                - max-h-[80vh]: Ekranın %80'inden fazla yer kaplamasın.
                - flex flex-col: İçeriği dikey dizer (Header - Body - Footer).
            */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] overflow-hidden">
        {/* 1. HEADER (Sabit - Kaymaz) */}
        <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-gray-900 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-gray-800 p-2 rounded-lg border border-gray-700">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Hareket Geçmişi
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">Parça:</span>
                <span className="text-xs font-bold text-teal-400 bg-teal-900/30 px-2 py-0.5 rounded border border-teal-500/20 uppercase tracking-wide truncate max-w-[250px]">
                  {fixtureName}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 2. BODY (Scrollable - Sadece burası kayar) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#0f1115]">
          {sortedHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-600">
              <p className="text-sm">Henüz kayıtlı hareket yok.</p>
            </div>
          ) : (
            <div className="relative pl-3">
              {/* Timeline Dikey Çizgi (Boyu içeriğe göre uzar) */}
              <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-gray-800"></div>

              {sortedHistory.map((log, index) => {
                const style = getActionStyle(log.islem);

                return (
                  <div key={index} className="relative pl-10 mb-6 last:mb-0">
                    {/* Nokta */}
                    <div
                      className={`absolute left-[10px] top-0 w-3 h-3 rounded-full ${style.dotColor} ring-4 ring-[#0f1115] z-10 shadow-lg`}
                    ></div>

                    {/* Kart */}
                    <div
                      className={`p-4 rounded-xl bg-gray-800/40 border ${style.cardBorder} hover:bg-gray-800/60 transition-colors`}
                    >
                      {/* Üst Kısım: Badge ve Tarih */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${style.badgeBg}`}
                          >
                            {style.icon}
                            {log.islem}
                          </span>
                          {/* Sadece en üstteki kayıt için "YENİ" etiketi */}
                          {index === 0 && (
                            <span className="text-[9px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded border border-gray-600">
                              YENİ
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
                            TARİH
                          </div>
                          <div className="text-xs font-mono font-medium text-gray-300">
                            {log.tarih}
                          </div>
                        </div>
                      </div>

                      {/* Alt Kısım: Kullanıcı ve Açıklama */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border border-gray-600 ${style.userIconBg}`}
                        >
                          {log.operator
                            ? log.operator.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">
                            {log.operator}
                          </div>
                          {log.aciklama && (
                            <div className="mt-1.5 flex items-start gap-1.5 p-2 rounded-lg bg-gray-900/50 border border-gray-700/50">
                              <svg
                                className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                />
                              </svg>
                              <p className="text-xs text-gray-400 italic break-words leading-relaxed">
                                "{log.aciklama}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. FOOTER (Sabit - Kaymaz) */}
        <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded-lg transition-colors border border-gray-600 shadow-lg"
          >
            Pencereyi Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
