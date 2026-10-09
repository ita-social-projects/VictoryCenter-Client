import { forwardRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { InputLabel } from '@/components/admin/input-label/InputLabel';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { FEEDBACK_HISTORY_VALIDATION, FEEDBACK_TEXT } from '@/const/admin/feedback';
import { IMAGE_VALIDATION } from '@/const/admin/image';
import { VisibilityStatus } from '@/types/admin/common';
import { useFeedbackForm } from '@/hooks/admin/use-feedback-form/useFeedbackForm';
import { GenericFormRef } from '@/hooks/admin/use-generic-modal/useGenericModal';
import { getNormalizedInputTextWhileTyping } from '@/utils/functions/formatters/text-formatters';
import {
    FeedbackHistoryFormValues,
    FeedbackHistoryValidationSchema,
} from '@/validation/admin/feedback-history-schema/feedback-history-schema';
import styles from './FeedbackHistoryForm.module.scss';

export interface FeedbackHistoryFormProps {
    initialData: FeedbackHistoryFormValues | null;
    formDisabled?: boolean;
    onSubmit: (data: FeedbackHistoryFormValues, status: VisibilityStatus) => void;
    onValidationChange?: (isValid: boolean) => void;
}

const DEFAULT_FORM_STATE: FeedbackHistoryFormValues = {
    title: '',
    story: '',
    image: null,
};

const mapImageInputError = (error: string | null): string | undefined => {
    if (!error || error === IMAGE_VALIDATION.ImageDimensionsTooLargeError) {
        return undefined;
    }
    return error;
};

export const FeedbackHistoryForm = forwardRef<GenericFormRef, FeedbackHistoryFormProps>(
    ({ initialData, formDisabled, onSubmit, onValidationChange }, ref) => {
        const form = useForm<FeedbackHistoryFormValues>({
            resolver: yupResolver(FeedbackHistoryValidationSchema),
            defaultValues: initialData ?? DEFAULT_FORM_STATE,
            mode: 'onChange',
        });
        const {
            control,
            setError,
            clearErrors,
            formState: { errors },
        } = form;

        useFeedbackForm({ form, ref, initialData, defaultValues: DEFAULT_FORM_STATE, onSubmit, onValidationChange });

        return (
            <form onSubmit={(e) => e.preventDefault()} className={styles['feedback-history-form']} noValidate>
                <div className={styles['form-group']}>
                    <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                            <InputWithCharacterLimitGroup
                                id="history-title"
                                name={field.name}
                                label={FEEDBACK_TEXT.ADD_HISTORY_MODAL.LABEL.TITLE}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                maxLength={FEEDBACK_HISTORY_VALIDATION.title.max}
                                isRequired
                                showCounterBelow
                                maxLimitWarning={FEEDBACK_HISTORY_VALIDATION.title.getMaxError()}
                                error={errors.title?.message}
                                disabled={formDisabled}
                                normalizeValue={getNormalizedInputTextWhileTyping}
                            />
                        )}
                    />
                </div>

                <div className={styles['form-group']}>
                    <Controller
                        name="story"
                        control={control}
                        render={({ field }) => (
                            <TextAreaWithCharacterLimitGroup
                                id="history-story"
                                name={field.name}
                                label={FEEDBACK_TEXT.ADD_HISTORY_MODAL.LABEL.STORY}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                maxLength={FEEDBACK_HISTORY_VALIDATION.story.max}
                                isRequired
                                maxLimitWarning={FEEDBACK_HISTORY_VALIDATION.story.getMaxError()}
                                rows={5}
                                error={errors.story?.message}
                                disabled={formDisabled}
                                normalizeValue={getNormalizedInputTextWhileTyping}
                            />
                        )}
                    />
                </div>

                <div className={styles['form-group']}>
                    <InputLabel htmlFor="history-image" text={FEEDBACK_TEXT.ADD_HISTORY_MODAL.LABEL.PHOTO} isRequired />
                    <Controller
                        name="image"
                        control={control}
                        render={({ field }) => (
                            <ImageInput
                                id="history-image"
                                name={field.name}
                                value={field.value}
                                onChange={(img) => {
                                    field.onChange(img);
                                    clearErrors('image');
                                }}
                                setError={(err) => {
                                    const mapped = mapImageInputError(err);
                                    if (mapped) {
                                        setError('image', { type: 'manual', message: mapped });
                                    } else {
                                        clearErrors('image');
                                    }
                                }}
                                label={FEEDBACK_TEXT.ADD_HISTORY_MODAL.PLACEHOLDER.PHOTO_LABEL}
                                subText={FEEDBACK_TEXT.ADD_HISTORY_MODAL.PLACEHOLDER.PHOTO_SUBTEXT}
                                cropWidth={FEEDBACK_HISTORY_VALIDATION.image.cropWidth}
                                cropHeight={FEEDBACK_HISTORY_VALIDATION.image.cropHeight}
                                minWidth={FEEDBACK_HISTORY_VALIDATION.image.minWidth}
                                minHeight={FEEDBACK_HISTORY_VALIDATION.image.minHeight}
                                enableCrop
                                disabled={formDisabled}
                            />
                        )}
                    />
                    {errors.image?.message && <span className={styles.error}>{errors.image.message}</span>}
                </div>
            </form>
        );
    },
);
