import { useState } from 'react';

export const MockCategoryBar = ({ categories, selectedCategory, getCategoryDisplayName, onCategorySelect }: any) => (
    <div data-testid="mock-category-bar">
        {categories.map((cat: any) => (
            <button
                key={cat.id}
                data-testid={`tab-${cat.id}`}
                className={selectedCategory?.id === cat.id ? 'selected' : ''}
                onClick={() => onCategorySelect(cat)}
            >
                {getCategoryDisplayName(cat)}
            </button>
        ))}
    </div>
);

export const MockButton = (props: any) => (
    <button {...props} data-testid={props['data-testid'] || 'button'}>
        {props.children}
    </button>
);

export const MockConfirmationModal = ({ isOpen, onConfirm, onCancel }: any) =>
    isOpen ? (
        <div data-testid="confirmation-modal">
            <button data-testid="confirm-close" onClick={onConfirm}>
                confirm
            </button>
            <button data-testid="cancel-close" onClick={onCancel}>
                cancel
            </button>
        </div>
    ) : null;

export const MockLocalizationModal = ({
    isOpen,
    children,
    onClose,
    onSave,
    isSubmitting,
    isFormValid,
    checkIsDirty,
    title,
}: any) => {
    const [showConfirmation, setShowConfirmation] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        if (checkIsDirty && checkIsDirty()) {
            setShowConfirmation(true);
        } else {
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setShowConfirmation(false);
        onClose();
    };

    const handleCancelClose = () => {
        setShowConfirmation(false);
    };

    return (
        <>
            <div
                data-testid="modal"
                onClick={handleClose}
                role="dialog"
                aria-modal="true"
                tabIndex={0}
                onKeyDown={(e: any) => {
                    if (e.key === 'Escape') handleClose();
                }}
            >
                <div data-testid="modal-title">{title}</div>
                <div data-testid="modal-content">{children}</div>
                <div data-testid="modal-actions">
                    <button
                        data-testid="save-localization-btn"
                        onClick={onSave}
                        disabled={isSubmitting || !isFormValid}
                    >
                        Save
                    </button>
                </div>
            </div>
            {showConfirmation && (
                <div data-testid="confirmation-modal">
                    <button data-testid="confirm-close" onClick={handleConfirmClose}>
                        confirm
                    </button>
                    <button data-testid="cancel-close" onClick={handleCancelClose}>
                        cancel
                    </button>
                </div>
            )}
        </>
    );
};

export const MockOption = ({ value, name, ...props }: any) => (
    <option value={typeof value === 'object' ? JSON.stringify(value) : value} {...props}>
        {name}
    </option>
);

export const MockSelect: any = ({ children, onValueChange, ...props }: any) => {
    const handleChange = (e: any) => {
        let val: any = e.target.value;
        try {
            val = JSON.parse(val);
        } catch {}
        if (onValueChange) {
            onValueChange(val);
        }
    };

    return (
        <select data-testid={props['data-testid'] || 'select'} onChange={handleChange}>
            {children}
        </select>
    );
};

MockSelect.Option = MockOption;
