import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { LinearProgress } from '@mui/material';
import { Button } from '@/components/public/ui/button/Button';
import { ReactComponent as ArrowDownIcon } from '@/assets/icons/arrow-down.svg';
import { EventsData, EventsNews, Tag } from '@/types/public/events-news';
import { SingleEventNews } from './single-event-news/SingleEventNews';
import { EventsNewsApi } from '@/services/api/public/events-news/events-news-api';
import {
    useDataPaginationFetch,
    PaginationRequestParams,
} from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import styles from './Events.module.scss';

export const Events = ({ title, tags }: EventsData) => {
    const { t } = useTranslation('eventsNewsPage');
    const pageSize = 8;

    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [events, setEvents] = useState<EventsNews[]>([]);
    const [offset, setOffset] = useState<number>(0);

    const searchByTag = (tag: Tag) => {
        setSelectedTag(tag);
        setOffset(0); // Reset offset when changing tag
    };

    const loadMore = () => setOffset((prevOffset) => prevOffset + pageSize);

    const getEvents = useCallback(
        async (params: PaginationRequestParams) => {
            return EventsNewsApi.get(selectedTag?.id || '', offset, params.limit as number);
        },
        [selectedTag, offset],
    );

    const { data, isLoading, error, hasMore } = useDataPaginationFetch<EventsNews>({
        initialData: [],
        fetchHandler: getEvents,
        autoFetchDependencies: [t, selectedTag, offset],
        pageSize: pageSize,
    });

    useEffect(() => {
        if (offset === 0) {
            setEvents(data);
        } else {
            setEvents((prevEvents) => [...prevEvents, ...data]);
        }
    }, [data, offset]);

    return (
        <section className={styles.events}>
            <div className={styles['menu-block']}>
                <h2 className={styles['header-title']}>{title}</h2>
                <div className={styles['button-block']}>
                    {tags.map((tag) => (
                        <button
                            onClick={() => searchByTag(tag)}
                            key={tag.id}
                            className={classNames({
                                [styles['white-button']]: selectedTag?.id !== tag.id,
                                [styles['black-button']]: selectedTag?.id === tag.id,
                            })}
                        >
                            {tag.name}
                        </button>
                    ))}
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={classNames({
                            [styles['white-button']]: selectedTag !== null,
                            [styles['black-button']]: selectedTag === null,
                        })}
                        data-testid="all-materials-button"
                    >
                        {t('ALL_MATERIALS')}
                    </button>
                </div>
            </div>
            <div className={styles['cards-block']}>
                {error && (
                    <div className={styles['error-message']} role="alert" style={{ color: 'red' }}>
                        {t('FAILED_TO_LOAD_THE_EVENTS_NEWS')}
                    </div>
                )}

                {events.map((item: EventsNews) => (
                    <SingleEventNews key={item?.id} {...item} />
                ))}

                {isLoading && <LinearProgress />}
            </div>
            {hasMore && (
                <Button
                    onClick={loadMore}
                    variant="secondary-dark"
                    iconPosition="right"
                    icon={ArrowDownIcon}
                    className={styles['show-more-button']}
                >
                    {t('SHOW_MORE')}
                </Button>
            )}
        </section>
    );
};
