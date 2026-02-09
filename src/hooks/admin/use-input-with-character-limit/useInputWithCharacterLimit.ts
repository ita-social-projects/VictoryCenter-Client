import { useState } from 'react';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { useTemporaryWarning } from '@/hooks/admin/use-temporary-warning/useTemporaryWarning';

interface UseInputWithCharacterLimitProps<T extends HTMLInputElement | HTMLTextAreaElement> {
    value: string;
    maxLength: number;
    name: string;
    id: string;
    disabled?: boolean;
    maxLimitWarning?: string;
    onChange: (e: React.ChangeEvent<T>) => void;
    onFocus?: (e: React.FocusEvent<T>) => void;
    onBlur?: (e: React.FocusEvent<T>) => void;
    onWarningChange?: (warning: string | null) => void;
}

export const useInputWithCharacterLimit = <T extends HTMLInputElement | HTMLTextAreaElement>({
    value,
    maxLength,
    name,
    id,
    disabled,
    maxLimitWarning,
    onChange,
    onFocus,
    onBlur,
    onWarningChange,
}: UseInputWithCharacterLimitProps<T>) => {
    const [isFocused, setIsFocused] = useState(false);
    const { localWarning, showTemporaryWarning, clearWarning } = useTemporaryWarning({ onWarningChange });
    const currentLength = getNormalizedInputText(value ?? '').length;

    const handleChange = (e: React.ChangeEvent<T>) => {
        const newValue = e.target.value;
        const normalized = getNormalizedInputText(newValue ?? '');

        if (normalized.length > maxLength) {
            if (maxLimitWarning) {
                showTemporaryWarning(maxLimitWarning);
            }
            return;
        } else {
            clearWarning();
        }

        onChange({
            ...e,
            target: {
                ...e.target,
                value: newValue,
            },
        });
    };

    const handleFocus = (e: React.FocusEvent<T>) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<T>) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    const handleClear = () => {
        clearWarning();
        onChange({
            target: { value: '', name, id },
        } as React.ChangeEvent<T>);
    };

    const showClearButton = isFocused && value.length > 0 && !disabled;

    return {
        isFocused,
        currentLength,
        localWarning,
        showClearButton,
        handleChange,
        handleFocus,
        handleBlur,
        handleClear,
    };
};
