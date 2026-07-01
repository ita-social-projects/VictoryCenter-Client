import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeleteCategoryConfirmModal } from './DeleteCategoryConfirmModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

jest.mock('@/components/common/modal/Modal', () => {
    const ModalMock = ({ isOpen, children }: any) => (isOpen ? <div data-testid="modal">{children}</div> : null);
    ModalMock.Title = ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>;
    ModalMock.Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
    ModalMock.Actions = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
    return { Modal: ModalMock };
});

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

describe('DeleteCategoryConfirmModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        isSubmitting: false,
    };

    const renderModal = (overrideProps = {}) =>
        render(<DeleteCategoryConfirmModal {...defaultProps} {...overrideProps} />);

    const getDeleteButton = () => screen.getByText(COMMON_TEXT_ADMIN.BUTTON.DELETE);
    const getCancelButton = () => screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render correctly when open', () => {
        renderModal();

        expect(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.DELETE_CATEGORY_CONFIRM)).toBeInTheDocument();
        expect(getDeleteButton()).toBeInTheDocument();
        expect(getCancelButton()).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
        renderModal({ isOpen: false });

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should call onConfirm when delete button is clicked', () => {
        renderModal();

        fireEvent.click(getDeleteButton());

        expect(defaultProps.onConfirm).toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked', () => {
        renderModal();

        fireEvent.click(getCancelButton());

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should disable buttons when isSubmitting is true', () => {
        renderModal({ isSubmitting: true });

        expect(getDeleteButton()).toBeDisabled();
        expect(getCancelButton()).toBeDisabled();
    });

    it('should enable buttons when isSubmitting is false', () => {
        renderModal({ isSubmitting: false });

        expect(getDeleteButton()).not.toBeDisabled();
        expect(getCancelButton()).not.toBeDisabled();
    });
});
