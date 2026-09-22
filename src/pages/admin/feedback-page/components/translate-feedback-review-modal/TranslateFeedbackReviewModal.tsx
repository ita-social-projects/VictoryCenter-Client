import { useMemo } from 'react';
import {
    TranslateFeedbackReviewForm,
    TranslateFeedbackReviewFormRef,
    TranslateFeedbackReviewFormValues,
} from '../translate-feedback-review-form/TranslateFeedbackReviewForm';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { useTranslateFeedbackReview } from '@/hooks/admin/use-translate-feedback-review/useTranslateFeedbackReview';
import { useTranslationModal } from '@/hooks/admin/use-translation-modal/useTranslationModal';
import { FeedbackReviewDto, FeedbackReviewLocalization } from '@/types/admin/feedback';
import { LocalizationLanguage } from '@/types/common/language';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';

interface TranslateFeedbackReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    reviewToTranslate: FeedbackReviewDto | null;
    onTranslateReview: (review: FeedbackReviewDto) => void;
    translatedLanguages: LocalizationLanguage[];
}

export const TranslateFeedbackReviewModal = ({
    isOpen,
    onClose,
    reviewToTranslate,
    onTranslateReview,
    translatedLanguages,
}: TranslateFeedbackReviewModalProps) => {
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
    } = useTranslationModal<FeedbackReviewLocalization, TranslateFeedbackReviewFormRef>({
        localizations: reviewToTranslate?.localizations,
        translatedLanguages,
    });

    const initialData = useMemo<TranslateFeedbackReviewFormValues | null>(() => {
        if (!isEditMode || !existingLocalization) return null;

        return {
            authorName: existingLocalization.authorName,
            text: existingLocalization.text,
        };
    }, [existingLocalization, isEditMode]);

    const { translateReview, isSubmitting, error } = useTranslateFeedbackReview({
        review: reviewToTranslate,
        language,
        onSuccess: (updatedReview) => {
            onTranslateReview(updatedReview);
            onClose();
        },
        mode,
    });

    const handleFormSubmit = async (data: TranslateFeedbackReviewFormValues) => {
        await translateReview(data);
    };

    if (!reviewToTranslate) return null;

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
            {error && <div className="translate-feedback-review-error">{error}</div>}

            <TranslateFeedbackReviewForm
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
