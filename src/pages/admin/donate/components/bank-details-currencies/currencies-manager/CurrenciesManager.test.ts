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
            currency: 1,
        },
        EUR: {
            fetch: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createEmptyItem: jest.fn(),
            withCorrespondentBanks: true,
            currency: 2,
        },
    },
}));

describe('mapCurrencyToBankCurrency', () => {
    const currencyMappings = [
        { input: Currencies.UAH, expected: BankCurrency.Uah, expectedValue: 0 },
        { input: Currencies.USD, expected: BankCurrency.Usd, expectedValue: 1 },
        { input: Currencies.EUR, expected: BankCurrency.Eur, expectedValue: 2 },
    ];

    currencyMappings.forEach(({ input, expected, expectedValue }) => {
        it(`maps ${input} to BankCurrency.${BankCurrency[expected]}`, () => {
            expect(mapCurrencyToBankCurrency(input)).toBe(expected);
        });

        it(`maps ${input} to correct numeric value ${expectedValue}`, () => {
            expect(mapCurrencyToBankCurrency(input)).toBe(expectedValue);
        });
    });

    it('handles all enum values', () => {
        const currencies = Object.values(Currencies);
        currencies.forEach((currency) => {
            expect(mapCurrencyToBankCurrency(currency)).toBeDefined();
        });
    });
});

