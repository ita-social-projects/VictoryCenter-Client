import { bankDetailsConfig } from './BankDetailsCurrenciesConfig';
import { UahBankDetailsType, ForeignBankDetailsType } from '../../../../../../types/admin/donate';
import { BankDetailsUahApi } from '../../../../../../services/api/admin/donate/bank-details-uah/bank-details-uah-api';
import { AxiosInstance } from 'axios';

const mockClient = {} as AxiosInstance;

jest.mock('../../../../../../services/api/admin/donate/bank-details-uah/bank-details-uah-api');

describe('bankDetailsConfig', () => {
    describe('UAH config', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('createEmptyItem add id', () => {
            const item = bankDetailsConfig.UAH.createEmptyItem({ name: 'MonoBank' });
            expect(item).toHaveProperty('id');
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
        it('createEmptyItem add id', () => {
            const item = bankDetailsConfig.USD.createEmptyItem({ receiver: 'John Doe' });
            expect(item).toHaveProperty('id');
            expect((item as ForeignBankDetailsType).receiver).toBe('John Doe');
        });

        it('withCorrespondentBanks is exists on USD bank details', () => {
            expect(bankDetailsConfig.USD.withCorrespondentBanks).toBe(true);
        });

        it('correspondentForm is exists on USD bank details', () => {
            expect(bankDetailsConfig.USD.correspondentForm).toBeDefined();
        });

        it('fetch return empty array', async () => {
            const result = await bankDetailsConfig.USD.fetch(mockClient);
            expect(result).toEqual([]);
        });
    });

    describe('EUR config', () => {
        it('createEmptyItem add id', () => {
            const item = bankDetailsConfig.EUR.createEmptyItem({ address: 'Berlin' });
            expect(item).toHaveProperty('id');
            expect((item as ForeignBankDetailsType).address).toBe('Berlin');
        });

        it('fetch return empty array', async () => {
            const result = await bankDetailsConfig.EUR.fetch(mockClient);
            expect(result).toEqual([]);
        });

        it('form exists', () => {
            expect(bankDetailsConfig.EUR.form).toBeDefined();
        });
    });
});
