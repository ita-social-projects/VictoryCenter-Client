import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '@/const/admin/common';
import { AdminPanelToolbar } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { FeedbackCategory, FeedbackCategoryItem, FeedbackListItem } from '@/types/admin/feedback';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { FEEDBACK_CATEGORIES, FEEDBACK_TEXT } from '@/const/admin/feedback';
import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { InfiniteScrollList } from '@/components/admin/infinite-scroll-list/InfiniteScrollList';
import { DraggableListItem } from '@/components/admin/draggable-list-item/DraggableListItem';
import { FeedbackComponent } from './components/feedback-component/FeedbackComponent';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import './FeedbackPageAdmin.scss';

export const FeedbackPageAdmin = () => {
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [error, setError] = useState<{ message: string | null; type: string | null }>({ message: null, type: null });
    const [activeCategory, setActiveCategory] = useState<FeedbackCategory>(FeedbackCategory.HISTORY);
    const [items, setItems] = useState<FeedbackListItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(false);

    const client = useAdminClient();
    const { addToast } = useToast();

    const setErrorState = useCallback((message: string, type: string) => setError({ message, type }), []);
    const {
        allLanguages,
        selectedLanguage,
        translationStatusFilter,
        onLanguageChange,
        onTranslationStatusFilterChange,
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

    const searchPlaceholder = useMemo(() => {
        switch (activeCategory) {
            case FeedbackCategory.HISTORY:
                return FEEDBACK_TEXT.PLACEHOLDER.SEARCH_HISTORY;
            case FeedbackCategory.REVIEWS:
                return FEEDBACK_TEXT.PLACEHOLDER.SEARCH_REVIEWS;
            case FeedbackCategory.VIDEOS:
                return FEEDBACK_TEXT.PLACEHOLDER.SEARCH_VIDEOS;
            default:
                return FEEDBACK_TEXT.PLACEHOLDER.SEARCH_HISTORY;
        }
    }, [activeCategory]);

    const latestRequestId = useRef<number>(0);

    const fetchCategoryItems = useCallback(
        async (category: FeedbackCategory) => {
            const requestId = ++latestRequestId.current;
            try {
                setIsLoading(true);
                setError({ message: null, type: null });

                const params = {
                    status: statusFilter,
                    language: selectedLanguage?.code,
                    translationStatus: translationStatusFilter,
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

                setItems(result.items);
                setHasMore(false);
            } catch {
                if (requestId !== latestRequestId.current) return;
                setError({ message: FEEDBACK_TEXT.MESSAGE.FAIL_TO_FETCH_ITEMS, type: 'fetch' });
            } finally {
                if (requestId === latestRequestId.current) {
                    setIsLoading(false);
                }
            }
        },
        [client, statusFilter, selectedLanguage, translationStatusFilter],
    );

    useEffect(() => {
        setItems([]);
        fetchCategoryItems(activeCategory);
    }, [activeCategory, fetchCategoryItems]);

    const getFeedbackSearchItems = useCallback(async (): Promise<PaginationResult<any>> => {
        const params = {
            status: statusFilter,
            language: selectedLanguage?.code,
            translationStatus: translationStatusFilter,
        };
        if (activeCategory === FeedbackCategory.HISTORY) return FeedbackApi.fetchHistory(client, params);
        if (activeCategory === FeedbackCategory.REVIEWS) return FeedbackApi.fetchReviews(client, params);
        return FeedbackApi.fetchVideos(client, params);
    }, [client, activeCategory, statusFilter, selectedLanguage, translationStatusFilter]);

    const onStatusFilterChange = useCallback((status: VisibilityStatus | undefined) => {
        setStatusFilter(status);
    }, []);

    const handleCategorySelect = useCallback((category: FeedbackCategoryItem) => {
        setActiveCategory(category.id);
    }, []);

    const handleEntitiesReordered = useCallback(
        async (reorderedItems: FeedbackListItem[]) => {
            setItems(reorderedItems);
            try {
                const orderedIds = reorderedItems.map((item) => item.id);
                await FeedbackApi.reorderFeedback(client, activeCategory, orderedIds);
            } catch {
                setError({ message: FEEDBACK_TEXT.MESSAGE.FAIL_TO_REORDER || 'Failed to reorder', type: 'reorder' });
            }
        },
        [client, activeCategory],
    );

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
                        onDelete={handleNotImplemented}
                    />
                )}
                entities={items}
                idSelector={(i) => i.id}
                onEntitiesReordered={handleEntitiesReordered}
            />
        ),
        [items, activeCategory, handleEntitiesReordered, handleNotImplemented],
    );

    return (
        <div className="feedback-page-wrapper" data-testid="feedback-page-content">
            <div className="feedback-page-toolbar-container">
                <AdminPanelToolbar<any>
                    getSearchItemKey={(item) => item.id}
                    getSearchItemLabel={(item) => item.title || item.authorName || ''}
                    fetchSearchItems={getFeedbackSearchItems}
                    placeholder={searchPlaceholder}
                    onSearchClear={() => null}
                    statusFilter={statusFilter}
                    onStatusFilterChange={onStatusFilterChange}
                    onAddItem={handleNotImplemented}
                    AddItemButtonText={FEEDBACK_TEXT.BUTTON.ADD_MATERIAL}
                    onSuggestionSelect={() => null}
                    languages={allLanguages}
                    onLanguageChange={onLanguageChange}
                    onTranslationStatusFilterChange={onTranslationStatusFilterChange}
                    maxCharactersToSearch={UI_CONFIG.SEARCH_BAR.MAX_CHARACTERS_FOR_SEARCH.FEEDBACK}
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
                        <button onClick={() => fetchCategoryItems(activeCategory)} type="button" className="retry-link">
                            {COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN}
                        </button>
                    </div>
                )}

                <InfiniteScrollList<FeedbackListItem>
                    items={items}
                    renderItem={renderFeedbackItem}
                    onLoadMore={() => fetchCategoryItems(activeCategory)}
                    hasMore={hasMore}
                    isLoading={isLoading}
                    emptyStateMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                />
            </div>
            <ToastContainer />
        </div>
    );
};
