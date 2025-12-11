import { donatePageDataFetch } from './donate-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { Currency } from '@/types/public/donate-page';

jest.mock('@/services/api/axios', () => ({
    axiosInstance: {
        get: jest.fn(),
    },
}));

const mockAxiosInstance = require('@/services/api/axios').axiosInstance;

describe('donatePageDataFetch', () => {
    const createMockUahBankDetails = () => [
        {
            id: 1,
            name: 'UAH Bank',
            receiver: 'Test Receiver',
            edrpou: '12345678',
            iban: 'UA123456789012345678901234567',
            paymentPurpose: 'Test Purpose',
        },
    ];

    const createMockForeignBankDetails = (currency: Currency) => [
        {
            id: 1,
            name: `${currency === Currency.USD ? 'USD' : 'EUR'} Bank`,
            receiver: `${currency === Currency.USD ? 'USD' : 'EUR'} Receiver`,
            iban: `${currency === Currency.USD ? 'US' : 'GB'}123456789012345678901234567`,
            swift: 'TESTBANK',
            address: 'Test Address',
            currency,
            correspondentBanks: [],
        },
    ];

    const createMockSupportOptions = (currency: Currency) => [
        {
            id: 1,
            name: `PayPal ${currency === Currency.UAH ? 'UAH' : currency === Currency.USD ? 'USD' : 'EUR'}`,
            value: `test@paypal-${currency === Currency.UAH ? 'uah' : currency === Currency.USD ? 'usd' : 'eur'}.com`,
            currency,
        },
    ];

    const testApiError = async (failAtIndex: number, errorMessage: string) => {
        const error = new Error(errorMessage);

        for (let i = 0; i < 6; i++) {
            if (i === failAtIndex) {
                mockAxiosInstance.get.mockRejectedValueOnce(error);
            } else {
                mockAxiosInstance.get.mockResolvedValueOnce({ data: [] });
            }
        }

        await expect(donatePageDataFetch()).rejects.toThrow(errorMessage);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('successful API calls', () => {
        it('fetches all data successfully and returns combined result', async () => {
            const mockUahBankDetails = createMockUahBankDetails();
            const mockUsdForeignBankDetails = createMockForeignBankDetails(Currency.USD);
            const mockEurForeignBankDetails = createMockForeignBankDetails(Currency.EUR);
            const mockUahSupportOptions = createMockSupportOptions(Currency.UAH);
            const mockUsdSupportOptions = createMockSupportOptions(Currency.USD);
            const mockEurSupportOptions = createMockSupportOptions(Currency.EUR);

            mockAxiosInstance.get
                .mockResolvedValueOnce({ data: mockUahBankDetails })
                .mockResolvedValueOnce({ data: mockUsdForeignBankDetails })
                .mockResolvedValueOnce({ data: mockEurForeignBankDetails })
                .mockResolvedValueOnce({ data: mockUahSupportOptions })
                .mockResolvedValueOnce({ data: mockUsdSupportOptions })
                .mockResolvedValueOnce({ data: mockEurSupportOptions });

            const result = await donatePageDataFetch();

            expect(result).toEqual({
                uahBankDetails: mockUahBankDetails,
                foreignBankDetails: [...mockUsdForeignBankDetails, ...mockEurForeignBankDetails],
                supportOptions: [...mockUahSupportOptions, ...mockUsdSupportOptions, ...mockEurSupportOptions],
            });
        });

        it('makes correct API calls with proper endpoints and parameters', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: [] });

            await donatePageDataFetch();

            expect(mockAxiosInstance.get).toHaveBeenCalledTimes(6);
            expect(mockAxiosInstance.get).toHaveBeenNthCalledWith(1, API_ROUTES.DONATE.PUBLIC.BANK_DETAILS_UAH);
            expect(mockAxiosInstance.get).toHaveBeenNthCalledWith(2, API_ROUTES.DONATE.PUBLIC.BANK_DETAILS_FOREIGN, {
                params: { currency: Currency.USD },
            });
            expect(mockAxiosInstance.get).toHaveBeenNthCalledWith(3, API_ROUTES.DONATE.PUBLIC.BANK_DETAILS_FOREIGN, {
                params: { currency: Currency.EUR },
            });
            expect(mockAxiosInstance.get).toHaveBeenNthCalledWith(4, API_ROUTES.DONATE.PUBLIC.SUPPORT_OPTIONS, {
                params: { currency: Currency.UAH },
            });
            expect(mockAxiosInstance.get).toHaveBeenNthCalledWith(5, API_ROUTES.DONATE.PUBLIC.SUPPORT_OPTIONS, {
                params: { currency: Currency.USD },
            });
            expect(mockAxiosInstance.get).toHaveBeenNthCalledWith(6, API_ROUTES.DONATE.PUBLIC.SUPPORT_OPTIONS, {
                params: { currency: Currency.EUR },
            });
        });
    });

    describe('empty API responses', () => {
        it('handles empty arrays from all endpoints', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: [] });

            const result = await donatePageDataFetch();

            expect(result).toEqual({
                uahBankDetails: [],
                foreignBankDetails: [],
                supportOptions: [],
            });
        });

        it('handles mixed empty and non-empty responses', async () => {
            const mockUsdForeignBankDetails = createMockForeignBankDetails(Currency.USD);
            const mockUahSupportOptions = createMockSupportOptions(Currency.UAH);

            mockAxiosInstance.get
                .mockResolvedValueOnce({ data: [] })
                .mockResolvedValueOnce({ data: mockUsdForeignBankDetails })
                .mockResolvedValueOnce({ data: [] })
                .mockResolvedValueOnce({ data: mockUahSupportOptions })
                .mockResolvedValueOnce({ data: [] })
                .mockResolvedValueOnce({ data: [] });

            const result = await donatePageDataFetch();

            expect(result).toEqual({
                uahBankDetails: [],
                foreignBankDetails: mockUsdForeignBankDetails,
                supportOptions: mockUahSupportOptions,
            });
        });
    });

    describe('API error handling', () => {
        it('throws error when UAH bank details request fails', async () => {
            await testApiError(0, 'UAH API Error');
        });

        it('throws error when USD foreign bank details request fails', async () => {
            await testApiError(1, 'USD API Error');
        });

        it('throws error when EUR foreign bank details request fails', async () => {
            await testApiError(2, 'EUR API Error');
        });

        it('throws error when UAH support options request fails', async () => {
            await testApiError(3, 'UAH Support API Error');
        });

        it('throws error when USD support options request fails', async () => {
            await testApiError(4, 'USD Support API Error');
        });

        it('throws error when EUR support options request fails', async () => {
            await testApiError(5, 'EUR Support API Error');
        });

        it('throws error when multiple requests fail', async () => {
            const error = new Error('Multiple API Errors');
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(donatePageDataFetch()).rejects.toThrow('Multiple API Errors');
        });
    });

    describe('data combination logic', () => {
        it('combines foreign bank details in correct order USD then EUR', async () => {
            const mockUsdBanks = [
                { id: 1, currency: Currency.USD, name: 'USD Bank 1' },
                { id: 2, currency: Currency.USD, name: 'USD Bank 2' },
            ];
            const mockEurBanks = [{ id: 3, currency: Currency.EUR, name: 'EUR Bank 1' }];

            mockAxiosInstance.get
                .mockResolvedValueOnce({ data: [] })
                .mockResolvedValueOnce({ data: mockUsdBanks })
                .mockResolvedValueOnce({ data: mockEurBanks })
                .mockResolvedValueOnce({ data: [] })
                .mockResolvedValueOnce({ data: [] })
                .mockResolvedValueOnce({ data: [] });

            const result = await donatePageDataFetch();

            expect(result.foreignBankDetails).toEqual([...mockUsdBanks, ...mockEurBanks]);
            expect(result.foreignBankDetails).toHaveLength(3);
            expect(result.foreignBankDetails[0].name).toBe('USD Bank 1');
            expect(result.foreignBankDetails[1].name).toBe('USD Bank 2');
            expect(result.foreignBankDetails[2].name).toBe('EUR Bank 1');
        });

        it('combines support options in correct order UAH then USD then EUR', async () => {
            const mockUahOptions = [{ id: 1, currency: Currency.UAH, name: 'UAH Option' }];
            const mockUsdOptions = [{ id: 2, currency: Currency.USD, name: 'USD Option' }];
            const mockEurOptions = [{ id: 3, currency: Currency.EUR, name: 'EUR Option' }];

            mockAxiosInstance.get
                .mockResolvedValueOnce({ data: [] })
                .mockResolvedValueOnce({ data: [] })
                .mockResolvedValueOnce({ data: [] })
                .mockResolvedValueOnce({ data: mockUahOptions })
                .mockResolvedValueOnce({ data: mockUsdOptions })
                .mockResolvedValueOnce({ data: mockEurOptions });

            const result = await donatePageDataFetch();

            expect(result.supportOptions).toEqual([...mockUahOptions, ...mockUsdOptions, ...mockEurOptions]);
            expect(result.supportOptions).toHaveLength(3);
            expect(result.supportOptions[0].name).toBe('UAH Option');
            expect(result.supportOptions[1].name).toBe('USD Option');
            expect(result.supportOptions[2].name).toBe('EUR Option');
        });
    });

    describe('return type validation', () => {
        it('returns correct DonatePageData structure', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: [] });

            const result = await donatePageDataFetch();

            expect(result).toHaveProperty('uahBankDetails');
            expect(result).toHaveProperty('foreignBankDetails');
            expect(result).toHaveProperty('supportOptions');
            expect(Array.isArray(result.uahBankDetails)).toBe(true);
            expect(Array.isArray(result.foreignBankDetails)).toBe(true);
            expect(Array.isArray(result.supportOptions)).toBe(true);
        });

        it('maintains data types in returned arrays', async () => {
            const mockUahBankDetails = createMockUahBankDetails();
            const mockUsdForeignBankDetails = createMockForeignBankDetails(Currency.USD);
            const mockUahSupportOptions = createMockSupportOptions(Currency.UAH);

            mockAxiosInstance.get
                .mockResolvedValueOnce({ data: mockUahBankDetails })
                .mockResolvedValueOnce({ data: mockUsdForeignBankDetails })
                .mockResolvedValueOnce({ data: [] })
                .mockResolvedValueOnce({ data: mockUahSupportOptions })
                .mockResolvedValueOnce({ data: [] })
                .mockResolvedValueOnce({ data: [] });

            const result = await donatePageDataFetch();

            expect(result.uahBankDetails[0]).toHaveProperty('edrpou');
            expect(result.uahBankDetails[0]).toHaveProperty('paymentPurpose');
            expect(result.foreignBankDetails[0]).toHaveProperty('swift');
            expect(result.foreignBankDetails[0]).toHaveProperty('correspondentBanks');
            expect(result.supportOptions[0]).toHaveProperty('name');
            expect(result.supportOptions[0]).toHaveProperty('value');
        });
    });
});
