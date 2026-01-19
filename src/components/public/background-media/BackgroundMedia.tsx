import React, { memo } from 'react';
import { MediaOverlay, MediaOverlayProps } from './media-overlay';
import styles from './BackgroundMedia.module.scss';
import cn from 'classnames';

interface BackgroundMediaProps {
    mediaUrl: string;
    overlay?: MediaOverlayProps;
    className?: string;
}

const isVideo = (url: string) => url.endsWith('.mp4') || url.endsWith('.webm');

export const BackgroundMedia: React.FC<BackgroundMediaProps> = memo(({ mediaUrl, overlay, className }) => {
    return (
        <>
            {isVideo(mediaUrl) ? (
                <video
                    className={cn(styles.video, className)}
                    src={mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-hidden="true"
                />
            ) : (
                <div
                    className={cn(styles.image, className)}
                    style={{ '--bg-image': `url(${mediaUrl})` } as React.CSSProperties}
                    aria-hidden="true"
                />
            )}
            <MediaOverlay {...overlay} />
        </>
    );
});

BackgroundMedia.displayName = 'BackgroundMedia';
