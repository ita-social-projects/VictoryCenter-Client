import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/public/ui/button/Button';
import { SuccessStoryCard } from '@/components/public/success-story-card/SuccessStoryCard';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { PublicFeedbackApi } from '@/services/api/public/feedback/feedback-api';
import { StoriesOfVictoryReviewArticle } from '@/types/public/stories-of-victory';
import { RequestOptions } from '@/types/common/api';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import styles from './StoriesOfVictorySection.module.scss';

export const MAIN_PAGE_STORIES_OF_VICTORY_COUNT = 4;

export const StoriesOfVictorySection: React.FC = () => {
    const { t } = useTranslation('mainPage');
    const fetchHistories = useCallback((options: RequestOptions) => PublicFeedbackApi.fetchHistories(options), []);

    const histories = useDataFetch<StoriesOfVictoryReviewArticle[]>({
        initialData: [],
        fetchHandler: fetchHistories,
    });

    const articles = useMemo(
        () => histories.data.filter((article) => Boolean(article.image)).slice(-MAIN_PAGE_STORIES_OF_VICTORY_COUNT),
        [histories.data],
    );

    if (histories.isLoading || articles.length === 0) {
        return null;
    }

    return (
        <section className={styles.root}>
            <h2 className={styles.title}>{t('SUCCESS_STORIES.TITLE')}</h2>

            <div className={styles.tiles}>
                {articles.map((article) => (
                    <SuccessStoryCard key={article.id} article={article} />
                ))}
            </div>

            <div className={styles.actions}>
                <Button
                    variant="primary-dark"
                    href={PUBLIC_ROUTES.STORIES_OF_VICTORIES.FULL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {t('SUCCESS_STORIES.ALL_STORIES')}
                </Button>
            </div>
        </section>
    );
};
