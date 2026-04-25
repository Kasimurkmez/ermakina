import React, { useMemo } from "react";
import { FixtureData } from "../hooks/useFixtureData";

// --- İKONLAR ---
const ListIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);
const UserCheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
);
const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const XCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);
const RotateCcwIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
);

export type DashboardFilterType = "ALL" | "ACTIVE" | "LOST" | "RETURNED" | "CANCELLED" | "IDLE";

interface DashboardStatsProps {
  data: FixtureData[];
  activeFilter: DashboardFilterType;
  onFilterClick: (type: DashboardFilterType) => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  data,
  activeFilter,
  onFilterClick,
}) => {
  const stats = useMemo(() => {
    let active = 0, lost = 0, returned = 0, cancelled = 0, idle = 0;
    const uniqueSerials = new Set();

    data.forEach((item) => {
      const serial = String(item["seri no"] || "").trim();
      const baseSerial = serial.split("-")[0].trim();
      if (baseSerial) uniqueSerials.add(baseSerial);

      const op = String(item["operatör"] || "").toUpperCase();
      const status = String(item["durum"] || "").toUpperCase();
      const combined = op + status;

      if (op.includes("KAYIP")) {
        lost++;
      } else if (op.includes("İADE")) {
        returned++;
      } else if (op.includes("İPTAL")) {
        cancelled++;
      } else if (op && op !== "BOŞTA" && op !== "-" && !combined.includes("ARIZALI") && !combined.includes("SEVK")) {
        active++;
      } else if (op === "BOŞTA" || op === "" || op === "-") {
        idle++;
      }
    });

    return { totalUnique: uniqueSerials.size, active, lost, returned, cancelled, idle };
  }, [data]);

  // --- GELİŞMİŞ RENK VE HİYERARŞİ YÖNETİMİ ---
  const getCardClass = (type: DashboardFilterType, theme: string, count: number) => {
    const isActive = activeFilter === type;
    const baseClass = "relative overflow-hidden rounded-xl border p-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between";

    // KART SEÇİLİYKEN (Tam vurgu)
    if (isActive) {
      const activeStyles: Record<string, string> = {
        gray: "bg-gradient-to-br from-gray-700 to-gray-800 border-gray-400 shadow-lg ring-1 ring-gray-400",
        teal: "bg-gradient-to-br from-teal-800 to-teal-900 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.5)] ring-1 ring-teal-400",
        orange: "bg-gradient-to-br from-orange-800 to-orange-900 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)] ring-1 ring-orange-400",
        blue: "bg-gradient-to-br from-blue-800 to-blue-900 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] ring-1 ring-blue-400",
        red: "bg-gradient-to-br from-red-800 to-red-900 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] ring-1 ring-red-400",
      };
      return `${baseClass} ${activeStyles[theme]}`;
    } 
    
    // KART SEÇİLİ DEĞİLKEN (Hiyerarşik Vurgu)
    else {
      const inactiveStyles: Record<string, string> = {
        gray: "bg-gray-800/40 border-gray-700/50 hover:border-gray-500/50",
        teal: "bg-teal-900/10 border-teal-700/30 hover:border-teal-500/50 hover:bg-teal-900/20",
        orange: "bg-orange-900/20 border-orange-500/40 hover:border-orange-400/60 hover:bg-orange-900/30",
        blue: "bg-blue-900/10 border-blue-700/30 hover:border-blue-500/50 hover:bg-blue-900/20",
        red: "bg-red-900/20 border-red-500/40 hover:border-red-400/60 hover:bg-red-900/30",
      };

      // Kritik kartlarda (Kayıp/İptal) veri varsa hafif bir parlama (glow) ekle
      let extraGlow = "";
      if (count > 0) {
        if (theme === 'orange') extraGlow = "shadow-[0_0_10px_rgba(249,115,22,0.15)]";
        if (theme === 'red') extraGlow = "shadow-[0_0_10px_rgba(239,68,68,0.15)]";
      }

      return `${baseClass} ${inactiveStyles[theme]} ${extraGlow}`;
    }
  };

  return (
    
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-2">
      {/* 1. TÜM KAYITLAR */}
      <div onClick={() => onFilterClick("ALL")} className={getCardClass("ALL", "gray", stats.totalUnique)}>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-gray-700/50 text-gray-300"><ListIcon className="w-4 h-4" /></div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Benzersiz</h3>
        </div>
        <div className="text-2xl font-black text-white">{stats.totalUnique}<span className="text-[8px] ml-1 text-gray-500">ADET</span></div>
      </div>

      {/* 2. OPERATÖRDE */}
      <div onClick={() => onFilterClick("ACTIVE")} className={getCardClass("ACTIVE", "teal", stats.active)}>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-teal-900/30 text-teal-400"><UserCheckIcon className="w-4 h-4" /></div>
          <h3 className="text-[10px] font-bold text-teal-500/80 uppercase tracking-wider">Operatörde</h3>
        </div>
        <div className="text-2xl font-black text-white">{stats.active}<span className="text-[8px] ml-1 text-gray-500">SET</span></div>
      </div>

      {/* 3. KAYIP */}
      <div onClick={() => onFilterClick("LOST")} className={getCardClass("LOST", "orange", stats.lost)}>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-orange-900/30 text-orange-400"><AlertTriangleIcon className="w-4 h-4" /></div>
          <h3 className="text-[10px] font-bold text-orange-500/80 uppercase tracking-wider">Kayıp</h3>
        </div>
        <div className={`text-2xl font-black ${stats.lost > 0 && activeFilter !== "LOST" ? "text-orange-50" : "text-white"}`}>
          {stats.lost}<span className="text-[8px] ml-1 text-gray-500">ADET</span>
        </div>
      </div>

      {/* 4. İADE */}
      <div onClick={() => onFilterClick("RETURNED")} className={getCardClass("RETURNED", "blue", stats.returned)}>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-blue-900/30 text-blue-400"><RotateCcwIcon className="w-4 h-4" /></div>
          <h3 className="text-[10px] font-bold text-blue-500/80 uppercase tracking-wider">İade</h3>
        </div>
        <div className="text-2xl font-black text-white">{stats.returned}<span className="text-[8px] ml-1 text-gray-500">ADET</span></div>
      </div>

      {/* 5. İPTAL */}
      <div onClick={() => onFilterClick("CANCELLED")} className={getCardClass("CANCELLED", "red", stats.cancelled)}>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-red-900/30 text-red-400"><XCircleIcon className="w-4 h-4" /></div>
          <h3 className="text-[10px] font-bold text-red-500/80 uppercase tracking-wider">İptal</h3>
        </div>
        <div className={`text-2xl font-black ${stats.cancelled > 0 && activeFilter !== "CANCELLED" ? "text-red-50" : "text-white"}`}>
          {stats.cancelled}<span className="text-[8px] ml-1 text-gray-500">ADET</span>
        </div>
      </div>

      {/* 6. BOŞTA */}
      <div onClick={() => onFilterClick("IDLE")} className={getCardClass("IDLE", "gray", stats.idle)}>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-gray-700/50 text-gray-400"><CheckCircleIcon className="w-4 h-4" /></div>
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Boşta</h3>
        </div>
        <div className="text-2xl font-black text-white">{stats.idle}<span className="text-[8px] ml-1 text-gray-500">SET</span></div>
      </div>
    </div>
  );
};

export default DashboardStats;