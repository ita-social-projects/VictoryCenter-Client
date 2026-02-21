import { renderHook, act } from '@testing-library/react';
import { useChartGeometry } from './useChartGeometry';

jest.mock('../chart-graphic/chart.config', () => ({
    LABEL_OFFSETS: [
        { dx: 10, dy: 5 },
        { dx: -5, dy: 20 },
        { dx: 0, dy: 0 },
    ],
}));

type MockPath = {
    getBBox: jest.Mock;
    getTotalLength: jest.Mock;
    getPointAtLength: jest.Mock;
};

function createMockPath({
    bbox,
    totalLength,
    point,
}: {
    bbox: { x: number; y: number; width: number; height: number };
    totalLength: number;
    point: { x: number; y: number };
}): MockPath {
    return {
        getBBox: jest.fn(() => bbox),
        getTotalLength: jest.fn(() => totalLength),
        getPointAtLength: jest.fn(() => point),
    };
}

describe('useChartGeometry', () => {
    it('calculates positions correctly', () => {
        const mockPath1 = createMockPath({
            bbox: { x: 0, y: 0, width: 100, height: 100 },
            totalLength: 100,
            point: { x: 100, y: 50 },
        });

        const mockPath2 = createMockPath({
            bbox: { x: 50, y: 50, width: 100, height: 100 },
            totalLength: 200,
            point: { x: 150, y: 200 },
        });

        const { result, rerender } = renderHook(({ itemsLength, dep }) => useChartGeometry(itemsLength, [dep]), {
            initialProps: {
                itemsLength: 2,
                dep: 1,
            },
        });

        act(() => {
            result.current.pathRefs.current = [mockPath1 as any, mockPath2 as any];
        });

        rerender({ itemsLength: 2, dep: 2 });

        expect(result.current.positions).toEqual([
            { x: 110, y: 55 },
            { x: 145, y: 220 },
        ]);
    });

    it('returns {0,0} when path is null', () => {
        const { result, rerender } = renderHook(({ itemsLength, dep }) => useChartGeometry(itemsLength, [dep]), {
            initialProps: { itemsLength: 1, dep: 1 },
        });

        act(() => {
            result.current.pathRefs.current = [null];
        });

        rerender({ itemsLength: 1, dep: 2 });

        expect(result.current.positions).toEqual([{ x: 0, y: 0 }]);
    });

    it('respects itemsLength slice', () => {
        const mockPath = createMockPath({
            bbox: { x: 0, y: 0, width: 100, height: 100 },
            totalLength: 100,
            point: { x: 100, y: 50 },
        });

        const { result, rerender } = renderHook(({ itemsLength, dep }) => useChartGeometry(itemsLength, [dep]), {
            initialProps: { itemsLength: 1, dep: 1 },
        });

        act(() => {
            result.current.pathRefs.current = [mockPath as any, mockPath as any];
        });

        rerender({ itemsLength: 1, dep: 2 });

        expect(result.current.positions).toHaveLength(1);
    });

    it('recalculates when itemsLength changes', () => {
        const mockPath = createMockPath({
            bbox: { x: 0, y: 0, width: 100, height: 100 },
            totalLength: 100,
            point: { x: 100, y: 50 },
        });

        const { result, rerender } = renderHook(({ itemsLength, dep }) => useChartGeometry(itemsLength, [dep]), {
            initialProps: { itemsLength: 1, dep: 1 },
        });

        act(() => {
            result.current.pathRefs.current = [mockPath as any, mockPath as any];
        });

        rerender({ itemsLength: 2, dep: 1 });

        expect(result.current.positions).toHaveLength(2);
    });
});
