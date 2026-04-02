import { useState } from 'react';
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
    const currentLength = (value ?? '').length;

    const handleChange = (e: React.ChangeEvent<T>) => {
        let newValue = e.target.value;

        const isTruncatableField = name === 'title' || name === 'description';

        if (newValue.length > maxLength) {
            if (isTruncatableField) {
                const truncatedValue = newValue.slice(0, maxLength);

                onChange({
                    ...e,
                    target: {
                        ...e.target,
                        value: truncatedValue,
                    },
                });
            }

            if (maxLimitWarning) {
                showTemporaryWarning(maxLimitWarning);
            }
            return;
        }

        clearWarning();

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

        const trimmed = (value ?? '').trim();
        if (trimmed !== value) {
            onChange({
                target: { value: trimmed, name, id },
            } as React.ChangeEvent<T>);
        }

        onBlur?.(e);
    };

    const handleClear = () => {
        clearWarning();
        onChange({
            target: { value: '', name, id },
        } as React.ChangeEvent<T>);
    };

    const showClearButton = isFocused && (value ?? '').length > 0 && !disabled;

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
