import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { bankDetailsConfig } from '../bank-details-currencies-config/BankDetailsCurrenciesConfig';
import { Currencies, mapCurrencyToBankCurrency, useBankDetails } from './CurrenciesManager';
import { BankCurrency } from '../../../../../../types/admin/donate';

jest.mock('../../../../../../hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(() => ({
        get: jest.fn(),
        post: jest.fn(),
    })),
}));

jest.mock('../bank-details-currencies-config/BankDetailsCurrenciesConfig', () => ({
    bankDetailsConfig: {
        UAH: { fetch: jest.fn() },
        USD: { fetch: jest.fn() },
        EUR: { fetch: jest.fn() },
    },
}));

describe('mapCurrencyToBankCurrency', () => {
    it('maps UAH to BankCurrency.Uah', () => {
        expect(mapCurrencyToBankCurrency(Currencies.UAH)).toBe(BankCurrency.Uah);
    });

    it('maps USD to BankCurrency.Usd', () => {
        expect(mapCurrencyToBankCurrency(Currencies.USD)).toBe(BankCurrency.Usd);
    });

    it('maps EUR to BankCurrency.Eur', () => {
        expect(mapCurrencyToBankCurrency(Currencies.EUR)).toBe(BankCurrency.Eur);
    });
});

describe('useBankDetails', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns initial state and fetches data successfully', async () => {
        const mockData = [{ id: 1, name: 'Bank1' }];
        (bankDetailsConfig.UAH.fetch as jest.Mock).mockResolvedValue(mockData);

        const { result } = renderHook(() => useBankDetails(Currencies.UAH));

        expect(result.current.isLoading).toBe(true);
        expect(result.current.items).toEqual([]);
        expect(result.current.config).toBe(bankDetailsConfig.UAH);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.items).toEqual(mockData);
    });

    it('handles fetch error and sets empty array', async () => {
        (bankDetailsConfig.USD.fetch as jest.Mock).mockRejectedValue(new Error('fail'));

        const { result } = renderHook(() => useBankDetails(Currencies.USD));

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.items).toEqual([]);
    });

    it('does not update state after unmount', async () => {
        const mockData = [{ id: 2, name: 'Bank2' }];
        (bankDetailsConfig.UAH.fetch as jest.Mock).mockResolvedValue(mockData);

        const { result, unmount } = renderHook(() => useBankDetails(Currencies.UAH));

        unmount();

        expect(result.current.items).toEqual([]);
    });

    it('allows external items update via setItems', async () => {
        const mockData = [{ id: 3, name: 'Bank3' }];
        (bankDetailsConfig.EUR.fetch as jest.Mock).mockResolvedValue(mockData);

        const { result } = renderHook(() => useBankDetails(Currencies.EUR));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        act(() => {
            result.current.setItems([...result.current.items, { id: 4, name: 'Bank4' }]);
        });

        expect(result.current.items).toHaveLength(2);
        expect(result.current.items[1]).toEqual({ id: 4, name: 'Bank4' });
    });
});
