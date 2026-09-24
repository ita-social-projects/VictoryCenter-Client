import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { AdminPanelToolbar } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { CategoryBar, ContextMenuOption } from '@/components/admin/category-bar/CategoryBar';
import { EventsPageModals } from './event-page-modals/EventsPageModals';
import { EventItemComponent } from './event-item-component/EventItemComponent';
import { DraggableListItem } from '@/components/admin/draggable-list-item/DraggableListItem';
import { InfiniteScrollList } from '@/components/admin/infinite-scroll-list/InfiniteScrollList';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { Button } from '@/components/admin/button/Button';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { PaginationRequestParams } from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { useModalsState } from '@/hooks/admin/use-modals-state/useModalsState';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { EventsApi } from '@/services/api/admin/events/events-api';
import { EventCategoriesApi } from '@/services/api/admin/events/event-categories-api';
import {
    EventItemDto,
    EventSearchItemData,
    ErrorState,
    EventsErrorType,
    EventsIntroSectionDto,
    EventsIntroSectionUpdateField,
} from '@/types/admin/events';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { EventCategoryDto } from '@/types/admin/event-category';
import { ToastType } from '@/types/admin/toast';
import {
    EVENT_ITEMS_TEXT,
    EVENT_NOTIFICATION_TIMERS,
    EVENTS_TEXT,
    DEFAULT_LOAD_ITEMS_COUNT,
    LIST_ITEM_HEIGHT_IN_PIXELS,
} from '@/const/admin/events';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '@/const/admin/common';
import { EditableHeaderSection, EditableHeaderSectionId } from './editable-header-section/EditableHeaderSection';
import './EventsPageAdmin.scss';

const EMPTY_ERROR: ErrorState = {
    message: null,
    type: null,
};

const introSectionFieldById: Record<EditableHeaderSectionId, EventsIntroSectionUpdateField> = {
    [EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID]: 'pageDescription',
    [EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID]: 'eventsBlockTitle',
};

