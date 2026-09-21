import { useEffect, useMemo, useRef, useState } from 'react';
import {
    TranslateFeedbackVideoForm,
    TranslateFeedbackVideoFormRef,
    TranslateFeedbackVideoFormValues,
} from '../translate-feedback-video-form/TranslateFeedbackVideoForm';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { useTranslateFeedbackVideo } from '@/hooks/admin/use-translate-feedback-video/useTranslateFeedbackVideo';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FeedbackVideoDto } from '@/types/admin/feedback';
import { LocalizationLanguage } from '@/types/common/language';
import { ModalMode } from '@/types/admin/common';
import { DEFAULT_LOCALE } from '@/const/common/locales';
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
    const formRef = useRef<TranslateFeedbackVideoFormRef>(null);

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
        if (!videoToTranslate?.localizations || !language) return null;
        return videoToTranslate?.localizations?.find((loc) => loc.language.id === language?.id);
    }, [videoToTranslate?.localizations, language]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;

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

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => {
        return formRef.current?.isDirty() ?? false;
    };

    const handleFormSubmit = async (data: TranslateFeedbackVideoFormValues) => {
        await translateVideo(data);
    };

    if (!videoToTranslate) return null;

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
