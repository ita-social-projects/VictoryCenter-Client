import { renderHook, act } from '@testing-library/react';
import { useFundsAmountEdit } from './useFundsAmountEdit';
import { isUsdAmountMismatch } from '@/utils/functions/validate-usd-amount-mismatch/validate-usd-amount-mismatch';

jest.mock('@/utils/functions/validate-usd-amount-mismatch/validate-usd-amount-mismatch', () => ({
    isUsdAmountMismatch: jest.fn(() => false),
}));

const toNumber = (value: string) => Number.parseFloat(value.replace(/\s/g, '').replace(',', '.'));

const convertUahToUsd = (uah: number, rate: number) => {
    const converted = uah / rate;
    const rounded = Number.parseFloat(converted.toFixed(2));
    return rounded % 1 === 0 ? String(rounded) : String(rounded).replace('.', ',');
};

const convertUsdToUah = (usd: number, rate: number) => {
    const converted = usd * rate;
    const rounded = Number.parseFloat(converted.toFixed(2));
    return rounded % 1 === 0 ? String(rounded) : String(rounded).replace('.', ',');
};

jest.mock('@/utils/functions/update-funds-amounts/update-funds-amounts', () => ({
    updateFundsAmounts:
        (field: 'amountUah' | 'amountUsd', value: string, exchangeRate: string | null, trigger: 'change' | 'blur') =>
        (state: { amountUah: string; amountUsd: string; errors: Record<string, string | undefined> }) => {
            const numericValue = toNumber(value);
            const rate = exchangeRate ? Number.parseFloat(exchangeRate) : null;

            let nextAmountUah = field === 'amountUah' ? value : state.amountUah;
            let nextAmountUsd = field === 'amountUsd' ? value : state.amountUsd;

            const canConvert = rate !== null && !Number.isNaN(numericValue);

            if (canConvert && field === 'amountUah') {
                nextAmountUsd = convertUahToUsd(numericValue, rate);
            }

            if (canConvert && field === 'amountUsd') {
                nextAmountUah = convertUsdToUah(numericValue, rate);
            }

            const errors: Record<string, string | undefined> = {
                amountUah: undefined,
                amountUsd: undefined,
            };

            if (trigger === 'blur' && value.trim() === '') {
                if (field === 'amountUah') errors.amountUah = 'Field is required';
                if (field === 'amountUsd') errors.amountUsd = 'Field is required';
            }

            return { amountUah: nextAmountUah, amountUsd: nextAmountUsd, errors };
        },
}));

interface TestState {
    recordId: number;
    originalAmountUah: string;
    originalAmountUsd: string;
    amountUah: string;
    amountUsd: string;
    errors: {
        amountUah?: string;
        amountUsd?: string;
    };
    usdMismatchMessage?: string;
}

const makeState = (overrides: Partial<TestState> = {}): TestState => ({
    recordId: 1,
    originalAmountUah: '7 265',
    originalAmountUsd: '4 200',
    amountUah: '7 265',
    amountUsd: '4 200',
    errors: {},
    usdMismatchMessage: undefined,
    ...overrides,
});

const applyUpdater = (setEditState: jest.Mock, prevState: TestState): TestState => {
    const updater = setEditState.mock.calls.at(-1)[0];
    return updater(prevState);
};

