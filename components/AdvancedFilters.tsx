import React, { useMemo, useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FilterIcon, XIcon, ChevronDownIcon, SearchIcon } from './Icons';

interface AdvancedFiltersProps {
  data: Record<string, any>[];
  filters: Record<string, string[]>;
  onFilterChange: (key: string, value: string[]) => void;
  onClearFilters: () => void;
  filterableColumns: { key: string; label: string }[];
}

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  isDisabled: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  isDisabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setCoords({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  };

  const toggleOpen = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (isDisabled) return;

    if (!isOpen) {
      updatePosition();
    }

    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (buttonRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;

      setIsOpen(false);
    };

    const handleResize = () => {
      updatePosition();
    };

    const handleScroll = (event: Event) => {
      const target = event.target as Node;

      // Dropdown içinde scroll yapılıyorsa kapatma
      if (dropdownRef.current?.contains(target)) return;

      // Sayfa scroll olursa sadece pozisyonu güncelle
      updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((val) => val !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const filteredOptions = options.filter((opt) =>
    opt.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR'))
  );

  const dropdownContent = isOpen ? (
    <div
      ref={dropdownRef}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        zIndex: 99999,
      }}
      className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl max-h-80 overflow-hidden flex flex-col animate-fade-in"
    >
      <div className="p-2 border-b border-gray-700 bg-gray-850">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ara..."
            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1.5 pl-8 text-xs text-white focus:border-teal-500 outline-none"
            autoFocus
          />

          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
            <SearchIcon className="w-3 h-3 text-gray-500" />
          </div>
        </div>
      </div>

      <div className="overflow-y-auto custom-scrollbar flex-1">
        {filteredOptions.map((option) => {
          const isSelected = selectedValues.includes(option);

          return (
            <div
              key={option}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleOption(option);
              }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-700 cursor-pointer text-xs text-gray-200 transition-colors border-b border-gray-700/50 last:border-0"
            >
              <input
                type="checkbox"
                checked={isSelected}
                readOnly
                className="w-4 h-4 rounded border-gray-600 text-teal-600 focus:ring-teal-500 bg-gray-700 pointer-events-none"
              />

              <span className="truncate select-none">{option}</span>
            </div>
          );
        })}

        {filteredOptions.length === 0 && (
          <div className="p-2 text-gray-500 text-xs text-center">
            Sonuç bulunamadı
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative">
      <label className="text-[10px] text-gray-400 uppercase mb-1 font-semibold ml-1 block">
        {label}
        {!isDisabled && options.length > 0 && (
          <span className="text-gray-600 ml-1">({options.length})</span>
        )}
      </label>

      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        disabled={isDisabled}
        className={`w-full flex items-center justify-between bg-gray-900 border rounded-lg p-2 text-xs transition-all
          ${
            isDisabled
              ? 'border-gray-800 text-gray-600 cursor-not-allowed opacity-50'
              : 'border-gray-600 hover:border-gray-500 text-gray-200'
          }
          ${
            selectedValues.length > 0
              ? 'ring-1 ring-teal-500 border-teal-500 bg-teal-900/20'
              : ''
          }
        `}
      >
        <span className="truncate">
          {selectedValues.length === 0
            ? isDisabled
              ? '-'
              : 'Tümü'
            : `${selectedValues.length} Seçili`}
        </span>

        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {ReactDOM.createPortal(dropdownContent, document.body)}
    </div>
  );
};

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  data,
  filters,
  onFilterChange,
  onClearFilters,
  filterableColumns,
}) => {
  const getOptions = useMemo(() => {
    const options: Record<string, string[]> = {};

    filterableColumns.forEach((targetCol) => {
      let filteredDataForCol = data;

      Object.entries(filters).forEach(([filterKey, val]) => {
        const filterValues = val as string[];

        if (filterValues && filterValues.length > 0) {
          if (filterKey === targetCol.key) return;

          filteredDataForCol = filteredDataForCol.filter((row) =>
            filterValues.includes(String(row[filterKey]))
          );
        }
      });

      const uniqueValues = Array.from(
        new Set(filteredDataForCol.map((row) => row[targetCol.key]))
      )
        .filter((val) => val !== undefined && val !== null && String(val).trim() !== '')
        .map(String)
        .sort((a, b) => a.localeCompare(b, 'tr'));

      options[targetCol.key] = uniqueValues;
    });

    return options;
  }, [data, filters, filterableColumns]);

  const activeFilterCount = Object.values(filters).reduce<number>((acc, val) => {
    const v = val as string[];
    return acc + (v ? v.length : 0);
  }, 0);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg mb-4 relative z-30">
      <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-2">
        <div className="flex items-center gap-2 text-teal-400">
          <FilterIcon className="w-5 h-5" />
          <h3 className="font-bold text-sm uppercase tracking-wider">
            Gelişmiş Filtreleme
          </h3>
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <XIcon className="w-3 h-3" />
            Temizle ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {filterableColumns.map((col) => {
          const currentOptions = getOptions[col.key] || [];
          const currentValues = filters[col.key] || [];
          const isDisabled = currentOptions.length === 0 && currentValues.length === 0;

          return (
            <MultiSelectDropdown
              key={col.key}
              label={col.label}
              options={currentOptions}
              selectedValues={currentValues}
              onChange={(newValues) => onFilterChange(col.key, newValues)}
              isDisabled={isDisabled}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedFilters;