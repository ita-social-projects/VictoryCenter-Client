import { useEffect, useMemo, useRef, useState } from 'react';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useTranslateProgramCategory } from '@/hooks/admin/use-translate-program-category/useTranslateProgramCategory';
import { ModalMode } from '@/types/admin/common';
import { ProgramCategory } from '@/types/admin/programs';
import { LocalizationLanguage } from '@/types/common/language';
import {
    TranslateProgramCategoryForm,
    TranslateProgramCategoryFormRef,
    TranslateProgramCategoryFormValues,
} from '../translate-program-category-form/TranslateProgramCategoryForm';

interface TranslateProgramCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: ProgramCategory[];
    translatedLanguages: LocalizationLanguage[];
    onTranslateCategory?: (category: ProgramCategory) => void;
}

export const TranslateProgramCategoryModal = ({
    isOpen,
    onClose,
    categories,
    translatedLanguages,
    onTranslateCategory,
}: TranslateProgramCategoryModalProps) => {
    const formRef = useRef<TranslateProgramCategoryFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ProgramCategory | null>(null);

    const englishLanguages = useMemo(() => translatedLanguages.filter((l) => l.code === 'en'), [translatedLanguages]);

    const [language, setLanguage] = useState<LocalizationLanguage | null>(englishLanguages[0] ?? null);

    useEffect(() => {
        if (!isOpen) return;
        setLanguage(englishLanguages[0] ?? null);
    }, [englishLanguages, isOpen]);

    const existingLocalization = useMemo(() => {
        if (!selectedCategory?.localizations || !language) return null;
        return selectedCategory.localizations.find((loc) => loc.language.id === language.id) ?? null;
    }, [selectedCategory, language]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;

    const initialData = useMemo<TranslateProgramCategoryFormValues | null>(() => {
        if (!isEditMode || !existingLocalization) return null;

        return {
            categoryId: selectedCategory?.id ?? null,
            name: existingLocalization.name,
        };
    }, [existingLocalization, isEditMode, selectedCategory?.id]);

    // Avoid overriding the form's initial validity/dirty state on first mount.
    const wasOpenRef = useRef(isOpen);
    useEffect(() => {
        const wasOpen = wasOpenRef.current;
        wasOpenRef.current = isOpen;
        if (!wasOpen && isOpen) {
            setIsFormValid(false);
            setIsDirty(false);
            setSelectedCategory(null);
        }
    }, [isOpen]);

    const { translateProgramCategory, isSubmitting, error } = useTranslateProgramCategory({
        category: selectedCategory,
        language: language as LocalizationLanguage,
        onSuccess: (updatedCategory) => {
            onTranslateCategory?.(updatedCategory);
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

    const handleFormSubmit = async (data: TranslateProgramCategoryFormValues) => {
        await translateProgramCategory(data);
    };

    const modalTitle = isEditMode
        ? COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION
        : COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION;

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
            {language && (
                <TranslationControls
                    selectedLanguage={language}
                    isSubmitting={isSubmitting}
                    languages={englishLanguages}
                    onLanguageChange={setLanguage}
                    generateDisabled={!selectedCategory}
                    hideGenerateButton={false}
                />
            )}
            {error && <div className="translate-program-category-error">{error}</div>}
            <TranslateProgramCategoryForm
                ref={formRef}
                categories={categories}
                selectedCategory={selectedCategory}
                initialData={initialData}
                onCategoryChange={setSelectedCategory}
                onValidationChange={setIsFormValid}
                onDirtyChange={setIsDirty}
                onSubmit={handleFormSubmit}
                formDisabled={isSubmitting}
            />
        </LocalizationModal>
    );
};
