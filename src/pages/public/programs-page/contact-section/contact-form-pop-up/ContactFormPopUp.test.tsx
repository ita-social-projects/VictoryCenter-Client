import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContactFormPopUp } from './ContactFormPopUp';

jest.mock('@/assets/icons/cross.svg', () => ({
    ReactComponent: () => <svg data-testid="cross-icon" />,
}));

jest.mock('@/pages/public/contact-us/components/contact-form-card/ContactFormCard', () => ({
    ContactFormCard: () => <div data-testid="contact-form-card" />,
}));

jest.mock('react-focus-lock', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div>{children} </div>,
}));

describe('ContactFormPopUp Component', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        document.body.style.overflow = 'auto';
    });

    it('does not render the component when isOpen is false', () => {
        const { container } = render(<ContactFormPopUp isOpen={false} onClose={mockOnClose} />);
        expect(screen.queryByTestId('popup-overlay')).not.toBeInTheDocument();
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the popup and its content when isOpen is true', () => {
        render(<ContactFormPopUp isOpen={true} onClose={mockOnClose} />);

        expect(screen.getByTestId('popup-overlay')).toBeInTheDocument();
        expect(screen.getByTestId('cross-icon')).toBeInTheDocument();
        expect(screen.getByTestId('contact-form-card')).toBeInTheDocument();

        expect(screen.getByText(/МИ ЗАВЖДИ/i)).toBeInTheDocument();
        expect(screen.getByText(/ВІДКРИТІ ДЛЯ ВАС/i)).toBeInTheDocument();
    });

    it('calls onClose when the close button is clicked', () => {
        render(<ContactFormPopUp isOpen={true} onClose={mockOnClose} />);

        const closeBtn = screen.getByRole('button', { name: /закрити форму/i, hidden: true });
        fireEvent.click(closeBtn);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the Escape key is pressed', () => {
        render(<ContactFormPopUp isOpen={true} onClose={mockOnClose} />);

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when other keys are pressed', () => {
        render(<ContactFormPopUp isOpen={true} onClose={mockOnClose} />);

        fireEvent.keyDown(document, { key: 'Enter' });

        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('toggles body overflow hidden/auto on open and close', () => {
        const { rerender, unmount } = render(<ContactFormPopUp isOpen={true} onClose={mockOnClose} />);
        expect(document.body.style.overflow).toBe('hidden');

        rerender(<ContactFormPopUp isOpen={false} onClose={mockOnClose} />);
        expect(document.body.style.overflow).toBe('auto');

        rerender(<ContactFormPopUp isOpen={true} onClose={mockOnClose} />);
        expect(document.body.style.overflow).toBe('hidden');

        unmount();
        expect(document.body.style.overflow).toBe('auto');
    });

    describe('Overlay click closure', () => {
        it('calls onClose if mousedown and mouseup occur on the overlay', () => {
            render(<ContactFormPopUp isOpen={true} onClose={mockOnClose} />);
            const overlay = screen.getByTestId('popup-overlay');

            fireEvent.mouseDown(overlay);
            fireEvent.mouseUp(overlay);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('does not call onClose if mousedown is on content and mouseup is on overlay (e.g., text selection)', () => {
            render(<ContactFormPopUp isOpen={true} onClose={mockOnClose} />);
            const overlay = screen.getByTestId('popup-overlay');
            const popupContent = screen.getByRole('presentation', { hidden: true });

            fireEvent.mouseDown(popupContent);
            fireEvent.mouseUp(overlay);

            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('does not call onClose when clicking inside the modal content', () => {
            render(<ContactFormPopUp isOpen={true} onClose={mockOnClose} />);
            const popupContent = screen.getByRole('presentation', { hidden: true });

            fireEvent.click(popupContent);

            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });
});
