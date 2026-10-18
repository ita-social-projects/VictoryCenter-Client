import { act, render, screen } from '@testing-library/react';
import { Events } from './Events';
import { eventsNewsMock } from '@/utils/mock-data/public/event-news';
import { PaginationRequestParams } from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import { EventsNewsApi } from '@/services/api/public/events-news/events-news-api';
import { DEFAULT_LOCALE, LOCALES } from '@/const/common/locales';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch', () => ({
    useDataPaginationFetch: jest.fn(),
}));

jest.mock('@/services/api/public/events-news/events-news-api', () => ({
    EventsNewsApi: { get: jest.fn() },
}));

let mockCurrentLanguage: string = DEFAULT_LOCALE;

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => ({ currentLanguage: mockCurrentLanguage }),
}));

jest.mock('./single-event-news/SingleEventNews', () => ({
    SingleEventNews: ({ name }: { name: string }) => <div data-testid="single-event-news">{name}</div>,
}));

const useDataPaginationFetch = require('@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch')
    .useDataPaginationFetch as jest.Mock;
const mockedApiGet = EventsNewsApi.get as jest.Mock;

const eventsPerPage = 8;

const mockHookImplementation = {
    data: eventsNewsMock.slice(0, eventsPerPage),
    isLoading: false,
    hasMore: true,
    error: null,
    fetchMore: jest.fn(),
    resetList: jest.fn(),
};

const mockData = {
    title: 'Test Events',
    tags: [
        { id: '1', name: 'Tag 1' },
        { id: '2', name: 'Tag 2' },
    ],
};

const clickTag = (name: string) => act(() => screen.getByText(name).click());
const clickAllMaterials = () => act(() => screen.getByTestId('all-materials-button').click());
const clickShowMore = () => act(() => screen.getByText('SHOW_MORE').click());

const getLatestHookOptions = () => {
    const { calls } = useDataPaginationFetch.mock;
    return calls[calls.length - 1][0];
};

