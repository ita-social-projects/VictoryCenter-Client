import { renderHook, act } from '@testing-library/react';
import { useTemporaryWarning } from './useTemporaryWarning';

describe('useTemporaryWarning', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('initialization', () => {
        it('should initialize with null warning', () => {
            const { result } = renderHook(() => useTemporaryWarning());

            expect(result.current.localWarning).toBeNull();
        });

        it('should accept custom warning duration', () => {
            const { result } = renderHook(() => useTemporaryWarning({ warningDuration: 5000 }));

            act(() => {
                result.current.showTemporaryWarning('Test warning');
            });

            act(() => {
                jest.advanceTimersByTime(4999);
            });

            expect(result.current.localWarning).toBe('Test warning');

            act(() => {
                jest.advanceTimersByTime(1);
            });

            expect(result.current.localWarning).toBeNull();
        });
    });

    describe('showTemporaryWarning', () => {
        it('should set warning text', () => {
            const { result } = renderHook(() => useTemporaryWarning());

            act(() => {
                result.current.showTemporaryWarning('Error message');
            });

            expect(result.current.localWarning).toBe('Error message');
        });
    });

    describe('clearWarning', () => {
        it('should clear the warning immediately', () => {
            const { result } = renderHook(() => useTemporaryWarning());

            act(() => {
                result.current.showTemporaryWarning('Warning text');
            });

            expect(result.current.localWarning).toBe('Warning text');

            act(() => {
                result.current.clearWarning();
            });

            expect(result.current.localWarning).toBeNull();
        });

        it('should cancel the auto-clear timer', () => {
            const { result } = renderHook(() => useTemporaryWarning());

            act(() => {
                result.current.showTemporaryWarning('Warning text');
            });

            act(() => {
                result.current.clearWarning();
            });

            expect(result.current.localWarning).toBeNull();

            act(() => {
                jest.advanceTimersByTime(2000);
            });

            expect(result.current.localWarning).toBeNull();
        });

        it('should call onWarningChange with null', () => {
            const onWarningChange = jest.fn();
            const { result } = renderHook(() => useTemporaryWarning({ onWarningChange }));

            act(() => {
                result.current.showTemporaryWarning('Warning text');
            });

            onWarningChange.mockClear();

            act(() => {
                result.current.clearWarning();
            });

            expect(onWarningChange).toHaveBeenCalledWith(null);
        });

        it('should handle being called when no warning is active', () => {
            const { result } = renderHook(() => useTemporaryWarning());

            expect(() => {
                act(() => {
                    result.current.clearWarning();
                });
            }).not.toThrow();

            expect(result.current.localWarning).toBeNull();
        });
    });

    describe('cleanup', () => {
        it('should clear timer on unmount', () => {
            const { result, unmount } = renderHook(() => useTemporaryWarning());

            act(() => {
                result.current.showTemporaryWarning('Warning text');
            });

            unmount();

            act(() => {
                jest.advanceTimersByTime(2000);
            });

            expect(jest.getTimerCount()).toBe(0);
        });

        it('should not call onWarningChange after unmount', () => {
            const onWarningChange = jest.fn();
            const { result, unmount } = renderHook(() => useTemporaryWarning({ onWarningChange }));

            act(() => {
                result.current.showTemporaryWarning('Warning text');
            });

            onWarningChange.mockClear();
            unmount();

            act(() => {
                jest.advanceTimersByTime(2000);
            });

            expect(onWarningChange).not.toHaveBeenCalled();
        });
    });
});
