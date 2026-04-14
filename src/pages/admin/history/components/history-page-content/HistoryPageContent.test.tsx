import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryPageContent } from './HistoryPageContent';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { HistoryApi } from '@/services/api/admin/history/history-api';
import { renderHistorySection } from '@/utils/functions/render-history-section';
import { ContentType } from '@/types/common/section-contents';
import { SectionTemplate } from '@/types/common/sections';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

jest.mock('@/hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: jest.fn(),
}));

jest.mock('@/services/api/admin/history/history-api', () => ({
    HistoryApi: {
        fetchSections: jest.fn(),
    },
}));

jest.mock('@/utils/functions/render-history-section', () => ({
    renderHistorySection: jest.fn(() => <div data-testid="rendered-history-section" />),
}));

const mockedUseAdminClient = useAdminClient as jest.MockedFunction<typeof useAdminClient>;
const mockedUseDataFetch = useDataFetch as jest.Mock;
const mockedHistoryApi = HistoryApi as jest.Mocked<typeof HistoryApi>;
const mockedRenderHistorySection = renderHistorySection as jest.MockedFunction<typeof renderHistorySection>;
const mockClient = {
    get: jest.fn(),
};

const mockToolbarOnAddSection = jest.fn();
const refetchSectionsMock = jest.fn();

jest.mock('@/const/admin/history', () => ({
    HISTORY_TEXT: {
        BUTTON: {
            ADD_SECTION: 'Add History Section',
        },
        MESSAGE: {
            NO_SECTIONS_YET: 'No sections yet',
            FAIL_TO_FETCH_SECTIONS: 'Failed to fetch sections',
        },
    },
}));

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: () => <div data-testid="inline-loader" />,
}));

jest.mock('@/assets/icons/plus.svg', () => ({
    ReactComponent: () => <svg data-testid="plus-icon" />,
}));

jest.mock('@/assets/icons/not-found.svg', () => 'not-found.svg');

jest.mock('../history-page-toolbar/HistoryPageToolbar', () => ({
    HistoryPageToolbar: ({ onAddSection }: { onAddSection: () => void }) => {
        mockToolbarOnAddSection(onAddSection);

        return (
            <button type="button" onClick={onAddSection}>
                Add History Section
            </button>
        );
    },
}));

