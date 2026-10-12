import { useState, useMemo, useEffect, useRef } from 'react';
import { EventCategoryDto } from '@/types/admin/event-category';
import { EVENT_CATEGORY_TEXT } from '@/const/admin/events';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { LocalizationLanguage } from '@/types/common/language';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { useTranslateEventCategory } from '@/hooks/admin/use-translate-event-category/useTranslateEventCategory';
import {
    TranslateEventCategoryForm,
    TranslateEventCategoryFormRef,
    TranslateEventCategoryFormValues,
} from '../translate-event-category-form/TranslateEventCategoryForm';

export interface TranslateEventCategoryModalProps {
    isOpen: boolean;
    categories: EventCategoryDto[];
    onClose: () => void;
    translationLanguages: LocalizationLanguage[];
    onTranslateCategory?: (category: EventCategoryDto) => void;
}

export const TranslateEventCategoryModal = ({
    isOpen,
    categories,
    onClose,
    translationLanguages,
    onTranslateCategory,
}: TranslateEventCategoryModalProps) => {
    const formRef = useRef<TranslateEventCategoryFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState<EventCategoryDto | null>(null);
    const [language, setLanguage] = useState<LocalizationLanguage | null>(null);

    const availableLanguages = useMemo(() => {
        return translationLanguages?.filter((l) => l.code !== DEFAULT_LOCALE) || [];
    }, [translationLanguages]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedCategory(null);
            setIsDirty(false);
            setIsFormValid(false);
            if (availableLanguages.length > 0) {
                setLanguage(availableLanguages[0]);
            }
        }
    }, [isOpen, availableLanguages]);

    const sortedCategories = useMemo(() => {
        return [...categories].sort((a, b) => a.name.localeCompare(b.name));
    }, [categories]);

    const existingTranslation = useMemo(
        () =>
            selectedCategory?.localizations?.find((localization) => localization.language.code === language?.code) ??
            null,
        [selectedCategory, language],
    );

    const initialFormData = useMemo(
        () => (existingTranslation ? { name: existingTranslation.name } : null),
        [existingTranslation],
    );

    const isCompleteFormValid = isFormValid && selectedCategory !== null;

    const handleClose = () => {
        setSelectedCategory(null);
        setIsDirty(false);
        onClose();
    };

    const { translateEventCategory, isSubmitting, error } = useTranslateEventCategory({
        category: selectedCategory,
        language: language as LocalizationLanguage,
        hasExistingTranslation: !!existingTranslation,
        onSuccess: (updatedCategory) => {
            onTranslateCategory?.(updatedCategory);
            handleClose();
        },
    });

    const handleSaveClick = () => {
        if (!isCompleteFormValid || !formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const handleFormSubmit = async (data: TranslateEventCategoryFormValues) => {
        await translateEventCategory(data);
    };

    const checkIsDirty = () => {
        return isDirty;
    };

    const modalTitle = existingTranslation
        ? EVENT_CATEGORY_TEXT.TRANSLATION_MODAL.EDIT_TITLE
        : EVENT_CATEGORY_TEXT.TRANSLATION_MODAL.TITLE;

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={handleClose}
            title={modalTitle}
            onSave={handleSaveClick}
            isSubmitting={isSubmitting}
            isFormValid={isCompleteFormValid}
            isDirty={isDirty}
            checkIsDirty={checkIsDirty}
        >
            {error && <div className="error-message">{error}</div>}
            <TranslationControls
                isSubmitting={isSubmitting}
                languages={availableLanguages}
                selectedLanguage={language}
                onLanguageChange={setLanguage}
            />
            <TranslateEventCategoryForm
                initialData={initialFormData}
                ref={formRef}
                categories={sortedCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onValidationChange={setIsFormValid}
                onSubmit={handleFormSubmit}
                formDisabled={isSubmitting}
                onDirtyChange={setIsDirty}
            />
        </LocalizationModal>
    );
};
