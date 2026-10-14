import React from 'react';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { StoriesOfVictoryReview } from '@/types/public/stories-of-victory';
import styles from './ReviewsSection.module.scss';

interface ReviewCardProps {
    item: StoriesOfVictoryReview;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ item }) => {
    const { authorName, text } = useGetLocalization(item.localizations, {
        authorName: item.name,
        text: item.review,
    });

    return (
        <div className={styles.reviewCard}>
            <p className={styles.review}>"{text}"</p>
            <p className={styles.name}>{authorName}</p>
        </div>
    );
};
