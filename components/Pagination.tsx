import React, { useState, useEffect } from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (items: number) => void;
    totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    totalItems
}) => {
    // Input kutusu için yerel state
    const [inputPage, setInputPage] = useState(currentPage.toString());

    // Dışarıdan sayfa değişirse (Next/Prev butonlarıyla), input'u güncelle
    useEffect(() => {
        setInputPage(currentPage.toString());
    }, [currentPage]);

    // Enter tuşuna basınca git
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            let page = parseInt(inputPage);
            
            // Doğrulama: Sayı değilse veya sınırların dışındaysa düzelt
            if (isNaN(page)) page = 1;
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;

            onPageChange(page);
            setInputPage(page.toString()); // Inputu düzeltilmiş haliyle güncelle
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputPage(e.target.value);
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-gray-900/50 border-t border-gray-800 backdrop-blur-sm rounded-b-xl">
            
            {/* SOL TARAFA: Sayfa Başına Kayıt Seçimi */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Sayfa başına:</span>
                <select 
                    value={itemsPerPage}
                    onChange={(e) => {
                        onItemsPerPageChange(Number(e.target.value));
                        onPageChange(1); // Sayfa sayısı değişince başa dön
                    }}
                    className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-2 py-1 focus:ring-1 focus:ring-teal-500 outline-none cursor-pointer hover:bg-gray-700 transition-colors"
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={-1}>Tümü</option>
                </select>
            </div>

            {/* ORTA KISIM: Navigasyon Butonları ve Input */}
            <div className="flex items-center gap-1">
                {/* İlk Sayfa */}
                <button 
                    onClick={() => onPageChange(1)} 
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-medium"
                >
                    « İlk
                </button>

                {/* Önceki Sayfa */}
                <button 
                    onClick={() => onPageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-medium"
                >
                    Önceki
                </button>

                {/* --- YENİ EKLENEN INPUT ALANI --- */}
                <div className="flex items-center mx-2 bg-gray-800 border border-gray-700 rounded-md overflow-hidden">
                    <input 
                        type="number"
                        min="1"
                        max={totalPages}
                        value={inputPage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="w-12 bg-transparent text-center text-teal-400 font-bold text-sm py-1 outline-none focus:bg-gray-700 appearance-none"
                    />
                    <div className="bg-gray-700/50 px-2 py-1 text-xs text-gray-400 border-l border-gray-700 font-medium select-none">
                        / {totalPages}
                    </div>
                </div>
                {/* -------------------------------- */}

                {/* Sonraki Sayfa */}
                <button 
                    onClick={() => onPageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-medium"
                >
                    Sonraki
                </button>

                {/* Son Sayfa */}
                <button 
                    onClick={() => onPageChange(totalPages)} 
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-medium"
                >
                    Son »
                </button>
            </div>

            {/* SAĞ TARAF: Toplam Kayıt Bilgisi */}
            <div className="text-sm text-gray-400 font-medium">
                Top. <span className="text-white font-bold">{totalItems}</span> kayıt
            </div>
        </div>
    );
};

export default Pagination;
