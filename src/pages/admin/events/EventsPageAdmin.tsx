import { useCallback, useState, useMemo, useEffect } from 'react';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '@/const/admin/common';
import { AdminPanelToolbar } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { EventsApi } from '@/services/api/admin/events/events-api';
import { EventSearchItemData, ErrorState, EventsErrorType } from '@/types/admin/events';
import { PaginationRequestParams } from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { EVENTS_TEXT } from '@/const/admin/events';
import './EventsPageAdmin.scss';
import { useModalsState } from '@/hooks/admin/use-modals-state/useModalsState';
import { CategoryBar, ContextMenuOption } from '@/components/admin/category-bar/CategoryBar';
import { EventCategory } from '@/types/admin/event-category';
import { EventsNews } from '@/types/admin/events-news';
import { EventsPageModals } from './event-page-modals/EventsPageModals';
import { EventCategoriesApi } from './event-categories/event-categories-api';

export const EventsPageAdmin = () => {
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [error, setError] = useState<ErrorState>({ message: null, type: null });
    const [categories, setCategories] = useState<EventCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
    const modalsStateControl = useModalsState<EventsNews>();
    const { openModalActions } = modalsStateControl;

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

    // Category handlers
    const onContextMenuOptionSelected = useCallback(
        (id: string) => {
            if (id === 'add') {
                openModalActions.openAddCategoryModal();
            } else if (id === 'edit') {
                openModalActions.openEditCategoryModal();
            }
        },
        [openModalActions],
    );

    const categoryBarContextMenuOptions: ContextMenuOption[] = useMemo(
        () => [
            { id: 'add', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_CATEGORY },
            { id: 'edit', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.EDIT_CATEGORY },
        ],
        [],
    );

    const fetchCategories = useCallback(async () => {
        try {
            const fetchedCategories = await EventCategoriesApi.getAll(client);

            setCategories(fetchedCategories);
        } catch {
            setErrorState(COMMON_TEXT_ADMIN.CATEGORIES.MESSAGE.FAIL_TO_FETCH_CATEGORIES, 'categories');
        }
    }, [client, setErrorState]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddEvent = useCallback(() => {
        openModalActions.openAddItemModal();
    }, [openModalActions]);

    return (
        <div className="events-page-wrapper" data-testid="events-page-content">
            <div className="events-page-toolbar-container">
                <AdminPanelToolbar<EventSearchItemData>
                    getSearchItemKey={(item) => item.id}
                    getSearchItemLabel={(item) => item.name}
                    fetchSearchItems={getEventSearchItems}
                    placeholder={EVENTS_TEXT.PLACEHOLDER.SEARCH_EVENTS}
                    onSearchClear={() => null}
                    statusFilter={statusFilter}
                    onStatusFilterChange={onStatusFilterChange}
                    onAddItem={handleAddEvent}
                    AddItemButtonText={EVENTS_TEXT.BUTTON.ADD_EVENT}
                    onSuggestionSelect={() => null}
                    languages={allLanguages}
                    onLanguageChange={onLanguageChange}
                    onTranslationStatusFilterChange={onTranslationStatusFilterChange}
                    maxCharactersToSearch={UI_CONFIG.SEARCH_BAR.MAX_CHARACTERS_FOR_SEARCH.EVENTS}
                />
            </div>
            <div className="events-page-list-container">
                <CategoryBar<EventCategory>
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                    getCategoryDisplayName={(category) => category.name}
                    getCategoryKey={(category) => category.id}
                    displayContextMenuButton={true}
                    contextMenuOptions={categoryBarContextMenuOptions}
                    onContextMenuOptionSelected={onContextMenuOptionSelected}
                />
                {error.message && <div className="error-message">{error.message}</div>}
            </div>

            <EventsPageModals
                modalsStateControl={modalsStateControl}
                categories={categories}
                currentCategory={selectedCategory}
            />
        </div>
    );
};
