export const MockInputWithCharacterLimitGroup = ({ id, value, onChange, onBlur }: any) => (
    <input data-testid={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
);

export const MockTextAreaWithCharacterLimitGroup = ({ id, value, onChange, onBlur }: any) => (
    <textarea data-testid={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
);

export const MockSubmitButton = ({ children, ...props }: any) => (
    <button data-testid="submit-btn" {...props}>
        {children}
    </button>
);

export const MockImageUploadForm = ({ setImageError }: any) => (
    <div data-testid="image-upload-form">
        <button data-testid="trigger-image-error" type="button" onClick={() => setImageError('Image size error')}>
            Set Error
        </button>
        <button data-testid="clear-image-error" type="button" onClick={() => setImageError(null)}>
            Clear Error
        </button>
    </div>
);

export const MockMainPageCategoryBar = ({ categories, onCategorySelect, selectedCategory }: any) => (
    <div data-testid="category-bar">
        {categories.map((c: any) => (
            <button
                key={c.id}
                data-testid={`tab-btn-${c.id}`}
                disabled={selectedCategory?.id === c.id}
                onClick={() => onCategorySelect(c)}
            >
                {c.label}
            </button>
        ))}
    </div>
);

export const MockMetricEditActions = ({ isFormDirty, isValid, onCancel, onSave }: any) => (
    <div data-testid="metric-actions">
        <button type="button" data-testid="mock-cancel" onClick={onCancel}>
            Cancel
        </button>
        <button type="button" data-testid="mock-save" onClick={onSave} disabled={!isFormDirty || !isValid}>
            Save
        </button>
    </div>
);
