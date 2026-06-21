import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryPageToolbar, HistoryPageToolbarProps } from './HistoryPageToolbar';

jest.mock('@/const/admin/history', () => ({
    HISTORY_TEXT: {
        BUTTON: {
            ADD_SECTION: 'Add History Section',
            TRANSLATE: 'Translate History',
        },
    },
}));

jest.mock('@/assets/icons/plus.svg', () => ({
    ReactComponent: () => <svg data-testid="plus-icon" />,
}));
jest.mock('@/components/admin/localization-statuses/LocalizationStatuses', () => ({
    LocalizationStatuses: () => <div data-testid="localization-statuses" />,
}));

jest.mock('@/components/admin/localization-toolkit/LocalizationToolkit', () => ({
    LocalizationToolkit: () => <div data-testid="localization-toolkit" />,
}));

describe('HistoryPageToolbar', () => {
    const user = userEvent.setup();

    const mockProps: HistoryPageToolbarProps = {
        onAddSection: jest.fn(),
        translationLanguages: [],
        languages: [],
        onLanguageChange: jest.fn(),
        onTranslate: jest.fn(),
        onTranslationStatusFilterChange: jest.fn(),
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

    it('should render LocalizationToolkit', () => {
        render(<HistoryPageToolbar {...mockProps} />);
        expect(screen.getByTestId('localization-toolkit')).toBeInTheDocument();
    });

    it('should render LocalizationStatuses when localizedEntity is provided', () => {
        const mockLocalizedEntity = { id: 'test-entity' } as any;

        render(<HistoryPageToolbar {...mockProps} localizedEntity={mockLocalizedEntity} />);

        expect(screen.getByTestId('localization-statuses')).toBeInTheDocument();
    });

    it('should not render LocalizationStatuses when localizedEntity is NOT provided', () => {
        render(<HistoryPageToolbar {...mockProps} />);
        expect(screen.queryByTestId('localization-statuses')).not.toBeInTheDocument();
    });

    it('should render the translate icon button as enabled by default', () => {
        render(<HistoryPageToolbar {...mockProps} />);

        const translateButton = screen.getByRole('button', { name: /translate history/i });

        expect(translateButton).toBeInTheDocument();
        expect(translateButton).toBeEnabled();
    });

    it('should call onTranslate when the translate button is clicked and enabled', async () => {
        render(<HistoryPageToolbar {...mockProps} />);

        const translateButton = screen.getByRole('button', { name: /translate history/i });
        await user.click(translateButton);

        expect(mockProps.onTranslate).toHaveBeenCalledTimes(1);
    });

    it('should disable the translate icon button when isTranslateDisabled is true', () => {
        render(<HistoryPageToolbar {...mockProps} isTranslateDisabled={true} />);

        const translateButton = screen.getByRole('button', { name: /translate history/i });

        expect(translateButton).toBeDisabled();
    });

    it('should not call onTranslate when the translate button is disabled', async () => {
        render(<HistoryPageToolbar {...mockProps} isTranslateDisabled={true} />);

        const translateButton = screen.getByRole('button', { name: /translate history/i });
        await user.click(translateButton);

        expect(mockProps.onTranslate).not.toHaveBeenCalled();
    });

    it('should enable the translate icon button when isTranslateDisabled is false', () => {
        render(<HistoryPageToolbar {...mockProps} isTranslateDisabled={false} />);

        const translateButton = screen.getByRole('button', { name: /translate history/i });

        expect(translateButton).toBeEnabled();
    });
});
