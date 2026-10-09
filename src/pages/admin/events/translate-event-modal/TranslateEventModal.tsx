import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ModalMode } from '@/types/admin/common';
import { LocalizationLanguage } from '@/types/common/language';
import { EventItemDto } from '@/types/admin/events';
import { useRef, useState, useEffect, useMemo } from 'react';
import {
    TranslateEventForm,
    TranslateEventFormRef,
    TranslateEventFormValues,
} from '@/pages/admin/events/translate-event-form/TranslateEventForm';
import { useTranslateEvent } from '@/hooks/admin/use-translate-event/useTranslateEvent';

export interface TranslateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventToTranslate: EventItemDto | null;
    translatedLanguages: LocalizationLanguage[];
    onTranslateEvent?: (event: EventItemDto) => void;
}

export const TranslateEventModal = ({
    isOpen,
    onClose,
    eventToTranslate,
    translatedLanguages,
    onTranslateEvent,
}: TranslateEventModalProps) => {
    const formRef = useRef<TranslateEventFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const [language, setLanguage] = useState<LocalizationLanguage | null>(null);

    useEffect(() => {
        if (isOpen && translatedLanguages?.length > 0) {
            const targetLanguage = translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) || translatedLanguages[0];
            setLanguage(targetLanguage);
        }
    }, [isOpen, translatedLanguages]);

    const existingLocalization = useMemo(() => {
        if (!eventToTranslate?.localizations || !language) return null;
        return eventToTranslate.localizations.find(
            (loc) => (loc.language?.id ?? (loc as unknown as { languageId?: number }).languageId) === language.id,
        );
    }, [eventToTranslate?.localizations, language]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;

    const initialData = useMemo<TranslateEventFormValues | null>(() => {
        if (!isEditMode || !existingLocalization) return null;

        return {
            title: existingLocalization.title,
            description: existingLocalization.description,
            additionalDescription: existingLocalization.additionalDescription ?? '',
        };
    }, [existingLocalization, isEditMode]);

    const { translateEvent, isSubmitting, error } = useTranslateEvent({
        event: eventToTranslate,
        language,
        onSuccess: (updatedEvent) => {
            onTranslateEvent?.(updatedEvent);
            onClose();
        },
        mode,
    });

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => {
        return formRef.current?.isDirty() ?? false;
    };

    const handleFormSubmit = async (data: TranslateEventFormValues) => {
        await translateEvent(data);
    };

    if (!eventToTranslate) return null;

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
            {error && <div className="translate-event-error">{error}</div>}
            <TranslateEventForm
                key={language?.id}
                ref={formRef}
                initialData={initialData}
                onValidationChange={setIsFormValid}
                onSubmit={handleFormSubmit}
                formDisabled={isSubmitting}
                onDirtyChange={setIsDirty}
            />
        </LocalizationModal>
    );
};
