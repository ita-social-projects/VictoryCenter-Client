import { useEffect, useMemo, useRef, useState } from 'react';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { useTranslatePdfSection } from '@/hooks/admin/use-translate-pdf-section/useTranslatePdfSection';
import { ModalMode } from '@/types/admin/common';
import { PdfSection } from '@/types/admin/pdf-section';
import { LocalizationLanguage } from '@/types/common/language';
import {
    TranslatePdfSectionForm,
    TranslatePdfSectionFormRef,
    TranslatePdfSectionFormValues,
} from '../translate-pdf-section-form/TranslatePdfSectionForm';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

interface TranslatePdfSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfSection: PdfSection | null;
    onTranslatePdfSection: (section: PdfSection) => void;
    translatedLanguages: LocalizationLanguage[];
}

export const TranslatePdfSectionModal = ({
    isOpen,
    onClose,
    pdfSection,
    onTranslatePdfSection,
    translatedLanguages,
}: TranslatePdfSectionModalProps) => {
    const formRef = useRef<TranslatePdfSectionFormRef>(null);

    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [language, setLanguage] = useState<LocalizationLanguage | null>(() => {
        if (!translatedLanguages?.length) return null;
        return translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) || translatedLanguages[0];
    });

    useEffect(() => {
        if (translatedLanguages.length > 0 && !language) {
            const defaultEnglish = translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) || translatedLanguages[0];
            setLanguage(defaultEnglish);
        }
    }, [translatedLanguages, language]);

    const existingLocalization = useMemo(() => {
        if (!pdfSection?.localizations || !language) return null;
        return pdfSection.localizations.find((loc) => loc.languageId === language?.id);
    }, [pdfSection?.localizations, language]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;

    const initialData = useMemo<TranslatePdfSectionFormValues | null>(() => {
        if (!isEditMode || !existingLocalization) return null;

        return {
            title: existingLocalization.title,
            description: existingLocalization.description,
        };
    }, [existingLocalization, isEditMode]);

    const { translatePdfSection, isSubmitting, error } = useTranslatePdfSection({
        pdfSection,
        language,
        mode,
        onSuccess: (updatedSection) => {
            onTranslatePdfSection(updatedSection);
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

    const handleFormSubmit = async (data: TranslatePdfSectionFormValues) => {
        await translatePdfSection(data);
    };

    if (!pdfSection) return null;

    const modalTitle = isEditMode
        ? COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION
        : COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION;

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

            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            <TranslatePdfSectionForm
                key={language?.id}
                ref={formRef}
                onSubmit={handleFormSubmit}
                initialData={initialData}
                isFormDisabled={isSubmitting}
                onValidationChange={setIsFormValid}
                onDirtyChange={setIsDirty}
            />
        </LocalizationModal>
    );
};
