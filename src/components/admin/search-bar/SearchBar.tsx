import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReactComponent as SearchIcon } from '../../../assets/icons/la_search.svg';
import { ReactComponent as ClearIcon } from '../../../assets/icons/remove-query.svg';
import { Tooltip } from '../tooltip/Tooltip';
import { InlineLoader } from '../../common/inline-loader/InlineLoader';
import { useOnClickOutside } from '../../../hooks/common/use-on-click-outside/useOnClickOutside';
import { useScrollHandler } from '../../../hooks/common/use-scroll-handler/useScrollHandler';
import { useDebouncedValueCallback } from '../../../hooks/common/use-debounced-value-callback/useDebouncedValueCallback';
import { useObserveElementSize } from '../../../hooks/common/use-observe-element-size/useObserveElementSize';
import { useContainerSizeFromChildren } from '../../../hooks/common/use-container-size-from-children/useContainerSizeFromChildren';
import {
    SearchItemWrapper,
    SearchItemContentRenderProps,
    SearchItemWrapperRef,
    SearchItemContentRef,
} from './search-item-wrapper/SearchItemWrapper';
import './SearchBar.scss';

export const TOOLTIP_WIDTH_MULTIPLY = 1.5;

export interface SearchBarProps<T> {
    searchItems: T[];
    onQueryChange: (query: string) => void;
    onSearchItemSelect: (item: T) => void;
    getSearchItemKey: (item: T) => string | number;
    getSearchItemLabel: (item: T) => string;
    renderSearchItemComponent?: React.ForwardRefExoticComponent<
        SearchItemContentRenderProps<T> & React.RefAttributes<SearchItemContentRef>
    >;
    onLoadMore: () => void;
    isLoading: boolean;
    hasMore: boolean;
    placeholder?: string;
    searchDelayMs?: number;
    minCharactersToSearch?: number;
    onClear?: () => void;
    notFoundMessage?: string;
}

export interface TooltipState {
    isVisible: boolean;
    positioner: Element | null;
    content: React.ReactNode | null;
}

