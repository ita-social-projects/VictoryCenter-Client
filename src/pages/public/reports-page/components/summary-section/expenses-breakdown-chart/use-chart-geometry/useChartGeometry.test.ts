import { renderHook, act } from '@testing-library/react';
import { useChartGeometry } from './useChartGeometry';

jest.mock('../chart-graphic/chart.config', () => ({
    CHART_CONFIG: {
        mobile: { viewBox: '0 0 300 300', strokeWidth: 0 },
        desktop: { viewBox: '0 0 400 400', strokeWidth: 0 },
    },
    LABEL_LAYOUT: {
        mobile: {
            baseGap: 10,
            collisionPadding: 4,
            arcPadding: 2,
            overflow: { left: 20, right: 20, top: 20, bottom: 20 },
            stepX: 2,
            stepY: 2,
            fallbackWidth: 30,
            fallbackHeight: 16,
            maxSteps: 200,
        },
        desktop: {
            baseGap: 14,
            collisionPadding: 3,
            arcPadding: 3,
            overflow: { left: 25, right: 25, top: 25, bottom: 25 },
            stepX: 2,
            stepY: 2,
            fallbackWidth: 40,
            fallbackHeight: 20,
            maxSteps: 200,
        },
    },
}));

interface Point {
    x: number;
    y: number;
}

type Anchor = 'start' | 'middle' | 'end';

type MockPath = {
    getBBox: jest.Mock;
    getTotalLength: jest.Mock;
    getPointAtLength: jest.Mock;
};

function createCircularMockPath(options: {
    center: Point;
    radius: number;
    startAngleDeg: number;
    endAngleDeg: number;
}): MockPath {
    const { center, radius, startAngleDeg, endAngleDeg } = options;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const totalLength = radius * Math.abs(toRad(endAngleDeg - startAngleDeg));

    const pointAtT = (t: number): Point => {
        const angle = toRad(startAngleDeg + (endAngleDeg - startAngleDeg) * t);
        return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
    };

    const samples = Array.from({ length: 21 }, (_, i) => pointAtT(i / 20));
    const xs = samples.map((p) => p.x);
    const ys = samples.map((p) => p.y);

    return {
        getBBox: jest.fn(() => ({
            x: Math.min(...xs),
            y: Math.min(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys),
        })),
        getTotalLength: jest.fn(() => totalLength),
        getPointAtLength: jest.fn((length: number) => pointAtT(totalLength === 0 ? 0 : length / totalLength)),
    };
}

function createFixedPointMockPath(options: {
    bbox: { x: number; y: number; width: number; height: number };
    point: Point;
    totalLength?: number;
}): MockPath {
    const { bbox, point, totalLength = 50 } = options;
    return {
        getBBox: jest.fn(() => bbox),
        getTotalLength: jest.fn(() => totalLength),
        getPointAtLength: jest.fn(() => point),
    };
}

function createMockText(bbox: { x: number; y: number; width: number; height: number }) {
    return { getBBox: jest.fn(() => bbox) };
}

const renderChartGeometry = (itemsLength: number, isDesktop: boolean, percents: number[]) =>
    renderHook(({ itemsLength, isDesktop, percents }) => useChartGeometry(itemsLength, isDesktop, percents), {
        initialProps: { itemsLength, isDesktop, percents },
    });

function boxXForAnchor(anchorX: number, width: number, anchor: Anchor): number {
    if (anchor === 'start') return anchorX;
    if (anchor === 'end') return anchorX - width;
    return anchorX - width / 2;
}

function boxOf(position: { x: number; y: number; anchor: Anchor }, width: number, height: number) {
    return {
        x: boxXForAnchor(position.x, width, position.anchor),
        y: position.y - height / 2,
        width,
        height,
    };
}

function boxesOverlap(a: ReturnType<typeof boxOf>, b: ReturnType<typeof boxOf>, padding = 0): boolean {
    return (
        a.x < b.x + b.width + padding &&
        a.x + a.width + padding > b.x &&
        a.y < b.y + b.height + padding &&
        a.y + a.height + padding > b.y
    );
}

