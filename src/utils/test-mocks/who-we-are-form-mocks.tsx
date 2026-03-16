import React from 'react';

interface MockRichTextInputGroupProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    disabled?: boolean;
    error?: string;
}

export const MockRichTextInputGroup: React.FC<MockRichTextInputGroupProps> = ({
    id,
    value,
    onChange,
    onBlur,
    onFocus,
    disabled,
    error,
}) => (
    <div>
        <textarea
            data-testid={`rich-text-${id}`}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
        />
        {error && <span data-testid={`error-${id}`}>{error}</span>}
    </div>
);

export const mockWhoWeAreSchemaModule = {
    WHO_WE_ARE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn((_: string | null | undefined) => undefined as string | undefined),
    },
};

export const getWhoWeAreValidationMock = () => mockWhoWeAreSchemaModule.WHO_WE_ARE_VALIDATION_FUNCTIONS;