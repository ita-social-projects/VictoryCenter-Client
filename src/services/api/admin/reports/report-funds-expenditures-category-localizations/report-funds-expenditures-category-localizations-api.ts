import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateReportFundsExpendituresCategoryLocalizationDto,
    ReportFundsExpendituresCategoryLocalizationDto,
    UpdateReportFundsExpendituresCategoryLocalizationDto,
} from '@/types/admin/reports';
import { AxiosInstance } from 'axios';

export const ReportFundsExpendituresCategoryLocalizationsApi = {
    create: async (
        client: AxiosInstance,
        data: CreateReportFundsExpendituresCategoryLocalizationDto,
    ): Promise<ReportFundsExpendituresCategoryLocalizationDto> => {
        const response = await client.post<ReportFundsExpendituresCategoryLocalizationDto>(
            API_ROUTES.REPORT_FUNDS_EXPENDITURES_CATEGORY_LOCALIZATIONS.BASE,
            data,
        );
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdateReportFundsExpendituresCategoryLocalizationDto,
    ): Promise<ReportFundsExpendituresCategoryLocalizationDto> => {
        const response = await client.put<ReportFundsExpendituresCategoryLocalizationDto>(
            `${API_ROUTES.REPORT_FUNDS_EXPENDITURES_CATEGORY_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );
        return response.data;
    },
};
