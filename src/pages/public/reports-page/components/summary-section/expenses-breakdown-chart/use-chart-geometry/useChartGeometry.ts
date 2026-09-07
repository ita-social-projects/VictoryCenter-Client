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

interface MeasuredLabel {
    width: number;
    height: number;
    baselineOffset: number | null;
}

interface MeasuredSizes {
    signature: string;
    sizes: (MeasuredLabel | null)[];
}

interface RoughLabel {
    originalIndex: number;
    arcX: number;
    arcY: number;
    x: number;
    y: number;
    width: number;
    height: number;
    baselineOffset: number;
    anchor: 'start' | 'middle' | 'end';
}

interface PlacedLabel {
    x: number;
    y: number;
    width: number;
    height: number;
    originalIndex: number;
}

const EPS = 0.0001;
const ARC_SAMPLE_STEP = 4;
const SIZE_TOLERANCE = 0.5;
export const FALLBACK_BASELINE_RATIO = 0.35;

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

function boxXForAnchor(anchorX: number, width: number, anchor: RoughLabel['anchor']): number {
    if (anchor === 'start') return anchorX;
    if (anchor === 'end') return anchorX - width;
    return anchorX - width / 2;
}

function anchorXForBox(boxX: number, width: number, anchor: RoughLabel['anchor']): number {
    if (anchor === 'start') return boxX;
    if (anchor === 'end') return boxX + width;
    return boxX + width / 2;
}

function getViewBounds(isDesktop: boolean): Bounds {
    const config = isDesktop ? CHART_CONFIG.desktop : CHART_CONFIG.mobile;
    const [minX, minY, w, h] = config.viewBox.split(' ').map(Number);
    return { minX, minY, maxX: minX + w, maxY: minY + h };
}

function circumcenter(a: Point, b: Point, c: Point): Point | null {
    const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
    if (Math.abs(d) < EPS) return null;
    const a2 = a.x * a.x + a.y * a.y;
    const b2 = b.x * b.x + b.y * b.y;
    const c2 = c.x * c.x + c.y * c.y;
    const ux = (a2 * (b.y - c.y) + b2 * (c.y - a.y) + c2 * (a.y - b.y)) / d;
    const uy = (a2 * (c.x - b.x) + b2 * (a.x - c.x) + c2 * (b.x - a.x)) / d;
    if (!Number.isFinite(ux) || !Number.isFinite(uy)) return null;
    const r = Math.hypot(a.x - ux, a.y - uy);
    if (!Number.isFinite(r) || r < EPS) return null;
    return { x: ux, y: uy };
}

function getArcCircleCenter(paths: SVGPathElement[]): Point {
    const fitted: Point[] = [];
    for (const p of paths) {
        const total = p.getTotalLength();
        if (total <= EPS) continue;
        const cc = circumcenter(p.getPointAtLength(0), p.getPointAtLength(total / 2), p.getPointAtLength(total));
        if (cc) fitted.push(cc);
    }
    if (fitted.length > 0) {
        return fitted.reduce((acc, c) => ({ x: acc.x + c.x / fitted.length, y: acc.y + c.y / fitted.length }), {
            x: 0,
            y: 0,
        });
    }
    const centers = paths.map((p) => {
        const b = p.getBBox();
        return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    });
    return centers.reduce((acc, c) => ({ x: acc.x + c.x / centers.length, y: acc.y + c.y / centers.length }), {
        x: 0,
        y: 0,
    });
}

function readBaselineOffset(el: SVGTextElement, bb: { y: number; height: number }): number | null {
    const list = el?.y?.baseVal;
    if (!list || list.numberOfItems < 1) return null;
    const baseline = list.getItem(0).value;
    if (!Number.isFinite(baseline)) return null;
    const offset = baseline - bb.y;
    return offset > 0 && offset < bb.height ? offset : null;
}

