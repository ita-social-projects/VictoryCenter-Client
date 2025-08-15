import React, { useCallback, useMemo, useRef, useState } from 'react';
import { TextSuggestionContent } from '../text-suggestion-item/TextSuggestionContent';
import classNames from 'classnames';
import './SuggestionWrapper.scss';

export interface SuggestionContentRenderProps<T> {
    item: T;
    isSuggestionActive: boolean;
    isSuggestionHovered: boolean;
    onShowTooltip: (content: React.ReactNode) => void;
}

export interface SuggestionWrapperProps<T> {
    item: T;
    isActive: boolean;
    onSelect: () => void;
    onHover: () => void;
    getItemLabel: (item: T) => string;
    renderContent?: (props: SuggestionContentRenderProps<T>) => React.ReactNode;
    onShowTooltip?: (element: HTMLElement, content: React.ReactNode) => void;
    onHideTooltip?: () => void;
}

export const SuggestionWrapper = <T,>({
    item,
    isActive,
    onSelect,
    onHover,
    onShowTooltip,
    onHideTooltip,
    renderContent,
    getItemLabel,
}: SuggestionWrapperProps<T>) => {
    const [isHovered, setIsHovered] = useState(false);
    const LIRef = useRef<HTMLLIElement>(null);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        onHover?.();
    }, [onHover]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        onHideTooltip?.();
    }, [onHideTooltip]);

    const handleShowTooltip = useCallback(
        (content: React.ReactNode) => {
            if (!LIRef.current) return;
            onShowTooltip?.(LIRef.current, content);
        },
        [onShowTooltip],
    );

    const content = useMemo(() => {
        return renderContent ? (
            renderContent({
                item: item,
                isSuggestionActive: isActive,
                isSuggestionHovered: isHovered,
                onShowTooltip: handleShowTooltip,
            } as SuggestionContentRenderProps<T>)
        ) : (
            <TextSuggestionContent label={getItemLabel(item)} isHovered={isHovered} onShowTooltip={handleShowTooltip} />
        );
    }, [renderContent, getItemLabel, item, isHovered, handleShowTooltip]);

    return (
        <li
            ref={LIRef}
            className={classNames('suggestion-wrapper', {
                'suggestion-wrapper--active': isActive || isHovered,
            })}
            onClick={onSelect}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {content}
        </li>
    );
};
