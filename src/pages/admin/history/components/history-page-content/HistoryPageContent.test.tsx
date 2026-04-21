import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryPageContent } from './HistoryPageContent';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { HistoryApi } from '@/services/api/admin/history/history-api';

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

const mockHistoryFormProps = jest.fn();

jest.mock('../history-form/HistoryForm', () => ({
    HistoryForm: ({ sections }: { sections: unknown[] }) => {
        mockHistoryFormProps({ sections });

        return <div data-testid="history-form" />;
    },
}));

const mockedUseAdminClient = useAdminClient as jest.MockedFunction<typeof useAdminClient>;
const mockedUseDataFetch = useDataFetch as jest.Mock;
const mockedHistoryApi = HistoryApi as jest.Mocked<typeof HistoryApi>;
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
        expect(screen.queryByTestId('history-form')).not.toBeInTheDocument();
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

        await user.click(screen.getByTestId('history-sections-retry-button'));

        expect(refetchSectionsMock).toHaveBeenCalledTimes(1);
    });

    it('renders empty state when there are no sections', () => {
        render(<HistoryPageContent />);

        const emptyState = screen.getByText('No sections yet').parentElement;

        expect(screen.getByAltText('No sections')).toBeInTheDocument();
        expect(emptyState).not.toBeNull();
        expect(
            within(emptyState as HTMLElement).getByRole('button', {
                name: /add history section/i,
            }),
        ).toBeInTheDocument();
        expect(screen.queryByTestId('history-form')).not.toBeInTheDocument();
    });

    it('passes add-section handler to toolbar', () => {
        render(<HistoryPageContent />);

        expect(mockToolbarOnAddSection).toHaveBeenCalledWith(expect.any(Function));
    });

    it('renders HistoryForm when sections are fetched', () => {
        const sections = [
            {
                id: 1,
                template: 6,
                order: 0,
                contents: [],
            },
            {
                id: 2,
                template: 3,
                order: 1,
                contents: [],
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

        expect(screen.getByTestId('history-form')).toBeInTheDocument();
        expect(mockHistoryFormProps).toHaveBeenCalledWith(
            expect.objectContaining({
                sections,
            }),
        );
    });
});
