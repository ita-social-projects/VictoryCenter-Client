import { bankDetailsConfig } from './BankDetailsCurrenciesConfig';
import { UahBankDetailsType, ForeignBankDetailsType, BankCurrency } from '../../../../../../types/admin/donate';
import { BankDetailsUahApi } from '../../../../../../services/api/admin/donate/bank-details-uah/bank-details-uah-api';
import { ForeignBankDetailsApi } from '../../../../../../services/api/admin/donate/bank-details-foreign/bank-details-foreign-api';
import { AxiosInstance } from 'axios';

const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
} as unknown as AxiosInstance;

jest.mock('../../../../../../services/api/admin/donate/bank-details-uah/bank-details-uah-api');
jest.mock('../../../../../../services/api/admin/donate/bank-details-foreign/bank-details-foreign-api');

describe('bankDetailsConfig', () => {
    describe('UAH config', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('createEmptyItem returns item without id initially', () => {
            const item = bankDetailsConfig.UAH.createEmptyItem({ name: 'MonoBank' });

            expect((item as UahBankDetailsType).name).toBe('MonoBank');
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
    });

    describe('USD config', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('createEmptyItem adds currency and correspondentBanks', () => {
            const item = bankDetailsConfig.USD.createEmptyItem({ receiver: 'John Doe' });

            expect((item as ForeignBankDetailsType).receiver).toBe('John Doe');
            expect((item as ForeignBankDetailsType).currency).toBe(BankCurrency.Usd);
            expect((item as ForeignBankDetailsType).correspondentBanks).toEqual([]);
        });

        it('withCorrespondentBanks is exists on USD bank details', () => {
            expect(bankDetailsConfig.USD.withCorrespondentBanks).toBe(true);
        });

        it('correspondentForm is exists on USD bank details', () => {
            expect(bankDetailsConfig.USD.correspondentForm).toBeDefined();
        });

        it('fetch calls ForeignBankDetailsApi with USD currency', async () => {
            (ForeignBankDetailsApi.getAll as jest.Mock).mockResolvedValue([]);
            const result = await bankDetailsConfig.USD.fetch(mockClient);
            expect(result).toEqual([]);
            expect(ForeignBankDetailsApi.getAll).toHaveBeenCalledWith(mockClient, BankCurrency.Usd);
        });
    });

    describe('EUR config', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('createEmptyItem adds currency and correspondentBanks', () => {
            const item = bankDetailsConfig.EUR.createEmptyItem({ address: 'Berlin' });

            expect((item as ForeignBankDetailsType).address).toBe('Berlin');
            expect((item as ForeignBankDetailsType).currency).toBe(BankCurrency.Eur);
            expect((item as ForeignBankDetailsType).correspondentBanks).toEqual([]);
        });

        it('fetch calls ForeignBankDetailsApi with EUR currency', async () => {
            (ForeignBankDetailsApi.getAll as jest.Mock).mockResolvedValue([]);
            const result = await bankDetailsConfig.EUR.fetch(mockClient);
            expect(result).toEqual([]);
            expect(ForeignBankDetailsApi.getAll).toHaveBeenCalledWith(mockClient, BankCurrency.Eur);
        });

        it('form exists', () => {
            expect(bankDetailsConfig.EUR.form).toBeDefined();
        });
    });
});
