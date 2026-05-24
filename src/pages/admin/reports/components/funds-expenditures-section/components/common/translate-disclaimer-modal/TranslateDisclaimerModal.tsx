import { useRef, useState, useEffect, useMemo } from 'react';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { useTranslateDisclaimer } from '@/hooks/admin/use-translate-disclaimer/useTranslateDisclaimer';
import { ModalMode } from '@/types/admin/common';
import { ReportFundsExpendituresSettings, ReportFundsExpendituresSettingsLocalization } from '@/types/admin/reports';
import { LocalizationLanguage } from '@/types/common/language';
import styles from './TranslateDisclaimerModal.module.scss';
import {
    TranslateDisclaimerForm,
    TranslateDisclaimerFormRef,
    TranslateDisclaimerFormValues,
} from './TranslateDisclaimerForm';

interface TranslateDisclaimerModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: ReportFundsExpendituresSettings | null;
    translationLanguages: LocalizationLanguage[];
    existingLocalization: ReportFundsExpendituresSettingsLocalization | null;
    onTranslateSuccess: (localization: ReportFundsExpendituresSettingsLocalization) => void;
}

export const TranslateDisclaimerModal = ({
    isOpen,
    onClose,
    settings,
    translationLanguages,
    existingLocalization,
    onTranslateSuccess,
}: TranslateDisclaimerModalProps) => {
    const formRef = useRef<TranslateDisclaimerFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<LocalizationLanguage | null>(null);

    useEffect(() => {
        if (!translationLanguages?.length) return;
        setSelectedLanguage(
            (prev) => prev ?? translationLanguages.find((l) => l.code !== DEFAULT_LOCALE) ?? translationLanguages[0],
        );
    }, [translationLanguages]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;

    const initialData = useMemo<TranslateDisclaimerFormValues | null>(() => {
        if (mode !== ModalMode.Edit || !existingLocalization) return null;
        return { description: existingLocalization.disclaimerTitle };
    }, [existingLocalization, mode]);

    const { translateDisclaimer, isSubmitting, error, clearError } = useTranslateDisclaimer({
        settings,
        language: selectedLanguage,
        onSuccess: (localization) => {
            onTranslateSuccess(localization);
            handleClose();
        },
        mode,
    });

    const handleClose = () => {
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

    const handleFormSubmit = async (data: TranslateDisclaimerFormValues) => {
        await translateDisclaimer(data);
    };

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={handleClose}
            title={
                mode === ModalMode.Edit
                    ? COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION
                    : FUNDS_EXPENDITURES_TEXT.MODAL.TRANSLATE_DISCLAIMER.TITLE
            }
            onSave={handleSaveClick}
            isSubmitting={isSubmitting}
            isFormValid={isFormValid}
            checkIsDirty={checkIsDirty}
            isDirty={isDirty}
        >
            <div className={styles.content}>
                <TranslationControls
                    selectedLanguage={selectedLanguage}
                    isSubmitting={isSubmitting}
                    languages={translationLanguages}
                    onLanguageChange={setSelectedLanguage}
                />
                {error && <div className={styles.error}>{error}</div>}
                <TranslateDisclaimerForm
                    ref={formRef}
                    initialData={initialData}
                    onValidationChange={setIsFormValid}
                    onSubmit={handleFormSubmit}
                    formDisabled={isSubmitting}
                    onDirtyChange={setIsDirty}
                />
            </div>
        </LocalizationModal>
    );
};
