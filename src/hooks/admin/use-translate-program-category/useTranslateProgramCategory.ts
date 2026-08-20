import { useState } from 'react';
import { PROGRAM_CATEGORY_TEXT } from '@/const/admin/programs';
import { ProgramCategoryLocalizationsApi } from '@/services/api/admin/programs/program-category-localizations/program-category-localizations-api';
import { ProgramCategory, ProgramCategoryLocalization } from '@/types/admin/programs';
import { ModalMode } from '@/types/admin/common';
import { LocalizationLanguage } from '@/types/common/language';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { TranslateProgramCategoryFormValues } from '@/pages/admin/programs/components/translate-program-category-form/TranslateProgramCategoryForm';

interface UseTranslateProgramCategoryParams {
    category: ProgramCategory | null;
    language: LocalizationLanguage | null;
    onSuccess: (updatedCategory: ProgramCategory) => void;
    mode: ModalMode;
}

export const useTranslateProgramCategory = ({
    category,
    language,
    onSuccess,
    mode,
}: UseTranslateProgramCategoryParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;

    const translateProgramCategory = async (data: TranslateProgramCategoryFormValues) => {
        if (!category || !language) return;

        try {
            setIsSubmitting(true);
            setError('');

            if (isEditMode) {
                const updatedLocalizationDto = await ProgramCategoryLocalizationsApi.update(
                    client,
                    category.id,
                    language.id,
                    {
                        name: data.name,
                    },
                );

                const updatedLocalization = mapLocalizationDtoToModel<
                    typeof updatedLocalizationDto,
                    ProgramCategoryLocalization
                >(updatedLocalizationDto);

                const updatedCategory: ProgramCategory = {
                    ...category,
                    localizations: category.localizations?.map((loc) =>
                        loc.language.id === language.id ? updatedLocalization : loc,
                    ) || [updatedLocalization],
                };
                onSuccess(updatedCategory);
            } else {
                const createdLocalizationDto = await ProgramCategoryLocalizationsApi.create(client, {
                    entityId: category.id,
                    languageId: language.id,
                    name: data.name,
                });

                const createdLocalization = mapLocalizationDtoToModel<
                    typeof createdLocalizationDto,
                    ProgramCategoryLocalization
                >(createdLocalizationDto);

                const createdCategory: ProgramCategory = {
                    ...category,
                    localizations: [...(category.localizations || []), createdLocalization],
                };

                onSuccess(createdCategory);
            }
        } catch (err) {
            const errorMessage = isEditMode
                ? PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_TRANSLATION_FOR_PROGRAM_CATEGORY
                : PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_TRANSLATE_PROGRAM_CATEGORY;
            setError(errorMessage);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = () => setError('');

    return {
        translateProgramCategory,
        isSubmitting,
        error,
        clearError,
    };
};
