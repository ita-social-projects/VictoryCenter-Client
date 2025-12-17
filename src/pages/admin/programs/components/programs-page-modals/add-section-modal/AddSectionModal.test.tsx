import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddSectionModal, AddSectionModalProps } from './AddSectionModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ButtonProps } from '@/components/admin/button/Button';
import { ModalProps } from '@/components/common/modal/Modal';

jest.mock('@/components/common/modal/Modal', () => {
    const ModalMock = ({ isOpen, onClose, children, maxWidth }: ModalProps & { maxWidth?: string }) =>
        isOpen ? (
            <div data-testid="add-section-modal" data-max-width={maxWidth}>
                <button data-testid="modal-close-btn" onClick={onClose}>
                    X
                </button>
                {children}
            </div>
        ) : null;

    ModalMock.Title = ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>;
    ModalMock.Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
    ModalMock.Actions = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

    return {
        __esModule: true,
        Modal: ModalMock,
    };
});

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, buttonStyle }: ButtonProps & { buttonStyle?: string }) => (
        <button onClick={onClick} disabled={disabled} data-button-style={buttonStyle}>
            {children}
        </button>
    ),
}));

describe('AddSectionModal', () => {
    const mockOnClose = jest.fn();

    const defaultProps: AddSectionModalProps = {
        isOpen: true,
        onClose: mockOnClose,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render when isOpen is true', () => {
        render(<AddSectionModal {...defaultProps} />);

        expect(screen.getByTestId('add-section-modal')).toBeInTheDocument();
        expect(screen.getByText('Додати секцію')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
        render(<AddSectionModal {...defaultProps} isOpen={false} />);

        expect(screen.queryByTestId('add-section-modal')).not.toBeInTheDocument();
    });

    it('should have correct modal width', () => {
        render(<AddSectionModal {...defaultProps} />);

        const modal = screen.getByTestId('add-section-modal');
        expect(modal).toHaveAttribute('data-max-width', '80vw');
    });

    it('should call onClose when close button is clicked', () => {
        render(<AddSectionModal {...defaultProps} />);

        const closeButton = screen.getByTestId('modal-close-btn');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when cancel button is clicked', () => {
        render(<AddSectionModal {...defaultProps} />);

        const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when save button is clicked', () => {
        render(<AddSectionModal {...defaultProps} />);

        const saveButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.SAVE);
        fireEvent.click(saveButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should render cancel and save buttons', () => {
        render(<AddSectionModal {...defaultProps} />);

        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.SAVE)).toBeInTheDocument();
    });

    it('should render the modal content area', () => {
        render(<AddSectionModal {...defaultProps} />);

        const contentArea = screen.getByTestId('add-section-modal');
        expect(contentArea.querySelector('.add-section-modal-content')).toBeInTheDocument();
    });
});
