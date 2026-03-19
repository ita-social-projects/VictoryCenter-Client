import { TranslateWhoWeAreDescriptionFormValues } from '@/pages/admin/who-we-are/components/modals/forms/translate-description-form/TranslateWhoWeAreDescriptionForm';
import { TranslateWhoWeAreMultipleDescriptionsFormValues } from '@/pages/admin/who-we-are/components/modals/forms/translate-multiple-descriptions-form/TranslateWhoWeAreMultipleDescriptionsForm';
import { TranslateWhoWeAreTitleAndDescriptionFormValues } from '@/pages/admin/who-we-are/components/modals/forms/translate-title-and-description-form/TranslateWhoWeAreTitleAndDescriptionForm';
import { WhoWeAreLocalizationsApi } from '@/services/api/admin/who-we-are/who-we-are-localizations/who-we-are-localizations-api';
import { ModalMode } from '@/types/admin/common';
import {
    ContentLocalization,
    ContentLocalizationDto,
    CreateContentLocalizationDto,
    WhoWeAreSection,
} from '@/types/admin/who-we-are';
import { LocalizationLanguage } from '@/types/common/language';
import { useState } from 'react';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import { ContentType } from '@/types/common/about-us';

interface UseTranslateWhoWeAreSectionParams {
    section: WhoWeAreSection | null;
    language: LocalizationLanguage;
    onSuccess: (updatedSection: WhoWeAreSection) => void;
    mode: ModalMode;
}

export type TranslateWhoWeAreSectionFormValues =
    | TranslateWhoWeAreDescriptionFormValues
    | TranslateWhoWeAreTitleAndDescriptionFormValues
    | TranslateWhoWeAreMultipleDescriptionsFormValues;

const mapFormValuesToPayload = (
    formValues: TranslateWhoWeAreSectionFormValues,
    section: WhoWeAreSection,
    languageId: number,
): CreateContentLocalizationDto[] => {
    const filteredContents = section.contents.filter((content) => content.contentType !== ContentType.Image);

    if ('rows' in formValues) {
        return filteredContents.map((content) => {
            const row = formValues.rows.find((item) => item.contentId === content.id);

            return {
                description: row?.description ?? null,
                title: content.title ?? null,
                entityId: content.id,
                languageId,
            };
        });
    }

    if ('title' in formValues) {
        return filteredContents.map((content) => ({
            description: formValues.description ?? null,
            title: formValues.title ?? null,
            entityId: content.id,
            languageId,
        }));
    }

    return filteredContents.map((content) => ({
        description: formValues.description ?? null,
        title: content.title ?? null,
        entityId: content.id,
        languageId,
    }));
};

export const useTranslateWhoWeAreSection = ({
    section,
    language,
    onSuccess,
    mode,
}: UseTranslateWhoWeAreSectionParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;

    const translateSection = async <TFormValues extends TranslateWhoWeAreSectionFormValues>(data: TFormValues) => {
        if (!section) return;

        try {
            setIsSubmitting(true);
            setError('');

            const localizationData = mapFormValuesToPayload(data, section, language.id);
            let localizationDto: ContentLocalizationDto[];

            if (isEditMode) {
                localizationDto = await WhoWeAreLocalizationsApi.update(
                    client,
                    section.sectionType,
                    localizationData,
                );
            } else {
                localizationDto = await WhoWeAreLocalizationsApi.create(
                    client,
                    section.sectionType,
                    localizationData,
                );
            }

            const localization = localizationDto.map((content) =>
                    mapLocalizationDtoToModel<ContentLocalizationDto, ContentLocalization>(content),
                );

                const updatedSection: WhoWeAreSection = {
                    ...section,
                    contents: section.contents.map((content) => {
                        const translatedLocalization = localization.find((item) => item.entityId === content.id);
                        const existingLocalizations = content.localizations ?? [];
                        const hasTargetLanguage = existingLocalizations.some((loc) => loc.language.id === language.id);

                        const nextLocalizations = translatedLocalization
                            ? hasTargetLanguage
                                ? existingLocalizations.map((loc) =>
                                      loc.language.id === language.id ? translatedLocalization : loc,
                                  )
                                : [...existingLocalizations, translatedLocalization]
                            : existingLocalizations;

                        return {
                            ...content,
                            localizations: nextLocalizations,
                        };
                    }),
                };

                onSuccess(updatedSection);
        } catch (err) {
            const errorMessage = isEditMode
                ? WHO_WE_ARE_TEXT.FORM?.MESSAGE?.FAIL_TO_UPDATE_TRANSLATION
                : WHO_WE_ARE_TEXT.FORM?.MESSAGE?.FAIL_TO_TRANSLATE_SECTION;
            setError(errorMessage);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = () => setError('');

    return {
        translateSection,
        isSubmitting,
        error,
        clearError,
    };
};
