import React, { memo } from 'react';
import cn from 'classnames';
import styles from './FundingSourcesRow.module.scss';

interface ChartRowProps {
    label: string;
    formattedAmount: string;
    ratio: number;
    variant: string;
}

export const FundingSourcesRow = memo(({ label, formattedAmount, ratio, variant }: ChartRowProps) => {
    return (
        <div className={styles.row}>
            <div className={cn(styles.bar, variant)} style={{ width: `${ratio * 100}%` }} />
            <div className={styles.info}>
                <span className={styles.label} title={label}>
                    {label}
                </span>
                <span className={styles.amount}>{formattedAmount}</span>
            </div>
        </div>
    );
});

FundingSourcesRow.displayName = 'FundingSourcesRow';
