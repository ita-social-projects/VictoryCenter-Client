import React, { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { SearchItemContentRef } from '../search-item-wrapper/SearchItemWrapper';
import './TextSearchItem.scss';

export interface TextSearchItemProps {
    label: string;
}

export const TextSearchItem = forwardRef<SearchItemContentRef, TextSearchItemProps>(({ label }, ref) => {
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
