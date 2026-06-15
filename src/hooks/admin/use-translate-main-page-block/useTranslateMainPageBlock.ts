import axios from 'axios';
import { useState } from 'react';

import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { TranslateMainPageBlockFormValues } from '@/pages/admin/main/components/translate-main-page-block-form/TranslateMainPageBlockForm';
import { MainPageLocalizationsApi } from '@/services/api/admin/main-page/main-page-localizations-api/main-page-localizations-api';
import {
    CreateMainPageLocalizationDto,
    MainPage,
    MainPageLocalizationBlock,
    MainPageLocalizationDto,
    UpdateMainPageLocalizationDto,
} from '@/types/admin/main-page';
import { LocalizationLanguage } from '@/types/common/language';

interface UseTranslateMainPageBlockParams {
    page: MainPage | null;
    block: MainPageLocalizationBlock | null;
    language: LocalizationLanguage | null;
    onSuccess: (localization: MainPageLocalizationDto) => void | Promise<void>;
}

const getLocalizationLanguageId = (localization: { languageId?: number; language?: { id?: number } }) =>
    localization.languageId ?? localization.language?.id;

const getBlockEntityId = (page: MainPage, block: MainPageLocalizationBlock): number | null => {
    switch (block) {
        case MainPageLocalizationBlock.Title:
            return page.id ?? null;
        case MainPageLocalizationBlock.AboutUs:
            return page.mainAboutUs?.id ?? null;
        case MainPageLocalizationBlock.Partners:
            return page.mainPartners?.id ?? null;
        default:
            return null;
    }
};

const getExistingBlockValues = (
    page: MainPage,
    block: MainPageLocalizationBlock,
    language: LocalizationLanguage,
): TranslateMainPageBlockFormValues | null => {
    const languageId = language.id;

    switch (block) {
        case MainPageLocalizationBlock.Title: {
            const localization = page.localizations?.find((loc) => getLocalizationLanguageId(loc) === languageId);
            return localization
                ? {
                      title: localization.title ?? '',
                      description: localization.description ?? '',
                  }
                : null;
        }
        case MainPageLocalizationBlock.AboutUs: {
            const localization = page.mainAboutUs?.localizations?.find(
                (loc) => getLocalizationLanguageId(loc) === languageId,
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
                (loc) => getLocalizationLanguageId(loc) === languageId,
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

const resolveTitleValues = (
    page: MainPage,
    language: LocalizationLanguage,
    currentLocalization: MainPageLocalizationDto | null,
    block: MainPageLocalizationBlock,
    data: TranslateMainPageBlockFormValues,
) => {
    if (block === MainPageLocalizationBlock.Title) {
        return data;
    }

    const existingValues = getExistingBlockValues(page, MainPageLocalizationBlock.Title, language);

    return {
        title: currentLocalization?.title ?? existingValues?.title ?? null,
        description: currentLocalization?.description ?? existingValues?.description ?? null,
    };
};

const resolveNestedValues = (
    page: MainPage,
    language: LocalizationLanguage,
    currentLocalization: MainPageLocalizationDto | null,
    block: MainPageLocalizationBlock,
    targetBlock: MainPageLocalizationBlock,
    data: TranslateMainPageBlockFormValues,
) => {
    if (block === targetBlock) {
        return data;
    }

    const nestedLocalization =
        targetBlock === MainPageLocalizationBlock.AboutUs
            ? currentLocalization?.mainAboutUs
            : currentLocalization?.mainPartners;
    const existingValues = getExistingBlockValues(page, targetBlock, language);

    if (!nestedLocalization && !existingValues) {
        return null;
    }

    return {
        title: nestedLocalization?.title ?? existingValues?.title ?? null,
        description: nestedLocalization?.description ?? existingValues?.description ?? null,
    };
};

const buildCreatePayload = (
    page: MainPage,
    language: LocalizationLanguage,
    block: MainPageLocalizationBlock,
    currentLocalization: MainPageLocalizationDto | null,
    data: TranslateMainPageBlockFormValues,
): CreateMainPageLocalizationDto => {
    const titleValues = resolveTitleValues(page, language, currentLocalization, block, data);
    const aboutUsValues = resolveNestedValues(
        page,
        language,
        currentLocalization,
        block,
        MainPageLocalizationBlock.AboutUs,
        data,
    );
    const partnersValues = resolveNestedValues(
        page,
        language,
        currentLocalization,
        block,
        MainPageLocalizationBlock.Partners,
        data,
    );

    return {
        entityId: page.id!,
        languageId: language.id,
        title: titleValues.title,
        description: titleValues.description,
        mainAboutUs:
            aboutUsValues && page.mainAboutUs?.id != null
                ? {
                      entityId: page.mainAboutUs.id,
                      title: aboutUsValues.title,
                      description: aboutUsValues.description,
                  }
                : null,
        mainPartners:
            partnersValues && page.mainPartners?.id != null
                ? {
                      entityId: page.mainPartners.id,
                      title: partnersValues.title,
                      description: partnersValues.description,
                  }
                : null,
    };
};

const buildUpdatePayload = (
    page: MainPage,
    language: LocalizationLanguage,
    block: MainPageLocalizationBlock,
    currentLocalization: MainPageLocalizationDto | null,
    data: TranslateMainPageBlockFormValues,
): UpdateMainPageLocalizationDto => {
    const titleValues = resolveTitleValues(page, language, currentLocalization, block, data);
    const aboutUsValues = resolveNestedValues(
        page,
        language,
        currentLocalization,
        block,
        MainPageLocalizationBlock.AboutUs,
        data,
    );
    const partnersValues = resolveNestedValues(
        page,
        language,
        currentLocalization,
        block,
        MainPageLocalizationBlock.Partners,
        data,
    );

    return {
        title: titleValues.title,
        description: titleValues.description,
        mainAboutUs: aboutUsValues
            ? {
                  title: aboutUsValues.title,
                  description: aboutUsValues.description,
              }
            : null,
        mainPartners: partnersValues
            ? {
                  title: partnersValues.title,
                  description: partnersValues.description,
              }
            : null,
    };
};

export const useTranslateMainPageBlock = ({ page, block, language, onSuccess }: UseTranslateMainPageBlockParams) => {
    const client = useAdminClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const translateMainPageBlock = async (data: TranslateMainPageBlockFormValues) => {
        if (page?.id == null || block == null || !language) {
            return;
        }

        const entityId = getBlockEntityId(page, block);

        if (entityId == null) {
            setError(MAIN_PAGE_TEXT.ERRORS.TRANSLATION_SAVE_FAILED);
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');

            let currentLocalization: MainPageLocalizationDto | null = null;

            try {
                currentLocalization = await MainPageLocalizationsApi.getByLanguageId(client, page.id, language.id);
            } catch (currentLocalizationError) {
                if (
                    !axios.isAxiosError(currentLocalizationError) ||
                    currentLocalizationError.response?.status !== 404
                ) {
                    throw currentLocalizationError;
                }
            }

            const savedLocalization = currentLocalization
                ? await MainPageLocalizationsApi.update(
                      client,
                      page.id,
                      language.id,
                      buildUpdatePayload(page, language, block, currentLocalization, data),
                  )
                : await MainPageLocalizationsApi.create(
                      client,
                      buildCreatePayload(page, language, block, currentLocalization, data),
                  );

            await onSuccess(savedLocalization);
        } catch (saveError) {
            setError(MAIN_PAGE_TEXT.ERRORS.TRANSLATION_SAVE_FAILED);
            throw saveError;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        translateMainPageBlock,
        isSubmitting,
        error,
    };
};
