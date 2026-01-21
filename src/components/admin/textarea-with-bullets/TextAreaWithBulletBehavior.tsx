import { useCallback, useRef, useEffect } from 'react';
import {
    TextAreaWithCharacterLimit,
    TextAreaWithCharacterLimitProps,
} from '../textarea-with-character-limit/TextAreaWithCharacterLimit';
import { getTrimmedInputText } from '@/utils/functions/formatters/text-formatters';

export interface TextAreaWithBulletBehaviorProps extends Omit<TextAreaWithCharacterLimitProps, 'onChange'> {
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const BULLET_PREFIX = '• ';
const BULLET = '•';

export const TextAreaWithBulletBehavior = ({
    value,
    onChange,
    maxLength,
    name,
    id,
    onBlur,
    onFocus,
    onKeyDown,
    ...rest
}: TextAreaWithBulletBehaviorProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pendingCursorPosRef = useRef<number | null>(null);

    useEffect(() => {
        if (pendingCursorPosRef.current !== null && textareaRef.current) {
            textareaRef.current.selectionStart = pendingCursorPosRef.current;
            textareaRef.current.selectionEnd = pendingCursorPosRef.current;
            pendingCursorPosRef.current = null;
        }
    }, [value]);

    const ensureBulletPrefix = useCallback((text: string): string => {
        const trimmed = getTrimmedInputText(text);
        if (trimmed.length === 0) return BULLET_PREFIX;
        if (trimmed.startsWith(BULLET)) return trimmed;
        return `${BULLET_PREFIX}${trimmed}`;
    }, []);

    const notifyChange = useCallback(
        (newValue: string) => {
            const syntheticEvent = {
                target: { value: newValue, name, id },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            onChange(syntheticEvent);
        },
        [onChange, name, id],
    );

    const handleFocus = useCallback(
        (e: React.FocusEvent<HTMLTextAreaElement>) => {
            onFocus?.(e);

            if (!value || getTrimmedInputText(value).length === 0) {
                notifyChange(BULLET_PREFIX);
                pendingCursorPosRef.current = BULLET_PREFIX.length;
            }
        },
        [value, onFocus, notifyChange],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            onKeyDown?.(e);
            if (e.defaultPrevented || e.key !== 'Enter' || e.shiftKey) return;

            e.preventDefault();
            const textarea = e.currentTarget;
            const current = textarea.value;
            const start = textarea.selectionStart ?? 0;
            const end = textarea.selectionEnd ?? 0;

            const newlineWithBullet = '\n' + BULLET_PREFIX;
            const before = current.slice(0, start);
            const after = current.slice(end);

            let newValue = before + newlineWithBullet + after;

            if (newValue.length > maxLength) {
                const available = maxLength - (before.length + after.length);
                if (available <= newlineWithBullet.length) return;
                newValue = before + newlineWithBullet.slice(0, available) + after;
            }

            notifyChange(newValue);
            pendingCursorPosRef.current = start + newlineWithBullet.length;
        },
        [maxLength, notifyChange, onKeyDown],
    );

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLTextAreaElement>) => {
            const currentValue = e.currentTarget.value;
            const trimmed = getTrimmedInputText(currentValue);

            if (trimmed.length > 0 && !trimmed.startsWith(BULLET)) {
                const newValue = ensureBulletPrefix(currentValue);
                notifyChange(newValue);
            }

            onBlur?.(e);
        },
        [onBlur, ensureBulletPrefix, notifyChange],
    );

    return (
        <TextAreaWithCharacterLimit
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            {...rest}
            onKeyDown={handleKeyDown}
            name={name}
            id={id}
            maxLength={maxLength}
        />
    );
};

export default TextAreaWithBulletBehavior;
