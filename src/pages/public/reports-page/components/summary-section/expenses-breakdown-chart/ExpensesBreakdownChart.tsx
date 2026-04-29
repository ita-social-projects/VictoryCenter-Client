import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpenseItem } from '@/types/public/reports/expenses';
import { ChartGraphic } from './chart-graphic';
import { ChartLegend } from './chart-legend';
import styles from './ExpensesBreakdownChart.module.scss';

interface ExpensesBreakdownChartProps {
    items: ExpenseItem[];
    formatAmount: (uahAmount: number) => string;
}

export const ExpensesBreakdownChart = ({ items, formatAmount }: ExpensesBreakdownChartProps) => {
    const { t } = useTranslation('reportsPage');
    const normalizedItems = useMemo(() => items.toReversed(), [items]);

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>{t('summary.expenses')}</h3>
            <ChartGraphic items={normalizedItems} formatAmount={formatAmount} />
            <ChartLegend items={normalizedItems} />
        </div>
    );
};
