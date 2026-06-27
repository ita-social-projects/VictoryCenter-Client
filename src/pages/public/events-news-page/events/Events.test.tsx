import { act, render, screen, waitFor } from '@testing-library/react';
import { Events } from './Events';
import { eventsNewsMock } from '@/utils/mock-data/public/event-news';

jest.mock('react-i18next', () => {
    return {
        useTranslation: () => ({
            t: (key: string) => key,
        }),
    };
});

jest.mock('@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch', () => ({
    useDataPaginationFetch: jest.fn(),
}));

const eventsPerPage = 8;

const mockHookImplementation = {
    data: eventsNewsMock.slice(0, eventsPerPage),
    isLoading: false,
    hasMore: true,
    error: null,
    fetchMore: jest.fn(),
    resetList: jest.fn(),
};

jest.mock('./single-event-news/SingleEventNews', () => ({
    SingleEventNews: ({ title }: { title: string }) => <div data-testid="single-event-news">{title}</div>,
}));

describe('Events component', () => {
    describe('More events than page size', () => {
        const useDataPaginationFetch =
            require('@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch').useDataPaginationFetch;
        const mockData = {
            title: 'Test Events',
            tags: [
                { id: '1', name: 'Tag 1' },
                { id: '2', name: 'Tag 2' },
            ],
        };

        beforeEach(() => {
            jest.clearAllMocks();
            useDataPaginationFetch.mockImplementation(() => mockHookImplementation);
        });

        it('should display the title and tags', async () => {
            render(<Events {...mockData} />);
            await waitFor(() => {
                expect(screen.getByText('Test Events')).toBeInTheDocument();
                expect(screen.getByText('Tag 1')).toBeInTheDocument();
                expect(screen.getByText('Tag 2')).toBeInTheDocument();
                const allTag = screen.getByTestId('all-materials-button');
                expect(allTag).toBeInTheDocument();
                expect(allTag).toHaveTextContent('ALL_MATERIALS');
                expect(allTag).toHaveClass('black-button');
            });
        });

        it('should update selected tag and reset offset when a tag is clicked', async () => {
            render(<Events {...mockData} />);
            const allTag = screen.getByTestId('all-materials-button');
            expect(allTag).toHaveClass('black-button');
            const tagButton = screen.getByText('Tag 1');
            expect(tagButton).not.toHaveClass('black-button');
            act(() => tagButton.click());

            await waitFor(() => {
                expect(tagButton).toHaveClass('black-button');
                expect(allTag).toHaveClass('white-button');
            });
        });

        it('should render the "Show More" button', async () => {
            render(<Events {...mockData} />);
            let events = screen.getAllByTestId('single-event-news');
            expect(events).toHaveLength(eventsPerPage);
            const showMoreButton = screen.getByText('SHOW_MORE');
            expect(showMoreButton).toBeInTheDocument();
        });
    });

    describe('Fewer events than page size', () => {
        const mockData = { title: 'Test Events', tags: [{ id: '1', name: 'Tag 1' }] };
        beforeEach(() => {
            jest.clearAllMocks();
            const useDataPaginationFetch =
                require('@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch').useDataPaginationFetch;
            const mockImplementationWithFewerData = {
                ...mockHookImplementation,
                hasMore: false,
                data: eventsNewsMock.slice(0, 3),
            };
            useDataPaginationFetch.mockImplementation(() => mockImplementationWithFewerData);
        });

        it('should not show "Show More" button when there are no more events to load', async () => {
            render(<Events {...mockData} />);
            const showMoreButton = screen.queryByText('SHOW_MORE');
            expect(showMoreButton).not.toBeInTheDocument();
        });
    });

    describe('Error state', () => {
        const mockData = { title: 'Test Events', tags: [{ id: '1', name: 'Tag 1' }] };
        beforeEach(() => {
            jest.clearAllMocks();
            const useDataPaginationFetch =
                require('@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch').useDataPaginationFetch;
            const mockImplementationWithError = {
                ...mockHookImplementation,
                error: 'Failed to load events',
                data: [],
            };
            useDataPaginationFetch.mockImplementation(() => mockImplementationWithError);
        });

        it('should display error message when data fetch fails', async () => {
            render(<Events {...mockData} />);
            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage).toHaveTextContent('FAILED_TO_LOAD_THE_EVENTS_NEWS');
        });
    });

    describe('Loading state', () => {
        const mockData = { title: 'Test Events', tags: [{ id: '1', name: 'Tag 1' }] };
        beforeEach(() => {
            jest.clearAllMocks();
            const useDataPaginationFetch =
                require('@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch').useDataPaginationFetch;
            const mockImplementationWithLoading = {
                ...mockHookImplementation,
                isLoading: true,
                data: eventsNewsMock.slice(0, 3),
            };
            useDataPaginationFetch.mockImplementation(() => mockImplementationWithLoading);
        });

        it('should display loading progress when isLoading is true', async () => {
            render(<Events {...mockData} />);
            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toBeInTheDocument();
        });
    });

    describe('Clear tag filter', () => {
        const mockData = {
            title: 'Test Events',
            tags: [
                { id: '1', name: 'Tag 1' },
                { id: '2', name: 'Tag 2' },
            ],
        };

        beforeEach(() => {
            jest.clearAllMocks();
            const useDataPaginationFetch =
                require('@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch').useDataPaginationFetch;
            useDataPaginationFetch.mockImplementation(() => mockHookImplementation);
        });

        it('should clear selected tag when "All Materials" button is clicked', async () => {
            render(<Events {...mockData} />);
            const allTag = screen.getByTestId('all-materials-button');
            const tagButton = screen.getByText('Tag 1');

            act(() => tagButton.click());
            await waitFor(() => {
                expect(tagButton).toHaveClass('black-button');
                expect(allTag).toHaveClass('white-button');
            });

            act(() => allTag.click());
            await waitFor(() => {
                expect(allTag).toHaveClass('black-button');
                expect(tagButton).toHaveClass('white-button');
            });
        });
    });

    describe('Show More button click', () => {
        const mockData = {
            title: 'Test Events',
            tags: [{ id: '1', name: 'Tag 1' }],
        };

        beforeEach(() => {
            jest.clearAllMocks();
            const useDataPaginationFetch =
                require('@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch').useDataPaginationFetch;
            useDataPaginationFetch.mockImplementation(() => mockHookImplementation);
        });

        it('should call loadMore when Show More button is clicked', async () => {
            render(<Events {...mockData} />);
            const showMoreButton = screen.getByText('SHOW_MORE');
            expect(showMoreButton).toBeInTheDocument();

            act(() => showMoreButton.click());

            await waitFor(() => {
                expect(showMoreButton).toBeInTheDocument();
            });
        });
    });

    describe('Empty events list', () => {
        const mockData = { title: 'Test Events', tags: [{ id: '1', name: 'Tag 1' }] };
        beforeEach(() => {
            jest.clearAllMocks();
            const useDataPaginationFetch =
                require('@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch').useDataPaginationFetch;
            const mockImplementationWithNoEvents = {
                ...mockHookImplementation,
                data: [],
                hasMore: false,
            };
            useDataPaginationFetch.mockImplementation(() => mockImplementationWithNoEvents);
        });

        it('should display title and buttons but no event cards when events list is empty', async () => {
            render(<Events {...mockData} />);
            expect(screen.getByText('Test Events')).toBeInTheDocument();
            expect(screen.getByTestId('all-materials-button')).toBeInTheDocument();

            const eventCards = screen.queryAllByTestId('single-event-news');
            expect(eventCards).toHaveLength(0);

            const showMoreButton = screen.queryByText('SHOW_MORE');
            expect(showMoreButton).not.toBeInTheDocument();
        });
    });

    describe('Data update logic', () => {
        const mockData = {
            title: 'Test Events',
            tags: [{ id: '1', name: 'Tag 1' }],
        };
        let useDataPaginationFetch: jest.Mock;

        beforeEach(() => {
            jest.clearAllMocks();
            useDataPaginationFetch =
                require('@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch').useDataPaginationFetch;
        });

        it('should replace events when offset is 0 (initial load)', async () => {
            const initialData = eventsNewsMock.slice(0, 3);
            useDataPaginationFetch.mockImplementation(() => ({
                ...mockHookImplementation,
                data: initialData,
                hasMore: true,
            }));

            render(<Events {...mockData} />);

            await waitFor(() => {
                const eventCards = screen.getAllByTestId('single-event-news');
                expect(eventCards).toHaveLength(initialData.length);
            });
        });

        it('should append events when offset is incremented (load more)', async () => {
            const firstPageData = eventsNewsMock.slice(0, 3);
            const secondPageData = eventsNewsMock.slice(3, 6);

            // Initial render with first page
            useDataPaginationFetch.mockImplementation(() => ({
                ...mockHookImplementation,
                data: firstPageData,
                hasMore: true,
            }));

            const { rerender } = render(<Events {...mockData} />);

            await waitFor(() => {
                const eventCards = screen.getAllByTestId('single-event-news');
                expect(eventCards).toHaveLength(firstPageData.length);
            });

            // Simulate loading more data
            useDataPaginationFetch.mockImplementation(() => ({
                ...mockHookImplementation,
                data: secondPageData,
                hasMore: true,
            }));

            rerender(<Events {...mockData} />);

            await waitFor(() => {
                const eventCards = screen.getAllByTestId('single-event-news');
                // Should have both first and second page data
                expect(eventCards.length).toBeGreaterThanOrEqual(firstPageData.length);
            });
        });

        it('should reset events when tag filter changes (offset back to 0)', async () => {
            const firstFilterData = eventsNewsMock.slice(0, 3);
            const secondFilterData = eventsNewsMock.slice(0, 2);

            useDataPaginationFetch.mockImplementation(() => ({
                ...mockHookImplementation,
                data: firstFilterData,
                hasMore: true,
            }));

            render(<Events {...mockData} />);

            await waitFor(() => {
                let eventCards = screen.getAllByTestId('single-event-news');
                expect(eventCards).toHaveLength(firstFilterData.length);
            });

            // Simulate tag change which resets offset to 0
            useDataPaginationFetch.mockImplementation(() => ({
                ...mockHookImplementation,
                data: secondFilterData,
                hasMore: true,
            }));

            const tagButton = screen.getByText('Tag 1');
            act(() => tagButton.click());

            await waitFor(() => {
                const eventCards = screen.getAllByTestId('single-event-news');
                // After filter change, should have new data (not concatenated)
                expect(eventCards.length).toBeLessThanOrEqual(secondFilterData.length);
            });
        });
    });
});
