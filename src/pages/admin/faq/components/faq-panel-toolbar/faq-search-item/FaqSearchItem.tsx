import { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { SearchItemContentRef } from '../../../../../../components/admin/search-bar/search-item-wrapper/SearchItemWrapper';
import './FaqSearchItem.scss';
import { FaqSearchItemData } from '../../../../../../types/admin/faq';

export interface FaqSearchItemProps {
    item: FaqSearchItemData;
}

export const FaqSearchItem = forwardRef<SearchItemContentRef, FaqSearchItemProps>(({ item }, ref) => {
    const nameRef = useRef<HTMLSpanElement>(null);
    const pagesRef = useRef<HTMLSpanElement>(null);

    const pagesText = useMemo(() => item.pages.join(', '), [item.pages]);

    const tooltipContent = useMemo(
        () => (
            <div className="faq-search-item-tooltip">
                <div className="faq-search-item-tooltip__name">{item.question}</div>
                <div className="faq-search-item-tooltip__pages">{pagesText}</div>
            </div>
        ),
        [item.question, pagesText],
    );

    useImperativeHandle(ref, () => ({
        getTooltipContent: () => {
            const nameElement = nameRef.current;
            const pagesElement = pagesRef.current;

            const isOverflowing =
                (nameElement && nameElement.scrollWidth > nameElement.clientWidth) ||
                (pagesElement && pagesElement.scrollWidth > pagesElement.clientWidth);

            return isOverflowing ? tooltipContent : null;
        },
    }));

    return (
        <div className="faq-search-item">
            <span ref={nameRef} className="faq-search-item__name">
                {item.question}
            </span>
            <span ref={pagesRef} className="faq-search-item__pages">
                {pagesText}
            </span>
        </div>
    );
});
