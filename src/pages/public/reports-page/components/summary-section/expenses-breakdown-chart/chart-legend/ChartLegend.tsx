import React from 'react';
import cn from 'classnames';
import { ExpenseItem } from '@/types/public/reports';
import styles from './ChartLegend.module.scss';

interface ChartLegendProps {
    items: ExpenseItem[];
}

export const ChartLegend: React.FC<ChartLegendProps> = ({ items }) => {
    return (
        <div className={styles.root}>
            {items.toReversed().map((item, index) => (
                <div key={item.label} className={styles.item}>
                    <span className={cn(styles.square, styles[`bg-level-${index}`])} />
                    <span className={styles.label}>{item.label}</span>
                </div>
            ))}
        </div>
    );
};
