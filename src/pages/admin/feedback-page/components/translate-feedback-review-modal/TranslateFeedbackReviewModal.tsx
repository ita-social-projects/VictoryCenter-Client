import { useEffect, useMemo, useRef, useState } from 'react';
import {
    TranslateFeedbackReviewForm,
    TranslateFeedbackReviewFormRef,
    TranslateFeedbackReviewFormValues,
} from '../translate-feedback-review-form/TranslateFeedbackReviewForm';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { useTranslateFeedbackReview } from '@/hooks/admin/use-translate-feedback-review/useTranslateFeedbackReview';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FeedbackReviewDto } from '@/types/admin/feedback';
import { LocalizationLanguage } from '@/types/common/language';
import { ModalMode } from '@/types/admin/common';
import { DEFAULT_LOCALE } from '@/const/common/locales';
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
    const formRef = useRef<TranslateFeedbackReviewFormRef>(null);

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
        if (!reviewToTranslate?.localizations || !language) return null;
        return reviewToTranslate?.localizations?.find((loc) => loc.language.id === language?.id);
    }, [reviewToTranslate?.localizations, language]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;

    const initialData = useMemo<TranslateFeedbackReviewFormValues | null>(() => {
        if (!isEditMode || !existingLocalization) return null;

        return {
            authorName: existingLocalization.authorName,
            text: existingLocalization.text,
        };
    }, [existingLocalization, isEditMode]);

    const { translateReview, isSubmitting, error } = useTranslateFeedbackReview({
        review: reviewToTranslate,
        language: language!,
        onSuccess: (updatedReview) => {
            onTranslateReview(updatedReview);
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

    const handleFormSubmit = async (data: TranslateFeedbackReviewFormValues) => {
        await translateReview(data);
    };

    if (!reviewToTranslate) return null;

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
