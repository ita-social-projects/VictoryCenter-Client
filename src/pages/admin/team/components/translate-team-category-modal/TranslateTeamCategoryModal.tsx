import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { useTranslateTeamCategory } from '@/hooks/admin/use-translate-team-category/useTranslateTeamCategory';
import { ModalMode } from '@/types/admin/common';
import { TeamCategory } from '@/types/admin/team-category';
import { LocalizationLanguage } from '@/types/common/language';
import { useMemo, useRef, useState } from 'react';
import {
    TranslateTeamCategoryForm,
    TranslateTeamCategoryFormRef,
    TranslateTeamCategoryFormValues,
} from '../translate-team-category-form/TranslateTeamCategoryForm';

interface TranslateTeamCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryToTranslate: TeamCategory | null;
    onTranslateCategory: (category: TeamCategory) => void;
    translatedLanguages: LocalizationLanguage[];
    categories: TeamCategory[];
}

export const TranslateTeamCategoryModal = ({
    isOpen,
    onClose,
    categoryToTranslate,
    onTranslateCategory,
    translatedLanguages,
    categories,
}: TranslateTeamCategoryModalProps) => {
    const formRef = useRef<TranslateTeamCategoryFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<TeamCategory | null>(categoryToTranslate);

    const [language, setLanguage] = useState<LocalizationLanguage | null>(() => {
        if (!translatedLanguages?.length) return null;
        return translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) || translatedLanguages[0];
    });

    const existingLocalization = useMemo(() => {
        if (!selectedCategory?.localizations || !language) return null;
        return selectedCategory.localizations.find((loc) => loc.language.id === language.id);
    }, [selectedCategory, language]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;

    const initialData = useMemo<TranslateTeamCategoryFormValues | null>(() => {
        if (!isEditMode || !existingLocalization) return null;

        return {
            name: existingLocalization.name,
            description: existingLocalization.description,
        };
    }, [existingLocalization, isEditMode]);

    const { translateTeamCategory, isSubmitting, error } = useTranslateTeamCategory({
        teamCategory: selectedCategory,
        language: language as LocalizationLanguage,
        onSuccess: (updatedTeamCategory) => {
            onTranslateCategory(updatedTeamCategory);
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

    const handleFormSubmit = async (data: TranslateTeamCategoryFormValues) => {
        await translateTeamCategory(data);
    };

    if (!categoryToTranslate) return null;

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
            {error && <div className="translate-team-category-error">{error}</div>}
            <TranslateTeamCategoryForm
                ref={formRef}
                categories={categories}
                selectedCategory={selectedCategory}
                initialData={initialData}
                onCategoryChange={setSelectedCategory}
                onValidationChange={setIsFormValid}
                onSubmit={handleFormSubmit}
                formDisabled={isSubmitting}
                onDirtyChange={setIsDirty}
            />
        </LocalizationModal>
    );
};
