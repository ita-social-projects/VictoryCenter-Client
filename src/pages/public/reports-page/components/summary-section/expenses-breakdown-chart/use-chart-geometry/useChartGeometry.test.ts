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
type ChartProps = { itemsLength: number; isDesktop: boolean; percents: number[] };
const MOBILE_LABEL = { width: 30, height: 16, padding: 4, overflow: 20, viewBox: 300 };
const DESKTOP_LABEL = { width: 40, height: 20, padding: 3, overflow: 25, viewBox: 400 };

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

function setupWithRefs(
    initial: ChartProps,
    refs: { paths?: (MockPath | null)[]; texts?: (ReturnType<typeof createMockText> | null)[] },
    after?: ChartProps,
) {
    const { result, rerender } = renderChartGeometry(initial.itemsLength, initial.isDesktop, initial.percents);
    attachRefs(result, refs);
    rerender(
        after ?? { itemsLength: initial.itemsLength, isDesktop: initial.isDesktop, percents: [...initial.percents] },
    );
    return { result, rerender };
}

/** Mutates the hook's refs inside `act`, without triggering a rerender. */
function attachRefs(
    result: ReturnType<typeof renderChartGeometry>['result'],
    refs: { paths?: (MockPath | null)[]; texts?: (ReturnType<typeof createMockText> | null)[] },
) {
    act(() => {
        if (refs.paths) result.current.pathRefs.current = refs.paths as any;
        if (refs.texts) result.current.textRefs.current = refs.texts as any;
    });
}

function makeCircularRing(radius = 100, startAngleDeg = 0, endAngleDeg = 180) {
    return createCircularMockPath({ center: { x: 0, y: 0 }, radius, startAngleDeg, endAngleDeg });
}

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

function expectWithinViewBox(
    position: { x: number; y: number; anchor: Anchor },
    size: typeof MOBILE_LABEL | typeof DESKTOP_LABEL,
) {
    const box = boxOf(position, size.width, size.height);
    expect(box.x).toBeGreaterThanOrEqual(0 - size.overflow);
    expect(box.y).toBeGreaterThanOrEqual(0 - size.overflow);
    expect(box.x + box.width).toBeLessThanOrEqual(size.viewBox + size.overflow);
    expect(box.y + box.height).toBeLessThanOrEqual(size.viewBox + size.overflow);
}