describe('Events component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCurrentLanguage = DEFAULT_LOCALE;
        useDataPaginationFetch.mockImplementation(() => mockHookImplementation);
        mockedApiGet.mockResolvedValue({ items: [], totalItemsCount: 0 });
    });

    describe('Rendering', () => {
        it('should display the title and tags', () => {
            render(<Events {...mockData} />);

            expect(screen.getByText('Test Events')).toBeInTheDocument();
            expect(screen.getByText('Tag 1')).toBeInTheDocument();
            expect(screen.getByText('Tag 2')).toBeInTheDocument();

            const allTag = screen.getByTestId('all-materials-button');
            expect(allTag).toHaveTextContent('ALL_MATERIALS');
            expect(allTag).toHaveClass('black-button');
        });

        it('should render the "Show More" button and a card for every event from the hook', () => {
            render(<Events {...mockData} />);

            expect(screen.getAllByTestId('single-event-news')).toHaveLength(eventsPerPage);
            expect(screen.getByText('SHOW_MORE')).toBeInTheDocument();
        });

        it('should render exactly the data returned by the hook and replace it when the data changes', () => {
            const firstPage = eventsNewsMock.slice(0, 3);
            const secondPage = eventsNewsMock.slice(3, 5);

            useDataPaginationFetch.mockImplementation(() => ({ ...mockHookImplementation, data: firstPage }));
            const { rerender } = render(<Events {...mockData} />);
            expect(screen.getAllByTestId('single-event-news')).toHaveLength(firstPage.length);

            useDataPaginationFetch.mockImplementation(() => ({ ...mockHookImplementation, data: secondPage }));
            rerender(<Events {...mockData} />);

            // Компонент не накопичує дані сам: накопичення відбувається в хуку
            expect(screen.getAllByTestId('single-event-news')).toHaveLength(secondPage.length);
        });

        it('should not show "Show More" button when there are no more events to load', () => {
            useDataPaginationFetch.mockImplementation(() => ({
                ...mockHookImplementation,
                hasMore: false,
                data: eventsNewsMock.slice(0, 3),
            }));

            render(<Events {...mockData} />);

            expect(screen.queryByText('SHOW_MORE')).not.toBeInTheDocument();
        });

        it('should display title and buttons but no event cards when events list is empty', () => {
            useDataPaginationFetch.mockImplementation(() => ({
                ...mockHookImplementation,
                data: [],
                hasMore: false,
            }));

            render(<Events {...mockData} />);

            expect(screen.getByText('Test Events')).toBeInTheDocument();
            expect(screen.getByTestId('all-materials-button')).toBeInTheDocument();
            expect(screen.queryAllByTestId('single-event-news')).toHaveLength(0);
            expect(screen.queryByText('SHOW_MORE')).not.toBeInTheDocument();
        });
    });

    describe('Error state', () => {
        it('should display error message when data fetch fails', () => {
            useDataPaginationFetch.mockImplementation(() => ({
                ...mockHookImplementation,
                error: 'Failed to load events',
                data: [],
            }));

            render(<Events {...mockData} />);

            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toHaveTextContent('FAILED_TO_LOAD_THE_EVENTS_NEWS');
        });
    });

    describe('Loading state', () => {
        it('should display loading progress when isLoading is true', () => {
            useDataPaginationFetch.mockImplementation(() => ({
                ...mockHookImplementation,
                isLoading: true,
                data: eventsNewsMock.slice(0, 3),
            }));

            render(<Events {...mockData} />);

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should not display loading progress when isLoading is false', () => {
            render(<Events {...mockData} />);

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });

    describe('Tag selection', () => {
        it('should highlight the selected tag and deselect "All materials"', () => {
            render(<Events {...mockData} />);
            const allTag = screen.getByTestId('all-materials-button');
            const tagButton = screen.getByText('Tag 1');

            expect(allTag).toHaveClass('black-button');
            expect(tagButton).not.toHaveClass('black-button');

            clickTag('Tag 1');

            expect(tagButton).toHaveClass('black-button');
            expect(allTag).toHaveClass('white-button');
        });

        it('should switch the highlight between tags', () => {
            render(<Events {...mockData} />);

            clickTag('Tag 1');
            clickTag('Tag 2');

            expect(screen.getByText('Tag 1')).toHaveClass('white-button');
            expect(screen.getByText('Tag 2')).toHaveClass('black-button');
        });

        it('should clear the selected tag when "All materials" is clicked', () => {
            render(<Events {...mockData} />);
            const allTag = screen.getByTestId('all-materials-button');
            const tagButton = screen.getByText('Tag 1');

            clickTag('Tag 1');
            expect(tagButton).toHaveClass('black-button');
            expect(allTag).toHaveClass('white-button');

            clickAllMaterials();
            expect(allTag).toHaveClass('black-button');
            expect(tagButton).toHaveClass('white-button');
        });
    });

    describe('Pagination hook configuration', () => {
        it('should configure the hook with the page size and empty initial data', () => {
            render(<Events {...mockData} />);

            expect(getLatestHookOptions()).toEqual(
                expect.objectContaining({ initialData: [], pageSize: eventsPerPage }),
            );
        });

        it('should call fetchMore when "Show More" is clicked', () => {
            render(<Events {...mockData} />);

            clickShowMore();

            expect(mockHookImplementation.fetchMore).toHaveBeenCalledTimes(1);
        });

        it('should include the selected tag id in autoFetchDependencies', () => {
            render(<Events {...mockData} />);
            expect(getLatestHookOptions().autoFetchDependencies).toEqual([DEFAULT_LOCALE, undefined]);

            clickTag('Tag 1');
            expect(getLatestHookOptions().autoFetchDependencies).toEqual([DEFAULT_LOCALE, '1']);

            clickAllMaterials();
            expect(getLatestHookOptions().autoFetchDependencies).toEqual([DEFAULT_LOCALE, undefined]);
        });

        it.each(LOCALES)('should include "%s" and the tag id in autoFetchDependencies', (language) => {
            mockCurrentLanguage = language;
            render(<Events {...mockData} />);

            clickTag('Tag 1');

            expect(getLatestHookOptions().autoFetchDependencies).toEqual([language, '1']);
        });

        it.each(LOCALES)('should refetch when the language changes from "%s"', (from) => {
            const to = LOCALES.find((locale) => locale !== from);
            if (!to) return; // підтримується лише одна мова, перемикати нема на що

            mockCurrentLanguage = from;
            const { rerender } = render(<Events {...mockData} />);
            expect(getLatestHookOptions().autoFetchDependencies).toEqual([from, undefined]);

            mockCurrentLanguage = to;
            rerender(<Events {...mockData} />);

            expect(getLatestHookOptions().autoFetchDependencies).toEqual([to, undefined]);
        });
    });

    describe('Fetch handler', () => {
        const params = { offset: 0, limit: eventsPerPage } as PaginationRequestParams;

        const callLatestFetchHandler = (overrides: Partial<PaginationRequestParams> = {}) =>
            getLatestHookOptions().fetchHandler({ ...params, ...overrides });

        it('requests the first page without a category while "All materials" is selected', async () => {
            render(<Events {...mockData} />);

            await callLatestFetchHandler();

            expect(mockedApiGet).toHaveBeenCalledWith(undefined, 0, eventsPerPage, DEFAULT_LOCALE, undefined);
        });

        it('passes the selected tag id to the API', async () => {
            render(<Events {...mockData} />);
            clickTag('Tag 1');

            await callLatestFetchHandler();

            expect(mockedApiGet).toHaveBeenLastCalledWith('1', 0, eventsPerPage, DEFAULT_LOCALE, undefined);
        });

        it('stops sending the tag id after "All materials" is selected again', async () => {
            render(<Events {...mockData} />);
            clickTag('Tag 1');
            clickAllMaterials();

            await callLatestFetchHandler();

            expect(mockedApiGet).toHaveBeenLastCalledWith(undefined, 0, eventsPerPage, DEFAULT_LOCALE, undefined);
        });

        it.each(LOCALES)('passes the "%s" language to the API', async (language) => {
            mockCurrentLanguage = language;
            render(<Events {...mockData} />);

            await callLatestFetchHandler();

            expect(mockedApiGet).toHaveBeenLastCalledWith(undefined, 0, eventsPerPage, language, undefined);
        });

        it('passes the offset provided by the pagination hook to the API', async () => {
            render(<Events {...mockData} />);

            await callLatestFetchHandler({ offset: eventsPerPage });

            expect(mockedApiGet).toHaveBeenLastCalledWith(
                undefined,
                eventsPerPage,
                eventsPerPage,
                DEFAULT_LOCALE,
                undefined,
            );
        });

        it('falls back to the default page size when the hook does not provide a limit', async () => {
            render(<Events {...mockData} />);

            await callLatestFetchHandler({ limit: undefined });

            expect(mockedApiGet).toHaveBeenLastCalledWith(undefined, 0, eventsPerPage, DEFAULT_LOCALE, undefined);
        });

        it('passes requestOptions (cancellation signal) to the API', async () => {
            const requestOptions = { cancellationSignal: new AbortController().signal };
            render(<Events {...mockData} />);

            await callLatestFetchHandler({ requestOptions });

            expect(mockedApiGet).toHaveBeenLastCalledWith(undefined, 0, eventsPerPage, DEFAULT_LOCALE, requestOptions);
        });

        it('returns the API response to the pagination hook', async () => {
            const page = { items: eventsNewsMock.slice(0, 2), totalItemsCount: 2 };
            mockedApiGet.mockResolvedValue(page);
            render(<Events {...mockData} />);

            await expect(callLatestFetchHandler()).resolves.toBe(page);
        });
    });
});
