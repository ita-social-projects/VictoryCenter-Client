import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { VisibilityStatus } from '@/types/admin/common';

export interface FormManagerRef<TFormValues = any> {
    submit: (status: VisibilityStatus) => Promise<void>;
    isValid: (isPublishing?: boolean) => boolean;
    isDirty: () => boolean;
    getValues: () => TFormValues;
}

export interface UseFormManagerProps<TFormValues, TFormErrors> {
    defaultFormState: TFormValues;
    initialData?: TFormValues | null;
    validateForm: (values: TFormValues, isPublishing: boolean) => TFormErrors;
    onSubmit: (data: TFormValues, status: VisibilityStatus) => Promise<void> | void;
    onValidationChange?: (isValid: boolean) => void;
    isEqual?: (currentValues: TFormValues, initialValues: TFormValues) => boolean;
    ref?: React.Ref<FormManagerRef<TFormValues>>;
}

export interface UseFormManagerReturn<TFormValues, TFormErrors> {
    formState: TFormValues;
    setFormState: React.Dispatch<React.SetStateAction<TFormValues>>;
    errors: TFormErrors;
    setErrors: React.Dispatch<React.SetStateAction<TFormErrors>>;
    isSubmitting: boolean;
    reset: (data?: TFormValues | null) => void;
    isDirty: () => boolean;
    isValid: (isPublishing?: boolean) => boolean;
    submit: (status: VisibilityStatus) => Promise<void>;
}

export function useFormManager<TFormValues, TFormErrors extends Record<string, unknown>>({
    defaultFormState,
    initialData,
    validateForm,
    onSubmit,
    onValidationChange,
    isEqual,
    ref,
}: UseFormManagerProps<TFormValues, TFormErrors>): UseFormManagerReturn<TFormValues, TFormErrors> {
    const [formState, setFormState] = useState<TFormValues>(() => initialData ?? defaultFormState);
    const [errors, setErrors] = useState<TFormErrors>({} as TFormErrors);
    const [initialFormState, setInitialFormState] = useState<TFormValues>(() => initialData ?? defaultFormState);
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
        if (isEqual) {
            return !isEqual(formState, initialFormState);
        }

        return JSON.stringify(formState) !== JSON.stringify(initialFormState);
    }, [formState, initialFormState, isEqual]);

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
            getValues: () => formState,
        }),
        [submit, isValid, isDirty, formState],
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
