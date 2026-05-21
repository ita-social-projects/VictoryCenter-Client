import { useEffect, useMemo, useRef, useState } from 'react';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { useTranslateReportsCategory } from '@/hooks/admin/use-translate-reports-category/useTranslateReportsCategory';
import { ModalMode } from '@/types/admin/common';
import { ReportFundsExpendituresCategory } from '@/types/admin/reports';
import { LocalizationLanguage } from '@/types/common/language';
import styles from './TranslateReportsCategoryModal.module.scss';
import {
    TranslateReportsCategoryForm,
    TranslateReportsCategoryFormRef,
    TranslateReportsCategoryFormValues,
} from './TranslateReportsCategoryForm';

interface TranslateReportsCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: ReportFundsExpendituresCategory[];
    translatedLanguages: LocalizationLanguage[];
    onTranslateCategory: (updatedCategory: ReportFundsExpendituresCategory) => void;
}

export const TranslateReportsCategoryModal = ({
    isOpen,
    onClose,
    categories,
    translatedLanguages,
    onTranslateCategory,
}: TranslateReportsCategoryModalProps) => {
    const formRef = useRef<TranslateReportsCategoryFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ReportFundsExpendituresCategory | null>(null);

    const [language, setLanguage] = useState<LocalizationLanguage | null>(null);

    useEffect(() => {
        if (!translatedLanguages?.length) return;
        setLanguage(
            (prev) => prev ?? translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) ?? translatedLanguages[0],
        );
    }, [translatedLanguages]);

    const existingLocalization = useMemo(() => {
        if (!selectedCategory?.localizations || !language) return null;
        return selectedCategory.localizations.find((loc) => loc.language.id === language.id) ?? null;
    }, [selectedCategory, language]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;

    const initialData = useMemo<TranslateReportsCategoryFormValues | null>(() => {
        if (mode !== ModalMode.Edit || !existingLocalization) return null;
        return { name: existingLocalization.name };
    }, [existingLocalization, mode]);

    const { translateCategory, isSubmitting, error, clearError } = useTranslateReportsCategory({
        category: selectedCategory,
        language,
        onSuccess: (updated) => {
            onTranslateCategory(updated);
            handleClose();
        },
        mode,
    });

    const handleClose = () => {
        setSelectedCategory(null);
        setIsFormValid(false);
        setIsDirty(false);
        clearError();
        onClose();
    };

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => formRef.current?.isDirty() ?? false;

    const handleFormSubmit = async (data: TranslateReportsCategoryFormValues) => {
        await translateCategory(data);
    };

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={handleClose}
            title={FUNDS_EXPENDITURES_TEXT.MODAL.TRANSLATE_CATEGORY.TITLE}
            onSave={handleSaveClick}
            isSubmitting={isSubmitting}
            isFormValid={isFormValid}
            checkIsDirty={checkIsDirty}
            isDirty={isDirty}
        >
            <div className={styles.content}>
                <TranslationControls
                    selectedLanguage={language}
                    isSubmitting={isSubmitting}
                    languages={translatedLanguages}
                    onLanguageChange={setLanguage}
                />
                {error && <div className={styles.error}>{error}</div>}
                <TranslateReportsCategoryForm
                    ref={formRef}
                    categories={categories}
                    initialData={initialData}
                    onCategoryChange={setSelectedCategory}
                    onValidationChange={setIsFormValid}
                    onSubmit={handleFormSubmit}
                    formDisabled={isSubmitting}
                    onDirtyChange={setIsDirty}
                />
            </div>
        </LocalizationModal>
    );
};
