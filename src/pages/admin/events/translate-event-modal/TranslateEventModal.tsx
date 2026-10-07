import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { LocalizationLanguage } from '@/types/common/language';
import { EventItemDto } from '@/types/admin/events';
import { useRef, useState, useEffect } from 'react';
import {
    TranslateEventForm,
    TranslateEventFormRef,
    TranslateEventFormValues,
} from '@/pages/admin/events/translate-event-form/TranslateEventForm';

export interface TranslateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventToTranslate: EventItemDto | null;
    translatedLanguages: LocalizationLanguage[];
}

export const TranslateEventModal = ({
    isOpen,
    onClose,
    eventToTranslate,
    translatedLanguages,
}: TranslateEventModalProps) => {
    const formRef = useRef<TranslateEventFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [language, setLanguage] = useState<LocalizationLanguage | null>(null);

    useEffect(() => {
        if (isOpen && translatedLanguages?.length > 0) {
            const targetLanguage = translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) || translatedLanguages[0];
            setLanguage(targetLanguage);
        }
    }, [isOpen, translatedLanguages]);

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => {
        return formRef.current?.isDirty() ?? false;
    };

    const handleFormSubmit = async (data: TranslateEventFormValues) => {
        if (!eventToTranslate || !language) return;

        setIsSubmitting(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            onClose();
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!eventToTranslate) return null;

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={onClose}
            title="Додати переклад"
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
            <TranslateEventForm
                ref={formRef}
                onValidationChange={setIsFormValid}
                onSubmit={handleFormSubmit}
                formDisabled={isSubmitting}
                onDirtyChange={setIsDirty}
            />
        </LocalizationModal>
    );
};
