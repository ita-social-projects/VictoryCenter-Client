import { useMemo } from 'react';
import {
    TranslateFeedbackHistoryForm,
    TranslateFeedbackHistoryFormRef,
    TranslateFeedbackHistoryFormValues,
} from '../translate-feedback-history-form/TranslateFeedbackHistoryForm';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { useTranslateFeedbackHistory } from '@/hooks/admin/use-translate-feedback-history/useTranslateFeedbackHistory';
import { useTranslationModal } from '@/hooks/admin/use-translation-modal/useTranslationModal';
import { FeedbackHistoryDto, FeedbackHistoryLocalization } from '@/types/admin/feedback';
import { LocalizationLanguage } from '@/types/common/language';
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
    const {
        formRef,
        isFormValid,
        setIsFormValid,
        isDirty,
        setIsDirty,
        language,
        setLanguage,
        existingLocalization,
        mode,
        isEditMode,
        modalTitle,
        handleSaveClick,
        checkIsDirty,
    } = useTranslationModal<FeedbackHistoryLocalization, TranslateFeedbackHistoryFormRef>({
        localizations: historyToTranslate?.localizations,
        translatedLanguages,
    });

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

    const handleFormSubmit = async (data: TranslateFeedbackHistoryFormValues) => {
        await translateHistory(data);
    };

    if (!historyToTranslate) return null;

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
