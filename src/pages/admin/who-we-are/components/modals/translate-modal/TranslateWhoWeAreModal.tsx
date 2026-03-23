import { TranslateLimits, WhoWeAreSection } from '@/types/admin/who-we-are';
import { LocalizationLanguage } from '@/types/common/language';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { ModalMode } from '@/types/admin/common';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { GeneralFormRef, WhoWeAreModalStrategy } from '../strategies/who-we-are-modal-strategy';
import { SectionType } from '@/types/common/about-us';
import { translateTitleAndDescriptionStrategy } from '../strategies/description/translate-title-and-description-strategy';
import { translateDescriptionStrategy } from '../strategies/description/translate-description-strategy';
import { LIMITS_BY_SECTION } from './translate-modal-config';
import { translateMultipleDescriptionsStrategy } from '../strategies/description/translate-multiple-descriptions-strategy';
import {
    TranslateWhoWeAreSectionFormValues,
    useTranslateWhoWeAreSection,
} from '@/hooks/admin/use-translate-who-we-are-section/useTranslateWhoWeAreSection';

interface TranslateModalProps {
    isOpen: boolean;
    onClose: () => void;
    sectionToTranslate: WhoWeAreSection | null;
    onTranslateSection: (section: WhoWeAreSection) => void;
    translatedLanguages: LocalizationLanguage[];
}

export const TranslateWhoWeAreModal = ({
    isOpen,
    onClose,
    sectionToTranslate,
    onTranslateSection,
    translatedLanguages,
}: TranslateModalProps) => {
    const formRef = useRef<GeneralFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [language, setLanguage] = useState<LocalizationLanguage | null>(translatedLanguages?.[0] ?? null);

    useEffect(() => {
        if (translatedLanguages.length > 0 && !language) {
            const defaultEnglish =
                translatedLanguages.find((lang) => lang.code !== DEFAULT_LOCALE) || translatedLanguages[0];
            setLanguage(defaultEnglish);
        }
    }, [translatedLanguages, language]);

    const existingLocalization = useMemo(() => {
        if (!sectionToTranslate?.contents || !language) return null;

        return sectionToTranslate.contents
            .flatMap((content) => content.localizations ?? [])
            .find((loc) => loc.language.id === language.id);
    }, [sectionToTranslate, language]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;

    const { translateSection, isSubmitting } = useTranslateWhoWeAreSection({
        section: sectionToTranslate,
        language: language!,
        mode,
        onSuccess: (updatedSection) => {
            onTranslateSection(updatedSection);
            onClose();
        },
    });

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => {
        return formRef.current?.isDirty() ?? false;
    };

    const sectionType = sectionToTranslate?.sectionType ?? SectionType.Main;

    const activeStrategy = useMemo(() => {
        const strategiesBySection: Record<SectionType, WhoWeAreModalStrategy<any>> = {
            [SectionType.Main]: translateTitleAndDescriptionStrategy,
            [SectionType.WhatWeDo]: translateDescriptionStrategy,
            [SectionType.WhoWeSupport]: translateMultipleDescriptionsStrategy,
            [SectionType.Team]: translateDescriptionStrategy,
            [SectionType.People]: translateMultipleDescriptionsStrategy,
        };

        return strategiesBySection[sectionType];
    }, [sectionType]);

    const activeLimits: TranslateLimits = LIMITS_BY_SECTION[sectionType];

    const initialData = useMemo(() => {
        if (!activeStrategy || !language || !sectionToTranslate) {
            return null;
        }

        return activeStrategy.getInitialData(sectionToTranslate, language, isEditMode);
    }, [activeStrategy, sectionToTranslate, language, isEditMode]);

    const handleFormSubmit = async (data: TranslateWhoWeAreSectionFormValues) => {
        if (!activeStrategy || !sectionToTranslate) return;
        await translateSection(data);
    };

    const modalTitle = isEditMode
        ? COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION
        : COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION;

    if (!sectionToTranslate) return null;

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            onSave={handleSaveClick}
            isSubmitting={isSubmitting}
            isFormValid={isFormValid}
            checkIsDirty={checkIsDirty}
            isDirty={isDirty}
        >
            <TranslationControls
                selectedLanguage={language}
                isSubmitting={isSubmitting}
                languages={translatedLanguages}
                onLanguageChange={setLanguage}
            />

            {activeStrategy && (
                <activeStrategy.FormComponent
                    key={language?.id}
                    ref={formRef}
                    onSubmit={handleFormSubmit}
                    initialData={initialData}
                    onValidationChange={setIsFormValid}
                    onDirtyChange={setIsDirty}
                    limits={activeLimits}
                />
            )}
        </LocalizationModal>
    );
};
