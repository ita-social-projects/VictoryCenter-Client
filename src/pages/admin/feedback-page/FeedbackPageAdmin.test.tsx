import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeedbackPageAdmin } from './FeedbackPageAdmin';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { FeedbackCategory } from '@/types/admin/feedback';
import { ToastType } from '@/types/admin/toast';
import { VisibilityStatus } from '@/types/admin/common';

beforeAll(() => {
    class MockResizeObserver {
        observe = jest.fn();
        unobserve = jest.fn();
        disconnect = jest.fn();
    }
    global.ResizeObserver = MockResizeObserver as any;
    window.ResizeObserver = MockResizeObserver as any;
});

const mockAdminClient = { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() };
jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => mockAdminClient,
}));

let mockLocalizationValues = {
    allLanguages: [{ id: 1, code: 'uk', name: 'Українська' }],
    selectedLanguage: { id: 1, code: 'uk', name: 'Українська' },
    translationStatusFilter: 0,
    onLanguageChange: jest.fn(),
    onTranslationStatusFilterChange: jest.fn(),
};

jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit', () => ({
    useLocalizationToolkit: () => mockLocalizationValues,
}));

const mockAddToast = jest.fn();
jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: () => ({
        addToast: mockAddToast,
        toasts: [],
        removeToast: jest.fn(),
    }),
}));

jest.mock('@/components/admin/admin-panel-toolbar/AdminPageToolbar', () => ({
    AdminPanelToolbar: ({
        placeholder,
        AddItemButtonText,
        onAddItem,
        onStatusFilterChange,
        fetchSearchItems,
        getSearchItemKey,
        getSearchItemLabel,
        onSearchClear,
        onSuggestionSelect,
    }: any) => {
        getSearchItemKey?.({ id: 1 });
        getSearchItemLabel?.({ id: 1, title: 'Item Title' });
        getSearchItemLabel?.({ id: 2, authorName: 'Author Name' });
        getSearchItemLabel?.({ id: 3 });
        onSearchClear?.();
        onSuggestionSelect?.();

        return (
            <div data-testid="feedback-toolbar">
                <span data-testid="toolbar-placeholder">{placeholder}</span>
                <button data-testid="toolbar-add-button" onClick={onAddItem}>
                    {AddItemButtonText}
                </button>
                <button data-testid="toolbar-filter-published" onClick={() => onStatusFilterChange?.(1)}>
                    Filter Published
                </button>
                <button data-testid="toolbar-fetch-search" onClick={() => fetchSearchItems?.()}>
                    Trigger Search
                </button>
            </div>
        );
    },
}));

jest.mock('@/components/admin/draggable-list-item/DraggableListItem', () => ({
    DraggableListItem: ({ entity, renderEntityComponent, entities, onEntitiesReordered, idSelector }: any) => {
        idSelector?.(entity);
        return (
            <div data-testid={`draggable-item-${entity.id}`}>
                {renderEntityComponent(entity)}
                <button
                    data-testid={`trigger-reorder-${entity.id}`}
                    onClick={() => {
                        const reversed = [...entities].reverse();
                        onEntitiesReordered(reversed);
                    }}
                >
                    Reorder
                </button>
            </div>
        );
    },
}));

jest.mock('@/components/admin/infinite-scroll-list/InfiniteScrollList', () => ({
    InfiniteScrollList: ({ items, renderItem, onLoadMore, isLoading, emptyStateMessage }: any) => (
        <div data-testid="infinite-scroll-list">
            {isLoading && <div data-testid="infinite-scroll-loader">Loading...</div>}
            {items.length === 0 && !isLoading && <div data-testid="empty-state">{emptyStateMessage}</div>}
            {items.map((item: any) => (
                <div key={item.id} data-testid={`list-item-${item.id}`}>
                    {renderItem(item)}
                </div>
            ))}
            <button data-testid="load-more-btn" onClick={onLoadMore}>
                Load More
            </button>
        </div>
    ),
}));

jest.mock('@/services/api/admin/feedback/feedback-api', () => ({
    FeedbackApi: {
        fetchHistory: jest.fn(),
        fetchReviews: jest.fn(),
        fetchVideos: jest.fn(),
        reorderFeedback: jest.fn(),
    },
}));

const mockFeedbackApi = FeedbackApi as jest.Mocked<typeof FeedbackApi>;

const mockHistoryData = {
    items: [
        {
            id: 1,
            title: 'Історія 1',
            story: 'Опис історії 1',
            image: null,
            status: VisibilityStatus.Published,
            priority: 0,
        },
        {
            id: 2,
            title: 'Історія 2',
            story: 'Опис історії 2',
            image: null,
            status: VisibilityStatus.Published,
            priority: 1,
        },
    ],
    totalItemsCount: 2,
};

