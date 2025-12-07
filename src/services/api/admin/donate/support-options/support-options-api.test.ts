import { AxiosInstance } from 'axios';
import { SupportOptionsApi } from './support-options-api';
import { API_ROUTES } from '@const/common/api-routes/main-api';
import { BankCurrency } from '@app-types/admin/donate';

describe('SupportOptionsApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('calls client.get with correct parameters for UAH', async () => {
            const mockResponse = {
                data: [
                    { id: 1, name: 'Option 1', value: 'Value 1', currency: BankCurrency.Uah },
                    { id: 2, name: 'Option 2', value: 'Value 2', currency: BankCurrency.Uah },
                ],
            };
            mockClient.get.mockResolvedValue(mockResponse);

            const result = await SupportOptionsApi.getAll(mockClient, BankCurrency.Uah);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.DONATE.SUPPORT_OPTIONS, {
                params: { currency: BankCurrency.Uah },
            });
            expect(result).toEqual(mockResponse.data);
        });

        it('calls client.get with correct parameters for USD', async () => {
            const mockResponse = {
                data: [{ id: 3, name: 'Option 3', value: 'Value 3', currency: BankCurrency.Usd }],
            };
            mockClient.get.mockResolvedValue(mockResponse);

            const result = await SupportOptionsApi.getAll(mockClient, BankCurrency.Usd);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.DONATE.SUPPORT_OPTIONS, {
                params: { currency: BankCurrency.Usd },
            });
            expect(result).toEqual(mockResponse.data);
        });

        it('calls client.get with correct parameters for EUR', async () => {
            const mockResponse = {
                data: [],
            };
            mockClient.get.mockResolvedValue(mockResponse);

            const result = await SupportOptionsApi.getAll(mockClient, BankCurrency.Eur);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.DONATE.SUPPORT_OPTIONS, {
                params: { currency: BankCurrency.Eur },
            });
            expect(result).toEqual([]);
        });
    });

    describe('create', () => {
        it('calls client.post with correct payload', async () => {
            const mockResponse = {
                data: {
                    id: 10,
                    name: 'New Option',
                    value: 'New Value',
                    currency: BankCurrency.Uah,
                },
            };
            mockClient.post.mockResolvedValue(mockResponse);

            const supportOption = {
                name: 'New Option',
                value: 'New Value',
                currency: BankCurrency.Uah,
            };

            const result = await SupportOptionsApi.create(mockClient, supportOption);

            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.DONATE.SUPPORT_OPTIONS, supportOption);
            expect(result).toEqual(mockResponse.data);
        });

        it('creates support option with USD currency', async () => {
            const mockResponse = {
                data: {
                    id: 11,
                    name: 'USD Option',
                    value: 'USD Value',
                    currency: BankCurrency.Usd,
                },
            };
            mockClient.post.mockResolvedValue(mockResponse);

            const supportOption = {
                name: 'USD Option',
                value: 'USD Value',
                currency: BankCurrency.Usd,
            };

            const result = await SupportOptionsApi.create(mockClient, supportOption);

            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.DONATE.SUPPORT_OPTIONS, supportOption);
            expect(result.currency).toBe(BankCurrency.Usd);
        });
    });

    describe('update', () => {
        it('calls client.put with correct URL and payload', async () => {
            const mockResponse = {
                data: {
                    id: 5,
                    name: 'Updated Option',
                    value: 'Updated Value',
                    currency: BankCurrency.Uah,
                },
            };
            mockClient.put.mockResolvedValue(mockResponse);

            const supportOption = {
                name: 'Updated Option',
                value: 'Updated Value',
            };

            const result = await SupportOptionsApi.update(mockClient, 5, supportOption);

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.DONATE.SUPPORT_OPTIONS}/5`, supportOption);
            expect(result).toEqual(mockResponse.data);
        });

        it('updates support option with id 1', async () => {
            const mockResponse = {
                data: {
                    id: 1,
                    name: 'First Updated',
                    value: 'First Updated Value',
                    currency: BankCurrency.Eur,
                },
            };
            mockClient.put.mockResolvedValue(mockResponse);

            const supportOption = {
                name: 'First Updated',
                value: 'First Updated Value',
            };

            const result = await SupportOptionsApi.update(mockClient, 1, supportOption);

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.DONATE.SUPPORT_OPTIONS}/1`, supportOption);
            expect(result.id).toBe(1);
        });

        it('updates support option with large id', async () => {
            const mockResponse = {
                data: {
                    id: 9999,
                    name: 'Large ID',
                    value: 'Large ID Value',
                    currency: BankCurrency.Uah,
                },
            };
            mockClient.put.mockResolvedValue(mockResponse);

            const supportOption = {
                name: 'Large ID',
                value: 'Large ID Value',
            };

            const result = await SupportOptionsApi.update(mockClient, 9999, supportOption);

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.DONATE.SUPPORT_OPTIONS}/9999`, supportOption);
            expect(result.id).toBe(9999);
        });
    });

    describe('delete', () => {
        it('calls client.delete with correct URL', async () => {
            mockClient.delete.mockResolvedValue({});

            await SupportOptionsApi.delete(mockClient, 42);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.DONATE.SUPPORT_OPTIONS}/42`);
        });

        it('deletes support option with id 1', async () => {
            mockClient.delete.mockResolvedValue({});

            await SupportOptionsApi.delete(mockClient, 1);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.DONATE.SUPPORT_OPTIONS}/1`);
        });

        it('deletes support option with large id', async () => {
            mockClient.delete.mockResolvedValue({});

            await SupportOptionsApi.delete(mockClient, 8888);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.DONATE.SUPPORT_OPTIONS}/8888`);
        });

        it('returns void on successful delete', async () => {
            mockClient.delete.mockResolvedValue({});

            const result = await SupportOptionsApi.delete(mockClient, 100);

            expect(result).toBeUndefined();
        });
    });
});
