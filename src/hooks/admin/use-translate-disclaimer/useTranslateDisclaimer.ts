import { useState } from 'react';
import { ModalMode } from '@/types/admin/common';
import { ReportFundsExpendituresSettings, ReportFundsExpendituresSettingsLocalization } from '@/types/admin/reports';
import { LocalizationLanguage } from '@/types/common/language';
import { useAdminClient } from '../use-admin-client/useAdminClient';
import { ReportFundsExpendituresSettingsLocalizationsApi } from '@/services/api/admin/reports/report-funds-expenditures-settings-localizations/report-funds-expenditures-settings-localizations-api';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { TranslateDisclaimerFormValues } from '@/pages/admin/reports/components/funds-expenditures-section/components/common/translate-disclaimer-modal/TranslateDisclaimerForm';

interface UseTranslateDisclaimerParams {
    settings: ReportFundsExpendituresSettings | null;
    language: LocalizationLanguage | null;
    onSuccess: (localization: ReportFundsExpendituresSettingsLocalization) => void;
    mode: ModalMode;
}

export const useTranslateDisclaimer = ({ settings, language, onSuccess, mode }: UseTranslateDisclaimerParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const client = useAdminClient();
    const isEditMode = mode === ModalMode.Edit;

    const translateDisclaimer = async (data: TranslateDisclaimerFormValues) => {
        if (!settings || !language) return;

        try {
            setIsSubmitting(true);
            setError('');

            if (isEditMode) {
                const updatedDto = await ReportFundsExpendituresSettingsLocalizationsApi.update(
                    client,
                    settings.id,
                    language.id,
                    { disclaimerTitle: data.description },
                );
                onSuccess(
                    mapLocalizationDtoToModel<typeof updatedDto, ReportFundsExpendituresSettingsLocalization>(
                        updatedDto,
                    ),
                );
            } else {
                const createdDto = await ReportFundsExpendituresSettingsLocalizationsApi.create(client, {
                    entityId: settings.id,
                    languageId: language.id,
                    disclaimerTitle: data.description,
                });
                onSuccess(
                    mapLocalizationDtoToModel<typeof createdDto, ReportFundsExpendituresSettingsLocalization>(
                        createdDto,
                    ),
                );
            }
        } catch {
            setError(
                isEditMode
                    ? FUNDS_EXPENDITURES_TEXT.MODAL.TRANSLATE_DISCLAIMER.FAIL_TO_UPDATE_TRANSLATION
                    : FUNDS_EXPENDITURES_TEXT.MODAL.TRANSLATE_DISCLAIMER.FAIL_TO_TRANSLATE,
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearError = () => setError('');

    return { translateDisclaimer, isSubmitting, error, clearError };
};
