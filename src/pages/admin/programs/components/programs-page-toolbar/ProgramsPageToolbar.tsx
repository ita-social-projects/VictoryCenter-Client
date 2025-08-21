import { useCallback, useState } from 'react';
import PlusIcon from '../../../../../assets/icons/plus.svg';
import { Button } from '../../../../../components/admin/button/Button';
import { Select } from '../../../../../components/admin/select/Select';
import { SearchBar } from '../../../../../components/admin/search-bar/SearchBar';
import { ProgramSuggestionItem } from './program-suggestion-item/ProgramSuggestionItem';
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { ProgramsApi } from '../../../../../services/api/admin/programs/programs-api';
import { ProgramSuggestion } from '../../../../../types/admin/programs';
import { VisibilityStatus } from '../../../../../types/admin/common';
import {
    PaginationRequestParams,
    useEntitiesPaginationFetch,
} from '../../../../../hooks/admin/fetch/use-entities-pagination-fetch/useEntitiesPaginationFetch';
import './ProgramsPageToolbar.scss';

const SUGGESTIONS_PAGE_SIZE = 5;
const MIN_CHARACTERS_TO_SEARCH = 3;
const SEARCH_DELAY_MS = 100;

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
        entities: suggestions,
        isLoading: isSuggestionsLoading,
        hasMore: isSuggestionsHasMore,
        actions: suggestionsActions,
    } = useEntitiesPaginationFetch({
        fetchEntitiesHandler: getSuggestions,
        autoFetchDependencies: [currentSearchTerm],
        autoFetchDisabled: currentSearchTerm.length < MIN_CHARACTERS_TO_SEARCH,
        pageSize: SUGGESTIONS_PAGE_SIZE,
    });

    const onSearch = useCallback((query: string) => {
        setCurrentSearchTerm(query);
    }, []);

    const onSuggestionSelected = useCallback(
        (suggestion: ProgramSuggestion) => {
            onProgramSelect?.(suggestion.id);
            suggestionsActions.resetList();
            setCurrentSearchTerm('');
        },
        [onProgramSelect, suggestionsActions],
    );

    const handleSearchClear = useCallback(() => {
        suggestionsActions.resetList();
        onSearchClear?.();
    }, [onSearchClear, suggestionsActions]);

    return (
        <>
            <div className="programs-toolbar">
                <div className="programs-toolbar-search">
                    <SearchBar<ProgramSuggestion>
                        suggestions={suggestions}
                        onSuggestionSelect={onSuggestionSelected}
                        getSuggestionKey={(suggestion) => suggestion.id}
                        getSuggestionLabel={(suggestion) => suggestion.name}
                        renderSuggestionComponent={ProgramSuggestionItem}
                        onLoadMore={suggestionsActions.fetchMore}
                        hasMore={isSuggestionsHasMore}
                        isLoading={isSuggestionsLoading}
                        onQueryChange={onSearch}
                        onClear={handleSearchClear}
                        placeholder={PROGRAMS_TEXT.PLACEHOLDER.SEARCH_PROGRAMS}
                        notFoundMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                        minCharactersToSearch={MIN_CHARACTERS_TO_SEARCH}
                        searchDelayMs={SEARCH_DELAY_MS}
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
