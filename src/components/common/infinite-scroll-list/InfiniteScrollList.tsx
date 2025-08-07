import React, { useCallback, useEffect, useRef, useState } from 'react';
import ArrowUpIcon from '../../../assets/icons/arrow-up.svg';
import NotFoundIcon from '../../../assets/icons/not-found.svg';
import { InlineLoader } from '../inline-loader/InlineLoader';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import './InfiniteScrollList.scss';

const BOTTOM_REACH_THRESHOLD_IN_PIXELS = 5;

export interface InfiniteScrollListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    onLoadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
    emptyStateMessage: string;
}

export const InfiniteScrollList = <T,>({
    items,
    renderItem,
    onLoadMore,
    hasMore,
    isLoading,
    emptyStateMessage,
}: InfiniteScrollListProps<T>) => {
    const [isMoveToTopVisible, setIsMoveToTopVisible] = useState<boolean>(false);
    const listContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isLoading && listContainerRef.current) {
            const listContainer = listContainerRef.current;
            listContainer.scrollTop = listContainer.scrollHeight;
        }
    }, [isLoading]);

    useEffect(() => {
        if (items.length === 0) {
            setIsMoveToTopVisible(false);
        }
    }, [items.length]);

    const handleOnScroll = useCallback(() => {
        const listContainer = listContainerRef.current;
        if (!listContainer || isLoading) return;

        setIsMoveToTopVisible(listContainer.scrollTop > 0);

        if (hasMore) {
            const distanceToBottom = Math.abs(
                listContainer.scrollHeight - listContainer.scrollTop - listContainer.clientHeight,
            );
            if (distanceToBottom <= BOTTOM_REACH_THRESHOLD_IN_PIXELS) {
                onLoadMore();
            }
        }
    }, [isLoading, hasMore, onLoadMore]);

    const moveToTop = useCallback(() => {
        const listContainer = listContainerRef.current;
        if (!listContainer) return;

        listContainer.scrollTop = 0;
    }, []);

    let content;

    if (items.length > 0) {
        content = items.map(renderItem);
    } else if (!isLoading) {
        content = (
            <div className="infinite-scroll-list-not-found" data-testid="infinite-scroll-list-not-found">
                <img src={NotFoundIcon} alt={COMMON_TEXT_ADMIN.ALT.NOT_FOUND} />
                <p>{emptyStateMessage}</p>
            </div>
        );
    } else {
        content = null;
    }

    return (
        <div className="infinite-scroll-list-container">
            <div
                ref={listContainerRef}
                onScroll={handleOnScroll}
                data-testid="infinite-scroll-list"
                className="infinite-scroll-list"
            >
                {content}
                {isLoading && (
                    <div className="infinite-scroll-list-loader-container">
                        <InlineLoader size={3} />
                    </div>
                )}
            </div>
            {isMoveToTopVisible && (
                <button onClick={moveToTop} className="infinite-scroll-list-to-top">
                    <img src={ArrowUpIcon} alt={COMMON_TEXT_ADMIN.ALT.SCROLL_TO_TOP} />
                </button>
            )}
        </div>
    );
};
