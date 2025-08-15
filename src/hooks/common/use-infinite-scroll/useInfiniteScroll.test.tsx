import { renderHook, act } from '@testing-library/react';
import { useInfiniteScroll, UseInfiniteScrollProps } from './useInfiniteScroll';
import React from 'react';

describe('useInfiniteScroll', () => {
    const createScrollEvent = (overrides: Partial<HTMLDivElement>): React.UIEvent<HTMLDivElement> =>
        ({
            currentTarget: {
                scrollHeight: 100,
                clientHeight: 50,
                scrollTop: 45, // default close to bottom
                ...overrides,
            },
        }) as unknown as React.UIEvent<HTMLDivElement>;

    it('calls onReachBottom when scrolled to bottom', () => {
        const onReachBottom = jest.fn();
        const { result } = renderHook((props: UseInfiniteScrollProps) => useInfiniteScroll(props), {
            initialProps: { onReachBottom } as UseInfiniteScrollProps,
        });

        act(() => {
            result.current(createScrollEvent({ scrollTop: 45 }));
        });

        expect(onReachBottom).toHaveBeenCalledTimes(1);
    });

    it('does not call onReachBottom when disabled', () => {
        const onReachBottom = jest.fn();
        const { result } = renderHook((props: UseInfiniteScrollProps) => useInfiniteScroll(props), {
            initialProps: { onReachBottom, disableWhen: true } as UseInfiniteScrollProps,
        });

        act(() => {
            result.current(createScrollEvent({ scrollTop: 45 }));
        });

        expect(onReachBottom).not.toHaveBeenCalled();
    });
});
