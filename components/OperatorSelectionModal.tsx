import React, { useState, useMemo } from 'react';
import { XIcon, SearchIcon, UserIcon, TrashIcon } from './Icons';

type Operator = { no: string; name: string; };

interface OperatorSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Artık sayı istemiyoruz, sadece isim gidiyor
    onSelect: (operatorName: string) => void;
    operators: Operator[];
    currentOperator: string | null;
    fixtureName?: string;
    currentLife?: number;
    totalLife?: number;
}

const OperatorSelectionModal: React.FC<OperatorSelectionModalProps> = ({ 
    isOpen, onClose, onSelect, operators, currentOperator, fixtureName, currentLife, totalLife 
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOperators = useMemo(() => {
        if (!searchTerm) return operators;
        const lowercasedTerm = searchTerm.toLocaleLowerCase('tr-TR');
        return operators.filter(op =>
            op.name.toLocaleLowerCase('tr-TR').includes(lowercasedTerm) ||
            op.no.toLocaleLowerCase('tr-TR').includes(lowercasedTerm)
        );
    }, [searchTerm, operators]);

    const handleSelect = (operatorName: string) => {
        // Direkt ismi gönderiyoruz, sayı sormuyoruz
        onSelect(operatorName);
        setSearchTerm('');
    };

    const handleUnassign = () => {
        onSelect(''); 
        setSearchTerm('');
    };

    if (!isOpen) return null;

    // Ömür Yüzdesi
    const lifePercent = totalLife && currentLife !== undefined 
        ? Math.max(0, Math.min(100, (currentLife / totalLife) * 100)) 
        : 100;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md transform scale-95 animate-zoom-in border border-gray-700 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <div>
                        <h2 className="text-xl font-bold text-teal-400">Operatör İşlemleri</h2>
                        <p className="text-xs text-gray-500 mt-1">{fixtureName || 'Fikstür'}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"><XIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    
                    {/* ÖMÜR BAR */}
                    {totalLife ? (
                        <div className="mb-6 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                                <span>Kalan Ömür</span>
                                <span>{currentLife} / {totalLife}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div style={{ width: `${lifePercent}%` }} className={`h-full transition-all duration-500 ${lifePercent < 20 ? 'bg-red-500' : 'bg-teal-500'}`} />
                            </div>
                        </div>
                    ) : null}

                    {/* ATAMAYI KALDIR BUTONU */}
                    {currentOperator && currentOperator !== "BOŞTA" && (
                        <div className="mb-8">
                            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg flex items-center gap-4 mb-4">
                                <div className="bg-blue-900/50 p-3 rounded-full">
                                    <UserIcon className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-300">Şu anki Operatör</p>
                                    <p className="text-lg font-bold text-white">{currentOperator}</p>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleUnassign}
                                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-red-900/20"
                            >
                                <TrashIcon className="w-5 h-5" />
                                ATAMAYI KALDIR (BOŞA AL)
                            </button>
                            
                            <div className="relative flex py-5 items-center">
                                <div className="flex-grow border-t border-gray-700"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">veya değiştir</span>
                                <div className="flex-grow border-t border-gray-700"></div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Operatör Ara..."
                                className="w-full bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block pl-10 p-3"
                            />
                        </div>

                        <div className="mt-2 max-h-64 overflow-y-auto custom-scrollbar border border-gray-700 rounded-lg">
                            {filteredOperators.length > 0 ? (
                                <ul className="divide-y divide-gray-800">
                                    {filteredOperators.map(op => (
                                        <li key={op.no + op.name}>
                                            <button
                                                onClick={() => handleSelect(op.name)}
                                                className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-700 transition-colors ${currentOperator === op.name ? 'bg-teal-900/30 text-teal-400' : 'text-gray-300'}`}
                                            >
                                                <UserIcon className="w-4 h-4 text-gray-500" />
                                                <div className="flex-1">
                                                    <div className="font-medium">{op.name}</div>
                                                    <div className="text-[10px] text-gray-500">{op.no}</div>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 py-4 text-sm">Operatör bulunamadı.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatorSelectionModal;