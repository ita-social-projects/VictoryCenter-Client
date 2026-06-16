import { useCallback, useRef, useState } from 'react';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HistorySectionDto } from '@/types/common/history-sections';
import { LocalizationLanguage } from '@/types/common/language';
import { ContentType } from '@/types/common/section-contents';
import { useTranslateHistorySection } from '@/hooks/admin/use-translate-history-section/useTranslateHistorySection';
import {
    TranslateHistorySectionForm,
    TranslateHistorySectionFormRef,
    TranslateHistorySectionFormValues,
} from './TranslateHistorySectionForm';
import { renderHistorySection } from '@/utils/functions/render-history-section';
import { SectionMode } from '@/types/common/sections';
import styles from './TranslateHistoryModal.module.scss';

interface TranslateHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    sections: HistorySectionDto[];
    languages: LocalizationLanguage[];
    onSaved: (updatedSections: HistorySectionDto[]) => void;
}

interface SectionTranslationState {
    isFormValid: boolean;
    isDirty: boolean;
    formRef: React.RefObject<TranslateHistorySectionFormRef | null>;
    section: HistorySectionDto;
}

export const TranslateHistoryModal = ({
    isOpen,
    onClose,
    sections,
    languages,
    onSaved,
}: TranslateHistoryModalProps) => {
    const [language, setLanguage] = useState<LocalizationLanguage | null>(languages[0] ?? null);
    const [sectionStates, setSectionStates] = useState<SectionTranslationState[]>(() =>
        sections.map((section) => ({
            isFormValid: true,
            isDirty: false,
            formRef: { current: null } as React.RefObject<TranslateHistorySectionFormRef | null>,
            section,
        })),
    );

    const updatedSectionsRef = useRef<HistorySectionDto[]>([...sections]);

    const isFormValid = sectionStates.every((s) => s.isFormValid);
    const isDirty = sectionStates.some((s) => s.isDirty);

    const updateSectionState = useCallback(
        (index: number, updates: Partial<Pick<SectionTranslationState, 'isFormValid' | 'isDirty'>>) => {
            setSectionStates((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
        },
        [],
    );

    const checkIsDirty = () => isDirty;

    const handleSave = async () => {
        for (const { formRef } of sectionStates) {
            if (formRef.current && !formRef.current.isValid()) return;
        }
        for (const { formRef } of sectionStates) {
            if (formRef.current) {
                await formRef.current.submit();
            }
        }
    };

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={onClose}
            title={COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION}
            onSave={handleSave}
            isSubmitting={false}
            isFormValid={isFormValid}
            checkIsDirty={checkIsDirty}
            isDirty={isDirty}
        >
            <TranslationControls
                selectedLanguage={language}
                isSubmitting={false}
                languages={languages}
                onLanguageChange={setLanguage}
            />

            <div className={styles['sections-list']}>
                {sectionStates.map((state, index) => {
                    const { section, formRef } = state;

                    const hasTitle = section.contents.some((c) => c.contentType === ContentType.Title);
                    const hasDescription = section.contents.some((c) => c.contentType === ContentType.Description);
                    const hasImage = section.contents.some((c) => c.contentType === ContentType.Image);

                    const sectionPreview = hasImage
                        ? renderHistorySection({
                            templateId: section.template,
                            data: {
                                title: '',
                                description: '',
                                images: section.contents
                                    .filter((c) => c.contentType === ContentType.Image)
                                    .map((c) => c.image ?? null),
                            },
                            mode: SectionMode.View,
                            validationResetKey: 0,
                            handlers: {
                                onTitleChange: () => undefined,
                                onDescriptionChange: () => undefined,
                                onImagesChange: () => undefined,
                            },
                        })
                        : null;

                    return (
                        <SectionTranslationRow
                            key={section.id ?? index}
                            index={index}
                            section={section}
                            language={language}
                            formRef={formRef}
                            sectionPreview={sectionPreview}
                            hasTitle={hasTitle}
                            hasDescription={hasDescription}
                            updateSectionState={updateSectionState}
                            onSuccess={(updatedSection) => {
                                updatedSectionsRef.current = updatedSectionsRef.current.map((s, i) =>
                                    i === index ? updatedSection : s,
                                );
                                if (index === sectionStates.length - 1) {
                                    onSaved(updatedSectionsRef.current);
                                    onClose();
                                }
                            }}
                        />
                    );
                })}
            </div>
        </LocalizationModal>
    );
};

interface SectionTranslationRowProps {
    index: number;
    section: HistorySectionDto;
    language: LocalizationLanguage | null;
    formRef: React.RefObject<TranslateHistorySectionFormRef | null>;
    sectionPreview: React.ReactNode;
    hasTitle: boolean;
    hasDescription: boolean;
    updateSectionState: (
        index: number,
        updates: Partial<Pick<SectionTranslationState, 'isFormValid' | 'isDirty'>>,
    ) => void;
    onSuccess: (updatedSection: HistorySectionDto) => void;
}

const SectionTranslationRow = ({
    index,
    section,
    language,
    formRef,
    sectionPreview,
    hasTitle,
    hasDescription,
    updateSectionState,
    onSuccess,
}: SectionTranslationRowProps) => {
    const { translateSection } = useTranslateHistorySection({ section, language, onSuccess });

    const handleValidationChange = useCallback(
        (isValid: boolean) => updateSectionState(index, { isFormValid: isValid }),
        [index, updateSectionState],
    );

    const handleDirtyChange = useCallback(
        (dirty: boolean) => updateSectionState(index, { isDirty: dirty }),
        [index, updateSectionState],
    );

    const handleSubmit = async (data: TranslateHistorySectionFormValues) => {
        await translateSection(data);
    };

    return (
        <div className={styles['section-row']} data-testid="translate-section-row">
            {sectionPreview && <div className={styles['section-preview']}>{sectionPreview}</div>}
            <TranslateHistorySectionForm
                ref={formRef}
                onSubmit={handleSubmit}
                onValidationChange={handleValidationChange}
                onDirtyChange={handleDirtyChange}
                hasTitle={hasTitle}
                hasDescription={hasDescription}
            />
        </div>
    );
};
