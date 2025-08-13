import React, { useRef, useState } from 'react';
import { TextSuggestionContent } from '../text-suggestion-item/TextSuggestionContent';
import classNames from 'classnames';
import './SuggestionWrapper.scss';

export interface SuggestionContentRenderProps<T> {
    item: T;
    isActive: boolean;
    isHovered: boolean;
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
    const itemRef = useRef<HTMLLIElement>(null);

    const handleMouseEnter = () => {
        onHover();
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        onHideTooltip?.();
    };

    const handleShowTooltip = (content: React.ReactNode) => {
        if (!itemRef.current) return;
        onShowTooltip?.(itemRef.current, content);
    };

    const renderProps: SuggestionContentRenderProps<T> = {
        item,
        isActive,
        isHovered,
        onShowTooltip: handleShowTooltip,
    };

    const content = renderContent ? (
        renderContent(renderProps)
    ) : (
        <TextSuggestionContent label={getItemLabel(item)} isHovered={isHovered} onShowTooltip={handleShowTooltip} />
    );

    return (
        <li
            ref={itemRef}
            className={classNames('suggestion-wrapper', {
                'suggestion-wrapper-active': isActive,
            })}
            onClick={onSelect}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {content}
        </li>
    );
};
