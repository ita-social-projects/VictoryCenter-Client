import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { HippotherapyProgram } from '@/types/admin/programs';
import { LocalizationLanguage } from '@/types/common/language';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import {
    TranslateProgramForm,
    TranslateProgramFormRef,
    TranslateProgramFormValues,
} from '../translate-program-form/TranslateProgramForm';
import { useTranslateProgram } from '@/hooks/admin/use-translate-program/useTranslateProgram';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import {
    CreateHippotherapyProgramSectionLocalizationDto,
    CreateProgramSectionContentLocalizationDto,
} from '@/types/common/program-sections';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { Select } from '@/components/common/select/Select';
import './TranslateProgramModal.scss';

interface TranslateProgramModalProps {
    isOpen: boolean;
    onClose: () => void;
    programToTranslate: HippotherapyProgram | null;
    onTranslateProgram: (program: HippotherapyProgram) => void;
    translatedLanguages: LocalizationLanguage[];
}

export const TranslateProgramModal = ({
    isOpen,
    onClose,
    programToTranslate,
    onTranslateProgram,
    translatedLanguages,
}: TranslateProgramModalProps) => {
    const formRef = useRef<TranslateProgramFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [language, setLanguage] = useState<LocalizationLanguage | null>(translatedLanguages?.[0] ?? null);
    const [isDirty, setIsDirty] = useState(false);
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

    useEffect(() => {
        if (translatedLanguages.length > 0 && !language) {
            const defaultEnglish = translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) || translatedLanguages[0];
            setLanguage(defaultEnglish);
        }
    }, [translatedLanguages, language]);

    const existingLocalization = useMemo(() => {
        if (!programToTranslate?.localizations || !language) return null;
        return programToTranslate.localizations.find((loc) => loc.language?.id === language.id);
    }, [programToTranslate, language]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;

    const { translateProgram, isSubmitting, error } = useTranslateProgram({
        program: programToTranslate,
        language: language!,
        mode,
        onSuccess: (updated) => {
            onTranslateProgram(updated);
            onClose();
        },
    });

    const initialData = useMemo<TranslateProgramFormValues>(() => {
        const languageId = language?.id;

        const sections: CreateHippotherapyProgramSectionLocalizationDto[] =
            programToTranslate?.sections
                .filter((section) => section.id !== undefined)
                .map((section) => ({
                    entityId: section.id!,
                    __sourceSection: section,
                    contents: section.contents
                        .filter((content) => content.id !== undefined)
                        .map((content) => {
                            const contentLoc = languageId
                                ? content.localizations?.find((loc) => loc.localizationInfoDto?.id === languageId)
                                : undefined;

                            return {
                                entityId: content.id!,
                                languageId: languageId ?? 0,
                                title: contentLoc?.title ?? null,
                                description: contentLoc?.description ?? null,
                                author: contentLoc?.author ?? null,
                                question: contentLoc?.question ?? null,
                                answer: contentLoc?.answer ?? null,
                            } satisfies CreateProgramSectionContentLocalizationDto;
                        }),
                })) ?? [];

        return {
            name: existingLocalization?.name || '',
            description: existingLocalization?.description || '',
            location: existingLocalization?.location || '',
            participantsCount: existingLocalization?.participantsCount || '',
            meetingCount: existingLocalization?.meetingsCount || '',
            sections,
            __previewImage: programToTranslate?.previewImage ?? null,
            __backgroundImage: programToTranslate?.backgroundImage ?? null,
        };
    }, [
        existingLocalization,
        language?.id,
        programToTranslate?.sections,
        programToTranslate?.previewImage,
        programToTranslate?.backgroundImage,
    ]);

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit(VisibilityStatus.Draft);
    };

    const handleGenerateClick = () => {
        // TODO: connect real auto-translation action when backend endpoint is ready
    };

    const checkIsDirty = () => {
        return formRef.current?.isDirty() ?? false;
    };

    const handleFormSubmit = async (data: TranslateProgramFormValues) => {
        await translateProgram(data);
    };

    const handleRequestClose = () => {
        if (checkIsDirty()) {
            setIsExitConfirmOpen(true);
            return;
        }
        onClose();
    };

    const handleConfirmClose = () => {
        setIsExitConfirmOpen(false);
        onClose();
    };

    const handleCancelClose = () => {
        setIsExitConfirmOpen(false);
    };

    if (!programToTranslate) return null;

    const modalTitle = isEditMode
        ? COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION
        : COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION;

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleRequestClose} fullscreen={true} className="translate-program-modal">
                <Modal.Title>{modalTitle}</Modal.Title>
                <Modal.Content>
                    <div className="translate-program-modal__top-bar">
                        <div className="translate-program-modal__language-select">
                            {language && (
                                <Select<string>
                                    className="language-select"
                                    headClassName="translate-program-modal__language-select-head"
                                    value={language.code}
                                    onValueChange={(code) => {
                                        const newLang = translatedLanguages.find((l) => l.code === code);
                                        if (newLang) setLanguage(newLang);
                                    }}
                                    placeholder={language.name}
                                >
                                    {translatedLanguages.map((lang) => (
                                        <Select.Option key={lang.id} value={lang.code} name={lang.name} />
                                    ))}
                                </Select>
                            )}
                        </div>

                        <div className="translate-program-modal__top-actions">
                            <Button
                                buttonStyle="secondary"
                                onClick={handleSaveClick}
                                disabled={!isFormValid || isSubmitting || !isDirty}
                                data-testid="save-localization-btn"
                                className="translate-program-modal__action-button"
                            >
                                {COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION}
                            </Button>
                            <Button
                                buttonStyle="primary"
                                disabled={isSubmitting || !language}
                                onClick={handleGenerateClick}
                                className="translate-program-modal__action-button"
                            >
                                {COMMON_TEXT_ADMIN.BUTTON.GENERATE_TRANSLATION}
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
                            {error}
                        </div>
                    )}

                    <TranslateProgramForm
                        key={language?.id}
                        ref={formRef}
                        onSubmit={handleFormSubmit}
                        initialData={initialData}
                        onValidationChange={setIsFormValid}
                        onDirtyChange={setIsDirty}
                    />
                </Modal.Content>
            </Modal>

            <ConfirmationModal
                isOpen={isExitConfirmOpen}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
                onClose={handleCancelClose}
            />
        </>
    );
};
