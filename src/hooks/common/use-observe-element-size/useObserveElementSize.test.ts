import { renderHook } from '@testing-library/react';
import { useObserveElementSize } from './useObserveElementSize';

const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

Object.defineProperty(global, 'ResizeObserver', {
    value: class ResizeObserver {
        observe = mockObserve;
        disconnect = mockDisconnect;
        constructor(callback: ResizeObserverCallback) {}
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
                disableWhen: true,
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
                disableWhen: true,
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

        rerender({ el: element });

        expect(result.current).toEqual({ width: 0, height: 0 });
    });

    it('handles disable state change', () => {
        const element = document.createElement('div');

        const { result, rerender } = renderHook(
            ({ disabled }) =>
                useObserveElementSize({
                    observableElement: { current: element },
                    disableWhen: disabled,
                }),
            { initialProps: { disabled: false } },
        );

        rerender({ disabled: true });

        expect(result.current).toEqual({ width: 0, height: 0 });
    });
});
