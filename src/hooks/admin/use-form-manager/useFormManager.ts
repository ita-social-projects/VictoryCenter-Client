import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { VisibilityStatus } from '../../../types/admin/common';

export function useFormManager<TFormValues, TFormErrors extends Record<string, unknown>>({
    defaultFormState,
    initialData,
    validateForm,
    onSubmit,
    onValidationChange,
    ref,
}: {
    defaultFormState: TFormValues;
    initialData?: TFormValues | null;
    validateForm: (values: TFormValues, isPublishing: boolean) => TFormErrors;
    onSubmit: (data: TFormValues, status: VisibilityStatus) => Promise<void> | void;
    onValidationChange?: (isValid: boolean) => void;
    ref?: React.Ref<any>;
}) {
    const [formState, setFormState] = useState<TFormValues>(defaultFormState);
    const [errors, setErrors] = useState<TFormErrors>({} as TFormErrors);
    const [initialFormState, setInitialFormState] = useState<TFormValues>(defaultFormState);
    const isSubmittingRef = useRef(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reset = useCallback(
        (data?: TFormValues | null) => {
            const newState = data ?? defaultFormState;
            setFormState(newState);
            setInitialFormState(newState);
            setErrors({} as TFormErrors);
        },
        [defaultFormState],
    );

    const isDirty = useCallback(() => {
        return JSON.stringify(formState) !== JSON.stringify(initialFormState);
    }, [formState, initialFormState]);

    const isValid = useCallback(
        (isPublishing = false) => {
            const formErrors = validateForm(formState, isPublishing) || {};
            return !Object.values(formErrors).some((e) => e !== undefined);
        },
        [formState, validateForm],
    );

    useEffect(() => {
        const formErrors = validateForm(formState, false) || {};
        const valid = !Object.values(formErrors).some((e) => e !== undefined);
        onValidationChange?.(valid);
    }, [formState, validateForm, onValidationChange]);

    useEffect(() => {
        reset(initialData);
    }, [initialData, reset]);

    const submit = useCallback(
        async (status: VisibilityStatus) => {
            if (isSubmittingRef.current) return;
            isSubmittingRef.current = true;
            setIsSubmitting(true);
            const isPublishing = status === VisibilityStatus.Published;
            try {
                const formErrors = validateForm(formState, isPublishing) || {};
                setErrors(formErrors);
                if (Object.values(formErrors).some((e) => e !== undefined)) return;
                await onSubmit(formState, status);
            } finally {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            }
        },
        [formState, onSubmit, validateForm],
    );

    useImperativeHandle(
        ref,
        () => ({
            submit,
            isValid,
            isDirty,
        }),
        [submit, isValid, isDirty],
    );

    return {
        formState,
        setFormState,
        errors,
        setErrors,
        isSubmitting,
        reset,
        isDirty,
        isValid,
        submit,
    };
}