describe('useFundsAmountEdit', () => {
    const MISMATCH_MESSAGE = 'Amount USD does not match';

    beforeEach(() => {
        jest.mocked(isUsdAmountMismatch).mockReturnValue(false);
    });

    describe('handleAmountChange', () => {
        it('should not update state when recordId does not match', () => {
            const setEditState = jest.fn();
            const { result } = renderHook(() =>
                useFundsAmountEdit({ exchangeRate: '40', mismatchMessage: MISMATCH_MESSAGE, setEditState }),
            );

            act(() => {
                result.current.handleAmountChange(999, 'amountUah', '5000');
            });

            const prev = makeState();
            const next = applyUpdater(setEditState, prev);

            expect(next).toBe(prev);
        });

        it('should clear usdMismatchMessage on any amount change', () => {
            const setEditState = jest.fn();
            const { result } = renderHook(() =>
                useFundsAmountEdit({ exchangeRate: '40', mismatchMessage: MISMATCH_MESSAGE, setEditState }),
            );

            act(() => {
                result.current.handleAmountChange(1, 'amountUah', '8 000');
            });

            const next = applyUpdater(setEditState, makeState({ usdMismatchMessage: MISMATCH_MESSAGE }));

            expect(next.usdMismatchMessage).toBeUndefined();
        });

        it('should recalculate USD when UAH amount changes with a valid exchange rate', () => {
            const setEditState = jest.fn();
            const { result } = renderHook(() =>
                useFundsAmountEdit({ exchangeRate: '40', mismatchMessage: MISMATCH_MESSAGE, setEditState }),
            );

            act(() => {
                result.current.handleAmountChange(1, 'amountUah', '8 000');
            });

            const next = applyUpdater(setEditState, makeState());

            expect(next.amountUsd).toBe('200');
        });

        it('should not recalculate USD when exchange rate is null', () => {
            const setEditState = jest.fn();
            const { result } = renderHook(() =>
                useFundsAmountEdit({ exchangeRate: null, mismatchMessage: MISMATCH_MESSAGE, setEditState }),
            );

            act(() => {
                result.current.handleAmountChange(1, 'amountUah', '8 000');
            });

            const prev = makeState({ amountUsd: '4 200' });
            const next = applyUpdater(setEditState, prev);

            expect(next.amountUsd).toBe('4 200');
        });

        it('should use the actual exchange rate for conversion', () => {
            const setEditState = jest.fn();
            const { result } = renderHook(() =>
                useFundsAmountEdit({ exchangeRate: '42', mismatchMessage: MISMATCH_MESSAGE, setEditState }),
            );

            act(() => {
                result.current.handleAmountChange(1, 'amountUah', '50 000');
            });

            const next = applyUpdater(setEditState, makeState({ amountUah: '500 000', amountUsd: '13 500' }));

            expect(next.amountUsd).toBe('1190,48');
        });

        it('should recalculate UAH when USD amount changes with a valid exchange rate', () => {
            const setEditState = jest.fn();
            const { result } = renderHook(() =>
                useFundsAmountEdit({ exchangeRate: '40', mismatchMessage: MISMATCH_MESSAGE, setEditState }),
            );

            act(() => {
                result.current.handleAmountChange(1, 'amountUsd', '8 000');
            });

            const next = applyUpdater(setEditState, makeState());

            expect(next.amountUah).toBe('320000');
        });

        it('should not recalculate UAH when exchange rate is null', () => {
            const setEditState = jest.fn();
            const { result } = renderHook(() =>
                useFundsAmountEdit({ exchangeRate: null, mismatchMessage: MISMATCH_MESSAGE, setEditState }),
            );

            act(() => {
                result.current.handleAmountChange(1, 'amountUsd', '8 000');
            });

            const prev = makeState({ amountUah: '7 265' });
            const next = applyUpdater(setEditState, prev);

            expect(next.amountUah).toBe('7 265');
        });
    });

    describe('handleAmountBlur', () => {
        it('should not update state when recordId does not match', () => {
            const setEditState = jest.fn();
            const { result } = renderHook(() =>
                useFundsAmountEdit({ exchangeRate: '40', mismatchMessage: MISMATCH_MESSAGE, setEditState }),
            );

            act(() => {
                result.current.handleAmountBlur(999, 'amountUsd');
            });

            const prev = makeState();
            const next = applyUpdater(setEditState, prev);

            expect(next).toBe(prev);
        });

        it('should set usdMismatchMessage when mismatch is true', () => {
            jest.mocked(isUsdAmountMismatch).mockReturnValue(true);
            const setEditState = jest.fn();
            const { result } = renderHook(() =>
                useFundsAmountEdit({ exchangeRate: '40', mismatchMessage: MISMATCH_MESSAGE, setEditState }),
            );

            act(() => {
                result.current.handleAmountBlur(1, 'amountUsd');
            });

            const next = applyUpdater(setEditState, makeState());

            expect(next.usdMismatchMessage).toBe(MISMATCH_MESSAGE);
        });

        it('should not set usdMismatchMessage when mismatch is false', () => {
            jest.mocked(isUsdAmountMismatch).mockReturnValue(false);
            const setEditState = jest.fn();
            const { result } = renderHook(() =>
                useFundsAmountEdit({ exchangeRate: '40', mismatchMessage: MISMATCH_MESSAGE, setEditState }),
            );

            act(() => {
                result.current.handleAmountBlur(1, 'amountUsd');
            });

            const next = applyUpdater(setEditState, makeState());

            expect(next.usdMismatchMessage).toBeUndefined();
        });

        it('should recalculate UAH when USD amount is blurred', () => {
            const setEditState = jest.fn();
            const { result } = renderHook(() =>
                useFundsAmountEdit({ exchangeRate: '42', mismatchMessage: MISMATCH_MESSAGE, setEditState }),
            );

            act(() => {
                result.current.handleAmountBlur(1, 'amountUsd');
            });

            const next = applyUpdater(setEditState, makeState({ amountUah: '7 265', amountUsd: '4 200' }));

            expect(next.amountUah).toBe('176400');
        });

        it('should clear usdMismatchMessage on UAH blur', () => {
            jest.mocked(isUsdAmountMismatch).mockReturnValue(true);
            const setEditState = jest.fn();
            const { result } = renderHook(() =>
                useFundsAmountEdit({ exchangeRate: '40', mismatchMessage: MISMATCH_MESSAGE, setEditState }),
            );

            act(() => {
                result.current.handleAmountBlur(1, 'amountUah');
            });

            const next = applyUpdater(setEditState, makeState({ usdMismatchMessage: MISMATCH_MESSAGE }));

            expect(next.usdMismatchMessage).toBeUndefined();
        });
    });
});
