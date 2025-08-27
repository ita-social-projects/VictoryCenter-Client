import { renderHook, act } from '@testing-library/react';
import { useDebouncedValueCallback, UseDebouncedValueCallbackProps } from './useDebouncedValueCallback';

describe('useDebouncedValueCallback', () => {
    const setup = <T>(props: UseDebouncedValueCallbackProps<T>) =>
        renderHook((p: UseDebouncedValueCallbackProps<T>) => useDebouncedValueCallback(p), {
            initialProps: props,
        });

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        // Ensure no dangling timers and reset environment for the next test
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('does not call callback on first render', () => {
        const callback = jest.fn();
        setup({ value: 'hello', delayMs: 500, callback } as UseDebouncedValueCallbackProps<string>);

        expect(callback).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(callback).not.toHaveBeenCalled();
    });

    it('calls callback after delay when value changes', () => {
        const callback = jest.fn();
        const { rerender } = setup({
            value: 'initial',
            delayMs: 500,
            callback,
        } as UseDebouncedValueCallbackProps<string>);

        rerender({ value: 'changed', delayMs: 500, callback } as UseDebouncedValueCallbackProps<string>);

        expect(callback).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledWith('changed');
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does not call callback when disabled', () => {
        const callback = jest.fn();
        const { rerender } = setup({
            value: 'initial',
            delayMs: 300,
            callback,
        } as UseDebouncedValueCallbackProps<string>);

        rerender({
            value: 'test',
            delayMs: 300,
            callback,
            isDisabled: true,
        } as UseDebouncedValueCallbackProps<string>);

        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(callback).not.toHaveBeenCalled();
    });

    it('clears previous timeout when value changes quickly', () => {
        const callback = jest.fn();
        const { rerender } = setup({
            value: 'initial',
            delayMs: 200,
            callback,
        } as UseDebouncedValueCallbackProps<string>);

        rerender({ value: 'first', delayMs: 200, callback } as UseDebouncedValueCallbackProps<string>);

        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(callback).not.toHaveBeenCalled();

        rerender({ value: 'second', delayMs: 200, callback } as UseDebouncedValueCallbackProps<string>);

        act(() => {
            jest.advanceTimersByTime(200);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('second');
        expect(callback).not.toHaveBeenCalledWith('first');
    });
});
