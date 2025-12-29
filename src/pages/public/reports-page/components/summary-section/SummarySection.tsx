import React from 'react';
import { useTranslation } from 'react-i18next';
import { SUMMARY_DATA } from '@/utils/mock-data/public/reports-page';
import { StatCard } from './stat-card';
import styles from './SummarySection.module.scss';

export const SummarySection: React.FC = () => {
    const { t, i18n } = useTranslation('reportsPage');

    const isUa = i18n.language === 'uk';
    const collectedValue = isUa ? SUMMARY_DATA.collected.uah : SUMMARY_DATA.collected.usd;
    const currencyCode = isUa ? 'UAH' : 'USD';

    return (
        <section className={styles.root}>
            <StatCard
                className={styles.collected}
                value={collectedValue}
                currency={currencyCode}
                label={t('summary.collected')}
                color="blue"
            />

            <div className={styles.expenses}>
                <div>Основні витрати</div>
            </div>

            <div className={styles.income}>
                <div>Звідки прийшли кошти</div>
            </div>

            <div className={styles.programs}>
                <div>Розподіл коштів по програмах</div>
            </div>

            <StatCard
                className={styles.lives}
                value={SUMMARY_DATA.livesChanged}
                label={t('summary.lives')}
                color="yellow"
            />
        </section>
    );
};
