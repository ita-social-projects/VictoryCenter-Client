import { useState, useMemo, useCallback, useEffect } from 'react';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { Button } from '@/components/admin/button/Button';
import { ReactComponent as EditIcon } from '@/assets/icons/edit-default.svg';
import { FundsExpendituresApi } from '@/services/api/admin/reports/funds-expenditures-api';
import {
    FundsExpendituresSummary,
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
    ReportFundsExpendituresSettings,
} from '@/types/admin/reports';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { SummaryCard } from './components/summary-card/SummaryCard';
import {
    CategoryFilterValue,
    FundsExpendituresToolbar,
    TypeFilterValue,
} from './components/funds-expenditures-toolbar/FundsExpendituresToolbar';
import { EnrichedRecord, FundsExpendituresTable } from './components/funds-expenditures-table/FundsExpendituresTable';
import styles from './FundsExpendituresSection.module.scss';

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

export const FundsExpenditureSection = () => {
    const adminClient = useAdminClient();

    const [isEditing, setIsEditing] = useState(false);
    const [disclaimerValue, setDisclaimerValue] = useState('');
    const [exchangeRateValue, setExchangeRateValue] = useState('');

    const [selectedType, setSelectedType] = useState<TypeFilterValue>(undefined);
    const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryFilterValue>(undefined);

    const handleEdit = useCallback(() => setIsEditing(true), []);
    const handleCancel = useCallback(() => setIsEditing(false), []);

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

    useEffect(() => {
        if (!isEditing) {
            setDisclaimerValue(settings?.disclaimerTitle ?? '');
            setExchangeRateValue(settings?.exchangeRate ?? '');
        }
    }, [settings, isEditing]);

    const summary = useMemo(() => computeSummary(allRecords), [allRecords]);

    const enrichedRecords = useMemo(() => enrichRecords(allRecords, categories), [allRecords, categories]);

    const filteredCategories = useMemo(
        (): ReportFundsExpendituresCategory[] => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'uk')),
        [categories],
    );

    const filteredRecords = useMemo((): EnrichedRecord[] => {
        return enrichedRecords.filter((record) => {
            const typeMatch = selectedType === undefined || record.type === selectedType;
            const categoryMatch = selectedCategoryId === undefined || record.categoryId === selectedCategoryId;
            return typeMatch && categoryMatch;
        });
    }, [enrichedRecords, selectedType, selectedCategoryId]);

    const isAddIncomeDisabled = summary.incomeCategories >= FUNDS_EXPENDITURES_TEXT.MAX_CATEGORIES_PER_TYPE;
    const isAddExpenseDisabled = summary.expenseCategories >= FUNDS_EXPENDITURES_TEXT.MAX_CATEGORIES_PER_TYPE;

    const currentExchangeRate = isEditing ? exchangeRateValue : (settings?.exchangeRate ?? null);

    return (
        <div className={styles.section}>
            {!isEditing && (
                <div className={styles['section-header']}>
                    <Button buttonStyle="primary" className={styles['edit-btn']} onClick={handleEdit}>
                        <EditIcon className={styles['edit-icon']} />
                        {FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT}
                    </Button>
                </div>
            )}
            {isEditing ? (
                <div className={styles.disclaimer}>
                    <TextAreaWithCharacterLimitGroup
                        id="funds-disclaimer"
                        name="disclaimer"
                        label={FUNDS_EXPENDITURES_TEXT.DISCLAIMER_LABEL}
                        value={disclaimerValue}
                        onChange={(e) => setDisclaimerValue(e.target.value)}
                        maxLength={FUNDS_EXPENDITURES_TEXT.DISCLAIMER_MAX_LENGTH}
                        rows={3}
                        className={styles['disclaimer-textarea-group']}
                    />
                </div>
            ) : (
                settings?.disclaimerTitle && (
                    <div className={styles.disclaimer}>
                        <span className={styles['disclaimer-label']}>{FUNDS_EXPENDITURES_TEXT.DISCLAIMER_LABEL}</span>
                        <div className={styles['disclaimer-text-area']}>
                            <p className={styles['disclaimer-text']}>{settings.disclaimerTitle}</p>
                        </div>
                    </div>
                )
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
                exchangeRate={currentExchangeRate}
                isEditing={isEditing}
                isAddIncomeDisabled={isAddIncomeDisabled}
                isAddExpenseDisabled={isAddExpenseDisabled}
                onTypeChange={handleTypeChange}
                onCategoryChange={setSelectedCategoryId}
                onExchangeRateChange={setExchangeRateValue}
                onAddIncome={() => {}}
                onAddExpense={() => {}}
            />

            <FundsExpendituresTable records={filteredRecords} isEditing={isEditing} />

            {isEditing && (
                <div className={styles['section-footer']}>
                    <Button buttonStyle="secondary" className={styles['footer-button']} onClick={handleCancel}>
                        {FUNDS_EXPENDITURES_TEXT.BUTTON.CANCEL}
                    </Button>
                    <Button buttonStyle="primary" className={styles['footer-button']} onClick={() => {}} disabled>
                        {FUNDS_EXPENDITURES_TEXT.BUTTON.PUBLISH}
                    </Button>
                </div>
            )}
        </div>
    );
};
