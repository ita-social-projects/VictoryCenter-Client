import { useEffect, useMemo, useRef, useState } from 'react';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { Select } from '@/components/common/select/Select';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { getHippotherapyTranslationConfig } from '@/const/admin/hippotherapy-page';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { VisibilityStatus } from '@/types/admin/common';
import { HippotherapyPageContentModel, HippotherapyPageLocalizationBlock } from '@/types/admin/hippotherapy-page';
import { LocalizationLanguage } from '@/types/common/language';
import {
    TranslateHippotherapySectionForm,
    TranslateHippotherapySectionFormRef,
    TranslateHippotherapySectionFormValues,
} from '../translate-section-form/TranslateHippotherapySectionForm';
import './TranslateHippotherapySectionModal.scss';
import { useTranslateHippotherapySection } from '@/hooks/admin/use-translate-hippotherapy-section/useTranslateHippotherapySection';

export type HippotherapyTranslationSubBlock = 'general' | 'research';

export interface TranslateHippotherapySectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    block: HippotherapyPageLocalizationBlock | null;
    descriptionImages?: string[];
    subBlock?: HippotherapyTranslationSubBlock | null;
    targetResearchLocalId?: string | null;
    pageContent: HippotherapyPageContentModel | null;
    translatedLanguages: LocalizationLanguage[];
    onTranslate: () => void | Promise<void>;
}

const getAvailableLanguages = (languages: LocalizationLanguage[]): LocalizationLanguage[] => {
    const englishOnly = languages.filter((lang) => lang.code === 'en');
    return englishOnly.length > 0 ? englishOnly : languages;
};

const getDefaultLanguage = (languages: LocalizationLanguage[]): LocalizationLanguage | null =>
    languages.find((lang) => lang.code === 'en') ??
    languages.find((lang) => lang.code !== DEFAULT_LOCALE) ??
    languages[0] ??
    null;

export const TranslateHippotherapySectionModal = ({
    isOpen,
    onClose,
    block,
    descriptionImages,
    subBlock,
    targetResearchLocalId,
    pageContent,
    translatedLanguages,
    onTranslate,
}: TranslateHippotherapySectionModalProps) => {
    const availableLanguages = useMemo(() => getAvailableLanguages(translatedLanguages), [translatedLanguages]);

    const formRef = useRef<TranslateHippotherapySectionFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [pendingLanguageCode, setPendingLanguageCode] = useState<string | null>(null);
    const [language, setLanguage] = useState<LocalizationLanguage | null>(() => getDefaultLanguage(availableLanguages));

    useEffect(() => {
        if (!isOpen) {
            setPendingLanguageCode(null);
            return;
        }
        setLanguage(getDefaultLanguage(availableLanguages));
    }, [isOpen, availableLanguages]);

    const { translateHippotherapySection, isSubmitting, error } = useTranslateHippotherapySection({
        pageContent,
        block,
        subBlock,
        targetResearchLocalId,
        language,
        onSuccess: onTranslate,
    });

    const sectionConfig = getHippotherapyTranslationConfig(block, subBlock, pageContent);

    const handleSaveClick = () => {
        void formRef.current?.submit(VisibilityStatus.Published);
    };

    const handleSubmit = async (data: TranslateHippotherapySectionFormValues) => {
        await translateHippotherapySection(data);
    };

    const checkIsDirty = () => formRef.current?.isDirty() ?? false;

    const applyLanguageChange = (code: string) => {
        const newLanguage = availableLanguages.find((lang) => lang.code === code);
        if (newLanguage) setLanguage(newLanguage);
    };

    const handleLanguageChange = (code: string) => {
        if (checkIsDirty()) {
            setPendingLanguageCode(code);
            return;
        }
        applyLanguageChange(code);
    };

    const handleConfirmLanguageSwitch = () => {
        if (pendingLanguageCode) {
            applyLanguageChange(pendingLanguageCode);
        }
        setPendingLanguageCode(null);
    };

    const handleCancelLanguageSwitch = () => {
        setPendingLanguageCode(null);
    };

    if (!isOpen || !sectionConfig) {
        return null;
    }

    return (
        <>
            <LocalizationModal
                isOpen={isOpen}
                onClose={onClose}
                title={COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION}
                onSave={handleSaveClick}
                isSubmitting={isSubmitting}
                isFormValid={isFormValid}
                checkIsDirty={checkIsDirty}
                isDirty={isDirty}
            >
                <div className="translate-hippotherapy-section-modal-language-select">
                    {language && (
                        <Select<string>
                            headClassName="translate-hippotherapy-section-modal-language-select-head"
                            value={language.code}
                            onValueChange={handleLanguageChange}
                        >
                            {availableLanguages.map((lang) => (
                                <Select.Option key={lang.id} value={lang.code} name={lang.name} />
                            ))}
                        </Select>
                    )}
                </div>
                {error && <div className="error">{error}</div>}
                <TranslateHippotherapySectionForm
                    key={`${block}-${subBlock ?? 'default'}-${targetResearchLocalId ?? ''}-${language?.id}`}
                    ref={formRef}
                    fields={sectionConfig.fields}
                    fieldIdPrefix={`hippotherapy-translation-${sectionConfig.sectionKey}`}
                    descriptionImages={descriptionImages}
                    onSubmit={handleSubmit}
                    onValidationChange={setIsFormValid}
                    onDirtyChange={setIsDirty}
                    formDisabled={isSubmitting}
                />
            </LocalizationModal>

            <ConfirmationModal
                isOpen={!!pendingLanguageCode}
                onClose={handleCancelLanguageSwitch}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGE_LANGUAGE_UNSAVED_CHANGES}
                onConfirm={handleConfirmLanguageSwitch}
                onCancel={handleCancelLanguageSwitch}
            />
        </>
    );
};
