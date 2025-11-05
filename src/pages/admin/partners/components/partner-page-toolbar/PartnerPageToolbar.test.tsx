import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartnerPageToolbar, PartnerPageToolbarProps } from './PartnerPageToolbar';
import { PARTNERS_TEXT } from '../../../../../const/admin/partners';

jest.mock('../../../../../components/admin/button/Button', () => ({
    Button: ({ children, onClick, buttonStyle }: any) => (
        <button onClick={onClick} data-button-style={buttonStyle}>
            {children}
        </button>
    ),
}));

jest.mock('../../../../../assets/icons/plus.svg', () => ({
    ReactComponent: () => <svg data-testid="plus-icon" />,
}));

jest.mock('../../../../../const/admin/partners', () => ({
    PARTNERS_TEXT: {
        BUTTON: {
            ADD_PARTNER_SECTION: 'Add Partner Section',
        },
    },
}));

jest.mock('./PartnerPageToolbar.scss', () => ({}));

describe('PartnerPageToolbar', () => {
    const user = userEvent.setup();

    const mockProps: PartnerPageToolbarProps = {
        onAddSection: jest.fn(),
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
});
