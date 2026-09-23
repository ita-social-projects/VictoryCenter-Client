import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPanelToolbar } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { CategoryBar, ContextMenuOption } from '@/components/admin/category-bar/CategoryBar';
import { EventsPageModals } from './event-page-modals/EventsPageModals';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { PaginationRequestParams } from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { useModalsState } from '@/hooks/admin/use-modals-state/useModalsState';
import { EventsApi } from '@/services/api/admin/events/events-api';
import { EventCategoriesApi } from '@/services/api/admin/events/event-categories-api';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import {
    EventSearchItemData,
    ErrorState,
    EventsErrorType,
    EventsIntroSectionDto,
    EventsIntroSectionUpdateField,
} from '@/types/admin/events';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { EventCategoryDto } from '@/types/admin/event-category';
import { EventsNews } from '@/types/admin/events-news';
import { EVENTS_TEXT } from '@/const/admin/events';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '@/const/admin/common';
import { LocalizationStatuses } from '@/components/admin/localization-statuses/LocalizationStatuses';
import { EditableHeaderSection, EditableHeaderSectionId } from './editable-header-section/EditableHeaderSection';
import './EventsPageAdmin.scss';

const introSectionFieldById: Record<EditableHeaderSectionId, EventsIntroSectionUpdateField> = {
    [EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID]: 'pageDescription',
    [EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID]: 'eventsBlockTitle',
};

