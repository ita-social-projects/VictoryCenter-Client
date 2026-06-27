import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ReviewArticlesSection.module.scss';
import { StoriesOfVictoryReviewArticle } from '@/types/public/stories-of-victory';
import { ReactComponent as SquareArrow } from '@/assets/icons/square-arrow-out-up-right.svg';

interface ReviewArticlesSectionProps {
    content: StoriesOfVictoryReviewArticle[] | null;
}

export const ReviewArticlesSection: React.FC<ReviewArticlesSectionProps> = ({ content }) => {
    const { t } = useTranslation('successPage');

    return (
        <section className={styles.container}>
            {content && content.length > 0 && (
                <div className={styles.articles}>
                    {content.map((article) => (
                        <div key={article.id} className={styles.article}>
                            {article.image && (
                                <img
                                    src={article.image}
                                    alt={article.title || 'Article Image'}
                                    className={styles.articleImage}
                                />
                            )}
                            <h3 className={styles.articleTitle}>"{article.title}"</h3>
                            <div className={styles.articleLink}>
                                <span>{t('ARTICLES.READ_STORY')}</span>
                                <SquareArrow />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};
