import { renderHook, act } from '@testing-library/react';
import { useCounterAnimation } from './useCounterAnimation';

describe('useCounterAnimation', () => {
    let rafCallbacks: FrameRequestCallback[];
    let rafId: number;

    beforeEach(() => {
        rafCallbacks = [];
        rafId = 0;

        jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
            rafCallbacks.push(cb);
            return ++rafId;
        });

        jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const flush = (startTime = 0, endTime = 2000, steps = 10) => {
        const step = (endTime - startTime) / steps;
        for (let i = 0; i <= steps; i++) {
            const callbacks = [...rafCallbacks];
            rafCallbacks = [];
            callbacks.forEach((cb) => cb(startTime + i * step));
        }
    };

    it('starts at 0', () => {
        const { result } = renderHook(() => useCounterAnimation(100, false));
        expect(result.current).toBe(0);
    });

    it('stays at 0 while not visible', () => {
        const { result } = renderHook(() => useCounterAnimation(100, false));
        act(() => flush());
        expect(result.current).toBe(0);
    });

    it('animates from 0 to target when isVisible becomes true', () => {
        const { result } = renderHook(() => useCounterAnimation(100, true));

        act(() => flush(0, 2000, 20));

        expect(result.current).toBe(100);
    });

    it('does not re-animate after already completing', () => {
        const { result, rerender } = renderHook(({ isVisible }) => useCounterAnimation(100, isVisible), {
            initialProps: { isVisible: true },
        });

        act(() => flush(0, 2000, 20));
        expect(result.current).toBe(100);

        rerender({ isVisible: false });
        rerender({ isVisible: true });
        act(() => flush(0, 2000, 20));

        expect(result.current).toBe(100);
    });

    it('cancels the animation frame on unmount', () => {
        const { unmount } = renderHook(() => useCounterAnimation(100, true));
        unmount();
        expect(cancelAnimationFrame).toHaveBeenCalled();
    });

    it('respects a custom duration', () => {
        const { result } = renderHook(() => useCounterAnimation(200, true, 500));
        act(() => flush(0, 600, 10));
        expect(result.current).toBe(200);
    });
});
