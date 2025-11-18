import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { Currencies, mapCurrencyToBankCurrency, useBankDetails } from './CurrenciesManager';
import { BankCurrency } from '../../../../../../types/admin/donate';

import { bankDetailsConfig } from '../bank-details-currencies-config/BankDetailsCurrenciesConfig';

jest.mock('../../../../../../hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(() => ({
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    })),
}));

// Fix: Create mock functions inside the mock factory using jest.fn()
jest.mock('../bank-details-currencies-config/BankDetailsCurrenciesConfig', () => ({
    bankDetailsConfig: {
        UAH: {
            fetch: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createEmptyItem: jest.fn(),
        },
        USD: {
            fetch: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createEmptyItem: jest.fn(),
            withCorrespondentBanks: true,
            currency: 1, // BankCurrency.Usd
        },
        EUR: {
            fetch: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createEmptyItem: jest.fn(),
            withCorrespondentBanks: true,
            currency: 2, // BankCurrency.Eur
        },
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

    it('handles all enum values', () => {
        const currencies = Object.values(Currencies);
        currencies.forEach((currency) => {
            expect(mapCurrencyToBankCurrency(currency)).toBeDefined();
        });
    });

    it('maps to correct BankCurrency types', () => {
        expect(mapCurrencyToBankCurrency(Currencies.UAH)).toBe(0); // BankCurrency.Uah
        expect(mapCurrencyToBankCurrency(Currencies.USD)).toBe(1); // BankCurrency.Usd
        expect(mapCurrencyToBankCurrency(Currencies.EUR)).toBe(2); // BankCurrency.Eur
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

    describe('Currency switching behavior', () => {
        it('refetches data when currency changes', async () => {
            const uahData = [{ id: 1, name: 'UAH Bank' }];
            const usdData = [{ id: 2, name: 'USD Bank' }];

            (bankDetailsConfig.UAH.fetch as jest.Mock).mockResolvedValue(uahData);
            (bankDetailsConfig.USD.fetch as jest.Mock).mockResolvedValue(usdData);

            const { result, rerender } = renderHook(({ currency }) => useBankDetails(currency), {
                initialProps: { currency: Currencies.UAH },
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.items).toEqual(uahData);
            expect(bankDetailsConfig.UAH.fetch).toHaveBeenCalledTimes(1);

            // Change currency
            rerender({ currency: Currencies.USD });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.items).toEqual(usdData);
            expect(bankDetailsConfig.USD.fetch).toHaveBeenCalledTimes(1);
        });

        it('returns correct config for each currency', async () => {
            // Setup mocks to resolve immediately
            (bankDetailsConfig.UAH.fetch as jest.Mock).mockResolvedValue([]);
            (bankDetailsConfig.USD.fetch as jest.Mock).mockResolvedValue([]);
            (bankDetailsConfig.EUR.fetch as jest.Mock).mockResolvedValue([]);

            const { result: uahResult } = renderHook(() => useBankDetails(Currencies.UAH));
            const { result: usdResult } = renderHook(() => useBankDetails(Currencies.USD));
            const { result: eurResult } = renderHook(() => useBankDetails(Currencies.EUR));

            // Wait for all hooks to complete their initial fetch
            await waitFor(() => {
                expect(uahResult.current.isLoading).toBe(false);
                expect(usdResult.current.isLoading).toBe(false);
                expect(eurResult.current.isLoading).toBe(false);
            });

            expect(uahResult.current.config).toHaveProperty('fetch');
            expect(usdResult.current.config).toHaveProperty('fetch');
            expect(eurResult.current.config).toHaveProperty('fetch');
        });
    });

    describe('Loading state management', () => {
        it('sets loading to true during fetch', async () => {
            let resolvePromise: (value: any) => void;
            const mockPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            (bankDetailsConfig.UAH.fetch as jest.Mock).mockReturnValue(mockPromise);

            const { result } = renderHook(() => useBankDetails(Currencies.UAH));

            expect(result.current.isLoading).toBe(true);

            // Resolve the promise
            act(() => {
                resolvePromise([{ id: 1, name: 'Bank' }]);
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });

        it('sets loading to false even when fetch fails', async () => {
            (bankDetailsConfig.EUR.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useBankDetails(Currencies.EUR));

            expect(result.current.isLoading).toBe(true);

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });

        it('maintains loading state correctly during multiple rapid changes', async () => {
            const mockData1 = [{ id: 1, name: 'Bank1' }];
            const mockData2 = [{ id: 2, name: 'Bank2' }];

            (bankDetailsConfig.UAH.fetch as jest.Mock).mockResolvedValue(mockData1);
            (bankDetailsConfig.USD.fetch as jest.Mock).mockResolvedValue(mockData2);

            const { result, rerender } = renderHook(({ currency }) => useBankDetails(currency), {
                initialProps: { currency: Currencies.UAH },
            });

            expect(result.current.isLoading).toBe(true);

            // Quickly change currency before first resolves
            rerender({ currency: Currencies.USD });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.items).toEqual(mockData2);
        });
    });

    describe('Error handling', () => {
        it('handles network errors gracefully', async () => {
            (bankDetailsConfig.USD.fetch as jest.Mock).mockRejectedValue(new Error('Network timeout'));

            const { result } = renderHook(() => useBankDetails(Currencies.USD));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.items).toEqual([]);
        });

        it('handles API errors gracefully', async () => {
            (bankDetailsConfig.EUR.fetch as jest.Mock).mockRejectedValue({
                response: { status: 500, data: 'Internal Server Error' },
            });

            const { result } = renderHook(() => useBankDetails(Currencies.EUR));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.items).toEqual([]);
        });

        it('handles undefined/null response gracefully', async () => {
            (bankDetailsConfig.UAH.fetch as jest.Mock).mockResolvedValue(null);

            const { result } = renderHook(() => useBankDetails(Currencies.UAH));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.items).toBe(null);
        });
    });

    describe('setItems functionality', () => {
        it('allows complete replacement of items', async () => {
            const initialData = [
                { id: 1, name: 'Bank1' },
                { id: 2, name: 'Bank2' },
            ];
            const newData = [{ id: 3, name: 'Bank3' }];

            (bankDetailsConfig.UAH.fetch as jest.Mock).mockResolvedValue(initialData);

            const { result } = renderHook(() => useBankDetails(Currencies.UAH));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.items).toEqual(initialData);

            act(() => {
                result.current.setItems(newData);
            });

            expect(result.current.items).toEqual(newData);
        });

        it('allows adding items to existing list', async () => {
            const initialData = [{ id: 1, name: 'Bank1' }];
            (bankDetailsConfig.USD.fetch as jest.Mock).mockResolvedValue(initialData);

            const { result } = renderHook(() => useBankDetails(Currencies.USD));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.setItems([...result.current.items, { id: 2, name: 'Bank2' }]);
            });

            expect(result.current.items).toHaveLength(2);
            expect(result.current.items[1]).toEqual({ id: 2, name: 'Bank2' });
        });

        it('allows removing items from list', async () => {
            const initialData = [
                { id: 1, name: 'Bank1' },
                { id: 2, name: 'Bank2' },
            ];
            (bankDetailsConfig.EUR.fetch as jest.Mock).mockResolvedValue(initialData);

            const { result } = renderHook(() => useBankDetails(Currencies.EUR));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.setItems(result.current.items.filter((item) => item.id !== 1));
            });

            expect(result.current.items).toHaveLength(1);
            expect(result.current.items[0]).toEqual({ id: 2, name: 'Bank2' });
        });

        it('allows updating specific items', async () => {
            const initialData = [{ id: 1, name: 'Bank1', amount: 100 }];
            (bankDetailsConfig.UAH.fetch as jest.Mock).mockResolvedValue(initialData);

            const { result } = renderHook(() => useBankDetails(Currencies.UAH));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.setItems(
                    result.current.items.map((item) => (item.id === 1 ? { ...item, name: 'Updated Bank' } : item)),
                );
            });

            expect(result.current.items[0]).toEqual({ id: 1, name: 'Updated Bank', amount: 100 });
        });

        it('preserves setItems functionality after currency change', async () => {
            const uahData = [{ id: 1, name: 'UAH Bank' }];
            const usdData = [{ id: 2, name: 'USD Bank' }];

            (bankDetailsConfig.UAH.fetch as jest.Mock).mockResolvedValue(uahData);
            (bankDetailsConfig.USD.fetch as jest.Mock).mockResolvedValue(usdData);

            const { result, rerender } = renderHook(({ currency }) => useBankDetails(currency), {
                initialProps: { currency: Currencies.UAH },
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            rerender({ currency: Currencies.USD });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.setItems([...result.current.items, { id: 3, name: 'New Bank' }]);
            });

            expect(result.current.items).toHaveLength(2);
        });
    });

    describe('Memory leak prevention', () => {
        it('prevents state update after component unmount during fetch', async () => {
            let resolvePromise: (value: any) => void;
            const mockPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            (bankDetailsConfig.UAH.fetch as jest.Mock).mockReturnValue(mockPromise);

            const { result, unmount } = renderHook(() => useBankDetails(Currencies.UAH));

            expect(result.current.isLoading).toBe(true);

            unmount();

            // Resolve after unmount
            act(() => {
                resolvePromise([{ id: 1, name: 'Bank' }]);
            });

            // Should not cause any warnings or errors
        });

        it('prevents state update after component unmount during error', async () => {
            let rejectPromise: (error: Error) => void;
            const mockPromise = new Promise((_, reject) => {
                rejectPromise = reject;
            });
            (bankDetailsConfig.USD.fetch as jest.Mock).mockReturnValue(mockPromise);

            const { result, unmount } = renderHook(() => useBankDetails(Currencies.USD));

            expect(result.current.isLoading).toBe(true);

            unmount();

            // Reject after unmount
            act(() => {
                rejectPromise(new Error('Test error'));
            });

            // Should not cause any warnings or errors
        });
    });

    describe('Client dependency', () => {
        it('passes client to fetch function', async () => {
            const mockClient = { get: jest.fn(), post: jest.fn() };
            const mockUseAdminClient =
                require('../../../../../../hooks/admin/use-admin-client/useAdminClient').useAdminClient;
            mockUseAdminClient.mockReturnValue(mockClient);

            const mockData = [{ id: 1, name: 'Bank1' }];
            (bankDetailsConfig.EUR.fetch as jest.Mock).mockResolvedValue(mockData);

            renderHook(() => useBankDetails(Currencies.EUR));

            await waitFor(() => {
                expect(bankDetailsConfig.EUR.fetch).toHaveBeenCalledWith(mockClient);
            });
        });

        it('refetches when client changes', async () => {
            const mockClient1 = { get: jest.fn(), post: jest.fn() };
            const mockClient2 = { get: jest.fn(), post: jest.fn() };
            const mockUseAdminClient =
                require('../../../../../../hooks/admin/use-admin-client/useAdminClient').useAdminClient;

            mockUseAdminClient.mockReturnValueOnce(mockClient1).mockReturnValue(mockClient2);

            const mockData = [{ id: 1, name: 'Bank1' }];
            (bankDetailsConfig.UAH.fetch as jest.Mock).mockResolvedValue(mockData);

            const { rerender } = renderHook(() => useBankDetails(Currencies.UAH));

            await waitFor(() => {
                expect(bankDetailsConfig.UAH.fetch).toHaveBeenCalledWith(mockClient1);
            });

            rerender();

            await waitFor(() => {
                expect(bankDetailsConfig.UAH.fetch).toHaveBeenCalledWith(mockClient2);
            });

            expect(bankDetailsConfig.UAH.fetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('Config properties', () => {
        it('exposes config properties correctly for UAH', async () => {
            (bankDetailsConfig.UAH.fetch as jest.Mock).mockResolvedValue([]);

            const { result } = renderHook(() => useBankDetails(Currencies.UAH));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.config).toHaveProperty('fetch');
            expect(result.current.config).toHaveProperty('create');
            expect(result.current.config).toHaveProperty('update');
            expect(result.current.config).toHaveProperty('delete');
            expect(result.current.config).toHaveProperty('createEmptyItem');
            expect(result.current.config.withCorrespondentBanks).toBeUndefined();
        });

        it('exposes config properties correctly for foreign currencies', async () => {
            (bankDetailsConfig.USD.fetch as jest.Mock).mockResolvedValue([]);
            (bankDetailsConfig.EUR.fetch as jest.Mock).mockResolvedValue([]);

            const { result: usdResult } = renderHook(() => useBankDetails(Currencies.USD));
            const { result: eurResult } = renderHook(() => useBankDetails(Currencies.EUR));

            await waitFor(() => {
                expect(usdResult.current.isLoading).toBe(false);
                expect(eurResult.current.isLoading).toBe(false);
            });

            [usdResult, eurResult].forEach((result) => {
                expect(result.current.config).toHaveProperty('fetch');
                expect(result.current.config).toHaveProperty('create');
                expect(result.current.config).toHaveProperty('update');
                expect(result.current.config).toHaveProperty('delete');
                expect(result.current.config).toHaveProperty('createEmptyItem');
                expect(result.current.config.withCorrespondentBanks).toBe(true);
                expect(result.current.config.currency).toBeDefined();
            });
        });
    });
});
