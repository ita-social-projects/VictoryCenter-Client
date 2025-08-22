import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { TextSearchItem } from '../text-search-item/TextSearchItem';
import classNames from 'classnames';
import './SearchItemWrapper.scss';

export interface SearchItemContentRef {
    getTooltipContent: () => React.ReactNode | null;
}

export interface SearchItemContentRenderProps<T> {
    item: T;
    isSuggestionActive: boolean;
    isSuggestionHovered: boolean;
}

export type SearchItemWrapperRef = SearchItemContentRef;

export interface SearchItemWrapperProps<T> {
    item: T;
    isActive: boolean;
    onSelect: () => void;
    onHover: (element: HTMLLIElement) => void;
    getItemLabel: (item: T) => string;
    renderContent?: React.ForwardRefExoticComponent<
        SearchItemContentRenderProps<T> & React.RefAttributes<SearchItemContentRef>
    >;
    onMouseLeave?: () => void;
}

function SearchItemWrapperInner<T>(
    {
        item,
        isActive,
        onSelect,
        onHover,
        onMouseLeave,
        renderContent: RenderContentComponent,
        getItemLabel,
    }: SearchItemWrapperProps<T>,
    ref: React.Ref<SearchItemWrapperRef>,
) {
    const [isHovered, setIsHovered] = useState(false);
    const liRef = useRef<HTMLLIElement>(null);
    const contentRef = useRef<SearchItemContentRef>(null);

    useImperativeHandle(ref, () => ({
        getTooltipContent: () => contentRef.current?.getTooltipContent() ?? null,
    }));

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (liRef.current) {
            onHover?.(liRef.current);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        onMouseLeave?.();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect();
        }
    };

    const contentProps: SearchItemContentRenderProps<T> = {
        item,
        isSuggestionActive: isActive,
        isSuggestionHovered: isHovered,
    };

    return (
        <li
            ref={liRef}
            className={classNames('search-item-wrapper', {
                'search-item-wrapper--active': isActive || isHovered,
            })}
            onClick={onSelect}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {RenderContentComponent ? (
                <RenderContentComponent {...contentProps} ref={contentRef} />
            ) : (
                <TextSearchItem label={getItemLabel(item)} ref={contentRef} />
            )}
        </li>
    );
}

export const SearchItemWrapper = forwardRef(SearchItemWrapperInner) as <T>(
    props: SearchItemWrapperProps<T> & {
        ref?: React.Ref<SearchItemWrapperRef>;
    },
) => React.ReactElement;
