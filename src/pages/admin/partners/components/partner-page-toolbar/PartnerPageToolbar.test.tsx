import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartnerPageToolbar, PartnerPageToolbarProps } from './PartnerPageToolbar';
import { PARTNERS_TEXT } from '../../../../../const/admin/partners';

// Мокаємо Button компонент
jest.mock('../../../../../components/admin/button/Button', () => ({
    Button: ({ children, onClick, buttonStyle }: any) => (
        <button onClick={onClick} data-button-style={buttonStyle} data-testid="add-partner-button">
            {children}
        </button>
    ),
}));

// Мокаємо іконку
jest.mock('../../../../../assets/icons/plus.svg', () => ({
    ReactComponent: () => <svg data-testid="plus-icon">Plus Icon</svg>,
}));

// Мокаємо константи
jest.mock('../../../../../const/admin/partners', () => ({
    PARTNERS_TEXT: {
        BUTTON: {
            ADD_PARTNER_SECTION: 'Add Partner Section',
        },
    },
}));

// Мокаємо стилі
jest.mock('./PartnerPageToolbar.scss', () => ({}));

describe('PartnerPageToolbar', () => {
    const defaultProps: PartnerPageToolbarProps = {
        onAddPartner: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render toolbar container', () => {
            render(<PartnerPageToolbar {...defaultProps} />);

            const toolbar = screen.getByTestId('partner-page-toolbar');
            expect(toolbar).toBeInTheDocument();
            expect(toolbar).toHaveClass('toolbar', 'par-toolbar');
        });

        it('should render add partner button', () => {
            render(<PartnerPageToolbar {...defaultProps} />);

            const button = screen.getByTestId('add-partner-button');
            expect(button).toBeInTheDocument();
        });

        it('should render button with correct text', () => {
            render(<PartnerPageToolbar {...defaultProps} />);

            expect(screen.getByText('Add Partner Section')).toBeInTheDocument();
        });

        it('should render plus icon', () => {
            render(<PartnerPageToolbar {...defaultProps} />);

            const icon = screen.getByTestId('plus-icon');
            expect(icon).toBeInTheDocument();
        });

        it('should render button with primary style', () => {
            render(<PartnerPageToolbar {...defaultProps} />);

            const button = screen.getByTestId('add-partner-button');
            expect(button).toHaveAttribute('data-button-style', 'primary');
        });

        it('should have correct CSS classes', () => {
            render(<PartnerPageToolbar {...defaultProps} />);

            const toolbar = screen.getByTestId('partner-page-toolbar');
            expect(toolbar.querySelector('.toolbar-actions')).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('should call onAddPartner when button is clicked', () => {
            const onAddPartner = jest.fn();
            render(<PartnerPageToolbar onAddPartner={onAddPartner} />);

            const button = screen.getByTestId('add-partner-button');
            fireEvent.click(button);

            expect(onAddPartner).toHaveBeenCalledTimes(1);
        });

        it('should call onAddPartner when button is clicked with userEvent', async () => {
            const onAddPartner = jest.fn();
            render(<PartnerPageToolbar onAddPartner={onAddPartner} />);

            const button = screen.getByTestId('add-partner-button');
            await userEvent.click(button);

            expect(onAddPartner).toHaveBeenCalledTimes(1);
        });

        it('should call onAddPartner multiple times when clicked multiple times', () => {
            const onAddPartner = jest.fn();
            render(<PartnerPageToolbar onAddPartner={onAddPartner} />);

            const button = screen.getByTestId('add-partner-button');
            fireEvent.click(button);
            fireEvent.click(button);
            fireEvent.click(button);

            expect(onAddPartner).toHaveBeenCalledTimes(3);
        });

        it('should not call onAddPartner on mount', () => {
            const onAddPartner = jest.fn();
            render(<PartnerPageToolbar onAddPartner={onAddPartner} />);

            expect(onAddPartner).not.toHaveBeenCalled();
        });
    });

    describe('Props', () => {
        it('should accept and use onAddPartner prop', () => {
            const customHandler = jest.fn();
            render(<PartnerPageToolbar onAddPartner={customHandler} />);

            const button = screen.getByTestId('add-partner-button');
            fireEvent.click(button);

            expect(customHandler).toHaveBeenCalled();
        });

        it('should work with different onAddPartner handlers', () => {
            const handler1 = jest.fn();
            const { rerender } = render(<PartnerPageToolbar onAddPartner={handler1} />);

            const button = screen.getByTestId('add-partner-button');
            fireEvent.click(button);
            expect(handler1).toHaveBeenCalledTimes(1);

            const handler2 = jest.fn();
            rerender(<PartnerPageToolbar onAddPartner={handler2} />);

            fireEvent.click(button);
            expect(handler2).toHaveBeenCalledTimes(1);
            expect(handler1).toHaveBeenCalledTimes(1); // Не викликався повторно
        });
    });

    describe('Accessibility', () => {
        it('should have accessible button element', () => {
            render(<PartnerPageToolbar {...defaultProps} />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('should have button with text content for screen readers', () => {
            render(<PartnerPageToolbar {...defaultProps} />);

            const button = screen.getByRole('button', { name: /add partner section/i });
            expect(button).toBeInTheDocument();
        });

        it('should render toolbar with data-testid for testing', () => {
            render(<PartnerPageToolbar {...defaultProps} />);

            expect(screen.getByTestId('partner-page-toolbar')).toBeInTheDocument();
        });
    });

    describe('Structure', () => {
        it('should render correct DOM structure', () => {
            const { container } = render(<PartnerPageToolbar {...defaultProps} />);

            const toolbar = container.querySelector('.toolbar.par-toolbar');
            expect(toolbar).toBeInTheDocument();

            const toolbarActions = toolbar?.querySelector('.toolbar-actions');
            expect(toolbarActions).toBeInTheDocument();

            const button = toolbarActions?.querySelector('[data-testid="add-partner-button"]');
            expect(button).toBeInTheDocument();
        });

        it('should contain button inside toolbar-actions', () => {
            const { container } = render(<PartnerPageToolbar {...defaultProps} />);

            const toolbarActions = container.querySelector('.toolbar-actions');
            const button = toolbarActions?.querySelector('[data-testid="add-partner-button"]');

            expect(button).toBeInTheDocument();
        });
    });

    describe('Integration with Button component', () => {
        it('should pass buttonStyle prop to Button component', () => {
            render(<PartnerPageToolbar {...defaultProps} />);

            const button = screen.getByTestId('add-partner-button');
            expect(button).toHaveAttribute('data-button-style', 'primary');
        });

        it('should pass onClick prop to Button component', () => {
            const onAddPartner = jest.fn();
            render(<PartnerPageToolbar onAddPartner={onAddPartner} />);

            const button = screen.getByTestId('add-partner-button');
            fireEvent.click(button);

            expect(onAddPartner).toHaveBeenCalled();
        });

        it('should render button children correctly', () => {
            render(<PartnerPageToolbar {...defaultProps} />);

            const button = screen.getByTestId('add-partner-button');
            expect(button).toHaveTextContent('Add Partner Section');
            expect(button.querySelector('[data-testid="plus-icon"]')).toBeInTheDocument();
        });
    });

    describe('Constants integration', () => {
        it('should use PARTNERS_TEXT constant for button text', () => {
            render(<PartnerPageToolbar {...defaultProps} />);

            expect(screen.getByText(PARTNERS_TEXT.BUTTON.ADD_PARTNER_SECTION)).toBeInTheDocument();
        });
    });

    describe('Edge cases', () => {
        it('should handle rapid clicks', () => {
            const onAddPartner = jest.fn();
            render(<PartnerPageToolbar onAddPartner={onAddPartner} />);

            const button = screen.getByTestId('add-partner-button');

            // Симулюємо швидкі кліки
            for (let i = 0; i < 10; i++) {
                fireEvent.click(button);
            }

            expect(onAddPartner).toHaveBeenCalledTimes(10);
        });

        it('should maintain functionality after re-render', () => {
            const onAddPartner = jest.fn();
            const { rerender } = render(<PartnerPageToolbar onAddPartner={onAddPartner} />);

            const button = screen.getByTestId('add-partner-button');
            fireEvent.click(button);
            expect(onAddPartner).toHaveBeenCalledTimes(1);

            // Re-render з тим самим пропом
            rerender(<PartnerPageToolbar onAddPartner={onAddPartner} />);

            fireEvent.click(button);
            expect(onAddPartner).toHaveBeenCalledTimes(2);
        });
    });

    describe('Snapshot', () => {
        it('should match snapshot', () => {
            const { container } = render(<PartnerPageToolbar {...defaultProps} />);
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});
