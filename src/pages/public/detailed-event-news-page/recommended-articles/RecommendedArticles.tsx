import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EventsNews } from '@/types/public/events-news';
import { LinearProgress } from '@mui/material';
import { SingleEventNews } from '../../events-news-page/events/single-event-news/SingleEventNews';
import { useDataPaginationFetch } from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import { EventsNewsApi } from '@/services/api/public/events-news/events-news-api';
import styles from './RecommendedArticles.module.scss';

const RecommendedArticlesBase: React.FC = () => {
    const { t } = useTranslation('eventsNewsPage');

    const getEvents = useCallback(async () => EventsNewsApi.get('', 0, 2), []);

    const { data, isLoading, error } = useDataPaginationFetch<EventsNews>({
        initialData: [],
        fetchHandler: getEvents,
        autoFetchDisabled: false,
        pageSize: 2,
    });

    return (
        <div className={styles['recommendations-container']}>
            <h4 className={styles['heading']}>{t('RECOMMENDED_ARTICLES')}</h4>
            <div className={styles['cards-grid']}>
                {error && (
                    <div className={styles['error-message']} role="alert" style={{ color: 'red' }}>
                        {t('FAILED_TO_LOAD_THE_EVENTS_NEWS')}
                    </div>
                )}

                {data.map((item: EventsNews) => (
                    <SingleEventNews key={item?.id} {...item} />
                ))}

                {isLoading && <LinearProgress />}
            </div>
        </div>
    );
};

export const RecommendedArticles = React.memo(RecommendedArticlesBase);
