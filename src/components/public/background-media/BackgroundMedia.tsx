import React, { memo } from 'react';
import { MediaOverlay, MediaOverlayProps } from './media-overlay';
import styles from './BackgroundMedia.module.scss';

interface BackgroundMediaProps {
    mediaUrl: string;
    overlay?: MediaOverlayProps;
}

const isVideo = (url: string) => url.endsWith('.mp4') || url.endsWith('.webm');

export const BackgroundMedia: React.FC<BackgroundMediaProps> = memo(({ mediaUrl, overlay }) => {
    return (
        <>
            {isVideo(mediaUrl) ? (
                <video className={styles.video} src={mediaUrl} autoPlay muted loop playsInline aria-hidden="true" />
            ) : (
                <div
                    className={styles.image}
                    style={{ '--bg-image': `url(${mediaUrl})` } as React.CSSProperties}
                    aria-hidden="true"
                />
            )}
            <MediaOverlay {...overlay} />
        </>
    );
});

BackgroundMedia.displayName = 'BackgroundMedia';
