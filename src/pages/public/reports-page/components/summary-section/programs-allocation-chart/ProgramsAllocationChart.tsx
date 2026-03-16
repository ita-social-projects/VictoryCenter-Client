import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { resolveProgramsLayout } from './resolve-programs-layout';
import styles from './ProgramsAllocationChart.module.scss';

export interface ProgramAllocationItem {
    label: string;
    amount: number;
}

interface ProgramsAllocationChartProps {
    items: ProgramAllocationItem[];
    formatAmount: (uahAmount: number) => string;
}

export const ProgramsAllocationChart = ({ items, formatAmount }: ProgramsAllocationChartProps) => {
    const { t } = useTranslation('reportsPage');
    const columns = useMemo(() => resolveProgramsLayout(items), [items]);

    return (
        <div className={styles.root}>
            <p className={styles.title}>{t('summary.programs')}</p>
            <div className={styles.chart}>
                {columns.map((col, i) => (
                    <div key={i} className={styles.column} style={{ width: `${col.widthPercent}%` }}>
                        {col.blocks.map((block) => (
                            <div
                                key={block.label}
                                className={cn(styles.block, styles[`variant${block.variant}`])}
                                style={{ flexGrow: block.flexGrow }}
                            >
                                <span className={styles.label}>{block.label}</span>
                                <span className={styles.amount}>{formatAmount(block.amount)}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
