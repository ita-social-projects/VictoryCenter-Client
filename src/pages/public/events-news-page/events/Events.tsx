import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { LinearProgress } from '@mui/material';
import { Button } from '@/components/public/ui/button/Button';
import { ReactComponent as ArrowDownIcon } from '@/assets/icons/arrow-down.svg';
import { EventsData, EventsNews, Tag } from '@/types/public/events-news';
import { SafeHtml } from '@/components/common/safe-html/SafeHtml';
import { SingleEventNews } from './single-event-news/SingleEventNews';
import { EventsNewsApi } from '@/services/api/public/events-news/events-news-api';
import { EventCategoryButton } from './event-category-button/EventCategoryButton';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import {
    useDataPaginationFetch,
    PaginationRequestParams,
} from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import styles from './Events.module.scss';

export interface EventsProps extends EventsData {
    isTitleHidden?: boolean;
}

const PAGE_SIZE = 8;
const getEventId = (item: EventsNews) => item.id;

export const Events = ({ title, tags, isTitleHidden }: EventsProps) => {
    const { t } = useTranslation('eventsNewsPage');
    const { currentLanguage } = useLocale();
    const safeTags = Array.isArray(tags) ? tags : [];

    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const selectedTagId = selectedTag?.id;

    const getEvents = useCallback(
        (params: PaginationRequestParams) =>
            EventsNewsApi.get(
                selectedTagId,
                params.offset,
                params.limit ?? PAGE_SIZE,
                currentLanguage,
                params.requestOptions,
            ),
        [selectedTagId, currentLanguage],
    );

    const {
        data: events,
        isLoading,
        error,
        hasMore,
        fetchMore,
    } = useDataPaginationFetch<EventsNews>({
        initialData: [],
        fetchHandler: getEvents,
        autoFetchDependencies: [currentLanguage, selectedTagId],
        getUniqueId: getEventId,
        pageSize: PAGE_SIZE,
    });

    return (
        <section className={styles.events}>
            <div className={styles['menu-block']}>
                <div className={styles['button-block']}>
                    {safeTags.map((tag) => (
                        <EventCategoryButton
                            key={tag.id}
                            tag={tag}
                            isActive={selectedTag?.id === tag.id}
                            onClick={() => setSelectedTag(tag)}
                        />
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

                {!isTitleHidden && title && <SafeHtml as="h2" className={styles['header-title']} html={title} />}
            </div>
            <div className={styles['cards-block']}>
                {!isLoading && !error && events.length === 0 && (
                    <div className={styles['empty-message']} style={{ textAlign: 'center', padding: '2rem 0' }}>
                        {t('NO_EVENTS_FOUND', 'Ще немає матеріалу')}
                    </div>
                )}
                {error && (
                    <div className={styles['error-message']} role="alert" style={{ color: 'red' }}>
                        {t('FAILED_TO_LOAD_THE_EVENTS_NEWS')}
                    </div>
                )}

                {events.map((item) => (
                    <SingleEventNews key={item.id} {...item} />
                ))}

                {isLoading && <LinearProgress />}
            </div>
            {hasMore && (
                <Button
                    onClick={fetchMore}
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
