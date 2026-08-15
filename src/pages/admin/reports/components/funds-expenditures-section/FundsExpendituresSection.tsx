import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
    FUNDS_EXPENDITURES_TEXT,
    FUNDS_EXPENDITURES_VALIDATION,
    REPORTS_TEXT,
    PROGRAM_EXPENSES_TEXT,
} from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS } from '@/validation/admin/reports-schema/funds-expenditures-disclaimer-schema/funds-expenditures-disclaimer-schema';
import {
    normalizeFundsExpendituresExchangeRateInput,
    validateFundsExpendituresExchangeRate,
} from '@/validation/admin/reports-schema/funds-expenditures-exchange-rate-schema/funds-expenditures-exchange-rate-schema';
import { Button } from '@/components/admin/button/Button';
import { LocalizationStatuses } from '@/components/admin/localization-statuses/LocalizationStatuses';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { FundsExpendituresApi } from '@/services/api/admin/reports/funds-expenditures-api';
import { ProgramExpensesApi } from '@/services/api/admin/reports/program-expenses-api';
import { ReportFundsExpendituresSettingsLocalizationsApi } from '@/services/api/admin/reports/report-funds-expenditures-settings-localizations/report-funds-expenditures-settings-localizations-api';
import {
    FundsExpendituresTransactionType,
    FundsExpendituresSummary,
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
    ReportFundsExpendituresSettings,
    ReportFundsExpendituresSettingsLocalization,
    ProgramExpensesSummary,
} from '@/types/admin/reports';
import { LocalizationLanguage } from '@/types/common/language';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { formatNumberDecimalComma } from '@/utils/functions/formatters/format-number';
import { isReservedFundsExpendituresCategoryName } from '@/utils/functions/is-reserved-funds-expenditures-category-name/is-reserved-funds-expenditures-category-name';
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
import {
    EnrichedRecord,
    FundsExpendituresTable,
    ProgramAggregateRow,
} from './components/funds-expenditures-table/FundsExpendituresTable';
import { AddFundsExpendituresRecordModal } from './components/common/add-funds-expenditures-record-modal/AddFundsExpendituresRecordModal';
import { AddFundsExpendituresCategoryModal } from './components/common/add-funds-expenditures-category-modal/AddFundsExpendituresCategoryModal';
import { DeleteRecordModal } from './components/common/delete-record-modal/DeleteRecordModal';
import { DeleteFundsExpendituresCategoryModal } from './components/common/delete-funds-expenditures-category-modal/DeleteFundsExpendituresCategoryModal';
import { EditFundsExpendituresCategoryModal } from './components/common/edit-funds-expenditures-category-modal/EditFundsExpendituresCategoryModal';
import { TranslateDisclaimerModal } from './components/common/translate-disclaimer-modal/TranslateDisclaimerModal';
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

interface FundsExpenditureSectionProps {
    isEditing?: boolean;
    draftExchangeRate?: string | null;
    onEditModeChange?: (isEditing: boolean) => void;
    onExchangeRateValueChange?: (exchangeRate: string | null) => void;
    isAddCategoryModalOpen?: boolean;
    onAddCategoryModalClose?: () => void;
    isDeleteCategoryModalOpen?: boolean;
    onDeleteCategoryModalClose?: () => void;
    isEditCategoryModalOpen?: boolean;
    onEditCategoryModalClose?: () => void;
    onCategoriesLoaded?: (categories: ReportFundsExpendituresCategory[]) => void;
    translationLanguages?: LocalizationLanguage[];
    isRowEditMode?: boolean;
    onRowEditModeChange?: (isEditing: boolean) => void;
    onValidationChange?: (isValid: boolean) => void;
    onCountsChange?: (counts: { income: number; expense: number }) => void;
    onDataChange?: () => void;
    registerSaveCallback?: (saveFn: () => Promise<boolean>) => void;
    onUnpublishedChangesChange?: (hasChanges: boolean) => void;
    registerRefetchSettingsCallback?: (refetchFn: () => void) => void;
}

