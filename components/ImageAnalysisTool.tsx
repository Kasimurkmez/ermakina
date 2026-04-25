

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { UploadCloudIcon, FileTextIcon, LinkIcon, XIcon } from './Icons';

interface ImageAnalysisToolProps {
    isOpen: boolean;
    onClose: () => void;
    onImageLink: (id: string, imageDataUrl: string) => void;
    imageMap: Record<string, string>;
    onViewImage: (imageUrl: string) => void;
}

type AnalysisResult = {
    description: string;
    id: string;
};

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });


const ImageAnalysisTool: React.FC<ImageAnalysisToolProps> = ({ isOpen, onClose, onImageLink, imageMap, onViewImage }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [linkedId, setLinkedId] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
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
    
    const handleClear = () => {
        setImageFile(null);
        setImagePreview(null);
        setIsLoading(false);
        setError(null);
        setAnalysisResult(null);
        setLinkedId("");
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleClear();
            setImageFile(file);
            const previewUrl = await fileToBase64(file);
            setImagePreview(previewUrl);
        }
    };

    const handleAnalyze = async () => {
        if (!imageFile || !imagePreview) {
            setError("Lütfen önce bir görsel dosyası seçin.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const base64Data = imagePreview.split(',')[1];

            const imagePart = {
                inlineData: {
                    mimeType: imageFile.type,
                    data: base64Data,
                },
            };

            const textPart = {
                text: "Bu görseli analiz et. İçindeki ana nesnenin (örneğin bir makine parçası, fikstür, alet) kodunu veya numarasını belirle. Sonucu şu JSON formatında ver: {description: 'Görselin detaylı açıklaması...', id: 'Bulunan kod/numara'}. Eğer net bir kod/numara yoksa, id alanına 'TANIMSIZ' yaz.",
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            description: { type: Type.STRING },
                            id: { type: Type.STRING },
                        }
                    }
                }
            });
            
            const resultJson = JSON.parse(response.text);
            setAnalysisResult(resultJson);
            setLinkedId(resultJson.id || "");

        } catch (err) {
            console.error(err);
            setError("Görsel analiz edilirken bir hata oluştu. Lütfen API anahtarınızı kontrol edin veya daha sonra tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveLink = () => {
        if (linkedId && imagePreview) {
            onImageLink(linkedId, imagePreview);
            // Optional: clear after saving
            // handleClear(); 
        } else {
            setError("Eşleştirmeyi kaydetmek için bir ID ve görsel gereklidir.");
        }
    };
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-gray-900 rounded-lg shadow-2xl p-6 w-full max-w-6xl transform scale-95 animate-zoom-in border border-gray-700 h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-teal-400">Görsel Analiz ve Eşleştirme Aracı</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Kapat">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow overflow-hidden">
                    {/* Left side: Uploader and Analyzer */}
                    <div className="bg-gray-900/50 rounded-lg border border-gray-700 space-y-4 flex flex-col p-4">
                        <h3 className="text-xl font-bold text-teal-400 flex-shrink-0">1. Görseli Yükle ve Analiz Et</h3>
                        <div className="overflow-y-auto pr-2 space-y-4 flex-grow">
                            {!imagePreview && (
                                <label
                                  onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                  onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsDragging(false);
                                      const file = e.dataTransfer.files?.[0];
                                      if(file) {
                                          handleClear();
                                          setImageFile(file);
                                          fileToBase64(file).then(setImagePreview);
                                      }
                                  }}
                                  className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 bg-gray-800 border-gray-600 hover:bg-gray-700/50 hover:border-teal-500 ${isDragging ? 'scale-105 border-teal-500 bg-gray-700' : ''}`}
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center pointer-events-none">
                                      <UploadCloudIcon className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-teal-400' : 'text-gray-500'}`} />
                                      <p className="mb-2 text-lg font-semibold text-gray-300">
                                          {isDragging ? 'Dosyayı bırakabilirsiniz' : <>Görseli buraya sürükleyin veya <span className="text-teal-400">tıklayın</span></>}
                                      </p>
                                  </div>
                                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            )}

                            {imagePreview && (
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <img src={imagePreview} alt="Yüklenen görsel" className="w-full max-h-60 object-contain rounded-lg" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <button onClick={() => onViewImage(imagePreview)} className="px-4 py-2 bg-black/70 rounded-md text-sm">Büyüt</button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                       <button onClick={handleAnalyze} disabled={isLoading} className="w-full px-4 py-2 font-semibold bg-teal-600 hover:bg-teal-700 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                                        {isLoading ? 'Analiz ediliyor...' : 'Görseli Analiz Et'}
                                       </button>
                                       <button onClick={handleClear} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors">Temizle</button>
                                    </div>
                                </div>
                            )}
                            
                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            {analysisResult && (
                                <div className="space-y-4 pt-4 border-t border-gray-700 animate-fade-in">
                                    <div>
                                        <label htmlFor="linkedId" className="block text-sm font-medium text-gray-300 mb-1">Tespit Edilen / Atanan ID</label>
                                        <input
                                            id="linkedId"
                                            type="text"
                                            value={linkedId}
                                            onChange={(e) => setLinkedId(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>
                                    <button onClick={handleSaveLink} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                                        <LinkIcon className="w-4 h-4" />
                                        Eşleştirmeyi Kaydet
                                    </button>
                                    <div className="p-4 bg-gray-800/50 rounded-lg">
                                        <h3 className="font-semibold text-teal-400 flex items-center gap-2"><FileTextIcon className="w-5 h-5"/>Açıklama</h3>
                                        <p className="text-gray-300 mt-2 text-sm">{analysisResult.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side: Existing links */}
                    <div className="bg-gray-900/50 rounded-lg border border-gray-700 flex flex-col p-4">
                        <h3 className="text-xl font-bold text-teal-400 mb-4 flex-shrink-0">2. Mevcut Eşleştirmeler ({Object.keys(imageMap).length})</h3>
                        <div className="flex-grow overflow-y-auto pr-2">
                            {Object.keys(imageMap).length === 0 ? (
                                <p className="text-gray-500 text-center mt-8">Henüz hiç görsel eşleştirilmedi.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {Object.entries(imageMap).map(([id, url]) => (
                                        <div key={id} className="group relative">
                                            <img
                                                src={url}
                                                alt={`ID: ${id}`}
                                                className="w-full h-24 object-cover rounded-md cursor-pointer border-2 border-transparent group-hover:border-teal-400 transition-all"
                                                onClick={() => onViewImage(url)}
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-1 rounded-b-md truncate px-1" title={id}>
                                                {id}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageAnalysisTool;