import { forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { VisibilityStatus } from '@/types/admin/common';
import { GenericFormRef } from '@/hooks/admin/use-generic-modal/useGenericModal';
import { useFeedbackForm } from '@/hooks/admin/use-feedback-form/useFeedbackForm';
import {
    FeedbackReviewFormValues,
    FeedbackReviewValidationSchema,
} from '@/validation/admin/feedback-review-schema/feedback-review-schema';
import { FeedbackReviewFormFields } from '../feedback-review-form-fields/FeedbackReviewFormFields';

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

export const FeedbackReviewForm = forwardRef<GenericFormRef, FeedbackReviewFormProps>(
    ({ initialData, formDisabled, onSubmit, onValidationChange }, ref) => {
        const form = useForm<FeedbackReviewFormValues>({
            resolver: yupResolver(FeedbackReviewValidationSchema as Yup.ObjectSchema<FeedbackReviewFormValues>),
            defaultValues: initialData ?? DEFAULT_FORM_STATE,
            mode: 'onTouched',
        });

        useFeedbackForm({ form, ref, initialData, defaultValues: DEFAULT_FORM_STATE, onSubmit, onValidationChange });

        return (
            <form onSubmit={(e) => e.preventDefault()} noValidate data-testid="feedback-review-form">
                <FeedbackReviewFormFields
                    control={form.control}
                    errors={form.formState.errors}
                    idPrefix="feedback-review"
                    disabled={formDisabled}
                />
            </form>
        );
    },
);
