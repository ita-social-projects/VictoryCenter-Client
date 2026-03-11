import { useState, useMemo, useCallback, useEffect } from 'react';
import { FUNDS_EXPENDITURES_TEXT, FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS } from '@/validation/admin/reports-schema/funds-expenditures-disclaimer-schema/funds-expenditures-disclaimer-schema';
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
    const [disclaimerError, setDisclaimerError] = useState<string | undefined>(undefined);
    const [exchangeRateValue, setExchangeRateValue] = useState('');

    const [selectedType, setSelectedType] = useState<TypeFilterValue>(undefined);
    const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryFilterValue>(undefined);

    const handleEdit = useCallback(() => setIsEditing(true), []);
    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setDisclaimerError(undefined);
    }, []);

    const handleDisclaimerChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const normalized = e.target.value.replaceAll(/ {2,}/g, ' ');
        setDisclaimerValue(normalized);
    }, []);

    const handleDisclaimerBlur = useCallback(() => {
        const trimmed = disclaimerValue.replaceAll(/\s+/g, ' ').trim();
        setDisclaimerValue(trimmed);
        setDisclaimerError(FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS.validateDisclaimer(trimmed));
    }, [disclaimerValue]);

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

    const isPublishEnabled = useMemo(() => {
        const normalized = disclaimerValue.replaceAll(/\s+/g, ' ').trim();
        return normalized.length >= FUNDS_EXPENDITURES_VALIDATION.disclaimer.min && !disclaimerError;
    }, [disclaimerValue, disclaimerError]);

    useEffect(() => {
        if (!isEditing) {
            setDisclaimerValue(settings?.disclaimerTitle ?? '');
            setExchangeRateValue(settings?.exchangeRate ?? '');
            setDisclaimerError(undefined);
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
                        onChange={handleDisclaimerChange}
                        onBlur={handleDisclaimerBlur}
                        maxLength={FUNDS_EXPENDITURES_VALIDATION.disclaimer.max}
                        maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(
                            FUNDS_EXPENDITURES_VALIDATION.disclaimer.max,
                        )}
                        error={disclaimerError}
                        rows={3}
                        isRequired
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
                    <Button
                        buttonStyle="primary"
                        className={styles['footer-button']}
                        onClick={() => {}}
                        disabled={!isPublishEnabled}
                    >
                        {FUNDS_EXPENDITURES_TEXT.BUTTON.PUBLISH}
                    </Button>
                </div>
            )}
        </div>
    );
};
