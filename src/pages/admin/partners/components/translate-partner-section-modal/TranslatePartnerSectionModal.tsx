import { useEffect, useMemo, useRef, useState } from 'react';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import {
    TranslatePartnerSectionFormValues,
    useTranslatePartnerSection,
} from '@/hooks/admin/use-translate-partner-section/useTranslatePartnerSection';
import { PartnerSection } from '@/types/admin/partners';
import { LocalizationLanguage } from '@/types/common/language';
import {
    TranslatePartnerSectionForm,
    TranslatePartnerSectionFormRef,
} from '../translate-partner-section-form/TranslatePartnerSectionForm';
import styles from './TranslatePartnerSectionModal.module.scss';

interface TranslatePartnerSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    section: PartnerSection | null;
    translatedLanguages: LocalizationLanguage[];
    onTranslated: () => void;
}

export const TranslatePartnerSectionModal = ({
    isOpen,
    onClose,
    section,
    translatedLanguages,
    onTranslated,
}: TranslatePartnerSectionModalProps) => {
    const formRef = useRef<TranslatePartnerSectionFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const [language, setLanguage] = useState<LocalizationLanguage | null>(() => {
        if (!translatedLanguages?.length) return null;
        return translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) || translatedLanguages[0];
    });

    useEffect(() => {
        if (language || !translatedLanguages?.length) return;
        setLanguage(translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) || translatedLanguages[0]);
    }, [translatedLanguages, language]);

    const {
        translateSection,
        isSubmitting,
        error,
        isEditMode,
        existingTranslation,
        isLoadingTranslation,
        translationFetchError,
    } = useTranslatePartnerSection({
        section,
        language,
        isOpen,
        onSuccess: () => {
            onTranslated();
            onClose();
        },
    });

    const initialData = useMemo<TranslatePartnerSectionFormValues | null>(() => {
        if (!section || isLoadingTranslation) return null;

        return {
            title: existingTranslation?.title ?? '',
            description: existingTranslation?.description ?? '',
            partners: section.partners.map((partner) => ({
                partnerId: partner.id,
                description:
                    existingTranslation?.partners.find((translated) => translated.partnerId === partner.id)
                        ?.description ?? '',
            })),
        };
    }, [section, existingTranslation, isLoadingTranslation]);

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => {
        return formRef.current?.isDirty() ?? false;
    };

    const handleFormSubmit = async (data: TranslatePartnerSectionFormValues) => {
        await translateSection(data);
    };

    if (!section) return null;

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
            maxWidth="1200px"
        >
            <TranslationControls
                selectedLanguage={language}
                isSubmitting={isSubmitting}
                languages={translatedLanguages}
                onLanguageChange={setLanguage}
            />

            {error && <div className={styles.error}>{error}</div>}

            {translationFetchError ? (
                <div className={styles.error}>{translationFetchError}</div>
            ) : isLoadingTranslation || !initialData ? (
                <div className={styles.loader}>
                    <InlineLoader size={2} />
                </div>
            ) : (
                <TranslatePartnerSectionForm
                    ref={formRef}
                    partners={section.partners}
                    initialData={initialData}
                    onValidationChange={setIsFormValid}
                    onSubmit={handleFormSubmit}
                    formDisabled={isSubmitting}
                    onDirtyChange={setIsDirty}
                />
            )}
        </LocalizationModal>
    );
};