export const EventsPageAdmin = () => {
    const [editingSectionId, setEditingSectionId] = useState<EditableHeaderSectionId | null>(null);
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [error, setError] = useState<ErrorState>({ message: null, type: null });
    const [selectedCategory, setSelectedCategory] = useState<EventCategoryDto | null>(null);

    const [eventsIntroSection, setEventsIntroSection] = useState<EventsIntroSectionDto | null>(null);
    const [eventsIntroDraft, setEventsIntroDraft] = useState<EventsIntroSectionDto | null>(null);
    const [isEventsIntroSectionLoading, setIsEventsIntroSectionLoading] = useState(true);
    const [isEventsIntroSectionPublishing, setIsEventsIntroSectionPublishing] = useState(false);
    const modalsStateControl = useModalsState<EventsNews>();
    const { openModalActions } = modalsStateControl;

    const client = useAdminClient();

    const setErrorState = useCallback((message: string, type: EventsErrorType) => setError({ message, type }), []);

    const { allLanguages, translationLanguages, selectedLanguage, onLanguageChange, onTranslationStatusFilterChange } =
        useLocalizationToolkit({
            setErrorState,
        });

    const getEventCategories = useCallback(async () => {
        const fetchedCategories = await EventCategoriesApi.getAll(client);
        return fetchedCategories;
    }, [client]);

    const {
        data: categories,
        error: categoriesError,
        setData: updateCategories,
    } = useDataFetch<EventCategoryDto[]>({
        initialData: [],
        fetchHandler: getEventCategories,
        autoFetchDependencies: [],
        autoFetchDisabled: false,
    });

    useEffect(() => {
        if (categoriesError) {
            setErrorState(COMMON_TEXT_ADMIN.CATEGORIES.MESSAGE.FAIL_TO_FETCH_CATEGORIES, 'categories');
        }
    }, [categoriesError, setErrorState]);

    useEffect(() => {
        if (!selectedCategory && categories && categories.length > 0) {
            setSelectedCategory(categories[0]);
        }
    }, [categories, selectedCategory]);

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

    const onStatusFilterChange = useCallback((status: VisibilityStatus | undefined) => {
        setStatusFilter(status);
    }, []);

    const onContextMenuOptionSelected = useCallback(
        (id: string) => {
            if (id === 'add') {
                openModalActions.openAddCategoryModal();
            } else if (id === 'edit') {
                openModalActions.openEditCategoryModal();
            } else if (id === 'delete') {
                openModalActions.openDeleteCategoryModal();
            }
        },
        [openModalActions],
    );

    const categoryBarContextMenuOptions: ContextMenuOption[] = useMemo(
        () => [
            { id: 'add', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_CATEGORY },
            { id: 'edit', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.EDIT_CATEGORY },
            { id: 'delete', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.DELETE_CATEGORY },
        ],
        [],
    );

    const handleAddCategory = useCallback(
        (newCategory: EventCategoryDto) => {
            updateCategories((prev) => [...prev, newCategory]);
        },
        [updateCategories],
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

    useEffect(() => {
        const fetchEventsIntroSection = async () => {
            try {
                const introSection = await EventsApi.getEventsIntroSection(client);
                setEventsIntroSection(introSection);
                setEventsIntroDraft(introSection);
            } catch {
                setErrorState(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_FETCH_DATA, 'events');
            } finally {
                setIsEventsIntroSectionLoading(false);
            }
        };

        fetchEventsIntroSection();
    }, [client, setErrorState]);

    const handleAddCategory = useCallback((newCategory: EventCategoryDto) => {
        setCategories((prev) => [...prev, newCategory]);
    }, []);

    const handleAddEvent = useCallback(() => {
        openModalActions.openAddItemModal();
    }, [openModalActions]);

    const handleUpdateCategory = useCallback(
        (updatedCategory: EventCategoryDto) => {
            updateCategories((prevCategories) =>
                prevCategories.map((category) => (category.id === updatedCategory.id ? updatedCategory : category)),
            );

            if (selectedCategory?.id === updatedCategory.id) {
                setSelectedCategory(updatedCategory);
            }
        },
        [selectedCategory?.id, updateCategories],
    );

    const handleDeleteCategory = useCallback(
        (categoryToDeleteId: number) => {
            updateCategories((prevCategories) => {
                const filtered = prevCategories.filter((category) => category.id !== categoryToDeleteId);

                if (selectedCategory?.id === categoryToDeleteId && filtered.length > 0) {
                    const currentCategoryIndex = prevCategories.findIndex(
                        (category) => category.id === categoryToDeleteId,
                    );
                    const nextCategory = filtered[Math.min(currentCategoryIndex, filtered.length - 1)];
                    setSelectedCategory(nextCategory);
                } else if (filtered.length === 0) {
                    setSelectedCategory(null);
                }

                return filtered;
            });
        },
        [selectedCategory?.id, updateCategories],
    );

    const getCategoryName = useCallback(
        (category: any) => {
            const localization = (category.localizations ?? []).find(
                (loc: any) =>
                    loc.language?.code === selectedLanguage?.code || loc.language?.id === selectedLanguage?.id,
            );
            return localization?.name || category.name;
        },
        [selectedLanguage?.code, selectedLanguage?.id],
    );

    const handleSectionDraftChange = useCallback((sectionId: EditableHeaderSectionId, value: string) => {
        const field = introSectionFieldById[sectionId];

        setEventsIntroDraft((currentDraft) => (currentDraft ? { ...currentDraft, [field]: value } : currentDraft));
    }, []);

    const publishSection = useCallback(
        async (sectionId: EditableHeaderSectionId, value: string) => {
            if (!eventsIntroDraft || isEventsIntroSectionPublishing) return;

            const field = introSectionFieldById[sectionId];
            const updatedSection = { ...eventsIntroDraft, [field]: value };

            setIsEventsIntroSectionPublishing(true);

            try {
                const publishedSection = await EventsApi.updateEventsIntroSection(client, field, updatedSection);
                setEventsIntroSection(publishedSection);
                setEventsIntroDraft(publishedSection);
                setEditingSectionId(null);
            } catch {
                setErrorState(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_PUBLISH_CHANGES, 'events');
            } finally {
                setIsEventsIntroSectionPublishing(false);
            }
        },
        [client, eventsIntroDraft, isEventsIntroSectionPublishing, setErrorState],
    );

    const cancelSectionEdit = useCallback(() => {
        setEventsIntroDraft(eventsIntroSection);
        setEditingSectionId(null);
    }, [eventsIntroSection]);

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
            <div
                className={`events-page-content-sections ${editingSectionId ? 'events-page-content-sections--editing' : ''}`}
            >
                <EditableHeaderSection
                    sectionId={EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID}
                    heading={EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE}
                    inputLabel={EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE}
                    initialPublishedHtml={eventsIntroSection?.pageDescription ?? ''}
                    maxLength={EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.PAGE_DESCRIPTION}
                    mode={editingSectionId === EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID ? 'edit' : 'view'}
                    onEnterEditMode={() => setEditingSectionId(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID)}
                    onDraftChange={(value) =>
                        handleSectionDraftChange(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID, value)
                    }
                    onCancelEdit={cancelSectionEdit}
                    onPublish={(value) => publishSection(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID, value)}
                    isPublishDisabled={isEventsIntroSectionPublishing}
                    disabled={isEventsIntroSectionLoading || isEventsIntroSectionPublishing || !eventsIntroDraft}
                    placeholder={EVENTS_TEXT.PAGE_CONTENT.PLACEHOLDER.PAGE_DESCRIPTION}
                />
                <EditableHeaderSection
                    sectionId={EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID}
                    heading={EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE}
                    inputLabel={EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE}
                    initialPublishedHtml={eventsIntroSection?.eventsBlockTitle ?? ''}
                    maxLength={EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.EVENTS_BLOCK_TITLE}
                    mode={editingSectionId === EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID ? 'edit' : 'view'}
                    onEnterEditMode={() => setEditingSectionId(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID)}
                    onDraftChange={(value) =>
                        handleSectionDraftChange(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID, value)
                    }
                    onCancelEdit={cancelSectionEdit}
                    onPublish={(value) => publishSection(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID, value)}
                    isPublishDisabled={isEventsIntroSectionPublishing}
                    disabled={isEventsIntroSectionLoading || isEventsIntroSectionPublishing || !eventsIntroDraft}
                    placeholder={EVENTS_TEXT.PAGE_CONTENT.PLACEHOLDER.EVENTS_BLOCK_TITLE}
                />
            </div>
            <div className="events-page-list-container">
                <CategoryBar<EventCategoryDto>
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                    getCategoryDisplayName={getCategoryName}
                    getCategoryKey={(category) => category.id}
                    displayContextMenuButton={true}
                    contextMenuOptions={categoryBarContextMenuOptions}
                    onContextMenuOptionSelected={onContextMenuOptionSelected}
                    renderCategoryExtra={(category) => (
                        <LocalizationStatuses languages={translationLanguages} localizedEntity={category as any} />
                    )}
                />
                {error.message && <div className="error-message">{error.message}</div>}
            </div>

            <EventsPageModals
                modalsStateControl={modalsStateControl}
                categories={categories}
                currentCategory={selectedCategory}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
            />
        </div>
    );
};
