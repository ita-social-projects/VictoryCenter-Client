import { renderHook } from '@testing-library/react';
import { useDebouncedValueCallback, UseDebouncedValueCallbackProps } from './useDebouncedValueCallback';

jest.useFakeTimers();

describe('useDebouncedValueCallback', () => {
    const setup = <T>(props: UseDebouncedValueCallbackProps<T>) =>
        renderHook((p: UseDebouncedValueCallbackProps<T>) => useDebouncedValueCallback(p), {
            initialProps: props,
        });

    it('calls callback after delay', () => {
        const callback = jest.fn();
        setup({ value: 'hello', delayMs: 500, callback } as UseDebouncedValueCallbackProps<string>);

        expect(callback).not.toHaveBeenCalled();
        jest.advanceTimersByTime(500);
        expect(callback).toHaveBeenCalledWith('hello');
    });

    it('does not call callback when disabled', () => {
        const callback = jest.fn();
        setup({ value: 'test', delayMs: 300, callback, isDisabled: true } as UseDebouncedValueCallbackProps<string>);

        jest.advanceTimersByTime(300);
        expect(callback).not.toHaveBeenCalled();
    });

    it('clears previous timeout when value changes', () => {
        const callback = jest.fn();
        const { rerender } = setup({
            value: 'first',
            delayMs: 200,
            callback,
        } as UseDebouncedValueCallbackProps<string>);

        rerender({ value: 'second', delayMs: 200, callback } as UseDebouncedValueCallbackProps<string>);
        jest.advanceTimersByTime(200);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('second');
    });
});
