import { useMemo, useRef, useState } from 'react';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
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
}

export const TranslateProgramCategoryModal = ({
    isOpen,
    onClose,
    categories,
    translatedLanguages,
}: TranslateProgramCategoryModalProps) => {
    const formRef = useRef<TranslateProgramCategoryFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const englishLanguages = useMemo(
        () => translatedLanguages.filter((l) => l.code === 'en'),
        [translatedLanguages],
    );

    const [language, setLanguage] = useState<LocalizationLanguage | null>(englishLanguages[0] ?? null);

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => {
        return formRef.current?.isDirty() ?? false;
    };

    // TODO: wire real persistence (create/update translation, close on success, toast, badge update) — see US #1858.
    const handleFormSubmit = async (_data: TranslateProgramCategoryFormValues) => {};

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={onClose}
            title={COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION}
            onSave={handleSaveClick}
            isSubmitting={false}
            isFormValid={isFormValid}
            checkIsDirty={checkIsDirty}
            isDirty={isDirty}
        >
            {language && (
                <TranslationControls
                    selectedLanguage={language}
                    isSubmitting={false}
                    languages={englishLanguages}
                    onLanguageChange={setLanguage}
                />
            )}
            <TranslateProgramCategoryForm
                ref={formRef}
                categories={categories}
                onValidationChange={setIsFormValid}
                onDirtyChange={setIsDirty}
                onSubmit={handleFormSubmit}
            />
        </LocalizationModal>
    );
};
