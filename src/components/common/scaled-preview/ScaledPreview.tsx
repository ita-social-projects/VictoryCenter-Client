import { ReactNode, useLayoutEffect, useRef, useState } from 'react';
import cn from 'classnames';
import styles from './ScaledPreview.module.scss';

export const DEFAULT_DESIGN_WIDTH = 1440;

export interface ScaledPreviewProps {
    children: ReactNode;
    /** Width (px) of the design frame the content is laid out for, e.g. the 1440px Figma frame. */
    designWidth?: number;
    className?: string;
}

interface PreviewScaleParams {
    availableWidth: number;
    availableHeight: number;
    designWidth: number;
    designHeight: number;
}

/**
 * Returns the factor that fits a `designWidth × designHeight` frame into the available box
 * without cropping and without upscaling it past its design size.
 */
export const getPreviewScale = ({
    availableWidth,
    availableHeight,
    designWidth,
    designHeight,
}: PreviewScaleParams): number => {
    if (availableWidth <= 0 || designWidth <= 0) {
        return 1;
    }

    const widthRatio = availableWidth / designWidth;
    const heightRatio = availableHeight > 0 && designHeight > 0 ? availableHeight / designHeight : widthRatio;

    return Math.min(widthRatio, heightRatio, 1);
};

/**
 * Renders its children at a fixed design width (the Figma frame width) and shrinks the whole frame
 * with a single `transform: scale()` so it fits the parent.
 *
 * Because the content is laid out at its real desktop size, computed styles (font-size, line-height,
 * paddings) are the design values, and the result no longer depends on the screen resolution.
 * The parent must have a definite width and height.
 */
export const ScaledPreview = ({ children, designWidth = DEFAULT_DESIGN_WIDTH, className }: ScaledPreviewProps) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const [frameHeight, setFrameHeight] = useState(0);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        const frame = frameRef.current;

        if (!viewport || !frame) {
            return;
        }

        const update = () => {
            // offsetHeight is the untransformed layout height of the frame.
            const nextFrameHeight = frame.offsetHeight;
            const nextScale = getPreviewScale({
                availableWidth: viewport.clientWidth,
                availableHeight: viewport.clientHeight,
                designWidth,
                designHeight: nextFrameHeight,
            });

            setFrameHeight(nextFrameHeight);
            setScale(nextScale);
        };

        update();

        if (typeof ResizeObserver === 'undefined') {
            return;
        }

        const observer = new ResizeObserver(update);
        observer.observe(viewport);
        observer.observe(frame);

        return () => observer.disconnect();
    }, [designWidth]);

    return (
        <div ref={viewportRef} className={cn(styles.viewport, className)} data-testid="scaled-preview">
            <div
                className={styles.box}
                style={{ width: designWidth * scale, height: frameHeight * scale }}
                data-testid="scaled-preview-box"
            >
                <div
                    ref={frameRef}
                    className={styles.frame}
                    style={{ width: designWidth, transform: `scale(${scale})` }}
                    data-testid="scaled-preview-frame"
                >
                    {children}
                </div>
            </div>
        </div>
    );
};
