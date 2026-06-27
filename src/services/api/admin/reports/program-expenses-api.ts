import { AxiosInstance } from 'axios';
import { RequestOptions } from '@/types/common/api';
import {
    ProgramExpensesProgram,
    ProgramExpensesReadOnlyData,
    ProgramExpensesSummary,
    ReportProgramExpendituresRecordDto,
    CreateReportProgramExpendituresRecordDto,
    UpdateReportProgramExpendituresRecordDto,
} from '@/types/admin/reports';
import { ProgramCategory } from '@/types/admin/programs';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { formatNumberDecimalComma } from '@/utils/functions/formatters/format-number';

const mapDtoToReadOnlyData = (
    records: ReportProgramExpendituresRecordDto[],
    categories: ProgramCategory[],
    exchangeRate: string | null,
): ProgramExpensesReadOnlyData => {
    const categoryMap = new Map<number, string>(categories.map((c) => [c.id, c.name]));

    const mappedRecords = records
        .map((record) => ({
            id: record.id,
            programId: record.hippotherapyProgramCategoryId,
            programName:
                categoryMap.get(record.hippotherapyProgramCategoryId) ?? String(record.hippotherapyProgramCategoryId),
            type: 'expense' as const,
            reportingYear: String(record.reportingYear),
            amountUah: formatNumberDecimalComma(record.amountUah),
            amountUsd: formatNumberDecimalComma(record.amountUsd),
        }))
        .sort((a, b) => {
            const yearDiff = Number(b.reportingYear) - Number(a.reportingYear);
            if (yearDiff !== 0) return yearDiff;
            return a.programName.localeCompare(b.programName, 'uk');
        });

    const programs: ProgramExpensesProgram[] = categories
        .map((category) => ({ id: category.id, name: category.name }))
        .sort((a, b) => a.name.localeCompare(b.name, 'uk'));

    const summary = mappedRecords.reduce<ProgramExpensesSummary>(
        (acc, record) => ({
            totalAmountUah: acc.totalAmountUah + (Number(record.amountUah.replace(',', '.')) || 0),
            totalAmountUsd: acc.totalAmountUsd + (Number(record.amountUsd.replace(',', '.')) || 0),
        }),
        { totalAmountUah: 0, totalAmountUsd: 0 },
    );

    return { exchangeRate, programs, summary, records: mappedRecords };
};

export const ProgramExpensesApi = {
    getReadOnlyData: async (
        client: AxiosInstance,
        options: RequestOptions = {},
    ): Promise<ProgramExpensesReadOnlyData> => {
        const [recordsResponse, categoriesResponse, settingsResponse] = await Promise.all([
            client.get<ReportProgramExpendituresRecordDto[]>(API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS, {
                signal: options.cancellationSignal,
            }),
            client.get<ProgramCategory[]>(API_ROUTES.PROGRAMCATEGORY.BASE, {
                signal: options.cancellationSignal,
            }),
            client.get<{ exchangeRate: number | null }>(API_ROUTES.REPORTS.FUNDS_EXPENDITURES.SETTINGS, {
                signal: options.cancellationSignal,
            }),
        ]);

        const exchangeRate = formatNumberDecimalComma(settingsResponse.data.exchangeRate) || null;

        return mapDtoToReadOnlyData(recordsResponse.data, categoriesResponse.data, exchangeRate);
    },

    getSummary: async (client: AxiosInstance, options: RequestOptions = {}): Promise<ProgramExpensesSummary> => {
        const response = await client.get<{ totalAmountUah: number; totalAmountUsd: number }>(
            `${API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS}/summary`,
            { signal: options.cancellationSignal },
        );

        return {
            totalAmountUah: response.data.totalAmountUah,
            totalAmountUsd: response.data.totalAmountUsd,
        };
    },

    getAll: async (client: AxiosInstance): Promise<ReportProgramExpendituresRecordDto[]> => {
        const response = await client.get<ReportProgramExpendituresRecordDto[]>(
            API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS,
        );
        return response.data;
    },

    post: async (
        client: AxiosInstance,
        record: CreateReportProgramExpendituresRecordDto,
    ): Promise<ReportProgramExpendituresRecordDto> => {
        const response = await client.post<ReportProgramExpendituresRecordDto>(
            API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS,
            record,
        );
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        id: number,
        record: UpdateReportProgramExpendituresRecordDto,
    ): Promise<ReportProgramExpendituresRecordDto> => {
        const response = await client.put<ReportProgramExpendituresRecordDto>(
            `${API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS}/${id}`,
            record,
        );
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS}/${id}`);
    },

    bulkDelete: async (client: AxiosInstance, ids: number[]): Promise<void> => {
        await client.post(`${API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS}/bulk-delete`, ids);
    },
};
