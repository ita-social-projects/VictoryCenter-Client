import React, { useCallback } from 'react';

const DEFAULT_BOTTOM_REACH_THRESHOLD_IN_PIXELS = 5;

export interface UseScrollHandlerProps {
    onReachBottom: () => void;
    isDisabled?: boolean;
    bottomReachThresholdInPixels?: number;
}

export const useScrollHandler = ({
    onReachBottom,
    isDisabled = false,
    bottomReachThresholdInPixels = DEFAULT_BOTTOM_REACH_THRESHOLD_IN_PIXELS,
}: UseScrollHandlerProps) => {
    const handleScroll = useCallback(
        (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
            const target = event.currentTarget;
            const isAtBottom =
                target.scrollHeight - target.scrollTop - target.clientHeight <= bottomReachThresholdInPixels;

            if (isAtBottom && !isDisabled) {
                onReachBottom();
            }
        },
        [onReachBottom, isDisabled, bottomReachThresholdInPixels],
    );

    return { handleScroll };
};
