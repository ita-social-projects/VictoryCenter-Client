import { useEffect, useMemo, useRef, useState } from 'react';
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

    const englishLanguages = useMemo(() => translatedLanguages.filter((l) => l.code === 'en'), [translatedLanguages]);

    const [language, setLanguage] = useState<LocalizationLanguage | null>(englishLanguages[0] ?? null);

    // Keeps the selected language in sync when the modal reopens or `translatedLanguages` resolves after mount.
    useEffect(() => {
        if (!isOpen) return;
        setLanguage(englishLanguages[0] ?? null);
    }, [englishLanguages, isOpen]);

    // Resets stale validity/dirty state left over from a previous open, without touching the initial mount
    // (the form's own mount effect already reports its real initial validity/dirty state).
    const wasOpenRef = useRef(isOpen);
    useEffect(() => {
        const wasOpen = wasOpenRef.current;
        wasOpenRef.current = isOpen;
        if (!wasOpen && isOpen) {
            setIsFormValid(false);
            setIsDirty(false);
        }
    }, [isOpen]);

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