export const SearchBar = <T,>({
    searchItems,
    onSearchItemSelect,
    getSearchItemKey,
    getSearchItemLabel,
    renderSearchItemComponent,
    onLoadMore,
    isLoading,
    hasMore,
    onQueryChange,
    onClear,
    placeholder = 'Search...',
    notFoundMessage = 'Nothing found',
    searchDelayMs = 300,
    minCharactersToSearch = 1,
}: SearchBarProps<T>) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedValue, setDebouncedValue] = useState('');
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [tooltipState, setTooltipState] = useState<TooltipState>({
        isVisible: false,
        positioner: null,
        content: null,
    });

    const searchContainerRef = useRef<HTMLDivElement>(null);
    const suggestionsListRef = useRef<HTMLUListElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionRefs = useRef<Map<string | number, React.RefObject<SearchItemWrapperRef | null>>>(new Map());

    const hideTooltip = useCallback(() => {
        setTooltipState({ content: null, positioner: null, isVisible: false });
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = event.target.value;
        setSearchQuery(newQuery);
        setDebouncedValue(newQuery);
        setActiveIndex(-1);
        setDropdownVisible(newQuery.length >= minCharactersToSearch);
    };

    const handleItemHover = useCallback(
        (key: string | number, element: HTMLElement) => {
            const suggestionRef = suggestionRefs.current.get(key);
            if (!suggestionRef || !suggestionRef.current) {
                return;
            }

            const tooltipContent = suggestionRef.current.getTooltipContent();

            if (tooltipContent) {
                setTooltipState({
                    isVisible: true,
                    content: tooltipContent,
                    positioner: element,
                });
            } else {
                hideTooltip();
            }
        },
        [hideTooltip],
    );

    const handleItemSelect = useCallback(
        (item: T) => {
            const label = getSearchItemLabel(item);
            setSearchQuery(label);
            onSearchItemSelect(item);
            hideTooltip();
            setDropdownVisible(false);
            setActiveIndex(-1);
        },
        [getSearchItemLabel, onSearchItemSelect, hideTooltip],
    );

    const handleClickOutside = useCallback(() => {
        setDropdownVisible(false);
        setActiveIndex(-1);
        setTooltipState((prev) => ({ ...prev, isVisible: false }));
    }, []);

    const handleClear = () => {
        setSearchQuery('');
        setDebouncedValue('');
        setDropdownVisible(false);
        setActiveIndex(-1);
        hideTooltip();
        onQueryChange('');
        onClear?.();
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (searchItems.length === 0) {
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((prevIndex) => {
                const maxIndex = searchItems.length - 1;
                return prevIndex < maxIndex ? prevIndex + 1 : prevIndex;
            });
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((prevIndex) => {
                return prevIndex > 0 ? prevIndex - 1 : 0;
            });
        } else if (event.key === 'Enter' && activeIndex >= 0 && activeIndex < searchItems.length) {
            event.preventDefault();
            handleItemSelect(searchItems[activeIndex]);
        } else if (event.key === 'Escape') {
            setDropdownVisible(false);
            setActiveIndex(-1);
        }
    };

    useEffect(() => {
        if (activeIndex >= 0 && suggestionsListRef.current) {
            const activeItem = suggestionsListRef.current.children[activeIndex] as HTMLLIElement;
            if (activeItem) {
                activeItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
    }, [activeIndex]);

    useEffect(() => {
        if (tooltipState.positioner && !document.body.contains(tooltipState.positioner)) {
            hideTooltip();
        }
    }, [searchItems, tooltipState.positioner, hideTooltip]);

    useDebouncedValueCallback({
        value: debouncedValue,
        delayMs: searchDelayMs,
        callback: onQueryChange,
        isDisabled: debouncedValue.length < minCharactersToSearch,
    });

    useOnClickOutside({
        ignoreClickRefs: [searchContainerRef],
        onOutsideClick: handleClickOutside,
        isDisabled: !isDropdownVisible,
    });

    const { handleScroll: handleSuggestionsScroll } = useScrollHandler({
        onReachBottom: onLoadMore,
        isDisabled: isLoading || !hasMore,
    });

    const { width: tooltipMaxWidth } = useObserveElementSize({
        observableElement: searchContainerRef,
    });

    const { calculatedSize: dropdownMaxHeight } = useContainerSizeFromChildren({
        elementsContainerRef: suggestionsListRef,
        targetVisibleElementsCount: 4.5,
        calculationStrategy: 'basedOnFirstElement',
        calculationDimension: 'height',
        dependencies: [searchItems],
        isDisabledAfterFirstSuccess: true,
    });

    suggestionRefs.current.clear();
    searchItems.forEach((item) => {
        const key = getSearchItemKey(item);
        suggestionRefs.current.set(key, React.createRef<SearchItemWrapperRef>());
    });

    const isShowClearButton = searchQuery.length > 0;
    const isShowNotFoundMessage =
        !isLoading && searchItems.length === 0 && debouncedValue.length >= minCharactersToSearch;
    const isShowTooltip = !!tooltipState.positioner && tooltipState.isVisible && !!tooltipState.content;

    return (
        <div className="search-bar" ref={searchContainerRef}>
            <div className="search-bar__wrapper">
                <div className="search-bar__content">
                    <SearchIcon className="search-bar__icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-bar__input"
                        value={searchQuery}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setDropdownVisible(searchQuery.length >= minCharactersToSearch)}
                        placeholder={placeholder}
                        autoComplete="off"
                    />
                    {isShowClearButton && (
                        <button
                            className="search-bar__icon search-bar__icon--clear"
                            onClick={handleClear}
                            type="button"
                        >
                            <ClearIcon className="search-bar__icon" />
                        </button>
                    )}
                </div>

                {isDropdownVisible && (
                    <div
                        className="search-bar__suggestions"
                        onScroll={handleSuggestionsScroll}
                        style={{ maxHeight: dropdownMaxHeight ? `${dropdownMaxHeight}px` : 'none' }}
                    >
                        <ul
                            className="search-bar__suggestions-list"
                            ref={suggestionsListRef}
                            onMouseLeave={hideTooltip}
                        >
                            {searchItems.map((item, index) => {
                                const key = getSearchItemKey(item);
                                return (
                                    <SearchItemWrapper<T>
                                        ref={suggestionRefs.current.get(key)}
                                        key={key}
                                        item={item}
                                        isActive={index === activeIndex}
                                        onSelect={() => handleItemSelect(item)}
                                        onHover={(element) => {
                                            setActiveIndex(index);
                                            handleItemHover(key, element);
                                        }}
                                        renderContent={renderSearchItemComponent}
                                        getItemLabel={getSearchItemLabel}
                                    />
                                );
                            })}
                        </ul>
                        {isShowNotFoundMessage && <div className="search-bar__not-found">{notFoundMessage}</div>}
                        {isLoading && (
                            <div className="search-bar__loader-container">
                                <InlineLoader />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isShowTooltip && (
                <Tooltip
                    position="bottom"
                    isRenderInPortal={true}
                    allowClickThrough={true}
                    portalPositioner={tooltipState.positioner!}
                    customMaxWidthInPixels={tooltipMaxWidth * TOOLTIP_WIDTH_MULTIPLY}
                >
                    {tooltipState.content}
                </Tooltip>
            )}
        </div>
    );
};
