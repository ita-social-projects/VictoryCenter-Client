import React, { memo, useMemo } from 'react';
import cn from 'classnames';
import { MediaOverlay, MediaOverlayProps } from './media-overlay';
import styles from './BackgroundMedia.module.scss';
import { getMediaType } from '@/utils/functions/get-media-type/get-media-type';

interface BackgroundMediaProps {
    mediaUrl: string;
    overlay?: MediaOverlayProps;
    className?: string;
    mediaType?: 'video' | 'image';
}

export const BackgroundMedia: React.FC<BackgroundMediaProps> = memo(
    ({ mediaUrl, overlay = {}, className, mediaType }) => {
        const type = useMemo(() => mediaType ?? getMediaType(mediaUrl), [mediaUrl, mediaType]);

        const style = useMemo<React.CSSProperties>(
            () => ({
                backgroundImage: `url("${mediaUrl}")`,
            }),
            [mediaUrl],
        );

        return (
            <div className={cn(styles.root, className)}>
                {type === 'video' ? (
                    <video className={styles.media} src={mediaUrl} autoPlay muted loop playsInline aria-hidden="true" />
                ) : (
                    <div className={styles.media} style={style} role="img" aria-hidden="true" />
                )}

                <MediaOverlay {...overlay} />
            </div>
        );
    },
);

BackgroundMedia.displayName = 'BackgroundMedia';
