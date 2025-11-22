import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { SearchItemContentRef } from '../search-item-wrapper/SearchItemWrapper';
import styles from './TextSearchItem.module.scss';

export interface TextSearchItemProps {
    label: string;
}

export const TextSearchItem = forwardRef<SearchItemContentRef, TextSearchItemProps>(({ label }, ref) => {
    const textRef = useRef<HTMLSpanElement>(null);

    useImperativeHandle(ref, () => ({
        getTooltipContent: () => {
            const element = textRef.current;
            const isLabelOverflowing = element && element.scrollWidth > element.clientWidth;
            return isLabelOverflowing ? (
                <div className={styles['text-search-item-content__tooltip']}>{label}</div>
            ) : null;
        },
    }));

    return (
        <span ref={textRef} className={styles['text-search-item-content']}>
            {label}
        </span>
    );
});
