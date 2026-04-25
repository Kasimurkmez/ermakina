import React from 'react';
import { FileSpreadsheetIcon, RowsIcon, ColumnsIcon, SearchIcon } from './Icons';

interface DashboardProps {
    fileName: string | null;
    rowCount: number;
    columnCount: number;

    filteredRowCount: number;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg flex items-center gap-4 border border-gray-700">
        <div className="text-teal-400">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-xl font-bold text-gray-100">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ fileName, rowCount, columnCount, filteredRowCount }) => {
    return (
        <div>
            <div className="flex items-center gap-3 mb-4 text-gray-300">
                <FileSpreadsheetIcon className="h-6 w-6 text-teal-400"/>
                <span className="font-semibold text-lg truncate" title={fileName ?? ''}>{fileName}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon={<RowsIcon className="w-8 h-8"/>} label="Toplam Satır" value={rowCount.toLocaleString()} />
                <StatCard icon={<ColumnsIcon className="w-8 h-8"/>} label="Toplam Sütun" value={columnCount.toLocaleString()} />
                <StatCard icon={<SearchIcon className="w-8 h-8"/>} label="Bulunan Sonuç" value={filteredRowCount.toLocaleString()} />
            </div>
        </div>
    );
};

export default Dashboard;