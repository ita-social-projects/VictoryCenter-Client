import React, { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { ProgramSearchItemData } from '@/types/admin/programs';
import { SearchItemContentRef } from '@/components/admin/search-bar/search-item-wrapper/SearchItemWrapper';
import './ProgramSearchItem.scss';

export interface ProgramSearchItemProps {
    item: ProgramSearchItemData;
}

const MAX_NAME_LENGTH = 50;

export const ProgramSearchItem = forwardRef<SearchItemContentRef, ProgramSearchItemProps>(({ item }, ref) => {
    const nameRef = useRef<HTMLSpanElement>(null);
    const categoriesRef = useRef<HTMLSpanElement>(null);

    const categoriesText = useMemo(() => item.categories.join(', '), [item.categories]);

    const displayName = useMemo(() => {
        return item.name.length > MAX_NAME_LENGTH ? `${item.name.substring(0, MAX_NAME_LENGTH)}...` : item.name;
    }, [item.name]);

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

            const isManuallyTruncated = item.name.length > MAX_NAME_LENGTH;

            const isOverflowing =
                (nameElement && nameElement.scrollWidth > nameElement.clientWidth) ||
                (categoriesElement && categoriesElement.scrollWidth > categoriesElement.clientWidth);

            return isManuallyTruncated || isOverflowing ? tooltipContent : null;
        },
    }));

    return (
        <div className="program-search-item">
            <span ref={nameRef} className="program-search-item__name">
                {displayName}
            </span>
            <span ref={categoriesRef} className="program-search-item__categories">
                {categoriesText}
            </span>
        </div>
    );
});
