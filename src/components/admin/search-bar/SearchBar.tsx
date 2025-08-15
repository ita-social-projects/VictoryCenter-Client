import React, { useState, useEffect, useRef, useCallback } from 'react';
import SearchIcon from '../../../assets/icons/la_search.svg';
import ClearIcon from '../../../assets/icons/remove-query.svg';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { useOnClickOutside } from '../../../hooks/common/use-on-click-outside/useOnClickOutside';
import { useInfiniteScroll } from '../../../hooks/common/use-infinite-scroll/useInfiniteScroll';
import { useDebouncedValueCallback } from '../../../hooks/common/use-debounced-value/useDebouncedValueCallback';
import { SuggestionWrapper, SuggestionContentRenderProps } from './suggestion-wrapper/SuggestionWrapper';
import { InlineLoader } from '../../common/inline-loader/InlineLoader';
import { Tooltip } from '../tooltip/Tooltip';
import './SearchBar.scss';

export interface SearchBarProps<T> {
    suggestions: T[];
    onSearch: (query: string) => void;
    onSuggestionSelect: (item: T) => void;
    getSuggestionKey: (item: T) => string | number;
    getSuggestionLabel: (item: T) => string;
    renderSuggestionItem?: (props: SuggestionContentRenderProps<T>) => React.ReactNode;
    onLoadMore: () => void;
    isLoading: boolean;
    hasMore: boolean;
    placeholder?: string;
    searchDelayMs?: number;
    minCharactersToSearch?: number;
    notFoundMessage?: string;
}

export const SearchBar = <T,>({
    suggestions,
    onSuggestionSelect,
    getSuggestionKey,
    getSuggestionLabel,
    renderSuggestionItem,
    onLoadMore,
    isLoading,
    hasMore,
    onSearch,
    placeholder = undefined,
    notFoundMessage = undefined,
    searchDelayMs = 300,
    minCharactersToSearch = 1,
}: SearchBarProps<T>) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const [tooltip, setTooltip] = useState<{
        isVisible: boolean;
        positioner: Element | null;
        content: React.ReactNode;
    }>({
        isVisible: false,
        positioner: null,
        content: '',
    });

    const tooltipRef = useRef(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const suggestionsListRef = useRef<HTMLUListElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleTooltipShow = useCallback((element: Element, content: React.ReactNode) => {
        setTooltip({
            isVisible: true,
            content: content,
            positioner: element,
        });
    }, []);

    const hideTooltip = useCallback(() => {
        setTooltip((prev) => ({ ...prev, isVisible: false }));
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = event.target.value;
        setSearchQuery(newQuery);
        setActiveIndex(-1);
        setDropdownVisible(newQuery.length >= minCharactersToSearch);
    };

    const handleItemSelect = useCallback(
        (item: T) => {
            setSearchQuery(getSuggestionLabel(item));
            onSuggestionSelect(item);
            hideTooltip();
            setDropdownVisible(false);
            setActiveIndex(-1);
        },
        [getSuggestionLabel, onSuggestionSelect, hideTooltip],
    );

    const handleClear = () => {
        setSearchQuery('');
        onSearch('');
        hideTooltip();
        setDropdownVisible(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((prevIndex) => (prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        } else if ((event.key === 'Enter' || event.key === ' ') && activeIndex >= 0) {
            event.preventDefault();
            handleItemSelect(suggestions[activeIndex]);
        } else if (event.key === 'Escape' || event.key === 'Tab') {
            setDropdownVisible(false);
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

    useDebouncedValueCallback({
        value: searchQuery,
        delay: searchDelayMs,
        disableWhen: searchQuery.length < minCharactersToSearch,
        callback: () => onSearch(searchQuery),
    });

    useOnClickOutside({
        ignoreClickRefs: [searchContainerRef],
        enableWhen: isDropdownVisible,
        onOutsideClick: () => {
            setDropdownVisible(false);
            setTooltip((prev) => ({ ...prev, isVisible: false }));
        },
    });

    const handleScroll = useInfiniteScroll({
        onReachBottom: onLoadMore,
        disableWhen: isLoading || !hasMore,
    });

    return (
        <div className="search-bar" ref={searchContainerRef}>
            <div className="search-bar__wrapper">
                <div className="search-bar__content">
                    <img src={SearchIcon} className="search-bar__icon" alt="search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-bar__input"
                        value={searchQuery}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setDropdownVisible(searchQuery.length >= minCharactersToSearch)}
                        placeholder={placeholder ?? COMMON_TEXT_ADMIN.FILTER.SEARCH_BY_NAME}
                        autoComplete="off"
                    />
                    {searchQuery.length > 0 && (
                        <button
                            className="search-bar__icon search-bar__icon--clear"
                            onClick={handleClear}
                            type="button"
                        >
                            <img src={ClearIcon} className="search-bar__icon" alt="clear-icon" />
                        </button>
                    )}
                </div>

                {isDropdownVisible && (
                    <div className="search-bar__suggestions" onScroll={handleScroll}>
                        <ul
                            className="search-bar__suggestions-list"
                            ref={suggestionsListRef}
                            onMouseLeave={hideTooltip}
                        >
                            {suggestions.length > 0
                                ? suggestions.map((item, index) => (
                                      <SuggestionWrapper
                                          key={getSuggestionKey(item)}
                                          item={item}
                                          isActive={index === activeIndex}
                                          onSelect={() => handleItemSelect(item)}
                                          onHover={() => setActiveIndex(index)}
                                          onShowTooltip={handleTooltipShow}
                                          onHideTooltip={hideTooltip}
                                          renderContent={renderSuggestionItem}
                                          getItemLabel={getSuggestionLabel}
                                      />
                                  ))
                                : !isLoading && <li className="search-bar__not-found">{notFoundMessage}</li>}
                            {isLoading && (
                                <li className="search-bar__loader-container">
                                    <InlineLoader />
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {tooltip.positioner && tooltip.isVisible && (
                <Tooltip
                    ref={tooltipRef}
                    position="bottom"
                    isRenderInPortal={true}
                    allowClickThrough={true}
                    portalPositioner={tooltip.positioner}
                    customMaxWidthInPixels={400}
                >
                    {tooltip.content}
                </Tooltip>
            )}
        </div>
    );
};
