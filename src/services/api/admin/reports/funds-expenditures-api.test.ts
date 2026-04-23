import { FundsExpendituresApi } from './funds-expenditures-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { RequestOptions } from '@/types/common/api';

const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
} as any;

describe('FundsExpendituresApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getSettings', () => {
        it('should request settings and map dto', async () => {
            mockClient.get.mockResolvedValueOnce({
                data: { id: 1, disclaimerTitle: 'Disclaimer', exchangeRate: 42.18 },
            });

            const result = await FundsExpendituresApi.getSettings(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.REPORTS.FUNDS_EXPENDITURES.SETTINGS, {
                signal: undefined,
            });
            expect(result).toEqual({ id: 1, disclaimerTitle: 'Disclaimer', exchangeRate: '42,18' });
        });

        it('should pass cancellation signal', async () => {
            mockClient.get.mockResolvedValueOnce({
                data: { id: 1, disclaimerTitle: 'Disclaimer', exchangeRate: 42.18 },
            });

            const options: RequestOptions = { cancellationSignal: new AbortController().signal };
            await FundsExpendituresApi.getSettings(mockClient, options);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.REPORTS.FUNDS_EXPENDITURES.SETTINGS, {
                signal: options.cancellationSignal,
            });
        });
    });

    describe('updateSettings', () => {
        it('should send update payload and map response', async () => {
            mockClient.put.mockResolvedValueOnce({ data: { id: 1, disclaimerTitle: 'Updated', exchangeRate: 40 } });

            const result = await FundsExpendituresApi.updateSettings(mockClient, {
                disclaimerTitle: 'Updated',
                exchangeRate: '40',
            });

            expect(mockClient.put).toHaveBeenCalledWith(API_ROUTES.REPORTS.FUNDS_EXPENDITURES.SETTINGS, {
                disclaimerTitle: 'Updated',
                exchangeRate: 40,
            });
            expect(result).toEqual({ id: 1, disclaimerTitle: 'Updated', exchangeRate: '40' });
        });
    });

    describe('getCategories', () => {
        it('should request categories and map enum dto', async () => {
            mockClient.get.mockResolvedValueOnce({
                data: [
                    { id: 1, name: 'Income category', type: 1 },
                    { id: 2, name: 'Expense category', type: 2 },
                ],
            });

            const result = await FundsExpendituresApi.getCategories(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.REPORTS.FUNDS_EXPENDITURES.CATEGORIES, {
                signal: undefined,
            });
            expect(result).toEqual([
                { id: 1, name: 'Income category', type: 'income' },
                { id: 2, name: 'Expense category', type: 'expense' },
            ]);
        });
    });

    describe('createCategory', () => {
        it('should post category and map response', async () => {
            mockClient.post.mockResolvedValueOnce({ data: { id: 3, name: 'New income', type: 1 } });

            const result = await FundsExpendituresApi.createCategory(mockClient, {
                name: 'New income',
                type: 'income',
            });

            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.REPORTS.FUNDS_EXPENDITURES.CATEGORIES, {
                name: 'New income',
                type: 1,
            });
            expect(result).toEqual({ id: 3, name: 'New income', type: 'income' });
        });
    });

    describe('updateCategory', () => {
        it('should put category and map response', async () => {
            mockClient.put.mockResolvedValueOnce({ data: { id: 2, name: 'Updated expense', type: 2 } });

            const result = await FundsExpendituresApi.updateCategory(mockClient, 2, {
                name: 'Updated expense',
                type: 'expense',
            });

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.REPORTS.FUNDS_EXPENDITURES.CATEGORIES}/2`, {
                name: 'Updated expense',
                type: 2,
            });
            expect(result).toEqual({ id: 2, name: 'Updated expense', type: 'expense' });
        });
    });

    describe('deleteCategory', () => {
        it('should delete category by id', async () => {
            mockClient.delete.mockResolvedValueOnce({ data: 2 });

            const result = await FundsExpendituresApi.deleteCategory(mockClient, 2);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.REPORTS.FUNDS_EXPENDITURES.CATEGORIES}/2`);
            expect(result).toBe(2);
        });
    });

    describe('getRecords', () => {
        it('should request records and map dto to UI model', async () => {
            mockClient.get.mockResolvedValueOnce({
                data: [
                    {
                        id: 10,
                        categoryId: 1,
                        type: 1,
                        reportingYear: 2025,
                        amountUah: 7265.5,
                        amountUsd: 4200.25,
                    },
                ],
            });

            const result = await FundsExpendituresApi.getRecords(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.REPORTS.FUNDS_EXPENDITURES.RECORDS, {
                signal: undefined,
            });
            expect(result).toEqual([
                {
                    id: 10,
                    categoryId: 1,
                    type: 'income',
                    reportingYear: '2025',
                    amountUah: '7265,5',
                    amountUsd: '4200,25',
                },
            ]);
        });
    });

    describe('getSummary', () => {
        it('should request summary endpoint', async () => {
            mockClient.get.mockResolvedValueOnce({
                data: {
                    incomeUahTotal: 100,
                    incomeUsdTotal: 10,
                    expenditureUahTotal: 80,
                    expenditureUsdTotal: 8,
                    incomeCategoriesCount: 2,
                    expenditureCategoriesCount: 2,
                },
            });

            const result = await FundsExpendituresApi.getSummary(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.REPORTS.FUNDS_EXPENDITURES.SUMMARY, {
                signal: undefined,
            });
            expect(result.totalCollectedUah).toBe(100);
            expect(result.expenseCategories).toBe(2);
        });
    });

    describe('createRecord', () => {
        it('should post record dto and map response', async () => {
            mockClient.post.mockResolvedValueOnce({
                data: {
                    id: 11,
                    categoryId: 1,
                    type: 1,
                    reportingYear: 2026,
                    amountUah: 500,
                    amountUsd: 12,
                },
            });

            const result = await FundsExpendituresApi.createRecord(mockClient, {
                categoryId: 1,
                type: 'income',
                reportingYear: '2026',
                amountUah: '500',
                amountUsd: '12',
            });

            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.REPORTS.FUNDS_EXPENDITURES.RECORDS, {
                categoryId: 1,
                type: 1,
                reportingYear: 2026,
                amountUah: 500,
                amountUsd: 12,
            });
            expect(result).toEqual({
                id: 11,
                categoryId: 1,
                type: 'income',
                reportingYear: '2026',
                amountUah: '500',
                amountUsd: '12',
            });
        });
    });

    describe('updateRecord', () => {
        it('should put record dto and map response', async () => {
            mockClient.put.mockResolvedValueOnce({
                data: {
                    id: 12,
                    categoryId: 2,
                    type: 2,
                    reportingYear: 2025,
                    amountUah: 350,
                    amountUsd: 9.5,
                },
            });

            const result = await FundsExpendituresApi.updateRecord(mockClient, 12, {
                categoryId: 2,
                type: 'expense',
                reportingYear: '2025',
                amountUah: '350',
                amountUsd: '9.5',
            });

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.REPORTS.FUNDS_EXPENDITURES.RECORDS}/12`, {
                categoryId: 2,
                type: 2,
                reportingYear: 2025,
                amountUah: 350,
                amountUsd: 9.5,
            });
            expect(result).toEqual({
                id: 12,
                categoryId: 2,
                type: 'expense',
                reportingYear: '2025',
                amountUah: '350',
                amountUsd: '9,5',
            });
        });
    });

    describe('deleteRecord', () => {
        it('should delete record by id', async () => {
            mockClient.delete.mockResolvedValueOnce({ data: 12 });

            const result = await FundsExpendituresApi.deleteRecord(mockClient, 12);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.REPORTS.FUNDS_EXPENDITURES.RECORDS}/12`);
            expect(result).toBe(12);
        });
    });

    describe('getPublishedRecords', () => {
        it('should proxy to getRecords', async () => {
            mockClient.get.mockResolvedValueOnce({ data: [] });

            await FundsExpendituresApi.getPublishedRecords(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.REPORTS.FUNDS_EXPENDITURES.RECORDS, {
                signal: undefined,
            });
        });
    });
});
