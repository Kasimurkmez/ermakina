import React, { useState } from 'react';
import { XIcon, WrenchIcon } from './Icons';

interface RepairModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (note: string) => void;
    fixtureName: string;
}

const RepairModal: React.FC<RepairModalProps> = ({ isOpen, onClose, onConfirm, fixtureName }) => {
    const [note, setNote] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        // Not girmek zorunlu olmasın, boş da geçilebilsin ("Genel Bakım" sayılır)
        onConfirm(note || 'Genel bakım yapıldı.');
        setNote(''); 
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-emerald-500/50 flex flex-col" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-850 rounded-t-xl">
                    <div className="flex items-center gap-2 text-emerald-500">
                        <WrenchIcon className="w-6 h-6" />
                        <h2 className="text-lg font-bold">Fikstürü Onar / Devreye Al</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="w-5 h-5" /></button>
                </div>

                <div className="p-6">
                    <p className="text-gray-300 text-sm mb-4">
                        <span className="font-bold text-white">{fixtureName}</span> adlı fikstürü tekrar kullanıma almak üzeresiniz. Durumu <span className="text-emerald-400 font-bold">BOŞTA</span> olarak güncellenecektir.
                    </p>
                    
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Yapılan İşlem / Not</label>
                    <textarea 
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none h-32 resize-none"
                        placeholder="Örn: Rulman değiştirildi, yağlama yapıldı..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    ></textarea>

                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors">Vazgeç</button>
                        <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium shadow-lg shadow-emerald-900/20 transition-colors">Onar ve Aç</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RepairModal;
