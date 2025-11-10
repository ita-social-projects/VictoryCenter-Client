import React, { memo, useCallback } from 'react';
import { Image, ImageValues } from '../../../../../types/common/image';
import { PhotoInputGroup } from '../../../../../components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { TextAreaWithCharacterLimitGroup } from '../../../../../components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PARTNER_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/partner-schema/partner-schema';
import { PARTNER_VALIDATION, PARTNERS_TEXT } from '../../../../../const/admin/partners';
import './PartnerForm.scss';

export interface PartnerFormValues {
    localId: string;
    partnerId: number | null;
    description: string;
    image: ImageValues | Image | null;
    imageId: number | null;
}

export interface PartnerFormErrors {
    description?: string;
    image?: string;
}

export interface PartnerFormProps {
    values: PartnerFormValues;
    errors: PartnerFormErrors;
    disabled: boolean;
    onValuesChange: (values: PartnerFormValues, errors: PartnerFormErrors) => void;
    onDelete: (localId: string) => void;
}

const PartnerFormComponent = ({ values, errors, disabled, onValuesChange, onDelete }: PartnerFormProps) => {
    const handleDescriptionChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            const error = PARTNER_VALIDATION_FUNCTIONS.validateDescription(value);
            onValuesChange({ ...values, description: value }, { ...errors, description: error });
        },
        [onValuesChange, values, errors],
    );

    const handleImageChange = useCallback(
        (value: ImageValues | null) => {
            const error = PARTNER_VALIDATION_FUNCTIONS.validateImage(value);
            onValuesChange({ ...values, image: value }, { ...errors, image: error });
        },
        [onValuesChange, values, errors],
    );

    const setErrorhandler = useCallback((error: string | null) => {}, []);

    const handleDelete = useCallback(() => {
        onDelete(values.localId);
    }, [onDelete, values.localId]);

    const cardHtmlId = values.localId;

    return (
        <div className="partner-form" data-testid={`partner-form-${cardHtmlId}`}>
            <div className="partner-form__header">
                <button type="button" className="partner-form__delete-button" onClick={handleDelete} />
            </div>
            <div className="partner-form__content">
                <div className="partner-form__image">
                    <PhotoInputGroup
                        className="partner-form__image-input"
                        label={''}
                        value={values.image}
                        error={errors.image}
                        id={`partner-form-image-${cardHtmlId}`}
                        name={`partner-form-image-${cardHtmlId}`}
                        onChange={handleImageChange}
                        setError={setErrorhandler}
                        isRequired={true}
                        disabled={disabled}
                        subText={PARTNERS_TEXT.FORM.IMAGE.SIZE_DESCRIPTION}
                    />
                </div>

                <div className="partner-form__description">
                    <TextAreaWithCharacterLimitGroup
                        label={PARTNERS_TEXT.PARTNER.DESCRIPTION_LABEL}
                        placeholder={PARTNERS_TEXT.PARTNER.DESCRIPTION_PLACEHOLDER}
                        value={values.description}
                        error={errors.description}
                        onChange={handleDescriptionChange}
                        name={`partner-form-description-${cardHtmlId}`}
                        id={`partner-form-description-${cardHtmlId}`}
                        maxLength={PARTNER_VALIDATION.description.max}
                        isRequired={true}
                        disabled={disabled}
                        rows={3}
                    />
                </div>
            </div>
        </div>
    );
};

export const PartnerForm = memo(PartnerFormComponent);
