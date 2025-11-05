import React, { useCallback, memo } from 'react';
import {
    PARTNER_SECTION_VALIDATION_FUNCTIONS,
    PARTNER_VALIDATION_FUNCTIONS,
} from '../../../../../validation/admin/partner-schema/partner-schema';
import { PARTNER_SECTION_VALIDATION, PARTNERS_TEXT } from '../../../../../const/admin/partners';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { TextAreaWithCharacterLimitGroup } from '../../../../../components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PartnerForm, PartnerFormErrors, PartnerFormValues } from '../partner-form/PartnerForm';
import { InlineLoader } from '../../../../../components/common/inline-loader/InlineLoader';
import { Button } from '../../../../../components/admin/button/Button';
import './PartnerSectionForm.scss';

export interface PartnerSectionFormValues {
    localId: string;
    sectionId: number | null;
    title: string;
    description: string;
    partners: PartnerFormValues[];
    deletedPartnerIds?: number[];
}

export interface PartnerSectionErrors {
    title?: string;
    description?: string;
    partners: PartnerFormErrors[];
}

export interface PartnerSectionProps {
    value: PartnerSectionFormValues;
    errors: PartnerSectionErrors;
    disabled: boolean;
    onChange: (value: PartnerSectionFormValues, errors: PartnerSectionErrors) => void;
    onDelete: (localId: string) => void;
    onPublish: (localId: string) => void;
}

const PartnerSectionComponent = ({
    value,
    onChange,
    onDelete,
    onPublish,
    disabled = false,
    errors,
}: PartnerSectionProps) => {
    const handleTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newTitle = e.target.value;
            console.log(`Partner Section: ${value.localId} Title: ${newTitle}`);
            const error = PARTNER_SECTION_VALIDATION_FUNCTIONS.validateTitle(newTitle);

            onChange({ ...value, title: newTitle }, { ...errors, title: error });
        },
        [value, errors, onChange],
    );

    const handleDescriptionChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newDescription = e.target.value;
            console.log(`Partner Section: ${value.localId} Description: ${newDescription}`);
            const error = PARTNER_SECTION_VALIDATION_FUNCTIONS.validateDescription(newDescription);

            onChange({ ...value, description: newDescription }, { ...errors, description: error });
        },
        [value, errors, onChange],
    );

    const handleAddPartner = useCallback(() => {
        const newPartner: PartnerFormValues = {
            localId: crypto.randomUUID(),
            partnerId: null,
            description: '',
            image: null,
            imageId: null,
        };

        const newPartners = [...value.partners, newPartner];
        const newPartnerErrors = [...errors.partners, {}];

        onChange({ ...value, partners: newPartners }, { ...errors, partners: newPartnerErrors });
    }, [value, errors, onChange]);

    const handlePartnerChange = useCallback(
        (partnerValues: PartnerFormValues, partnerErrors: PartnerFormErrors) => {
            const partnerLocalId = partnerValues.localId;
            const index = value.partners.findIndex((p) => p.localId === partnerLocalId);
            if (index === -1) return;

            const newPartners = [...value.partners];
            newPartners[index] = partnerValues;

            const newPartnerErrors = [...errors.partners];
            newPartnerErrors[index] = partnerErrors;

            onChange({ ...value, partners: newPartners }, { ...errors, partners: newPartnerErrors });
        },
        [value, errors, onChange],
    );

    const handlePartnerDelete = useCallback(
        (localId: string) => {
            const indexToDelete = value.partners.findIndex((p) => p.localId === localId);
            if (indexToDelete === -1) return;

            const partnerToDelete = value.partners[indexToDelete];
            const updatedDeletedIds = [...(value.deletedPartnerIds || [])];

            if (partnerToDelete.partnerId) {
                updatedDeletedIds.push(partnerToDelete.partnerId);
            }

            const newPartners = value.partners.filter((p) => p.localId !== localId);
            const newPartnerErrors = errors.partners.filter((_, i) => i !== indexToDelete);

            onChange(
                { ...value, partners: newPartners, deletedPartnerIds: updatedDeletedIds },
                { ...errors, partners: newPartnerErrors },
            );
        },
        [value, errors, onChange],
    );

    const handleDelete = useCallback(() => {
        onDelete(value.localId);
    }, [onDelete, value.localId]);

    const handlePublish = useCallback(() => {
        onPublish(value.localId);
    }, [onPublish, value.localId]);

    const isFormValid = (): boolean => {
        if (PARTNER_SECTION_VALIDATION_FUNCTIONS.validateTitle(value.title)) {
            return false;
        }
        if (PARTNER_SECTION_VALIDATION_FUNCTIONS.validateDescription(value.description)) {
            return false;
        }

        const hasPartnerErrors = value.partners.some((partner) => {
            const descError = PARTNER_VALIDATION_FUNCTIONS.validateDescription(partner.description);
            const imgError = PARTNER_VALIDATION_FUNCTIONS.validateImage(partner.image);
            return !!descError || !!imgError;
        });

        return !hasPartnerErrors;
    };

    return (
        <div className="partner-section-form">
            <div className="partner-section-form__inputs">
                <TextAreaWithCharacterLimitGroup
                    label={PARTNERS_TEXT.FORM.LABEL.TITLE}
                    value={value.title}
                    error={errors.title}
                    onChange={handleTitleChange}
                    name={`partner-section-title-${value.localId}`}
                    id={`partner-section-title-${value.localId}`}
                    isRequired={true}
                    disabled={disabled}
                    placeholder={PARTNERS_TEXT.SECTION.TITLE_PLACEHOLDER}
                    maxLength={PARTNER_SECTION_VALIDATION.title.max}
                    rows={3}
                />

                <TextAreaWithCharacterLimitGroup
                    label={PARTNERS_TEXT.FORM.LABEL.DESCRIPTION}
                    value={value.description}
                    error={errors.description}
                    onChange={handleDescriptionChange}
                    name={`partner-section-description-${value.localId}`}
                    id={`partner-section-description-${value.localId}`}
                    isRequired={true}
                    disabled={disabled}
                    placeholder={PARTNERS_TEXT.SECTION.DESCRIPTION_PLACEHOLDER}
                    maxLength={PARTNER_SECTION_VALIDATION.description.max}
                    rows={3}
                />
            </div>

            <div className="partner-section-form__partners-grid">
                {value.partners.map((partner: PartnerFormValues, index: number) => (
                    <PartnerForm
                        key={partner.localId}
                        values={partner}
                        errors={errors.partners[index] || {}}
                        disabled={disabled}
                        onValuesChange={handlePartnerChange}
                        onDelete={handlePartnerDelete}
                    />
                ))}
                <div className="partner-section-form__add-card">
                    <button
                        type="button"
                        onClick={handleAddPartner}
                        disabled={disabled || value.partners.length >= PARTNER_SECTION_VALIDATION.partners.max}
                    >
                        <span>{PARTNERS_TEXT.BUTTON.ADD_PARTNER}</span>
                    </button>
                </div>
            </div>

            {disabled && (
                <div className="partner-section-form__loader">
                    <InlineLoader size={2} />
                </div>
            )}

            <div className="partner-section-form__actions">
                <Button buttonStyle="secondary" onClick={handleDelete} disabled={disabled}>
                    {PARTNERS_TEXT.SECTION.DELETE_SECTION}
                </Button>
                <Button buttonStyle="primary" onClick={handlePublish} disabled={disabled || !isFormValid()}>
                    {COMMON_TEXT_ADMIN.BUTTON.PUBLISH}
                </Button>
            </div>
        </div>
    );
};

export const PartnerSectionForm = memo(PartnerSectionComponent);
