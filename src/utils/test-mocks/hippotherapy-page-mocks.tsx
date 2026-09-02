export const MockRichTextInputGroup = ({ label, onChange, onBlur, value, id, disabled, error, maxLength }: any) => (
    <div>
        <label htmlFor={id}>{label}</label>
        <input
            data-testid={`mock-rich-input-${id}`}
            onChange={(e) => !disabled && onChange(e.target.value)}
            onBlur={() => !disabled && onBlur?.()}
            value={value}
            maxLength={maxLength}
            id={id}
            disabled={disabled}
        />
        {error && <span>{error}</span>}
    </div>
);

export const MockImageInput = ({ onChange, label, setError, disabled }: any) => (
    <div data-testid="mock-image-input">
        {label && <label htmlFor="mock-image-input-id">{label}</label>}
        <input
            data-testid="mock-image-input-file"
            type="file"
            id="mock-image-input-id"
            disabled={disabled}
            onChange={(e) => !disabled && onChange(e.target.files?.[0])}
        />
        <button type="button" onClick={() => !disabled && setError('image size error')}>
            Set Error
        </button>
    </div>
);
