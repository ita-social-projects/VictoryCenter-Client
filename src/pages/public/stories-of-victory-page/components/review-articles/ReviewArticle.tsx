import React from 'react';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { StoriesOfVictoryReviewArticle } from '@/types/public/stories-of-victory';
import styles from './ReviewArticlesSection.module.scss';

interface ReviewArticleProps {
    article: StoriesOfVictoryReviewArticle;
    isHovered: boolean;
    onHoverChange: (articleId: number | null) => void;
}

const TRUNCATE_LENGTH = 100;

const truncateText = (text: string, length: number): string =>
    text.length > length ? text.substring(0, length) + '...' : text;

export const ReviewArticle: React.FC<ReviewArticleProps> = ({ article, isHovered, onHoverChange }) => {
    const { title, story } = useGetLocalization(article.localizations, {
        title: article.title,
        story: article.story,
    });

    return (
        <div
            className={styles.article}
            onMouseEnter={() => onHoverChange(article.id)}
            onMouseLeave={() => onHoverChange(null)}
        >
            {article.image && (
                <>
                    <div className={styles.imageContainer}>
                        <img src={article.image} alt={title || 'Article Image'} className={styles.articleImage} />
                    </div>
                    <div className={styles.articleTitle}>
                        <div
                            className={`${styles.titleContent} ${isHovered ? styles.collapsedHidden : ''}`}
                            aria-hidden={isHovered || undefined}
                        >
                            "{truncateText(story, TRUNCATE_LENGTH)}"
                        </div>
                        {isHovered && (
                            <div className={styles.expandedText}>
                                <div className={styles.titleContent}>"{story}"</div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
