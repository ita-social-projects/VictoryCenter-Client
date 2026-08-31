import { act, renderHook } from '@testing-library/react';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import * as validateUsdAmountMismatch from '@/utils/functions/validate-usd-amount-mismatch/validate-usd-amount-mismatch';
import { useAmountBlur } from './useAmountBlur';

const createFormState = (overrides = {}) => ({
    amountUah: '',
    amountUsd: '',
    errors: {},
    ...overrides,
});

const triggerAmountUsdBlur = (hook: ReturnType<typeof useAmountBlur>, formState: object) => {
    const setFormState = jest.fn();
    let nextState: any;

    act(() => {
        hook.handleAmountBlur('amountUsd', setFormState);
        nextState = setFormState.mock.calls[0][0](formState);
    });
    return nextState;
};

describe('useAmountBlur', () => {
    it('recalculates amountUah from amountUsd and clears usdMismatchMessage on blur', () => {
        const { result } = renderHook(() => useAmountBlur('40'));

        const nextState = triggerAmountUsdBlur(result.current, createFormState({ amountUah: '100', amountUsd: '999' }));

        expect(result.current.usdMismatchMessage).toBeUndefined();
        expect(nextState.amountUsd).toBe('999');
        expect(nextState.amountUah).toBe('39960');
        expect(nextState.errors.amountUsd).toBeUndefined();
    });

    it('clears usdMismatchMessage when USD matches converted UAH value on blur', () => {
        const { result } = renderHook(() => useAmountBlur('40'));

        triggerAmountUsdBlur(result.current, createFormState({ amountUah: '100', amountUsd: '2,50' }));

        expect(result.current.usdMismatchMessage).toBeUndefined();
    });

    it('normalizes amountUsd and sets error on blur when value is zero', () => {
        const { result } = renderHook(() => useAmountBlur('40'));

        const nextState = triggerAmountUsdBlur(result.current, createFormState({ amountUah: '100', amountUsd: '0' }));

        expect(nextState.errors.amountUsd).toBe(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_ZERO);
        expect(nextState.amountUah).toBe('100');
    });

    it('does not recalculate amountUsd when amountUah is blurred with an invalid value', () => {
        const { result } = renderHook(() => useAmountBlur('40'));

        const setFormState = jest.fn();
        let nextState: any;
        act(() => {
            result.current.handleAmountBlur('amountUah', setFormState);
            nextState = setFormState.mock.calls[0][0](createFormState({ amountUah: '0', amountUsd: '2,5' }));
        });

        expect(nextState.errors.amountUah).toBeTruthy();
        expect(nextState.amountUsd).toBe('2,5');
        expect(result.current.usdMismatchMessage).toBeUndefined();
    });

    it('suppresses usdMismatchMessage when suppressMismatchCheck is true, even if the raw value cannot be converted', () => {
        const { result } = renderHook(() => useAmountBlur('40'));

        const setFormState = jest.fn();
        act(() => {
            result.current.handleAmountBlur('amountUsd', setFormState, true);
            setFormState.mock.calls[0][0](createFormState({ amountUah: '100', amountUsd: '1234567890' }));
        });

        expect(result.current.usdMismatchMessage).toBeUndefined();
    });

    describe('mismatch check on amountUah blur (symmetric with amountUsd)', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('surfaces the mismatch message when the recalculated pair still mismatches', () => {
            jest.spyOn(validateUsdAmountMismatch, 'isUsdAmountMismatch').mockReturnValue(true);

            const { result } = renderHook(() => useAmountBlur('40'));
            const setFormState = jest.fn();
            act(() => {
                result.current.handleAmountBlur('amountUah', setFormState);
                setFormState.mock.calls[0][0](createFormState({ amountUah: '100', amountUsd: '2,5' }));
            });

            expect(result.current.usdMismatchMessage).toBe(FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH);
        });

        it('suppresses the mismatch message when suppressMismatchCheck is true', () => {
            jest.spyOn(validateUsdAmountMismatch, 'isUsdAmountMismatch').mockReturnValue(true);

            const { result } = renderHook(() => useAmountBlur('40'));
            const setFormState = jest.fn();
            act(() => {
                result.current.handleAmountBlur('amountUah', setFormState, true);
                setFormState.mock.calls[0][0](createFormState({ amountUah: '100', amountUsd: '2,5' }));
            });

            expect(result.current.usdMismatchMessage).toBeUndefined();
        });
    });
});