export const FundsExpenditureSection = ({
    isEditing: propIsEditing,
    draftExchangeRate,
    onEditModeChange,
    onExchangeRateValueChange,
    isAddCategoryModalOpen = false,
    onAddCategoryModalClose,
    isDeleteCategoryModalOpen = false,
    onDeleteCategoryModalClose,
    isEditCategoryModalOpen = false,
    onEditCategoryModalClose,
    onCategoriesLoaded,
    translationLanguages = [],
    isRowEditMode: propIsRowEditMode,
    onRowEditModeChange,
    onValidationChange,
    onCountsChange,
    onDataChange,
    registerSaveCallback,
    onUnpublishedChangesChange,
    registerRefetchSettingsCallback,
}: FundsExpenditureSectionProps = {}) => {
    const adminClient = useAdminClient();
    const { addToast } = useToast();

    const [localIsEditing, setLocalIsEditing] = useState(false);
    const isEditing = propIsEditing !== undefined ? propIsEditing : localIsEditing;

    const [disclaimerValue, setDisclaimerValue] = useState('');
    const [disclaimerError, setDisclaimerError] = useState<string | undefined>(undefined);
    const [exchangeRateValue, setExchangeRateValue] = useState('');
    const [exchangeRateError, setExchangeRateError] = useState<string | undefined>(undefined);
    const [programYearValue, setProgramYearValue] = useState<number>(new Date().getFullYear());

    const [selectedType, setSelectedType] = useState<TypeFilterValue>(undefined);
    const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryFilterValue>(undefined);
    const [recordsState, setRecordsState] = useState<ReportFundsExpendituresRecord[]>([]);

    const [localIsRowEditMode, setLocalIsRowEditMode] = useState(false);
    const isRowEditMode = propIsRowEditMode ?? localIsRowEditMode;
    const handleRowEditModeChange = useCallback(
        (val: boolean) => {
            setLocalIsRowEditMode(val);
            onRowEditModeChange?.(val);
        },
        [onRowEditModeChange],
    );

    const [activeRecordModalType, setActiveRecordModalType] = useState<FundsExpendituresTransactionType | null>(null);

    const [isTranslateDisclaimerModalOpen, setIsTranslateDisclaimerModalOpen] = useState(false);
    const [disclaimerLocalizations, setDisclaimerLocalizations] = useState<
        ReportFundsExpendituresSettingsLocalization[]
    >([]);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<ReportFundsExpendituresRecord | null>(null);
    const [isDeletingRecord, setIsDeletingRecord] = useState(false);
    const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const hasSeededEditingValuesRef = useRef(false);

    const handleDisclaimerChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const normalized = e.target.value.replaceAll(/ {2,}/g, ' ');
            setDisclaimerValue(normalized);
            onDataChange?.();
        },
        [onDataChange],
    );

    const handleDisclaimerBlur = useCallback(() => {
        const trimmed = disclaimerValue.replaceAll(/\s+/g, ' ').trim();
        setDisclaimerValue(trimmed);
        setDisclaimerError(FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS.validateDisclaimer(trimmed));
    }, [disclaimerValue]);

    const handleExchangeRateChange = useCallback(
        (value: string) => {
            const normalized = normalizeFundsExpendituresExchangeRateInput(value);
            setExchangeRateValue(normalized);
            onExchangeRateValueChange?.(normalized);
            setExchangeRateError(validateFundsExpendituresExchangeRate(normalized, 'change'));
            onDataChange?.();
        },
        [onExchangeRateValueChange, onDataChange],
    );

    const handleExchangeRateBlur = useCallback(() => {
        const normalized = normalizeFundsExpendituresExchangeRateInput(exchangeRateValue, true);
        setExchangeRateValue(normalized);
        onExchangeRateValueChange?.(normalized || null);
        setExchangeRateError(validateFundsExpendituresExchangeRate(normalized, 'blur'));
    }, [exchangeRateValue, onExchangeRateValueChange]);

    const handleTypeChange = useCallback((type: TypeFilterValue) => {
        setSelectedType(type);
        setSelectedCategoryId(undefined);
    }, []);

    const handleOpenAddIncomeModal = useCallback(() => {
        setActiveRecordModalType('income');
    }, []);

    const handleOpenAddExpenseModal = useCallback(() => {
        setActiveRecordModalType('expense');
    }, []);

    const handleCloseAddIncomeModal = useCallback(() => {
        setActiveRecordModalType(null);
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
    const fetchProgramSummary = useCallback(
        (options = {}) => ProgramExpensesApi.getSummary(adminClient, options),
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

    const handleEdit = useCallback(() => {
        setLocalIsEditing(true);
        onEditModeChange?.(true);
        onExchangeRateValueChange?.(settings?.exchangeRate ?? null);
    }, [onEditModeChange, onExchangeRateValueChange, settings?.exchangeRate]);

    const {
        data: categories,
        isLoading: isCategoriesLoading,
        refetch: refetchCategories,
    } = useDataFetch<ReportFundsExpendituresCategory[]>({
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

    const { data: programSummary, refetch: refetchProgramSummary } = useDataFetch<ProgramExpensesSummary>({
        initialData: { totalAmountUah: 0, totalAmountUsd: 0 },
        fetchHandler: fetchProgramSummary,
    });

    const isInitialLoading =
        (isSettingsLoading || isCategoriesLoading || isRecordsLoading || isSummaryLoading) &&
        categories.length === 0 &&
        recordsState.length === 0;

    const fetchDisclaimerLocalizations = useCallback(
        (settingsId: number) => {
            ReportFundsExpendituresSettingsLocalizationsApi.getByEntityId(adminClient, settingsId)
                .then((dtos) => {
                    setDisclaimerLocalizations(
                        dtos.map((dto) =>
                            mapLocalizationDtoToModel<typeof dto, ReportFundsExpendituresSettingsLocalization>(dto),
                        ),
                    );
                })
                .catch(() => {});
        },
        [adminClient],
    );

    useEffect(() => {
        if (!settings?.id) return;
        fetchDisclaimerLocalizations(settings.id);
    }, [fetchDisclaimerLocalizations, settings?.id]);

    useEffect(() => {
        if (settings) {
            onUnpublishedChangesChange?.(settings.hasUnpublishedChanges);
        }
    }, [settings, onUnpublishedChangesChange]);

    useEffect(() => {
        registerRefetchSettingsCallback?.(() => refetchSettings());
    }, [registerRefetchSettingsCallback, refetchSettings]);

    useEffect(() => {
        setRecordsState(allRecords);
    }, [allRecords]);

    useEffect(() => {
        onCategoriesLoaded?.(categories);
    }, [categories, onCategoriesLoaded]);

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
        onValidationChange?.(isPublishEnabled);
    }, [isPublishEnabled, onValidationChange]);

    useEffect(() => {
        onCountsChange?.({
            income: recordsState.filter((r) => r.type === 'income').length,
            expense: recordsState.filter((r) => r.type === 'expense').length,
        });
    }, [recordsState, onCountsChange]);

    const hasExchangeRateError = Boolean(exchangeRateError);

    useEffect(() => {
        if (!isEditing) {
            hasSeededEditingValuesRef.current = false;
            setDisclaimerValue(settings?.disclaimerTitle ?? '');
            setExchangeRateValue(settings?.exchangeRate ?? '');
            setDisclaimerError(undefined);
            setExchangeRateError(undefined);
            return;
        }

        if (settings && !hasSeededEditingValuesRef.current) {
            const initialExchangeRateValue =
                draftExchangeRate === undefined ? (settings.exchangeRate ?? '') : (draftExchangeRate ?? '');

            setDisclaimerValue((currentValue) => currentValue || (settings.disclaimerTitle ?? ''));
            setExchangeRateValue((currentValue) => currentValue || initialExchangeRateValue);
            hasSeededEditingValuesRef.current = true;
        }
    }, [draftExchangeRate, settings, isEditing]);

    useEffect(() => {
        if (settings?.programExpendituresReportingYear != null) {
            setProgramYearValue(settings.programExpendituresReportingYear);
        }
    }, [settings?.programExpendituresReportingYear]);

    const enrichedRecords = useMemo(() => enrichRecords(recordsState, categories), [recordsState, categories]);

    const filteredCategories = useMemo(
        (): ReportFundsExpendituresCategory[] => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'uk')),
        [categories],
    );

    const manageableCategories = useMemo(
        (): ReportFundsExpendituresCategory[] =>
            filteredCategories.filter((c) => !isReservedFundsExpendituresCategoryName(c.name, c.type)),
        [filteredCategories],
    );

    const filteredRecords = useMemo((): EnrichedRecord[] => {
        return enrichedRecords.filter((record) => {
            const typeMatch = selectedType === undefined || record.type === selectedType;
            const categoryMatch = selectedCategoryId === undefined || record.categoryId === selectedCategoryId;
            return typeMatch && categoryMatch;
        });
    }, [enrichedRecords, selectedType, selectedCategoryId]);

    const programCategoryLabel = PROGRAM_EXPENSES_TEXT.TABLE.TYPE_LABEL;
    const eligibleRecordIds = useMemo(() => {
        return filteredRecords
            .filter((r) => !(r.categoryName === programCategoryLabel && r.type === 'expense'))
            .map((r) => r.id);
    }, [filteredRecords, programCategoryLabel]);

    const isAddIncomeDisabled =
        summary.incomeCategories >= FUNDS_EXPENDITURES_VALIDATION.maxCategoriesPerType || hasExchangeRateError;
    const isAddExpenseDisabled =
        summary.expenseCategories >= FUNDS_EXPENDITURES_VALIDATION.maxCategoriesPerType || hasExchangeRateError;

    const currentExchangeRate = isEditing ? exchangeRateValue : (settings?.exchangeRate ?? null);

    const programAggregateRow = useMemo<ProgramAggregateRow>(() => {
        return {
            reportingYear: String(programYearValue),
            categoryName: PROGRAM_EXPENSES_TEXT.TABLE.TYPE_LABEL,
            amountUah: formatNumberDecimalComma(programSummary.totalAmountUah),
            amountUsd: formatNumberDecimalComma(programSummary.totalAmountUsd),
        };
    }, [programSummary, programYearValue]);

    const handleProgramYearSave = useCallback(
        async (reportingYear: string): Promise<boolean> => {
            const yearNumber = Number.parseInt(reportingYear, 10);
            try {
                await FundsExpendituresApi.updateSettings(adminClient, {
                    disclaimerTitle: settings?.disclaimerTitle ?? '',
                    exchangeRate: settings?.exchangeRate ?? null,
                    programExpendituresReportingYear: yearNumber,
                });
                setProgramYearValue(yearNumber);
                refetchSettings();
                refetchProgramSummary();
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_UPDATED_SUCCESSFULLY, ToastType.Success);
                return true;
            } catch {
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_UPDATE_FAILED_RETRY, ToastType.Error);
                return false;
            }
        },
        [adminClient, settings, refetchSettings, refetchProgramSummary, addToast],
    );

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
                onDataChange?.();
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_UPDATED_SUCCESSFULLY, ToastType.Success);

                try {
                    await refetchSummary(true);
                } catch {
                    // Refetch error is already handled by useDataFetch (setError),
                    // but we can optionally show a refresh failure toast here.
                }

                return true;
            } catch {
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_UPDATE_FAILED_RETRY, ToastType.Error);
                return false;
            }
        },
        [addToast, adminClient, recordsState, refetchSummary, onDataChange],
    );

    const handleCreateRecord = useCallback(
        async (data: {
            categoryId: number;
            reportingYear: string;
            amountUah: string;
            amountUsd: string;
            type: FundsExpendituresTransactionType;
        }): Promise<boolean> => {
            try {
                const createdRecord = await FundsExpendituresApi.createRecord(adminClient, {
                    categoryId: data.categoryId,
                    reportingYear: data.reportingYear,
                    amountUah: data.amountUah,
                    amountUsd: data.amountUsd,
                    type: data.type,
                });

                setRecordsState((prev) => [...prev, createdRecord]);
                onDataChange?.();
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_CREATED_SUCCESSFULLY, ToastType.Success);
                setActiveRecordModalType(null);

                try {
                    await refetchSummary(true);
                } catch {
                    // Refetch error handled by useDataFetch
                }

                return true;
            } catch {
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_CREATE_FAILED_RETRY, ToastType.Error);
                return false;
            }
        },
        [addToast, adminClient, refetchSummary, onDataChange],
    );

    const handleCreateCategory = useCallback(
        async (data: { name: string; type: FundsExpendituresTransactionType }): Promise<boolean> => {
            if (isReservedFundsExpendituresCategoryName(data.name, data.type)) {
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.CATEGORY_CREATE_FAILED_RETRY, ToastType.Error);
                return false;
            }

            try {
                await FundsExpendituresApi.createCategory(adminClient, data);
                onDataChange?.();
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.CATEGORY_CREATED_SUCCESSFULLY, ToastType.Success);

                try {
                    await refetchCategories(true);
                    await refetchSummary(true);
                } catch {
                    // Refetch error handled by useDataFetch
                }

                return true;
            } catch {
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.CATEGORY_CREATE_FAILED_RETRY, ToastType.Error);
                return false;
            }
        },
        [addToast, adminClient, refetchCategories, refetchSummary, onDataChange],
    );

    const handleEditCategory = useCallback(
        async (categoryId: number, name: string): Promise<boolean> => {
            const category = categories.find((c) => c.id === categoryId);
            if (!category) return false;

            if (
                isReservedFundsExpendituresCategoryName(category.name, category.type) ||
                isReservedFundsExpendituresCategoryName(name, category.type)
            ) {
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.CATEGORY_UPDATE_FAILED_RETRY, ToastType.Error);
                return false;
            }

            try {
                await FundsExpendituresApi.updateCategory(adminClient, categoryId, { name, type: category.type });
                onDataChange?.();
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.CATEGORY_UPDATED_SUCCESSFULLY, ToastType.Success);

                try {
                    await refetchCategories(true);
                    await refetchSummary(true);
                } catch {
                    // Refetch error handled by useDataFetch
                }

                return true;
            } catch {
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.CATEGORY_UPDATE_FAILED_RETRY, ToastType.Error);
                return false;
            }
        },
        [addToast, adminClient, categories, refetchCategories, refetchSummary, onDataChange],
    );

    const handleDeleteCategory = useCallback(
        async (categoryId: number): Promise<boolean> => {
            const target = categories.find((c) => c.id === categoryId);
            if (target && isReservedFundsExpendituresCategoryName(target.name, target.type)) {
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.CATEGORY_DELETE_FAILED_RETRY, ToastType.Error);
                return false;
            }

            try {
                await FundsExpendituresApi.deleteCategory(adminClient, categoryId);
                onDataChange?.();
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.CATEGORY_DELETED_SUCCESSFULLY, ToastType.Success);

                try {
                    await refetchCategories(true);
                    await refetchSummary(true);
                } catch {
                    // Refetch error handled by useDataFetch
                }

                return true;
            } catch {
                addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.CATEGORY_DELETE_FAILED_RETRY, ToastType.Error);
                return false;
            }
        },
        [addToast, adminClient, categories, refetchCategories, refetchSummary, onDataChange],
    );

    const handleDeleteClick = (record: ReportFundsExpendituresRecord) => {
        setRecordToDelete(record);
        setIsDeleteModalOpen(true);
    };

    const toggleRecordSelection = useCallback((id: number) => {
        setSelectedRecordIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }, []);

    const handleSelectAllToggle = useCallback(
        (checked: boolean) => {
            if (checked) {
                setSelectedRecordIds(eligibleRecordIds);
            } else {
                setSelectedRecordIds([]);
            }
        },
        [eligibleRecordIds],
    );

    const handleOpenBulkDeleteModal = useCallback(() => setIsBulkDeleteModalOpen(true), []);

    const handleBulkDeleteCancel = useCallback(() => {
        setIsBulkDeleteModalOpen(false);
        setSelectedRecordIds([]);
    }, []);

    const handleConfirmBulkDelete = useCallback(async () => {
        if (selectedRecordIds.length === 0) {
            setIsBulkDeleteModalOpen(false);
            return;
        }

        setIsBulkDeleting(true);
        try {
            await FundsExpendituresApi.bulkDeleteRecords(adminClient, selectedRecordIds);
            setRecordsState((prev) => prev.filter((r) => !selectedRecordIds.includes(r.id)));
            onDataChange?.();
            setSelectedRecordIds([]);
            setIsBulkDeleteModalOpen(false);
            await refetchSummary();
            addToast(FUNDS_EXPENDITURES_TEXT.BULK.DELETE_SUCCESS, ToastType.Success);
        } catch {
            setIsBulkDeleteModalOpen(false);
            addToast(FUNDS_EXPENDITURES_TEXT.BULK.DELETE_FAILED, ToastType.Error, 5000);
        } finally {
            setIsBulkDeleting(false);
        }
    }, [adminClient, selectedRecordIds, refetchSummary, addToast, onDataChange]);

    const handleConfirmDelete = useCallback(async () => {
        if (!recordToDelete) return;

        setIsDeletingRecord(true);
        try {
            await FundsExpendituresApi.deleteRecord(adminClient, recordToDelete.id);
            setRecordsState((prev) => prev.filter((r) => r.id !== recordToDelete.id));
            onDataChange?.();
            await refetchSummary();
            addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_DELETED_SUCCESSFULLY, ToastType.Success);
            setIsDeleteModalOpen(false);
        } catch {
            addToast(FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_DELETE_FAILED_RETRY, ToastType.Error);
        } finally {
            setIsDeletingRecord(false);
        }
    }, [recordToDelete, adminClient, addToast, refetchSummary, onDataChange]);

    const handleTranslateDisclaimerSuccess = useCallback(
        (localization: ReportFundsExpendituresSettingsLocalization) => {
            setDisclaimerLocalizations((prev) => {
                const exists = prev.some((l) => l.language.id === localization.language.id);
                return exists
                    ? prev.map((l) => (l.language.id === localization.language.id ? localization : l))
                    : [...prev, localization];
            });
            onDataChange?.();
            setIsTranslateDisclaimerModalOpen(false);
            addToast(COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_SAVED_SUCCESS, ToastType.Success);
        },
        [addToast, onDataChange],
    );

    const saveSettings = useCallback(async (): Promise<boolean> => {
        try {
            const updatedSettings = await FundsExpendituresApi.updateSettings(adminClient, {
                disclaimerTitle: disclaimerValue,
                exchangeRate: exchangeRateValue,
                programExpendituresReportingYear: programYearValue,
            });

            setDisclaimerValue(updatedSettings.disclaimerTitle ?? '');
            setExchangeRateValue(updatedSettings.exchangeRate ?? '');
            onExchangeRateValueChange?.(updatedSettings.exchangeRate ?? null);

            fetchDisclaimerLocalizations(updatedSettings.id);

            try {
                await refetchSettings(true);
            } catch {}

            return true;
        } catch {
            addToast(REPORTS_TEXT.MESSAGE.FAIL_TO_UPDATE_REPORT, ToastType.Error);
            return false;
        }
    }, [
        addToast,
        adminClient,
        disclaimerValue,
        exchangeRateValue,
        fetchDisclaimerLocalizations,
        onExchangeRateValueChange,
        refetchSettings,
        programYearValue,
    ]);

    useEffect(() => {
        if (registerSaveCallback) {
            registerSaveCallback(saveSettings);
        }
    }, [registerSaveCallback, saveSettings]);

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
    const TranslateIcon = ACTION_ICONS.translate.default;

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
                        <div className={styles['disclaimer-top-row']}>
                            <LocalizationStatuses
                                languages={translationLanguages}
                                localizedEntity={{
                                    translationStatuses: disclaimerLocalizations.map((l) => ({
                                        languageId: l.language.id,
                                        translationStatus: l.translationStatus,
                                    })),
                                }}
                            />
                            <button
                                type="button"
                                className={styles['translate-btn']}
                                onClick={() => setIsTranslateDisclaimerModalOpen(true)}
                                aria-label="Перекласти дісклеймер"
                            >
                                <TranslateIcon />
                            </button>
                        </div>
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
                onAddIncome={handleOpenAddIncomeModal}
                onAddExpense={handleOpenAddExpenseModal}
            />

            <FundsExpendituresTable
                records={filteredRecords}
                categories={filteredCategories}
                exchangeRate={currentExchangeRate}
                allRecordsForTypeInference={recordsState}
                isEditing={isEditing}
                isRowActionsDisabled={hasExchangeRateError}
                onRowEditModeChange={handleRowEditModeChange}
                onRecordSave={handleRecordSave}
                programAggregateRow={programAggregateRow}
                onProgramYearSave={handleProgramYearSave}
                onDeleteRecord={handleDeleteClick}
                selectedRecordIds={selectedRecordIds}
                eligibleRecordIds={eligibleRecordIds}
                onToggleRecordSelection={toggleRecordSelection}
                onSelectAllToggle={handleSelectAllToggle}
                onOpenBulkDelete={handleOpenBulkDeleteModal}
            />

            <AddFundsExpendituresRecordModal
                isOpen={activeRecordModalType !== null}
                onClose={handleCloseAddIncomeModal}
                transactionType={activeRecordModalType ?? 'income'}
                categories={categories}
                records={recordsState}
                exchangeRate={currentExchangeRate}
                onSubmit={handleCreateRecord}
            />

            <AddFundsExpendituresCategoryModal
                isOpen={isAddCategoryModalOpen}
                onClose={onAddCategoryModalClose ?? (() => {})}
                categories={categories}
                onSubmit={handleCreateCategory}
            />

            <EditFundsExpendituresCategoryModal
                isOpen={isEditCategoryModalOpen}
                onClose={onEditCategoryModalClose ?? (() => {})}
                categories={manageableCategories}
                onSubmit={handleEditCategory}
            />

            <DeleteFundsExpendituresCategoryModal
                isOpen={isDeleteCategoryModalOpen}
                onClose={onDeleteCategoryModalClose ?? (() => {})}
                categories={manageableCategories}
                records={recordsState}
                onSubmit={handleDeleteCategory}
            />

            <DeleteRecordModal
                isOpen={isDeleteModalOpen}
                title={FUNDS_EXPENDITURES_TEXT.MODAL.DELETE.TITLE}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                isButtonsDisabled={isDeletingRecord}
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                onClose={() => setIsDeleteModalOpen(false)}
            />

            <DeleteRecordModal
                isOpen={isBulkDeleteModalOpen}
                title={FUNDS_EXPENDITURES_TEXT.BULK.DELETE_CONFIRM_TITLE}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                isButtonsDisabled={isBulkDeleting}
                onConfirm={handleConfirmBulkDelete}
                onCancel={handleBulkDeleteCancel}
                onClose={handleBulkDeleteCancel}
            />

            <TranslateDisclaimerModal
                isOpen={isTranslateDisclaimerModalOpen}
                onClose={() => setIsTranslateDisclaimerModalOpen(false)}
                settings={settings}
                translationLanguages={translationLanguages}
                existingLocalizations={disclaimerLocalizations}
                onTranslateSuccess={handleTranslateDisclaimerSuccess}
            />
        </div>
    );
};
