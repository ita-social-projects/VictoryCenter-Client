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
    formattedValue?: string;
    className?: string;
    imageUrl?: string | null;
}

export const StatCard = ({
    value,
    label,
    color = 'blue',
    currency,
    formattedValue,
    className,
    imageUrl,
}: StatCardProps) => {
    const { i18n } = useTranslation();

    const displayValue = useMemo(() => {
        if (formattedValue !== undefined) return formattedValue;
        return new Intl.NumberFormat(i18n.language, {
            style: currency ? 'currency' : 'decimal',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(value);
    }, [value, currency, formattedValue, i18n.language]);

    const rootClasses = cn(styles.card, className);
    const valueClasses = cn(styles.value, styles[`text-${color}`]);

    const backgroundStyle = imageUrl
        ? ({ '--dynamic-bg-image': `url('${imageUrl}')` } as React.CSSProperties)
        : undefined;

    return (
        <div className={rootClasses} style={backgroundStyle}>
            <div className={styles.wrapper}>
                <div className={valueClasses}>{displayValue}</div>
                <div className={styles.label}>{label}</div>
            </div>
        </div>
    );
};
