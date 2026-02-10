import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    EXPENSES_DATA,
    FUNDING_DATA,
    PROGRAMS_ALLOCATION_DATA,
    SUMMARY_DATA,
} from '@/utils/mock-data/public/reports-page';
import { StatCard } from './stat-card';
import { ExpensesBreakdownChart } from './expenses-breakdown-chart';
import { FundingSourcesChart } from './funding-sources-chart';
import { ProgramsAllocationChart } from './programs-allocation-chart';
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
                <ExpensesBreakdownChart items={EXPENSES_DATA.items} />
            </div>
            <div className={styles.income}>
                <FundingSourcesChart items={FUNDING_DATA.items} />
            </div>
            <div className={styles.programs}>
                <ProgramsAllocationChart items={PROGRAMS_ALLOCATION_DATA.items} />
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