describe('HistoryPageContent', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseAdminClient.mockReturnValue(mockClient as any);
        mockClient.get.mockResolvedValue({ data: [] });
        mockedHistoryApi.fetchSections.mockResolvedValue([]);
        refetchSectionsMock.mockResolvedValue(undefined);
        mockedUseDataFetch.mockReturnValue({
            data: null,
            error: null,
            isLoading: false,
            refetch: refetchSectionsMock,
            setData: jest.fn(),
        });
    });

    it('uses history API in fetch handler passed to useDataFetch', async () => {
        render(<HistoryPageContent />);

        const [{ fetchHandler, initialData, autoFetchDisabled }] = mockedUseDataFetch.mock.calls[0] as [
            {
                fetchHandler: (options: any) => Promise<unknown>;
                initialData: unknown;
                autoFetchDisabled: boolean;
            },
        ];

        await fetchHandler({});

        expect(initialData).toBeNull();
        expect(autoFetchDisabled).toBe(false);
        expect(mockedHistoryApi.fetchSections).toHaveBeenCalledWith(mockClient);
    });

    it('renders loader while sections are loading', () => {
        mockedUseDataFetch.mockReturnValue({
            data: null,
            error: null,
            isLoading: true,
            refetch: refetchSectionsMock,
            setData: jest.fn(),
        });

        render(<HistoryPageContent />);

        expect(screen.getByTestId('history-sections-loader')).toBeInTheDocument();
        expect(screen.getByTestId('inline-loader')).toBeInTheDocument();
        expect(screen.queryByText('No sections yet')).not.toBeInTheDocument();
    });

    it('renders error state and retries fetching sections', async () => {
        mockedUseDataFetch.mockReturnValue({
            data: null,
            error: new Error('Request failed'),
            isLoading: false,
            refetch: refetchSectionsMock,
            setData: jest.fn(),
        });

        render(<HistoryPageContent />);

        expect(screen.getByTestId('history-sections-error')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch sections')).toBeInTheDocument();
        expect(screen.queryByText('No sections yet')).not.toBeInTheDocument();

        await user.click(screen.getByTestId('history-sections-retry-button'));

        expect(refetchSectionsMock).toHaveBeenCalledTimes(1);
    });

    it('renders empty state when there are no sections', () => {
        render(<HistoryPageContent />);

        const emptyState = screen.getByText('No sections yet').parentElement;

        expect(screen.getByTestId('history-page-content')).toBeInTheDocument();
        expect(screen.getByAltText('No sections')).toBeInTheDocument();
        expect(screen.getByText('No sections yet')).toBeInTheDocument();
        expect(emptyState).not.toBeNull();
        expect(
            within(emptyState as HTMLElement).getByRole('button', {
                name: /add history section/i,
            }),
        ).toBeInTheDocument();
    });

    it('passes add-section handler to toolbar', () => {
        render(<HistoryPageContent />);

        expect(mockToolbarOnAddSection).toHaveBeenCalledWith(expect.any(Function));
    });

    it('allows clicking toolbar add button', async () => {
        render(<HistoryPageContent />);

        const [button] = screen.getAllByRole('button', {
            name: /add history section/i,
        });

        await user.click(button);

        expect(screen.getByTestId('history-page-content')).toBeInTheDocument();
    });

    it('allows clicking empty state add button', async () => {
        render(<HistoryPageContent />);

        const emptyState = screen.getByText('No sections yet').parentElement;

        expect(emptyState).not.toBeNull();

        const button = within(emptyState as HTMLElement).getByRole('button', {
            name: /add history section/i,
        });

        await user.click(button);

        expect(screen.getByTestId('history-page-content')).toBeInTheDocument();
    });

    it('renders mapped sections and skips null section entries', () => {
        const sections = [
            null,
            {
                id: 1,
                template: SectionTemplate.SingleImageTop,
                order: 0,
                contents: [
                    { contentType: ContentType.Title, order: 0, title: 'Section 1 title' },
                    { contentType: ContentType.Description, order: 1, description: 'Section 1 description' },
                    { contentType: ContentType.Image, order: 2, image: { url: 'image-1', mimeType: 'image/jpeg' } },
                ],
            },
            {
                id: 2,
                template: SectionTemplate.TextOnly,
                order: 1,
                contents: [{ contentType: ContentType.Image, order: 0, image: null }],
            },
        ];

        mockedUseDataFetch.mockReturnValue({
            data: sections,
            error: null,
            isLoading: false,
            refetch: refetchSectionsMock,
            setData: jest.fn(),
        });

        render(<HistoryPageContent />);

        expect(screen.queryByText('No sections yet')).not.toBeInTheDocument();
        expect(screen.getAllByLabelText(/edit section/i)).toHaveLength(2);
        expect(mockedRenderHistorySection).toHaveBeenCalledTimes(2);

        expect(mockedRenderHistorySection).toHaveBeenNthCalledWith(1, {
            templateId: SectionTemplate.SingleImageTop,
            data: {
                title: 'Section 1 title',
                description: 'Section 1 description',
                images: [{ url: 'image-1', mimeType: 'image/jpeg' }],
            },
        });

        expect(mockedRenderHistorySection).toHaveBeenNthCalledWith(2, {
            templateId: SectionTemplate.TextOnly,
            data: {
                title: '',
                description: '',
                images: [null],
            },
        });

        expect(screen.getAllByRole('button', { name: /move up section/i })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: /move down section/i })).toHaveLength(1);
        expect(screen.getAllByRole('button', { name: /edit section/i })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: /delete section/i })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: /replace section/i })).toHaveLength(2);
    });
});
