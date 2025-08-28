import { Button } from '../../../../../components/admin/button/Button';
import { SearchBar } from '../../../../../components/admin/search-bar/SearchBar';
import { StatusFilterDropdown } from '../../../../../components/admin/status-filter-dropdown/StatusFilterDropdown';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '../../../../../const/admin/common';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/plus.svg';
import './FaqPanelToolbar.scss';
import { useCallback, useEffect, useState } from 'react';
import { FaqSearchItemData } from '../../../../../types/admin/faq';
import {
    PaginationRequestParams,
    useDataPaginationFetch,
} from '../../../../../hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import { FaqApi } from '../../../../../services/api/admin/faq/faq-api';
import { FAQ_TEXT } from '../../../../../const/admin/faq';
import { FaqSearchItem } from './faq-search-item/FaqSearchItem';

const SUGGESTIONS_PAGE_SIZE = 5;

export interface FaqPanelToolbarProps {
    onStatusFilterChange: (statusFilter: VisibilityStatus | undefined) => void;
    onAddFaq: () => void;
    onFaqSelect: (faqId: number) => void;
}

export const FaqPanelToolbar = ({ onStatusFilterChange, onAddFaq, onFaqSelect }: FaqPanelToolbarProps) => {
    const [currentSearchTerm, setCurrentSearchTerm] = useState<string>('');
    const [localSearchItems, setLocalSearchItems] = useState<FaqSearchItemData[]>([]);

    const getSearchItems = useCallback(
        async (params: PaginationRequestParams) => {
            return FaqApi.getSearchItems(currentSearchTerm, params.offset, params.limit, params.requestOptions);
        },
        [currentSearchTerm],
    );

    const {
        data: fetchedSearchItems,
        isLoading: isSearchItemsLoading,
        hasMore: isHasMoreSearchItems,
        fetchMore: fetchMoreSearchItems,
        resetList: resetSearchItemsList,
    } = useDataPaginationFetch<FaqSearchItemData>({
        initialData: [],
        fetchHandler: getSearchItems,
        autoFetchDependencies: [currentSearchTerm],
        autoFetchDisabled: currentSearchTerm.length < UI_CONFIG.SEARCH_BAR.MIN_CHARACTERS_FOR_SEARCH,
        pageSize: SUGGESTIONS_PAGE_SIZE,
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
        (suggestion: FaqSearchItemData) => {
            onFaqSelect?.(suggestion.id);
            resetSearchItemsList();
            setLocalSearchItems([]);
            setCurrentSearchTerm('');
        },
        [onFaqSelect, resetSearchItemsList],
    );

    const handleSearchClear = useCallback(() => {
        resetSearchItemsList();
        setLocalSearchItems([]);
        setCurrentSearchTerm('');
    }, [resetSearchItemsList]);

    return (
        <>
            <div className="faq-toolbar">
                <div className="faq-toolbar-search">
                    <SearchBar<FaqSearchItemData>
                        searchItems={localSearchItems}
                        onSearchItemSelect={onSuggestionSelected}
                        getSearchItemKey={(suggestion) => suggestion.id}
                        getSearchItemLabel={(suggestion) => suggestion.question}
                        renderSearchItemComponent={FaqSearchItem}
                        onLoadMore={fetchMoreSearchItems}
                        hasMore={isHasMoreSearchItems}
                        isLoading={isSearchItemsLoading}
                        onQueryChange={onSearch}
                        onClear={handleSearchClear}
                        placeholder={FAQ_TEXT.PLACEHOLDER.SEARCH_FAQ}
                        notFoundMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                        minCharactersToSearch={UI_CONFIG.SEARCH_BAR.MIN_CHARACTERS_FOR_SEARCH}
                        searchDelayMs={UI_CONFIG.SEARCH_BAR.SEARCH_DELAY_MS}
                    />
                </div>
                <div className="faq-toolbar-actions">
                    <StatusFilterDropdown onStatusFilterChange={onStatusFilterChange} />
                    <Button onClick={onAddFaq} buttonStyle="primary" data-testid="add-faq-button">
                        {FAQ_TEXT.BUTTON.ADD_FAQ} <PlusIcon />
                    </Button>
                </div>
            </div>
        </>
    );
};
