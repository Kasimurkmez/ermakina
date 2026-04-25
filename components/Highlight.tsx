
import React from 'react';

interface HighlightProps {
    text: string;
    highlight: string;
}

const Highlight: React.FC<HighlightProps> = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <span>{text}</span>;
    }
    // Escape special characters for regex
    const escapedHighlight = highlight.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const terms = escapedHighlight.split(/\s+/).filter(term => term.length > 0);
    if(terms.length === 0) return <span>{text}</span>;
    
    const regex = new RegExp(`(${terms.join('|')})`, 'giu');
    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, i) =>
                terms.some(term => new RegExp(term, 'iu').test(part)) ? (
                    <mark key={i} className="bg-teal-500 text-gray-900 rounded px-1 py-0.5">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};

export default React.memo(Highlight);
