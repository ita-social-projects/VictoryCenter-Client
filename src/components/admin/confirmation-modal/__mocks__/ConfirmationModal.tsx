export const ConfirmationModal = ({ isOpen, title, onConfirm, onCancel, onClose }: any) =>
    isOpen ? (
        <div data-testid="confirm-modal" data-open="true">
            <span>{title}</span>
            <button data-testid="confirm-yes" onClick={onConfirm}>
                Yes
            </button>
            <button data-testid="confirm-no" onClick={onCancel}>
                No
            </button>
            <button data-testid="confirm-close" onClick={onClose}>
                Close
            </button>
        </div>
    ) : null;
