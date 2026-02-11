import { useEffect, useMemo, useRef, useState } from 'react';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { FaqQuestion } from '@/types/admin/faq';
import { LocalizationLanguage } from '@/types/common/language';
import { ModalMode } from '@/types/admin/common';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { TranslateFaqForm, TranslateFaqFormRef, TranslateFaqFormValues } from './TranslateFaqForm';
import { useTranslateFaq } from '@/hooks/admin/use-translate-faq/useTranslateFaq';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { DEFAULT_LOCALE } from '@/const/common/locales';

interface TranslateFaqModalProps {
    isOpen: boolean;
    onClose: () => void;
    faqToTranslate: FaqQuestion | null;
    onTranslateFaq: (faq: FaqQuestion) => void;
    translatedLanguages: LocalizationLanguage[];
}

export const TranslateFaqModal = ({
    isOpen,
    onClose,
    faqToTranslate,
    onTranslateFaq,
    translatedLanguages,
}: TranslateFaqModalProps) => {
    const formRef = useRef<TranslateFaqFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [language, setLanguage] = useState<LocalizationLanguage | null>(translatedLanguages?.[0] ?? null);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (translatedLanguages.length > 0 && !language) {
            const defaultEnglish = translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) || translatedLanguages[0];
            setLanguage(defaultEnglish);
        }
    }, [translatedLanguages, language]);

    const existingLocalization = useMemo(() => {
        if (!faqToTranslate?.localizations || !language) return null;
        return faqToTranslate.localizations.find((loc) => loc.language?.id === language.id);
    }, [faqToTranslate, language]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;

    const { translateFaq, isSubmitting, error } = useTranslateFaq({
        faq: faqToTranslate,
        language: language!,
        mode,
        onSuccess: (updatedFaq) => {
            onTranslateFaq(updatedFaq);
            onClose();
        },
    });

    const initialData = useMemo<TranslateFaqFormValues>(() => {
        return {
            question: existingLocalization?.questionText || '',
            answer: existingLocalization?.answerText || '',
        };
    }, [existingLocalization]);

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => {
        return formRef.current?.isDirty() ?? false;
    };

    const handleFormSubmit = async (data: TranslateFaqFormValues) => {
        await translateFaq(data);
    };

    if (!faqToTranslate) return null;

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
            {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
                    {error}
                </div>
            )}

            <TranslateFaqForm
                key={language?.id}
                ref={formRef}
                onSubmit={handleFormSubmit}
                initialData={initialData}
                onValidationChange={setIsFormValid}
                onDirtyChange={setIsDirty}
            />
        </LocalizationModal>
    );
};
