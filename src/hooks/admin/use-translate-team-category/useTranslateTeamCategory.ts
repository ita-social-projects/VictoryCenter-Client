import { ModalMode } from '@/types/admin/common';
import { TeamCategory } from '@/types/admin/team-category';
import { LocalizationLanguage } from '@/types/common/language';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { useState } from 'react';
import { TeamCategoryLocalizationApi } from '@/services/api/admin/team/team-category-localizations/team-category-localizations-api';
import { FaqLocalization } from '@/types/admin/faq';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { TEAM_CATEGORY_TEXT } from '@/const/admin/team';
import { TranslateTeamCategoryFormValues } from '@/pages/admin/team/components/translate-team-category-form/TranslateTeamCategoryForm';

interface UseTranslateTeamCategoryParams {
    teamCategory: TeamCategory | null;
    language: LocalizationLanguage;
    onSuccess: (updatedMember: TeamCategory) => void;
    mode: ModalMode;
}

export const useTranslateTeamCategory = ({
    teamCategory,
    language,
    onSuccess,
    mode,
}: UseTranslateTeamCategoryParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;

    const translateTeamCategory = async (data: TranslateTeamCategoryFormValues) => {
        if (!teamCategory) return;

        try {
            setIsSubmitting(true);
            setError('');

            if (isEditMode) {
                const updatedLocalizationDto = await TeamCategoryLocalizationApi.update(
                    client,
                    teamCategory.id,
                    language.id,
                    {
                        name: data.name,
                        description: data.description,
                    },
                );

                const updatedLocalization = mapLocalizationDtoToModel<typeof updatedLocalizationDto, FaqLocalization>(
                    updatedLocalizationDto,
                );

                const updatedTeamCategory: TeamCategory = {
                    ...teamCategory,
                    localizations:
                        teamCategory.localizations?.map((loc) =>
                            loc.language.id === language.id ? updatedLocalization : loc,
                        ) || [],
                };
                onSuccess(updatedTeamCategory);
            } else {
                const createdLocalizationDto = await TeamCategoryLocalizationApi.create(client, {
                    entityId: teamCategory.id,
                    languageId: language.id,
                    name: data.name,
                    description: data.description,
                });

                const createdLocalization = mapLocalizationDtoToModel<typeof createdLocalizationDto, FaqLocalization>(
                    createdLocalizationDto,
                );

                const createdTeamCategory: TeamCategory = {
                    ...teamCategory,
                    localizations: [...(teamCategory.localizations || []), createdLocalization],
                };
                onSuccess(createdTeamCategory);
            }
        } catch (err) {
            const errorMessage = isEditMode
                ? TEAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_TRANSLATION_FOR_TEAM_CATEGORY
                : TEAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_TRANSLATE_TEAM_CATEGORY;
            setError(errorMessage);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };
    const clearError = () => setError('');

    return {
        translateTeamCategory,
        isSubmitting,
        error,
        clearError,
    };
};
