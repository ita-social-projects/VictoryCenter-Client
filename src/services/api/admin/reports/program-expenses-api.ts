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
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    MOCK_PROGRAM_EXPENSES_EXCHANGE_RATE,
    MOCK_PROGRAM_EXPENSES_PROGRAMS,
    MOCK_PROGRAM_EXPENSES_RECORDS,
} from '@/utils/mock-data/admin/reports/program-expenses';
import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';

const getPublishedProgramExpensesRecords = () =>
    MOCK_PROGRAM_EXPENSES_RECORDS.filter((record) => record.isPublished).sort((firstRecord, secondRecord) => {
        const yearDifference =
            Number.parseInt(secondRecord.reportingYear, 10) - Number.parseInt(firstRecord.reportingYear, 10);

        if (yearDifference !== 0) {
            return yearDifference;
        }

        return firstRecord.programName.localeCompare(secondRecord.programName, 'uk');
    });

const getRecordPrograms = (): ProgramExpensesProgram[] => {
    const uniqueProgramsMap = new Map<number, ProgramExpensesProgram>();

    getPublishedProgramExpensesRecords().forEach((record) => {
        uniqueProgramsMap.set(record.programId, {
            id: record.programId,
            name: record.programName,
        });
    });

    return Array.from(uniqueProgramsMap.values());
};

const mergePrograms = (programs: ProgramExpensesProgram[]): ProgramExpensesProgram[] => {
    const uniqueProgramsMap = new Map<number, ProgramExpensesProgram>();

    programs.forEach((program) => {
        uniqueProgramsMap.set(program.id, program);
    });

    return Array.from(uniqueProgramsMap.values()).sort((firstProgram, secondProgram) =>
        firstProgram.name.localeCompare(secondProgram.name, 'uk'),
    );
};

const getPrograms = (): ProgramExpensesProgram[] =>
    mergePrograms([...getRecordPrograms(), ...MOCK_PROGRAM_EXPENSES_PROGRAMS]);

const getSummary = (): ProgramExpensesSummary => {
    return getPublishedProgramExpensesRecords().reduce<ProgramExpensesSummary>(
        (summary, record) => ({
            totalAmountUah: summary.totalAmountUah + parseAmount(record.amountUah),
            totalAmountUsd: summary.totalAmountUsd + parseAmount(record.amountUsd),
        }),
        {
            totalAmountUah: 0,
            totalAmountUsd: 0,
        },
    );
};

const PUBLISHED_PROGRAM_EXPENSES_RECORDS = getPublishedProgramExpensesRecords().map(
    ({ isPublished: _isPublished, ...record }) => record,
);

const PROGRAM_EXPENSES_SUMMARY = getSummary();

export const ProgramExpensesApi = {
    getReadOnlyData: async (_options: RequestOptions = {}): Promise<ProgramExpensesReadOnlyData> => {
        return {
            exchangeRate: MOCK_PROGRAM_EXPENSES_EXCHANGE_RATE,
            programs: getPrograms(),
            summary: PROGRAM_EXPENSES_SUMMARY,
            records: PUBLISHED_PROGRAM_EXPENSES_RECORDS,
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
