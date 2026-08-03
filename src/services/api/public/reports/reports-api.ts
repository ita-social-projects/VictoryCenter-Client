import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { PublishedReportFundsExpendituresDto } from '@/types/public/reports';
import { RequestOptions } from '@/types/common/api';
import { axiosInstance } from '@/services/api/axios';

export const ReportsPublicApi = {
    getPublishedReports: async (
        languageId?: number,
        options: RequestOptions = {},
    ): Promise<PublishedReportFundsExpendituresDto> => {
        const response = await axiosInstance.get<PublishedReportFundsExpendituresDto>(
            API_ROUTES.REPORTS.FUNDS_EXPENDITURES.PUBLIC,
            {
                params: { languageId },
                signal: options.cancellationSignal,
            },
        );

        return response.data;
    },
};