describe('useChartGeometry', () => {
    describe('basic contract', () => {
        let path: MockPath;

        beforeEach(() => {
            path = createCircularMockPath({ center: { x: 0, y: 0 }, radius: 100, startAngleDeg: 0, endAngleDeg: 180 });
        });

        it('returns empty positions until pathRefs are attached', () => {
            const { result, rerender } = renderChartGeometry(1, true, [50]);

            act(() => {
                result.current.pathRefs.current = [null];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [50] });

            expect(result.current.positions).toEqual([]);
        });

        it('computes one LabelResult per item, each with a position and an arcPoint', () => {
            const { result, rerender } = renderChartGeometry(1, true, [50]);

            act(() => {
                result.current.pathRefs.current = [path as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [50] });

            expect(result.current.positions).toHaveLength(1);
            expect(result.current.positions[0]).toHaveProperty('position');
            expect(result.current.positions[0]).toHaveProperty('arcPoint');
            expect(result.current.positions[0].position).toHaveProperty('anchor');
        });

        it('respects itemsLength when more paths are attached than requested', () => {
            const path2 = createCircularMockPath({
                center: { x: 0, y: 0 },
                radius: 120,
                startAngleDeg: 0,
                endAngleDeg: 180,
            });
            const { result, rerender } = renderChartGeometry(1, true, [50]);

            act(() => {
                result.current.pathRefs.current = [path as any, path2 as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [50] });

            expect(result.current.positions).toHaveLength(1);
        });

        it('recalculates positions when itemsLength changes', () => {
            const path2 = createCircularMockPath({
                center: { x: 0, y: 0 },
                radius: 120,
                startAngleDeg: 0,
                endAngleDeg: 180,
            });
            const { result, rerender } = renderChartGeometry(1, true, [50]);

            act(() => {
                result.current.pathRefs.current = [path as any, path2 as any];
            });
            rerender({ itemsLength: 2, isDesktop: true, percents: [50, 50] });

            expect(result.current.positions).toHaveLength(2);
        });

        it('reports the exact point on the arc (arcPoint) independent of label placement', () => {
            const { result, rerender } = renderChartGeometry(1, true, [0]);

            act(() => {
                result.current.pathRefs.current = [path as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [0] });

            expect(result.current.positions[0].arcPoint.x).toBeCloseTo(100, 1);
            expect(result.current.positions[0].arcPoint.y).toBeCloseTo(0, 1);
        });
    });

    describe('textAnchor selection and exact placement when there is no collision', () => {
        const makeRing = () =>
            createCircularMockPath({ center: { x: 0, y: 0 }, radius: 100, startAngleDeg: 0, endAngleDeg: 180 });

        it('anchors "start" for a point on the right side of the shared center', () => {
            const { result, rerender } = renderChartGeometry(1, true, [0]);

            act(() => {
                result.current.pathRefs.current = [makeRing() as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [0] });

            const { position } = result.current.positions[0];
            expect(position.anchor).toBe('start');
            expect(position.x).toBeCloseTo(108.9, 0);
            expect(position.y).toBeCloseTo(-4.5, 0);
        });

        it('anchors "middle" for a point roughly above the shared center', () => {
            const { result, rerender } = renderChartGeometry(1, true, [50]);

            act(() => {
                result.current.pathRefs.current = [makeRing() as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [50] });

            const { position } = result.current.positions[0];
            expect(position.anchor).toBe('middle');
            expect(position.x).toBeCloseTo(0, 0);
            expect(position.y).toBeCloseTo(110, 0);
        });

        it('anchors "end" for a point on the left side of the shared center', () => {
            const { result, rerender } = renderChartGeometry(1, true, [100]);

            act(() => {
                result.current.pathRefs.current = [makeRing() as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [100] });

            const { position } = result.current.positions[0];
            expect(position.anchor).toBe('end');
        });

        it('builds a collision box that grows in the direction implied by textAnchor, not centered', () => {
            const { result: startResult, rerender: rerenderStart } = renderChartGeometry(1, true, [0]);
            act(() => {
                startResult.current.pathRefs.current = [makeRing() as any];
            });
            rerenderStart({ itemsLength: 1, isDesktop: false, percents: [0] });
            const startPos = startResult.current.positions[0].position;
            const startBox = boxOf(startPos, 30, 16);
            expect(startBox.x).toBeCloseTo(startPos.x, 1);

            const { result: endResult, rerender: rerenderEnd } = renderChartGeometry(1, true, [100]);
            act(() => {
                endResult.current.pathRefs.current = [makeRing() as any];
            });
            rerenderEnd({ itemsLength: 1, isDesktop: false, percents: [100] });
            const endPos = endResult.current.positions[0].position;
            const endBox = boxOf(endPos, 30, 16);
            expect(endBox.x + endBox.width).toBeCloseTo(endPos.x, 1);
        });
    });

    describe('viewBox bounds', () => {
        it('pulls an off-screen label back within all four bounds when overflow is in a fixable direction', () => {
            const mock = createFixedPointMockPath({
                bbox: { x: 100, y: 100, width: 100, height: 100 },
                point: { x: -100, y: 380 },
            });

            const { result, rerender } = renderChartGeometry(1, false, [100]);
            act(() => {
                result.current.pathRefs.current = [mock as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [100] });

            const { x, y, anchor } = result.current.positions[0].position;
            const width = 30;
            const height = 16;
            const box = boxOf({ x, y, anchor }, width, height);

            expect(box.x).toBeGreaterThanOrEqual(0 - 20);
            expect(box.y).toBeGreaterThanOrEqual(0 - 20);
            expect(box.x + box.width).toBeLessThanOrEqual(300 + 20);
            expect(box.y + box.height).toBeLessThanOrEqual(300 + 20);
        });
    });

    describe('collision resolution between labels', () => {
        it('separates two labels with near-identical rough anchors so their boxes do not overlap', () => {
            const pathA = createFixedPointMockPath({
                bbox: { x: 0, y: 0, width: 0, height: 0 },
                point: { x: 150, y: 170 },
            });
            const pathB = createFixedPointMockPath({
                bbox: { x: 0, y: 0, width: 0, height: 0 },
                point: { x: 160, y: 175 },
            });

            const { result, rerender } = renderChartGeometry(2, true, [45, 50]);
            act(() => {
                result.current.pathRefs.current = [pathA as any, pathB as any];
            });
            rerender({ itemsLength: 2, isDesktop: true, percents: [45, 50] });

            expect(result.current.positions).toHaveLength(2);

            const width = 40;
            const height = 20;
            const collisionPadding = 3;

            const boxA = boxOf(result.current.positions[0].position, width, height);
            const boxB = boxOf(result.current.positions[1].position, width, height);

            expect(boxesOverlap(boxA, boxB, collisionPadding)).toBe(false);
        });

        it('does not resolve labels that are already far apart into unnecessary movement', () => {
            const ringA = createCircularMockPath({
                center: { x: 0, y: 0 },
                radius: 80,
                startAngleDeg: 0,
                endAngleDeg: 180,
            });
            const ringB = createCircularMockPath({
                center: { x: 0, y: 0 },
                radius: 80,
                startAngleDeg: 0,
                endAngleDeg: 180,
            });

            const { result, rerender } = renderChartGeometry(2, true, [0, 100]);
            act(() => {
                result.current.pathRefs.current = [ringA as any, ringB as any];
            });
            rerender({ itemsLength: 2, isDesktop: false, percents: [0, 100] });

            const [first, second] = result.current.positions;
            expect(first.position.anchor).toBe('start');
            expect(second.position.anchor).toBe('end');
        });
    });

    describe('arc avoidance', () => {
        it('does not place a label on top of the visible portion of its own arc', () => {
            const ring = createCircularMockPath({
                center: { x: 0, y: 0 },
                radius: 100,
                startAngleDeg: 0,
                endAngleDeg: 180,
            });

            const { result, rerender } = renderChartGeometry(1, true, [50]);
            act(() => {
                result.current.pathRefs.current = [ring as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [50] });

            const { position } = result.current.positions[0];
            const box = boxOf(position, 30, 16);

            const minArcDist = 2;
            for (let deg = 0; deg <= 90; deg += 5) {
                const rad = (deg * Math.PI) / 180;
                const p = { x: 100 * Math.cos(rad), y: 100 * Math.sin(rad) };
                const dx = Math.max(box.x - p.x, 0, p.x - (box.x + box.width));
                const dy = Math.max(box.y - p.y, 0, p.y - (box.y + box.height));
                expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(minArcDist);
            }
        });
    });

    describe('measure pass (real text size integration)', () => {
        it('uses fallback dimensions before any <text> bbox is available', () => {
            const ring = createCircularMockPath({
                center: { x: 0, y: 0 },
                radius: 100,
                startAngleDeg: 0,
                endAngleDeg: 180,
            });
            const { result, rerender } = renderChartGeometry(1, true, [50]);

            act(() => {
                result.current.pathRefs.current = [ring as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [50] });

            expect(result.current.positions[0].position.x).toBeCloseTo(0, 0);
            expect(result.current.positions[0].position.y).toBeCloseTo(110, 0);
        });

        it('re-lays out the label once real <text> bbox sizes become available', () => {
            const ring = createCircularMockPath({
                center: { x: 0, y: 0 },
                radius: 100,
                startAngleDeg: 0,
                endAngleDeg: 180,
            });
            const { result, rerender } = renderChartGeometry(1, true, [50]);

            act(() => {
                result.current.pathRefs.current = [ring as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [50] });

            const fallbackY = result.current.positions[0].position.y;

            act(() => {
                result.current.textRefs.current = [createMockText({ x: 0, y: 0, width: 60, height: 24 }) as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [50] });

            const measuredY = result.current.positions[0].position.y;

            expect(measuredY).not.toBeCloseTo(fallbackY, 0);
        });

        it('stabilizes after real sizes are measured and does not keep re-measuring indefinitely', () => {
            const ring = createCircularMockPath({
                center: { x: 0, y: 0 },
                radius: 100,
                startAngleDeg: 0,
                endAngleDeg: 180,
            });
            const stablePercents = [50];
            const { result, rerender } = renderChartGeometry(1, true, [50]);

            act(() => {
                result.current.pathRefs.current = [ring as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [50] });

            const mockText = createMockText({ x: 0, y: 0, width: 60, height: 24 });
            act(() => {
                result.current.textRefs.current = [mockText as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: stablePercents });

            const callsAfterFirstMeasure = mockText.getBBox.mock.calls.length;
            const positionAfterFirstMeasure = result.current.positions[0].position;

            for (let i = 0; i < 5; i++) {
                rerender({ itemsLength: 1, isDesktop: false, percents: stablePercents });
            }

            expect(result.current.positions[0].position).toEqual(positionAfterFirstMeasure);
            expect(mockText.getBBox.mock.calls.length - callsAfterFirstMeasure).toBeLessThanOrEqual(1);
        });

        it('falls back again when percents change and stale measured sizes no longer apply', () => {
            const ringInitial = createCircularMockPath({
                center: { x: 0, y: 0 },
                radius: 100,
                startAngleDeg: 0,
                endAngleDeg: 180,
            });
            const { result, rerender } = renderChartGeometry(1, true, [50]);

            act(() => {
                result.current.pathRefs.current = [ringInitial as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [50] });

            act(() => {
                result.current.textRefs.current = [createMockText({ x: 0, y: 0, width: 60, height: 24 }) as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [50] });

            const ringUpdated = createCircularMockPath({
                center: { x: 0, y: 0 },
                radius: 100,
                startAngleDeg: 0,
                endAngleDeg: 180,
            });
            act(() => {
                result.current.pathRefs.current = [ringUpdated as any];
                result.current.textRefs.current = [null as any];
            });
            rerender({ itemsLength: 1, isDesktop: false, percents: [70] });

            expect(result.current.positions[0].position).toBeDefined();
            const rad = (70 / 100) * Math.PI;
            expect(result.current.positions[0].arcPoint.x).toBeCloseTo(100 * Math.cos(rad), 0);
            expect(result.current.positions[0].arcPoint.y).toBeCloseTo(100 * Math.sin(rad), 0);
        });
    });

    describe('desktop vs mobile config', () => {
        it('uses the desktop viewBox/layout when isDesktop is true', () => {
            const ring = createCircularMockPath({
                center: { x: 0, y: 0 },
                radius: 150,
                startAngleDeg: -80,
                endAngleDeg: 80,
            });

            const { result, rerender } = renderChartGeometry(1, false, [90]);
            act(() => {
                result.current.pathRefs.current = [ring as any];
            });
            rerender({ itemsLength: 1, isDesktop: true, percents: [90] });

            const { x, y, anchor } = result.current.positions[0].position;
            const width = 40;
            const height = 20;
            const box = boxOf({ x, y, anchor }, width, height);

            expect(box.x).toBeGreaterThanOrEqual(0 - 25);
            expect(box.y).toBeGreaterThanOrEqual(0 - 25);
            expect(box.x + box.width).toBeLessThanOrEqual(400 + 25);
            expect(box.y + box.height).toBeLessThanOrEqual(400 + 25);
        });
    });
});
