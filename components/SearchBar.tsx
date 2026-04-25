import React from 'react';
import { SearchIcon, XIcon } from './Icons';

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onClear }) => {
  return (
    <div className="relative w-full md:w-80">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <SearchIcon className="w-5 h-5 text-gray-500" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Veri içinde ara..."
        className="w-full bg-gray-900/50 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block pl-10 pr-10 p-2.5 transition-colors duration-300"
      />
      {value && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
                onClick={onClear}
                className="text-gray-500 hover:text-gray-200 transition-colors"
                aria-label="Aramayı temizle"
                title="Aramayı temizle"
            >
                <XIcon className="w-5 h-5" />
            </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;