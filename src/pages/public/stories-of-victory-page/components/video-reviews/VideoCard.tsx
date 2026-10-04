import React, { useState } from 'react';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { getVideoThumbnailUrl } from '@/utils/functions/video-thumbnail/video-thumbnail';
import { StoriesOfVictoryReviewVideo } from '@/types/public/stories-of-victory';
import styles from './VideoReviewsSection.module.scss';
import { ReactComponent as PlayIcon } from '@/assets/icons/play-video.svg';
import thumbnailFallback from '@/assets/images/woman-leaning-on-horse.webp';

// YouTube answers missing/private video IDs with a 120x90 grey placeholder instead of a load error.
const YOUTUBE_PLACEHOLDER_MAX_WIDTH = 120;

interface VideoCardProps {
    video: StoriesOfVictoryReviewVideo;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
    const { title } = useGetLocalization(video.localizations, { title: video.title });
    const [thumbnailFailed, setThumbnailFailed] = useState(false);
    const youTubeThumbnail = thumbnailFailed ? null : getVideoThumbnailUrl(video.link);

    const handleThumbnailLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        if (youTubeThumbnail && event.currentTarget.naturalWidth <= YOUTUBE_PLACEHOLDER_MAX_WIDTH) {
            setThumbnailFailed(true);
        }
    };

    const preview = (
        <div className={styles.thumbnail}>
            <img
                src={youTubeThumbnail ?? thumbnailFallback}
                alt=""
                className={youTubeThumbnail ? styles.youTubeThumbnail : undefined}
                onLoad={handleThumbnailLoad}
                onError={() => setThumbnailFailed(true)}
            />
            <PlayIcon className={styles.playIcon} aria-hidden="true" />
        </div>
    );

    return (
        <div className={styles.video}>
            {video.link ? (
                <a
                    href={video.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                    aria-label={title ?? undefined}
                >
                    {preview}
                </a>
            ) : (
                preview
            )}
            <p className={styles.videoTitle}>{title}</p>
        </div>
    );
};
