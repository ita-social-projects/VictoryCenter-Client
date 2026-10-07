import React from 'react';
import { useTranslation } from 'react-i18next';
import { VideoCard } from './VideoCard';
import { StoriesOfVictoryReviewVideo } from '@/types/public/stories-of-victory';
import styles from './VideoReviewsSection.module.scss';

interface VideoReviewsSectionProps {
    content: StoriesOfVictoryReviewVideo[] | null;
}

export const VideoReviewsSection: React.FC<VideoReviewsSectionProps> = ({ content }) => {
    const { t } = useTranslation('successPage');

    if (!content || content.length === 0) return null;

    return (
        <section className={styles.container}>
            <h4 className={styles.title}>{t('VIDEO_SECTION.TITLE')}</h4>
            <div className={styles.videos}>
                {content.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>
        </section>
    );
};
