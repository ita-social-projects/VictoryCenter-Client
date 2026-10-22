import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { AdminPanelToolbar } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { EventsPageModals } from './event-page-modals/EventsPageModals';
import { EventItemComponent } from './event-item-component/EventItemComponent';
import { EventSearchItem } from './event-search-item/EventSearchItem';
import { DraggableListItem } from '@/components/admin/draggable-list-item/DraggableListItem';
import { InfiniteScrollList } from '@/components/admin/infinite-scroll-list/InfiniteScrollList';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { PaginationRequestParams } from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { useModalsState } from '@/hooks/admin/use-modals-state/useModalsState';
import { useCategoryContextMenu } from '@/hooks/admin/use-category-context-menu/useCategoryContextMenu';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { EventsApi } from '@/services/api/admin/events/events-api';
import { EventCategoriesApi } from '@/services/api/admin/events/event-categories-api';
import {
    EventItemDto,
    EventSaveSuccessData,
    ErrorState,
    EventsErrorType,
    EventsIntroSectionDto,
    EventsIntroSectionUpdateField,
} from '@/types/admin/events';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { EventCategoryDto } from '@/types/admin/event-category';
import { ToastType } from '@/types/admin/toast';
import { TranslationStatusFilter } from '@/types/common/language';
import {
    EVENT_ITEMS_TEXT,
    EVENT_NOTIFICATION_TIMERS,
    EVENTS_PAGE_VALIDATION,
    EVENTS_TEXT,
    DEFAULT_LOAD_ITEMS_COUNT,
    LIST_ITEM_HEIGHT_IN_PIXELS,
} from '@/const/admin/events';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '@/const/admin/common';
import { LocalizationStatuses } from '@/components/admin/localization-statuses/LocalizationStatuses';
import { EditableHeaderSection, EditableHeaderSectionId } from './editable-header-section/EditableHeaderSection';
import { TranslateEventsIntroModal } from './translate-events-intro-modal/TranslateEventsIntroModal';
import { EventsIntroTranslationField } from './translate-events-intro-modal/TranslateEventsIntroForm';
import {
    EventsPageTextValidationRule,
    getEventsPageTextValidationError,
} from '@/validation/admin/events-page-schema/events-page-schema';
import './EventsPageAdmin.scss';

const EMPTY_ERROR: ErrorState = {
    message: null,
    type: null,
};

const introSectionFieldById: Record<EditableHeaderSectionId, EventsIntroSectionUpdateField> = {
    [EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID]: 'pageDescription',
    [EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID]: 'eventsBlockTitle',
};
const introSectionValidationById: Record<EditableHeaderSectionId, EventsPageTextValidationRule> = {
    [EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID]: EVENTS_PAGE_VALIDATION.PAGE_DESCRIPTION,
    [EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID]: EVENTS_PAGE_VALIDATION.EVENTS_BLOCK_TITLE,
};

interface PublishConfirmationState {
    sectionId: EditableHeaderSectionId;
    value: string;
}

type EditableSectionState = Record<EditableHeaderSectionId, boolean>;

const createEditableSectionState = (): EditableSectionState => ({
    [EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID]: false,
    [EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID]: false,
});

