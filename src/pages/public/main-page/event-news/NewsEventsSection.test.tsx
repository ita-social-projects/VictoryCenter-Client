import { fireEvent, render, screen } from '@testing-library/react';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { EventsNewsApi } from '@/services/api/public/events-news/events-news-api';
import { PaginationResult } from '@/types/admin/common';
import { EventsNews } from '@/types/public/events-news';
import { eventsNewsMock } from '@/utils/mock-data/public/event-news';
import { NewsEventsSection } from './NewsEventsSection';

const mockNavigate = jest.fn();
const mockT = (key: string) => key;

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: mockT }),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('@/hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: jest.fn(),
}));

jest.mock('@/services/api/public/events-news/events-news-api', () => ({
    EventsNewsApi: { get: jest.fn() },
}));

jest.mock('@/pages/public/events-news-page/events/single-event-news/SingleEventNews', () => ({
    SingleEventNews: ({ name }: { name: string }) => <div data-testid="single-event-news">{name}</div>,
}));

const MAIN_PAGE_NEWS_COUNT = 4;

const mockedUseDataFetch = useDataFetch as jest.Mock;
const mockedApiGet = EventsNewsApi.get as jest.Mock;

const newsItems = eventsNewsMock.slice(0, MAIN_PAGE_NEWS_COUNT);

const withItems = (items: EventsNews[]): PaginationResult<EventsNews> => ({
    items,
    totalItemsCount: items.length,
});

const mockFetchState = (
    overrides: Partial<{ data: PaginationResult<EventsNews> | null; isLoading: boolean; error: unknown }> = {},
) => {
    mockedUseDataFetch.mockReturnValue({ data: null, isLoading: false, error: null, ...overrides });
};

const renderSection = () => render(<NewsEventsSection />);

const getFetchOptions = (callIndex = 0) => mockedUseDataFetch.mock.calls[callIndex][0];

describe('NewsEventsSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetchState({ data: withItems(newsItems) });
    });

    describe('with loaded data', () => {
        it('renders the section title and one card per news item', () => {
            renderSection();

            expect(screen.getByRole('heading', { name: 'EVENTS_AND_NEWS' })).toBeInTheDocument();
            expect(screen.getAllByTestId('single-event-news')).toHaveLength(newsItems.length);
            newsItems.forEach((item) => expect(screen.getByText(item.name)).toBeInTheDocument());
        });

        it('renders the "Read more" button and navigates to the events and news page on click', () => {
            renderSection();

            fireEvent.click(screen.getByText('READ_MORE'));

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(PUBLIC_ROUTES.EVENTS_AND_NEWS.FULL);
        });

        it('does not show a loader or an error', () => {
            renderSection();

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    describe('loading state', () => {
        beforeEach(() => mockFetchState({ isLoading: true }));

        it('shows the title and a progress bar', () => {
            renderSection();

            expect(screen.getByRole('heading', { name: 'EVENTS_AND_NEWS' })).toBeInTheDocument();
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('does not render cards or the "Read more" button', () => {
            renderSection();

            expect(screen.queryAllByTestId('single-event-news')).toHaveLength(0);
            expect(screen.queryByText('READ_MORE')).not.toBeInTheDocument();
        });
    });

    describe('error state', () => {
        beforeEach(() => mockFetchState({ error: 'Network error' }));

        it('shows an alert with the translated error message', () => {
            renderSection();

            expect(screen.getByRole('alert')).toHaveTextContent('FAILED_TO_LOAD_THE_EVENTS_NEWS');
        });

        it('does not render cards or the "Read more" button', () => {
            renderSection();

            expect(screen.queryAllByTestId('single-event-news')).toHaveLength(0);
            expect(screen.queryByText('READ_MORE')).not.toBeInTheDocument();
        });
    });

    describe('empty state', () => {
        it.each([
            ['data is null', null],
            ['items list is empty', withItems([])],
        ])('renders nothing when %s', (_description, data) => {
            mockFetchState({ data });

            const { container } = renderSection();

            expect(container).toBeEmptyDOMElement();
        });
    });

    describe('data fetching', () => {
        it('configures useDataFetch with null initial data and the translation function as dependency', () => {
            renderSection();

            expect(getFetchOptions()).toEqual(
                expect.objectContaining({
                    initialData: null,
                    autoFetchDependencies: [mockT],
                }),
            );
        });

        it('requests the latest 4 news without a category filter and offset 0', async () => {
            const page = withItems(newsItems);
            mockedApiGet.mockResolvedValue(page);
            renderSection();

            const result = await getFetchOptions().fetchHandler();

            expect(mockedApiGet).toHaveBeenCalledTimes(1);
            expect(mockedApiGet).toHaveBeenCalledWith(undefined, 0, MAIN_PAGE_NEWS_COUNT);
            expect(result).toBe(page);
        });

        it('keeps the same fetch handler between renders to avoid refetching', () => {
            const { rerender } = renderSection();
            rerender(<NewsEventsSection />);

            expect(mockedUseDataFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
            expect(getFetchOptions(1).fetchHandler).toBe(getFetchOptions(0).fetchHandler);
        });
    });
});
