import React, { memo } from 'react';
import cn from 'classnames';
import styles from './MediaOverlay.module.scss';

export interface MediaOverlayProps {
    opacity?: number;
    color?: string;
    blur?: number;
    className?: string;
}

export const MediaOverlay: React.FC<MediaOverlayProps> = memo(
    ({ opacity = 0.2, color = '#000000', blur = 0, className }) => {
        const dynamicStyles = {
            '--overlay-opacity': opacity,
            '--overlay-color': color,
            '--overlay-blur': blur > 0 ? `${blur}px` : '0',
        } as React.CSSProperties;

        return <div className={cn(styles.root, className)} style={dynamicStyles} aria-hidden="true" />;
    },
);

MediaOverlay.displayName = 'MediaOverlay';
