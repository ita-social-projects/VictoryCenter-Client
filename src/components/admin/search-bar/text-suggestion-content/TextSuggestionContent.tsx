import React, { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { SuggestionContentRef } from '../suggestion-wrapper/SuggestionWrapper';
import './TextSuggestionContent.scss';

export interface TextSuggestionContentProps {
    label: string;
}

export const TextSuggestionContent = forwardRef<SuggestionContentRef, TextSuggestionContentProps>(({ label }, ref) => {
    const textRef = useRef<HTMLSpanElement>(null);

    const tooltipContent = useMemo(() => <div className="text-suggestion-content__tooltip">{label}</div>, [label]);

    useImperativeHandle(ref, () => ({
        getTooltipContent: () => {
            const element = textRef.current;
            const isLabelOverflowing = element && element.scrollWidth > element.clientWidth;
            return isLabelOverflowing ? tooltipContent : null;
        },
    }));

    return (
        <span ref={textRef} className="text-suggestion-content">
            {label}
        </span>
    );
});
