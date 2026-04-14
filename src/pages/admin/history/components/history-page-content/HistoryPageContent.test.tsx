import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryPageContent } from './HistoryPageContent';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

jest.mock('@/hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: jest.fn(),
}));

const mockedUseAdminClient = useAdminClient as jest.MockedFunction<typeof useAdminClient>;
const mockedUseDataFetch = useDataFetch as jest.Mock;
const mockClient = {
    get: jest.fn(),
};

const mockToolbarOnAddSection = jest.fn();

jest.mock('@/const/admin/history', () => ({
    HISTORY_TEXT: {
        BUTTON: {
            ADD_SECTION: 'Add History Section',
        },
        MESSAGE: {
            NO_SECTIONS_YET: 'No sections yet',
        },
    },
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
        mockedUseDataFetch.mockReturnValue({
            data: [],
            error: null,
            isLoading: false,
            refetch: jest.fn(),
            setData: jest.fn(),
        });
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
});
