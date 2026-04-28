import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FundingSourcesRow } from './funding-sources-row';
import styles from './FundingSourcesChart.module.scss';

export interface FundingSourceItem {
    label: string;
    amount: number;
}

interface FundingSourcesChartProps {
    items: FundingSourceItem[];
    formatAmount: (uahAmount: number) => string;
}

export const FundingSourcesChart = ({ items, formatAmount }: FundingSourcesChartProps) => {
    const { t } = useTranslation('reportsPage');
    const maxAmount = useMemo(() => {
        return Math.max(...items.map((item) => item.amount));
    }, [items]);

    return (
        <div className={styles.root}>
            <p className={styles.title}>{t('summary.income')}</p>
            <div className={styles.chart}>
                {items.map((item, index) => (
                    <FundingSourcesRow
                        key={item.label}
                        label={item.label}
                        formattedAmount={formatAmount(item.amount)}
                        ratio={maxAmount > 0 ? item.amount / maxAmount : 0}
                        variant={styles[`variant${index % 4}`]}
                    />
                ))}
            </div>
        </div>
    );
};
