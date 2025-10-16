import { AxiosInstance } from 'axios';
import { ForeignBankDetailsApi } from './bank-details-foreign-api';
import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import { BankCurrency, ForeignBankDetailsType } from '../../../../../types/admin/donate';

describe('ForeignBankDetailsApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    const createMockBankDetails = (overrides?: Partial<ForeignBankDetailsType>): ForeignBankDetailsType => ({
        id: 1,
        name: 'Test Bank',
        receiver: 'Test Receiver',
        iban: 'UA123456789012345678901234567',
        swift: 'TESTBK12',
        address: 'Test Address',
        currency: BankCurrency.Usd,
        correspondentBanks: [],
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        const testCases = [
            { currency: BankCurrency.Usd, count: 2 },
            { currency: BankCurrency.Eur, count: 1 },
            { currency: BankCurrency.Usd, count: 0, isEmpty: true },
        ];

        testCases.forEach(({ currency, count, isEmpty }) => {
            it(`calls client.get with correct parameters for ${BankCurrency[currency]}${isEmpty ? ' (empty)' : ''}`, async () => {
                const mockResponse = {
                    data: isEmpty
                        ? []
                        : Array.from({ length: count }, (_, i) => createMockBankDetails({ id: i + 1, currency })),
                };
                mockClient.get.mockResolvedValue(mockResponse);

                const result = await ForeignBankDetailsApi.getAll(mockClient, currency);

                expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.DONATE.BANK_DETAILS_FOREIGN, {
                    params: { currency },
                });
                expect(result).toEqual(mockResponse.data);
            });
        });
    });

    describe('create', () => {
        const testCases = [
            { currency: BankCurrency.Usd, name: 'New USD Bank' },
            { currency: BankCurrency.Eur, name: 'New EUR Bank' },
        ];

        testCases.forEach(({ currency, name }) => {
            it(`creates bank with ${BankCurrency[currency]} currency`, async () => {
                const bankDetails = createMockBankDetails({ name, currency });
                delete (bankDetails as any).id;
                const mockResponse = { data: { ...bankDetails, id: 10 } };
                mockClient.post.mockResolvedValue(mockResponse);

                const result = await ForeignBankDetailsApi.create(mockClient, bankDetails);

                expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.DONATE.BANK_DETAILS_FOREIGN, bankDetails);
                expect(result.currency).toBe(currency);
            });
        });
    });

    describe('update', () => {
        const testCases = [
            { id: 5, updates: { name: 'Updated Bank', address: 'Updated Address' } },
            { id: 1, updates: { receiver: 'Updated Receiver Only' } },
            { id: 9999, updates: { name: 'Large ID Bank' } },
        ];

        testCases.forEach(({ id, updates }) => {
            it(`updates bank with id ${id}`, async () => {
                const mockResponse = { data: createMockBankDetails({ id, ...updates }) };
                mockClient.put.mockResolvedValue(mockResponse);

                const result = await ForeignBankDetailsApi.update(mockClient, id, updates);

                expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_FOREIGN}/${id}`, updates);
                expect(result.id).toBe(id);
            });
        });
    });

    describe('delete', () => {
        const testCases = [42, 1, 8888, 100];

        testCases.forEach((id) => {
            it(`deletes bank with id ${id}`, async () => {
                mockClient.delete.mockResolvedValue({});

                const result = await ForeignBankDetailsApi.delete(mockClient, id);

                expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.DONATE.BANK_DETAILS_FOREIGN}/${id}`);
                expect(result).toBeUndefined();
            });
        });
    });
});
