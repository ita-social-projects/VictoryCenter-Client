import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateReportFundsExpendituresSettingsLocalizationDto,
    ReportFundsExpendituresSettingsLocalizationDto,
    UpdateReportFundsExpendituresSettingsLocalizationDto,
} from '@/types/admin/reports';
import { AxiosInstance } from 'axios';

export const ReportFundsExpendituresSettingsLocalizationsApi = {
    create: async (
        client: AxiosInstance,
        data: CreateReportFundsExpendituresSettingsLocalizationDto,
    ): Promise<ReportFundsExpendituresSettingsLocalizationDto> => {
        const response = await client.post<ReportFundsExpendituresSettingsLocalizationDto>(
            API_ROUTES.REPORT_FUNDS_EXPENDITURES_SETTINGS_LOCALIZATIONS.BASE,
            data,
        );
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdateReportFundsExpendituresSettingsLocalizationDto,
    ): Promise<ReportFundsExpendituresSettingsLocalizationDto> => {
        const response = await client.put<ReportFundsExpendituresSettingsLocalizationDto>(
            `${API_ROUTES.REPORT_FUNDS_EXPENDITURES_SETTINGS_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );
        return response.data;
    },
};
