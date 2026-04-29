import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import {
    EXPENSES_DATA,
    FUNDING_DATA,
    PROGRAMS_ALLOCATION_DATA,
    SUMMARY_DATA,
} from '@/utils/mock-data/public/reports-page';
import { formatAllocationAmount, formatCollectedAmount } from '@/utils/functions/formatters/report-amount-formatters';
import { StatCard } from './stat-card';
import { ExpensesBreakdownChart } from './expenses-breakdown-chart';
import { FundingSourcesChart } from './funding-sources-chart';
import { ProgramsAllocationChart } from './programs-allocation-chart';
import styles from './SummarySection.module.scss';

const UAH_LABEL = 'грн';
const USD_LABEL = 'USD';

export const SummarySection = () => {
    const { t } = useTranslation('reportsPage');
    const { isEn } = useLocale();

    const currencyKey: 'uah' | 'usd' = isEn ? 'usd' : 'uah';
    const currencyLabel = isEn ? USD_LABEL : UAH_LABEL;

    const formatItemAmount = (amount: number) => {
        return `${formatAllocationAmount(amount, isEn)} ${currencyLabel}`;
    };

    const collectedAmount = SUMMARY_DATA.collected[currencyKey];
    const formattedCollectedValue = `${formatCollectedAmount(collectedAmount)} ${currencyLabel}`;

    const expensesItems = EXPENSES_DATA.items.map((item) => ({
        ...item,
        amount: item.amount[currencyKey],
    }));

    const fundingItems = FUNDING_DATA.items.map((item) => ({
        ...item,
        amount: item.amount[currencyKey],
    }));

    const programsItems = PROGRAMS_ALLOCATION_DATA.items.map((item) => ({
        ...item,
        amount: item.amount[currencyKey],
    }));

    return (
        <section className={styles.root}>
            <StatCard
                className={styles.collected}
                value={collectedAmount}
                formattedValue={formattedCollectedValue}
                label={t('summary.collected')}
                color="blue"
            />
            <div className={styles.expenses}>
                <ExpensesBreakdownChart items={expensesItems} formatAmount={formatItemAmount} />
            </div>
            <div className={styles.income}>
                <FundingSourcesChart items={fundingItems} formatAmount={formatItemAmount} />
            </div>
            <div className={styles.programs}>
                <ProgramsAllocationChart items={programsItems} formatAmount={formatItemAmount} />
            </div>
            <StatCard
                className={styles.lives}
                value={SUMMARY_DATA.livesChanged}
                label={t('summary.lives')}
                color="yellow"
            />
            {isEn && SUMMARY_DATA.disclaimer && <p className={styles.disclaimer}>{SUMMARY_DATA.disclaimer}</p>}
        </section>
    );
};
