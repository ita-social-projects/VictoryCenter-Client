import { useCallback, useState } from 'react';
import { UI_CONFIG } from '@/const/admin/common';
import { AdminPanelToolbar } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { EventsApi } from '@/services/api/admin/events/events-api';
import { EventSearchItemData, ErrorState, EventsErrorType } from '@/types/admin/events';
import { PaginationRequestParams } from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { EVENTS_TEXT } from '@/const/admin/events';

export const EventsPageAdmin = () => {
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [error, setError] = useState<ErrorState>({ message: null, type: null });

    const client = useAdminClient();

    const setErrorState = useCallback((message: string, type: EventsErrorType) => setError({ message, type }), []);
    const { allLanguages, onLanguageChange, onTranslationStatusFilterChange } = useLocalizationToolkit({
        setErrorState,
    });

    const getEventSearchItems = useCallback(
        async (
            searchTerm: string,
            paginationRequest: PaginationRequestParams,
        ): Promise<PaginationResult<EventSearchItemData>> =>
            EventsApi.fetchEventSearchItems(
                client,
                searchTerm,
                paginationRequest.offset as number,
                paginationRequest.limit as number,
                paginationRequest.requestOptions?.cancellationSignal,
            ),
        [client],
    );

    // Toolbar handlers
    const onStatusFilterChange = useCallback((status: VisibilityStatus | undefined) => {
        setStatusFilter(status);
    }, []);

    return (
        <div className="programs-page-wrapper" data-testid="programs-page-content">
            <div className="programs-page-toolbar-container">
                <AdminPanelToolbar<EventSearchItemData>
                    getSearchItemKey={(item) => item.id}
                    getSearchItemLabel={(item) => item.name}
                    fetchSearchItems={getEventSearchItems}
                    placeholder={EVENTS_TEXT.PLACEHOLDER.SEARCH_EVENTS}
                    onSearchClear={() => null}
                    statusFilter={statusFilter}
                    onStatusFilterChange={onStatusFilterChange}
                    onAddItem={() => null}
                    AddItemButtonText={EVENTS_TEXT.BUTTON.ADD_EVENT}
                    onSuggestionSelect={() => null}
                    languages={allLanguages}
                    onLanguageChange={onLanguageChange}
                    onTranslationStatusFilterChange={onTranslationStatusFilterChange}
                    maxCharactersToSearch={UI_CONFIG.SEARCH_BAR.MAX_CHARACTERS_FOR_SEARCH.EVENTS}
                />
            </div>
            <div className="programs-page-list-container">
                {error.message && <div className="error-message">{error.message}</div>}
            </div>
        </div>
    );
};
