import { useCallback, useState } from 'react';
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
import { useMemo } from 'react';

const getInitialData = (section: HistorySectionDto, languageId?: number): TranslateHistorySectionFormValues | null => {
    if (!languageId) return null;

    let title = '';
    let description = '';
    let hasData = false;

    for (const content of section.contents) {
        if (content.contentType === ContentType.Title) {
            const loc = content.localizations?.find((l) => l.localizationInfoDto.id === languageId);
            if (loc?.title) {
                title = loc.title;
                hasData = true;
            }
        }
        if (content.contentType === ContentType.Description) {
            const loc = content.localizations?.find((l) => l.localizationInfoDto.id === languageId);
            if (loc?.description) {
                description = loc.description;
                hasData = true;
            }
        }
    }

    return hasData ? { title, description } : null;
};

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

    const { translateSections, isSubmitting } = useTranslateHistorySection({
        sections,
        language,
        onSuccess: (updatedSections) => {
            onSaved(updatedSections);
            onClose();
        },
    });

    const isFormValid = sectionStates.every((s) => s.isFormValid);
    const isDirty = sectionStates.some((s) => s.isDirty);

    const updateSectionState = useCallback(
        (index: number, updates: Partial<Pick<SectionTranslationState, 'isFormValid' | 'isDirty'>>) => {
            setSectionStates((prev) => {
                const target = prev[index];
                if (!target) return prev;

                let hasChanges = false;
                for (const key in updates) {
                    const typedKey = key as keyof typeof updates;
                    if (target[typedKey] !== updates[typedKey]) {
                        hasChanges = true;
                        break;
                    }
                }

                if (!hasChanges) return prev;

                return prev.map((s, i) => (i === index ? { ...s, ...updates } : s));
            });
        },
        [],
    );

    const checkIsDirty = () => isDirty;

    const handleSave = async () => {
        for (const { formRef } of sectionStates) {
            if (formRef.current && !formRef.current.isValid()) return;
        }

        const dataMap = [];
        for (const { formRef, section } of sectionStates) {
            if (formRef.current && section.id !== undefined) {
                dataMap.push({ sectionId: section.id, data: formRef.current.getValues() });
            }
        }

        await translateSections(dataMap);
    };

    const isEditMode = useMemo(() => {
        return sections.some((section) => getInitialData(section, language?.id) !== null);
    }, [sections, language?.id]);

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={onClose}
            title={
                isEditMode
                    ? COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION
                    : COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION
            }
            onSave={handleSave}
            isSubmitting={isSubmitting}
            isFormValid={isFormValid}
            checkIsDirty={checkIsDirty}
            isDirty={isDirty}
            maxWidth="1200px"
        >
            <TranslationControls
                selectedLanguage={language}
                isSubmitting={isSubmitting}
                languages={languages}
                onLanguageChange={setLanguage}
            />

            <div className={styles['sections-list']}>
                {sectionStates.map((state, index) => {
                    const { section, formRef } = state;

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
                            key={`${section.id ?? index}-${language?.id}`}
                            index={index}
                            formRef={formRef}
                            sectionPreview={sectionPreview}
                            section={section}
                            languageId={language?.id}
                            updateSectionState={updateSectionState}
                        />
                    );
                })}
            </div>
        </LocalizationModal>
    );
};

interface SectionTranslationRowProps {
    index: number;
    formRef: React.RefObject<TranslateHistorySectionFormRef | null>;
    sectionPreview: React.ReactNode;
    section: HistorySectionDto;
    languageId?: number;
    updateSectionState: (
        index: number,
        updates: Partial<Pick<SectionTranslationState, 'isFormValid' | 'isDirty'>>,
    ) => void;
}

const SectionTranslationRow = ({
    index,
    formRef,
    sectionPreview,
    section,
    languageId,
    updateSectionState,
}: SectionTranslationRowProps) => {
    const initialData = useMemo(() => getInitialData(section, languageId), [section, languageId]);

    const handleValidationChange = useCallback(
        (isValid: boolean) => updateSectionState(index, { isFormValid: isValid }),
        [index, updateSectionState],
    );

    const handleDirtyChange = useCallback(
        (dirty: boolean) => updateSectionState(index, { isDirty: dirty }),
        [index, updateSectionState],
    );

    return (
        <div className={styles['section-row']} data-testid="translate-section-row">
            {sectionPreview && <div className={styles['section-preview']}>{sectionPreview}</div>}
            <TranslateHistorySectionForm
                ref={formRef}
                initialData={initialData}
                onSubmit={() => {}}
                onValidationChange={handleValidationChange}
                onDirtyChange={handleDirtyChange}
            />
        </div>
    );
};
