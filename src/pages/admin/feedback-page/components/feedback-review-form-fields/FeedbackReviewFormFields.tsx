import { Control, Controller, FieldErrors } from 'react-hook-form';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { FEEDBACK_REVIEW_VALIDATION, FEEDBACK_TEXT } from '@/const/admin/feedback';
import { FeedbackReviewFormValues } from '@/validation/admin/feedback-review-schema/feedback-review-schema';
import {
    getNormalizedInputText,
    getNormalizedInputTextWhileTyping,
} from '@/utils/functions/formatters/text-formatters';

export interface FeedbackReviewFormFieldsProps {
    control: Control<FeedbackReviewFormValues>;
    errors: FieldErrors<FeedbackReviewFormValues>;
    idPrefix: string;
}

export const FeedbackReviewFormFields = ({ control, errors, idPrefix }: FeedbackReviewFormFieldsProps) => (
    <>
        <Controller
            name="authorName"
            control={control}
            render={({ field }) => (
                <InputWithCharacterLimitGroup
                    name={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(getNormalizedInputTextWhileTyping(e.target.value))}
                    onBlur={() => {
                        if (field.value) {
                            field.onChange(getNormalizedInputText(field.value));
                        }
                        field.onBlur();
                    }}
                    label={FEEDBACK_TEXT.ADD_REVIEW_MODAL.LABEL.AUTHOR_NAME}
                    id={`${idPrefix}-author-name`}
                    maxLength={FEEDBACK_REVIEW_VALIDATION.authorName.max}
                    error={errors.authorName?.message}
                    isRequired
                    showCounterBelow
                />
            )}
        />

        <Controller
            name="text"
            control={control}
            render={({ field }) => (
                <TextAreaWithCharacterLimitGroup
                    name={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(getNormalizedInputTextWhileTyping(e.target.value))}
                    onBlur={() => {
                        if (field.value) {
                            field.onChange(getNormalizedInputText(field.value));
                        }
                        field.onBlur();
                    }}
                    label={FEEDBACK_TEXT.ADD_REVIEW_MODAL.LABEL.TEXT}
                    id={`${idPrefix}-text`}
                    maxLength={FEEDBACK_REVIEW_VALIDATION.text.max}
                    error={errors.text?.message}
                    isRequired
                    rows={4}
                />
            )}
        />
    </>
);
