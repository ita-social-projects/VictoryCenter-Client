import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/public/ui/button/Button';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { StoriesOfVictoryReviewArticle } from '@/types/public/stories-of-victory';
import { ReactComponent as ExternalLinkIcon } from '@/assets/icons/square-arrow-out-up-right.svg';
import styles from './SuccessStoryCard.module.scss';

interface SuccessStoryCardProps {
    article: StoriesOfVictoryReviewArticle;
}

const TRUNCATE_LENGTH = 100;

const truncateText = (text: string): string =>
    text.length > TRUNCATE_LENGTH ? `${text.substring(0, TRUNCATE_LENGTH)}...` : text;

export const SuccessStoryCard: React.FC<SuccessStoryCardProps> = ({ article }) => {
    const { t } = useTranslation('successPage');
    const [isHovered, setIsHovered] = useState(false);
    const [isExpandedByClick, setIsExpandedByClick] = useState(false);
    const [isHoverDismissed, setIsHoverDismissed] = useState(false);
    const cardRef = useRef<HTMLElement>(null);
    const { title, story } = useGetLocalization(article.localizations, {
        title: article.title,
        story: article.story,
    });
    const isExpanded = isExpandedByClick || (isHovered && !isHoverDismissed);

    const handleMouseEnter = () => {
        setIsHovered(true);
        setIsHoverDismissed(false);
    };

    const collapse = useCallback(() => {
        setIsExpandedByClick(false);
        setIsHovered(false);
        setIsHoverDismissed(true);
    }, []);

    const handleReadStoryClick = () => {
        if (isExpanded) {
            collapse();
            return;
        }

        setIsExpandedByClick(true);
        setIsHoverDismissed(false);
    };

    useEffect(() => {
        if (!isExpanded) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            if (cardRef.current && event.target instanceof Node && !cardRef.current.contains(event.target)) {
                collapse();
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('scroll', collapse);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('scroll', collapse);
        };
    }, [collapse, isExpanded]);

    return (
        <article ref={cardRef} className={styles.article}>
            {article.image && (
                <>
                    <div
                        className={styles.storyContentArea}
                        data-testid={`story-content-${article.id}`}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <div className={styles.imageContainer}>
                            <img src={article.image} alt={title || 'Article Image'} className={styles.articleImage} />
                        </div>
                        <div className={styles.articleTitle}>
                            <div
                                className={`${styles.titleContent} ${isExpanded ? styles.collapsedHidden : ''}`}
                                aria-hidden={isExpanded}
                            >
                                "{truncateText(story)}"
                            </div>
                            {isExpanded && (
                                <div className={styles.expandedText}>
                                    <div className={styles.titleContent}>"{story}"</div>
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="tertiary"
                        icon={ExternalLinkIcon}
                        iconPosition="right"
                        className={styles.readStory}
                        aria-expanded={isExpanded}
                        onClick={handleReadStoryClick}
                    >
                        {t('ARTICLES.READ_STORY')}
                    </Button>
                </>
            )}
        </article>
    );
};
