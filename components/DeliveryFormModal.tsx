

import React, { useEffect, useState } from 'react';
import { XIcon } from './Icons';

type DataRow = Record<string, any>;

interface DeliveryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    rowData: DataRow | null;
}

const DeliveryFormModal: React.FC<DeliveryFormModalProps> = ({ isOpen, onClose, rowData }) => {
    const [currentDateTime, setCurrentDateTime] = useState('');

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const date = now.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const time = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            setCurrentDateTime(`${date} - ${time}`);
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);
    
    const handlePrint = () => {
        const printableArea = document.getElementById('printable-area');
        if (!printableArea) {
            console.error('Printable area not found!');
            return;
        }

        const contentToPrint = printableArea.innerHTML;
        const tailwindScript = '<script src="https://cdn.tailwindcss.com"><\/script>';
        const printWindow = window.open('', '_blank');

        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="tr">
                <head>
                    <meta charset="UTF-8">
                    <title>Teslim Formu Yazdır</title>
                    ${tailwindScript}
                    <style>
                        body { 
                            -webkit-print-color-adjust: exact; 
                            color-adjust: exact; 
                            font-family: sans-serif;
                        }
                        @page {
                            size: A4;
                            margin: 0.5cm;
                        }
                        .form-container {
                            break-inside: avoid;
                            page-break-inside: avoid; /* For older browsers */
                        }
                    </style>
                </head>
                <body>
                    ${contentToPrint}
                </body>
                </html>
            `);
            printWindow.document.close();
            
            printWindow.onload = function() {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            };
        } else {
            alert('Yazdırma penceresi açılamadı. Lütfen tarayıcınızın pop-up engelleyicisini kontrol edin.');
        }
    };

    if (!isOpen) return null;

    const InfoRow: React.FC<{ label: string; value: any }> = ({ label, value }) => (
        <div className="flex border-b border-black text-[10px] leading-tight">
            <div className="w-1/3 p-0.5 font-bold border-r border-black flex items-center">{label}</div>
            <div className="w-2/3 p-0.5 flex items-center">{value}</div>
        </div>
    );
    
    const MovementRow: React.FC<{ label: string; dateTime?: string; checked?: 'v' | 'x' | null }> = ({ label, dateTime, checked }) => (
        <div className="grid grid-cols-8 text-[10px] leading-tight text-center border-b border-black">
            <div className="col-span-4 p-0.5 border-r border-black text-left flex items-center">{label}</div>
            <div className="col-span-1 p-0.5 border-r border-black flex items-center justify-center">{dateTime || ''}</div>
            <div className="col-span-1 p-0.5 border-r border-black flex items-center justify-center font-bold">{checked === 'v' ? '✓' : ''}</div>
            <div className="col-span-1 p-0.5 border-r border-black flex items-center justify-center font-bold">{checked === 'x' ? 'X' : ''}</div>
            <div className="col-span-1 p-0.5 flex items-center justify-center"></div> {/* Mühür */}
        </div>
    );

    const renderFormContent = (key: number) => (
        <div key={key} className="form-container">
            {/* Main Form Area */}
            <div>
                 {/* Header */}
                 <div className="flex border-y-2 border-r-2 border-l-2 border-black">
                    <div className="w-1/4 p-1 flex items-center justify-center border-r-2 border-black">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" className="h-10 w-auto">
                            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="black">
                                ER MAKİNA
                            </text>
                        </svg>
                    </div>
                    <div className="w-1/2 p-0 flex items-center justify-center border-r-2 border-black">
                        <h1 className="text-xs font-bold text-center leading-tight py-2">FİKSTÜR / TAKIM TESLİM FORMU<br/>FIXTURE / TOOL DELIVERY FORM</h1>
                    </div>
                    <div className="w-1/4 text-[9px] leading-tight">
                        <div className="flex border-b border-black"><div className="w-1/2 p-0.5 border-r border-black font-bold">DOKÜMAN NO</div><div className="w-1/2 p-0.5">F.072</div></div>
                        <div className="flex border-b border-black"><div className="w-1/2 p-0.5 border-r border-black font-bold">YAYIN TARİHİ</div><div className="w-1/2 p-0.5">18.07.2023</div></div>
                        <div className="flex border-b border-black"><div className="w-1/2 p-0.5 border-r border-black font-bold">REV. NO</div><div className="w-1/2 p-0.5">0</div></div>
                        <div className="flex"><div className="w-1/2 p-0.5 border-r border-black font-bold">REV. TARİHİ</div><div className="w-1/2 p-0.5">-</div></div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex border-b-2 border-r-2 border-l-2 border-black">
                    <div className="w-[55%] border-r-2 border-black">
                        <InfoRow label="FİKSTÜR NO" value={rowData?.['seri no']} />
                        <InfoRow label="MÜŞTERİ" value={rowData?.['müşteri']} />
                        <InfoRow label="PROJE" value={rowData?.['proje']} />
                        <InfoRow label="PARÇA NO" value={rowData?.['parça no']} />
                        <InfoRow label="PARÇA ADI" value={rowData?.['parça adı']} />
                        <InfoRow label="OPERASYON ADI" value={rowData?.['operasyon adı']} />
                        <InfoRow label="FİKSTÜR TANIMI" value={rowData?.['fikstür tanımı']} />
                    </div>
                    <div className="w-[45%]">
                        <div className="grid grid-cols-8 text-[9px] leading-tight text-center font-bold border-b border-black">
                            <div className="col-span-4 p-0.5 border-r border-black">DEPO HAREKETLERİ</div>
                            <div className="col-span-1 p-0.5 border-r border-black">TARİH/SAAT</div>
                            <div className="col-span-1 p-0.5 border-r border-black">✓</div>
                            <div className="col-span-1 p-0.5 border-r border-black">X</div>
                            <div className="col-span-1 p-0.5">MÜHÜR</div>
                        </div>
                        <MovementRow label="FİKSTÜR GÖRSEL KONTROLÜ" dateTime={currentDateTime} checked='v' />
                        <MovementRow label="DEPO ÇIKIŞ" dateTime={currentDateTime} checked='v' />
                        <MovementRow label="OPERATÖRE TESLİM TARİHİ" dateTime={currentDateTime} checked='v' />
                        <MovementRow label="OPERATÖR İŞ BİTİMİ TESLİM TARİHİ" />
                        <MovementRow label="İŞ BİTİMİ DEPO FİKSTÜR KONTROLÜ" />
                        <MovementRow label="DEPO GİRİŞ" />
                    </div>
                </div>
                
                {/* Instructions */}
                <div className="border-b-2 border-r-2 border-l-2 border-black p-1.5">
                    <h2 className="font-bold text-center text-xs leading-tight">TALİMATLAR / INSTRUCTIONS</h2>
                    <ol className="list-decimal list-inside text-[9px] leading-tight space-y-0.5">
                        <li>FİKSTÜR TESLİM EDERKEN KUTU VEYA SANDIĞINI AÇARAK EKSİKSİZ VE HASARSIZ OLDUĞUNU KONTROL ET. UYGUN İSE (✓), UYGUN DEĞİL İSE (X) İŞARETLE AMİRİNE BİLDİR.</li>
                        <li>FİKSTÜR DEPO ÇIKIŞI YAPARKEN TARİH / SAAT YAZ VE MÜHÜR BAS</li>
                        <li>FİKSTÜRÜ TESLİM ALAN OPERATÖRE TARİH / SAAT VE MÜHÜR BASTIR.</li>
                        <li>İŞ BİTİMİ OPERATÖRDEN FİKSTÜRÜ TESLİM AL TARİH / SAAT VE MÜHÜR BASTIR.</li>
                        <li>FİKSTÜR TESLİM ALIRKEN KUTU VEYA SANDIĞINI AÇARAK EKSİKSİZ VE HASARSIZ OLDUĞUNU KONTROL ET. UYGUN İSE (✓), UYGUN DEĞİL İSE (X) İŞARETLE AMİRİNE BİLDİR.</li>
                        <li>BU EVRAK DEĞERLİ EVRAK SINIFINDADIR. İŞ BİTİMİNDE ARŞİVLENECEKTİR.</li>
                    </ol>
                </div>

                {/* Descriptions */}
                 <div className="border-b-2 border-r-2 border-l-2 border-black p-1.5 text-xs">
                    <h2 className="font-bold">AÇIKLAMALAR / DESCRIPTIONS;</h2>
                    <div className="h-10"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-2xl p-4 w-full max-w-5xl transform scale-95 animate-zoom-in border border-gray-600 max-h-[95vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div id="printable-area" className="bg-white text-black p-2 overflow-y-auto">
                    {renderFormContent(1)}
                    <div className="h-4"></div> {/* Separator */}
                    {renderFormContent(2)}
                </div>
                 <div className="mt-4 flex justify-end gap-3 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-700 rounded-md hover:bg-gray-600 transition-colors text-white">
                        Kapat
                    </button>
                    <button onClick={handlePrint} className="px-4 py-2 text-sm font-medium bg-teal-600 rounded-md hover:bg-teal-700 transition-colors text-white">
                        Yazdır
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeliveryFormModal;