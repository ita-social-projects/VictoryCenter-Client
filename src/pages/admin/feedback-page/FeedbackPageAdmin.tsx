import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '@/const/admin/common';
import { AdminPanelToolbar } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { PaginationRequestParams } from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { useModalsState } from '@/hooks/admin/use-modals-state/useModalsState';
import {
    FeedbackCategory,
    FeedbackCategoryItem,
    FeedbackHistoryDto,
    FeedbackListItem,
    FeedbackReviewDto,
    FeedbackVideoDto,
} from '@/types/admin/feedback';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { FEEDBACK_CATEGORIES, FEEDBACK_PAGINATION_LIMIT, FEEDBACK_TEXT } from '@/const/admin/feedback';
import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { InfiniteScrollList } from '@/components/admin/infinite-scroll-list/InfiniteScrollList';
import { DraggableListItem } from '@/components/admin/draggable-list-item/DraggableListItem';
import { FeedbackComponent } from './components/feedback-component/FeedbackComponent';
import { DeleteFeedbackModal } from './components/delete-feedback-modal/DeleteFeedbackModal';
import { AddFeedbackHistoryModal } from './components/add-feedback-history-modal/AddFeedbackHistoryModal';
import { AddVideoReviewModal } from './components/add-video-review-modal/AddVideoReviewModal';
import { AddFeedbackReviewModal } from './components/add-feedback-review-modal/AddFeedbackReviewModal';
import { TranslateFeedbackHistoryModal } from './components/translate-feedback-history-modal/TranslateFeedbackHistoryModal';
import { TranslateFeedbackReviewModal } from './components/translate-feedback-review-modal/TranslateFeedbackReviewModal';
import { TranslateFeedbackVideoModal } from './components/translate-feedback-video-modal/TranslateFeedbackVideoModal';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { Button } from '@/components/admin/button/Button';
import './FeedbackPageAdmin.scss';

const SEARCH_PLACEHOLDERS: Record<FeedbackCategory, string> = {
    [FeedbackCategory.HISTORY]: FEEDBACK_TEXT.PLACEHOLDER.SEARCH_HISTORY,
    [FeedbackCategory.REVIEWS]: FEEDBACK_TEXT.PLACEHOLDER.SEARCH_REVIEWS,
    [FeedbackCategory.VIDEOS]: FEEDBACK_TEXT.PLACEHOLDER.SEARCH_VIDEOS,
};

export const isFeedbackHistory = (item: FeedbackListItem): item is FeedbackHistoryDto =>
    typeof item === 'object' && item !== null && 'story' in item;

export const isFeedbackReview = (item: FeedbackListItem): item is FeedbackReviewDto =>
    typeof item === 'object' && item !== null && 'authorName' in item;

export const isFeedbackVideo = (item: FeedbackListItem): item is FeedbackVideoDto =>
    typeof item === 'object' && item !== null && 'link' in item;

