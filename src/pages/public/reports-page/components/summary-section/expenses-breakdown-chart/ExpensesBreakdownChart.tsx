import React from 'react';
import { ExpenseItem } from '@/types/public/reports/expenses';
import { ChartLegend } from './chart-legend';
import styles from './ExpensesBreakdownChart.module.scss';

interface ExpensesBreakdownChartProps {
    items: ExpenseItem[];
}

export const ExpensesBreakdownChart = ({ items }: ExpensesBreakdownChartProps) => {
    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Основні витрати</h3>
            <ChartLegend items={items} />
        </div>
    );
};