describe('useChartGeometry', () => {
    describe('basic contract', () => {
        let path: MockPath;
        beforeEach(() => {
            path = makeCircularRing();
        });

        it('returns empty positions until pathRefs are attached', () => {
            const { result } = setupWithRefs(
                { itemsLength: 1, isDesktop: true, percents: [50] },
                { paths: [null] },
                {
                    itemsLength: 1,
                    isDesktop: false,
                    percents: [50],
                },
            );
            expect(result.current.positions).toEqual([]);
        });

        it('computes one LabelResult per item, each with a position and an arcPoint', () => {
            const { result } = setupWithRefs(
                { itemsLength: 1, isDesktop: true, percents: [50] },
                { paths: [path] },
                { itemsLength: 1, isDesktop: false, percents: [50] },
            );
            expect(result.current.positions).toHaveLength(1);
            expect(result.current.positions[0]).toHaveProperty('position');
            expect(result.current.positions[0]).toHaveProperty('arcPoint');
            expect(result.current.positions[0].position).toHaveProperty('anchor');
        });

        it('respects itemsLength when more paths are attached than requested', () => {
            const path2 = makeCircularRing(120);
            const { result } = setupWithRefs(
                { itemsLength: 1, isDesktop: true, percents: [50] },
                { paths: [path, path2] },
                { itemsLength: 1, isDesktop: false, percents: [50] },
            );
            expect(result.current.positions).toHaveLength(1);
        });

        it('recalculates positions when itemsLength changes', () => {
            const path2 = makeCircularRing(120);
            const { result } = setupWithRefs(
                { itemsLength: 1, isDesktop: true, percents: [50] },
                { paths: [path, path2] },
                { itemsLength: 2, isDesktop: true, percents: [50, 50] },
            );
            expect(result.current.positions).toHaveLength(2);
        });

        it('reports the exact point on the arc (arcPoint) independent of label placement', () => {
            const { result } = setupWithRefs(
                { itemsLength: 1, isDesktop: true, percents: [0] },
                { paths: [path] },
                { itemsLength: 1, isDesktop: false, percents: [0] },
            );
            expect(result.current.positions[0].arcPoint.x).toBeCloseTo(100, 1);
            expect(result.current.positions[0].arcPoint.y).toBeCloseTo(0, 1);
        });
    });

    describe('textAnchor selection and exact placement when there is no collision', () => {
        const setupRing = (percent: number) =>
            setupWithRefs(
                { itemsLength: 1, isDesktop: true, percents: [percent] },
                { paths: [makeCircularRing()] },
                { itemsLength: 1, isDesktop: false, percents: [percent] },
            );

        it('anchors "start" for a point on the right side of the shared center', () => {
            const { result } = setupRing(0);
            const { position } = result.current.positions[0];
            expect(position.anchor).toBe('start');
            expect(position.x).toBeCloseTo(108.9, 0);
            expect(position.y).toBeCloseTo(-4.5, 0);
        });

        it('anchors "middle" for a point roughly above the shared center', () => {
            const { result } = setupRing(50);
            const { position } = result.current.positions[0];
            expect(position.anchor).toBe('middle');
            expect(position.x).toBeCloseTo(0, 0);
            expect(position.y).toBeCloseTo(110, 0);
        });

        it('anchors "end" for a point on the left side of the shared center', () => {
            const { result } = setupRing(100);
            expect(result.current.positions[0].position.anchor).toBe('end');
        });

        it('builds a collision box that grows in the direction implied by textAnchor, not centered', () => {
            const startPos = setupRing(0).result.current.positions[0].position;
            const startBox = boxOf(startPos, MOBILE_LABEL.width, MOBILE_LABEL.height);
            expect(startBox.x).toBeCloseTo(startPos.x, 1);

            const endPos = setupRing(100).result.current.positions[0].position;
            const endBox = boxOf(endPos, MOBILE_LABEL.width, MOBILE_LABEL.height);
            expect(endBox.x + endBox.width).toBeCloseTo(endPos.x, 1);
        });
    });

    describe('viewBox bounds', () => {
        it('pulls an off-screen label back within all four bounds when overflow is in a fixable direction', () => {
            const mock = createFixedPointMockPath({
                bbox: { x: 100, y: 100, width: 100, height: 100 },
                point: { x: -100, y: 380 },
            });
            const { result } = setupWithRefs({ itemsLength: 1, isDesktop: false, percents: [100] }, { paths: [mock] });
            expectWithinViewBox(result.current.positions[0].position, MOBILE_LABEL);
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
            const { result } = setupWithRefs(
                { itemsLength: 2, isDesktop: true, percents: [45, 50] },
                { paths: [pathA, pathB] },
            );
            expect(result.current.positions).toHaveLength(2);
            const boxA = boxOf(result.current.positions[0].position, DESKTOP_LABEL.width, DESKTOP_LABEL.height);
            const boxB = boxOf(result.current.positions[1].position, DESKTOP_LABEL.width, DESKTOP_LABEL.height);
            expect(boxesOverlap(boxA, boxB, DESKTOP_LABEL.padding)).toBe(false);
        });

        it('does not resolve labels that are already far apart into unnecessary movement', () => {
            const { result } = setupWithRefs(
                { itemsLength: 2, isDesktop: true, percents: [0, 100] },
                { paths: [makeCircularRing(80), makeCircularRing(80)] },
                { itemsLength: 2, isDesktop: false, percents: [0, 100] },
            );
            const [first, second] = result.current.positions;
            expect(first.position.anchor).toBe('start');
            expect(second.position.anchor).toBe('end');
        });
    });

    describe('arc avoidance', () => {
        it('does not place a label on top of the visible portion of its own arc', () => {
            const { result } = setupWithRefs(
                { itemsLength: 1, isDesktop: true, percents: [50] },
                { paths: [makeCircularRing()] },
                { itemsLength: 1, isDesktop: false, percents: [50] },
            );
            const { position } = result.current.positions[0];
            const box = boxOf(position, MOBILE_LABEL.width, MOBILE_LABEL.height);
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
            const { result } = setupWithRefs(
                { itemsLength: 1, isDesktop: true, percents: [50] },
                { paths: [makeCircularRing()] },
                { itemsLength: 1, isDesktop: false, percents: [50] },
            );
            expect(result.current.positions[0].position.x).toBeCloseTo(0, 0);
            expect(result.current.positions[0].position.y).toBeCloseTo(110, 0);
        });

        it('re-lays out the label once real <text> bbox sizes become available', () => {
            const { result, rerender } = setupWithRefs(
                { itemsLength: 1, isDesktop: true, percents: [50] },
                { paths: [makeCircularRing()] },
                { itemsLength: 1, isDesktop: false, percents: [50] },
            );
            const fallbackY = result.current.positions[0].position.y;
            attachRefs(result, { texts: [createMockText({ x: 0, y: 0, width: 60, height: 24 })] });
            rerender({ itemsLength: 1, isDesktop: false, percents: [50] });
            const measuredY = result.current.positions[0].position.y;
            expect(measuredY).not.toBeCloseTo(fallbackY, 0);
        });

        it('stabilizes after real sizes are measured and does not keep re-measuring indefinitely', () => {
            const stableProps: ChartProps = { itemsLength: 1, isDesktop: false, percents: [50] };
            const { result, rerender } = setupWithRefs(
                { itemsLength: 1, isDesktop: true, percents: [50] },
                { paths: [makeCircularRing()] },
                stableProps,
            );
            const mockText = createMockText({ x: 0, y: 0, width: 60, height: 24 });
            attachRefs(result, { texts: [mockText] });
            rerender(stableProps);

            const callsAfterFirstMeasure = mockText.getBBox.mock.calls.length;
            const positionAfterFirstMeasure = result.current.positions[0].position;
            for (let i = 0; i < 5; i++) {
                rerender(stableProps);
            }
            expect(result.current.positions[0].position).toEqual(positionAfterFirstMeasure);
            expect(mockText.getBBox.mock.calls.length - callsAfterFirstMeasure).toBeLessThanOrEqual(1);
        });

        it('falls back again when percents change and stale measured sizes no longer apply', () => {
            const { result, rerender } = setupWithRefs(
                { itemsLength: 1, isDesktop: true, percents: [50] },
                { paths: [makeCircularRing()] },
                { itemsLength: 1, isDesktop: false, percents: [50] },
            );
            attachRefs(result, { texts: [createMockText({ x: 0, y: 0, width: 60, height: 24 })] });
            rerender({ itemsLength: 1, isDesktop: false, percents: [50] });

            attachRefs(result, { paths: [makeCircularRing()], texts: [null] });
            rerender({ itemsLength: 1, isDesktop: false, percents: [70] });

            expect(result.current.positions[0].position).toBeDefined();
            const rad = (70 / 100) * Math.PI;
            expect(result.current.positions[0].arcPoint.x).toBeCloseTo(100 * Math.cos(rad), 0);
            expect(result.current.positions[0].arcPoint.y).toBeCloseTo(100 * Math.sin(rad), 0);
        });
    });

    describe('desktop vs mobile config', () => {
        it('uses the desktop viewBox/layout when isDesktop is true', () => {
            const { result } = setupWithRefs(
                { itemsLength: 1, isDesktop: false, percents: [90] },
                { paths: [makeCircularRing(150, -80, 80)] },
                { itemsLength: 1, isDesktop: true, percents: [90] },
            );
            expectWithinViewBox(result.current.positions[0].position, DESKTOP_LABEL);
        });
    });
});
