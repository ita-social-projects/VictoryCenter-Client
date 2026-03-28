import { useState, useMemo, useCallback, useEffect } from 'react';
import { FUNDS_EXPENDITURES_TEXT, FUNDS_EXPENDITURES_VALIDATION, REPORTS_TEXT } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS } from '@/validation/admin/reports-schema/funds-expenditures-disclaimer-schema/funds-expenditures-disclaimer-schema';
import {
    normalizeFundsExpendituresExchangeRateInput,
    validateFundsExpendituresExchangeRate,
} from '@/validation/admin/reports-schema/funds-expenditures-exchange-rate-schema/funds-expenditures-exchange-rate-schema';
import { Button } from '@/components/admin/button/Button';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { FundsExpendituresApi } from '@/services/api/admin/reports/funds-expenditures-api';
import {
    FundsExpendituresSummary,
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
    ReportFundsExpendituresSettings,
} from '@/types/admin/reports';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { ToastType } from '@/types/admin/toast';
import { SummaryCard } from './components/summary-card/SummaryCard';
import {
    CategoryFilterValue,
    FundsExpendituresToolbar,
    TypeFilterValue,
} from './components/funds-expenditures-toolbar/FundsExpendituresToolbar';
import { EnrichedRecord, FundsExpendituresTable } from './components/funds-expenditures-table/FundsExpendituresTable';
import styles from './FundsExpendituresSection.module.scss';

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
    const { addToast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [disclaimerValue, setDisclaimerValue] = useState('');
    const [disclaimerError, setDisclaimerError] = useState<string | undefined>(undefined);
    const [exchangeRateValue, setExchangeRateValue] = useState('');
    const [exchangeRateError, setExchangeRateError] = useState<string | undefined>(undefined);

    const [selectedType, setSelectedType] = useState<TypeFilterValue>(undefined);
    const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryFilterValue>(undefined);
    const [recordsState, setRecordsState] = useState<ReportFundsExpendituresRecord[]>([]);
    const [isRowEditMode, setIsRowEditMode] = useState(false);

    const handleEdit = useCallback(() => setIsEditing(true), []);
    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setDisclaimerError(undefined);
        setExchangeRateError(undefined);
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

    const handleExchangeRateChange = useCallback((value: string) => {
        const normalized = normalizeFundsExpendituresExchangeRateInput(value);
        setExchangeRateValue(normalized);
        setExchangeRateError(validateFundsExpendituresExchangeRate(normalized, 'change'));
    }, []);

    const handleExchangeRateBlur = useCallback(() => {
        const normalized = normalizeFundsExpendituresExchangeRateInput(exchangeRateValue, true);
        setExchangeRateValue(normalized);
        setExchangeRateError(validateFundsExpendituresExchangeRate(normalized, 'blur'));
    }, [exchangeRateValue]);

    const handleTypeChange = useCallback((type: TypeFilterValue) => {
        setSelectedType(type);
        setSelectedCategoryId(undefined);
    }, []);

    const fetchSettings = useCallback(
        (options = {}) => FundsExpendituresApi.getSettings(adminClient, options),
        [adminClient],
    );
    const fetchCategories = useCallback(
        (options = {}) => FundsExpendituresApi.getCategories(adminClient, options),
        [adminClient],
    );
    const fetchRecords = useCallback(
        (options = {}) => FundsExpendituresApi.getRecords(adminClient, options),
        [adminClient],
    );
    const fetchSummary = useCallback(
        (options = {}) => FundsExpendituresApi.getSummary(adminClient, options),
        [adminClient],
    );

    const {
        data: settings,
        isLoading: isSettingsLoading,
        refetch: refetchSettings,
    } = useDataFetch<ReportFundsExpendituresSettings | null>({
        initialData: null,
        fetchHandler: fetchSettings,
    });

    const { data: categories, isLoading: isCategoriesLoading } = useDataFetch<ReportFundsExpendituresCategory[]>({
        initialData: [],
        fetchHandler: fetchCategories,
    });

    const { data: allRecords, isLoading: isRecordsLoading } = useDataFetch<ReportFundsExpendituresRecord[]>({
        initialData: [],
        fetchHandler: fetchRecords,
    });

    const {
        data: summary,
        isLoading: isSummaryLoading,
        refetch: refetchSummary,
    } = useDataFetch<FundsExpendituresSummary>({
        initialData: {
            totalCollectedUah: 0,
            totalCollectedUsd: 0,
            totalSpentUah: 0,
            totalSpentUsd: 0,
            incomeCategories: 0,
            expenseCategories: 0,
        },
        fetchHandler: fetchSummary,
    });

    const isInitialLoading =
        (isSettingsLoading || isCategoriesLoading || isRecordsLoading || isSummaryLoading) &&
        categories.length === 0 &&
        recordsState.length === 0;

    useEffect(() => {
        setRecordsState(allRecords);
    }, [allRecords]);

    const isPublishEnabled = useMemo(() => {
        const normalized = disclaimerValue.replaceAll(/\s+/g, ' ').trim();
        const exchangeRateValidationError = validateFundsExpendituresExchangeRate(exchangeRateValue, 'blur');

        return (
            normalized.length >= FUNDS_EXPENDITURES_VALIDATION.disclaimer.min &&
            !disclaimerError &&
            !exchangeRateValidationError
        );
    }, [disclaimerValue, disclaimerError, exchangeRateValue]);

    useEffect(() => {
        if (!isEditing) {
            setDisclaimerValue(settings?.disclaimerTitle ?? '');
            setExchangeRateValue(settings?.exchangeRate ?? '');
            setDisclaimerError(undefined);
            setExchangeRateError(undefined);
        }
    }, [settings, isEditing]);

    const enrichedRecords = useMemo(() => enrichRecords(recordsState, categories), [recordsState, categories]);

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

    const handleRecordSave = useCallback(
        async (
            recordId: number,
            data: { categoryId: number; amountUah: string; amountUsd: string },
        ): Promise<boolean> => {
            const existingRecord = recordsState.find((record) => record.id === recordId);
            if (!existingRecord) {
                return false;
            }

            try {
                const updatedRecord = await FundsExpendituresApi.updateRecord(adminClient, recordId, {
                    categoryId: data.categoryId,
                    type: existingRecord.type,
                    reportingYear: existingRecord.reportingYear,
                    amountUah: data.amountUah,
                    amountUsd: data.amountUsd,
                });

                setRecordsState((prev) => prev.map((record) => (record.id === recordId ? updatedRecord : record)));
                refetchSummary();
                addToast(REPORTS_TEXT.MESSAGE.RECORD_UPDATED_SUCCESSFULLY, ToastType.Success);
                return true;
            } catch {
                addToast(REPORTS_TEXT.MESSAGE.RECORD_UPDATE_FAILED_RETRY, ToastType.Error);
                return false;
            }
        },
        [addToast, adminClient, recordsState, refetchSummary],
    );

    const handlePublish = useCallback(async () => {
        try {
            const updatedSettings = await FundsExpendituresApi.updateSettings(adminClient, {
                disclaimerTitle: disclaimerValue,
                exchangeRate: exchangeRateValue,
            });

            setDisclaimerValue(updatedSettings.disclaimerTitle ?? '');
            setExchangeRateValue(updatedSettings.exchangeRate ?? '');
            setIsEditing(false);

            refetchSettings();

            addToast(COMMON_TEXT_ADMIN.MESSAGE.SUCCESSFULLY_PUBLISHED, ToastType.Success);
        } catch {
            addToast(REPORTS_TEXT.MESSAGE.FAIL_TO_UPDATE_REPORT, ToastType.Error);
        }
    }, [addToast, adminClient, disclaimerValue, exchangeRateValue, refetchSettings]);

    if (isInitialLoading) {
        return (
            <div className={styles.section}>
                <div className={styles['loader-container']}>
                    <InlineLoader size={3} />
                </div>
            </div>
        );
    }

    const EditIcon = ACTION_ICONS.edit.default;

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
                controlsDisabled={isRowEditMode}
                isAddIncomeDisabled={isAddIncomeDisabled}
                isAddExpenseDisabled={isAddExpenseDisabled}
                onTypeChange={handleTypeChange}
                onCategoryChange={setSelectedCategoryId}
                onExchangeRateChange={handleExchangeRateChange}
                onExchangeRateBlur={handleExchangeRateBlur}
                exchangeRateError={exchangeRateError}
                onAddIncome={() => {}}
                onAddExpense={() => {}}
            />

            <FundsExpendituresTable
                records={filteredRecords}
                categories={filteredCategories}
                exchangeRate={currentExchangeRate}
                allRecordsForTypeInference={recordsState}
                isEditing={isEditing}
                onRowEditModeChange={setIsRowEditMode}
                onRecordSave={handleRecordSave}
            />

            {isEditing && (
                <div className={styles['section-footer']}>
                    <Button buttonStyle="secondary" className={styles['footer-button']} onClick={handleCancel}>
                        {FUNDS_EXPENDITURES_TEXT.BUTTON.CANCEL}
                    </Button>
                    <Button
                        buttonStyle="primary"
                        className={styles['footer-button']}
                        onClick={handlePublish}
                        disabled={!isPublishEnabled || isRowEditMode}
                    >
                        {FUNDS_EXPENDITURES_TEXT.BUTTON.PUBLISH}
                    </Button>
                </div>
            )}
        </div>
    );
};
