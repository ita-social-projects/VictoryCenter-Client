import { useEffect, useMemo, useRef, useState } from 'react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { ModalMode } from '@/types/admin/common';
import { EntityLocalization, LocalizationLanguage } from '@/types/common/language';

export interface TranslationFormHandle {
    submit: () => void | Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface UseTranslationModalParams<TLocalization extends EntityLocalization> {
    localizations: TLocalization[] | undefined;
    translatedLanguages: LocalizationLanguage[];
}

export const useTranslationModal = <
    TLocalization extends EntityLocalization,
    TFormRef extends TranslationFormHandle = TranslationFormHandle,
>({
    localizations,
    translatedLanguages,
}: UseTranslationModalParams<TLocalization>) => {
    const formRef = useRef<TFormRef>(null);

    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [language, setLanguage] = useState<LocalizationLanguage | null>(translatedLanguages?.[0] ?? null);

    useEffect(() => {
        if (translatedLanguages.length > 0 && !language) {
            const defaultEnglish = translatedLanguages.find((l) => l.code !== DEFAULT_LOCALE) || translatedLanguages[0];
            setLanguage(defaultEnglish);
        }
    }, [translatedLanguages, language]);

    const existingLocalization = useMemo(() => {
        if (!localizations || !language) return null;
        return localizations.find((loc) => loc.language.id === language.id) ?? null;
    }, [localizations, language]);

    const mode = existingLocalization ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;

    const modalTitle = isEditMode
        ? COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION
        : COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION;

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => formRef.current?.isDirty() ?? false;

    return {
        formRef,
        isFormValid,
        setIsFormValid,
        isDirty,
        setIsDirty,
        language,
        setLanguage,
        existingLocalization,
        mode,
        isEditMode,
        modalTitle,
        handleSaveClick,
        checkIsDirty,
    };
};
