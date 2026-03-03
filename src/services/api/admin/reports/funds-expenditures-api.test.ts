import { FundsExpendituresApi } from './funds-expenditures-api';
import {
    MOCK_FUNDS_EXPENDITURES_CATEGORIES,
    MOCK_FUNDS_EXPENDITURES_RECORDS,
    MOCK_FUNDS_EXPENDITURES_SETTINGS,
} from '@/utils/mock-data/admin/funds-expenditures-mock';
import { AxiosInstance } from 'axios';

const mockClient = {} as AxiosInstance;

describe('FundsExpendituresApi', () => {
    describe('getSettings', () => {
        it('should return mock settings', async () => {
            const result = await FundsExpendituresApi.getSettings(mockClient);
            expect(result).toEqual(MOCK_FUNDS_EXPENDITURES_SETTINGS);
        });

        it('should return an object with id, disclaimerTitle and exchangeRate', async () => {
            const result = await FundsExpendituresApi.getSettings(mockClient);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('disclaimerTitle');
            expect(result).toHaveProperty('exchangeRate');
        });
    });

    describe('getCategories', () => {
        it('should return mock categories array', async () => {
            const result = await FundsExpendituresApi.getCategories(mockClient);
            expect(result).toEqual(MOCK_FUNDS_EXPENDITURES_CATEGORIES);
        });

        it('should return an array with at least one category', async () => {
            const result = await FundsExpendituresApi.getCategories(mockClient);
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        it('each category should have id and name', async () => {
            const result = await FundsExpendituresApi.getCategories(mockClient);
            result.forEach((category) => {
                expect(category).toHaveProperty('id');
                expect(category).toHaveProperty('name');
            });
        });
    });

    describe('getPublishedRecords', () => {
        it('should return mock records array', async () => {
            const result = await FundsExpendituresApi.getPublishedRecords(mockClient);
            expect(result).toEqual(MOCK_FUNDS_EXPENDITURES_RECORDS);
        });

        it('should return an array with at least one record', async () => {
            const result = await FundsExpendituresApi.getPublishedRecords(mockClient);
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        it('each record should have required fields', async () => {
            const result = await FundsExpendituresApi.getPublishedRecords(mockClient);
            result.forEach((record) => {
                expect(record).toHaveProperty('id');
                expect(record).toHaveProperty('categoryId');
                expect(record).toHaveProperty('type');
                expect(record).toHaveProperty('reportingYear');
                expect(record).toHaveProperty('amountUah');
                expect(record).toHaveProperty('amountUsd');
            });
        });

        it('each record type should be income or expense', async () => {
            const result = await FundsExpendituresApi.getPublishedRecords(mockClient);
            result.forEach((record) => {
                expect(['income', 'expense']).toContain(record.type);
            });
        });
    });
});
