import { useCallback, useEffect, useState } from 'react';
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/plus.svg';
import { Button } from '../../../../../components/admin/button/Button';
import { Select } from '../../../../../components/admin/select/Select';
import { SearchBar } from '../../../../../components/admin/search-bar/SearchBar';
import { ProgramSearchItem } from '../program-search-item/ProgramSearchItem';
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '../../../../../const/admin/common';
import { ProgramsApi } from '../../../../../services/api/admin/programs/programs-api';
import { ProgramSearchItemData } from '../../../../../types/admin/programs';
import { VisibilityStatus } from '../../../../../types/admin/common';
import {
    PaginationRequestParams,
    useDataPaginationFetch,
} from '../../../../../hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import './ProgramsPageToolbar.scss';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';

const SUGGESTIONS_PAGE_SIZE = 5;

export interface ProgramPageToolbarProps {
    statusFilterValue: VisibilityStatus | undefined;
    onStatusFilterChange: (categoryFilter: VisibilityStatus | undefined) => void;
    onAddProgram: () => void;
    onProgramSelect: (programId: number) => void;
    onSearchClear: () => void;
}

export const ProgramsPageToolbar = ({
    onStatusFilterChange,
    onAddProgram,
    onProgramSelect,
    onSearchClear,
    statusFilterValue,
}: ProgramPageToolbarProps) => {
    const [currentSearchTerm, setCurrentSearchTerm] = useState<string>('');
    const [localSearchItems, setLocalSearchItems] = useState<ProgramSearchItemData[]>([]);
    const client = useAdminClient();

    const getSearchItems = useCallback(
        async (params: PaginationRequestParams) => {
            return ProgramsApi.fetchProgramSearchItems(
                client,
                currentSearchTerm,
                params.offset as number,
                params.limit as number,
            );
        },
        [currentSearchTerm, client],
    );

    const {
        data: fetchedSearchItems,
        isLoading: isSearchItemsLoading,
        hasMore: isHasMoreSearchItems,
        fetchMore: fetchMoreSearchItems,
        resetList: resetSearchItemsList,
    } = useDataPaginationFetch<ProgramSearchItemData>({
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
        (suggestion: ProgramSearchItemData) => {
            onProgramSelect?.(suggestion.id);
            resetSearchItemsList();
            setLocalSearchItems([]);
            setCurrentSearchTerm('');
        },
        [onProgramSelect, resetSearchItemsList],
    );

    const handleSearchClear = useCallback(() => {
        resetSearchItemsList();
        setLocalSearchItems([]);
        setCurrentSearchTerm('');
        onSearchClear?.();
    }, [onSearchClear, resetSearchItemsList]);

    return (
        <>
            <div className="programs-toolbar">
                <div className="programs-toolbar-search">
                    <SearchBar<ProgramSearchItemData>
                        searchItems={localSearchItems}
                        onSearchItemSelect={onSuggestionSelected}
                        getSearchItemKey={(suggestion) => suggestion.id}
                        getSearchItemLabel={(suggestion) => suggestion.name}
                        renderSearchItemComponent={ProgramSearchItem}
                        onLoadMore={fetchMoreSearchItems}
                        hasMore={isHasMoreSearchItems}
                        isLoading={isSearchItemsLoading}
                        onQueryChange={onSearch}
                        onClear={handleSearchClear}
                        placeholder={PROGRAMS_TEXT.PLACEHOLDER.SEARCH_PROGRAMS}
                        notFoundMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                        minCharactersToSearch={UI_CONFIG.SEARCH_BAR.MIN_CHARACTERS_FOR_SEARCH}
                        searchDelayMs={UI_CONFIG.SEARCH_BAR.SEARCH_DELAY_MS}
                    />
                </div>
                <div className="programs-toolbar-actions">
                    <Select<VisibilityStatus | undefined>
                        value={statusFilterValue}
                        onValueChange={onStatusFilterChange}
                        data-testid="status-filter"
                    >
                        <Select.Option key={1} value={undefined} name={COMMON_TEXT_ADMIN.FILTER.STATUS.ALL} />
                        <Select.Option<VisibilityStatus>
                            key={2}
                            value={VisibilityStatus.Published}
                            name={COMMON_TEXT_ADMIN.FILTER.STATUS.PUBLISHED}
                        />
                        <Select.Option<VisibilityStatus>
                            key={3}
                            value={VisibilityStatus.Draft}
                            name={COMMON_TEXT_ADMIN.FILTER.STATUS.DRAFT}
                        />
                    </Select>
                    <Button onClick={onAddProgram} buttonStyle="primary" data-testid="add-program-button">
                        {PROGRAMS_TEXT.BUTTON.ADD_PROGRAM} <PlusIcon />
                    </Button>
                </div>
            </div>
        </>
    );
};
