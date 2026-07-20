import React, { useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { formatAllocationAmount, formatCollectedAmount } from '@/utils/functions/formatters/report-amount-formatters';
import { localizationLanguagesDataFetch } from '@/services/api/public/localization/languages/languages-api';
import { ReportsPublicApi } from '@/services/api/public/reports/reports-api';
import { PublishedReportFundsExpendituresDto } from '@/types/public/reports';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { StatCard } from './stat-card';
import { ExpensesBreakdownChart } from './expenses-breakdown-chart';
import { FundingSourcesChart } from './funding-sources-chart';
import { ProgramsAllocationChart } from './programs-allocation-chart';
import styles from './SummarySection.module.scss';

const UAH_LABEL = 'грн';
const USD_LABEL = 'USD';

export const SummarySection = () => {
    const { t } = useTranslation('reportsPage');
    const { isEn, currentLanguage } = useLocale();
    const fetchHandler = useCallback(async () => {
        try {
            const languages = await localizationLanguagesDataFetch();
            const langCode = currentLanguage?.startsWith('en') ? 'en' : 'uk';
            const language = languages.find((l) => l.code === langCode);

            if (!language) return null;

            return await ReportsPublicApi.getPublishedReports(language.id);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                return null;
            }
            throw err;
        }
    }, [currentLanguage]);

    const { data, isLoading, error } = useDataFetch<PublishedReportFundsExpendituresDto | null>({
        initialData: null,
        autoFetchDependencies: [currentLanguage],
        fetchHandler,
    });

    const currencyLabel = isEn ? USD_LABEL : UAH_LABEL;

    const formatItemAmount = (amount: number) => {
        return `${formatAllocationAmount(amount, isEn)} ${currencyLabel}`;
    };

    if (isLoading) {
        return (
            <div
                className={styles.root}
                style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <InlineLoader size={3} />
            </div>
        );
    }

    if (error) {
        return (
            <div
                className={styles.root}
                style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <p style={{ color: 'var(--vc-error-main, #d32f2f)' }}>
                    {t('summary.error', 'Unable to load reports. Please try again later.')}
                </p>
            </div>
        );
    }

    if (!data) return null;

    const collectedAmount = isEn ? data.funding.totalUsd : data.funding.totalUah;
    const formattedCollectedValue = `${formatCollectedAmount(collectedAmount)} ${currencyLabel}`;

    const totalExpenses = isEn ? data.expenses.totalUsd : data.expenses.totalUah;
    const expensesItems = data.expenses.items.map((item) => {
        const amount = isEn ? item.amountUsd : item.amountUah;
        const percent = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
        return {
            ...item,
            amount,
            percent,
        };
    });

    const fundingItems = data.funding.items.map((item) => ({
        ...item,
        amount: isEn ? item.amountUsd : item.amountUah,
    }));

    const programsItems = data.programs.items.map((item) => ({
        ...item,
        amount: isEn ? item.amountUsd : item.amountUah,
    }));

    return (
        <section className={styles.root}>
            <StatCard
                className={styles.collected}
                value={collectedAmount}
                formattedValue={formattedCollectedValue}
                label={data.mediaSettings.collectedFunds.title || t('summary.collected')}
                imageUrl={data.mediaSettings.collectedFunds.imageUrl}
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
                value={data.mediaSettings.changedLives.value || 0}
                label={data.mediaSettings.changedLives.title || t('summary.lives')}
                imageUrl={data.mediaSettings.changedLives.imageUrl}
                color="yellow"
            />
            {data.settings.disclaimerTitle && <p className={styles.disclaimer}>{data.settings.disclaimerTitle}</p>}
        </section>
    );
};
