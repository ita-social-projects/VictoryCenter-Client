import React, { useEffect, useRef, useCallback } from 'react';
import './TextSuggestionContent.scss';

export interface TextSuggestionItemProps {
    label: string;
    isHovered: boolean;
    onShowTooltip: (content: React.ReactNode) => void;
}

export const TextSuggestionContent = ({ label, isHovered, onShowTooltip }: TextSuggestionItemProps) => {
    const textRef = useRef<HTMLSpanElement>(null);

    const checkOverflow = useCallback(() => {
        const element = textRef.current;
        if (!element) return false;
        return element.scrollWidth > element.clientWidth;
    }, []);

    useEffect(() => {
        const showTooltipIfNeeded = () => {
            if (checkOverflow()) {
                onShowTooltip(<div className="text-suggestion-content-tooltip">{label}</div>);
            }
        };

        if (isHovered) {
            showTooltipIfNeeded();
        }

        const element = textRef.current;
        if (!element) return;

        const resizeObserver = new ResizeObserver(() => {
            if (isHovered) {
                showTooltipIfNeeded();
            }
        });

        resizeObserver.observe(element);

        return () => resizeObserver.disconnect();
    }, [isHovered, label, checkOverflow, onShowTooltip]);

    return (
        <span ref={textRef} className="text-suggestion-content">
            {label}
        </span>
    );
};
