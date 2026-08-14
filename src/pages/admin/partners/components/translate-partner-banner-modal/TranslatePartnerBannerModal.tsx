import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { useTranslatePartnerBanner } from '@/hooks/admin/use-translate-partner-banner/useTranslatePartnerBanner';
import { ModalMode } from '@/types/admin/common';
import { PartnerBanner } from '@/types/admin/partners';
import { LocalizationLanguage } from '@/types/common/language';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    TranslatePartnerBannerForm,
    TranslatePartnerBannerFormRef,
    TranslatePartnerBannerFormValues,
} from '../translate-partner-banner-form/TranslatePartnerBannerForm';

interface TranslatePartnerBannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    banner: PartnerBanner | null;
    onTranslateBanner: (banner: PartnerBanner) => void;
    translatedLanguages: LocalizationLanguage[];
}

export const TranslatePartnerBannerModal = ({
    isOpen,
    onClose,
    banner,
    onTranslateBanner,
    translatedLanguages,
}: TranslatePartnerBannerModalProps) => {
    const formRef = useRef<TranslatePartnerBannerFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const [language, setLanguage] = useState<LocalizationLanguage | null>(() => {
        if (!translatedLanguages?.length) return null;
        return translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) ?? translatedLanguages[0];
    });

    useEffect(() => {
        if (language || !translatedLanguages?.length) return;
        setLanguage(translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) || translatedLanguages[0]);
    }, [translatedLanguages, language]);

    const existingLocalization = useMemo(() => {
        if (!banner?.localizations || !language) return null;
        return banner.localizations.find((loc) => loc.language.id === language.id);
    }, [banner, language]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;

    const initialData = useMemo<TranslatePartnerBannerFormValues | null>(() => {
        if (!isEditMode || !existingLocalization) return null;

        return {
            title: existingLocalization.title,
            description: existingLocalization.description,
        };
    }, [existingLocalization, isEditMode]);

    const { translateBanner, isSubmitting, error } = useTranslatePartnerBanner({
        banner,
        language,
        onSuccess: (updatedBanner) => {
            onTranslateBanner(updatedBanner);
            onClose();
        },
        mode,
    });

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => {
        return formRef.current?.isDirty() ?? false;
    };

    const handleFormSubmit = async (data: TranslatePartnerBannerFormValues) => {
        await translateBanner(data);
    };

    if (!banner) return null;

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
        >
            <TranslationControls
                selectedLanguage={language}
                isSubmitting={isSubmitting}
                languages={translatedLanguages}
                onLanguageChange={setLanguage}
            />
            {error && <div className="translate-partner-banner-error">{error}</div>}
            <TranslatePartnerBannerForm
                ref={formRef}
                initialData={initialData}
                onValidationChange={setIsFormValid}
                onSubmit={handleFormSubmit}
                formDisabled={isSubmitting}
                onDirtyChange={setIsDirty}
            />
        </LocalizationModal>
    );
};
