import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { bankDetailsConfig } from '../bank-details-currencies-config/BankDetailsCurrenciesConfig';
import { Currencies, useBankDetails } from './CurrenciesManager';

jest.mock('../bank-details-currencies-config/BankDetailsCurrenciesConfig', () => ({
    bankDetailsConfig: {
        UAH: { fetch: jest.fn() },
        USD: { fetch: jest.fn() },
        EUR: { fetch: jest.fn() },
    },
}));

describe('useBankDetails', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('повертає початковий стан і виконує fetch', async () => {
        const mockData = [{ id: 1, name: 'Bank1' }];
        (bankDetailsConfig.UAH.fetch as jest.Mock).mockResolvedValue(mockData);

        const { result } = renderHook(() => useBankDetails(Currencies.UAH));

        expect(result.current.isLoading).toBe(true);
        expect(result.current.items).toEqual([]);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.items).toEqual(mockData);
    });

    it('не оновлює state після unmount', async () => {
        const mockData = [{ id: 2, name: 'Bank2' }];
        (bankDetailsConfig.UAH.fetch as jest.Mock).mockResolvedValue(mockData);

        const { result, unmount } = renderHook(() => useBankDetails(Currencies.UAH));

        unmount();

        expect(result.current.items).toEqual([]);
    });
});
