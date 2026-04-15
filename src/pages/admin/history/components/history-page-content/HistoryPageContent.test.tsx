import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryPageContent } from './HistoryPageContent';

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
