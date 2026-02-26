import { WhoWeAreSection } from '@/types/admin/who-we-are';
import { LocalizationLanguage } from '@/types/common/language';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { ModalMode } from '@/types/admin/common';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { GeneralFormRef, WhoWeAreModalStrategy } from '../strategies/who-we-are-modal-strategy';
import { SectionType } from '@/types/common/about-us';
import { translateTitleAndDescriptionStrategy } from '../strategies/description/translate-title-and-description-strategy';
import { translateDescriptionStrategy } from '../strategies/description/translate-description-strategy';

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
    onTranslateSection, // TODO: After localization
    translatedLanguages,
}: TranslateModalProps) => {
    const formRef = useRef<GeneralFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [language, setLanguage] = useState<LocalizationLanguage | null>(translatedLanguages?.[0] ?? 'en');

    useEffect(() => {
        if (translatedLanguages.length > 0 && !language) {
            const defaultEnglish =
                translatedLanguages.find((lang) => lang.code !== DEFAULT_LOCALE) || translatedLanguages[0];
            setLanguage(defaultEnglish);
        }
    }, [translatedLanguages, language]);

    if (!sectionToTranslate) return null;

    // Add logic for localization
    const existingLocalization = null;

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => {
        return formRef.current?.isDirty() ?? false;
    };

    const renderFormWithStrategy = <TValues,>(strategy: WhoWeAreModalStrategy<TValues>) => {
        const FormComponent = strategy.FormComponent;
        const initialData = strategy.getInitialData(sectionToTranslate, language, isEditMode);

        const handleFormSubmit = async (data: TValues) => {
            await strategy.submit(data, sectionToTranslate, language);
        };

        return (
            <FormComponent
                key={language?.id}
                ref={formRef}
                onSubmit={handleFormSubmit}
                initialData={initialData}
                onValidationChange={setIsFormValid}
                onDirtyChange={setIsDirty}
            />
        );
    };

    const renderSectionForm = () => {
        switch (sectionToTranslate.sectionType) {
            case SectionType.Main:
                return renderFormWithStrategy(translateTitleAndDescriptionStrategy);
            case SectionType.WhatWeDo:
            case SectionType.WhoWeSupport:
            case SectionType.Team:
            case SectionType.People:
                return renderFormWithStrategy(translateDescriptionStrategy);
            default:
                return null;
        }
    };

    const modalTitle = isEditMode
        ? COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION
        : COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION;

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            onSave={handleSaveClick}
            isSubmitting={false} // TODO: add isSubmitting after localization
            isFormValid={isFormValid}
            checkIsDirty={checkIsDirty}
            isDirty={isDirty}
        >
            <TranslationControls
                selectedLanguage={language}
                isSubmitting={false} // TODO: add isSubmitting after localization
                languages={translatedLanguages}
                onLanguageChange={setLanguage}
            />

            {renderSectionForm()}
        </LocalizationModal>
    );
};
