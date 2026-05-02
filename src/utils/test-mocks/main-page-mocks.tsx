import React from 'react';

export const MockInputWithCharacterLimitGroup = ({ id, value, onChange, onBlur }: any) => (
    <input data-testid={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
);

export const MockTextAreaWithCharacterLimitGroup = ({ id, value, onChange, onBlur }: any) => (
    <textarea data-testid={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
);

export const MockSubmitButton = ({ children, disabled, type }: any) => (
    <button data-testid="submit-btn" type={type} disabled={disabled}>
        {children}
    </button>
);

export const MockImageInput = ({ setError, onChange }: any) => (
    <div data-testid="image-input-mock">
        <button data-testid="trigger-image-change" type="button" onClick={() => onChange({ file: 'fake.jpg' })}>
            Change Image
        </button>
        <button data-testid="trigger-image-error" type="button" onClick={() => setError('Image size error')}>
            Set Error
        </button>
        <button data-testid="clear-image-error" type="button" onClick={() => setError(null)}>
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
