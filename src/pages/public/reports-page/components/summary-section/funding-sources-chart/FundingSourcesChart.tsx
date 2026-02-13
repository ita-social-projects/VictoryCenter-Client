import React, { useMemo } from 'react';
import { FundingSourcesRow } from './funding-sources-row';
import styles from './FundingSourcesChart.module.scss';

export interface FundingSourceItem {
    label: string;
    amount: number;
}

interface FundingSourcesChartProps {
    items: FundingSourceItem[];
}

export const FundingSourcesChart = ({ items }: FundingSourcesChartProps) => {
    const maxAmount = useMemo(() => {
        return Math.max(...items.map((item) => item.amount));
    }, [items]);

    return (
        <div className={styles.root}>
            <p className={styles.title}>Звідки прийшли кошти</p>
            <div className={styles.chart}>
                {items.map((item, index) => (
                    <FundingSourcesRow
                        key={item.label}
                        label={item.label}
                        formattedAmount={`${item.amount.toLocaleString('uk-UA')} грн`}
                        ratio={maxAmount > 0 ? item.amount / maxAmount : 0}
                        variant={styles[`variant${index % 4}`]}
                    />
                ))}
            </div>
        </div>
    );
};
