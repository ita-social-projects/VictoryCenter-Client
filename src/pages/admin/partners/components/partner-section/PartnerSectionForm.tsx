import React, { useCallback, memo } from 'react';
import {
    PARTNER_SECTION_VALIDATION_FUNCTIONS,
    PARTNER_VALIDATION_FUNCTIONS,
} from '@/validation/admin/partner-schema/partner-schema';
import { PARTNER_SECTION_VALIDATION, PARTNERS_TEXT } from '@/const/admin/partners';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PartnerForm, PartnerFormErrors, PartnerFormValues } from '../partner-form/PartnerForm';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { Button } from '@/components/admin/button/Button';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { LocalizationStatuses } from '@/components/admin/localization-statuses/LocalizationStatuses';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { EntityLocalization, LocalizationLanguage } from '@/types/common/language';
import { PartnerSectionLocalizationDto } from '@/types/admin/partners';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import styles from './PartnerSectionForm.module.scss';
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
    onPublish: (localId: string, sectionData: PartnerSectionFormValues) => void;
    onTranslate: (sectionId: number) => void;
    isDirty: boolean;
    localizations: EntityLocalization[];
    translationLanguages: LocalizationLanguage[];
    language: LocalizationLanguage;
    translatedContent: PartnerSectionLocalizationDto | null;
    disableStructuralActions?: boolean;
}

