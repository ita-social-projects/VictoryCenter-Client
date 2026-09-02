import { fireEvent, screen } from '@testing-library/react';

export const MockModal = ({ isOpen, children, onClose }: any) =>
    isOpen ? (
        <div data-testid="modal">
            <button data-testid="modal-close" onClick={onClose}>
                Close
            </button>
            {children}
        </div>
    ) : null;

MockModal.Title = ({ children }: any) => <div data-testid="modal-title">{children}</div>;

MockModal.Content = ({ children }: any) => <div data-testid="modal-content">{children}</div>;

MockModal.Actions = ({ children }: any) => <div data-testid="modal-actions">{children}</div>;

export const MockConfirmationModal = ({ isOpen, title, onClose, onCancel, onConfirm }: any) =>
    isOpen ? (
        <div data-testid="confirmation-modal">
            <span>{title}</span>

            <button data-testid="confirmation-close" onClick={onClose}>
                Close
            </button>

            <button data-testid="confirmation-cancel" onClick={onCancel}>
                Cancel
            </button>

            <button data-testid="confirmation-confirm" onClick={onConfirm}>
                Confirm
            </button>
        </div>
    ) : null;

export const MockButton = ({ children, disabled, onClick, buttonStyle, ...props }: any) => (
    <button {...props} disabled={disabled} data-button-style={buttonStyle} onClick={onClick}>
        {children}
    </button>
);

export const executeCancelCofirmationFlow = (onCloseMock: jest.Mock) => {
    fireEvent.click(screen.getByTestId('modal-close'));
    fireEvent.click(screen.getByTestId('confirmation-cancel'));

    expect(onCloseMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
};

export const executeConfirmCloseFlow = (onCloseMock: jest.Mock) => {
    fireEvent.click(screen.getByTestId('modal-close'));
    fireEvent.click(screen.getByTestId('confirmation-confirm'));

    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
};
