import { useMemo } from 'react';
import {
    TranslateFeedbackVideoForm,
    TranslateFeedbackVideoFormRef,
    TranslateFeedbackVideoFormValues,
} from '../translate-feedback-video-form/TranslateFeedbackVideoForm';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { useTranslateFeedbackVideo } from '@/hooks/admin/use-translate-feedback-video/useTranslateFeedbackVideo';
import { useTranslationModal } from '@/hooks/admin/use-translation-modal/useTranslationModal';
import { FeedbackVideoDto, FeedbackVideoLocalization } from '@/types/admin/feedback';
import { LocalizationLanguage } from '@/types/common/language';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';

interface TranslateFeedbackVideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoToTranslate: FeedbackVideoDto | null;
    onTranslateVideo: (video: FeedbackVideoDto) => void;
    translatedLanguages: LocalizationLanguage[];
}

export const TranslateFeedbackVideoModal = ({
    isOpen,
    onClose,
    videoToTranslate,
    onTranslateVideo,
    translatedLanguages,
}: TranslateFeedbackVideoModalProps) => {
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
    } = useTranslationModal<FeedbackVideoLocalization, TranslateFeedbackVideoFormRef>({
        localizations: videoToTranslate?.localizations,
        translatedLanguages,
    });

    const initialData = useMemo<TranslateFeedbackVideoFormValues | null>(() => {
        if (!isEditMode || !existingLocalization) return null;

        return {
            title: existingLocalization.title,
        };
    }, [existingLocalization, isEditMode]);

    const { translateVideo, isSubmitting, error } = useTranslateFeedbackVideo({
        video: videoToTranslate,
        language: language!,
        onSuccess: (updatedVideo) => {
            onTranslateVideo(updatedVideo);
            onClose();
        },
        mode,
    });

    const handleFormSubmit = async (data: TranslateFeedbackVideoFormValues) => {
        await translateVideo(data);
    };

    if (!videoToTranslate) return null;

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
            {error && <div className="translate-feedback-video-error">{error}</div>}

            <TranslateFeedbackVideoForm
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
