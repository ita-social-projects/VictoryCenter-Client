import { useLayoutEffect, useRef, useState } from 'react';
import { LABEL_OFFSETS } from '../chart-graphic/chart.config';

export function useChartGeometry(itemsLength: number, deps: any[]) {
    const pathRefs = useRef<(SVGPathElement | null)[]>([]);
    const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);

    useLayoutEffect(() => {
        const result = pathRefs.current.slice(0, itemsLength).map((path, index) => {
            if (!path) return { x: 0, y: 0 };

            const { dx, dy } = LABEL_OFFSETS[index];

            const bbox = path.getBBox();
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;

            const length = path.getTotalLength();
            const point = path.getPointAtLength(length);

            return {
                x: centerX + (point.x - centerX) + dx,
                y: centerY + (point.y - centerY) + dy,
            };
        });

        setPositions(result);
    }, [itemsLength, ...deps]);

    return { pathRefs, positions };
}
