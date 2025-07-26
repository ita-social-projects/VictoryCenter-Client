import React, { useCallback, useEffect, useRef, useState } from 'react';
import LoaderIcon from '../../../assets/icons/load.svg';
import ArrowUpIcon from '../../../assets/icons/arrow-up.svg';
import NotFoundIcon from '../../../assets/icons/not-found.svg';
import './infinite-scroll-list.scss';

export interface InfiniteScrollListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    onLoadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
    emptyStateMessage: string;
}

const BOTTOM_REACH_THRESHOLD_IN_PIXELS = 5;

export const InfiniteScrollList = <T,>({
    items,
    renderItem,
    onLoadMore,
    hasMore,
    isLoading,
    emptyStateMessage,
}: InfiniteScrollListProps<T>) => {
    const [isMoveToTopVisible, setIsMoveToTopVisible] = useState<boolean>(false);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isLoading && listRef.current) {
            const el = listRef.current;
            el.scrollTop = el.scrollHeight;
        }
    }, [isLoading]);

    useEffect(() => {
        if (items.length === 0) {
            setIsMoveToTopVisible(false);
        }
    }, [items.length]);

    const handleOnScroll = useCallback(() => {
        const el = listRef.current;
        if (!el || isLoading) return;

        if (el.scrollTop > 0) {
            setIsMoveToTopVisible(true);
        } else {
            setIsMoveToTopVisible(false);
        }

        if (hasMore) {
            const distanceToBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight);
            if (distanceToBottom <= BOTTOM_REACH_THRESHOLD_IN_PIXELS) {
                onLoadMore();
            }
        }
    }, [isLoading, hasMore, onLoadMore]);

    const moveToTop = useCallback(() => {
        const el = listRef.current;
        if (!el) return;

        el.scrollTop = 0;
    }, []);

    let content;

    if (items.length > 0) {
        content = items.map(renderItem);
    } else if (!isLoading) {
        content = (
            <div className="infinite-scroll-list-not-found" data-testid="infinite-scroll-list-not-found">
                <img
                    src={NotFoundIcon}
                    alt="infinite-scroll-list-not-found"
                    data-testid="infinite-scroll-list-not-found-icon"
                />
                <p>{emptyStateMessage}</p>
            </div>
        );
    } else {
        content = null;
    }

    return (
        <div className="infinite-scroll-list-container">
            <div
                ref={listRef}
                onScroll={handleOnScroll}
                data-testid="infinite-scroll-list"
                className="infinite-scroll-list"
            >
                {content}
                {isLoading && (
                    <div className="infinite-scroll-list-loader" data-testid="infinite-scroll-list-loader">
                        <img src={LoaderIcon} alt="loader-icon" data-testid="infinite-scroll-list-loader-icon" />
                    </div>
                )}
            </div>
            {isMoveToTopVisible && (
                <button onClick={moveToTop} className="infinite-scroll-list-to-top">
                    <img src={ArrowUpIcon} alt="arrow-up-icon" data-testid="infinite-scroll-list-to-top" />
                </button>
            )}
        </div>
    );
};
