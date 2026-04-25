import React, { useEffect } from 'react';
import { XIcon } from './Icons';

interface ImageModalProps {
    imageUrl: string | null;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (imageUrl) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [imageUrl, onClose]);

    if (!imageUrl) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="relative max-w-4xl max-h-[90vh] transition-transform duration-300 transform scale-95 animate-zoom-in"
                onClick={(e) => e.stopPropagation()}
            >
                <img src={imageUrl} alt="Büyütülmüş görünüm" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                <button
                    onClick={onClose}
                    className="absolute -top-4 -right-4 text-white bg-gray-800 rounded-full p-2 hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Kapat"
                >
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

// It's better to add animation keyframes to index.html or a global CSS file.
// For now, we inject them with a style tag for simplicity.
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes zoomIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }
    .animate-zoom-in {
        animation: zoomIn 0.3s ease-out forwards;
    }
`;
document.head.appendChild(style);

export default ImageModal;