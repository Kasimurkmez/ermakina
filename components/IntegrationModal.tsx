
import React, { useState, useEffect } from 'react';
import { XIcon, ServerIcon, RefreshCwIcon } from './Icons';

interface IntegrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const IntegrationModal: React.FC<IntegrationModalProps> = ({ isOpen, onClose }) => {
    const [config, setConfig] = useState({
        provider: 'Canias ERP',
        apiUrl: 'https://api.sirketiniz.com/canias/ws',
        apiKey: '',
        autoSync: false
    });
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setConfig(prev => ({ ...prev, [name]: checked }));
    };

    const handleTestConnection = () => {
        setIsTesting(true);
        setTestResult(null);
        
        // Simülasyon: Gerçek bir API isteği atılıyor gibi bekleme süresi ekliyoruz
        setTimeout(() => {
            setIsTesting(false);
            setTestResult({
                success: true,
                message: `Bağlantı Başarılı! ${config.provider} sunucusuna erişildi. (v.8.0.2)`
            });
        }, 2000);
    };

    const handleSave = () => {
        alert("Entegrasyon ayarları kaydedildi. (Bu bir simülasyondur)");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-gray-900 rounded-lg shadow-2xl p-6 w-full max-w-lg transform scale-95 animate-zoom-in border border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-900/50 rounded-lg text-teal-400">
                            <ServerIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-teal-400">ERP Entegrasyon Ayarları</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">ERP Sağlayıcısı</label>
                        <select 
                            name="provider" 
                            value={config.provider} 
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        >
                            <option value="Canias ERP">Canias ERP (IAS)</option>
                            <option value="SAP">SAP S/4HANA</option>
                            <option value="Logo">Logo Tiger / Netsis</option>
                            <option value="Mikro">Mikro Yazılım</option>
                            <option value="Custom">Özel REST API</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">API Uç Noktası (Endpoint URL)</label>
                        <input 
                            type="text" 
                            name="apiUrl"
                            value={config.apiUrl}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-gray-200 focus:border-teal-500 focus:ring-teal-500"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">API Anahtarı / Token</label>
                        <input 
                            type="password" 
                            name="apiKey"
                            value={config.apiKey}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-gray-200 focus:border-teal-500 focus:ring-teal-500"
                            placeholder="••••••••••••••••"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input 
                            type="checkbox" 
                            id="autoSync" 
                            name="autoSync"
                            checked={config.autoSync}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 text-teal-600 bg-gray-800 border-gray-600 rounded focus:ring-teal-500"
                        />
                        <label htmlFor="autoSync" className="text-sm text-gray-300 select-none">
                            Her gün 08:00'de otomatik senkronize et
                        </label>
                    </div>

                    {testResult && (
                        <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${testResult.success ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400'}`}>
                            <span>{testResult.success ? '✓' : 'X'}</span>
                            {testResult.message}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button 
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className="px-4 py-2 text-sm font-medium bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isTesting ? (
                            <>
                                <RefreshCwIcon className="w-4 h-4 animate-spin" /> Bağlanıyor...
                            </>
                        ) : (
                            'Bağlantıyı Test Et'
                        )}
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                    >
                        Ayarları Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntegrationModal;
