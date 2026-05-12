import { useState } from 'react';
import { ModalMode } from '@/types/admin/common';
import { ReportFundsExpendituresCategory, ReportFundsExpendituresCategoryLocalization } from '@/types/admin/reports';
import { LocalizationLanguage } from '@/types/common/language';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { ReportFundsExpendituresCategoryLocalizationsApi } from '@/services/api/admin/reports/report-funds-expenditures-category-localizations/report-funds-expenditures-category-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { TranslateReportsCategoryFormValues } from '@/pages/admin/reports/components/funds-expenditures-section/components/common/translate-reports-category-modal/TranslateReportsCategoryForm';

interface UseTranslateReportsCategoryParams {
    category: ReportFundsExpendituresCategory | null;
    language: LocalizationLanguage | null;
    onSuccess: (updatedCategory: ReportFundsExpendituresCategory) => void;
    mode: ModalMode;
}

export const useTranslateReportsCategory = ({
    category,
    language,
    onSuccess,
    mode,
}: UseTranslateReportsCategoryParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;

    const translateCategory = async (data: TranslateReportsCategoryFormValues) => {
        if (!category || !language) return;

        try {
            setIsSubmitting(true);
            setError('');

            if (isEditMode) {
                const updatedDto = await ReportFundsExpendituresCategoryLocalizationsApi.update(
                    client,
                    category.id,
                    language.id,
                    { name: data.name },
                );

                const updatedLocalization = mapLocalizationDtoToModel<
                    typeof updatedDto,
                    ReportFundsExpendituresCategoryLocalization
                >(updatedDto);

                const updatedCategory: ReportFundsExpendituresCategory = {
                    ...category,
                    localizations: category.localizations.map((loc) =>
                        loc.language.id === language.id ? updatedLocalization : loc,
                    ),
                };
                onSuccess(updatedCategory);
            } else {
                const createdDto = await ReportFundsExpendituresCategoryLocalizationsApi.create(client, {
                    entityId: category.id,
                    languageId: language.id,
                    name: data.name,
                });

                const createdLocalization = mapLocalizationDtoToModel<
                    typeof createdDto,
                    ReportFundsExpendituresCategoryLocalization
                >(createdDto);

                const updatedCategory: ReportFundsExpendituresCategory = {
                    ...category,
                    localizations: [...category.localizations, createdLocalization],
                };
                onSuccess(updatedCategory);
            }
        } catch {
            setError(
                isEditMode
                    ? FUNDS_EXPENDITURES_TEXT.MESSAGE.FAIL_TO_UPDATE_CATEGORY_TRANSLATION
                    : FUNDS_EXPENDITURES_TEXT.MESSAGE.FAIL_TO_TRANSLATE_CATEGORY,
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = () => setError('');

    return { translateCategory, isSubmitting, error, clearError };
};
