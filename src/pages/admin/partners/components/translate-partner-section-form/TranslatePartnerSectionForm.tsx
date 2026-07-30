import { forwardRef, useEffect } from 'react';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PARTNERS_TEXT, PARTNER_SECTION_VALIDATION, PARTNER_VALIDATION } from '@/const/admin/partners';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';
import { Partner } from '@/types/admin/partners';
import {
    PARTNER_SECTION_VALIDATION_FUNCTIONS,
    PARTNER_VALIDATION_FUNCTIONS,
} from '@/validation/admin/partner-schema/partner-schema';
import { TranslatePartnerSectionFormValues } from '@/hooks/admin/use-translate-partner-section/useTranslatePartnerSection';
import styles from './TranslatePartnerSectionForm.module.scss';

export interface TranslatePartnerSectionFormErrorState {
    title: string | undefined;
    description: string | undefined;
    partners: Array<{ description?: string }> | undefined;
    [key: string]: string | undefined | Array<{ description?: string }>;
}

export interface TranslatePartnerSectionFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface TranslatePartnerSectionFormProps {
    onSubmit: (data: TranslatePartnerSectionFormValues, status?: VisibilityStatus) => void | Promise<void>;
    partners: Partner[];
    initialData: TranslatePartnerSectionFormValues;
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

const validateForm = (
    formState: TranslatePartnerSectionFormValues,
    _isPublishing: boolean,
): TranslatePartnerSectionFormErrorState => {
    const partnerErrors = formState.partners.map((partner) => ({
        description: PARTNER_VALIDATION_FUNCTIONS.validateDescription(partner.description),
    }));
    const hasPartnerErrors = partnerErrors.some((partnerError) => partnerError.description !== undefined);

    return {
        title: PARTNER_SECTION_VALIDATION_FUNCTIONS.validateTitle(formState.title),
        description: PARTNER_SECTION_VALIDATION_FUNCTIONS.validateDescription(formState.description),
        partners: hasPartnerErrors ? partnerErrors : undefined,
    };
};

export const TranslatePartnerSectionForm = forwardRef<TranslatePartnerSectionFormRef, TranslatePartnerSectionFormProps>(
    ({ initialData, onSubmit, partners, formDisabled, onValidationChange, onDirtyChange }, ref) => {
        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslatePartnerSectionFormValues,
            TranslatePartnerSectionFormErrorState
        >({
            defaultFormState: initialData,
            initialData,
            validateForm,
            onValidationChange,
            ref,
            onSubmit: (data, _status) => onSubmit(data),
        });

        useEffect(() => {
            const isDirty = JSON.stringify(formState) !== JSON.stringify(initialData);
            onDirtyChange?.(isDirty);
        }, [formState, initialData, onDirtyChange]);

        const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, title: value }));
            setErrors((prev) => ({ ...prev, title: PARTNER_SECTION_VALIDATION_FUNCTIONS.validateTitle(value) }));
        };

        const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, description: value }));
            setErrors((prev) => ({
                ...prev,
                description: PARTNER_SECTION_VALIDATION_FUNCTIONS.validateDescription(value),
            }));
        };

        const handlePartnerDescriptionChange = (index: number, value: string) => {
            setFormState((prev) => ({
                ...prev,
                partners: prev.partners.map((partner, i) =>
                    i === index ? { ...partner, description: value } : partner,
                ),
            }));
            setErrors((prev) => {
                const partnerErrors = prev.partners?.length ? [...prev.partners] : formState.partners.map(() => ({}));
                partnerErrors[index] = { description: PARTNER_VALIDATION_FUNCTIONS.validateDescription(value) };
                return { ...prev, partners: partnerErrors };
            });
        };

        const disabled = isSubmitting || formDisabled;
        const partnerErrors = errors.partners ?? [];

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className="translate-partner-section-form"
                id={'translate-partner-section-form'}
                noValidate
            >
                <TextAreaWithCharacterLimitGroup
                    label={PARTNERS_TEXT.FORM.LABEL.TITLE}
                    value={formState.title}
                    error={errors.title}
                    onChange={handleTitleChange}
                    isRequired
                    disabled={disabled}
                    maxLength={PARTNER_SECTION_VALIDATION.title.max}
                    name={'title'}
                    id={'translate-section-title'}
                    rows={3}
                />

                <TextAreaWithCharacterLimitGroup
                    label={PARTNERS_TEXT.FORM.LABEL.DESCRIPTION}
                    value={formState.description}
                    error={errors.description}
                    onChange={handleDescriptionChange}
                    isRequired
                    disabled={disabled}
                    maxLength={PARTNER_SECTION_VALIDATION.description.max}
                    name={'description'}
                    id={'translate-section-description'}
                    rows={3}
                />

                <div className={styles['partners-grid']}>
                    {formState.partners.map((partnerValue, index) => {
                        const partner = partners[index];
                        const partnerError = partnerErrors[index]?.description;

                        return (
                            <div key={partnerValue.partnerId} className={styles['partner-row']}>
                                <ImageInput
                                    value={partner?.image ?? null}
                                    onChange={() => undefined}
                                    setError={() => undefined}
                                    disabled
                                    id={`translate-partner-image-${partnerValue.partnerId}`}
                                    name={`translate-partner-image-${partnerValue.partnerId}`}
                                    cropWidth={PARTNER_VALIDATION.image.width}
                                    cropHeight={PARTNER_VALIDATION.image.height}
                                    style={{ width: '13rem', height: '13rem' }}
                                />

                                <TextAreaWithCharacterLimitGroup
                                    label={PARTNERS_TEXT.PARTNER.DESCRIPTION_LABEL}
                                    value={partnerValue.description}
                                    error={partnerError}
                                    onChange={(e) => handlePartnerDescriptionChange(index, e.target.value)}
                                    isRequired
                                    disabled={disabled}
                                    maxLength={PARTNER_VALIDATION.description.max}
                                    name={`translate-partner-description-${partnerValue.partnerId}`}
                                    id={`translate-partner-description-${partnerValue.partnerId}`}
                                    rows={3}
                                />
                            </div>
                        );
                    })}
                </div>
            </form>
        );
    },
);
