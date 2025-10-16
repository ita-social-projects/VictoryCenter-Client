import { AxiosInstance } from 'axios';
import { ForeignBankDetailsApi } from './bank-details-foreign-api';
import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import { BankCurrency } from '../../../../../types/admin/donate';

describe('ForeignBankDetailsApi', () => {
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
        it('calls client.get with correct parameters for USD', async () => {
            const mockResponse = {
                data: [
                    {
                        id: 1,
                        name: 'USD Bank 1',
                        receiver: 'Company Inc',
                        iban: 'UA123456789012345678901234567',
                        swift: 'USDBK123',
                        address: '123 Wall St, NY',
                        currency: BankCurrency.Usd,
                        correspondentBanks: [],
                    },
                    {
                        id: 2,
                        name: 'USD Bank 2',
                        receiver: 'Another Company',
                        iban: 'UA987654321098765432109876543',
                        swift: 'USDBK456',
                        address: '456 Broadway, NY',
                        currency: BankCurrency.Usd,
                        correspondentBanks: [],
                    },
                ],
            };
            mockClient.get.mockResolvedValue(mockResponse);

            const result = await ForeignBankDetailsApi.getAll(mockClient, BankCurrency.Usd);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.DONATE.BANK_DETAILS_FOREIGN, {
                params: { currency: BankCurrency.Usd },
            });
            expect(result).toEqual(mockResponse.data);
        });

        it('calls client.get with correct parameters for EUR', async () => {
            const mockResponse = {
                data: [
                    {
                        id: 3,
                        name: 'EUR Bank',
                        receiver: 'European Company',
                        iban: 'UA111111111111111111111111111',
                        swift: 'EURBK789',
                        address: 'Berlin, Germany',
                        currency: BankCurrency.Eur,
                        correspondentBanks: [],
                    },
                ],
            };
            mockClient.get.mockResolvedValue(mockResponse);

            const result = await ForeignBankDetailsApi.getAll(mockClient, BankCurrency.Eur);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.DONATE.BANK_DETAILS_FOREIGN, {
                params: { currency: BankCurrency.Eur },
            });
            expect(result).toEqual(mockResponse.data);
        });

        it('returns empty array when no banks exist', async () => {
            const mockResponse = {
                data: [],
            };
            mockClient.get.mockResolvedValue(mockResponse);

            const result = await ForeignBankDetailsApi.getAll(mockClient, BankCurrency.Usd);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.DONATE.BANK_DETAILS_FOREIGN, {
                params: { currency: BankCurrency.Usd },
            });
            expect(result).toEqual([]);
        });
    });

    describe('create', () => {
        it('calls client.post with correct payload', async () => {
            const mockResponse = {
                data: {
                    id: 10,
                    name: 'New Bank',
                    receiver: 'New Receiver',
                    iban: 'UA222222222222222222222222222',
                    swift: 'NEWBK111',
                    address: 'New Address',
                    currency: BankCurrency.Usd,
                    correspondentBanks: [],
                },
            };
            mockClient.post.mockResolvedValue(mockResponse);

            const bankDetails = {
                name: 'New Bank',
                receiver: 'New Receiver',
                iban: 'UA222222222222222222222222222',
                swift: 'NEWBK111',
                address: 'New Address',
                currency: BankCurrency.Usd,
                correspondentBanks: [],
            };

            const result = await ForeignBankDetailsApi.create(mockClient, bankDetails);

            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.DONATE.BANK_DETAILS_FOREIGN, bankDetails);
            expect(result).toEqual(mockResponse.data);
        });

        it('creates bank with EUR currency', async () => {
            const mockResponse = {
                data: {
                    id: 11,
                    name: 'EUR Bank',
                    receiver: 'EUR Receiver',
                    iban: 'UA333333333333333333333333333',
                    swift: 'EURBK222',
                    address: 'Paris, France',
                    currency: BankCurrency.Eur,
                    correspondentBanks: [],
                },
            };
            mockClient.post.mockResolvedValue(mockResponse);

            const bankDetails = {
                name: 'EUR Bank',
                receiver: 'EUR Receiver',
                iban: 'UA333333333333333333333333333',
                swift: 'EURBK222',
                address: 'Paris, France',
                currency: BankCurrency.Eur,
                correspondentBanks: [],
            };

            const result = await ForeignBankDetailsApi.create(mockClient, bankDetails);

            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.DONATE.BANK_DETAILS_FOREIGN, bankDetails);
            expect(result.currency).toBe(BankCurrency.Eur);
        });
    });

    describe('update', () => {
        it('calls client.put with correct URL and payload', async () => {
            const mockResponse = {
                data: {
                    id: 5,
                    name: 'Updated Bank',
                    receiver: 'Updated Receiver',
                    iban: 'UA444444444444444444444444444',
                    swift: 'UPDBK333',
                    address: 'Updated Address',
                    currency: BankCurrency.Usd,
                    correspondentBanks: [],
                },
            };
            mockClient.put.mockResolvedValue(mockResponse);

            const bankDetails = {
                name: 'Updated Bank',
                address: 'Updated Address',
            };

            const result = await ForeignBankDetailsApi.update(mockClient, 5, bankDetails);

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_FOREIGN}/5`, bankDetails);
            expect(result).toEqual(mockResponse.data);
        });

        it('updates bank with partial data', async () => {
            const mockResponse = {
                data: {
                    id: 1,
                    name: 'Original Name',
                    receiver: 'Updated Receiver Only',
                    iban: 'UA555555555555555555555555555',
                    swift: 'ORIG1234',
                    address: 'Original Address',
                    currency: BankCurrency.Usd,
                    correspondentBanks: [],
                },
            };
            mockClient.put.mockResolvedValue(mockResponse);

            const bankDetails = {
                receiver: 'Updated Receiver Only',
            };

            const result = await ForeignBankDetailsApi.update(mockClient, 1, bankDetails);

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_FOREIGN}/1`, bankDetails);
            expect(result.id).toBe(1);
        });

        it('updates bank with large id', async () => {
            const mockResponse = {
                data: {
                    id: 9999,
                    name: 'Large ID Bank',
                    receiver: 'Large Receiver',
                    iban: 'UA666666666666666666666666666',
                    swift: 'LARGE999',
                    address: 'Large Address',
                    currency: BankCurrency.Eur,
                    correspondentBanks: [],
                },
            };
            mockClient.put.mockResolvedValue(mockResponse);

            const bankDetails = {
                name: 'Large ID Bank',
            };

            const result = await ForeignBankDetailsApi.update(mockClient, 9999, bankDetails);

            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_FOREIGN}/9999`, bankDetails);
            expect(result.id).toBe(9999);
        });
    });

    describe('delete', () => {
        it('calls client.delete with correct URL', async () => {
            mockClient.delete.mockResolvedValue({});

            await ForeignBankDetailsApi.delete(mockClient, 42);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_FOREIGN}/42`);
        });

        it('deletes bank with id 1', async () => {
            mockClient.delete.mockResolvedValue({});

            await ForeignBankDetailsApi.delete(mockClient, 1);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_FOREIGN}/1`);
        });

        it('deletes bank with large id', async () => {
            mockClient.delete.mockResolvedValue({});

            await ForeignBankDetailsApi.delete(mockClient, 8888);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_FOREIGN}/8888`);
        });

        it('returns void on successful delete', async () => {
            mockClient.delete.mockResolvedValue({});

            const result = await ForeignBankDetailsApi.delete(mockClient, 100);

            expect(result).toBeUndefined();
        });
    });
});
