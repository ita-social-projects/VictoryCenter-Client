import React, { useMemo } from 'react';
import cn from 'classnames';
import { resolveProgramsLayout } from './resolve-programs-layout';
import styles from './ProgramsAllocationChart.module.scss';

export interface ProgramAllocationItem {
    label: string;
    amount: number;
}

interface Props {
    items: ProgramAllocationItem[];
}

export const ProgramsAllocationChart: React.FC<Props> = ({ items }) => {
    const columns = useMemo(() => resolveProgramsLayout(items), [items]);

    return (
        <div className={styles.root}>
            <p className={styles.title}>Розподіл коштів по програмах</p>
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
                                <span className={styles.amount}>
                                    <span className={styles.number}>{block.amount.toLocaleString('uk-UA')}</span>{' '}
                                    <span className={styles.currency}>грн</span>
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
