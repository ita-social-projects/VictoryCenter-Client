import React from 'react';
import { render, screen } from '@testing-library/react';
import { EventsNews } from '@/types/public/events-news';

import { RecommendedArticles } from './RecommendedArticles';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

const mockUseDataPaginationFetch = jest.fn();
jest.mock('@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch', () => ({
    useDataPaginationFetch: (...args: any[]) => mockUseDataPaginationFetch(...args),
}));

jest.mock('../../events-news-page/events/single-event-news/SingleEventNews', () => ({
    SingleEventNews: ({ name }: { name: string }) => <div data-testid="single-event-news">{name}</div>,
}));

const mockGet = jest.fn();
jest.mock('@/services/api/public/events-news/events-news-api', () => ({
    EventsNewsApi: { get: (...args: any[]) => mockGet(...args) },
}));

const makeHookReturn = (overrides: Record<string, any> = {}) => ({
    data: [] as EventsNews[],
    isLoading: false,
    error: null,
    hasMore: false,
    fetchMore: jest.fn(),
    fetchFromStart: jest.fn(),
    setData: jest.fn(),
    resetList: jest.fn(),
    ...overrides,
});

const mockArticle = (id: string): EventsNews => ({
    id,
    name: `Article ${id}`,
    date: '2026-01-01',
    description: 'Test description',
    previewImage: null,
    backgroundImage: null,
    tags: [],
    slug: `article-${id}`,
    sections: [],
});

describe('RecommendedArticles', () => {
    beforeEach(() => {
        mockUseDataPaginationFetch.mockReturnValue(makeHookReturn());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the recommended articles heading', () => {
        render(<RecommendedArticles />);
        expect(screen.getByText('RECOMMENDED_ARTICLES')).toBeInTheDocument();
    });

    it('renders a SingleEventNews card for each data item', () => {
        mockUseDataPaginationFetch.mockReturnValue(makeHookReturn({ data: [mockArticle('1'), mockArticle('2')] }));
        render(<RecommendedArticles />);
        expect(screen.getAllByTestId('single-event-news')).toHaveLength(2);
        expect(screen.getByText('Article 1')).toBeInTheDocument();
        expect(screen.getByText('Article 2')).toBeInTheDocument();
    });

    it('renders no cards when data is empty', () => {
        render(<RecommendedArticles />);
        expect(screen.queryByTestId('single-event-news')).not.toBeInTheDocument();
    });

    it('shows a progress bar while loading', () => {
        mockUseDataPaginationFetch.mockReturnValue(makeHookReturn({ isLoading: true }));
        render(<RecommendedArticles />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not show a progress bar when not loading', () => {
        render(<RecommendedArticles />);
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('shows an error alert when the fetch fails', () => {
        mockUseDataPaginationFetch.mockReturnValue(makeHookReturn({ error: new Error('Network error') }));
        render(<RecommendedArticles />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('FAILED_TO_LOAD_THE_EVENTS_NEWS')).toBeInTheDocument();
    });

    it('does not show an error alert when there is no error', () => {
        render(<RecommendedArticles />);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('configures the hook with pageSize 2, autoFetchDisabled false, and empty initialData when no cache', () => {
        render(<RecommendedArticles />);
        expect(mockUseDataPaginationFetch).toHaveBeenCalledWith(
            expect.objectContaining({
                pageSize: 2,
                autoFetchDisabled: false,
                initialData: [],
            }),
        );
    });

    it('fetchHandler calls EventsNewsApi.get with empty tagId, offset 0, and limit 2', async () => {
        const articles = [mockArticle('1'), mockArticle('2')];
        mockGet.mockResolvedValueOnce({ items: articles, totalItemsCount: 2 });

        render(<RecommendedArticles />);
        const { fetchHandler } = mockUseDataPaginationFetch.mock.calls[0][0];
        await fetchHandler({});

        expect(mockGet).toHaveBeenCalledWith('', 0, 2);
    });
});
