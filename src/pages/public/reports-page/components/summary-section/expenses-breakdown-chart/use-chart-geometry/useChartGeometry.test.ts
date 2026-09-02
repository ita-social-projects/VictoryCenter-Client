import { renderHook, act } from '@testing-library/react';
import { useChartGeometry } from './useChartGeometry';

jest.mock('../chart-graphic/chart.config', () => ({
    CHART_CONFIG: {
        mobile: {
            viewBox: '0 0 100 100',
            strokeWidth: 0,
        },
        desktop: {
            viewBox: '0 0 200 200',
            strokeWidth: 0,
        },
    },
    LABEL_LAYOUT: {
        mobile: {
            baseGap: 0,
            collisionPadding: 0,
            boundsPadding: 0,
            stepX: 0,
            stepY: 0,
            fallbackWidth: 20,
            fallbackHeight: 20,
        },
        desktop: {
            baseGap: 0,
            collisionPadding: 0,
            boundsPadding: 0,
            stepX: 0,
            stepY: 0,
            fallbackWidth: 20,
            fallbackHeight: 20,
        },
    },
}));

type MockPath = {
    getBBox: jest.Mock;
    getTotalLength: jest.Mock;
    getPointAtLength: jest.Mock;
};

const createMockPath = ({
    bbox,
    totalLength,
    point,
}: {
    bbox: { x: number; y: number; width: number; height: number };
    totalLength: number;
    point: { x: number; y: number };
}): MockPath => ({
    getBBox: jest.fn(() => bbox),
    getTotalLength: jest.fn(() => totalLength),
    getPointAtLength: jest.fn(() => point),
});

const renderChartGeometry = (itemsLength: number, isDesktop: boolean, percents: number[]) =>
    renderHook(({ itemsLength, isDesktop, percents }) => useChartGeometry(itemsLength, isDesktop, percents), {
        initialProps: { itemsLength, isDesktop, percents },
    });

describe('useChartGeometry', () => {
    let mockPath1: MockPath;
    let mockPath2: MockPath;

    beforeEach(() => {
        mockPath1 = createMockPath({
            bbox: { x: 0, y: 0, width: 0, height: 0 },
            totalLength: 100,
            point: { x: 10, y: 0 },
        });
        mockPath2 = createMockPath({
            bbox: { x: 0, y: 0, width: 0, height: 0 },
            totalLength: 200,
            point: { x: 0, y: 20 },
        });
    });

    it('calculates positions correctly with new structure', () => {
        const { result, rerender } = renderChartGeometry(2, true, [100, 100]);

        act(() => {
            result.current.pathRefs.current = [mockPath1 as any, mockPath2 as any];
        });

        rerender({ itemsLength: 2, isDesktop: false, percents: [100, 100] });
        expect(result.current.positions).toHaveLength(2);

        expect(result.current.positions[0]).toHaveProperty('position');
        expect(result.current.positions[0]).toHaveProperty('arcPoint');
        expect(result.current.positions[0].position.x).toBeCloseTo(10, 1);
        expect(result.current.positions[0].position.y).toBeCloseTo(0, 1);
        expect(result.current.positions[0].position.anchor).toBe('start');
    });

    it('returns empty array when path is null (early return)', () => {
        const { result, rerender } = renderChartGeometry(1, true, [100]);

        act(() => {
            result.current.pathRefs.current = [null];
        });

        rerender({ itemsLength: 1, isDesktop: false, percents: [100] });
        expect(result.current.positions).toEqual([]);
    });

    it('respects itemsLength slice', () => {
        const { result, rerender } = renderChartGeometry(1, true, [100]);

        act(() => {
            result.current.pathRefs.current = [mockPath1 as any, mockPath2 as any];
        });

        rerender({ itemsLength: 1, isDesktop: false, percents: [100] });

        expect(result.current.positions).toHaveLength(1);
    });

    it('recalculates when itemsLength changes', () => {
        const { result, rerender } = renderChartGeometry(1, true, [100]);

        act(() => {
            result.current.pathRefs.current = [mockPath1 as any, mockPath2 as any];
        });

        rerender({ itemsLength: 2, isDesktop: true, percents: [100, 100] });

        expect(result.current.positions).toHaveLength(2);
    });
});