const PartnerSectionComponent = ({
    value,
    onChange,
    onDelete,
    onPublish,
    onTranslate,
    disabled = false,
    errors,
    isDirty,
    localizations,
    translationLanguages,
    language,
    translatedContent,
    disableStructuralActions = false,
}: PartnerSectionProps) => {
    const isBaseLanguage = language.code === DEFAULT_LOCALE;
    const displayedTitle = isBaseLanguage ? value.title : (translatedContent?.title ?? '');
    const displayedDescription = isBaseLanguage ? value.description : (translatedContent?.description ?? '');

    const handleTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (!isBaseLanguage) return;
            const newTitle = e.target.value;
            const error = PARTNER_SECTION_VALIDATION_FUNCTIONS.validateTitle(newTitle);

            onChange({ ...value, title: newTitle }, { ...errors, title: error });
        },
        [value, errors, onChange, isBaseLanguage],
    );

    const handleDescriptionChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (!isBaseLanguage) return;
            const newDescription = e.target.value;
            const error = PARTNER_SECTION_VALIDATION_FUNCTIONS.validateDescription(newDescription);

            onChange({ ...value, description: newDescription }, { ...errors, description: error });
        },
        [value, errors, onChange, isBaseLanguage],
    );

    const handleAddPartner = useCallback(() => {
        if (disableStructuralActions) return;

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
    }, [value, errors, onChange, disableStructuralActions]);

    const handlePartnerChange = useCallback(
        (partnerValues: PartnerFormValues, partnerErrors: PartnerFormErrors) => {
            const partnerLocalId = partnerValues.localId;
            const index = value.partners.findIndex((p) => p.localId === partnerLocalId);
            if (index === -1) return;

            const newPartners = [...value.partners];
            newPartners[index] = partnerValues;

            const newPartnerErrors = [...errors.partners];
            while (newPartnerErrors.length < newPartners.length) {
                newPartnerErrors.push({});
            }
            newPartnerErrors[index] = partnerErrors;

            onChange({ ...value, partners: newPartners }, { ...errors, partners: newPartnerErrors });
        },
        [value, errors, onChange],
    );

    const handlePartnerDelete = useCallback(
        (localId: string) => {
            if (disableStructuralActions) return;

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
        [value, errors, onChange, disableStructuralActions],
    );

    const handleDelete = useCallback(() => {
        if (disableStructuralActions) return;
        onDelete(value.localId);
    }, [onDelete, value.localId, disableStructuralActions]);

    const handlePublish = useCallback(() => {
        onPublish(value.localId, value);
    }, [onPublish, value]);

    const handleTranslate = useCallback(() => {
        if (value.sectionId === null) return;
        onTranslate(value.sectionId);
    }, [onTranslate, value.sectionId]);

    const isFormValid = (): boolean => {
        if (PARTNER_SECTION_VALIDATION_FUNCTIONS.validateTitle(value.title)) {
            return false;
        }
        if (PARTNER_SECTION_VALIDATION_FUNCTIONS.validateDescription(value.description)) {
            return false;
        }

        if (value.partners.length === 0) {
            return false;
        }

        const hasPartnerErrors = value.partners.some((partner) => {
            const descError = PARTNER_VALIDATION_FUNCTIONS.validateDescription(partner.description);
            const hasImage = !!partner.image;
            return !!descError || !hasImage;
        });

        return !hasPartnerErrors;
    };

    return (
        <div className={styles.root}>
            <div className={styles['status-bar']}>
                <LocalizationStatuses languages={translationLanguages} localizedEntity={{ localizations }} />
                <IconButton
                    aria-label={COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION}
                    type="button"
                    onClick={handleTranslate}
                    DefaultIcon={ACTION_ICONS.translate.default}
                    disabled={disabled || isDirty || value.sectionId === null}
                />
            </div>

            <div className={styles.inputs}>
                <div className={styles['title-group']}>
                    <TextAreaWithCharacterLimitGroup
                        label={PARTNERS_TEXT.FORM.LABEL.TITLE}
                        value={displayedTitle}
                        error={errors.title}
                        onChange={handleTitleChange}
                        name={`partner-section-title-${value.localId}`}
                        id={`partner-section-title-${value.localId}`}
                        isRequired={true}
                        disabled={disabled || !isBaseLanguage}
                        placeholder={PARTNERS_TEXT.SECTION.TITLE_PLACEHOLDER}
                        maxLength={PARTNER_SECTION_VALIDATION.title.max}
                        rows={3}
                    />
                </div>
                <div className={styles['description-group']}>
                    <TextAreaWithCharacterLimitGroup
                        label={PARTNERS_TEXT.FORM.LABEL.DESCRIPTION}
                        value={displayedDescription}
                        error={errors.description}
                        onChange={handleDescriptionChange}
                        name={`partner-section-description-${value.localId}`}
                        id={`partner-section-description-${value.localId}`}
                        isRequired={true}
                        disabled={disabled || !isBaseLanguage}
                        placeholder={PARTNERS_TEXT.SECTION.DESCRIPTION_PLACEHOLDER}
                        maxLength={PARTNER_SECTION_VALIDATION.description.max}
                        rows={3}
                    />
                </div>
            </div>

            <div className={styles['partners-grid']}>
                {value.partners.map((partner: PartnerFormValues, index: number) => (
                    <PartnerForm
                        key={partner.localId}
                        values={partner}
                        errors={errors.partners[index] || {}}
                        disabled={disabled}
                        onValuesChange={handlePartnerChange}
                        onDelete={handlePartnerDelete}
                        language={language}
                        translatedDescription={
                            translatedContent?.partners.find((p) => p.partnerId === partner.partnerId)?.description
                        }
                        disableStructuralActions={disableStructuralActions}
                    />
                ))}
                <div className={styles['add-card']}>
                    <button
                        type="button"
                        onClick={handleAddPartner}
                        disabled={
                            disabled ||
                            disableStructuralActions ||
                            value.partners.length >= PARTNER_SECTION_VALIDATION.partners.max
                        }
                    >
                        <span>{PARTNERS_TEXT.BUTTON.ADD_PARTNER}</span>
                    </button>
                </div>
            </div>

            {disabled && (
                <div className={styles['loader']}>
                    <InlineLoader size={2} />
                </div>
            )}

            <div className={styles['actions']}>
                <Button buttonStyle="secondary" onClick={handleDelete} disabled={disabled || disableStructuralActions}>
                    {PARTNERS_TEXT.SECTION.DELETE_SECTION}
                </Button>
                {isBaseLanguage && (
                    <Button
                        buttonStyle="primary"
                        onClick={handlePublish}
                        disabled={disabled || !isDirty || !isFormValid()}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                    </Button>
                )}
            </div>
        </div>
    );
};

export const PartnerSectionForm = memo(PartnerSectionComponent);