describe('useBankDetails', () => {
    const mockFetchResolve = (currency: Currencies, data: any) => {
        (bankDetailsConfig[currency].fetch as jest.Mock).mockResolvedValue(data);
    };

    const mockFetchReject = (currency: Currencies, error: any) => {
        (bankDetailsConfig[currency].fetch as jest.Mock).mockRejectedValue(error);
    };

    const mockFetchReturn = (currency: Currencies, promise: Promise<any>) => {
        (bankDetailsConfig[currency].fetch as jest.Mock).mockReturnValue(promise);
    };

    const waitForLoadingComplete = async (result: any) => {
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
    };

    const createMockData = (id: number, name: string, extra: any = {}) => ({
        id,
        name,
        ...extra,
    });

    const createControlledPromise = () => {
        let resolvePromise: (value: any) => void;
        let rejectPromise: (error: any) => void;
        const promise = new Promise((resolve, reject) => {
            resolvePromise = resolve;
            rejectPromise = reject;
        });
        return { promise, resolvePromise: resolvePromise!, rejectPromise: rejectPromise! };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Initial state and basic functionality', () => {
        it('returns initial state and fetches data successfully', async () => {
            const mockData = [createMockData(1, 'Bank1')];
            mockFetchResolve(Currencies.UAH, mockData);

            const { result } = renderHook(() => useBankDetails(Currencies.UAH));

            expect(result.current.isLoading).toBe(true);
            expect(result.current.items).toEqual([]);

            await waitForLoadingComplete(result);
            expect(result.current.items).toEqual(mockData);
        });

        it('handles fetch error and sets empty array', async () => {
            mockFetchReject(Currencies.USD, new Error('fail'));

            const { result } = renderHook(() => useBankDetails(Currencies.USD));

            expect(result.current.isLoading).toBe(true);
            await waitForLoadingComplete(result);
            expect(result.current.items).toEqual([]);
        });

        it('does not update state after unmount', async () => {
            const mockData = [createMockData(2, 'Bank2')];
            mockFetchResolve(Currencies.UAH, mockData);

            const { result, unmount } = renderHook(() => useBankDetails(Currencies.UAH));

            unmount();
            expect(result.current.items).toEqual([]);
        });

        it('allows external items update via setItems', async () => {
            const mockData = [createMockData(3, 'Bank3')];
            mockFetchResolve(Currencies.EUR, mockData);

            const { result } = renderHook(() => useBankDetails(Currencies.EUR));

            await waitForLoadingComplete(result);

            act(() => {
                result.current.setItems([...result.current.items, createMockData(4, 'Bank4')]);
            });

            expect(result.current.items).toHaveLength(2);
            expect(result.current.items[1]).toEqual(createMockData(4, 'Bank4'));
        });
    });

    describe('Currency switching behavior', () => {
        it('refetches data when currency changes', async () => {
            const uahData = [createMockData(1, 'UAH Bank')];
            const usdData = [createMockData(2, 'USD Bank')];

            mockFetchResolve(Currencies.UAH, uahData);
            mockFetchResolve(Currencies.USD, usdData);

            const { result, rerender } = renderHook(({ currency }) => useBankDetails(currency), {
                initialProps: { currency: Currencies.UAH },
            });

            await waitForLoadingComplete(result);
            expect(result.current.items).toEqual(uahData);
            expect(bankDetailsConfig.UAH.fetch).toHaveBeenCalledTimes(1);

            rerender({ currency: Currencies.USD });
            await waitForLoadingComplete(result);
            expect(result.current.items).toEqual(usdData);
            expect(bankDetailsConfig.USD.fetch).toHaveBeenCalledTimes(1);
        });

        it('returns correct config for each currency', async () => {
            [Currencies.UAH, Currencies.USD, Currencies.EUR].forEach((currency) => {
                mockFetchResolve(currency, []);
            });

            const results = await Promise.all([
                renderHook(() => useBankDetails(Currencies.UAH)),
                renderHook(() => useBankDetails(Currencies.USD)),
                renderHook(() => useBankDetails(Currencies.EUR)),
            ]);

            await Promise.all(results.map(({ result }) => waitForLoadingComplete(result)));

            results.forEach(({ result }) => {
                expect(result.current.config).toHaveProperty('fetch');
            });
        });
    });

    describe('Loading state management', () => {
        it('sets loading to true during fetch', async () => {
            const { promise, resolvePromise } = createControlledPromise();
            mockFetchReturn(Currencies.UAH, promise);

            const { result } = renderHook(() => useBankDetails(Currencies.UAH));

            expect(result.current.isLoading).toBe(true);

            act(() => {
                resolvePromise([createMockData(1, 'Bank')]);
            });

            await waitForLoadingComplete(result);
        });

        it('sets loading to false even when fetch fails', async () => {
            mockFetchReject(Currencies.EUR, new Error('Network error'));

            const { result } = renderHook(() => useBankDetails(Currencies.EUR));

            expect(result.current.isLoading).toBe(true);
            await waitForLoadingComplete(result);
        });

        it('maintains loading state correctly during multiple rapid changes', async () => {
            const mockData1 = [createMockData(1, 'Bank1')];
            const mockData2 = [createMockData(2, 'Bank2')];

            mockFetchResolve(Currencies.UAH, mockData1);
            mockFetchResolve(Currencies.USD, mockData2);

            const { result, rerender } = renderHook(({ currency }) => useBankDetails(currency), {
                initialProps: { currency: Currencies.UAH },
            });

            expect(result.current.isLoading).toBe(true);

            rerender({ currency: Currencies.USD });

            await waitForLoadingComplete(result);
            expect(result.current.items).toEqual(mockData2);
        });
    });

    describe('Error handling', () => {
        const errorScenarios = [
            {
                name: 'network errors',
                currency: Currencies.USD,
                error: new Error('Network timeout'),
            },
            {
                name: 'API errors',
                currency: Currencies.EUR,
                error: { response: { status: 500, data: 'Internal Server Error' } },
            },
        ];

        errorScenarios.forEach(({ name, currency, error }) => {
            it(`handles ${name} gracefully`, async () => {
                mockFetchReject(currency, error);

                const { result } = renderHook(() => useBankDetails(currency));

                await waitForLoadingComplete(result);
                expect(result.current.items).toEqual([]);
            });
        });

        it('handles undefined/null response gracefully', async () => {
            mockFetchResolve(Currencies.UAH, null);

            const { result } = renderHook(() => useBankDetails(Currencies.UAH));

            await waitForLoadingComplete(result);
            expect(result.current.items).toBe([]);
        });
    });

    describe('setItems functionality', () => {
        const setItemsScenarios = [
            {
                name: 'complete replacement of items',
                currency: Currencies.UAH,
                initialData: [createMockData(1, 'Bank1'), createMockData(2, 'Bank2')],
                newData: [createMockData(3, 'Bank3')],
                operation: (setItems: any, _current: any, newData: any) => setItems(newData),
                expectedLength: 1,
                validate: (items: any[], newData: any[]) => expect(items).toEqual(newData),
            },
            {
                name: 'adding items to existing list',
                currency: Currencies.USD,
                initialData: [createMockData(1, 'Bank1')],
                newData: createMockData(2, 'Bank2'),
                operation: (setItems: any, current: any[], newData: any) => setItems([...current, newData]),
                expectedLength: 2,
                validate: (items: any[], newData: any) => expect(items[1]).toEqual(newData),
            },
            {
                name: 'removing items from list',
                currency: Currencies.EUR,
                initialData: [createMockData(1, 'Bank1'), createMockData(2, 'Bank2')],
                newData: null,
                operation: (setItems: any, current: any[]) => setItems(current.filter((item) => item.id !== 1)),
                expectedLength: 1,
                validate: (items: any[]) => expect(items[0]).toEqual(createMockData(2, 'Bank2')),
            },
            {
                name: 'updating specific items',
                currency: Currencies.UAH,
                initialData: [createMockData(1, 'Bank1', { amount: 100 })],
                newData: 'Updated Bank',
                operation: (setItems: any, current: any[], newData: string) =>
                    setItems(current.map((item) => (item.id === 1 ? { ...item, name: newData } : item))),
                expectedLength: 1,
                validate: (items: any[], newData: string) =>
                    expect(items[0]).toEqual(createMockData(1, newData, { amount: 100 })),
            },
        ];

        setItemsScenarios.forEach(({ name, currency, initialData, newData, operation, expectedLength, validate }) => {
            it(`allows ${name}`, async () => {
                mockFetchResolve(currency, initialData);

                const { result } = renderHook(() => useBankDetails(currency));

                await waitForLoadingComplete(result);
                expect(result.current.items).toEqual(initialData);

                act(() => {
                    operation(result.current.setItems, result.current.items, newData);
                });

                expect(result.current.items).toHaveLength(expectedLength);
                validate(result.current.items, newData);
            });
        });

        it('preserves setItems functionality after currency change', async () => {
            const uahData = [createMockData(1, 'UAH Bank')];
            const usdData = [createMockData(2, 'USD Bank')];

            mockFetchResolve(Currencies.UAH, uahData);
            mockFetchResolve(Currencies.USD, usdData);

            const { result, rerender } = renderHook(({ currency }) => useBankDetails(currency), {
                initialProps: { currency: Currencies.UAH },
            });

            await waitForLoadingComplete(result);
            rerender({ currency: Currencies.USD });
            await waitForLoadingComplete(result);

            act(() => {
                result.current.setItems([...result.current.items, createMockData(3, 'New Bank')]);
            });

            expect(result.current.items).toHaveLength(2);
        });
    });

    describe('Memory leak prevention', () => {
        const memoryLeakScenarios = [
            {
                name: 'during fetch',
                setupPromise: () => {
                    const { promise, resolvePromise } = createControlledPromise();
                    return {
                        promise,
                        triggerAfterUnmount: () => resolvePromise([createMockData(1, 'Bank')]),
                    };
                },
            },
            {
                name: 'during error',
                setupPromise: () => {
                    const { promise, rejectPromise } = createControlledPromise();
                    return {
                        promise,
                        triggerAfterUnmount: () => rejectPromise(new Error('Test error')),
                    };
                },
            },
        ];

        memoryLeakScenarios.forEach(({ name, setupPromise }) => {
            it(`prevents state update after component unmount ${name}`, async () => {
                const { promise, triggerAfterUnmount } = setupPromise();
                mockFetchReturn(Currencies.UAH, promise);

                const { result, unmount } = renderHook(() => useBankDetails(Currencies.UAH));

                expect(result.current.isLoading).toBe(true);
                unmount();

                act(() => {
                    triggerAfterUnmount();
                });
            });
        });
    });

    describe('Client dependency', () => {
        const getMockUseAdminClient = () =>
            require('../../../../../../hooks/admin/use-admin-client/useAdminClient').useAdminClient;

        it('passes client to fetch function', async () => {
            const mockClient = { get: jest.fn(), post: jest.fn() };
            getMockUseAdminClient().mockReturnValue(mockClient);

            const mockData = [createMockData(1, 'Bank1')];
            mockFetchResolve(Currencies.EUR, mockData);

            renderHook(() => useBankDetails(Currencies.EUR));

            await waitFor(() => {
                expect(bankDetailsConfig.EUR.fetch).toHaveBeenCalledWith(mockClient);
            });
        });

        it('refetches when client changes', async () => {
            const mockClient1 = { get: jest.fn(), post: jest.fn() };
            const mockClient2 = { get: jest.fn(), post: jest.fn() };
            const mockUseAdminClient = getMockUseAdminClient();

            mockUseAdminClient.mockReturnValueOnce(mockClient1).mockReturnValue(mockClient2);

            const mockData = [createMockData(1, 'Bank1')];
            mockFetchResolve(Currencies.UAH, mockData);

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
});
