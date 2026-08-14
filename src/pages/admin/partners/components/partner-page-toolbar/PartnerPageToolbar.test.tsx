import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartnerPageToolbar, PartnerPageToolbarProps } from './PartnerPageToolbar';

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, buttonStyle, disabled }: any) => (
        <button onClick={onClick} data-button-style={buttonStyle} disabled={disabled}>
            {children}
        </button>
    ),
}));

jest.mock('@/assets/icons/plus.svg', () => ({
    ReactComponent: () => <svg data-testid="plus-icon" />,
}));

jest.mock('@/const/admin/partners', () => ({
    PARTNERS_TEXT: {
        BUTTON: {
            ADD_PARTNER_SECTION: 'Add Partner Section',
        },
    },
}));

jest.mock('@/components/admin/language-toolkit/LanguageToolkit', () => ({
    LanguageToolkit: ({ languages }: any) => (
        <div data-testid="mock-language-toolkit">
            <span data-testid="lang-count">{languages.length}</span>
        </div>
    ),
}));

describe('PartnerPageToolbar', () => {
    const user = userEvent.setup();

    const mockProps: PartnerPageToolbarProps = {
        onAddSection: jest.fn(),
        languages: [{ id: 1, code: 'uk', name: 'Ukrainian' }],
        onLanguageChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the button and call onAddSection on click', async () => {
        render(<PartnerPageToolbar {...mockProps} />);

        const button = screen.getByRole('button', {
            name: /add partner section/i,
        });

        expect(button).toBeInTheDocument();
        expect(screen.getByTestId('plus-icon')).toBeInTheDocument();

        await user.click(button);

        expect(mockProps.onAddSection).toHaveBeenCalledTimes(1);
    });

    it('should not call onAddSection on initial render', () => {
        render(<PartnerPageToolbar {...mockProps} />);

        expect(mockProps.onAddSection).not.toHaveBeenCalled();
    });

    it('renders the language toolkit with the provided languages', () => {
        render(
            <PartnerPageToolbar
                {...mockProps}
                languages={[
                    { id: 1, code: 'uk', name: 'Ukrainian' },
                    { id: 2, code: 'en', name: 'English' },
                ]}
            />,
        );

        expect(screen.getByTestId('lang-count')).toHaveTextContent('2');
    });

    it('disables the add-section button when disableAddSection is true', () => {
        render(<PartnerPageToolbar {...mockProps} disableAddSection={true} />);

        expect(screen.getByRole('button', { name: /add partner section/i })).toBeDisabled();
    });

    it('keeps the add-section button enabled by default', () => {
        render(<PartnerPageToolbar {...mockProps} />);

        expect(screen.getByRole('button', { name: /add partner section/i })).toBeEnabled();
    });
});
