import { bankDetailsConfig } from './BankDetailsCurrenciesConfig';
import { UahBankDetailsDto, ForeignBankDetailsDto, BankCurrency } from '@/types/admin/donate';
import { BankDetailsUahApi } from '@/services/api/admin/donate/bank-details-uah/bank-details-uah-api';
import { ForeignBankDetailsApi } from '@/services/api/admin/donate/bank-details-foreign/bank-details-foreign-api';
import { AxiosInstance } from 'axios';

const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
} as unknown as AxiosInstance;

jest.mock('@/services/api/admin/donate/bank-details-uah/bank-details-uah-api');
jest.mock('@/services/api/admin/donate/bank-details-foreign/bank-details-foreign-api');

describe('bankDetailsConfig', () => {
    describe('UAH config', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('createEmptyItem returns item without id initially', () => {
            const item = bankDetailsConfig.UAH.createEmptyItem({ name: 'MonoBank' });
            expect((item as UahBankDetailsDto).name).toBe('MonoBank');
        });

        it('fetch return empty array', async () => {
            (BankDetailsUahApi.getAll as jest.Mock).mockResolvedValue([]);
            const result = await bankDetailsConfig.UAH.fetch(mockClient);
            expect(result).toEqual([]);
            expect(BankDetailsUahApi.getAll).toHaveBeenCalledWith(mockClient);
        });

        it('form exists', () => {
            expect(bankDetailsConfig.UAH.form).toBeDefined();
        });

        it('create calls BankDetailsUahApi.create', async () => {
            const mockData = { name: 'MonoBank', accountNumber: '1234567890' };
            const mockResponse = { id: 1, ...mockData } as unknown as UahBankDetailsDto;
            (BankDetailsUahApi.create as jest.Mock).mockResolvedValue(mockResponse);

            const result = await bankDetailsConfig.UAH.create(mockClient, mockData);

            expect(result).toEqual(mockResponse);
            expect(BankDetailsUahApi.create).toHaveBeenCalledWith(mockClient, mockData);
        });

        it('update calls BankDetailsUahApi.update', async () => {
            const mockData = { name: 'Updated Bank' };
            const mockResponse = { id: 1, ...mockData } as UahBankDetailsDto;
            (BankDetailsUahApi.update as jest.Mock).mockResolvedValue(mockResponse);

            const result = await bankDetailsConfig.UAH.update(mockClient, 1, mockData);

            expect(result).toEqual(mockResponse);
            expect(BankDetailsUahApi.update).toHaveBeenCalledWith(mockClient, 1, mockData);
        });

        it('delete calls BankDetailsUahApi.delete', async () => {
            (BankDetailsUahApi.delete as jest.Mock).mockResolvedValue(undefined);

            await bankDetailsConfig.UAH.delete(mockClient, 1);

            expect(BankDetailsUahApi.delete).toHaveBeenCalledWith(mockClient, 1);
        });

        it('does not have correspondent banks configuration', () => {
            expect(bankDetailsConfig.UAH.withCorrespondentBanks).toBeUndefined();
            expect(bankDetailsConfig.UAH.correspondentForm).toBeUndefined();
            expect(bankDetailsConfig.UAH.currency).toBeUndefined();
        });
    });

    describe('USD config', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('createEmptyItem adds currency and correspondentBanks', () => {
            const item = bankDetailsConfig.USD.createEmptyItem({ receiver: 'John Doe' });
            expect((item as ForeignBankDetailsDto).receiver).toBe('John Doe');
            expect((item as ForeignBankDetailsDto).currency).toBe(BankCurrency.Usd);
            expect((item as ForeignBankDetailsDto).correspondentBanks).toEqual([]);
        });

        it('withCorrespondentBanks is exists on USD bank details', () => {
            expect(bankDetailsConfig.USD.withCorrespondentBanks).toBe(true);
        });

        it('correspondentForm is exists on USD bank details', () => {
            expect(bankDetailsConfig.USD.correspondentForm).toBeDefined();
        });

        it('currency is set to USD', () => {
            expect(bankDetailsConfig.USD.currency).toBe(BankCurrency.Usd);
        });

        it('fetch calls ForeignBankDetailsApi with USD currency', async () => {
            (ForeignBankDetailsApi.getAll as jest.Mock).mockResolvedValue([]);
            const result = await bankDetailsConfig.USD.fetch(mockClient);
            expect(result).toEqual([]);
            expect(ForeignBankDetailsApi.getAll).toHaveBeenCalledWith(mockClient, BankCurrency.Usd);
        });

        it('create calls ForeignBankDetailsApi.create with USD currency', async () => {
            const mockData = { receiver: 'John Doe', accountNumber: 'US123456' };
            const mockResponse = { id: 1, ...mockData, currency: BankCurrency.Usd } as unknown as ForeignBankDetailsDto;
            (ForeignBankDetailsApi.create as jest.Mock).mockResolvedValue(mockResponse);

            const result = await bankDetailsConfig.USD.create(mockClient, mockData);

            expect(result).toEqual(mockResponse);
            expect(ForeignBankDetailsApi.create).toHaveBeenCalledWith(mockClient, {
                ...mockData,
                currency: BankCurrency.Usd,
            });
        });

        it('update calls ForeignBankDetailsApi.update', async () => {
            const mockData = { receiver: 'Jane Doe' };
            const mockResponse = { id: 1, ...mockData, currency: BankCurrency.Usd } as ForeignBankDetailsDto;
            (ForeignBankDetailsApi.update as jest.Mock).mockResolvedValue(mockResponse);

            const result = await bankDetailsConfig.USD.update(mockClient, 1, mockData);

            expect(result).toEqual(mockResponse);
            expect(ForeignBankDetailsApi.update).toHaveBeenCalledWith(mockClient, 1, mockData);
        });

        it('delete calls ForeignBankDetailsApi.delete', async () => {
            (ForeignBankDetailsApi.delete as jest.Mock).mockResolvedValue(undefined);

            await bankDetailsConfig.USD.delete(mockClient, 1);

            expect(ForeignBankDetailsApi.delete).toHaveBeenCalledWith(mockClient, 1);
        });

        it('form exists', () => {
            expect(bankDetailsConfig.USD.form).toBeDefined();
        });
    });

    describe('EUR config', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('createEmptyItem adds currency and correspondentBanks', () => {
            const item = bankDetailsConfig.EUR.createEmptyItem({ address: 'Berlin' });
            expect((item as ForeignBankDetailsDto).address).toBe('Berlin');
            expect((item as ForeignBankDetailsDto).currency).toBe(BankCurrency.Eur);
            expect((item as ForeignBankDetailsDto).correspondentBanks).toEqual([]);
        });

        it('createEmptyItem preserves existing correspondentBanks', () => {
            const existingBanks = [{ id: 1, name: 'Correspondent Bank 1' }];
            const item = bankDetailsConfig.EUR.createEmptyItem({
                address: 'Berlin',
                correspondentBanks: existingBanks,
            });
            expect((item as ForeignBankDetailsDto).correspondentBanks).toEqual(existingBanks);
        });

        it('withCorrespondentBanks is exists on EUR bank details', () => {
            expect(bankDetailsConfig.EUR.withCorrespondentBanks).toBe(true);
        });

        it('correspondentForm is exists on EUR bank details', () => {
            expect(bankDetailsConfig.EUR.correspondentForm).toBeDefined();
        });

        it('currency is set to EUR', () => {
            expect(bankDetailsConfig.EUR.currency).toBe(BankCurrency.Eur);
        });

        it('fetch calls ForeignBankDetailsApi with EUR currency', async () => {
            (ForeignBankDetailsApi.getAll as jest.Mock).mockResolvedValue([]);
            const result = await bankDetailsConfig.EUR.fetch(mockClient);
            expect(result).toEqual([]);
            expect(ForeignBankDetailsApi.getAll).toHaveBeenCalledWith(mockClient, BankCurrency.Eur);
        });

        it('create calls ForeignBankDetailsApi.create with EUR currency', async () => {
            const mockData = { receiver: 'Hans Mueller', iban: 'DE89370400440532013000' };
            const mockResponse = { id: 1, ...mockData, currency: BankCurrency.Eur } as unknown as ForeignBankDetailsDto;
            (ForeignBankDetailsApi.create as jest.Mock).mockResolvedValue(mockResponse);

            const result = await bankDetailsConfig.EUR.create(mockClient, mockData);

            expect(result).toEqual(mockResponse);
            expect(ForeignBankDetailsApi.create).toHaveBeenCalledWith(mockClient, {
                ...mockData,
                currency: BankCurrency.Eur,
            });
        });

        it('update calls ForeignBankDetailsApi.update', async () => {
            const mockData = { receiver: 'Updated Receiver' };
            const mockResponse = { id: 1, ...mockData, currency: BankCurrency.Eur } as ForeignBankDetailsDto;
            (ForeignBankDetailsApi.update as jest.Mock).mockResolvedValue(mockResponse);

            const result = await bankDetailsConfig.EUR.update(mockClient, 1, mockData);

            expect(result).toEqual(mockResponse);
            expect(ForeignBankDetailsApi.update).toHaveBeenCalledWith(mockClient, 1, mockData);
        });

        it('delete calls ForeignBankDetailsApi.delete', async () => {
            (ForeignBankDetailsApi.delete as jest.Mock).mockResolvedValue(undefined);

            await bankDetailsConfig.EUR.delete(mockClient, 1);

            expect(ForeignBankDetailsApi.delete).toHaveBeenCalledWith(mockClient, 1);
        });

        it('form exists', () => {
            expect(bankDetailsConfig.EUR.form).toBeDefined();
        });
    });

    describe('Config structure validation', () => {
        it('all currency configs have required methods', () => {
            const currencies = ['UAH', 'USD', 'EUR'];

            currencies.forEach((currency) => {
                const config = bankDetailsConfig[currency];
                expect(config.form).toBeDefined();
                expect(config.createEmptyItem).toBeDefined();
                expect(config.fetch).toBeDefined();
                expect(config.create).toBeDefined();
                expect(config.update).toBeDefined();
                expect(config.delete).toBeDefined();
            });
        });

        it('only foreign currencies (USD, EUR) have correspondent banks configuration', () => {
            expect(bankDetailsConfig.UAH.withCorrespondentBanks).toBeUndefined();
            expect(bankDetailsConfig.UAH.correspondentForm).toBeUndefined();

            expect(bankDetailsConfig.USD.withCorrespondentBanks).toBe(true);
            expect(bankDetailsConfig.USD.correspondentForm).toBeDefined();

            expect(bankDetailsConfig.EUR.withCorrespondentBanks).toBe(true);
            expect(bankDetailsConfig.EUR.correspondentForm).toBeDefined();
        });
    });
});
