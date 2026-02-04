import { useCallback, useEffect, useState } from 'react';
import { getTrimmedInputText } from '@/utils/functions/formatters/text-formatters';

export interface UseCardValidationProps {
    value: string;
    onChange?: (value: string) => void;
    min?: number;
    max?: number;
    required?: boolean;
    resetKey?: number;
}

export const useCardValidation = ({
    value,
    onChange,
    min = 0,
    max = 300,
    required = true,
    resetKey,
}: UseCardValidationProps) => {
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        setError(undefined);
    }, [resetKey]);

    useEffect(() => {
        if (!error) return;
        const trimmed = getTrimmedInputText(value);
        const isEmpty = trimmed.length === 0;
        const isValid = (!required || !isEmpty) && trimmed.length >= min && trimmed.length <= max;
        if (isValid) setError(undefined);
    }, [value, error, min, max, required]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const newValue = e.target.value;

            const limited = newValue.length > max ? newValue.slice(0, max) : newValue;
            onChange?.(limited);
            const trimmedLength = getTrimmedInputText(limited).length;
            if (error && (trimmedLength >= min || (!required && trimmedLength === 0))) {
                setError(undefined);
            }
        },
        [onChange, error, min, max, required],
    );

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const trimmedValue = getTrimmedInputText(e.target.value);
            let newError: string | undefined;

            if (required && trimmedValue.length === 0) newError = "Поле обов'язкове";
            else if (trimmedValue.length > 0 && trimmedValue.length < min) newError = `Не менше ${min} символів`;
            else if (trimmedValue.length > max) newError = `Не більше ${max} символів`;

            setError(newError);
            onChange?.(trimmedValue);
        },
        [onChange, min, max, required],
    );

    return { error, handleChange, handleBlur };
};
