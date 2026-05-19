import { useRef, useState } from 'react';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
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
    translationLanguages: LocalizationLanguage[];
}

export const TranslateDisclaimerModal = ({ isOpen, onClose, translationLanguages }: TranslateDisclaimerModalProps) => {
    const formRef = useRef<TranslateDisclaimerFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<LocalizationLanguage | null>(
        translationLanguages[0] ?? null,
    );

    const handleClose = () => {
        setIsFormValid(false);
        setIsDirty(false);
        onClose();
    };

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => formRef.current?.isDirty() ?? false;

    const handleFormSubmit = async (_data: TranslateDisclaimerFormValues) => {};

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={handleClose}
            title={FUNDS_EXPENDITURES_TEXT.MODAL.TRANSLATE_DISCLAIMER.TITLE}
            onSave={handleSaveClick}
            isSubmitting={false}
            isFormValid={isFormValid}
            checkIsDirty={checkIsDirty}
            isDirty={isDirty}
        >
            <div className={styles.content}>
                <TranslationControls
                    selectedLanguage={selectedLanguage}
                    isSubmitting={false}
                    languages={translationLanguages}
                    onLanguageChange={setSelectedLanguage}
                />
                <TranslateDisclaimerForm
                    ref={formRef}
                    initialData={null}
                    onValidationChange={setIsFormValid}
                    onSubmit={handleFormSubmit}
                    formDisabled={false}
                    onDirtyChange={setIsDirty}
                />
            </div>
        </LocalizationModal>
    );
};