export const FeedbackPageAdmin = () => {
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [error, setError] = useState<{
        message: string | null;
        type: string | null;
        reorderData?: {
            category: FeedbackCategory;
            orderedIds: number[];
            previousItems?: FeedbackListItem[];
        };
    }>({ message: null, type: null });
    const [activeCategory, setActiveCategory] = useState<FeedbackCategory>(FeedbackCategory.HISTORY);
    const [items, setItems] = useState<FeedbackListItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [selectedSearchItem, setSelectedSearchItem] = useState<FeedbackListItem | null>(null);

    const client = useAdminClient();
    const { addToast } = useToast();

    const setErrorState = useCallback((message: string, type: string) => setError({ message, type }), []);
    const {
        allLanguages,
        translationLanguages,
        selectedLanguage,
        translationStatusFilter,
        onLanguageChange,
        onTranslationStatusFilterChange,
        retryFetchLanguages,
    } = useLocalizationToolkit({
        setErrorState: setErrorState as any,
    });

    const englishLanguage = useMemo(() => allLanguages.find((l) => l.code === 'en'), [allLanguages]);
    const { modalState, openModalActions, closeModalActions, isAnyModalOpened } = useModalsState<FeedbackListItem>();

    const selectedCategoryItem = useMemo(
        () => FEEDBACK_CATEGORIES.find((c) => c.id === activeCategory) || FEEDBACK_CATEGORIES[0],
        [activeCategory],
    );

    const handleNotImplemented = useCallback(() => {
        addToast('Функція не реалізована', ToastType.Info);
    }, [addToast]);

    const [itemToDelete, setItemToDelete] = useState<{ item: FeedbackListItem; category: FeedbackCategory } | null>(
        null,
    );
    const [historyToEdit, setHistoryToEdit] = useState<FeedbackHistoryDto | null>(null);
    const [isAddHistoryModalOpen, setIsAddHistoryModalOpen] = useState<boolean>(false);
    const [isAddVideoReviewModalOpen, setIsAddVideoReviewModalOpen] = useState(false);
    const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
    const [reviewToEdit, setReviewToEdit] = useState<FeedbackReviewDto | null>(null);

    const handleAddItemClick = useCallback(() => {
        if (activeCategory === FeedbackCategory.HISTORY) {
            setHistoryToEdit(null);
            setIsAddHistoryModalOpen(true);
        } else if (activeCategory === FeedbackCategory.VIDEOS) {
            setIsAddVideoReviewModalOpen(true);
        } else if (activeCategory === FeedbackCategory.REVIEWS) {
            setIsAddReviewModalOpen(true);
        } else {
            handleNotImplemented();
        }
    }, [activeCategory, handleNotImplemented]);

    const handleEditClick = useCallback(
        (item: FeedbackListItem) => {
            if (activeCategory === FeedbackCategory.HISTORY && isFeedbackHistory(item)) {
                setHistoryToEdit(item);
                setIsAddHistoryModalOpen(true);
            } else if (activeCategory === FeedbackCategory.REVIEWS && isFeedbackReview(item)) {
                setReviewToEdit(item);
                setIsAddReviewModalOpen(true);
            } else {
                handleNotImplemented();
            }
        },
        [activeCategory, handleNotImplemented],
    );

    const handleDeleteClick = useCallback(
        (item: FeedbackListItem) => {
            setItemToDelete({ item, category: activeCategory });
        },
        [activeCategory],
    );
    const handleDeleteConfirm = useCallback(
        (deletedItem: FeedbackListItem) => {
            setItems((prev) => prev.filter((item) => item.id !== deletedItem.id));
            if (selectedSearchItem?.id === deletedItem.id) {
                setSelectedSearchItem(null);
            }
            addToast(FEEDBACK_TEXT.MESSAGE.SUCCESS_DELETE, ToastType.Success);
        },
        [selectedSearchItem, addToast],
    );

    const handleEditReviewSuccess = useCallback(
        (updatedReview: FeedbackReviewDto) => {
            setItems((prev) => prev.map((item) => (item.id === updatedReview.id ? updatedReview : item)));
            setSelectedSearchItem((prev) => (prev && prev.id === updatedReview.id ? updatedReview : prev));
            addToast(FEEDBACK_TEXT.MESSAGE.SUCCESS_UPDATE, ToastType.Success);
        },
        [addToast],
    );

    const handleReviewSubmitError = useCallback(() => {
        addToast(FEEDBACK_TEXT.MESSAGE.FAIL_TO_PUBLISH, ToastType.Error);
    }, [addToast]);

    const handleTranslateClick = useCallback(
        (item: FeedbackListItem) => {
            if (isAnyModalOpened) return;

            const hasTranslation = item.localizations?.some((l) => l.language?.id === englishLanguage?.id);

            if (hasTranslation) {
                openModalActions.openEditTranslationModal(item);
            } else {
                openModalActions.openTranslateItemModal(item);
            }
        },
        [isAnyModalOpened, openModalActions, englishLanguage],
    );

    const handleCloseTranslateModal = useCallback(() => {
        closeModalActions.closeTranslateItemModal();
        closeModalActions.closeEditTranslationModal();
    }, [closeModalActions]);

    const handleTranslateSuccess = useCallback(
        (updatedItem: FeedbackListItem) => {
            setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
            if (selectedSearchItem?.id === updatedItem.id) {
                setSelectedSearchItem(updatedItem);
            }
            handleCloseTranslateModal();
            addToast(FEEDBACK_TEXT.MESSAGE.SUCCESS_TRANSLATE, ToastType.Success);
        },
        [selectedSearchItem, handleCloseTranslateModal, addToast],
    );

    const searchPlaceholder = SEARCH_PLACEHOLDERS[activeCategory];

    const latestRequestId = useRef<number>(0);

    const fetchCategoryItems = useCallback(
        async (category: FeedbackCategory, skip = 0) => {
            if (selectedSearchItem) return;

            const requestId = ++latestRequestId.current;
            try {
                if (skip === 0) setIsLoading(true);
                setError({ message: null, type: null });

                const params = {
                    status: statusFilter,
                    language: selectedLanguage?.code,
                    translationStatus: translationStatusFilter,
                    skip,
                    take: FEEDBACK_PAGINATION_LIMIT,
                };

                let result: PaginationResult<FeedbackListItem>;
                if (category === FeedbackCategory.HISTORY) {
                    result = await FeedbackApi.fetchHistory(client, params);
                } else if (category === FeedbackCategory.REVIEWS) {
                    result = await FeedbackApi.fetchReviews(client, params);
                } else {
                    result = await FeedbackApi.fetchVideos(client, params);
                }

                if (requestId !== latestRequestId.current) return;

                setItems((prev) => (skip === 0 ? result.items : [...prev, ...result.items]));
                setHasMore(skip + result.items.length < result.totalItemsCount);
            } catch {
                if (requestId !== latestRequestId.current) return;
                setError({ message: FEEDBACK_TEXT.MESSAGE.FAIL_TO_FETCH_ITEMS, type: 'fetch' });
            } finally {
                if (requestId === latestRequestId.current) {
                    setIsLoading(false);
                }
            }
        },
        [client, statusFilter, selectedLanguage, translationStatusFilter, selectedSearchItem],
    );

    useEffect(() => {
        if (!selectedSearchItem) {
            setItems([]);
            fetchCategoryItems(activeCategory);
        }
    }, [activeCategory, fetchCategoryItems, selectedSearchItem]);

    const handleAddHistorySuccess = useCallback(
        (_newHistory: FeedbackHistoryDto) => {
            setSelectedSearchItem(null);
            fetchCategoryItems(activeCategory, 0);
            addToast(FEEDBACK_TEXT.MESSAGE.SUCCESS_PUBLISH, ToastType.Success);
        },
        [fetchCategoryItems, activeCategory, addToast],
    );

    const handleAddVideoReviewSubmit = useCallback(
        async (data: { title: string; link: string }) => {
            try {
                await FeedbackApi.createVideoReview(client, {
                    ...data,
                    status: VisibilityStatus.Published,
                });
                setSelectedSearchItem(null);
                fetchCategoryItems(activeCategory, 0);
                addToast(FEEDBACK_TEXT.MESSAGE.SUCCESS_PUBLISH, ToastType.Success);
                return true;
            } catch {
                addToast(FEEDBACK_TEXT.MESSAGE.FAIL_TO_PUBLISH, ToastType.Error);
                return false;
            }
        },
        [client, fetchCategoryItems, activeCategory, addToast],
    );

    const handleAddReviewSuccess = useCallback(() => {
        setSelectedSearchItem(null);
        fetchCategoryItems(activeCategory, 0);
        addToast(FEEDBACK_TEXT.MESSAGE.SUCCESS_PUBLISH, ToastType.Success);
    }, [fetchCategoryItems, activeCategory, addToast]);

    const handleEditHistorySuccess = useCallback(
        (updatedHistory: FeedbackHistoryDto) => {
            if (selectedSearchItem?.id === updatedHistory.id) {
                setSelectedSearchItem(updatedHistory);
            }
            const passesStatusFilter = statusFilter === undefined || updatedHistory.status === statusFilter;

            if (passesStatusFilter) {
                setItems((prev) => prev.map((item) => (item.id === updatedHistory.id ? updatedHistory : item)));
            } else {
                setItems((prev) => prev.filter((item) => item.id !== updatedHistory.id));
            }
            addToast(FEEDBACK_TEXT.MESSAGE.SUCCESS_UPDATE, ToastType.Success);
        },
        [selectedSearchItem, statusFilter, addToast],
    );

    const getFeedbackSearchItems = useCallback(
        async (
            searchTerm: string,
            requestOptions?: PaginationRequestParams & { skip?: number; take?: number },
        ): Promise<PaginationResult<any>> => {
            const skip = requestOptions?.skip ?? requestOptions?.offset ?? 0;
            const take = requestOptions?.take ?? requestOptions?.limit ?? FEEDBACK_PAGINATION_LIMIT;
            const params = {
                status: statusFilter,
                language: selectedLanguage?.code,
                translationStatus: translationStatusFilter,
                searchTerm,
                skip,
                take,
            };
            if (activeCategory === FeedbackCategory.HISTORY) return FeedbackApi.fetchHistory(client, params);
            if (activeCategory === FeedbackCategory.REVIEWS) return FeedbackApi.fetchReviews(client, params);
            return FeedbackApi.fetchVideos(client, params);
        },
        [client, activeCategory, statusFilter, selectedLanguage, translationStatusFilter],
    );

    const onStatusFilterChange = useCallback((status: VisibilityStatus | undefined) => {
        setStatusFilter(status);
    }, []);

    const handleCategorySelect = useCallback((category: FeedbackCategoryItem) => {
        setActiveCategory(category.id);
        setSelectedSearchItem(null);
    }, []);

    const handleSearchItemSelect = useCallback((key: string | number, item: FeedbackListItem) => {
        setSelectedSearchItem(item);
        setStatusFilter(undefined);
    }, []);

    const handleSearchClearSelection = useCallback(() => {
        const wasSelected = selectedSearchItem !== null;
        setSelectedSearchItem(null);
        setStatusFilter(undefined);
        if (!wasSelected) {
            fetchCategoryItems(activeCategory);
        }
    }, [selectedSearchItem, activeCategory, fetchCategoryItems]);

    const handleEntitiesReordered = useCallback(
        async (reorderedItems: FeedbackListItem[]) => {
            if (selectedSearchItem) return;
            const previousItems = items;
            setItems(reorderedItems);
            const orderedIds = reorderedItems.map((item) => item.id);
            try {
                setError({ message: null, type: null });
                await FeedbackApi.reorderFeedback(client, activeCategory, orderedIds);
            } catch {
                setError({
                    message: FEEDBACK_TEXT.MESSAGE.FAIL_TO_REORDER,
                    type: 'reorder',
                    reorderData: {
                        category: activeCategory,
                        orderedIds,
                        previousItems,
                    },
                });
            }
        },
        [client, activeCategory, selectedSearchItem, items],
    );

    const handleRetry = useCallback(async () => {
        if (error.type === 'languages') {
            retryFetchLanguages();
        } else if (error.type === 'reorder' && error.reorderData) {
            const { category, orderedIds } = error.reorderData;
            setError({ message: null, type: null });
            try {
                await FeedbackApi.reorderFeedback(client, category, orderedIds);
            } catch {
                setError({
                    message: FEEDBACK_TEXT.MESSAGE.FAIL_TO_REORDER,
                    type: 'reorder',
                    reorderData: error.reorderData,
                });
            }
        } else {
            fetchCategoryItems(activeCategory);
        }
    }, [error, retryFetchLanguages, client, activeCategory, fetchCategoryItems]);

    const itemToTranslate = modalState.itemToTranslate ?? modalState.itemToEditTranslation;
    const historyToTranslate = itemToTranslate && isFeedbackHistory(itemToTranslate) ? itemToTranslate : null;
    const reviewToTranslate = itemToTranslate && isFeedbackReview(itemToTranslate) ? itemToTranslate : null;
    const videoToTranslate = itemToTranslate && isFeedbackVideo(itemToTranslate) ? itemToTranslate : null;

    const itemsToRender = useMemo(() => {
        if (selectedSearchItem) {
            return [selectedSearchItem];
        }
        return items;
    }, [selectedSearchItem, items]);

    const hasMoreToShow = useMemo(() => {
        if (selectedSearchItem) return false;
        return hasMore;
    }, [selectedSearchItem, hasMore]);

    const renderFeedbackItem = useCallback(
        (item: FeedbackListItem) => (
            <DraggableListItem
                key={item.id}
                entity={item}
                id={item.id}
                ariaLabel={FEEDBACK_TEXT.ACTIONS.REORDER}
                renderEntityComponent={(i) => (
                    <FeedbackComponent
                        key={i.id}
                        item={i}
                        showPhoto={activeCategory === FeedbackCategory.HISTORY}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onTranslate={handleTranslateClick}
                    />
                )}
                entities={itemsToRender}
                idSelector={(i) => i.id}
                onEntitiesReordered={handleEntitiesReordered}
            />
        ),
        [
            itemsToRender,
            activeCategory,
            handleEntitiesReordered,
            handleEditClick,
            handleDeleteClick,
            handleTranslateClick,
        ],
    );

    const isFilteredView =
        Boolean(selectedSearchItem) || statusFilter !== undefined || translationStatusFilter !== undefined;

    return (
        <div className="feedback-page-wrapper" data-testid="feedback-page-content">
            <div className="feedback-page-toolbar-container">
                <AdminPanelToolbar<any>
                    getSearchItemKey={(item) => item.id}
                    getSearchItemLabel={(item) => item.title || item.authorName || ''}
                    fetchSearchItems={getFeedbackSearchItems}
                    placeholder={searchPlaceholder}
                    onSearchClear={handleSearchClearSelection}
                    statusFilter={statusFilter}
                    onStatusFilterChange={onStatusFilterChange}
                    onAddItem={handleAddItemClick}
                    AddItemButtonText={FEEDBACK_TEXT.BUTTON.ADD_MATERIAL}
                    onSuggestionSelect={handleSearchItemSelect}
                    languages={allLanguages}
                    onLanguageChange={onLanguageChange}
                    onTranslationStatusFilterChange={onTranslationStatusFilterChange}
                    maxCharactersToSearch={UI_CONFIG.SEARCH_BAR.MAX_CHARACTERS_FOR_SEARCH.FEEDBACK}
                    searchPageSize={FEEDBACK_PAGINATION_LIMIT}
                />
            </div>

            <div className="feedback-page-list-container">
                <CategoryBar<FeedbackCategoryItem>
                    categories={FEEDBACK_CATEGORIES}
                    selectedCategory={selectedCategoryItem}
                    getCategoryDisplayName={(item) => item.name}
                    getCategoryKey={(item) => item.id}
                    onCategorySelect={handleCategorySelect}
                    displayContextMenuButton={false}
                />

                {error.message && (
                    <div className="feedback-page-error-container" data-testid="feedback-error-container">
                        <span>{error.message}</span>
                        <button onClick={handleRetry} type="button" className="retry-link">
                            {COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN}
                        </button>
                    </div>
                )}

                <InfiniteScrollList<FeedbackListItem>
                    items={itemsToRender}
                    renderItem={renderFeedbackItem}
                    onLoadMore={() => fetchCategoryItems(activeCategory, items.length)}
                    hasMore={hasMoreToShow}
                    isLoading={isLoading}
                    emptyStateMessage={
                        isFilteredView ? COMMON_TEXT_ADMIN.LIST.NOT_FOUND : FEEDBACK_TEXT.LIST.NO_MATERIALS
                    }
                    emptyStateAction={
                        !isFilteredView ? (
                            <Button buttonStyle="secondary" onClick={handleAddItemClick}>
                                {FEEDBACK_TEXT.BUTTON.ADD_MATERIAL}
                            </Button>
                        ) : undefined
                    }
                />
            </div>

            <DeleteFeedbackModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                category={itemToDelete?.category ?? activeCategory}
                itemToDelete={itemToDelete?.item ?? null}
                onDeleteItem={handleDeleteConfirm}
            />
            <AddFeedbackHistoryModal
                isOpen={isAddHistoryModalOpen}
                onClose={() => {
                    setIsAddHistoryModalOpen(false);
                    setHistoryToEdit(null);
                }}
                onAddHistory={handleAddHistorySuccess}
                onEditHistory={handleEditHistorySuccess}
                initialData={historyToEdit || undefined}
            />
            <AddVideoReviewModal
                isOpen={isAddVideoReviewModalOpen}
                onClose={() => setIsAddVideoReviewModalOpen(false)}
                onSubmit={handleAddVideoReviewSubmit}
            />
            <AddFeedbackReviewModal
                isOpen={isAddReviewModalOpen}
                onClose={() => {
                    setIsAddReviewModalOpen(false);
                    setReviewToEdit(null);
                }}
                onAddReview={handleAddReviewSuccess}
                onEditReview={handleEditReviewSuccess}
                onSubmitError={handleReviewSubmitError}
                initialData={reviewToEdit || undefined}
            />
            <TranslateFeedbackHistoryModal
                isOpen={!!historyToTranslate}
                onClose={handleCloseTranslateModal}
                historyToTranslate={historyToTranslate}
                onTranslateHistory={handleTranslateSuccess}
                translatedLanguages={translationLanguages}
            />
            <TranslateFeedbackReviewModal
                isOpen={!!reviewToTranslate}
                onClose={handleCloseTranslateModal}
                reviewToTranslate={reviewToTranslate}
                onTranslateReview={handleTranslateSuccess}
                translatedLanguages={translationLanguages}
            />
            <TranslateFeedbackVideoModal
                isOpen={!!videoToTranslate}
                onClose={handleCloseTranslateModal}
                videoToTranslate={videoToTranslate}
                onTranslateVideo={handleTranslateSuccess}
                translatedLanguages={translationLanguages}
            />
            <ToastContainer />
        </div>
    );
};
