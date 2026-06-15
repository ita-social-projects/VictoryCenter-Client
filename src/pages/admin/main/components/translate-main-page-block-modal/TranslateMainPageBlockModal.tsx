import { useEffect, useMemo, useRef, useState } from 'react';

import { LocalizationModal } from '@/components/admin/localization-modal/LocalizationModal';
import { TranslationControls } from '@/components/admin/translation-controls/TranslationControls';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { useTranslateMainPageBlock } from '@/hooks/admin/use-translate-main-page-block/useTranslateMainPageBlock';
import { ModalMode } from '@/types/admin/common';
import { MainPage, MainPageLocalizationBlock } from '@/types/admin/main-page';
import { LocalizationLanguage } from '@/types/common/language';
import {
    TranslateMainPageBlockForm,
    TranslateMainPageBlockFormRef,
    TranslateMainPageBlockFormValues,
    TranslateMainPageBlockValidationConfig,
} from '../translate-main-page-block-form/TranslateMainPageBlockForm';
import styles from './TranslateMainPageBlockModal.module.scss';

interface TranslateMainPageBlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    page: MainPage | null;
    block: MainPageLocalizationBlock | null;
    translatedLanguages: LocalizationLanguage[];
    onTranslated: () => void | Promise<void>;
}

const BLOCK_VALIDATION_CONFIG: Record<
    MainPageLocalizationBlock.Title | MainPageLocalizationBlock.AboutUs | MainPageLocalizationBlock.Partners,
    TranslateMainPageBlockValidationConfig
> = {
    [MainPageLocalizationBlock.Title]: {
        titleField: 'titleUa',
        descriptionField: 'descriptionUa',
        titleMaxLength: MAIN_PAGE_VALIDATION.titleBlock.title.max,
        descriptionMaxLength: MAIN_PAGE_VALIDATION.titleBlock.description.max,
    },
    [MainPageLocalizationBlock.AboutUs]: {
        titleField: 'aboutUsTitleUa',
        descriptionField: 'aboutUsDescriptionUa',
        titleMaxLength: MAIN_PAGE_VALIDATION.aboutUsBlock.title.max,
        descriptionMaxLength: MAIN_PAGE_VALIDATION.aboutUsBlock.description.max,
    },
    [MainPageLocalizationBlock.Partners]: {
        titleField: 'partnersTitleUa',
        descriptionField: 'partnersDescriptionUa',
        titleMaxLength: MAIN_PAGE_VALIDATION.partnersBlock.title.max,
        descriptionMaxLength: MAIN_PAGE_VALIDATION.partnersBlock.description.max,
    },
};

const SUPPORTED_BLOCKS = [
    MainPageLocalizationBlock.Title,
    MainPageLocalizationBlock.AboutUs,
    MainPageLocalizationBlock.Partners,
] as const;

const isSupportedBlock = (
    block: MainPageLocalizationBlock | null,
): block is MainPageLocalizationBlock.Title | MainPageLocalizationBlock.AboutUs | MainPageLocalizationBlock.Partners =>
    block != null && SUPPORTED_BLOCKS.includes(block as (typeof SUPPORTED_BLOCKS)[number]);

const getLocalizationLanguageId = (localization: { languageId?: number; language?: { id?: number } }) =>
    localization.languageId ?? localization.language?.id;

const getExistingTranslation = (
    page: MainPage | null,
    block: MainPageLocalizationBlock | null,
    language: LocalizationLanguage | null,
): TranslateMainPageBlockFormValues | null => {
    if (!page || !language || !isSupportedBlock(block)) {
        return null;
    }

    switch (block) {
        case MainPageLocalizationBlock.Title: {
            const localization = page.localizations?.find((loc) => getLocalizationLanguageId(loc) === language.id);
            return localization
                ? {
                      title: localization.title ?? '',
                      description: localization.description ?? '',
                  }
                : null;
        }
        case MainPageLocalizationBlock.AboutUs: {
            const localization = page.mainAboutUs?.localizations?.find(
                (loc) => getLocalizationLanguageId(loc) === language.id,
            );
            return localization
                ? {
                      title: localization.title ?? '',
                      description: localization.description ?? '',
                  }
                : null;
        }
        case MainPageLocalizationBlock.Partners: {
            const localization = page.mainPartners?.localizations?.find(
                (loc) => getLocalizationLanguageId(loc) === language.id,
            );
            return localization
                ? {
                      title: localization.title ?? '',
                      description: localization.description ?? '',
                  }
                : null;
        }
        default:
            return null;
    }
};

export const TranslateMainPageBlockModal = ({
    isOpen,
    onClose,
    page,
    block,
    translatedLanguages,
    onTranslated,
}: TranslateMainPageBlockModalProps) => {
    const formRef = useRef<TranslateMainPageBlockFormRef>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [language, setLanguage] = useState<LocalizationLanguage | null>(() => {
        if (!translatedLanguages.length) return null;
        return translatedLanguages.find((lang) => lang.code !== DEFAULT_LOCALE) || translatedLanguages[0];
    });

    useEffect(() => {
        if (translatedLanguages.length > 0 && !language) {
            setLanguage(translatedLanguages.find((lang) => lang.code !== DEFAULT_LOCALE) || translatedLanguages[0]);
        }
    }, [language, translatedLanguages]);

    const existingTranslation = useMemo(() => getExistingTranslation(page, block, language), [block, language, page]);

    const mode = existingTranslation ? ModalMode.Edit : ModalMode.Add;
    const isEditMode = mode === ModalMode.Edit;
    const validationConfig = isSupportedBlock(block) ? BLOCK_VALIDATION_CONFIG[block] : null;

    const { translateMainPageBlock, isSubmitting, error } = useTranslateMainPageBlock({
        page,
        block,
        language,
        onSuccess: onTranslated,
    });

    const handleSaveClick = () => {
        if (!formRef.current?.isValid()) return;
        formRef.current.submit();
    };

    const checkIsDirty = () => formRef.current?.isDirty() ?? false;

    const handleSubmit = async (data: TranslateMainPageBlockFormValues) => {
        await translateMainPageBlock(data);
    };

    if (!page || !validationConfig || !isOpen) {
        return null;
    }

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

            {error && <div className={styles.error}>{error}</div>}

            <TranslateMainPageBlockForm
                key={`${block}-${language?.id}-${mode}`}
                ref={formRef}
                initialData={existingTranslation}
                validationConfig={validationConfig}
                onSubmit={handleSubmit}
                onValidationChange={setIsFormValid}
                onDirtyChange={setIsDirty}
                formDisabled={isSubmitting}
            />
        </LocalizationModal>
    );
};
