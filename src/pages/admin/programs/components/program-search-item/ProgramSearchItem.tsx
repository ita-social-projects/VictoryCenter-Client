import React, { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { ProgramSearchItemData } from '@/types/admin/programs';
import { SearchItemContentRef } from '@/components/admin/search-bar/search-item-wrapper/SearchItemWrapper';
import './ProgramSearchItem.scss';

export interface ProgramSearchItemProps {
    item: ProgramSearchItemData;
}

export const ProgramSearchItem = forwardRef<SearchItemContentRef, ProgramSearchItemProps>(({ item }, ref) => {
    const nameRef = useRef<HTMLSpanElement>(null);
    const categoriesRef = useRef<HTMLSpanElement>(null);

    const categoriesText = useMemo(() => item.categories.join(', '), [item.categories]);

    const tooltipContent = useMemo(
        () => (
            <div className="program-search-item-tooltip">
                <div className="program-search-item-tooltip__name">{item.name}</div>
                <div className="program-search-item-tooltip__categories">{categoriesText}</div>
            </div>
        ),
        [item.name, categoriesText],
    );

    useImperativeHandle(ref, () => ({
        getTooltipContent: () => {
            const nameElement = nameRef.current;
            const categoriesElement = categoriesRef.current;

            const isOverflowing =
                (nameElement && nameElement.scrollWidth > nameElement.clientWidth) ||
                (categoriesElement && categoriesElement.scrollWidth > categoriesElement.clientWidth);

            return isOverflowing ? tooltipContent : null;
        },
    }));

    return (
        <div className="program-search-item">
            <span ref={nameRef} className="program-search-item__name">
                {item.name}
            </span>
            <span ref={categoriesRef} className="program-search-item__categories">
                {categoriesText}
            </span>
        </div>
    );
});
