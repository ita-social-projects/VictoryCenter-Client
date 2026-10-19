import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EventsNews } from '@/types/public/events-news';
import { LinearProgress } from '@mui/material';
import { SingleEventNews } from '../../events-news-page/events/single-event-news/SingleEventNews';
import { useDataPaginationFetch } from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import { EventsNewsApi } from '@/services/api/public/events-news/events-news-api';
import styles from './RecommendedArticles.module.scss';
import { useLocale } from '@/hooks/common/use-locale/useLocale';

const RecommendedArticlesBase: React.FC = () => {
    const { t } = useTranslation('eventsNewsPage');
    const { currentLanguage } = useLocale();

    const getEvents = useCallback(async () => EventsNewsApi.get(undefined, 0, 2, currentLanguage), [currentLanguage]);

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

                {data.map((item: any) => (
                    <SingleEventNews
                        key={item?.id}
                        {...item}
                        name={item.name || item.title}
                        date={item.date || item.publishedAt}
                        id={String(item.id)}
                        previewImage={
                            typeof item.previewImage === 'string' ? item.previewImage : (item.previewImage?.url ?? null)
                        }
                    />
                ))}

                {isLoading && <LinearProgress />}
            </div>
        </div>
    );
};

export const RecommendedArticles = React.memo(RecommendedArticlesBase);
