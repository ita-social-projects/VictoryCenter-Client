import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryPageToolbar, HistoryPageToolbarProps } from './HistoryPageToolbar';

jest.mock('@/const/admin/history', () => ({
    HISTORY_TEXT: {
        BUTTON: {
            ADD_SECTION: 'Add History Section',
        },
    },
}));

jest.mock('@/assets/icons/plus.svg', () => ({
    ReactComponent: () => <svg data-testid="plus-icon" />,
}));

describe('HistoryPageToolbar', () => {
    const user = userEvent.setup();

    const mockProps: HistoryPageToolbarProps = {
        onAddSection: jest.fn(),
        onTranslate: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the button and call onAddSection on click', async () => {
        render(<HistoryPageToolbar {...mockProps} />);

        const button = screen.getByRole('button', {
            name: /add history section/i,
        });

        expect(button).toBeInTheDocument();
        expect(screen.getByTestId('plus-icon')).toBeInTheDocument();

        await user.click(button);

        expect(mockProps.onAddSection).toHaveBeenCalledTimes(1);
    });

    it('should not call onAddSection on initial render', () => {
        render(<HistoryPageToolbar {...mockProps} />);
        expect(mockProps.onAddSection).not.toHaveBeenCalled();
    });
});
