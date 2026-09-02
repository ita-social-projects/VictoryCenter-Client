import { useLayoutEffect, useRef, useState } from 'react';
import { CHART_CONFIG, LABEL_LAYOUT } from '../chart-graphic/chart.config';

export interface Point {
    x: number;
    y: number;
}

export interface LabelPosition extends Point {
    anchor: 'start' | 'middle' | 'end';
}

export interface LabelResult {
    position: LabelPosition;
    arcPoint: Point;
}

interface Bounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

interface RoughLabel {
    originalIndex: number;
    arcX: number;
    arcY: number;
    x: number;
    y: number;
    width: number;
    height: number;
    anchor: 'start' | 'middle' | 'end';
}

interface PlacedLabel {
    x: number;
    y: number;
    width: number;
    height: number;
    originalIndex: number;
}

const MAX_STEPS = 60;
const EPS = 0.0001;

function normalize(vx: number, vy: number): Point {
    const len = Math.hypot(vx, vy);
    if (len < EPS) return { x: 0, y: -1 };
    return { x: vx / len, y: vy / len };
}

function textAnchorFor(nx: number): 'start' | 'middle' | 'end' {
    if (nx > 0.25) return 'start';
    if (nx < -0.25) return 'end';
    return 'middle';
}

function getViewBounds(isDesktop: boolean): Bounds {
    const config = isDesktop ? CHART_CONFIG.desktop : CHART_CONFIG.mobile;
    const [minX, minY, w, h] = config.viewBox.split(' ').map(Number);
    return { minX, minY, maxX: minX + w, maxY: minY + h };
}

function getCenter(paths: SVGPathElement[]): Point {
    const centers = paths.map((p) => {
        const b = p.getBBox();
        return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    });
    return centers.reduce((acc, c) => ({ x: acc.x + c.x / centers.length, y: acc.y + c.y / centers.length }), {
        x: 0,
        y: 0,
    });
}

export function useChartGeometry(itemsLength: number, isDesktop: boolean, percents: number[]) {
    const pathRefs = useRef<(SVGPathElement | null)[]>([]);
    const textRefs = useRef<(SVGTextElement | null)[]>([]);

    const [positions, setPositions] = useState<LabelResult[]>([]);

    useLayoutEffect(() => {
        const paths = pathRefs.current.slice(0, itemsLength) as SVGPathElement[];
        if (paths.length === 0 || paths.some((p) => !p)) return;

        const config = isDesktop ? CHART_CONFIG.desktop : CHART_CONFIG.mobile;
        const layout = isDesktop ? LABEL_LAYOUT.desktop : LABEL_LAYOUT.mobile;
        const bounds = getViewBounds(isDesktop);
        const center = getCenter(paths);

        const roughLabels: RoughLabel[] = paths.map((path, index) => {
            const length = path.getTotalLength();
            const targetLength = length * (Math.max(0.01, percents[index] || 0) / 100);
            const arcPoint = path.getPointAtLength(targetLength);

            const normal = normalize(arcPoint.x - center.x, arcPoint.y - center.y);
            const currentRadius = Math.hypot(arcPoint.x - center.x, arcPoint.y - center.y);
            const anchorRadius = currentRadius + config.strokeWidth / 2 + layout.baseGap;

            const centerX = center.x + normal.x * anchorRadius;
            const centerY = center.y + normal.y * anchorRadius;

            const el = textRefs.current[index];
            const bbox = el?.getBBox();
            const width = bbox && bbox.width > 0 ? bbox.width : layout.fallbackWidth;
            const height = bbox && bbox.height > 0 ? bbox.height : layout.fallbackHeight;

            return {
                originalIndex: index,
                arcX: arcPoint.x,
                arcY: arcPoint.y,
                x: centerX - width / 2,
                y: centerY - height / 2,
                width,
                height,
                anchor: textAnchorFor(normal.x),
            };
        });

        const sortedIndicesByArcX = roughLabels
            .map((_, idx) => idx)
            .sort((a, b) => roughLabels[a].arcX - roughLabels[b].arcX);

        const placedLabels: PlacedLabel[] = [];
        const finalResults: LabelResult[] = new Array(itemsLength);

        for (const idx of sortedIndicesByArcX) {
            const label = roughLabels[idx];

            let currentX = label.x;
            let currentY = label.y;
            let stepX = layout.stepX;
            let steps = 0;

            while (steps < MAX_STEPS) {
                const hitLeftBound = currentX < bounds.minX + layout.boundsPadding;
                let hasCollision = false;
                for (const placed of placedLabels) {
                    if (
                        currentX < placed.x + placed.width + layout.collisionPadding &&
                        currentX + label.width + layout.collisionPadding > placed.x &&
                        currentY < placed.y + placed.height + layout.collisionPadding &&
                        currentY + label.height + layout.collisionPadding > placed.y
                    ) {
                        hasCollision = true;
                        break;
                    }
                }

                if (!hitLeftBound && !hasCollision) {
                    break;
                }

                if (currentX + label.width + layout.boundsPadding >= bounds.maxX) {
                    stepX = 0;
                }

                currentX += stepX;
                currentY -= layout.stepY;

                if (currentY < bounds.minY + layout.boundsPadding) {
                    currentY = bounds.minY + layout.boundsPadding;
                    if (stepX === 0) {
                        break;
                    }
                }

                steps++;
            }

            placedLabels.push({
                x: currentX,
                y: currentY,
                width: label.width,
                height: label.height,
                originalIndex: label.originalIndex,
            });

            const finalCenterX = currentX + label.width / 2;
            const finalCenterY = currentY + label.height / 2;

            finalResults[label.originalIndex] = {
                position: {
                    x: finalCenterX,
                    y: finalCenterY,
                    anchor: label.anchor,
                },
                arcPoint: {
                    x: label.arcX,
                    y: label.arcY,
                },
            };
        }

        setPositions(finalResults);
    }, [itemsLength, isDesktop, percents]);

    return { pathRefs, textRefs, positions };
}
