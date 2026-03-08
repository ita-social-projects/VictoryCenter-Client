import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import styles from './StatCard.module.scss';

type ValueColorVariant = 'blue' | 'yellow';

interface StatCardProps {
    value: number;
    label: string;
    color?: ValueColorVariant;
    currency?: string;
    className?: string;
}

export const StatCard = ({ value, label, color = 'blue', currency, className }: StatCardProps) => {
    const { i18n } = useTranslation();

    const formattedValue = useMemo(() => {
        return new Intl.NumberFormat(i18n.language, {
            style: currency ? 'currency' : 'decimal',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(value);
    }, [value, currency, i18n.language]);

    const rootClasses = cn(styles.card, className);
    const valueClasses = cn(styles.value, styles[`text-${color}`]);

    return (
        <div className={rootClasses}>
            <div className={styles.wrapper}>
                <div className={valueClasses}>{formattedValue}</div>
                <div className={styles.label}>{label}</div>
            </div>
        </div>
    );
};
