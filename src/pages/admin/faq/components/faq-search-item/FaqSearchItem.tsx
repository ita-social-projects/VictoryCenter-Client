import { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { SearchItemContentRef } from '@/components/admin/search-bar/search-item-wrapper/SearchItemWrapper';
import './FaqSearchItem.scss';
import { FaqSearchItemData } from '@/types/admin/faq';

export interface FaqSearchItemProps {
    item: FaqSearchItemData;
}

export const FaqSearchItem = forwardRef<SearchItemContentRef, FaqSearchItemProps>(({ item }, ref) => {
    const nameRef = useRef<HTMLSpanElement>(null);

    const tooltipContent = useMemo(
        () => (
            <div className="faq-search-item-tooltip">
                <div className="faq-search-item-tooltip__name">{item.question}</div>
            </div>
        ),
        [item.question],
    );

    useImperativeHandle(ref, () => ({
        getTooltipContent: () => {
            const nameElement = nameRef.current;

            const isOverflowing = nameElement && nameElement.scrollWidth > nameElement.clientWidth;

            return isOverflowing ? tooltipContent : null;
        },
    }));

    return (
        <div className="faq-search-item">
            <span ref={nameRef} className="faq-search-item__name">
                {item.question}
            </span>
        </div>
    );
});
