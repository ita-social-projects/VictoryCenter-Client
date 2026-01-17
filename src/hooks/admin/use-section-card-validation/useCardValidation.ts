import { useCallback, useState } from 'react';
import { getTrimmedInputText } from '@/utils/functions/formatters/text-formatters';

export interface UseCardValidationProps {
    value: string;
    onChange?: (value: string) => void;
    min?: number;
    max?: number;
    required?: boolean;
}

export const useCardValidation = ({ onChange, min = 0, max = 300, required = true }: UseCardValidationProps) => {
    const [error, setError] = useState<string | undefined>(undefined);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const newValue = e.target.value;

            const limited = newValue.length > max ? newValue.slice(0, max) : newValue;
            onChange?.(limited);

            if (error && getTrimmedInputText(limited).length >= min) setError(undefined);
        },
        [onChange, error, min, max],
    );

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const trimmedValue = getTrimmedInputText(e.target.value);
            let newError: string | undefined;

            if (required && trimmedValue.length === 0) newError = "Поле обов'язкове";
            else if (trimmedValue.length < min) newError = `Не менше ${min} символів`;
            else if (trimmedValue.length > max) newError = `Не більше ${max} символів`;

            setError(newError);
            onChange?.(trimmedValue);
        },
        [onChange, min, max, required],
    );

    return { error, handleChange, handleBlur };
};
