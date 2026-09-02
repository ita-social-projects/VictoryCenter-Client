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
    <button {...props} disabled={disabled} buttonStyle={buttonStyle} onClick={onClick}>
        {children}
    </button>
);
