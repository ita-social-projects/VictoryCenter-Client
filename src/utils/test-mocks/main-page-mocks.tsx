export const MockInputWithCharacterLimitGroup = ({ id, value, onChange, onBlur, disabled }: any) => (
    <input
        data-testid={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
    />
);

export const MockTextAreaWithCharacterLimitGroup = ({ id, value, onChange, onBlur, disabled }: any) => (
    <textarea
        data-testid={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
    />
);

export const MockRichTextInputGroup = ({ id, value, onChange, onBlur, disabled, maxLength, error }: any) => (
    <div>
        <textarea
            id={id}
            data-testid={id}
            data-max-length={maxLength}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
        />
        {error && <span>{error}</span>}
    </div>
);

export const MockSubmitButton = ({ children, buttonStyle: _buttonStyle, ...props }: any) => (
    <button data-testid="submit-btn" {...props}>
        {children}
    </button>
);

export const MockImageUploadForm = ({ setImageError, disabled }: any) => (
    <div data-testid="image-upload-form" data-disabled={disabled ? 'true' : 'false'}>
        <button data-testid="trigger-image-error" type="button" onClick={() => setImageError('Image size error')}>
            Set Error
        </button>
        <button data-testid="clear-image-error" type="button" onClick={() => setImageError(null)}>
            Clear Error
        </button>
    </div>
);

export const MockMainPageCategoryBar = ({
    categories,
    getCategoryDisplayName,
    getCategoryKey,
    onCategorySelect,
    selectedCategory,
    renderCategoryExtra,
}: any) => (
    <div data-testid="category-bar">
        {[...categories, ...((globalThis as any).__MAIN_PAGE_EXTRA_TABS__ ?? [])].map((c: any) => (
            <div key={getCategoryKey?.(c) ?? c.id}>
                <button
                    data-testid={`tab-btn-${c.id}`}
                    disabled={selectedCategory?.id === c.id}
                    onClick={() => onCategorySelect(c)}
                >
                    {getCategoryDisplayName?.(c) ?? c.label}
                </button>
                {renderCategoryExtra?.(c)}
            </div>
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
