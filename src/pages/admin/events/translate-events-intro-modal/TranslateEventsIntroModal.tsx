import { useCallback, useEffect, useMemo, useState } from 'react';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { LocalizationLanguage } from '@/types/common/language';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { getEventsPageTextValidationError } from '@/validation/admin/events-page-schema/events-page-schema';
import styles from './TranslateEventsIntroModal.module.scss';
import {
    EventsIntroTranslationField,
    getEventsIntroTranslationFieldConfig,
    TranslateEventsIntroForm,
} from './TranslateEventsIntroForm';

interface TranslateEventsIntroModalProps {
    isOpen: boolean;
    field: EventsIntroTranslationField;
    translationLanguages: LocalizationLanguage[];
    onClose: () => void;
}

export const TranslateEventsIntroModal = ({
    isOpen,
    field,
    translationLanguages,
    onClose,
}: TranslateEventsIntroModalProps) => {
    const [value, setValue] = useState('');
    const [validationError, setValidationError] = useState<string>();

    const availableLanguages = useMemo(
        () => translationLanguages.filter((language) => language.code === 'en'),
        [translationLanguages],
    );
    const [selectedLanguage, setSelectedLanguage] = useState<LocalizationLanguage | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedLanguage(availableLanguages[0] ?? null);
        }
    }, [availableLanguages, isOpen]);

    useEffect(() => {
        setValue('');
        setValidationError(undefined);
    }, [field, isOpen]);

    const validationRule = getEventsIntroTranslationFieldConfig(field).validationRule;
    const handleChange = useCallback(
        (nextValue: string) => {
            setValue(nextValue);

            if (validationError) {
                setValidationError(getEventsPageTextValidationError(nextValue, validationRule));
            }
        },
        [validationError, validationRule],
    );
    const handleBlur = useCallback(() => {
        const normalizedValue = getNormalizedInputText(value);

        setValue(normalizedValue);
        setValidationError(getEventsPageTextValidationError(normalizedValue, validationRule));
    }, [value, validationRule]);
    const handleClose = () => {
        setValue('');
        setValidationError(undefined);
        onClose();
    };
    const handleSave = () => {
        // API persistence will be connected after the translation contract is finalized.
    };
    const isFormValid = !getEventsPageTextValidationError(value, validationRule);

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={handleClose}
            title={COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION}
            onSave={handleSave}
            isSubmitting={false}
            isFormValid={isFormValid}
            isDirty={Boolean(value)}
            checkIsDirty={() => Boolean(value)}
            maxWidth="594px"
            modalClassName={styles['translate-events-intro-modal']}
        >
            <div className={styles['translate-events-intro-modal-content']}>
                <TranslationControls
                    isSubmitting={false}
                    languages={availableLanguages}
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                />
                <TranslateEventsIntroForm
                    field={field}
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={validationError}
                />
            </div>
        </LocalizationModal>
    );
};
