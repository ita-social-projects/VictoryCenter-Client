import { act, renderHook } from '@testing-library/react';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
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
    it('sets usdMismatchMessage when USD does not match converted UAH value on blur', () => {
        const { result } = renderHook(() => useAmountBlur('40'));

        const nextState = triggerAmountUsdBlur(result.current, createFormState({ amountUah: '100', amountUsd: '999' }));

        expect(result.current.usdMismatchMessage).toBe(FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH);
        expect(nextState.amountUsd).toBe('999');
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
    });
});
