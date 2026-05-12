import { ProgramExpensesReadOnlyData } from '@/types/admin/reports';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ProgramExpensesApi } from './program-expenses-api';

const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
} as any;

describe('ProgramExpensesApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getReadOnlyData', () => {
        it('should fetch records, categories and settings and map to read-only data', async () => {
            mockClient.get.mockImplementation((url: string) => {
                if (url === API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS) {
                    return Promise.resolve({
                        data: [
                            {
                                id: 1,
                                reportingYear: 2025,
                                hippotherapyProgramCategoryId: 10,
                                amountUah: 1500,
                                amountUsd: 1000,
                            },
                            {
                                id: 2,
                                reportingYear: 2025,
                                hippotherapyProgramCategoryId: 20,
                                amountUah: 250,
                                amountUsd: 100.5,
                            },
                            {
                                id: 3,
                                reportingYear: 2024,
                                hippotherapyProgramCategoryId: 10,
                                amountUah: 2000,
                                amountUsd: 800,
                            },
                            {
                                id: 4,
                                reportingYear: 2024,
                                hippotherapyProgramCategoryId: 20,
                                amountUah: 0,
                                amountUsd: 0,
                            },
                        ],
                    });
                }
                if (url === API_ROUTES.PROGRAMCATEGORY.BASE) {
                    return Promise.resolve({
                        data: [
                            { id: 10, name: 'Program A', programsCount: 2 },
                            { id: 20, name: 'Program B', programsCount: 1 },
                        ],
                    });
                }
                if (url === API_ROUTES.REPORTS.FUNDS_EXPENDITURES.SETTINGS) {
                    return Promise.resolve({ data: { exchangeRate: 42.15 } });
                }
                return Promise.reject(new Error(`Unexpected URL: ${url}`));
            });

            const result = await ProgramExpensesApi.getReadOnlyData(mockClient);

            expect(result.exchangeRate).toBe('42,15');
            expect(result.records).toEqual([
                {
                    id: 1,
                    programId: 10,
                    programName: 'Program A',
                    type: 'expense',
                    reportingYear: '2025',
                    amountUah: '1500',
                    amountUsd: '1000',
                },
                {
                    id: 2,
                    programId: 20,
                    programName: 'Program B',
                    type: 'expense',
                    reportingYear: '2025',
                    amountUah: '250',
                    amountUsd: '100,5',
                },
                {
                    id: 3,
                    programId: 10,
                    programName: 'Program A',
                    type: 'expense',
                    reportingYear: '2024',
                    amountUah: '2000',
                    amountUsd: '800',
                },
                {
                    id: 4,
                    programId: 20,
                    programName: 'Program B',
                    type: 'expense',
                    reportingYear: '2024',
                    amountUah: '0',
                    amountUsd: '0',
                },
            ]);
            expect(result.programs).toEqual([
                { id: 10, name: 'Program A' },
                { id: 20, name: 'Program B' },
            ]);
            expect(result.summary).toEqual({
                totalAmountUah: 3750,
                totalAmountUsd: 1900.5,
            });
        });

        it('should return null exchange rate when settings value is null', async () => {
            mockClient.get.mockImplementation((url: string) => {
                if (url === API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS) {
                    return Promise.resolve({ data: [] });
                }
                if (url === API_ROUTES.PROGRAMCATEGORY.BASE) {
                    return Promise.resolve({ data: [] });
                }
                if (url === API_ROUTES.REPORTS.FUNDS_EXPENDITURES.SETTINGS) {
                    return Promise.resolve({ data: { exchangeRate: null } });
                }
                return Promise.reject(new Error(`Unexpected URL: ${url}`));
            });

            const result = await ProgramExpensesApi.getReadOnlyData(mockClient);

            expect(result).toEqual({
                exchangeRate: null,
                programs: [],
                summary: { totalAmountUah: 0, totalAmountUsd: 0 },
                records: [],
            });
        });

        it('should pass cancellation signal to all requests', async () => {
            mockClient.get.mockResolvedValue({ data: [] });
            mockClient.get.mockImplementation((url: string) => {
                if (url === API_ROUTES.REPORTS.FUNDS_EXPENDITURES.SETTINGS) {
                    return Promise.resolve({ data: { exchangeRate: null } });
                }
                return Promise.resolve({ data: [] });
            });

            const signal = new AbortController().signal;
            await ProgramExpensesApi.getReadOnlyData(mockClient, { cancellationSignal: signal });

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS, { signal });
            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.PROGRAMCATEGORY.BASE, { signal });
            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.REPORTS.FUNDS_EXPENDITURES.SETTINGS, { signal });
        });

        it('should fall back to category id string when category not found in map', async () => {
            mockClient.get.mockImplementation((url: string) => {
                if (url === API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS) {
                    return Promise.resolve({
                        data: [
                            {
                                id: 1,
                                reportingYear: 2025,
                                hippotherapyProgramCategoryId: 99,
                                amountUah: 100,
                                amountUsd: 10,
                            },
                        ],
                    });
                }
                if (url === API_ROUTES.PROGRAMCATEGORY.BASE) {
                    return Promise.resolve({ data: [] });
                }
                if (url === API_ROUTES.REPORTS.FUNDS_EXPENDITURES.SETTINGS) {
                    return Promise.resolve({ data: { exchangeRate: null } });
                }
                return Promise.reject(new Error(`Unexpected URL: ${url}`));
            });

            const result = await ProgramExpensesApi.getReadOnlyData(mockClient);

            expect(result.records[0].programName).toBe('99');
        });
    });

    describe('CRUD methods', () => {
        it('getAll should call GET and return data', async () => {
            const mockData = [{ id: 1, amountUah: 100 }];
            mockClient.get.mockResolvedValueOnce({ data: mockData });

            const result = await ProgramExpensesApi.getAll(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS);
            expect(result).toEqual(mockData);
        });

        it('post should call POST with correct payload and return data', async () => {
            const record = { reportingYear: 2025, hippotherapyProgramCategoryId: 1, amountUah: 100, amountUsd: 10 };
            const mockData = { id: 1, ...record };
            mockClient.post.mockResolvedValueOnce({ data: mockData });

            const result = await ProgramExpensesApi.post(mockClient, record);

            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS, record);
            expect(result).toEqual(mockData);
        });

        it('update should call PUT with correct payload and return data', async () => {
            const record = { hippotherapyProgramCategoryId: 1, amountUah: 200, amountUsd: 20 };
            const mockData = { id: 5, reportingYear: 2025, ...record };
            mockClient.put.mockResolvedValueOnce({ data: mockData });

            const result = await ProgramExpensesApi.update(mockClient, 5, record);

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS}/5`, record);
            expect(result).toEqual(mockData);
        });

        it('delete should call DELETE with correct id', async () => {
            mockClient.delete.mockResolvedValueOnce({});

            await ProgramExpensesApi.delete(mockClient, 10);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS}/10`);
        });

        it('bulkDelete should call POST with correct payload', async () => {
            mockClient.post.mockResolvedValueOnce({});

            await ProgramExpensesApi.bulkDelete(mockClient, [1, 2, 3]);

            expect(mockClient.post).toHaveBeenCalledWith(
                `${API_ROUTES.REPORTS.PROGRAM_EXPENDITURES_RECORDS}/bulk-delete`,
                [1, 2, 3],
            );
        });
    });
});
