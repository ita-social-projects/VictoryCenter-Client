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

    describe('bankDetailsConfig create/update/delete', () => {
        const mockClient = {} as AxiosInstance;

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('UAH: create, update, delete', async () => {
            (BankDetailsUahApi.create as jest.Mock).mockResolvedValue({ id: 1, name: 'MonoBank' });
            (BankDetailsUahApi.update as jest.Mock).mockResolvedValue({ id: 1, name: 'Updated' });
            (BankDetailsUahApi.delete as jest.Mock).mockResolvedValue(undefined);

            const createResult = await bankDetailsConfig.UAH.create(mockClient, { name: 'MonoBank' });
            expect(BankDetailsUahApi.create).toHaveBeenCalledWith(mockClient, { name: 'MonoBank' });
            expect(createResult).toEqual({ id: 1, name: 'MonoBank' });

            const updateResult = await bankDetailsConfig.UAH.update(mockClient, 1, { name: 'Updated' });
            expect(BankDetailsUahApi.update).toHaveBeenCalledWith(mockClient, 1, { name: 'Updated' });
            expect(updateResult).toEqual({ id: 1, name: 'Updated' });

            await bankDetailsConfig.UAH.delete(mockClient, 1);
            expect(BankDetailsUahApi.delete).toHaveBeenCalledWith(mockClient, 1);
        });

        it('USD: create, update, delete', async () => {
            (ForeignBankDetailsApi.create as jest.Mock).mockResolvedValue({
                id: 1,
                receiver: 'John Doe',
                currency: BankCurrency.Usd,
            });
            (ForeignBankDetailsApi.update as jest.Mock).mockResolvedValue({ id: 1, receiver: 'Updated' });
            (ForeignBankDetailsApi.delete as jest.Mock).mockResolvedValue(undefined);

            const createResult = await bankDetailsConfig.USD.create(mockClient, { receiver: 'John Doe' });
            expect(ForeignBankDetailsApi.create).toHaveBeenCalledWith(mockClient, {
                receiver: 'John Doe',
                currency: BankCurrency.Usd,
            });
            expect(createResult).toEqual({ id: 1, receiver: 'John Doe', currency: BankCurrency.Usd });

            const updateResult = await bankDetailsConfig.USD.update(mockClient, 1, { receiver: 'Updated' });
            expect(ForeignBankDetailsApi.update).toHaveBeenCalledWith(mockClient, 1, { receiver: 'Updated' });
            expect(updateResult).toEqual({ id: 1, receiver: 'Updated' });

            await bankDetailsConfig.USD.delete(mockClient, 1);
            expect(ForeignBankDetailsApi.delete).toHaveBeenCalledWith(mockClient, 1);
        });

        it('EUR: create, update, delete', async () => {
            (ForeignBankDetailsApi.create as jest.Mock).mockResolvedValue({
                id: 1,
                receiver: 'Jane Doe',
                currency: BankCurrency.Eur,
            });
            (ForeignBankDetailsApi.update as jest.Mock).mockResolvedValue({ id: 1, receiver: 'Updated' });
            (ForeignBankDetailsApi.delete as jest.Mock).mockResolvedValue(undefined);

            const createResult = await bankDetailsConfig.EUR.create(mockClient, { receiver: 'Jane Doe' });
            expect(ForeignBankDetailsApi.create).toHaveBeenCalledWith(mockClient, {
                receiver: 'Jane Doe',
                currency: BankCurrency.Eur,
            });
            expect(createResult).toEqual({ id: 1, receiver: 'Jane Doe', currency: BankCurrency.Eur });

            const updateResult = await bankDetailsConfig.EUR.update(mockClient, 1, { receiver: 'Updated' });
            expect(ForeignBankDetailsApi.update).toHaveBeenCalledWith(mockClient, 1, { receiver: 'Updated' });
            expect(updateResult).toEqual({ id: 1, receiver: 'Updated' });

            await bankDetailsConfig.EUR.delete(mockClient, 1);
            expect(ForeignBankDetailsApi.delete).toHaveBeenCalledWith(mockClient, 1);
        });
    });
});
