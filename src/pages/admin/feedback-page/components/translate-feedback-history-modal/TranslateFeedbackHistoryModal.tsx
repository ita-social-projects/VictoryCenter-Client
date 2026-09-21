import { useEffect, useMemo, useRef, useState } from 'react';
import {
    TranslateFeedbackHistoryForm,
    TranslateFeedbackHistoryFormRef,
    TranslateFeedbackHistoryFormValues,
} from '../translate-feedback-history-form/TranslateFeedbackHistoryForm';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { useTranslateFeedbackHistory } from '@/hooks/admin/use-translate-feedback-history/useTranslateFeedbackHistory';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FeedbackHistoryDto } from '@/types/admin/feedback';
import { LocalizationLanguage } from '@/types/common/language';
import { ModalMode } from '@/types/admin/common';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';

interface TranslateFeedbackHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    historyToTranslate: FeedbackHistoryDto | null;
    onTranslateHistory: (history: FeedbackHistoryDto) => void;
    translatedLanguages: LocalizationLanguage[];
}

export const TranslateFeedbackHistoryModal = ({
    isOpen,
    onClose,
    historyToTranslate,
    onTranslateHistory,
    translatedLanguages,
}: TranslateFeedbackHistoryModalProps) => {
    const formRef = useRef<TranslateFeedbackHistoryFormRef>(null);

    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [language, setLanguage] = useState<LocalizationLanguage | null>(translatedLanguages?.[0] ?? null);

    useEffect(() => {
        if (translatedLanguages.length > 0 && !language) {
            const defaultEnglish = translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) || translatedLanguages[0];
            setLanguage(defaultEnglish);
        }
    }, [translatedLanguages, language]);

    const existingLocalization = useMemo(() => {
        if (!historyToTranslate?.localizations || !language) return null;
        return historyToTranslate?.localizations?.find((loc) => loc.language.id === language?.id);
    }, [historyToTranslate?.localizations, language]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;

    const initialData = useMemo<TranslateFeedbackHistoryFormValues | null>(() => {
        if (!isEditMode || !existingLocalization) return null;

        return {
            title: existingLocalization.title,
            story: existingLocalization.story,
        };
    }, [existingLocalization, isEditMode]);

    const { translateHistory, isSubmitting, error } = useTranslateFeedbackHistory({
        history: historyToTranslate,
        language: language!,
        onSuccess: (updatedHistory) => {
            onTranslateHistory(updatedHistory);
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

    const handleFormSubmit = async (data: TranslateFeedbackHistoryFormValues) => {
        await translateHistory(data);
    };

    if (!historyToTranslate) return null;

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
            {error && <div className="translate-feedback-history-error">{error}</div>}

            <TranslateFeedbackHistoryForm
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
