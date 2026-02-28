import React from 'react';
import { ExpenseItem } from '@/types/public/reports';
import styles from './ChartLegend.module.scss';

interface ChartLegendProps {
    items: ExpenseItem[];
}

export const ChartLegend = ({ items }: ChartLegendProps) => {
    return (
        <div className={styles.root}>
            {items.map((item, index) => (
                <div key={`${item.label}-${index}`} className={styles.item}>
                    <span className={styles.square} data-level={index} />
                    <span className={styles.label}>{item.label}</span>
                </div>
            ))}
        </div>
    );
};
