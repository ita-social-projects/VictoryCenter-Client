import { useState, useMemo, useEffect, useRef } from 'react';
import { EventCategoryDto } from '@/types/admin/event-category';
import { EVENT_CATEGORY_TEXT } from '@/const/admin/events';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { LocalizationLanguage } from '@/types/common/language';
import { DEFAULT_LOCALE } from '@/const/common/locales';
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
}

export const TranslateEventCategoryModal = ({
    isOpen,
    categories,
    onClose,
    translationLanguages,
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
        if (isOpen) {
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

    const isCompleteFormValid = isFormValid && selectedCategory !== null;

    const handleClose = () => {
        setSelectedCategory(null);
        setIsDirty(false);
        onClose();
    };

    const handleSaveClick = () => {
        if (!isCompleteFormValid || !formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const handleFormSubmit = async (_data: TranslateEventCategoryFormValues) => {
        // TODO: submit the form
        handleClose();
    };

    const checkIsDirty = () => {
        return isDirty;
    };

    const modalTitle = EVENT_CATEGORY_TEXT.TRANSLATION_MODAL.TITLE;

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={handleClose}
            title={modalTitle}
            onSave={handleSaveClick}
            isSubmitting={false}
            isFormValid={isCompleteFormValid}
            isDirty={isDirty}
            checkIsDirty={checkIsDirty}
        >
            <TranslationControls
                isSubmitting={false}
                languages={availableLanguages}
                selectedLanguage={language}
                onLanguageChange={setLanguage}
            />
            <TranslateEventCategoryForm
                ref={formRef}
                categories={sortedCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onValidationChange={setIsFormValid}
                onSubmit={handleFormSubmit}
                formDisabled={false}
                onDirtyChange={setIsDirty}
            />
        </LocalizationModal>
    );
};