export const EventsPageAdmin = () => {
    const [editingSectionId, setEditingSectionId] = useState<EditableHeaderSectionId | null>(null);
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [error, setError] = useState<ErrorState>(EMPTY_ERROR);
    const [categories, setCategories] = useState<EventCategoryDto[]>([]);
    const [eventItems, setEventItems] = useState<EventItemDto[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<EventCategoryDto | null>(null);
    const [eventsIntroSection, setEventsIntroSection] = useState<EventsIntroSectionDto | null>(null);
    const [eventsIntroDraft, setEventsIntroDraft] = useState<EventsIntroSectionDto | null>(null);
    const [isEventsIntroSectionLoading, setIsEventsIntroSectionLoading] = useState(true);
    const [isEventsIntroSectionPublishing, setIsEventsIntroSectionPublishing] = useState(false);
    const [isEventItemsLoading, setIsEventItemsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [pageSize, setPageSize] = useState(DEFAULT_LOAD_ITEMS_COUNT);
    const modalsStateControl = useModalsState<EventItemDto>();
    const { addToast } = useToast();

    const listContainerRef = useRef<HTMLDivElement>(null);
    const requestIdRef = useRef(0);
    const currentPageRef = useRef<number>(1);
    const currentItemsCountRef = useRef(0);
    const hasMoreRef = useRef(true);
    const isEventItemsLoadingRef = useRef(false);

    const client = useAdminClient();

    const setErrorState = useCallback((message: string, type: EventsErrorType) => {
        setError({
            message,
            type,
        });
    }, []);

    const clearError = useCallback((type: EventsErrorType) => {
        setError((currentError) => (currentError.type === type ? EMPTY_ERROR : currentError));
    }, []);

    const resetEventItemsState = useCallback(() => {
        requestIdRef.current += 1;

        setEventItems([]);
        setHasMore(true);

        if (error.type === 'events-items') {
            clearError('events-items');
        }

        currentPageRef.current = 0;
        currentItemsCountRef.current = 0;
        hasMoreRef.current = true;
    }, [error.type, clearError]);

    const { allLanguages, onLanguageChange, onTranslationStatusFilterChange } = useLocalizationToolkit({
        setErrorState,
    });
    const { openModalActions } = modalsStateControl;

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
            } else if (id === 'delete') {
                openModalActions.openDeleteCategoryModal();
            } else if (id === 'translate') {
                openModalActions.openTranslateCategoryModal();
            }
        },
        [openModalActions],
    );

    const categoryBarContextMenuOptions: ContextMenuOption[] = useMemo(
        () => [
            { id: 'add', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_CATEGORY },
            { id: 'edit', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.EDIT_CATEGORY },
            { id: 'delete', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.DELETE_CATEGORY },
            { id: 'translate', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_TRANSLATION },
        ],
        [],
    );

    // Category CRUD handlers
    const fetchCategories = useCallback(async () => {
        clearError('categories');

        try {
            const fetchedCategories = await EventCategoriesApi.getAll(client);

            setCategories(fetchedCategories);

            if (fetchedCategories.length > 0) {
                setSelectedCategory((prevSelected) => prevSelected ?? fetchedCategories[0]);
            }
        } catch {
            setErrorState(COMMON_TEXT_ADMIN.CATEGORIES.MESSAGE.FAIL_TO_FETCH_CATEGORIES, 'categories');
        }
    }, [client, clearError, setErrorState]);

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
                setErrorState(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_FETCH_DATA, 'events-intro');
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
            setCategories((prevCategories) =>
                prevCategories.map((category) => (category.id === updatedCategory.id ? updatedCategory : category)),
            );

            if (selectedCategory?.id === updatedCategory.id) {
                setSelectedCategory(updatedCategory);
            }
        },
        [selectedCategory?.id],
    );

    const handleDeleteCategory = useCallback(
        (categoryToDeleteId: number) => {
            const nextCategories = categories.filter((category) => category.id !== categoryToDeleteId);

            setCategories(nextCategories);

            if (selectedCategory?.id !== categoryToDeleteId) {
                return;
            }

            resetEventItemsState();
            setSelectedCategory(nextCategories[0] ?? null);
        },
        [categories, selectedCategory?.id, resetEventItemsState],
    );

    // Event items handlers
    const updatePageSize = useCallback(() => {
        if (!listContainerRef.current) {
            return;
        }

        const calculatedPageSize = Math.floor(listContainerRef.current.clientHeight / LIST_ITEM_HEIGHT_IN_PIXELS) + 1;

        setPageSize(Math.max(calculatedPageSize, DEFAULT_LOAD_ITEMS_COUNT));
    }, []);

    useEffect(() => {
        const element = listContainerRef.current;

        if (!element) {
            return;
        }

        const resizeObserver = new ResizeObserver(updatePageSize);

        resizeObserver.observe(element);
        updatePageSize();

        return () => {
            resizeObserver.disconnect();
        };
    }, [updatePageSize]);

    const renderEntityComponent = useCallback((item: EventItemDto) => <EventItemComponent item={item} />, []);

    const handleEntitiesReordered = useCallback(() => {
        /*TODO: add implementation.*/
    }, []);

    const renderEventItem = useCallback(
        (item: EventItemDto) => (
            <DraggableListItem
                key={item.id}
                entity={item}
                id={item.id}
                renderEntityComponent={renderEntityComponent}
                ariaLabel={EVENT_ITEMS_TEXT.ACTIONS.REORDER}
                entities={eventItems}
                idSelector={(item) => item.id}
                onEntitiesReordered={handleEntitiesReordered}
            ></DraggableListItem>
        ),
        [renderEntityComponent, eventItems, handleEntitiesReordered],
    );

    const fetchEventItems = useCallback(
        async (categoryId: number, shouldResetList = false) => {
            if (!shouldResetList && (isEventItemsLoadingRef.current || !hasMoreRef.current)) {
                return;
            }

            const requestId = ++requestIdRef.current;

            try {
                isEventItemsLoadingRef.current = true;
                setIsEventItemsLoading(true);

                const pageToFetch = shouldResetList ? 0 : currentPageRef.current;
                const offset = pageToFetch * pageSize;

                const response = await EventsApi.fetchEvents(client, categoryId, offset, pageSize);

                if (requestId !== requestIdRef.current) {
                    return;
                }

                setError((currentError) => (currentError.type === 'events-items' ? EMPTY_ERROR : currentError));

                if (shouldResetList) {
                    setEventItems(response.items);
                    currentItemsCountRef.current = response.items.length;
                } else {
                    setEventItems((prev) => [...prev, ...response.items]);
                    currentItemsCountRef.current += response.items.length;
                }

                currentPageRef.current = pageToFetch + 1;

                const hasMoreItems = currentItemsCountRef.current < response.totalItemsCount;

                hasMoreRef.current = hasMoreItems;
                setHasMore(hasMoreItems);
            } catch {
                if (requestId !== requestIdRef.current) {
                    return;
                }

                addToast(
                    EVENT_ITEMS_TEXT.MESSAGE.FAILED_TO_FETCH_ITEMS,
                    ToastType.Error,
                    EVENT_NOTIFICATION_TIMERS.SYNC_ERROR_MS,
                );

                setErrorState(EVENT_ITEMS_TEXT.MESSAGE.FAILED_TO_FETCH_ITEMS, 'events-items');
            } finally {
                if (requestId === requestIdRef.current) {
                    isEventItemsLoadingRef.current = false;
                    setIsEventItemsLoading(false);
                }
            }
        },
        [client, pageSize, addToast, setErrorState],
    );

    useEffect(() => {
        return () => {
            requestIdRef.current += 1;
        };
    }, []);

    const selectedCategoryId = selectedCategory?.id;

    useEffect(() => {
        if (!selectedCategoryId) {
            return;
        }

        fetchEventItems(selectedCategoryId, true);
    }, [selectedCategoryId, fetchEventItems]);

    const handleCategorySelect = useCallback(
        (category: EventCategoryDto) => {
            if (selectedCategoryId === category.id) {
                return;
            }

            resetEventItemsState();
            setSelectedCategory(category);
        },
        [selectedCategoryId, resetEventItemsState],
    );

    const handleOnLoadMore = useCallback(() => {
        if (selectedCategory) {
            fetchEventItems(selectedCategory.id);
        }
    }, [fetchEventItems, selectedCategory]);

    const addMaterialButton = (
        <Button
            className="btn-add"
            onClick={() => {
                /*TODO: add implementation.*/
            }}
            buttonStyle="secondary"
        >
            {EVENTS_TEXT.BUTTON.ADD_MATERIAL}
            <PlusIcon className="plus-icon" aria-hidden="true" />
        </Button>
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
                setErrorState(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_PUBLISH_CHANGES, 'events-intro');
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
            <div className="events-page-list-container" ref={listContainerRef}>
                <CategoryBar<EventCategoryDto>
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    getCategoryDisplayName={(category) => category.name}
                    getCategoryKey={(category) => category.id}
                    displayContextMenuButton={true}
                    contextMenuOptions={categoryBarContextMenuOptions}
                    onContextMenuOptionSelected={onContextMenuOptionSelected}
                />
                {error.type === 'categories' && <div className="error-message">{error.message}</div>}

                {selectedCategory && error.type !== 'events-items' && (
                    <InfiniteScrollList<EventItemDto>
                        items={eventItems}
                        renderItem={renderEventItem}
                        onLoadMore={handleOnLoadMore}
                        hasMore={hasMore}
                        isLoading={isEventItemsLoading}
                        emptyStateMessage={EVENT_ITEMS_TEXT.NO_RECORDS}
                        emptyStateAction={addMaterialButton}
                    />
                )}
            </div>

            <EventsPageModals
                modalsStateControl={modalsStateControl}
                categories={categories}
                currentCategory={selectedCategory}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
            />
            <ToastContainer />
        </div>
    );
};
