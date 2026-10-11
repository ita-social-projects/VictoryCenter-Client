import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { LocalizationLanguage } from '@/types/common/language';
import { EventItemDto } from '@/types/admin/events';
import { useRef, useState, useEffect } from 'react';
import {
    TranslateEventForm,
    TranslateEventFormRef,
} from '@/pages/admin/events/translate-event-form/TranslateEventForm';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';

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
    const { addToast } = useToast();

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

    const handleFormSubmit = async () => {
        if (!eventToTranslate || !language) return;

        setIsSubmitting(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            onClose();
        } catch (error) {
            addToast(COMMON_TEXT_ADMIN.MESSAGE.ERROR_TRY_AGAIN, ToastType.Error, 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!eventToTranslate) return null;

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={onClose}
            title={COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION}
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
