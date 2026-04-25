
import React from 'react';
import { RefreshCwIcon, CubeIcon, ChevronRightIcon } from './Icons';

interface SidebarProps {
    activeModule: 'fixture' | 'raw_material';
    onModuleChange: (module: 'fixture' | 'raw_material') => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, onModuleChange, isOpen, setIsOpen }) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full bg-gray-900 border-r border-gray-700 z-50 transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-0 md:w-20'} overflow-hidden`}>
                
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-center border-b border-gray-700 bg-gray-900/50">
                    <div className="font-bold text-teal-400 text-xl tracking-tighter">
                        {isOpen ? 'ER MAKİNA' : 'ER'}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 space-y-2 px-3">
                    <button
                        onClick={() => onModuleChange('fixture')}
                        className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all group relative overflow-hidden ${activeModule === 'fixture' ? 'bg-teal-600/20 text-teal-400' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                    >
                        <RefreshCwIcon className={`w-6 h-6 flex-shrink-0 ${activeModule === 'fixture' ? 'animate-pulse' : ''}`} />
                        <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                            Fikstür Takip
                        </span>
                        {!isOpen && (
                             <div className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none md:block hidden shadow-lg border border-gray-700">
                                Fikstür Takip
                             </div>
                        )}
                        {activeModule === 'fixture' && isOpen && <ChevronRightIcon className="w-4 h-4 ml-auto" />}
                    </button>

                    <button
                        onClick={() => onModuleChange('raw_material')}
                        className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all group relative overflow-hidden ${activeModule === 'raw_material' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                    >
                        <CubeIcon className="w-6 h-6 flex-shrink-0" />
                        <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                            Hammadde Takip
                        </span>
                        {!isOpen && (
                             <div className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none md:block hidden shadow-lg border border-gray-700">
                                Hammadde Takip
                             </div>
                        )}
                        {activeModule === 'raw_material' && isOpen && <ChevronRightIcon className="w-4 h-4 ml-auto" />}
                    </button>
                </nav>

                {/* Footer Toggle */}
                <div className="p-4 border-t border-gray-700 hidden md:flex justify-center">
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                        <ChevronRightIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
