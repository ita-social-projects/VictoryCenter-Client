import { useCallback, useState, useMemo, useEffect } from 'react';
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
import './FeedbackPageAdmin.scss';

export const FeedbackPageAdmin = () => {
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [error, setError] = useState<{ message: string | null; type: string | null }>({ message: null, type: null });
    const [activeCategory, setActiveCategory] = useState<FeedbackCategory>(FeedbackCategory.HISTORY);
    const [items, setItems] = useState<FeedbackListItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(false);

    const client = useAdminClient();

    const setErrorState = useCallback((message: string, type: string) => setError({ message, type }), []);
    const { allLanguages, onLanguageChange, onTranslationStatusFilterChange } = useLocalizationToolkit({
        setErrorState: setErrorState as any,
    });

    const selectedCategoryItem = useMemo(
        () => FEEDBACK_CATEGORIES.find((c) => c.id === activeCategory) || FEEDBACK_CATEGORIES[0],
        [activeCategory],
    );

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

    const fetchCategoryItems = useCallback(
        async (category: FeedbackCategory) => {
            try {
                setIsLoading(true);
                setError({ message: null, type: null });

                let result: PaginationResult<FeedbackListItem>;
                if (category === FeedbackCategory.HISTORY) {
                    result = await FeedbackApi.fetchHistory(client);
                } else if (category === FeedbackCategory.REVIEWS) {
                    result = await FeedbackApi.fetchReviews(client);
                } else {
                    result = await FeedbackApi.fetchVideos(client);
                }

                setItems(result.items);
                setHasMore(false);
            } catch {
                setError({ message: FEEDBACK_TEXT.MESSAGE.FAIL_TO_FETCH_ITEMS, type: 'fetch' });
            } finally {
                setIsLoading(false);
            }
        },
        [client],
    );

    useEffect(() => {
        fetchCategoryItems(activeCategory);
    }, [activeCategory, fetchCategoryItems]);

    const getFeedbackSearchItems = useCallback(async (): Promise<PaginationResult<any>> => {
        if (activeCategory === FeedbackCategory.HISTORY) return FeedbackApi.fetchHistory(client);
        if (activeCategory === FeedbackCategory.REVIEWS) return FeedbackApi.fetchReviews(client);
        return FeedbackApi.fetchVideos(client);
    }, [client, activeCategory]);

    const onStatusFilterChange = useCallback((status: VisibilityStatus | undefined) => {
        setStatusFilter(status);
    }, []);

    const handleCategorySelect = useCallback((category: FeedbackCategoryItem) => {
        setActiveCategory(category.id);
    }, []);

    const handleEntitiesReordered = useCallback((reorderedItems: FeedbackListItem[]) => {
        setItems(reorderedItems);
    }, []);

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
                        onEdit={() => null}
                        onDelete={() => null}
                    />
                )}
                entities={items}
                idSelector={(i) => i.id}
                onEntitiesReordered={handleEntitiesReordered}
            />
        ),
        [items, activeCategory, handleEntitiesReordered],
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
                    onAddItem={() => null}
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
        </div>
    );
};
