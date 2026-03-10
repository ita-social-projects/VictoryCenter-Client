import { useState, useMemo, useCallback } from 'react';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { FundsExpendituresApi } from '@/services/api/admin/reports/funds-expenditures-api';
import {
    FundsExpendituresSummary,
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
    ReportFundsExpendituresSettings,
} from '@/types/admin/reports';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { SummaryCard } from './components/summary-card/SummaryCard';
import {
    CategoryFilterValue,
    FundsExpendituresToolbar,
    TypeFilterValue,
} from './components/funds-expenditures-toolbar/FundsExpendituresToolbar';
import { EnrichedRecord, FundsExpendituresTable } from './components/funds-expenditures-table/FundsExpendituresTable';
import styles from './FundsExpendituresSection.module.scss';

interface FundsExpendituresSectionProps {
    isEditing: boolean;
}

const computeSummary = (records: ReportFundsExpendituresRecord[]): FundsExpendituresSummary => {
    const incomeRecords = records.filter((r) => r.type === 'income');
    const expenseRecords = records.filter((r) => r.type === 'expense');

    const parseAmount = (val: string) => Number.parseFloat(val.replaceAll(' ', '')) || 0;

    return {
        totalCollectedUah: incomeRecords.reduce((sum, r) => sum + parseAmount(r.amountUah), 0),
        totalCollectedUsd: incomeRecords.reduce((sum, r) => sum + parseAmount(r.amountUsd), 0),
        totalSpentUah: expenseRecords.reduce((sum, r) => sum + parseAmount(r.amountUah), 0),
        totalSpentUsd: expenseRecords.reduce((sum, r) => sum + parseAmount(r.amountUsd), 0),
        incomeCategories: new Set(incomeRecords.map((r) => r.categoryId)).size,
        expenseCategories: new Set(expenseRecords.map((r) => r.categoryId)).size,
    };
};

const enrichRecords = (
    records: ReportFundsExpendituresRecord[],
    categories: ReportFundsExpendituresCategory[],
): EnrichedRecord[] => {
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    return records.map((r) => ({
        ...r,
        categoryName: categoryMap.get(r.categoryId) ?? String(r.categoryId),
    }));
};

export const FundsExpenditureSection = ({ isEditing: _isEditing }: FundsExpendituresSectionProps) => {
    const adminClient = useAdminClient();

    const [selectedType, setSelectedType] = useState<TypeFilterValue>(undefined);
    const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryFilterValue>(undefined);

    const handleTypeChange = useCallback((type: TypeFilterValue) => {
        setSelectedType(type);
        setSelectedCategoryId(undefined);
    }, []);

    const fetchSettings = useCallback(() => FundsExpendituresApi.getSettings(adminClient), [adminClient]);
    const fetchCategories = useCallback(() => FundsExpendituresApi.getCategories(adminClient), [adminClient]);
    const fetchRecords = useCallback(() => FundsExpendituresApi.getPublishedRecords(adminClient), [adminClient]);

    const { data: settings } = useDataFetch<ReportFundsExpendituresSettings | null>({
        initialData: null,
        fetchHandler: fetchSettings,
    });

    const { data: categories } = useDataFetch<ReportFundsExpendituresCategory[]>({
        initialData: [],
        fetchHandler: fetchCategories,
    });

    const { data: allRecords } = useDataFetch<ReportFundsExpendituresRecord[]>({
        initialData: [],
        fetchHandler: fetchRecords,
    });

    const summary = useMemo(() => computeSummary(allRecords), [allRecords]);

    const enrichedRecords = useMemo(() => enrichRecords(allRecords, categories), [allRecords, categories]);

    const filteredCategories = useMemo((): ReportFundsExpendituresCategory[] => {
        const relevantRecords =
            selectedType === undefined ? allRecords : allRecords.filter((r) => r.type === selectedType);
        const activeCategoryIds = new Set(relevantRecords.map((r) => r.categoryId));
        return categories.filter((c) => activeCategoryIds.has(c.id)).sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    }, [allRecords, categories, selectedType]);

    const filteredRecords = useMemo((): EnrichedRecord[] => {
        return enrichedRecords.filter((record) => {
            const typeMatch = selectedType === undefined || record.type === selectedType;
            const categoryMatch = selectedCategoryId === undefined || record.categoryId === selectedCategoryId;
            return typeMatch && categoryMatch;
        });
    }, [enrichedRecords, selectedType, selectedCategoryId]);

    return (
        <div className={styles.section}>
            {settings?.disclaimerTitle && (
                <div className={styles.disclaimer}>
                    <span className={styles['disclaimer-label']}>{FUNDS_EXPENDITURES_TEXT.DISCLAIMER_LABEL}</span>
                    <div className={styles['disclaimer-text-area']}>
                        <p className={styles['disclaimer-text']}>{settings.disclaimerTitle}</p>
                    </div>
                </div>
            )}

            <div className={styles['summary-cards']}>
                <SummaryCard
                    title={FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.COLLECTED}
                    uah={summary.totalCollectedUah}
                    usd={summary.totalCollectedUsd}
                />
                <SummaryCard
                    title={FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.SPENT}
                    uah={summary.totalSpentUah}
                    usd={summary.totalSpentUsd}
                    blueThemeCard
                />
                <SummaryCard
                    title={FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.INCOME_CATEGORIES}
                    count={summary.incomeCategories}
                />
                <SummaryCard
                    title={FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.EXPENSE_CATEGORIES}
                    count={summary.expenseCategories}
                    blueThemeCard
                />
            </div>

            <FundsExpendituresToolbar
                categories={filteredCategories}
                selectedType={selectedType}
                selectedCategoryId={selectedCategoryId}
                exchangeRate={settings?.exchangeRate ?? null}
                onTypeChange={handleTypeChange}
                onCategoryChange={setSelectedCategoryId}
            />

            <FundsExpendituresTable records={filteredRecords} />
        </div>
    );
};
