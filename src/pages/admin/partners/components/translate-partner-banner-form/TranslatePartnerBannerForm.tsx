import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { PARTNERS_TEXT, PARTNER_BANNER_VALIDATION } from '@/const/admin/partners';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';
import { PARTNER_BANNER_VALIDATION_FUNCTIONS } from '@/validation/admin/partner-schema/partner-schema';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { forwardRef, useEffect } from 'react';

export interface TranslatePartnerBannerFormValues {
    title: string;
    description: string;
}

export interface TranslatePartnerBannerFormErrorState {
    title: string | undefined;
    description: string | undefined;
    [key: string]: string | undefined;
}

export interface TranslatePartnerBannerFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface TranslatePartnerBannerFormProps {
    onSubmit: (data: TranslatePartnerBannerFormValues, status?: VisibilityStatus) => void | Promise<void>;
    initialData?: TranslatePartnerBannerFormValues | null;
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

const DEFAULT_FORM_STATE: TranslatePartnerBannerFormValues = {
    title: '',
    description: '',
};

const validateForm = (
    formState: TranslatePartnerBannerFormValues,
    _isPublishing: boolean,
): TranslatePartnerBannerFormErrorState => {
    return {
        title: PARTNER_BANNER_VALIDATION_FUNCTIONS.validateTitle(getPlainTextFromHtml(formState.title)),
        description: PARTNER_BANNER_VALIDATION_FUNCTIONS.validateDescription(formState.description),
    };
};

export const TranslatePartnerBannerForm = forwardRef<TranslatePartnerBannerFormRef, TranslatePartnerBannerFormProps>(
    ({ initialData = null, onSubmit, formDisabled, onValidationChange, onDirtyChange }, ref) => {
        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslatePartnerBannerFormValues,
            TranslatePartnerBannerFormErrorState
        >({
            defaultFormState: DEFAULT_FORM_STATE,
            initialData,
            validateForm,
            onValidationChange,
            ref,
            onSubmit: (data, _status) => onSubmit(data),
        });

        useEffect(() => {
            const isDirty = JSON.stringify(formState) !== JSON.stringify(initialData ?? DEFAULT_FORM_STATE);
            onDirtyChange?.(isDirty);
        }, [formState, initialData, onDirtyChange]);

        const handleTitleChange = (value: string) => {
            setFormState((prev) => ({ ...prev, title: value }));
        };

        const handleTitleBlur = () => {
            const error = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateTitle(getPlainTextFromHtml(formState.title));
            setErrors((prev) => ({ ...prev, title: error }));
        };

        const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({ ...prev, description: e.target.value }));
        };

        const handleDescriptionBlur = () => {
            const error = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateDescription(formState.description);
            setErrors((prev) => ({ ...prev, description: error }));
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className="translate-partner-banner-form"
                id={'translate-partner-banner-form'}
                noValidate
            >
                <RichTextInputGroup
                    label={PARTNERS_TEXT.FORM.LABEL.TITLE}
                    isRequired
                    value={formState.title}
                    error={errors.title}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    disabled={isSubmitting || formDisabled}
                    maxLength={PARTNER_BANNER_VALIDATION.title.max}
                    name={'title'}
                    id={'translate-banner-title'}
                    trimOnBlur
                />

                <InputWithCharacterLimitGroup
                    label={PARTNERS_TEXT.FORM.LABEL.DESCRIPTION}
                    isRequired
                    error={errors.description}
                    value={formState.description}
                    onChange={handleDescriptionChange}
                    onBlur={handleDescriptionBlur}
                    disabled={isSubmitting || formDisabled}
                    maxLength={PARTNER_BANNER_VALIDATION.description.max}
                    name={'description'}
                    id={'translate-banner-description'}
                />
            </form>
        );
    },
);
