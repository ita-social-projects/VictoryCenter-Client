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
});
