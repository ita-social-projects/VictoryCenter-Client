import React, { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import { ProgramSuggestion } from '../../../../../../types/admin/programs';
import { SuggestionContentRef } from '../../../../../../components/admin/search-bar/suggestion-wrapper/SuggestionWrapper';
import './ProgramSuggestionItem.scss';

export interface ProgramSuggestionItemProps {
    item: ProgramSuggestion;
}

export const ProgramSuggestionItem = forwardRef<SuggestionContentRef, ProgramSuggestionItemProps>(({ item }, ref) => {
    const nameRef = useRef<HTMLSpanElement>(null);
    const categoriesRef = useRef<HTMLSpanElement>(null);

    const categoriesText = useMemo(() => item.categories.join(', '), [item.categories]);

    const tooltipContent = useMemo(
        () => (
            <div className="program-suggestion-item-tooltip">
                <div className="program-suggestion-item-tooltip__name">{item.name}</div>
                <div className="program-suggestion-item-tooltip__categories">{categoriesText}</div>
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
        <div className="program-suggestion-item">
            <span ref={nameRef} className="program-suggestion-item__name">
                {item.name}
            </span>
            <span ref={categoriesRef} className="program-suggestion-item__categories">
                {categoriesText}
            </span>
        </div>
    );
});
