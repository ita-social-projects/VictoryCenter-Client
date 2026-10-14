import React, { useState } from 'react';
import { ReviewArticle } from './ReviewArticle';
import { StoriesOfVictoryReviewArticle } from '@/types/public/stories-of-victory';
import styles from './ReviewArticlesSection.module.scss';

interface ReviewArticlesSectionProps {
    content: StoriesOfVictoryReviewArticle[] | null;
}

export const ReviewArticlesSection: React.FC<ReviewArticlesSectionProps> = ({ content }) => {
    const [hoveredArticleId, setHoveredArticleId] = useState<number | null>(null);

    if (!content || content.length === 0) return null;

    return (
        <section className={styles.container}>
            <div className={styles.articles}>
                {content.map((article) => (
                    <ReviewArticle
                        key={article.id}
                        article={article}
                        isHovered={hoveredArticleId === article.id}
                        onHoverChange={setHoveredArticleId}
                    />
                ))}
            </div>
        </section>
    );
};
