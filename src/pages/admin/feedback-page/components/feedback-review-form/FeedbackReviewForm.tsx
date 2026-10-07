import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { VisibilityStatus } from '@/types/admin/common';
import { GenericFormRef } from '@/hooks/admin/use-generic-modal/useGenericModal';
import {
    FeedbackReviewFormValues,
    FeedbackReviewValidationSchema,
} from '@/validation/admin/feedback-review-schema/feedback-review-schema';
import { FeedbackReviewFormFields } from '../feedback-review-form-fields/FeedbackReviewFormFields';

export type FeedbackReviewFormRef = GenericFormRef;

export interface FeedbackReviewFormProps {
    initialData: FeedbackReviewFormValues | null;
    formDisabled?: boolean;
    onSubmit: (data: FeedbackReviewFormValues, status: VisibilityStatus) => void;
    onValidationChange?: (isValid: boolean) => void;
}

const DEFAULT_FORM_STATE: FeedbackReviewFormValues = {
    authorName: '',
    text: '',
};

export const FeedbackReviewForm = forwardRef<FeedbackReviewFormRef, FeedbackReviewFormProps>(
    ({ initialData, formDisabled, onSubmit, onValidationChange }, ref) => {
        const {
            control,
            handleSubmit,
            reset,
            formState: { errors, isDirty, isValid },
        } = useForm<FeedbackReviewFormValues>({
            resolver: yupResolver(FeedbackReviewValidationSchema as Yup.ObjectSchema<FeedbackReviewFormValues>),
            defaultValues: initialData ?? DEFAULT_FORM_STATE,
            mode: 'onTouched',
        });

        useEffect(() => {
            reset(initialData ?? DEFAULT_FORM_STATE);
        }, [initialData, reset]);

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

        return (
            <form onSubmit={(e) => e.preventDefault()} noValidate data-testid="feedback-review-form">
                <FeedbackReviewFormFields
                    control={control}
                    errors={errors}
                    idPrefix="feedback-review"
                    disabled={formDisabled}
                />
            </form>
        );
    },
);
