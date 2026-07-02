import { act, renderHook } from '@testing-library/react';
import type { MutableRefObject } from 'react';
import { useTableScrollToTop } from '@/hooks/admin/use-table-scroll-to-top/useTableScrollToTop';

const createMockWrapper = (overrides: Partial<HTMLDivElement> = {}): HTMLDivElement => {
    const wrapper = document.createElement('div');

    Object.defineProperty(wrapper, 'scrollHeight', {
        value: 'scrollHeight' in overrides ? overrides.scrollHeight : 0,
        configurable: true,
    });
    Object.defineProperty(wrapper, 'clientHeight', {
        value: 'clientHeight' in overrides ? overrides.clientHeight : 0,
        configurable: true,
    });
    Object.defineProperty(wrapper, 'scrollTop', {
        value: 'scrollTop' in overrides ? overrides.scrollTop : 0,
        writable: true,
        configurable: true,
    });

    return wrapper;
};

describe('useTableScrollToTop', () => {
    it('returns initial state with hidden "move to top" button', () => {
        const { result } = renderHook(() => useTableScrollToTop(0));

        expect(result.current.isMoveToTopVisible).toBe(false);
        expect(result.current.tableWrapperRef.current).toBeNull();
    });

    it('does not throw and keeps state false when handleTableScroll is called without a mounted wrapper', () => {
        const { result } = renderHook(() => useTableScrollToTop(0));

        act(() => {
            result.current.handleTableScroll();
        });

        expect(result.current.isMoveToTopVisible).toBe(false);
    });

    it('does not throw when moveToTop is called without a mounted wrapper', () => {
        const { result } = renderHook(() => useTableScrollToTop(0));

        act(() => {
            result.current.moveToTop();
        });

        expect(result.current.isMoveToTopVisible).toBe(false);
    });

    it('shows the button when the table is scrollable and scrolled down', () => {
        const { result } = renderHook(() => useTableScrollToTop(0));
        const wrapper = createMockWrapper({ scrollHeight: 500, clientHeight: 200, scrollTop: 50 });

        act(() => {
            (result.current.tableWrapperRef as MutableRefObject<HTMLDivElement | null>).current = wrapper;
            result.current.handleTableScroll();
        });

        expect(result.current.isMoveToTopVisible).toBe(true);
    });

    it('hides the button when the table is scrollable but scrolled to the top', () => {
        const { result } = renderHook(() => useTableScrollToTop(0));
        const wrapper = createMockWrapper({ scrollHeight: 500, clientHeight: 200, scrollTop: 0 });

        act(() => {
            (result.current.tableWrapperRef as MutableRefObject<HTMLDivElement | null>).current = wrapper;
            result.current.handleTableScroll();
        });

        expect(result.current.isMoveToTopVisible).toBe(false);
    });

    it('hides the button when the table is not scrollable, even if scrollTop is positive', () => {
        const { result } = renderHook(() => useTableScrollToTop(0));
        const wrapper = createMockWrapper({ scrollHeight: 200, clientHeight: 200, scrollTop: 50 });

        act(() => {
            (result.current.tableWrapperRef as MutableRefObject<HTMLDivElement | null>).current = wrapper;
            result.current.handleTableScroll();
        });

        expect(result.current.isMoveToTopVisible).toBe(false);
    });

    it('resets scrollTop to 0 and hides the button when moveToTop is called', () => {
        const { result } = renderHook(() => useTableScrollToTop(0));
        const wrapper = createMockWrapper({ scrollHeight: 500, clientHeight: 200, scrollTop: 120 });

        act(() => {
            (result.current.tableWrapperRef as MutableRefObject<HTMLDivElement | null>).current = wrapper;
            result.current.handleTableScroll();
        });
        expect(result.current.isMoveToTopVisible).toBe(true);

        act(() => {
            result.current.moveToTop();
        });

        expect(wrapper.scrollTop).toBe(0);
        expect(result.current.isMoveToTopVisible).toBe(false);
    });

    it('re-evaluates visibility automatically when recordsLength changes', () => {
        const wrapper = createMockWrapper({ scrollHeight: 500, clientHeight: 200, scrollTop: 80 });
        const { result, rerender } = renderHook(({ recordsLength }) => useTableScrollToTop(recordsLength), {
            initialProps: { recordsLength: 0 },
        });

        act(() => {
            (result.current.tableWrapperRef as MutableRefObject<HTMLDivElement | null>).current = wrapper;
        });

        rerender({ recordsLength: 5 });

        expect(result.current.isMoveToTopVisible).toBe(true);
    });
});
