import { renderHook } from '@testing-library/react';
import { useObserveElementSize } from './useObserveElementSize';

const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

Object.defineProperty(global, 'ResizeObserver', {
    value: class ResizeObserver {
        observe = mockObserve;
        disconnect = mockDisconnect;
    },
});

describe('useObserveElementSize', () => {
    beforeEach(() => {
        mockObserve.mockClear();
        mockDisconnect.mockClear();
    });

    it('returns zero size when no element', () => {
        const { result } = renderHook(() => useObserveElementSize({ observableElement: { current: null } }));

        expect(result.current).toEqual({ width: 0, height: 0 });
    });

    it('returns zero size when disabled', () => {
        const element = document.createElement('div');

        const { result } = renderHook(() =>
            useObserveElementSize({
                observableElement: { current: element },
                isDisabled: true,
            }),
        );

        expect(result.current).toEqual({ width: 0, height: 0 });
    });

    it('observes element when provided', () => {
        const element = document.createElement('div');

        renderHook(() => useObserveElementSize({ observableElement: { current: element } }));

        expect(mockObserve).toHaveBeenCalledWith(element);
    });

    it('disconnects observer on unmount', () => {
        const element = document.createElement('div');

        const { unmount } = renderHook(() => useObserveElementSize({ observableElement: { current: element } }));

        unmount();

        expect(mockDisconnect).toHaveBeenCalled();
    });

    it('does not observe when disabled', () => {
        const element = document.createElement('div');

        renderHook(() =>
            useObserveElementSize({
                observableElement: { current: element },
                isDisabled: true,
            }),
        );

        expect(mockObserve).not.toHaveBeenCalled();
    });

    it('handles null element after having element', () => {
        const element = document.createElement('div');

        const { result, rerender } = renderHook(
            ({ el }) => useObserveElementSize({ observableElement: { current: el } }),
            { initialProps: { el: element } },
        );

        rerender({ el: null! });

        expect(result.current).toEqual({ width: 0, height: 0 });
    });

    it('handles disable state change', () => {
        const element = document.createElement('div');

        const { result, rerender } = renderHook(
            ({ disabled }) =>
                useObserveElementSize({
                    observableElement: { current: element },
                    isDisabled: disabled,
                }),
            { initialProps: { disabled: false } },
        );

        rerender({ disabled: true });

        expect(result.current).toEqual({ width: 0, height: 0 });
    });

    it('resets size to zero when element becomes disabled after having size', () => {
        const element = document.createElement('div');
        Object.defineProperty(element, 'offsetWidth', { value: 100, configurable: true });
        Object.defineProperty(element, 'offsetHeight', { value: 200, configurable: true });

        const { result, rerender } = renderHook(
            ({ disabled }) =>
                useObserveElementSize({
                    observableElement: { current: element },
                    isDisabled: disabled,
                }),
            { initialProps: { disabled: false } },
        );

        expect(result.current.width).toBeGreaterThan(0);

        rerender({ disabled: true });

        expect(result.current).toEqual({ width: 0, height: 0 });
    });

    it('calls onSizeChanged and returns new size when size changes', () => {
        const onSizeChanged = jest.fn();
        const element = document.createElement('div');

        Object.defineProperty(element, 'offsetWidth', { value: 150, configurable: true });
        Object.defineProperty(element, 'offsetHeight', { value: 250, configurable: true });

        const { result } = renderHook(() =>
            useObserveElementSize({
                observableElement: { current: element },
                onSizeChanged,
            }),
        );

        expect(onSizeChanged).toHaveBeenCalledWith({ width: 150, height: 250 });
        expect(result.current).toEqual({ width: 150, height: 250 });
    });
});