export const EventsPageAdmin = () => {
    const [editingSections, setEditingSections] = useState<EditableSectionState>(createEditableSectionState);
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [error, setError] = useState<ErrorState>(EMPTY_ERROR);
    const [categories, setCategories] = useState<EventCategoryDto[]>([]);
    const [eventItems, setEventItems] = useState<EventItemDto[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<EventCategoryDto | null>(null);
    const [isReordering, setIsReordering] = useState(false);
    const [eventsIntroSection, setEventsIntroSection] = useState<EventsIntroSectionDto | null>(null);
    const [eventsIntroDraft, setEventsIntroDraft] = useState<EventsIntroSectionDto | null>(null);
    const [isEventsIntroSectionLoading, setIsEventsIntroSectionLoading] = useState(true);
    const [publishingSections, setPublishingSections] = useState<EditableSectionState>(createEditableSectionState);
    const [togglingVisibilitySections, setTogglingVisibilitySections] =
        useState<EditableSectionState>(createEditableSectionState);
    const [publishConfirmation, setPublishConfirmation] = useState<PublishConfirmationState | null>(null);
    const [isEventItemsLoading, setIsEventItemsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [pageSize, setPageSize] = useState(DEFAULT_LOAD_ITEMS_COUNT);
    const [selectedSearchItem, setSelectedSearchItem] = useState<EventItemDto | null>(null);
    const [eventToDeleteId, setEventToDeleteId] = useState<number | null>(null);
    const [isEventDeleting, setIsEventDeleting] = useState(false);
    const [activeIntroTranslationField, setActiveIntroTranslationField] = useState<EventsIntroTranslationField | null>(
        null,
    );

    const modalsStateControl = useModalsState<EventItemDto>();
    const { addToast } = useToast();

    const listContainerRef = useRef<HTMLDivElement>(null);
    const requestIdRef = useRef(0);
    const publishingSectionsRef = useRef<EditableSectionState>(createEditableSectionState());
    const togglingVisibilitySectionsRef = useRef<EditableSectionState>(createEditableSectionState());
    const toggleVisibilityRequestIdRef = useRef(0);
    const currentPageRef = useRef<number>(1);
    const currentItemsCountRef = useRef(0);
    const hasMoreRef = useRef(true);
    const isEventItemsLoadingRef = useRef(false);
    const reorderRequestIdRef = useRef(0);
    const eventItemsContextIdRef = useRef(0);
    const isReorderingRef = useRef(false);

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

    const resetEventItemsState = useCallback(
        (nextCategory?: EventCategoryDto | null) => {
            eventItemsContextIdRef.current += 1;
            requestIdRef.current += 1;

            setEventItems([]);
            setHasMore(true);

            if (error.type === 'events-items') {
                clearError('events-items');
            }

            currentPageRef.current = 0;
            currentItemsCountRef.current = 0;
            hasMoreRef.current = true;

            if (nextCategory !== undefined) {
                setSelectedCategory(nextCategory);
            }
        },
        [error.type, clearError],
    );

    const {
        allLanguages,
        translationLanguages,
        selectedLanguage,
        translationStatusFilter,
        onLanguageChange,
        onTranslationStatusFilterChange,
    } = useLocalizationToolkit({
        setErrorState,
    });
    const { openModalActions, closeModalActions } = modalsStateControl;

    const isTranslationFilterActive =
        translationStatusFilter !== undefined &&
        translationStatusFilter !== null &&
        translationStatusFilter !== TranslationStatusFilter.All;
    const isFilteredView = statusFilter !== undefined || isTranslationFilterActive;

    const handleTranslationStatusFilterChange = useCallback(
        (filter: TranslationStatusFilter | undefined) => {
            onTranslationStatusFilterChange(filter);
            resetEventItemsState();
        },
        [onTranslationStatusFilterChange, resetEventItemsState],
    );

    const getEventSearchItems = useCallback(
        async (
            searchTerm: string,
            paginationRequest: PaginationRequestParams,
        ): Promise<PaginationResult<EventItemDto>> =>
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
    const onStatusFilterChange = useCallback(
        (status: VisibilityStatus | undefined) => {
            setStatusFilter(status);
            setSelectedSearchItem(null);

            resetEventItemsState();
        },
        [resetEventItemsState],
    );

    const handleEventSearchSelect = useCallback(
        (_key: string | number, item: EventItemDto) => {
            const targetCategoryId = item.categories?.[0]?.id;
            const targetCategory = categories.find((category) => category.id === targetCategoryId);

            setStatusFilter(undefined);

            if (targetCategory && targetCategory.id !== selectedCategory?.id) {
                setSelectedCategory(targetCategory);
            }

            setSelectedSearchItem(item);
        },
        [categories, selectedCategory?.id],
    );

    const handleEventSearchClear = useCallback(() => {
        setSelectedSearchItem(null);
        resetEventItemsState();
    }, [resetEventItemsState]);

    // Category handlers
    const { categoryContextMenuOptions, onContextMenuOptionSelected } = useCategoryContextMenu(openModalActions);

    // Category CRUD handlers
    const fetchCategories = useCallback(async () => {
        clearError('categories');

        try {
            const fetchedCategories = await EventCategoriesApi.getAll(client);

            setCategories(fetchedCategories);

            if (fetchedCategories.length > 0) {
                setSelectedCategory((prevSelected) =>
                    prevSelected
                        ? (fetchedCategories.find((category) => category.id === prevSelected.id) ??
                          fetchedCategories[0])
                        : fetchedCategories[0],
                );
            }
        } catch {
            setErrorState(COMMON_TEXT_ADMIN.CATEGORIES.MESSAGE.FAIL_TO_FETCH_CATEGORIES, 'categories');
        }
    }, [client, clearError, setErrorState]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const fetchEventsIntroSection = useCallback(async () => {
        try {
            const introSection = await EventsApi.getEventsIntroSection(client);
            setEventsIntroSection(introSection);
            setEventsIntroDraft(introSection);
            return true;
        } catch {
            setErrorState(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_FETCH_DATA, 'events-intro');
            return false;
        } finally {
            setIsEventsIntroSectionLoading(false);
        }
    }, [client, setErrorState]);

    useEffect(() => {
        fetchEventsIntroSection();
    }, [fetchEventsIntroSection]);

    const handleAddEvent = useCallback(() => {
        if (!selectedCategory) {
            return;
        }

        openModalActions.openAddItemModal();
    }, [openModalActions, selectedCategory]);

    const handleTranslateEvent = useCallback(
        (updatedEvent: EventItemDto) => {
            setEventItems((prev) => prev.map((item) => (item.id === updatedEvent.id ? updatedEvent : item)));
            addToast(
                updatedEvent.status === VisibilityStatus.Published
                    ? COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_PUBLISHED_SUCCESS
                    : COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_SAVED_SUCCESS,
                ToastType.Success,
            );
        },
        [addToast],
    );

    const handleAddCategory = useCallback((newCategory: EventCategoryDto) => {
        setCategories((prev) => [...prev, newCategory]);
    }, []);

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

            setSelectedSearchItem(null);
            resetEventItemsState(nextCategories[0] ?? null);
        },
        [categories, selectedCategory?.id, resetEventItemsState],
    );

    const getCategoryName = useCallback(
        (category: EventCategoryDto) => {
            const localization = category.localizations?.find((loc) => {
                const langCode = loc.language?.code ?? (loc as any).localizationInfoDto?.code;
                return langCode === selectedLanguage?.code;
            });
            return localization?.name || category.name;
        },
        [selectedLanguage?.code],
    );

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

    const handleDeleteClick = useCallback((eventId: number) => {
        setEventToDeleteId(eventId);
    }, []);

    const renderEntityComponent = useCallback(
        (item: EventItemDto) => (
            <EventItemComponent
                item={item}
                language={selectedLanguage}
                translationLanguages={translationLanguages}
                onEdit={openModalActions.openEditItemModal}
                onDelete={handleDeleteClick}
                onTranslate={openModalActions.openTranslateItemModal}
            />
        ),
        [
            handleDeleteClick,
            openModalActions.openEditItemModal,
            openModalActions.openTranslateItemModal,
            selectedLanguage,
            translationLanguages,
        ],
    );

    const handleEntitiesReordered = useCallback(
        async (reorderedItems: EventItemDto[]) => {
            if (!selectedCategory) {
                return;
            }

            const previousItems = eventItems;
            const currentCategoryId = selectedCategory.id;
            const currentListContextId = eventItemsContextIdRef.current;
            const reorderRequestId = ++reorderRequestIdRef.current;

            try {
                isReorderingRef.current = true;
                setIsReordering(true);

                setError((currentError) => (currentError.type === 'events-reorder' ? EMPTY_ERROR : currentError));
                setEventItems(reorderedItems);

                const orderedIds = reorderedItems.map((e) => e.id);

                await EventsApi.reorder(client, currentCategoryId, orderedIds);
            } catch {
                if (
                    reorderRequestId === reorderRequestIdRef.current &&
                    selectedCategory?.id === currentCategoryId &&
                    currentListContextId === eventItemsContextIdRef.current
                ) {
                    setEventItems(previousItems);
                }

                addToast(
                    EVENT_ITEMS_TEXT.MESSAGE.FAILED_TO_REORDER_ITEMS,
                    ToastType.Error,
                    EVENT_NOTIFICATION_TIMERS.SYNC_ERROR_MS,
                );

                setErrorState(EVENT_ITEMS_TEXT.MESSAGE.FAILED_TO_REORDER_ITEMS, 'events-reorder');
            } finally {
                isReorderingRef.current = false;
                setIsReordering(false);
            }
        },
        [client, selectedCategory, eventItems, setErrorState, addToast],
    );

    const itemsToRender = useMemo(
        () => (selectedSearchItem ? [selectedSearchItem] : eventItems),
        [selectedSearchItem, eventItems],
    );
    const effectiveHasMore = selectedSearchItem ? false : hasMore;

    const renderEventItem = useCallback(
        (item: EventItemDto) => (
            <DraggableListItem
                key={item.id}
                entity={item}
                id={item.id}
                renderEntityComponent={renderEntityComponent}
                ariaLabel={EVENT_ITEMS_TEXT.ACTIONS.REORDER}
                entities={itemsToRender}
                idSelector={(item) => item.id}
                onEntitiesReordered={handleEntitiesReordered}
                reorderDisabled={isReordering}
                hideDragHandle={isFilteredView || itemsToRender.length < 2}
            ></DraggableListItem>
        ),
        [renderEntityComponent, itemsToRender, handleEntitiesReordered, isFilteredView, isReordering],
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

                const response = await EventsApi.fetchEvents(
                    client,
                    categoryId,
                    offset,
                    pageSize,
                    translationStatusFilter,
                    statusFilter,
                );

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
        [client, pageSize, addToast, setErrorState, statusFilter, translationStatusFilter],
    );

    useEffect(() => {
        return () => {
            requestIdRef.current += 1;
        };
    }, []);

    const selectedCategoryId = selectedCategory?.id;

    useEffect(() => {
        if (!selectedCategoryId || selectedSearchItem) {
            return;
        }

        fetchEventItems(selectedCategoryId, true);
    }, [selectedCategoryId, fetchEventItems, selectedSearchItem]);

    const handleCategorySelect = useCallback(
        (category: EventCategoryDto) => {
            setSelectedSearchItem(null);

            if (selectedCategoryId === category.id) {
                return;
            }

            resetEventItemsState(category);
        },
        [selectedCategoryId, resetEventItemsState],
    );

    const handleOnLoadMore = useCallback(() => {
        if (selectedCategory && !selectedSearchItem) {
            fetchEventItems(selectedCategory.id);
        }
    }, [fetchEventItems, selectedCategory, selectedSearchItem]);

    const moveDraftToTop = useCallback(
        async (event: EventItemDto, categoryId: number) => {
            const initialResponse = await EventsApi.fetchEvents(client, categoryId, 0, DEFAULT_LOAD_ITEMS_COUNT);
            const response =
                initialResponse.totalItemsCount > initialResponse.items.length
                    ? await EventsApi.fetchEvents(client, categoryId, 0, initialResponse.totalItemsCount)
                    : initialResponse;
            const orderedIds = [
                event.id,
                ...response.items.filter((item) => item.id !== event.id).map((item) => item.id),
            ];

            if (orderedIds.length > 1) {
                await EventsApi.reorder(client, categoryId, orderedIds);
            }
        },
        [client],
    );

    const handleEventSaveSuccess = useCallback(
        async ({ event, categoryId, isFirstPublication, shouldMoveDraftToTop }: EventSaveSuccessData) => {
            if (shouldMoveDraftToTop && categoryId) {
                try {
                    await moveDraftToTop(event, categoryId);
                } catch {
                    addToast(
                        EVENT_ITEMS_TEXT.MESSAGE.FAILED_TO_REORDER_ITEMS,
                        ToastType.Error,
                        EVENT_NOTIFICATION_TIMERS.SYNC_ERROR_MS,
                    );
                    setErrorState(EVENT_ITEMS_TEXT.MESSAGE.FAILED_TO_REORDER_ITEMS, 'events-reorder');
                }
            }

            if (selectedCategory?.id === categoryId) {
                fetchEventItems(categoryId, true);
            }

            if (isFirstPublication) {
                addToast(
                    EVENTS_TEXT.MESSAGE.DONT_FORGET_TO_ORDER,
                    ToastType.Info,
                    EVENT_NOTIFICATION_TIMERS.SYNC_SUCCESS_MS,
                );
            }
        },
        [addToast, fetchEventItems, moveDraftToTop, selectedCategory?.id, setErrorState],
    );

    const addMaterialButton = !isFilteredView && (
        <Button className="btn-add" onClick={handleAddEvent} buttonStyle="secondary" disabled={!selectedCategory}>
            {EVENTS_TEXT.BUTTON.ADD_MATERIAL}
            <PlusIcon className="plus-icon" aria-hidden="true" />
        </Button>
    );

    const handleSectionDraftChange = useCallback((sectionId: EditableHeaderSectionId, value: string) => {
        const field = introSectionFieldById[sectionId];

        setEventsIntroDraft((currentDraft) => (currentDraft ? { ...currentDraft, [field]: value } : currentDraft));
    }, []);

    const closeIntroTranslationModal = useCallback(() => {
        setActiveIntroTranslationField(null);
    }, []);

    const handleIntroTranslationSave = useCallback(async () => {
        const isIntroSectionRefreshed = await fetchEventsIntroSection();

        if (!isIntroSectionRefreshed) return false;

        addToast(
            COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_SAVED_SUCCESS,
            ToastType.Success,
            EVENT_NOTIFICATION_TIMERS.SYNC_SUCCESS_MS,
        );
        return true;
    }, [addToast, fetchEventsIntroSection]);

    const openPublishConfirmation = useCallback(
        (sectionId: EditableHeaderSectionId, value: string) => {
            if (!eventsIntroDraft || publishingSectionsRef.current[sectionId]) return;

            const validationError = getEventsPageTextValidationError(value, introSectionValidationById[sectionId]);

            if (validationError) {
                addToast(validationError, ToastType.Error, EVENT_NOTIFICATION_TIMERS.SYNC_ERROR_MS);
                return;
            }

            setPublishConfirmation({ sectionId, value });
        },
        [addToast, eventsIntroDraft],
    );

    const publishSection = useCallback(
        async (sectionId: EditableHeaderSectionId, value: string) => {
            if (!eventsIntroDraft || publishingSectionsRef.current[sectionId]) return;

            const field = introSectionFieldById[sectionId];
            const updatedSection = { ...eventsIntroDraft, [field]: value };

            publishingSectionsRef.current[sectionId] = true;
            setPublishingSections((currentPublishingSections) => ({
                ...currentPublishingSections,
                [sectionId]: true,
            }));

            try {
                const publishedSection = await EventsApi.updateEventsIntroSection(client, field, updatedSection);
                setEventsIntroSection((currentSection) =>
                    currentSection ? { ...currentSection, [field]: publishedSection[field] } : publishedSection,
                );
                setEventsIntroDraft((currentDraft) =>
                    currentDraft ? { ...currentDraft, [field]: publishedSection[field] } : publishedSection,
                );
                setEditingSections((currentEditingSections) => ({
                    ...currentEditingSections,
                    [sectionId]: false,
                }));
                addToast(
                    COMMON_TEXT_ADMIN.MESSAGE.UPDATES_SUCCESSFULLY_PUBLISHED,
                    ToastType.Success,
                    EVENT_NOTIFICATION_TIMERS.SYNC_SUCCESS_MS,
                );
            } catch {
                addToast(
                    COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_PUBLISH_CHANGES,
                    ToastType.Error,
                    EVENT_NOTIFICATION_TIMERS.SYNC_ERROR_MS,
                );
            } finally {
                publishingSectionsRef.current[sectionId] = false;
                setPublishingSections((currentPublishingSections) => ({
                    ...currentPublishingSections,
                    [sectionId]: false,
                }));
            }
        },
        [addToast, client, eventsIntroDraft],
    );

    const handlePublishConfirmation = useCallback(() => {
        if (!publishConfirmation || publishingSectionsRef.current[publishConfirmation.sectionId]) return;

        const { sectionId, value } = publishConfirmation;
        setPublishConfirmation(null);
        publishSection(sectionId, value);
    }, [publishConfirmation, publishSection]);

    const closePublishConfirmation = useCallback(() => {
        if (!publishConfirmation || !publishingSectionsRef.current[publishConfirmation.sectionId]) {
            setPublishConfirmation(null);
        }
    }, [publishConfirmation]);

    const cancelSectionEdit = useCallback(
        (sectionId: EditableHeaderSectionId) => {
            const field = introSectionFieldById[sectionId];

            setEventsIntroDraft((currentDraft) =>
                currentDraft && eventsIntroSection
                    ? { ...currentDraft, [field]: eventsIntroSection[field] }
                    : currentDraft,
            );
            setEditingSections((currentEditingSections) => ({
                ...currentEditingSections,
                [sectionId]: false,
            }));
        },
        [eventsIntroSection],
    );

    const isAnySectionEditing = Object.values(editingSections).some(Boolean);

    const toggleSectionVisibility = useCallback(
        async (sectionId: EditableHeaderSectionId) => {
            if (
                togglingVisibilitySectionsRef.current[EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID] ||
                togglingVisibilitySectionsRef.current[EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID]
            ) {
                return;
            }

            const requestId = ++toggleVisibilityRequestIdRef.current;
            togglingVisibilitySectionsRef.current[sectionId] = true;
            setTogglingVisibilitySections((prev) => ({ ...prev, [sectionId]: true }));

            try {
                const isTitle = sectionId === EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID;
                const updated = isTitle
                    ? await EventsApi.toggleEventsTitleVisibility(client)
                    : await EventsApi.toggleEventsDescriptionVisibility(client);

                if (requestId !== toggleVisibilityRequestIdRef.current) {
                    return;
                }

                const reconcileState = (prev: EventsIntroSectionDto | null) => {
                    if (!prev) return updated;
                    return {
                        ...prev,
                        isEventsBlockTitleHidden: isTitle
                            ? updated.isEventsBlockTitleHidden
                            : prev.isEventsBlockTitleHidden,
                        isPageDescriptionHidden: !isTitle
                            ? updated.isPageDescriptionHidden
                            : prev.isPageDescriptionHidden,
                    };
                };

                setEventsIntroSection(reconcileState);
                setEventsIntroDraft(reconcileState);
            } catch {
                if (requestId === toggleVisibilityRequestIdRef.current) {
                    setErrorState(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_PUBLISH_CHANGES, 'events-intro');
                }
            } finally {
                togglingVisibilitySectionsRef.current[sectionId] = false;
                setTogglingVisibilitySections((prev) => ({ ...prev, [sectionId]: false }));
            }
        },
        [client, setErrorState],
    );

    const isAnySectionTogglingVisibility =
        togglingVisibilitySections[EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID] ||
        togglingVisibilitySections[EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID];

    const emptyStateMessage = isFilteredView ? COMMON_TEXT_ADMIN.LIST.NOT_FOUND : EVENT_ITEMS_TEXT.NO_RECORDS;

    const handleTranslateCategory = useCallback(
        (updatedCategory: EventCategoryDto) => {
            handleUpdateCategory(updatedCategory);

            closeModalActions.closeTranslateCategoryModal();
            addToast(COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_SAVED_SUCCESS, ToastType.Success);
        },
        [handleUpdateCategory, closeModalActions, addToast],
    );

    const handleDeleteConfirm = useCallback(async () => {
        if (eventToDeleteId === null || isEventDeleting || !selectedCategory) {
            return;
        }

        setIsEventDeleting(true);

        try {
            await EventsApi.deleteEvent(client, eventToDeleteId);

            setEventItems((prev) => prev.filter((item) => item.id !== eventToDeleteId));

            setEventToDeleteId(null);

            eventItemsContextIdRef.current += 1;

            await fetchEventItems(selectedCategory.id, true);
            await fetchCategories();
        } catch {
            addToast(
                EVENTS_TEXT.MESSAGE.FAIL_TO_DELETE_EVENT,
                ToastType.Error,
                EVENT_NOTIFICATION_TIMERS.SYNC_ERROR_MS,
            );
        } finally {
            setIsEventDeleting(false);
        }
    }, [client, fetchCategories, fetchEventItems, selectedCategory, eventToDeleteId, isEventDeleting, addToast]);

    const handleDeleteCancel = useCallback(() => {
        if (isEventDeleting) {
            return;
        }

        setEventToDeleteId(null);
    }, [isEventDeleting]);

    return (
        <div className="events-page-wrapper" data-testid="events-page-content">
            <div className="events-page-toolbar-container">
                <AdminPanelToolbar<EventItemDto>
                    getSearchItemKey={(item) => item.id}
                    getSearchItemLabel={(item) => item.title}
                    fetchSearchItems={getEventSearchItems}
                    placeholder={EVENTS_TEXT.PLACEHOLDER.SEARCH_EVENTS}
                    onSearchClear={handleEventSearchClear}
                    statusFilter={statusFilter}
                    onStatusFilterChange={onStatusFilterChange}
                    onAddItem={handleAddEvent}
                    AddItemButtonText={EVENTS_TEXT.BUTTON.ADD_EVENT}
                    onSuggestionSelect={handleEventSearchSelect}
                    languages={allLanguages}
                    onLanguageChange={onLanguageChange}
                    onTranslationStatusFilterChange={handleTranslationStatusFilterChange}
                    maxCharactersToSearch={UI_CONFIG.SEARCH_BAR.MAX_CHARACTERS_FOR_SEARCH.EVENTS}
                    searchPageSize={5}
                    renderSearchItemComponent={EventSearchItem}
                />
            </div>
            <div
                className={`events-page-content-sections ${isAnySectionEditing ? 'events-page-content-sections--editing' : ''}`}
            >
                <EditableHeaderSection
                    sectionId={EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID}
                    heading={EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE}
                    inputLabel={EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.TITLE}
                    initialPublishedHtml={eventsIntroSection?.pageDescription ?? ''}
                    maxLength={EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.PAGE_DESCRIPTION}
                    validationRule={introSectionValidationById[EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID]}
                    mode={editingSections[EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID] ? 'edit' : 'view'}
                    onEnterEditMode={() =>
                        setEditingSections((currentEditingSections) => ({
                            ...currentEditingSections,
                            [EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID]: true,
                        }))
                    }
                    onDraftChange={(value) =>
                        handleSectionDraftChange(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID, value)
                    }
                    onCancelEdit={() => cancelSectionEdit(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID)}
                    onPublish={(value) =>
                        openPublishConfirmation(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID, value)
                    }
                    isPublishDisabled={publishingSections[EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID]}
                    isToggleVisibilityDisabled={isAnySectionTogglingVisibility}
                    disabled={
                        isEventsIntroSectionLoading ||
                        publishingSections[EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID] ||
                        togglingVisibilitySections[EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID] ||
                        !eventsIntroDraft
                    }
                    placeholder={EVENTS_TEXT.PAGE_CONTENT.PLACEHOLDER.PAGE_DESCRIPTION}
                    onTranslate={() => setActiveIntroTranslationField('pageDescription')}
                    isHidden={eventsIntroSection?.isPageDescriptionHidden}
                    onToggleVisibility={() =>
                        toggleSectionVisibility(EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID)
                    }
                />
                <EditableHeaderSection
                    sectionId={EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID}
                    heading={EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE}
                    inputLabel={EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.TITLE}
                    initialPublishedHtml={eventsIntroSection?.eventsBlockTitle ?? ''}
                    maxLength={EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.EVENTS_BLOCK_TITLE}
                    validationRule={introSectionValidationById[EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID]}
                    mode={editingSections[EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID] ? 'edit' : 'view'}
                    onEnterEditMode={() =>
                        setEditingSections((currentEditingSections) => ({
                            ...currentEditingSections,
                            [EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID]: true,
                        }))
                    }
                    onDraftChange={(value) =>
                        handleSectionDraftChange(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID, value)
                    }
                    onCancelEdit={() => cancelSectionEdit(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID)}
                    onPublish={(value) =>
                        openPublishConfirmation(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID, value)
                    }
                    isPublishDisabled={publishingSections[EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID]}
                    isToggleVisibilityDisabled={isAnySectionTogglingVisibility}
                    disabled={
                        isEventsIntroSectionLoading ||
                        publishingSections[EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID] ||
                        togglingVisibilitySections[EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID] ||
                        !eventsIntroDraft
                    }
                    placeholder={EVENTS_TEXT.PAGE_CONTENT.PLACEHOLDER.EVENTS_BLOCK_TITLE}
                    onTranslate={() => setActiveIntroTranslationField('eventsBlockTitle')}
                    isHidden={eventsIntroSection?.isEventsBlockTitleHidden}
                    onToggleVisibility={() =>
                        toggleSectionVisibility(EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID)
                    }
                />
            </div>
            {activeIntroTranslationField && (
                <TranslateEventsIntroModal
                    isOpen
                    field={activeIntroTranslationField}
                    introSection={eventsIntroSection!}
                    translationLanguages={translationLanguages}
                    onClose={closeIntroTranslationModal}
                    onSaveSuccess={handleIntroTranslationSave}
                />
            )}
            <div className="events-page-list-container" ref={listContainerRef}>
                <CategoryBar<EventCategoryDto>
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    getCategoryDisplayName={getCategoryName}
                    getCategoryKey={(category) => category.id}
                    displayContextMenuButton={true}
                    contextMenuOptions={categoryContextMenuOptions}
                    onContextMenuOptionSelected={onContextMenuOptionSelected}
                    renderCategoryExtra={(category) => (
                        <LocalizationStatuses languages={translationLanguages} localizedEntity={category} />
                    )}
                />
                {error.type === 'categories' && <div className="error-message">{error.message}</div>}

                {selectedCategory && error.type !== 'events-items' && (
                    <InfiniteScrollList<EventItemDto>
                        items={itemsToRender}
                        renderItem={renderEventItem}
                        onLoadMore={handleOnLoadMore}
                        hasMore={effectiveHasMore}
                        isLoading={isEventItemsLoading}
                        emptyStateMessage={emptyStateMessage}
                        emptyStateAction={addMaterialButton}
                    />
                )}
            </div>

            <EventsPageModals
                modalsStateControl={modalsStateControl}
                categories={categories}
                currentCategory={selectedCategory}
                onEventSaveSuccess={handleEventSaveSuccess}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onTranslateCategory={handleTranslateCategory}
                translationLanguages={translationLanguages}
                onTranslateEvent={handleTranslateEvent}
            />
            <ConfirmationModal
                isOpen={!!publishConfirmation}
                onClose={closePublishConfirmation}
                title={COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onConfirm={handlePublishConfirmation}
                onCancel={closePublishConfirmation}
                isButtonsDisabled={!!publishConfirmation && publishingSections[publishConfirmation.sectionId]}
            />

            <ConfirmationModal
                isOpen={eventToDeleteId !== null}
                onClose={handleDeleteCancel}
                title={EVENTS_TEXT.QUESTION.DELETE_MATERIAL}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                isButtonsDisabled={isEventDeleting}
            />
            <ToastContainer />
        </div>
    );
};