function sameSizes(a: (MeasuredLabel | null)[], b: (MeasuredLabel | null)[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((s, i) => {
        const n = b[i];
        if (!s && !n) return true;
        if (!s || !n) return false;
        const offEqual =
            s.baselineOffset === null
                ? n.baselineOffset === null
                : n.baselineOffset !== null && Math.abs(s.baselineOffset - n.baselineOffset) < SIZE_TOLERANCE;
        return (
            Math.abs(s.width - n.width) < SIZE_TOLERANCE && Math.abs(s.height - n.height) < SIZE_TOLERANCE && offEqual
        );
    });
}

export function useChartGeometry(itemsLength: number, isDesktop: boolean, percents: number[]) {
    const pathRefs = useRef<(SVGPathElement | null)[]>([]);
    const textRefs = useRef<(SVGTextElement | null)[]>([]);

    const [positions, setPositions] = useState<LabelResult[]>([]);
    const [measured, setMeasured] = useState<MeasuredSizes | null>(null);

    const signature = `${isDesktop ? 'd' : 'm'}|${itemsLength}|${percents.join(',')}`;

    useLayoutEffect(() => {
        if (positions.length === 0) return;

        const sizes: (MeasuredLabel | null)[] = [];
        for (let i = 0; i < positions.length; i++) {
            const el = textRefs.current[i];
            const bb = el?.getBBox();
            if (el && bb && bb.width > 0 && bb.height > 0) {
                sizes.push({ width: bb.width, height: bb.height, baselineOffset: readBaselineOffset(el, bb) });
            } else {
                sizes.push(null);
            }
        }
        if (sizes.every((s) => !s)) return;

        setMeasured((prev) => {
            if (prev && prev.signature === signature && sameSizes(prev.sizes, sizes)) return prev;
            return { signature, sizes };
        });
    }, [positions, signature]);

    useLayoutEffect(() => {
        const paths = pathRefs.current.slice(0, itemsLength) as SVGPathElement[];
        if (paths.length === 0 || paths.some((p) => !p)) return;

        const config = isDesktop ? CHART_CONFIG.desktop : CHART_CONFIG.mobile;
        const layout = isDesktop ? LABEL_LAYOUT.desktop : LABEL_LAYOUT.mobile;
        const bounds = getViewBounds(isDesktop);
        const center = getArcCircleCenter(paths);
        const strokeHalf = config.strokeWidth / 2;
        const sizes = measured && measured.signature === signature ? measured.sizes : null;

        const arcSamples: Point[][] = [];
        const arcBBoxes: Bounds[] = [];

        const roughLabels: RoughLabel[] = paths.map((path, index) => {
            const length = path.getTotalLength();
            const targetLength = length * (Math.max(0.01, percents[index] || 0) / 100);
            const arcPoint = path.getPointAtLength(targetLength);

            const pts: Point[] = [];
            for (let l = 0; l < targetLength; l += ARC_SAMPLE_STEP) pts.push(path.getPointAtLength(l));
            pts.push(arcPoint);
            arcSamples.push(pts);

            arcBBoxes.push(
                pts.reduce(
                    (b, p) => ({
                        minX: Math.min(b.minX, p.x),
                        maxX: Math.max(b.maxX, p.x),
                        minY: Math.min(b.minY, p.y),
                        maxY: Math.max(b.maxY, p.y),
                    }),
                    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
                ),
            );

            const normal = normalize(arcPoint.x - center.x, arcPoint.y - center.y);
            const currentRadius = Math.hypot(arcPoint.x - center.x, arcPoint.y - center.y);
            const anchorRadius = currentRadius + strokeHalf + layout.baseGap;

            const anchorX = center.x + normal.x * anchorRadius;
            const anchorY = center.y + normal.y * anchorRadius;

            const anchor = textAnchorFor(normal.x);
            const measuredItem = sizes?.[index] ?? null;
            const width = measuredItem ? measuredItem.width : layout.fallbackWidth;
            const height = measuredItem ? measuredItem.height : layout.fallbackHeight;
            const baselineOffset = measuredItem?.baselineOffset ?? height * FALLBACK_BASELINE_RATIO;

            return {
                originalIndex: index,
                arcX: arcPoint.x,
                arcY: arcPoint.y,
                x: boxXForAnchor(anchorX, width, anchor),
                y: anchorY - height / 2,
                width,
                height,
                baselineOffset,
                anchor,
            };
        });

        const minArcDist = strokeHalf + layout.arcPadding;
        const minArcDistSq = minArcDist * minArcDist;

        const rectHitsArc = (x: number, y: number, w: number, h: number): boolean => {
            for (let a = 0; a < arcSamples.length; a++) {
                const bb = arcBBoxes[a];
                if (
                    x - minArcDist > bb.maxX ||
                    x + w + minArcDist < bb.minX ||
                    y - minArcDist > bb.maxY ||
                    y + h + minArcDist < bb.minY
                ) {
                    continue;
                }
                for (const p of arcSamples[a]) {
                    const dx = Math.max(x - p.x, 0, p.x - (x + w));
                    const dy = Math.max(y - p.y, 0, p.y - (y + h));
                    if (dx * dx + dy * dy < minArcDistSq) return true;
                }
            }
            return false;
        };

        const hitsPlaced = (x: number, y: number, w: number, h: number, placed: PlacedLabel[]): boolean => {
            for (const o of placed) {
                if (
                    x < o.x + o.width + layout.collisionPadding &&
                    x + w + layout.collisionPadding > o.x &&
                    y < o.y + o.height + layout.collisionPadding &&
                    y + h + layout.collisionPadding > o.y
                ) {
                    return true;
                }
            }
            return false;
        };

        const fitsBounds = (x: number, y: number, w: number, h: number): boolean =>
            x >= bounds.minX - layout.overflow.left &&
            x + w <= bounds.maxX + layout.overflow.right &&
            y >= bounds.minY - layout.overflow.top &&
            y + h <= bounds.maxY + layout.overflow.bottom;

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

            while (steps < layout.maxSteps) {
                if (
                    fitsBounds(currentX, currentY, label.width, label.height) &&
                    !hitsPlaced(currentX, currentY, label.width, label.height, placedLabels) &&
                    !rectHitsArc(currentX, currentY, label.width, label.height)
                ) {
                    break;
                }

                if (currentX + label.width + layout.stepX > bounds.maxX + layout.overflow.right) {
                    stepX = 0;
                }

                currentX += stepX;
                currentY -= layout.stepY;

                if (currentY < bounds.minY - layout.overflow.top) {
                    currentY = bounds.minY - layout.overflow.top;
                    if (stepX === 0) break;
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

            finalResults[label.originalIndex] = {
                position: {
                    x: anchorXForBox(currentX, label.width, label.anchor),
                    y: currentY + label.baselineOffset,
                    anchor: label.anchor,
                },
                arcPoint: { x: label.arcX, y: label.arcY },
            };
        }

        setPositions(finalResults);
    }, [itemsLength, isDesktop, percents, measured, signature]);

    return { pathRefs, textRefs, positions };
}
