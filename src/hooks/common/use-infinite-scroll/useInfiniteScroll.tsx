import React, { useCallback } from 'react';

export const DEFAULT_BOTTOM_REACH_THRESHOLD_IN_PIXELS = 5;

export interface UseInfiniteScrollProps {
    onReachBottom: () => void;
    disabledWhen?: boolean;
    bottomReachThresholdInPixels?: number;
}

export const useInfiniteScroll = ({
    onReachBottom,
    disabledWhen = false,
    bottomReachThresholdInPixels = DEFAULT_BOTTOM_REACH_THRESHOLD_IN_PIXELS,
}: UseInfiniteScrollProps) => {
    return useCallback(
        (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
            const target = event.currentTarget;
            const isAtBottom =
                target.scrollHeight - target.scrollTop - target.clientHeight <= bottomReachThresholdInPixels;

            if (isAtBottom && !disabledWhen) {
                onReachBottom();
            }
        },
        [onReachBottom, disabledWhen, bottomReachThresholdInPixels],
    );
};
