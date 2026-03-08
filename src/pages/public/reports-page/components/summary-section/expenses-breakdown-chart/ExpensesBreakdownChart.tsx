import React, { useMemo } from 'react';
import { ExpenseItem } from '@/types/public/reports/expenses';
import { ChartGraphic } from './chart-graphic';
import { ChartLegend } from './chart-legend';
import styles from './ExpensesBreakdownChart.module.scss';

interface ExpensesBreakdownChartProps {
    items: ExpenseItem[];
}

export const ExpensesBreakdownChart = ({ items }: ExpensesBreakdownChartProps) => {
    const normalizedItems = useMemo(() => items.toReversed(), [items]);

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Основні витрати</h3>
            <ChartGraphic items={normalizedItems} />
            <ChartLegend items={normalizedItems} />
        </div>
    );
};
