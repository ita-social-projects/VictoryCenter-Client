import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
    ReportFundsExpendituresSettings,
} from '@/types/admin/reports';
import {
    MOCK_FUNDS_EXPENDITURES_CATEGORIES,
    MOCK_FUNDS_EXPENDITURES_RECORDS,
    MOCK_FUNDS_EXPENDITURES_SETTINGS,
} from '@/utils/mock-data/admin/funds-expenditures-mock';
import { AxiosInstance } from 'axios';

export const FundsExpendituresApi = {
    getSettings: async (_client: AxiosInstance): Promise<ReportFundsExpendituresSettings> => {
        /// TODO: replace with real API call

        void API_ROUTES.REPORTS.FUNDS_EXPENDITURES.SETTINGS;
        return Promise.resolve(MOCK_FUNDS_EXPENDITURES_SETTINGS);
    },

    getCategories: async (_client: AxiosInstance): Promise<ReportFundsExpendituresCategory[]> => {
        // TODO: replace with real API call

        void API_ROUTES.REPORTS.FUNDS_EXPENDITURES.CATEGORIES;
        return Promise.resolve(MOCK_FUNDS_EXPENDITURES_CATEGORIES);
    },

    getPublishedRecords: async (_client: AxiosInstance): Promise<ReportFundsExpendituresRecord[]> => {
        // TODO: replace with real API call

        void API_ROUTES.REPORTS.FUNDS_EXPENDITURES.RECORDS;
        return Promise.resolve(MOCK_FUNDS_EXPENDITURES_RECORDS);
    },
};