const mockReviewsData = {
    items: [
        {
            id: 10,
            authorName: 'Учасник 10',
            text: 'Відгук учасника 10',
            status: VisibilityStatus.Published,
            priority: 0,
        },
    ],
    totalItemsCount: 1,
};

const mockVideosData = {
    items: [
        {
            id: 20,
            title: 'Відео 20',
            videoUrl: 'https://youtube.com/watch?v=20',
            status: VisibilityStatus.Published,
            priority: 0,
        },
    ],
    totalItemsCount: 1,
};

describe('FeedbackPageAdmin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFeedbackApi.fetchHistory.mockResolvedValue(mockHistoryData);
        mockFeedbackApi.fetchReviews.mockResolvedValue(mockReviewsData);
        mockFeedbackApi.fetchVideos.mockResolvedValue(mockVideosData);
        mockFeedbackApi.reorderFeedback.mockResolvedValue();
    });

    it('should render page content with toolbar, categories and list container', async () => {
        render(<FeedbackPageAdmin />);

        expect(screen.getByTestId('feedback-page-content')).toBeInTheDocument();
        expect(screen.getByText(FEEDBACK_TEXT.BUTTON.ADD_MATERIAL)).toBeInTheDocument();
        expect(screen.getByText(FEEDBACK_TEXT.TABS.HISTORY)).toBeInTheDocument();
        expect(screen.getByText(FEEDBACK_TEXT.TABS.REVIEWS)).toBeInTheDocument();
        expect(screen.getByText(FEEDBACK_TEXT.TABS.VIDEOS)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Історія 1')).toBeInTheDocument();
            expect(screen.getByText('Історія 2')).toBeInTheDocument();
        });

        expect(mockFeedbackApi.fetchHistory).toHaveBeenCalledTimes(1);
    });

    it('should switch categories and fetch corresponding items', async () => {
        render(<FeedbackPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Історія 1')).toBeInTheDocument();
        });

        // Switch to Reviews tab
        const reviewsTab = screen.getByText(FEEDBACK_TEXT.TABS.REVIEWS);
        fireEvent.click(reviewsTab);

        await waitFor(() => {
            expect(screen.getByText('Учасник 10')).toBeInTheDocument();
        });
        expect(mockFeedbackApi.fetchReviews).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('toolbar-placeholder')).toHaveTextContent(FEEDBACK_TEXT.PLACEHOLDER.SEARCH_REVIEWS);

        // Switch to Videos tab
        const videosTab = screen.getByText(FEEDBACK_TEXT.TABS.VIDEOS);
        fireEvent.click(videosTab);

        await waitFor(() => {
            expect(screen.getByText('Відео 20')).toBeInTheDocument();
        });
        expect(mockFeedbackApi.fetchVideos).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('toolbar-placeholder')).toHaveTextContent(FEEDBACK_TEXT.PLACEHOLDER.SEARCH_VIDEOS);
    });

    it('should call addToast when Add button in toolbar is clicked', async () => {
        render(<FeedbackPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Історія 1')).toBeInTheDocument();
        });

        const addBtn = screen.getByTestId('toolbar-add-button');
        fireEvent.click(addBtn);

        expect(mockAddToast).toHaveBeenCalledWith('Функція не реалізована', ToastType.Info);
    });

    it('should call addToast when Edit or Delete button on a card is clicked', async () => {
        render(<FeedbackPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Історія 1')).toBeInTheDocument();
        });

        const editBtns = screen.getAllByRole('button', { name: FEEDBACK_TEXT.ACTIONS.EDIT });
        fireEvent.click(editBtns[0]);
        expect(mockAddToast).toHaveBeenCalledWith('Функція не реалізована', ToastType.Info);

        const deleteBtns = screen.getAllByRole('button', { name: FEEDBACK_TEXT.ACTIONS.DELETE });
        fireEvent.click(deleteBtns[0]);
        expect(mockAddToast).toHaveBeenCalledWith('Функція не реалізована', ToastType.Info);
    });

    it('should refetch items when status filter changes', async () => {
        render(<FeedbackPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Історія 1')).toBeInTheDocument();
        });

        const filterBtn = screen.getByTestId('toolbar-filter-published');
        fireEvent.click(filterBtn);

        await waitFor(() => {
            expect(mockFeedbackApi.fetchHistory).toHaveBeenCalledWith(
                mockAdminClient,
                expect.objectContaining({ status: VisibilityStatus.Published }),
            );
        });
    });

    it('should show error container when fetching items fails and allow retrying', async () => {
        mockFeedbackApi.fetchHistory.mockRejectedValueOnce(new Error('Network error'));

        render(<FeedbackPageAdmin />);

        await waitFor(() => {
            expect(screen.getByTestId('feedback-error-container')).toBeInTheDocument();
            expect(screen.getByText(FEEDBACK_TEXT.MESSAGE.FAIL_TO_FETCH_ITEMS)).toBeInTheDocument();
        });

        // Click retry button
        const retryBtn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN });
        fireEvent.click(retryBtn);

        await waitFor(() => {
            expect(screen.getByText('Історія 1')).toBeInTheDocument();
        });
    });

    it('should handle reordering items and call FeedbackApi.reorderFeedback', async () => {
        render(<FeedbackPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Історія 1')).toBeInTheDocument();
        });

        const reorderBtn = screen.getByTestId('trigger-reorder-1');
        fireEvent.click(reorderBtn);

        expect(mockFeedbackApi.reorderFeedback).toHaveBeenCalledWith(mockAdminClient, FeedbackCategory.HISTORY, [2, 1]);
    });

    it('should display error message if reordering fails', async () => {
        mockFeedbackApi.reorderFeedback.mockRejectedValueOnce(new Error('Reorder failure'));

        render(<FeedbackPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Історія 1')).toBeInTheDocument();
        });

        const reorderBtn = screen.getByTestId('trigger-reorder-1');
        fireEvent.click(reorderBtn);

        await waitFor(() => {
            expect(screen.getByText(FEEDBACK_TEXT.MESSAGE.FAIL_TO_REORDER)).toBeInTheDocument();
        });
    });

    it('should guard against race conditions when switching categories quickly', async () => {
        let resolveHistoryPromise: (val: any) => void;
        const delayedHistoryPromise = new Promise((resolve) => {
            resolveHistoryPromise = resolve;
        });

        mockFeedbackApi.fetchHistory.mockReturnValueOnce(delayedHistoryPromise as any);
        mockFeedbackApi.fetchReviews.mockResolvedValueOnce(mockReviewsData);

        render(<FeedbackPageAdmin />);

        // Switch to Reviews while History request is still pending
        const reviewsTab = screen.getByText(FEEDBACK_TEXT.TABS.REVIEWS);
        fireEvent.click(reviewsTab);

        await waitFor(() => {
            expect(screen.getByText('Учасник 10')).toBeInTheDocument();
        });

        // Now late History response resolves
        await act(async () => {
            resolveHistoryPromise!(mockHistoryData);
            await new Promise((resolve) => setTimeout(resolve, 50));
        });

        expect(screen.getByText('Учасник 10')).toBeInTheDocument();
        expect(screen.queryByText('Історія 1')).not.toBeInTheDocument();
    });

    it('should invoke fetchSearchItems callback according to active category', async () => {
        render(<FeedbackPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Історія 1')).toBeInTheDocument();
        });

        mockFeedbackApi.fetchHistory.mockClear();
        const triggerSearchBtn = screen.getByTestId('toolbar-fetch-search');
        fireEvent.click(triggerSearchBtn);

        expect(mockFeedbackApi.fetchHistory).toHaveBeenCalledTimes(1);

        // Switch to Reviews and trigger search
        const reviewsTab = screen.getByText(FEEDBACK_TEXT.TABS.REVIEWS);
        fireEvent.click(reviewsTab);

        await waitFor(() => {
            expect(screen.getByText('Учасник 10')).toBeInTheDocument();
        });
        mockFeedbackApi.fetchReviews.mockClear();

        fireEvent.click(triggerSearchBtn);
        expect(mockFeedbackApi.fetchReviews).toHaveBeenCalledTimes(1);

        // Switch to Videos and trigger search
        const videosTab = screen.getByText(FEEDBACK_TEXT.TABS.VIDEOS);
        fireEvent.click(videosTab);

        await waitFor(() => {
            expect(screen.getByText('Відео 20')).toBeInTheDocument();
        });
        mockFeedbackApi.fetchVideos.mockClear();

        fireEvent.click(triggerSearchBtn);
        expect(mockFeedbackApi.fetchVideos).toHaveBeenCalledTimes(1);
    });

    it('should trigger fetchCategoryItems when onLoadMore is called', async () => {
        render(<FeedbackPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Історія 1')).toBeInTheDocument();
        });

        const loadMoreBtn = screen.getByTestId('load-more-btn');
        fireEvent.click(loadMoreBtn);

        expect(mockFeedbackApi.fetchHistory).toHaveBeenCalledTimes(2);
    });
});
