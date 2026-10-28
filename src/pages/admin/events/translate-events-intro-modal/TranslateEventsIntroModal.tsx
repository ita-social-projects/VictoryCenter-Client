import { useCallback, useEffect, useMemo, useState } from 'react';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { LocalizationLanguage } from '@/types/common/language';
import { EventsIntroSectionDto, EventsIntroSectionLocalizationDto } from '@/types/admin/events';
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
    onSaveSuccess: (localization: EventsIntroSectionLocalizationDto) => void;
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
    const client = useAdminClient();

    const availableLanguages = useMemo(
        () => translationLanguages.filter((language) => language.code === 'en'),
        [translationLanguages],
    );
    const [selectedLanguage, setSelectedLanguage] = useState<LocalizationLanguage | null>(null);
    const existingLocalization = useMemo(
        () =>
            (introSection.localizations ?? []).find(
                (localization) => localization.language.code === selectedLanguage?.code,
            ),
        [introSection.localizations, selectedLanguage?.code],
    );
    const initialValue = existingLocalization?.[field] ?? '';

    useEffect(() => {
        if (isOpen) {
            setSelectedLanguage(availableLanguages[0] ?? null);
        }
    }, [availableLanguages, isOpen]);

    useEffect(() => {
        setValue(initialValue);
        setValidationError(undefined);
        setSaveError('');
    }, [field, initialValue, isOpen]);

    const validationRule = getEventsIntroTranslationFieldConfig(field).validationRule;
    const handleChange = useCallback(
        (nextValue: string) => {
            setValue(nextValue);

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
        setIsSubmitting(true);
        setSaveError('');
        try {
            const savedLocalization = existingLocalization
                ? await EventsIntroSectionLocalizationsApi.update(client, introSection.id, selectedLanguage.id, payload)
                : await EventsIntroSectionLocalizationsApi.create(client, {
                      entityId: introSection.id,
                      languageId: selectedLanguage.id,
                      ...payload,
                  });

            onSaveSuccess(savedLocalization);
            closeModal();
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
            isDirty={value !== initialValue}
            checkIsDirty={() => value !== initialValue}
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
                {saveError && <div className={styles['translate-events-intro-modal-error']}>{saveError}</div>}
            </div>
        </LocalizationModal>
    );
};
