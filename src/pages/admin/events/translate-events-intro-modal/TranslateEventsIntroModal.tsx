import { useCallback, useEffect, useMemo, useState } from 'react';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { LocalizationLanguage } from '@/types/common/language';
import { EventsIntroSectionDto } from '@/types/admin/events';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { EventsIntroSectionLocalizationsApi } from '@/services/api/admin/events/events-intro-section-localizations/events-intro-section-localizations-api';
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
    introSection: EventsIntroSectionDto;
    translationLanguages: LocalizationLanguage[];
    onClose: () => void;
    onSaveSuccess: () => Promise<boolean>;
}

export const TranslateEventsIntroModal = ({
    isOpen,
    field,
    introSection,
    translationLanguages,
    onClose,
    onSaveSuccess,
}: TranslateEventsIntroModalProps) => {
    const [value, setValue] = useState('');
    const [validationError, setValidationError] = useState<string>();
    const [saveError, setSaveError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTranslationSaved, setIsTranslationSaved] = useState(false);
    const client = useAdminClient();

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
        setSaveError('');
        setIsTranslationSaved(false);
    }, [field, isOpen]);

    const validationRule = getEventsIntroTranslationFieldConfig(field).validationRule;
    const handleChange = useCallback(
        (nextValue: string) => {
            setValue(nextValue);
            setIsTranslationSaved(false);

            if (validationError) {
                setValidationError(undefined);
            }
            if (saveError) {
                setSaveError('');
            }
        },
        [saveError, validationError],
    );
    const handleBlur = useCallback(() => {
        const normalizedValue = getNormalizedInputText(value);

        setValue(normalizedValue);
        setValidationError(getEventsPageTextValidationError(normalizedValue, validationRule));
    }, [value, validationRule]);
    const closeModal = () => {
        setValue('');
        setValidationError(undefined);
        setSaveError('');
        setIsTranslationSaved(false);
        onClose();
    };
    const handleClose = () => {
        if (!isSubmitting) closeModal();
    };
    const handleSave = async () => {
        const normalizedValue = getNormalizedInputText(value);
        const error = getEventsPageTextValidationError(normalizedValue, validationRule);

        setValue(normalizedValue);
        setValidationError(error);
        if (error || !selectedLanguage) return;

        const payload = { [field]: normalizedValue };
        const existingLocalization = (introSection.localizations ?? []).find(
            (localization) => localization.language.code === selectedLanguage.code,
        );

        setIsSubmitting(true);
        setSaveError('');
        try {
            if (!isTranslationSaved) {
                if (existingLocalization) {
                    await EventsIntroSectionLocalizationsApi.update(
                        client,
                        introSection.id,
                        selectedLanguage.id,
                        payload,
                    );
                } else {
                    await EventsIntroSectionLocalizationsApi.create(client, {
                        entityId: introSection.id,
                        languageId: selectedLanguage.id,
                        ...payload,
                    });
                }

                setIsTranslationSaved(true);
            }

            const isIntroSectionRefreshed = await onSaveSuccess();

            if (isIntroSectionRefreshed) {
                closeModal();
            } else {
                setSaveError(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_FETCH_DATA);
            }
        } catch {
            setSaveError(COMMON_TEXT_ADMIN.MESSAGE.ERROR_TRY_AGAIN);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = Boolean(selectedLanguage) && !getEventsPageTextValidationError(value, validationRule);
    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={handleClose}
            title={COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION}
            onSave={handleSave}
            isSubmitting={isSubmitting}
            isFormValid={isFormValid}
            isDirty={Boolean(value)}
            checkIsDirty={() => Boolean(value)}
            maxWidth="594px"
            modalClassName={styles['translate-events-intro-modal']}
        >
            <div className={styles['translate-events-intro-modal-content']}>
                <TranslationControls
                    isSubmitting={isSubmitting}
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
                    disabled={isSubmitting}
                />
                {saveError && <div className="error-message">{saveError}</div>}
            </div>
        </LocalizationModal>
    );
};
