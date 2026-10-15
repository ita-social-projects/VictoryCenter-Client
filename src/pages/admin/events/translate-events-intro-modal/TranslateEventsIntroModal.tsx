import { useEffect, useMemo, useState } from 'react';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { LocalizationLanguage } from '@/types/common/language';
import styles from './TranslateEventsIntroModal.module.scss';
import { EventsIntroTranslationField, TranslateEventsIntroForm } from './TranslateEventsIntroForm';

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
    }, [field, isOpen]);

    const handleClose = () => {
        setValue('');
        onClose();
    };

    return (
        <LocalizationModal
            isOpen={isOpen}
            onClose={handleClose}
            title={COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION}
            onSave={() => undefined}
            isSubmitting={false}
            isFormValid={false}
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
                <TranslateEventsIntroForm field={field} value={value} onChange={setValue} />
            </div>
        </LocalizationModal>
    );
};
