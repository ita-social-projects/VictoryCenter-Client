import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ReactComponent as ArrowUpIcon } from '../../../assets/icons/arrow-up.svg';
import { ReactComponent as NotFoundIcon } from '../../../assets/icons/not-found.svg';
import styles from './InfiniteScrollList.module.scss';
import { InlineLoader } from '../../common/inline-loader/InlineLoader';

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
            <div className={styles['infinite-scroll-list-not-found']} data-testid="infinite-scroll-list-not-found">
                <NotFoundIcon className={styles['infinite-scroll-list-not-found-icon']} />
                <p>{emptyStateMessage}</p>
            </div>
        );
    } else {
        content = null;
    }

    return (
        <div className={styles['infinite-scroll-list-container']}>
            <div
                ref={listContainerRef}
                onScroll={handleOnScroll}
                data-testid="infinite-scroll-list"
                className={styles['infinite-scroll-list']}
            >
                {content}
                {isLoading && (
                    <div className={styles['infinite-scroll-list-loader-container']}>
                        <InlineLoader size={3} />
                    </div>
                )}
            </div>
            {isMoveToTopVisible && (
                <button onClick={moveToTop} className={styles['infinite-scroll-list-to-top']}>
                    <ArrowUpIcon className={styles['infinite-scroll-list-to-top-icon']} />
                </button>
            )}
        </div>
    );
};
