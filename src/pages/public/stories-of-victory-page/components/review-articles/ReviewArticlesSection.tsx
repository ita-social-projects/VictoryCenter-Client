import React, { useState } from 'react';
import styles from './ReviewArticlesSection.module.scss';
import { StoriesOfVictoryReviewArticle } from '@/types/public/stories-of-victory';

interface ReviewArticlesSectionProps {
    content: StoriesOfVictoryReviewArticle[] | null;
}

const TRUNCATE_LENGTH = 100;

const truncateText = (text: string, length: number): { truncated: string; isTruncated: boolean } => {
    if (text.length > length) {
        return { truncated: text.substring(0, length) + '...', isTruncated: true };
    }
    return { truncated: text, isTruncated: false };
};

export const ReviewArticlesSection: React.FC<ReviewArticlesSectionProps> = ({ content }) => {
    const [hoveredArticleId, setHoveredArticleId] = useState<number | null>(null);

    return (
        <section className={styles.container}>
            {content && content.length > 0 && (
                <div className={styles.articles}>
                    {content.map((article) => {
                        const { truncated } = truncateText(article.title, TRUNCATE_LENGTH);
                        const isHovered = hoveredArticleId === article.id;

                        return (
                            <div
                                key={article.id}
                                className={styles.article}
                                onMouseEnter={() => setHoveredArticleId(article.id)}
                                onMouseLeave={() => setHoveredArticleId(null)}
                            >
                                {article.image && (
                                    <>
                                        <div className={styles.imageContainer}>
                                            <img
                                                src={article.image}
                                                alt={article.title || 'Article Image'}
                                                className={styles.articleImage}
                                            />
                                        </div>
                                        <div className={`${styles.articleTitle} ${isHovered ? styles.hovered : ''}`}>
                                            <div className={styles.titleContent}>
                                                "{isHovered ? article.title : truncated}"
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};
