import { useCallback, useEffect, useState } from 'react';
import PlusIcon from '../../../../../assets/icons/plus.svg';
import { Button } from '../../../../../components/admin/button/Button';
import { Select } from '../../../../../components/admin/select/Select';
import { SearchBar } from '../../../../../components/admin/search-bar/SearchBar';
import { ProgramSearchItem } from './program-suggestion-item/ProgramSearchItem';
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '../../../../../const/admin/common';
import { ProgramsApi } from '../../../../../services/api/admin/programs/programs-api';
import { ProgramSuggestion } from '../../../../../types/admin/programs';
import { VisibilityStatus } from '../../../../../types/admin/common';
import {
    PaginationRequestParams,
    useDataPaginationFetch,
} from '../../../../../hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import './ProgramsPageToolbar.scss';

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
    const [localSuggestions, setLocalSuggestions] = useState<ProgramSuggestion[]>([]);

    const getSuggestions = useCallback(
        async (params: PaginationRequestParams) => {
            return ProgramsApi.fetchProgramSuggestions(
                currentSearchTerm,
                params.offset,
                params.limit,
                params.requestOptions,
            );
        },
        [currentSearchTerm],
    );

    const {
        data: fetchedSuggestions,
        isLoading: isSuggestionsLoading,
        hasMore: isSuggestionsHasMore,
        fetchMore: fetchMoreSuggestions,
        resetList: resetSuggestionsList,
    } = useDataPaginationFetch<ProgramSuggestion>({
        initialData: [],
        fetchHandler: getSuggestions,
        autoFetchDependencies: [currentSearchTerm],
        autoFetchDisabled: currentSearchTerm.length < UI_CONFIG.SEARCH_BAR.MIN_CHARACTERS_FOR_SEARCH,
        pageSize: SUGGESTIONS_PAGE_SIZE,
    });

    // Sync fetched suggestions with local state
    const onSearch = useCallback((query: string) => {
        setCurrentSearchTerm(query);
        if (query.length < UI_CONFIG.SEARCH_BAR.MIN_CHARACTERS_FOR_SEARCH) {
            setLocalSuggestions([]);
        }
    }, []);

    useEffect(() => {
        setLocalSuggestions(fetchedSuggestions);
    }, [fetchedSuggestions]);

    const onSuggestionSelected = useCallback(
        (suggestion: ProgramSuggestion) => {
            onProgramSelect?.(suggestion.id);
            resetSuggestionsList();
            setLocalSuggestions([]);
            setCurrentSearchTerm('');
        },
        [onProgramSelect, resetSuggestionsList],
    );

    const handleSearchClear = useCallback(() => {
        resetSuggestionsList();
        setLocalSuggestions([]);
        setCurrentSearchTerm('');
        onSearchClear?.();
    }, [onSearchClear, resetSuggestionsList]);

    return (
        <>
            <div className="programs-toolbar">
                <div className="programs-toolbar-search">
                    <SearchBar<ProgramSuggestion>
                        suggestions={localSuggestions}
                        onSuggestionSelect={onSuggestionSelected}
                        getSuggestionKey={(suggestion) => suggestion.id}
                        getSuggestionLabel={(suggestion) => suggestion.name}
                        renderSuggestionComponent={ProgramSearchItem}
                        onLoadMore={fetchMoreSuggestions}
                        hasMore={isSuggestionsHasMore}
                        isLoading={isSuggestionsLoading}
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
                        {PROGRAMS_TEXT.BUTTON.ADD_PROGRAM} <img src={PlusIcon} alt="plus" />
                    </Button>
                </div>
            </div>
        </>
    );
};
