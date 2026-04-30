import React, { useState, useEffect, useCallback } from 'react';
import { PDF_FILES_SECTION_TEXT, PDF_FILES_SECTION_VALIDATION } from '@/const/admin/reports';
import {
    PDF_SECTION_FIELD_VALIDATORS,
    PdfSectionFormData,
} from '@/validation/admin/reports-schema/pdf-section-schema/pdf-section-schema';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { ToastType } from '@/types/admin/toast';
import { PdfSectionApi } from '@/services/api/admin/reports/pdf-section/pdf-section-api';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import styles from './PdfSectionContentBlock.module.scss';
import './PdfSectionContentBlock.scss';
import cn from 'classnames';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { LocalizationLanguage } from '@/types/common/language';
import { PdfSectionLocalizationDto } from '@/types/admin/pdf-section';
import { LocalizationStatuses } from '@/components/admin/localization-statuses/LocalizationStatuses';

interface PdfSectionContent {
    title: string;
    description: string;
    localizations: PdfSectionLocalizationDto[];
}

interface PdfSectionContentBlockProps {
    content: PdfSectionContent;
    onSave?: () => Promise<void>;
    translationLanguages: LocalizationLanguage[];
}

type ConfirmationModalType = 'publish' | 'cancel' | null;

export const PdfSectionContentBlock: React.FC<PdfSectionContentBlockProps> = ({
    content,
    onSave,
    translationLanguages,
}) => {
    const client = useAdminClient();
    const [isEditMode, setIsEditMode] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationModalType, setConfirmationModalType] = useState<ConfirmationModalType>(null);
    const [formData, setFormData] = useState<PdfSectionFormData>({
        title: content.title,
        description: content.description,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof PdfSectionFormData, string>>>({});
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        setFormData({ title: content.title, description: content.description });
        setErrors({});
    }, [content]);

    const handleEditClick = useCallback(() => setIsEditMode(true), []);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, title: e.target.value }));
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, description: e.target.value }));
    };

    const handleTitleBlur = useCallback(() => {
        const error = PDF_SECTION_FIELD_VALIDATORS.validateTitle(formData.title);
        setErrors((prev) => ({ ...prev, title: error }));
    }, [formData.title]);

    const handleDescriptionBlur = useCallback(() => {
        const error = PDF_SECTION_FIELD_VALIDATORS.validateDescription(formData.description);
        setErrors((prev) => ({ ...prev, description: error }));
    }, [formData.description]);

    const hasErrors = Object.values(errors).some(Boolean);

    const hasChanges =
        getNormalizedInputText(formData.title) !== getNormalizedInputText(content.title) ||
        getNormalizedInputText(formData.description) !== getNormalizedInputText(content.description);

    const handleCancelClick = useCallback(() => {
        if (hasChanges) {
            setConfirmationModalType('cancel');
            setIsConfirmationModalOpen(true);
        } else {
            setFormData({ title: content.title, description: content.description });
            setErrors({});
            setIsEditMode(false);
        }
    }, [content, hasChanges]);

    const handleCancelConfirmed = useCallback(() => {
        setIsConfirmationModalOpen(false);
        setConfirmationModalType(null);
        setFormData({ title: content.title, description: content.description });
        setErrors({});
        setIsEditMode(false);
    }, [content]);

    const handleSaveConfirmed = useCallback(async () => {
        setIsSaving(true);
        try {
            const normalizedData = {
                title: getNormalizedInputText(formData.title),
                description: getNormalizedInputText(formData.description),
            };

            await PdfSectionApi.updatePdfSection(client, normalizedData);

            if (onSave) {
                await onSave();
            }

            setIsEditMode(false);
            addToast(COMMON_TEXT_ADMIN.MESSAGE.UPDATES_SUCCESSFULLY_PUBLISHED, ToastType.Success);
        } catch {
            addToast(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_PUBLISH_CHANGES, ToastType.Error);
        } finally {
            setIsSaving(false);
        }
    }, [formData.title, formData.description, client, onSave, addToast]);

    const handleConfirmPublish = useCallback(() => {
        setIsConfirmationModalOpen(false);
        setConfirmationModalType(null);
        handleSaveConfirmed();
    }, [handleSaveConfirmed]);

    const handleSave = async () => {
        const titleError = PDF_SECTION_FIELD_VALIDATORS.validateTitle(formData.title);
        const descriptionError = PDF_SECTION_FIELD_VALIDATORS.validateDescription(formData.description);
        const newErrors = { title: titleError, description: descriptionError };
        setErrors(newErrors);

        if (titleError || descriptionError) {
            return;
        }

        setConfirmationModalType('publish');
        setIsConfirmationModalOpen(true);
    };

    const isSaveDisabled = hasErrors || !hasChanges || isSaving;

    const renderContent = () => {
        if (isEditMode) {
            return (
                <div className={cn(styles.root, styles['edit-root'])}>
                    <form className={styles['edit-form']}>
                        <InputWithCharacterLimitGroup
                            id="pdf-section-title"
                            name="title"
                            className="pdf-section-input"
                            label={PDF_FILES_SECTION_TEXT.TITLE}
                            value={formData.title}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            maxLength={PDF_FILES_SECTION_VALIDATION.title.max}
                            placeholder="Введіть заголовок"
                            error={errors.title}
                            isRequired
                            disabled={isSaving}
                        />
                        <TextAreaWithCharacterLimitGroup
                            id="pdf-section-description"
                            name="description"
                            className="pdf-section-textarea"
                            label={PDF_FILES_SECTION_TEXT.DESCRIPTION}
                            value={formData.description}
                            onChange={handleDescriptionChange}
                            onBlur={handleDescriptionBlur}
                            maxLength={PDF_FILES_SECTION_VALIDATION.description.max}
                            placeholder="Введіть опис"
                            error={errors.description}
                            isRequired
                            rows={2}
                            disabled={isSaving}
                        />
                        <div className={styles['edit-actions']}>
                            <Button
                                buttonStyle="secondary"
                                type="button"
                                className={cn(styles.button, styles['cancel-button'])}
                                onClick={handleCancelClick}
                                disabled={isSaving}
                            >
                                {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                            </Button>
                            <Button
                                buttonStyle="primary"
                                type="button"
                                className={cn(styles.button, styles['save-button'])}
                                onClick={handleSave}
                                disabled={isSaveDisabled}
                            >
                                {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                            </Button>
                        </div>
                    </form>
                </div>
            );
        }

        return (
            <div className={cn(styles.root, styles['view-root'])}>
                <div className={styles['buttons-container']}>
                    <LocalizationStatuses
                        languages={translationLanguages}
                        localizedEntity={{
                            translationStatuses: (content.localizations ?? []).map((l) => ({
                                languageId: l.languageId,
                                translationStatus: l.translationStatus,
                            })),
                        }}
                    />
                    <IconButton
                        aria-label={PDF_FILES_SECTION_TEXT.ACTIONS.EDIT}
                        type="button"
                        onClick={handleEditClick}
                        className={styles['edit-button']}
                        DefaultIcon={ACTION_ICONS.edit.default}
                        FilledIcon={ACTION_ICONS.edit.hover}
                    />
                </div>
                <div className={styles['content-container']}>
                    <div className={styles['view-field']}>
                        <label className={styles['view-label']}>{PDF_FILES_SECTION_TEXT.TITLE}</label>
                        <p className={cn(styles['view-text'], styles['view-text-title'])}>{formData.title}</p>
                    </div>
                    <div className={styles['view-field']}>
                        <label className={styles['view-label']}>{PDF_FILES_SECTION_TEXT.DESCRIPTION}</label>
                        <p className={cn(styles['view-text'], styles['view-text-description'])}>
                            {formData.description}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const getModalConfig = () => {
        if (confirmationModalType === 'cancel') {
            return {
                title: COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE,
                onConfirm: handleCancelConfirmed,
            };
        }
        return {
            title: COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES,
            onConfirm: handleConfirmPublish,
        };
    };

    const modalConfig = getModalConfig();

    return (
        <>
            {renderContent()}
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => {
                    setIsConfirmationModalOpen(false);
                    setConfirmationModalType(null);
                }}
                title={modalConfig.title}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => {
                    setIsConfirmationModalOpen(false);
                    setConfirmationModalType(null);
                }}
                isButtonsDisabled={isSaving}
            />
        </>
    );
};
