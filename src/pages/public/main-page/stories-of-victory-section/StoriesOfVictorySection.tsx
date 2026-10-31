import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/public/ui/button/Button';
import { SuccessStoryCard } from '@/components/public/success-story-card/SuccessStoryCard';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { PublicFeedbackApi } from '@/services/api/public/feedback/feedback-api';
import { StoriesOfVictoryReviewArticle } from '@/types/public/stories-of-victory';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { localizePath } from '@/utils/functions/localize-path/localize-path';
import styles from './StoriesOfVictorySection.module.scss';

export const StoriesOfVictorySection: React.FC = () => {
    const { t } = useTranslation('mainPage');
    const { currentLanguage } = useLocale();

    const histories = useDataFetch<StoriesOfVictoryReviewArticle[]>({
        initialData: [],
        fetchHandler: PublicFeedbackApi.fetchLatestHistories,
    });

    const articles = useMemo(() => histories.data.filter((article) => Boolean(article.image)), [histories.data]);

    if (histories.isLoading) {
        return null;
    }

    if (histories.error) {
        return (
            <section className={styles.root}>
                <h2 className={styles.title}>{t('SUCCESS_STORIES.TITLE')}</h2>
                <div className={styles.error} role="alert">
                    {t('SUCCESS_STORIES.LOADING_ERROR')}
                </div>
            </section>
        );
    }

    if (articles.length === 0) {
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
                    href={localizePath(PUBLIC_ROUTES.STORIES_OF_VICTORIES.FULL, currentLanguage)}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {t('SUCCESS_STORIES.ALL_STORIES')}
                </Button>
            </div>
        </section>
    );
};
