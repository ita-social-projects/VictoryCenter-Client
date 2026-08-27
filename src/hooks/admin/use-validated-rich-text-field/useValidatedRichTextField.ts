import { useState } from 'react';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';

export interface UseValidatedRichTextFieldParams {
    value: string;
    onChange: (value: string) => void;
    minLength?: number;
    isOptional?: boolean;
}

export const useValidatedRichTextField = ({
    value,
    onChange,
    minLength = HIPPOTHERAPY_PAGE_TEXT.MIN_TEXT_LENGTH,
    isOptional = false,
}: UseValidatedRichTextFieldParams) => {
    const [error, setError] = useState<string | undefined>();

    const validate = (text: string) => {
        const plainText = getPlainTextFromHtml(text);

        if (isOptional && !plainText.trim()) {
            return undefined;
        }

        return HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(plainText, minLength);
    };

    const handleChange = (nextValue: string) => {
        onChange(nextValue);

        if (error !== undefined) {
            setError(validate(nextValue));
        }
    };

    const handleBlur = () => {
        setError(validate(value));
    };

    return { error, handleChange, handleBlur };
};
