import { useCallback, useEffect, useState } from 'react';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import {
    SearchItemContentRef,
    SearchItemContentRenderProps,
} from '@/components/admin/search-bar/search-item-wrapper/SearchItemWrapper';
import {
    PaginationRequestParams,
    useDataPaginationFetch,
} from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '@/const/admin/common';
import { SearchBar } from '@/components/admin/search-bar/SearchBar';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { StatusFilterDropdown } from '@/components/admin/status-filter-dropdown/StatusFilterDropdown';
import { Button } from '@/components/admin/button/Button';
import {
    LocalizationToolkit,
    LocalizationToolkitProps,
} from '@/components/admin/localization-toolkit/LocalizationToolkit';
import './AdminPageToolbar.scss';

const DEFAULT_PAGE_SIZE = 5;

export interface AdminPanelToolbarProps<T> extends LocalizationToolkitProps {
    getSearchItemKey: (item: T) => string | number;
    getSearchItemLabel: (item: T) => string;
    fetchSearchItems: (searchTerm: string, requestOptions: PaginationRequestParams) => Promise<PaginationResult<T>>;
    renderSearchItemComponent?: React.ForwardRefExoticComponent<
        SearchItemContentRenderProps<T> & React.RefAttributes<SearchItemContentRef>
    >;
    placeholder?: string;
    searchPageSize?: number;
    suggestionsNotFoundMessage?: string;
    onSearchClear?: () => void;
    statusFilter: VisibilityStatus | undefined;
    onStatusFilterChange: (statusFilter: VisibilityStatus | undefined) => void;
    onAddItem: () => void;
    AddItemButtonText: string;
    onSuggestionSelect: (itemKey: string | number) => void;
}

export const AdminPanelToolbar = <T,>({
    getSearchItemKey,
    getSearchItemLabel,
    fetchSearchItems,
    renderSearchItemComponent,
    placeholder,
    searchPageSize = DEFAULT_PAGE_SIZE,
    suggestionsNotFoundMessage = COMMON_TEXT_ADMIN.LIST.NOT_FOUND,
    onSearchClear,
    statusFilter,
    onStatusFilterChange,
    onAddItem,
    AddItemButtonText,
    onSuggestionSelect,
    languages,
    onLanguageChange,
    onTranslationStatusFilterChange,
}: AdminPanelToolbarProps<T>) => {
    const [currentSearchTerm, setCurrentSearchTerm] = useState<string>('');
    const [localSearchItems, setLocalSearchItems] = useState<T[]>([]);

    const getSearchItems = useCallback(
        async (params: PaginationRequestParams) => {
            return fetchSearchItems(currentSearchTerm, params);
        },
        [currentSearchTerm, fetchSearchItems],
    );

    const {
        data: fetchedSearchItems,
        isLoading: isSearchItemsLoading,
        hasMore: isHasMoreSearchItems,
        fetchMore: fetchMoreSearchItems,
        resetList: resetSearchItemsList,
    } = useDataPaginationFetch<T>({
        initialData: [],
        fetchHandler: getSearchItems,
        autoFetchDependencies: [currentSearchTerm],
        autoFetchDisabled: currentSearchTerm.length < UI_CONFIG.SEARCH_BAR.MIN_CHARACTERS_FOR_SEARCH,
        pageSize: searchPageSize,
    });

    const onSearch = useCallback((query: string) => {
        setCurrentSearchTerm(query);
        if (query.length < UI_CONFIG.SEARCH_BAR.MIN_CHARACTERS_FOR_SEARCH) {
            setLocalSearchItems([]);
        }
    }, []);

    useEffect(() => {
        setLocalSearchItems(fetchedSearchItems);
    }, [fetchedSearchItems]);

    const onSuggestionSelected = useCallback(
        (suggestion: T) => {
            onSuggestionSelect(getSearchItemKey(suggestion));
            resetSearchItemsList();
            setLocalSearchItems([]);
            setCurrentSearchTerm('');
        },
        [onSuggestionSelect, resetSearchItemsList, getSearchItemKey],
    );

    const handleSearchClear = useCallback(() => {
        resetSearchItemsList();
        setLocalSearchItems([]);
        setCurrentSearchTerm('');
        onSearchClear?.();
    }, [onSearchClear, resetSearchItemsList]);

    return (
        <div className="admin-panel-toolbar">
            <div className="admin-panel-toolbar-search">
                <SearchBar<T>
                    searchItems={localSearchItems}
                    onSearchItemSelect={onSuggestionSelected}
                    getSearchItemKey={getSearchItemKey}
                    getSearchItemLabel={getSearchItemLabel}
                    renderSearchItemComponent={renderSearchItemComponent}
                    onLoadMore={fetchMoreSearchItems}
                    hasMore={isHasMoreSearchItems}
                    isLoading={isSearchItemsLoading}
                    onQueryChange={onSearch}
                    onClear={handleSearchClear}
                    placeholder={placeholder}
                    notFoundMessage={suggestionsNotFoundMessage}
                    minCharactersToSearch={UI_CONFIG.SEARCH_BAR.MIN_CHARACTERS_FOR_SEARCH}
                    searchDelayMs={UI_CONFIG.SEARCH_BAR.SEARCH_DELAY_MS}
                />
            </div>

            <div className="admin-panel-toolbar-actions">
                <LocalizationToolkit
                    languages={languages}
                    onLanguageChange={onLanguageChange}
                    onTranslationStatusFilterChange={onTranslationStatusFilterChange}
                />
                <StatusFilterDropdown value={statusFilter} onStatusFilterChange={onStatusFilterChange} />
                <Button onClick={onAddItem} buttonStyle="primary">
                    {AddItemButtonText} <PlusIcon />
                </Button>
            </div>
        </div>
    );
};
