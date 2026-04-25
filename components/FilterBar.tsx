import React, { useMemo } from 'react';

type DataRow = Record<string, any>;

interface FilterBarProps {
    data: DataRow[];
    filters: Record<string, string>;
    onFilterChange: (filterName: string, value: string) => void;
    onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ data, filters, onFilterChange, onClearFilters }) => {
    const customerOptions = useMemo(() => {
        const customers = new Set(data.map(row => row['müşteri']).filter(Boolean));
        return Array.from(customers).sort((a, b) => String(a).localeCompare(String(b)));
    }, [data]);

    const projectOptions = useMemo(() => {
        const selectedCustomer = filters['müşteri'];
        if (!selectedCustomer) {
            return [];
        }
        const projects = new Set(
            data
                .filter(row => row['müşteri'] === selectedCustomer)
                .map(row => row['proje'])
                .filter(Boolean)
        );
        return Array.from(projects).sort((a, b) => String(a).localeCompare(String(b)));
    }, [data, filters]);

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange('müşteri', e.target.value);
    };

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange('proje', e.target.value);
    };


    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row gap-4 items-center">
            <h3 className="text-lg font-semibold text-gray-300 flex-shrink-0">Filtreler:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex-1 gap-4 w-full">
                <select
                    value={filters['müşteri'] || ''}
                    onChange={handleCustomerChange}
                    className="w-full bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5"
                    aria-label="Müşteriye göre filtrele"
                >
                    <option value="">Tüm Müşteriler</option>
                    {customerOptions.map(customer => (
                        <option key={customer} value={customer}>{customer}</option>
                    ))}
                </select>
                <select
                    value={filters['proje'] || ''}
                    onChange={handleProjectChange}
                    disabled={!filters['müşteri']}
                    className="w-full bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Projeye göre filtrele"
                >
                    <option value="">Tüm Projeler</option>
                    {projectOptions.map(project => (
                        <option key={project} value={project}>{project}</option>
                    ))}
                </select>
            </div>
            <button
                onClick={onClearFilters}
                className="px-4 py-2.5 text-sm font-medium bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors w-full sm:w-auto"
            >
                Filtreleri Temizle
            </button>
        </div>
    );
};

export default FilterBar;
