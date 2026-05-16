import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    FundsExpendituresSummary,
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
    ReportFundsExpendituresSettings,
    ReportFundsExpendituresCategoryDto,
    ReportFundsExpendituresRecordDto,
    ReportFundsExpendituresSettingsDto,
    ReportFundsExpendituresSummaryDto,
} from '@/types/admin/reports';
import { RequestOptions } from '@/types/common/api';
import {
    mapReportFundsExpendituresCategoryDtoToCategory,
    mapReportFundsExpendituresCategoryToCreateDto,
    mapReportFundsExpendituresCategoryToUpdateDto,
    mapReportFundsExpendituresRecordDtoToRecord,
    mapReportFundsExpendituresRecordToCreateDto,
    mapReportFundsExpendituresRecordToUpdateDto,
    mapReportFundsExpendituresSettingsDtoToSettings,
    mapReportFundsExpendituresSettingsToUpdateDto,
    mapReportFundsExpendituresSummaryDtoToSummary,
} from '@/utils/functions/mappers/admin/reports-mapper/reports-mapper';
import { AxiosInstance } from 'axios';

export const FundsExpendituresApi = {
    getSettings: async (
        client: AxiosInstance,
        options: RequestOptions = {},
    ): Promise<ReportFundsExpendituresSettings> => {
        const response = await client.get<ReportFundsExpendituresSettingsDto>(
            API_ROUTES.REPORTS.FUNDS_EXPENDITURES.SETTINGS,
            {
                signal: options.cancellationSignal,
            },
        );

        return mapReportFundsExpendituresSettingsDtoToSettings(response.data);
    },

    updateSettings: async (
        client: AxiosInstance,
        settings: Pick<ReportFundsExpendituresSettings, 'disclaimerTitle' | 'exchangeRate'>,
    ): Promise<ReportFundsExpendituresSettings> => {
        const response = await client.put<ReportFundsExpendituresSettingsDto>(
            API_ROUTES.REPORTS.FUNDS_EXPENDITURES.SETTINGS,
            mapReportFundsExpendituresSettingsToUpdateDto(settings),
        );

        return mapReportFundsExpendituresSettingsDtoToSettings(response.data);
    },

    getCategories: async (
        client: AxiosInstance,
        options: RequestOptions = {},
    ): Promise<ReportFundsExpendituresCategory[]> => {
        const response = await client.get<ReportFundsExpendituresCategoryDto[]>(
            API_ROUTES.REPORTS.FUNDS_EXPENDITURES.CATEGORIES,
            {
                signal: options.cancellationSignal,
            },
        );

        return response.data.map(mapReportFundsExpendituresCategoryDtoToCategory);
    },

    createCategory: async (
        client: AxiosInstance,
        category: Pick<ReportFundsExpendituresCategory, 'name' | 'type'>,
    ): Promise<ReportFundsExpendituresCategory> => {
        const response = await client.post<ReportFundsExpendituresCategoryDto>(
            API_ROUTES.REPORTS.FUNDS_EXPENDITURES.CATEGORIES,
            mapReportFundsExpendituresCategoryToCreateDto(category),
        );

        return mapReportFundsExpendituresCategoryDtoToCategory(response.data);
    },

    updateCategory: async (
        client: AxiosInstance,
        id: number,
        category: Pick<ReportFundsExpendituresCategory, 'name' | 'type'>,
    ): Promise<ReportFundsExpendituresCategory> => {
        const response = await client.put<ReportFundsExpendituresCategoryDto>(
            `${API_ROUTES.REPORTS.FUNDS_EXPENDITURES.CATEGORIES}/${id}`,
            mapReportFundsExpendituresCategoryToUpdateDto(category),
        );

        return mapReportFundsExpendituresCategoryDtoToCategory(response.data);
    },

    deleteCategory: async (client: AxiosInstance, id: number): Promise<number> => {
        const response = await client.delete<number>(`${API_ROUTES.REPORTS.FUNDS_EXPENDITURES.CATEGORIES}/${id}`);

        return response.data;
    },

    getRecords: async (
        client: AxiosInstance,
        options: RequestOptions = {},
    ): Promise<ReportFundsExpendituresRecord[]> => {
        const response = await client.get<ReportFundsExpendituresRecordDto[]>(
            API_ROUTES.REPORTS.FUNDS_EXPENDITURES.RECORDS,
            {
                signal: options.cancellationSignal,
            },
        );

        return response.data.map(mapReportFundsExpendituresRecordDtoToRecord);
    },

    getPublishedRecords: async (
        client: AxiosInstance,
        options: RequestOptions = {},
    ): Promise<ReportFundsExpendituresRecord[]> => {
        return FundsExpendituresApi.getRecords(client, options);
    },

    getSummary: async (client: AxiosInstance, options: RequestOptions = {}): Promise<FundsExpendituresSummary> => {
        const response = await client.get<ReportFundsExpendituresSummaryDto>(
            API_ROUTES.REPORTS.FUNDS_EXPENDITURES.SUMMARY,
            {
                signal: options.cancellationSignal,
            },
        );

        return mapReportFundsExpendituresSummaryDtoToSummary(response.data);
    },

    createRecord: async (
        client: AxiosInstance,
        record: Pick<
            ReportFundsExpendituresRecord,
            'categoryId' | 'type' | 'reportingYear' | 'amountUah' | 'amountUsd'
        >,
    ): Promise<ReportFundsExpendituresRecord> => {
        const response = await client.post<ReportFundsExpendituresRecordDto>(
            API_ROUTES.REPORTS.FUNDS_EXPENDITURES.RECORDS,
            mapReportFundsExpendituresRecordToCreateDto(record),
        );

        return mapReportFundsExpendituresRecordDtoToRecord(response.data);
    },

    updateRecord: async (
        client: AxiosInstance,
        id: number,
        record: Pick<
            ReportFundsExpendituresRecord,
            'categoryId' | 'type' | 'reportingYear' | 'amountUah' | 'amountUsd'
        >,
    ): Promise<ReportFundsExpendituresRecord> => {
        const response = await client.put<ReportFundsExpendituresRecordDto>(
            `${API_ROUTES.REPORTS.FUNDS_EXPENDITURES.RECORDS}/${id}`,
            mapReportFundsExpendituresRecordToUpdateDto(record),
        );

        return mapReportFundsExpendituresRecordDtoToRecord(response.data);
    },

    deleteRecord: async (client: AxiosInstance, id: number): Promise<number> => {
        const response = await client.delete<number>(`${API_ROUTES.REPORTS.FUNDS_EXPENDITURES.RECORDS}/${id}`);

        return response.data;
    },
    bulkDeleteRecords: async (client: AxiosInstance, ids: number[]): Promise<number[]> => {
        const response = await client.post<number[]>(
            `${API_ROUTES.REPORTS.FUNDS_EXPENDITURES.RECORDS}/bulk-delete`,
            ids,
        );

        return response.data;
    },
};
