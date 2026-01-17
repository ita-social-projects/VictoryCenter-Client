import React, { useCallback, useRef } from 'react';
import {
    TextAreaWithCharacterLimit,
    TextAreaWithCharacterLimitProps,
} from '../textarea-with-character-limit/TextAreaWithCharacterLimit';
import { getTrimmedInputText } from '@/utils/functions/formatters/text-formatters';

export interface TextAreaWithBulletBehaviorProps extends Omit<TextAreaWithCharacterLimitProps, 'onChange'> {
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const TextAreaWithBulletBehavior = ({
    value,
    onChange,
    maxLength,
    name,
    id,
    onBlur,
    onFocus,
    ...rest
}: TextAreaWithBulletBehaviorProps) => {
    const keydownHandlerRef = useRef<(e: KeyboardEvent) => void | null>(null);

    const removeDocKeydown = useCallback(() => {
        if (keydownHandlerRef.current) {
            document.removeEventListener('keydown', keydownHandlerRef.current);
            keydownHandlerRef.current = null;
        }
    }, []);

    const autosize = useCallback(() => {
        try {
            const el = document.getElementById(id) as HTMLTextAreaElement | null;
            if (!el) return;
            el.style.height = 'auto';
            el.style.overflow = 'hidden';
            el.style.height = `${Math.max(el.scrollHeight, 40)}px`;
        } catch (err) {}
    }, [id]);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        onFocus?.(e);
        if (!value || getTrimmedInputText(value).length === 0) {
            const syntheticEvent = { target: { value: '• ', name, id } } as React.ChangeEvent<HTMLTextAreaElement>;
            onChange(syntheticEvent);
            setTimeout(() => {
                try {
                    const el = document.getElementById(id) as HTMLTextAreaElement | null;
                    if (el) {
                        el.focus();
                        el.selectionStart = el.selectionEnd = 2;
                        autosize();
                    }
                } catch (err) {}
            }, 0);
        }

        removeDocKeydown();
        const handler = (ev: KeyboardEvent) => {
            const target = ev.target as HTMLElement | null;
            const el = document.getElementById(id) as HTMLTextAreaElement | null;
            if (!el || target !== el) return;
            if (ev.key === 'Enter' && !(ev as KeyboardEvent & { shiftKey?: boolean }).shiftKey) {
                ev.preventDefault();
                const current = el.value ?? '';
                const start = el.selectionStart ?? 0;
                const end = el.selectionEnd ?? 0;
                const insert = '\n• ';
                const before = current.slice(0, start);
                const after = current.slice(end);
                let newValue = before + insert + after;
                if (newValue.length > maxLength) {
                    const available = maxLength - (before.length + after.length);
                    if (available <= 0) return;
                    newValue = before + insert.slice(0, available) + after;
                }

                const syntheticEvent = {
                    target: { value: newValue, name, id },
                } as React.ChangeEvent<HTMLTextAreaElement>;
                onChange(syntheticEvent);

                setTimeout(() => {
                    try {
                        const el2 = document.getElementById(id) as HTMLTextAreaElement | null;
                        if (el2) {
                            const pos = start + insert.length;
                            el2.selectionStart = el2.selectionEnd = pos;
                            el2.focus();
                            autosize();
                        }
                    } catch (err) {}
                }, 0);
            }
        };
        keydownHandlerRef.current = handler;
        document.addEventListener('keydown', handler);
    };

    const handleBlurInternal = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        removeDocKeydown();
        try {
            const trimmed = getTrimmedInputText(value);
            if (trimmed.length > 0 && !value.trimStart().startsWith('•')) {
                const syntheticEvent = {
                    target: { value: `• ${trimmed}`, name, id },
                } as React.ChangeEvent<HTMLTextAreaElement>;
                onChange(syntheticEvent);
                setTimeout(() => autosize(), 0);
            }
        } catch (err) {}
        onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e);
        setTimeout(() => autosize(), 0);
    };

    return (
        <TextAreaWithCharacterLimit
            value={value}
            onChange={handleChange}
            onBlur={handleBlurInternal}
            onFocus={handleFocus}
            {...(rest as any)}
            name={name}
            id={id}
            maxLength={maxLength}
        />
    );
};

export default TextAreaWithBulletBehavior;
