import React, { useRef, useCallback, useMemo } from 'react';
import { ProgramSuggestion } from '../../../../../../types/admin/programs';
import { useObserveElementSize } from '../../../../../../hooks/common/use-observe-element-size/useObserveElementSize';
import './ProgramSuggestionItem.scss';

export interface ProgramSuggestionItemProps {
    item: ProgramSuggestion;
    isHovered: boolean;
    onShowTooltip: (content: React.ReactNode | null) => void;
}

export const ProgramSuggestionItem = React.memo(({ item, isHovered, onShowTooltip }: ProgramSuggestionItemProps) => {
    const nameRef = useRef<HTMLSpanElement>(null);
    const categoriesRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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

    const showTooltipIfNeeded = useCallback(() => {
        const nameElement = nameRef.current;
        const categoriesElement = categoriesRef.current;

        const isOverflowing =
            (nameElement && nameElement.scrollWidth > nameElement.clientWidth) ||
            (categoriesElement && categoriesElement.scrollWidth > categoriesElement.clientWidth);

        onShowTooltip(isOverflowing ? tooltipContent : null);
    }, [onShowTooltip, tooltipContent]);

    useObserveElementSize({
        observableElement: containerRef,
        onSizeChanged: showTooltipIfNeeded,
        disableWhen: !isHovered,
    });

    return (
        <div ref={containerRef} className="program-suggestion-item">
            <span ref={nameRef} className="program-suggestion-item__name">
                {item.name}
            </span>
            <span ref={categoriesRef} className="program-suggestion-item__categories">
                {categoriesText}
            </span>
        </div>
    );
});
