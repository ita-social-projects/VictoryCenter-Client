import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import { Button } from '@/components/public/ui/button/Button';
import { SingleEventNews } from '@/pages/public/events-news-page/events/single-event-news/SingleEventNews';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { EventsNewsApi } from '@/services/api/public/events-news/events-news-api';
import { PaginationResult } from '@/types/admin/common';
import { EventsNews } from '@/types/public/events-news';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import styles from './NewsEventsSection.module.scss';
import { RequestOptions } from '@/types/common/api';

const MAIN_PAGE_NEWS_COUNT = 4;

export const NewsEventsSection: React.FC = () => {
    const { t } = useTranslation('eventsNewsPage');
    const { currentLanguage } = useLocale();
    const navigate = useNavigate();

    const fetchLatestNews = useCallback(
        (requestOptions?: RequestOptions) =>
            EventsNewsApi.get(undefined, 0, MAIN_PAGE_NEWS_COUNT, currentLanguage, requestOptions),
        [currentLanguage],
    );

    const { data, isLoading, error } = useDataFetch<PaginationResult<EventsNews> | null>({
        initialData: null,
        fetchHandler: fetchLatestNews,
        autoFetchDependencies: [currentLanguage],
    });

    const items = data?.items ?? [];
    if (!isLoading && !error && items.length === 0) {
        return null;
    }

    return (
        <section className={styles.root}>
            <h2 className={styles.title}>{t('EVENTS_AND_NEWS')}</h2>

            <div className={styles.content}>
                {isLoading && <LinearProgress />}

                {error && (
                    <div className={styles.error} role="alert">
                        {t('FAILED_TO_LOAD_THE_EVENTS_NEWS')}
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        <div className={styles.cards}>
                            {items.map((item: EventsNews) => (
                                <SingleEventNews key={item.id} {...item} />
                            ))}
                        </div>

                        <div className={styles.actions}>
                            <Button variant="primary-dark" onClick={() => navigate(PUBLIC_ROUTES.EVENTS_AND_NEWS.FULL)}>
                                {t('READ_MORE')}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};
