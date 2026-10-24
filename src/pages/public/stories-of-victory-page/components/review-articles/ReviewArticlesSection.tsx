import React from 'react';
import { SuccessStoryCard } from '@/components/public/success-story-card/SuccessStoryCard';
import { StoriesOfVictoryReviewArticle } from '@/types/public/stories-of-victory';
import styles from './ReviewArticlesSection.module.scss';

interface ReviewArticlesSectionProps {
    content: StoriesOfVictoryReviewArticle[] | null;
}

export const ReviewArticlesSection: React.FC<ReviewArticlesSectionProps> = ({ content }) => {
    if (!content || content.length === 0) return null;

    return (
        <section className={styles.container}>
            <div className={styles.articles}>
                {content.map((article) => (
                    <div key={article.id} className={styles.articleCard}>
                        <SuccessStoryCard article={article} />
                    </div>
                ))}
            </div>
        </section>
    );
};
