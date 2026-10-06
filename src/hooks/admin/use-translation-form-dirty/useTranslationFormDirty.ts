import { useEffect } from 'react';

export const useTranslationFormDirty = <TFormValues>(
    formState: TFormValues,
    initialData: TFormValues | null | undefined,
    defaultFormState: TFormValues,
    onDirtyChange?: (isDirty: boolean) => void,
) => {
    useEffect(() => {
        const isDirty = JSON.stringify(formState) !== JSON.stringify(initialData ?? defaultFormState);
        onDirtyChange?.(isDirty);
    }, [formState, initialData, defaultFormState, onDirtyChange]);
};
