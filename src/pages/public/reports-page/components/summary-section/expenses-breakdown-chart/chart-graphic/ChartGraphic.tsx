import React from 'react';
import { useMediaQuery } from '@/hooks/common/use-media-query/useMediaQuery';
import { ExpenseItem } from '@/types/public/reports';
import { CHART_CONFIG } from './chart.config';
import { useChartGeometry } from '../use-chart-geometry/useChartGeometry';
import styles from './ChartGraphic.module.scss';

interface ChartGraphicProps {
    items: ExpenseItem[];
    formatAmount: (uahAmount: number) => string;
}

export const ChartGraphic = ({ items, formatAmount }: ChartGraphicProps) => {
    const isDesktop = useMediaQuery('(min-width: 1440px)');
    const percents = React.useMemo(() => items.map((i) => i.percent), [items]);
    const { pathRefs, textRefs, positions } = useChartGeometry(items.length, isDesktop, percents);
    const config = isDesktop ? CHART_CONFIG.desktop : CHART_CONFIG.mobile;

    return (
        <div className={styles.root} style={{ height: config.height }}>
            <div className={styles.wrapper} style={{ width: config.wrapperWidth }}>
                <svg
                    viewBox={config.viewBox}
                    preserveAspectRatio="xMidYMid meet"
                    className={styles.chart}
                    width={config.svgWidth}
                >
                    {items.map((item, index) => (
                        <g key={`${item.label}-${index}`}>
                            <path
                                ref={(el) => {
                                    pathRefs.current[index] = el;
                                }}
                                d={config.arcs[index]}
                                strokeWidth={config.strokeWidth}
                                fill="none"
                                data-level={index}
                                className={styles.arc}
                                pathLength="100"
                                strokeDasharray={`${item.percent} 100`}
                            />
                            {positions[index] && (
                                <text
                                    ref={(el) => {
                                        textRefs.current[index] = el;
                                    }}
                                    x={positions[index].position.x}
                                    y={positions[index].position.y}
                                    textAnchor={positions[index].position.anchor}
                                    className={styles.label}
                                >
                                    <tspan className={styles.percent}>{item.percent.toFixed(1)}%</tspan>
                                    <tspan x={positions[index].position.x} dy="1.2em" className={styles.amount}>
                                        {formatAmount(item.amount)}
                                    </tspan>
                                </text>
                            )}
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
};
