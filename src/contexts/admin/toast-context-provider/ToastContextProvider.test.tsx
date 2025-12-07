import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContextProvider';
import { ToastType } from '@app-types/admin/toast';

describe('ToastProvider', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => <ToastProvider>{children}</ToastProvider>;

    it('adds a toast to the state', () => {
        const { result } = renderHook(() => useToast(), { wrapper });

        act(() => {
            result.current.addToast('Hello World', ToastType.Info, 5000);
        });

        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0].message).toBe('Hello World');
        expect(result.current.toasts[0].type).toBe(ToastType.Info);
        expect(result.current.toasts[0].duration).toBe(5000);
    });

    it('removes a toast manually', () => {
        const { result } = renderHook(() => useToast(), { wrapper });

        act(() => {
            result.current.addToast('To be removed');
        });

        const id = result.current.toasts[0].id;

        act(() => {
            result.current.removeToast(id);
        });

        expect(result.current.toasts).toHaveLength(0);
    });

    it('removes a toast automatically after its duration', () => {
        const { result } = renderHook(() => useToast(), { wrapper });

        act(() => {
            result.current.addToast('Auto remove', ToastType.Info, 3000);
        });

        expect(result.current.toasts).toHaveLength(1);

        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(result.current.toasts).toHaveLength(0);
    });
});
