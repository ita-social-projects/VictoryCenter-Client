import { useLayoutEffect, useRef, useState } from 'react';
import { LABEL_OFFSETS } from '../chart-graphic/chart.config';

export function useChartGeometry(itemsLength: number, isDesktop: boolean, percents: number[]) {
    const pathRefs = useRef<(SVGPathElement | null)[]>([]);
    const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);

    useLayoutEffect(() => {
        const result = pathRefs.current.slice(0, itemsLength).map((path, index) => {
            if (!path) return { x: 0, y: 0 };

            const { dx, dy } = LABEL_OFFSETS[index] || { dx: 0, dy: 0 };

            const bbox = path.getBBox();
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;

            const length = path.getTotalLength();
            const targetLength = length * (Math.max(0.01, percents[index] || 0) / 100);
            const point = path.getPointAtLength(targetLength);

            return {
                x: centerX + (point.x - centerX) + dx,
                y: centerY + (point.y - centerY) + dy,
            };
        });

        setPositions(result);
    }, [itemsLength, isDesktop, percents]);

    return { pathRefs, positions };
}
