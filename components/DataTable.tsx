import React, { useState, useEffect, useRef } from 'react';
import { EditIcon, TrashIcon, UserIcon, FileTextIcon, TagIcon, EyeIcon, HistoryIcon, BanIcon, WrenchIcon } from './Icons';
import { FixtureData } from '../hooks/useFixtureData';

interface DataTableProps {
  headers: string[];
  data: FixtureData[];
  searchQuery: string;
  sortConfig: { key: string; direction: 'ascending' | 'descending' } | null;
  onSort: (key: string) => void;
  onEdit: (item: FixtureData) => void;
  onDelete: (id: string) => void;
  onCancel: (item: FixtureData) => void;
  onRepair: (item: FixtureData) => void; 
  onAssignOperatorClick: (item: FixtureData) => void;
  onGenerateDeliveryForm: (item: FixtureData) => void;
  onPrintLabel: (serialNo: string) => void;
  onViewImage: (url: string) => void;
  onViewHistory: (item: FixtureData) => void;
  readOnly?: boolean;
  primaryKey: string;
  displayKey: string;
}

const calculateTimeAgo = (dateString: string) => {
  if (!dateString) return '';
  try {
    const parts = dateString.split(' ');
    if (parts.length !== 2) return dateString;
    const [datePart, timePart] = parts;
    const [day, month, year] = datePart.split(".");
    const [hour, minute] = timePart.split(":");
    const fixtureDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
    const now = new Date();
    const diffMs = now.getTime() - fixtureDate.getTime();
    const diffMins = Math.floor(diffMs / 60000); 
    if (isNaN(diffMins)) return "";
    if (diffMins < 60) return `${diffMins} dk`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} gün`;
  } catch (e) { return ''; }
};

const getTimeStatusClass = (dateString: string) => {
  if (!dateString) return 'hidden';
  try {
    const parts = dateString.split(' ');
    if (parts.length !== 2) return 'hidden';
    const [datePart, timePart] = parts;
    const [day, month, year] = datePart.split(".");
    const [hour, minute] = timePart.split(":");
    const fixtureDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
    const now = new Date();
    const diffDays = (now.getTime() - fixtureDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays < 3) return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
    if (diffDays < 7) return 'text-amber-500 bg-amber-900/20 border-amber-500/30';
    return 'text-red-400 bg-red-900/20 border-red-500/50 animate-pulse';
  } catch (e) { return 'hidden'; }
};

const DataTable: React.FC<DataTableProps> = ({
  headers, data, sortConfig, onSort, onEdit, onDelete, onCancel, onRepair,
  onAssignOperatorClick, onGenerateDeliveryForm, onPrintLabel, onViewImage, onViewHistory,
  readOnly = false, primaryKey, displayKey
}) => {

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isRowProblematic = (item: FixtureData) => {
    const combinedText = (String(item["operatör"] || "") + " " + String(item["durum"] || "")).toLocaleUpperCase("tr-TR");
    const problemKeywords = ["KAYIP", "ARIZALI", "SEVK", "İADE", "İPTAL", "HURDA", "TAMİR", "BAKIM"];
    return problemKeywords.some((keyword) => combinedText.includes(keyword));
  };

  const getRowColor = (item: FixtureData) => {
    const op = String(item["operatör"] || "").trim().toLocaleUpperCase("tr-TR");
    const status = String(item["durum"] || "").trim().toLocaleUpperCase("tr-TR");
    const combinedText = op + " " + status;

    if (combinedText.includes("İADE")) return "bg-emerald-900/50 border-y border-emerald-500/30 border-l-4 border-l-emerald-500 text-emerald-100 hover:bg-emerald-900/70";
    if (combinedText.includes("İPTAL")) return "bg-yellow-900/50 border-y border-yellow-600/30 border-l-4 border-l-yellow-400 text-yellow-100 hover:bg-yellow-900/70";
    
    if (isRowProblematic(item)) return "bg-red-900/80 border-y border-red-500/50 border-l-4 border-l-red-500 text-white font-medium hover:bg-red-800/90";
    
    const isActuallyAssigned = op !== "" && op !== "BOŞTA" && op !== "-" && op !== "RAFTA";
    if (isActuallyAssigned) return "bg-blue-900/30 border-y border-blue-500/20 border-l-4 border-l-blue-500 text-blue-100 hover:bg-blue-900/50";

    return "hover:bg-gray-700/50 text-gray-300 border-l-4 border-l-transparent";
  };

  const handleOpenTechnicalPdf = (seriNo: any) => {
    if (!seriNo) return;
    const pdfUrl = `http://192.168.2.21:8081/${seriNo}.pdf`;
    window.open(pdfUrl, '_blank');
  };

  const getResponsiveColumnClass = (header: string) => {
    const mobileVisible = ["resim", "seri no", "parça adı", "operatör"];
    const tabletVisible = ["raf", "durum", "ömür", "adet"];
    if (mobileVisible.includes(header)) return "table-cell";
    if (tabletVisible.includes(header)) return "hidden md:table-cell";
    return "hidden xl:table-cell"; // Büyük ekranlarda tamamı görünür
  };

  return (
    <div className="w-full overflow-x-auto overflow-y-visible rounded-lg shadow-lg border border-gray-700/50 pb-24">
      {/* YENİ: table-fixed eklendi, böylece bilgisayarda alttaki kaydırma çubuğu kalkar, her şey ekrana tam sığar */}
      <table className="w-full table-fixed text-left border-collapse">
        <thead>
          <tr className="bg-gray-800/80 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider border-b border-gray-700">
            {headers.map((header) => {
              // YENİ: Bilgisayar (md) ve Telefon için sütun genişlikleri milimetrik ayarlandı
              let widthClass = "w-auto";
              if (header === "resim") widthClass = "w-12 md:w-16";
              if (header === "seri no") widthClass = "w-24 md:w-32";
              if (header === "operatör") widthClass = "w-16 md:w-28";
              if (header === "id" || header === "sıra" || header === "adet") widthClass = "w-12 md:w-16";
              if (header === "tarih") widthClass = "w-24 md:w-32";
              if (header === "durum") widthClass = "w-20 md:w-24 text-center";
              if (header === "ömür") widthClass = "w-24 md:w-36";
              
              return (
                <th 
                  key={header} 
                  className={`p-1.5 md:p-3 font-semibold cursor-pointer hover:text-teal-400 transition-colors select-none ${widthClass} ${getResponsiveColumnClass(header)} ${header === "resim" ? "text-center" : ""}`} 
                  onClick={() => onSort(header)}
                >
                  <div className={`flex items-center gap-1 overflow-hidden ${header === "durum" ? "justify-center" : ""}`}>
                    <span className="truncate">{header.toLocaleUpperCase("tr-TR")}</span>
                    {sortConfig?.key === header && <span className="text-teal-500 flex-shrink-0">{sortConfig.direction === "ascending" ? "▲" : "▼"}</span>}
                  </div>
                </th>
              );
            })}
            <th className="p-1.5 md:p-3 text-right w-20 md:w-36 sticky right-0 z-20 bg-gray-800/90 backdrop-blur-md">İŞLEM</th>
          </tr>
        </thead>
        <tbody className="text-[11px] md:text-sm divide-y divide-gray-700/50">
          {data.length > 0 ? (
            data.map((item, index) => {
              const isRedRow = isRowProblematic(item); 
              const showRepair = isRedRow;
              const isDropdownOpen = openDropdownId === item.id;
              const rowId = String(item[primaryKey]);
              
              return (
                <tr key={`${item.id || index}-${rowId}`} className={`transition-all duration-150 ${isDropdownOpen ? 'relative z-20' : ''} ${getRowColor(item)}`}>
                  
                  {headers.map((header) => (
                    <td 
                      key={`${rowId}-${header}`} 
                      className={`p-1.5 md:p-3 align-middle h-14 md:h-16 relative cursor-default ${getResponsiveColumnClass(header)}`} 
                    >
                      {header === "resim" ? (
                        <div className="flex justify-center items-center w-full h-full">
                          {item[header] ? (
                            <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-lg overflow-hidden border border-gray-600 cursor-pointer hover:scale-150 transition-transform relative group z-10 hover:z-50" onClick={(e) => { e.stopPropagation(); onViewImage(item[header]); }}>
                              <img src={item[header]} alt="Fikstür" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><EyeIcon className="w-3 h-3 md:w-4 md:h-4 text-white" /></div>
                            </div>
                          ) : (
                            <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-lg bg-gray-800/50 border border-gray-700/50 flex items-center justify-center opacity-60" title="Görsel Bulunamadı">
                              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ) : header === "operatör" && (!item[header] || String(item[header]).toLocaleUpperCase("tr-TR") === "BOŞTA") ? (
                        <span className="inline-block px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[9px] md:text-[10px] border border-gray-600 text-gray-500 bg-gray-800/50 whitespace-nowrap">BOŞTA</span>
                      ) : header === "tarih" ? (
                        <div className="w-full truncate font-medium tracking-tight" title={item[header] ? String(item[header]) : ""}>
                          {!item["operatör"] || String(item["operatör"]).toLocaleUpperCase("tr-TR") === "BOŞTA" ? <span className="text-gray-500">-</span> : (
                            <div className="flex items-center gap-1 md:gap-2 cursor-help" title={`Boşa düşme zamanı: ${item[header]}`}>
                              <span className={`font-bold text-[9px] md:text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap flex items-center gap-1 ${getTimeStatusClass(String(item[header]))}`}>⏳ {calculateTimeAgo(String(item[header]))}</span>
                            </div>
                          )}
                        </div>
                      ) : header === "durum" ? (
                        <div className="flex justify-center w-full">
                          <button onClick={(e) => { e.stopPropagation(); onViewHistory(item); }} className={`group flex items-center gap-1 px-1.5 md:px-2 py-1 md:py-1.5 rounded border transition-all font-medium shadow-sm ${isRedRow ? 'bg-red-800/50 border-red-500/50 text-white hover:bg-red-700' : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-teal-500 hover:text-teal-400 hover:bg-gray-700'}`} title="Geçmiş Hareketleri Gör">
                            <HistoryIcon className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden md:inline">Kayıtlar</span>
                          </button>
                        </div>
                      ) : header === "ömür" ? (
                        (() => {
                            const total = Number(item['total_life']) || 0;
                            const current = item['current_life'] !== undefined ? Number(item['current_life']) : total;
                            if (!total || total === 0) return <span className="opacity-50">-</span>;
                            const percent = Math.max(0, Math.min(100, (current / total) * 100));
                            let colorClass = 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]';
                            let textClass = isRedRow ? 'text-white' : 'text-teal-400';
                            if (percent < 20) {
                                colorClass = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse';
                                textClass = isRedRow ? 'text-white font-bold' : 'text-red-400 font-bold';
                            } else if (percent < 50) {
                                colorClass = 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
                                textClass = isRedRow ? 'text-white' : 'text-amber-400';
                            }
                            return (
                                <div className="w-full flex flex-col justify-center h-full px-1" title={`Kalan: ${current} / Toplam: ${total}`}>
                                    <div className="flex justify-between items-center mb-0.5 md:mb-1">
                                        <span className={`font-mono ${textClass}`}>{current}</span>
                                        <span className={`text-[8px] md:text-[9px] ${isRedRow ? 'text-red-200' : 'text-gray-600'}`}>/{total}</span>
                                    </div>
                                    <div className={`w-full h-1 md:h-1.5 rounded-full overflow-hidden border ${isRedRow ? 'bg-red-950 border-red-800' : 'bg-gray-800 border-gray-700'}`}>
                                        <div style={{ width: `${percent}%` }} className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`} />
                                    </div>
                                </div>
                            );
                        })()
                      ) : (
                        // YENİ SİHİR: Bilgisayarda tek satır yapıp 3 nokta koyar (truncate), Telefonda normal bırakıp 2 satıra böler (line-clamp)
                        <div className="w-full md:truncate whitespace-normal md:whitespace-nowrap" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={item[header] ? String(item[header]) : ""}>
                            {item[header]}
                        </div>
                      )}
                    </td>
                  ))}

                  <td 
                    className={`p-1 md:p-3 text-right relative sticky right-0 bg-gray-900/40 backdrop-blur-md ${isDropdownOpen ? 'z-50' : 'z-10'}`} 
                    ref={isDropdownOpen ? dropdownRef : null}
                  >
                    <div className="flex items-center justify-end gap-1 md:gap-2 pr-1">
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenTechnicalPdf(item[displayKey]); }} 
                        className={`p-1.5 md:p-2 rounded md:rounded-lg transition-colors flex-shrink-0 border ${isRedRow ? 'text-white border-white/30 hover:bg-white/20' : 'text-purple-400 border-purple-500/20 hover:bg-purple-900/30'}`} 
                        title="Teknik Resim"
                      >
                        <FileTextIcon className="w-3 h-3 md:w-4 md:h-4" />
                      </button>

                      {!readOnly ? (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
                            className={`p-1.5 md:p-2 rounded md:rounded-lg transition-colors flex-shrink-0 ${isRedRow ? 'text-white hover:bg-white/20' : 'text-blue-400 hover:bg-blue-900/30'}`} 
                            title="Düzenle"
                          >
                            <EditIcon className="w-3 h-3 md:w-4 md:h-4" />
                          </button>

                          <div className="relative inline-block text-left">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(isDropdownOpen ? null : (item.id as string));
                              }} 
                              className={`p-1.5 md:p-2 rounded md:rounded-lg transition-colors ${isDropdownOpen ? (isRedRow ? 'bg-white/30 text-white' : 'bg-gray-600 text-white') : (isRedRow ? 'text-white/90 hover:text-white hover:bg-white/20' : 'text-gray-400 hover:text-white hover:bg-gray-700')}`}
                              title="Menü"
                            >
                              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                            </button>

                            {isDropdownOpen && (
                              <div className="absolute right-0 mt-2 w-40 md:w-48 bg-gray-800 border border-gray-600 rounded-md shadow-2xl z-50 py-1 overflow-hidden" onClick={e => e.stopPropagation()}>
                                
                                <button onClick={() => { onAssignOperatorClick(item); setOpenDropdownId(null); }} className="w-full text-left px-3 py-2 text-xs md:text-sm text-emerald-400 hover:bg-gray-700 flex items-center gap-2">
                                  <UserIcon className="w-3 h-3 md:w-4 md:h-4" /> Operatör Ata
                                </button>
                                
                                <button onClick={() => { onGenerateDeliveryForm(item); setOpenDropdownId(null); }} className="w-full text-left px-3 py-2 text-xs md:text-sm text-indigo-400 hover:bg-gray-700 flex items-center gap-2">
                                  <FileTextIcon className="w-3 h-3 md:w-4 md:h-4" /> Teslimat
                                </button>

                                <button onClick={() => { onPrintLabel(item[displayKey]); setOpenDropdownId(null); }} className="w-full text-left px-3 py-2 text-xs md:text-sm text-purple-400 hover:bg-gray-700 flex items-center gap-2">
                                  <TagIcon className="w-3 h-3 md:w-4 md:h-4" /> Etiket
                                </button>

                                {showRepair ? (
                                  <button onClick={() => { onRepair(item); setOpenDropdownId(null); }} className="w-full text-left px-3 py-2 text-xs md:text-sm text-amber-400 hover:bg-gray-700 flex items-center gap-2">
                                    <WrenchIcon className="w-3 h-3 md:w-4 md:h-4" /> Onar / Geri Al
                                  </button>
                                ) : (
                                  <button onClick={() => { onCancel(item); setOpenDropdownId(null); }} className="w-full text-left px-3 py-2 text-xs md:text-sm text-orange-400 hover:bg-gray-700 flex items-center gap-2">
                                    <BanIcon className="w-3 h-3 md:w-4 md:h-4" /> Bildir
                                  </button>
                                )}

                                <hr className="border-gray-700 my-1" />
                                
                                <button onClick={() => { onDelete(item.id); setOpenDropdownId(null); }} className="w-full text-left px-3 py-2 text-xs md:text-sm text-red-400 hover:bg-red-900/40 hover:text-red-300 flex items-center gap-2 transition-colors">
                                  <TrashIcon className="w-3 h-3 md:w-4 md:h-4" /> Sil
                                </button>
                                
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-[9px] text-gray-500 italic pr-1">Yetkisiz</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr><td colSpan={headers.length + 1} className="p-8 text-center text-gray-500">Kayıt bulunamadı.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;