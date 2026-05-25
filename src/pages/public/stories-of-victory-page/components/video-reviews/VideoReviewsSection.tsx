import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './VideoReviewsSection.module.scss';
import { StoriesOfVictoryReviewVideo } from '@/types/public/stories-of-victory';
import { ReactComponent as PlayIcon } from '@/assets/icons/play-video.svg';
import RidingVideo from '@/assets/videos/child-riding-horse.webm';

interface VideoReviewsSectionProps {
    content: StoriesOfVictoryReviewVideo[] | null;
}

export const VideoReviewsSection: React.FC<VideoReviewsSectionProps> = ({ content }) => {
    const { t } = useTranslation('successPage');
    const [playingVideoId, setPlayingVideoId] = useState<number | null>(null);
    const videoRefs = React.useRef<{ [key: number]: HTMLVideoElement }>({});

    const handleVideoClick = (videoId: number) => {
        const videoElement = videoRefs.current[videoId];
        if (!videoElement) return;

        if (playingVideoId === videoId && !videoElement.paused) {
            // Stop video
            videoElement.pause();
            videoElement.currentTime = 0;
            setPlayingVideoId(null);
        } else {
            // Pause all other videos
            Object.keys(videoRefs.current).forEach((id) => {
                const video = videoRefs.current[parseInt(id)];
                if (video && video !== videoElement) {
                    video.pause();
                    video.currentTime = 0;
                }
            });
            // Play selected video
            videoElement.play();
            setPlayingVideoId(videoId);
        }
    };

    const handleVideoEnd = (_videoId: number) => {
        setPlayingVideoId(null);
    };

    return (
        <section className={styles.container}>
            <h4 className={styles.title}>{t('videoReviewsTitle', 'Video Reviews')}</h4>
            {content && content.length > 0 && (
                <div className={styles.videos}>
                    {content.map((video) => (
                        <div key={video.id} className={styles.video}>
                            {video.link && (
                                <div
                                    className={styles.videoWrapper}
                                    onClick={() => handleVideoClick(video.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            handleVideoClick(video.id);
                                        }
                                    }}
                                >
                                    <video
                                        ref={(el) => {
                                            if (el) videoRefs.current[video.id] = el;
                                        }}
                                        playsInline
                                        aria-hidden="true"
                                        onEnded={() => handleVideoEnd(video.id)}
                                    >
                                        <source src={RidingVideo} type="video/webm" />
                                    </video>
                                    {playingVideoId !== video.id && <PlayIcon className={styles.playIcon} />}
                                </div>
                            )}
                            <h3 className={styles.videoTitle}>{video.title}</h3>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};
