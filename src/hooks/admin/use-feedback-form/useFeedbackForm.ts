import { ForwardedRef, useEffect, useImperativeHandle } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { GenericFormRef } from '@/hooks/admin/use-generic-modal/useGenericModal';
import { VisibilityStatus } from '@/types/admin/common';

interface UseFeedbackFormParams<TFormValues extends FieldValues> {
    form: UseFormReturn<TFormValues>;
    ref: ForwardedRef<GenericFormRef>;
    initialData: TFormValues | null;
    defaultValues: TFormValues;
    onSubmit: (data: TFormValues, status: VisibilityStatus) => void;
    onValidationChange?: (isValid: boolean) => void;
}

export const useFeedbackForm = <TFormValues extends FieldValues>({
    form,
    ref,
    initialData,
    defaultValues,
    onSubmit,
    onValidationChange,
}: UseFeedbackFormParams<TFormValues>) => {
    const {
        handleSubmit,
        reset,
        formState: { isDirty, isValid },
    } = form;

    useEffect(() => {
        reset(initialData ?? defaultValues);
    }, [initialData, defaultValues, reset]);

    useImperativeHandle(
        ref,
        () => ({
            submit: (status: VisibilityStatus) => handleSubmit((data) => onSubmit(data, status))(),
            isDirty: () => isDirty,
            isValid: () => isValid,
        }),
        [handleSubmit, onSubmit, isDirty, isValid],
    );

    useEffect(() => {
        onValidationChange?.(isValid);
    }, [isValid, isDirty, onValidationChange]);
};
