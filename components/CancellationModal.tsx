import React, { useState } from 'react';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: string, reason: string) => void;
  fixtureName: string | undefined;
}

const CancellationModal: React.FC<CancellationModalProps> = ({ isOpen, onClose, onConfirm, fixtureName }) => {
  const [type, setType] = useState<string>("KAYIP");
  const [reason, setReason] = useState<string>("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert("Lütfen bir açıklama giriniz.");
      return;
    }
    onConfirm(type, reason);
    setType("KAYIP");
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            Durum Bildir
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-300">
            <span className="font-bold text-white">{fixtureName}</span> için işlem türünü seçiniz:
          </p>
          
          {/* YENİ: BAKIM VE ARIZALI BUTONLARI EKLENDİ */}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setType("KAYIP")} className={`py-2 px-2 rounded-lg font-bold text-xs transition-all ${type === "KAYIP" ? "bg-red-600 text-white shadow-lg shadow-red-500/30" : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700"}`}>KAYIP</button>
            <button onClick={() => setType("İPTAL")} className={`py-2 px-2 rounded-lg font-bold text-xs transition-all ${type === "İPTAL" ? "bg-yellow-600 text-white shadow-lg shadow-yellow-500/30" : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700"}`}>İPTAL</button>
            <button onClick={() => setType("İADE")} className={`py-2 px-2 rounded-lg font-bold text-xs transition-all ${type === "İADE" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30" : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700"}`}>İADE</button>
            
            <button onClick={() => setType("BAKIM")} className={`py-2 px-2 col-span-1 rounded-lg font-bold text-xs transition-all ${type === "BAKIM" ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30" : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700"}`}>BAKIM</button>
            <button onClick={() => setType("ARIZALI")} className={`py-2 px-2 col-span-2 rounded-lg font-bold text-xs transition-all ${type === "ARIZALI" ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30" : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700"}`}>ARIZALI</button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Açıklama / Gerekçe</label>
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
              rows={3}
              placeholder="Detaylı açıklama giriniz..."
            />
          </div>
        </div>

        <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Vazgeç</button>
          <button onClick={handleConfirm} className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg">Kaydet</button>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;