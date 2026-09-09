import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '@/const/admin/common';
import { AdminPanelToolbar } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { PaginationRequestParams } from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { FeedbackCategory, FeedbackCategoryItem, FeedbackHistoryDto, FeedbackListItem } from '@/types/admin/feedback';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { FEEDBACK_CATEGORIES, FEEDBACK_PAGINATION_LIMIT, FEEDBACK_TEXT } from '@/const/admin/feedback';
import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { InfiniteScrollList } from '@/components/admin/infinite-scroll-list/InfiniteScrollList';
import { DraggableListItem } from '@/components/admin/draggable-list-item/DraggableListItem';
import { FeedbackComponent } from './components/feedback-component/FeedbackComponent';
import { DeleteFeedbackHistoryModal } from './components/delete-feedback-history-modal/DeleteFeedbackHistoryModal';
import { AddFeedbackHistoryModal } from './components/add-feedback-history-modal/AddFeedbackHistoryModal';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import './FeedbackPageAdmin.scss';

const SEARCH_PLACEHOLDERS: Record<FeedbackCategory, string> = {
    [FeedbackCategory.HISTORY]: FEEDBACK_TEXT.PLACEHOLDER.SEARCH_HISTORY,
    [FeedbackCategory.REVIEWS]: FEEDBACK_TEXT.PLACEHOLDER.SEARCH_REVIEWS,
    [FeedbackCategory.VIDEOS]: FEEDBACK_TEXT.PLACEHOLDER.SEARCH_VIDEOS,
};

export const isFeedbackHistory = (item: FeedbackListItem): item is FeedbackHistoryDto =>
    typeof item === 'object' && item !== null && 'story' in item;

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
        selectedLanguage,
        translationStatusFilter,
        onLanguageChange,
        onTranslationStatusFilterChange,
        retryFetchLanguages,
    } = useLocalizationToolkit({
        setErrorState: setErrorState as any,
    });

    const selectedCategoryItem = useMemo(
        () => FEEDBACK_CATEGORIES.find((c) => c.id === activeCategory) || FEEDBACK_CATEGORIES[0],
        [activeCategory],
    );

    const handleNotImplemented = useCallback(() => {
        addToast('Функція не реалізована', ToastType.Info);
    }, [addToast]);

    const [historyToDelete, setHistoryToDelete] = useState<FeedbackHistoryDto | null>(null);
    const [isAddHistoryModalOpen, setIsAddHistoryModalOpen] = useState<boolean>(false);

    const handleAddItemClick = useCallback(() => {
        if (activeCategory === FeedbackCategory.HISTORY) {
            setIsAddHistoryModalOpen(true);
        } else {
            handleNotImplemented();
        }
    }, [activeCategory, handleNotImplemented]);

    const handleAddHistorySuccess = useCallback(
        (newHistory: FeedbackHistoryDto) => {
            setItems((prev) => [newHistory, ...prev]);
            addToast(FEEDBACK_TEXT.MESSAGE.SUCCESS_ADD_HISTORY, ToastType.Success);
        },
        [addToast],
    );

    const handleDeleteClick = useCallback(
        (item: FeedbackListItem) => {
            if (activeCategory === FeedbackCategory.HISTORY && isFeedbackHistory(item)) {
                setHistoryToDelete(item);
            } else {
                handleNotImplemented();
            }
        },
        [activeCategory, handleNotImplemented],
    );

    const handleDeleteHistoryConfirm = useCallback(
        (deletedHistory: FeedbackHistoryDto) => {
            setItems((prev) => prev.filter((item) => item.id !== deletedHistory.id));
            if (selectedSearchItem?.id === deletedHistory.id) {
                setSelectedSearchItem(null);
            }
            addToast(FEEDBACK_TEXT.MESSAGE.SUCCESS_DELETE_HISTORY, ToastType.Success);
        },
        [selectedSearchItem, addToast],
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
                        onEdit={handleNotImplemented}
                        onDelete={handleDeleteClick}
                    />
                )}
                entities={itemsToRender}
                idSelector={(i) => i.id}
                onEntitiesReordered={handleEntitiesReordered}
            />
        ),
        [itemsToRender, activeCategory, handleEntitiesReordered, handleNotImplemented, handleDeleteClick],
    );

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
                    emptyStateMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                />
            </div>

            <DeleteFeedbackHistoryModal
                isOpen={!!historyToDelete}
                onClose={() => setHistoryToDelete(null)}
                historyToDelete={historyToDelete}
                onDeleteHistory={handleDeleteHistoryConfirm}
            />
            <AddFeedbackHistoryModal
                isOpen={isAddHistoryModalOpen}
                onClose={() => setIsAddHistoryModalOpen(false)}
                onAddHistory={handleAddHistorySuccess}
            />
            <ToastContainer />
        </div>
    );
};
