import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '@/validation/admin/who-we-are-schema/WhoWeAreSchema';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { useEffect, useRef } from 'react';

export const useReadyRef = () => {
    const isReadyRef = useRef(false);

    useEffect(() => {
        const id = setTimeout(() => {
            isReadyRef.current = true;
        }, 0);

        return () => clearTimeout(id);
    }, []);

    return isReadyRef;
};

export const useDirtyChangeEffect = <TFormState>(
    formState: TFormState,
    initialData: TFormState | null,
    onDirtyChange?: (isDirty: boolean) => void,
): void => {
    useEffect(() => {
        const isDirty = JSON.stringify(formState) !== JSON.stringify(initialData);
        onDirtyChange?.(isDirty);
    }, [formState, initialData, onDirtyChange]);
};

export const getWhoWeAreTextValidationError = (value: string): string | undefined => {
    const plainText = getPlainTextFromHtml(value).trim();
    return WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainText);
};
