import { useState, useCallback, useRef, useEffect } from 'react';
import { useTableScrollToTop } from '@/hooks/admin/use-table-scroll-to-top/useTableScrollToTop';
import { useTableRowAmountEdit } from '@/hooks/admin/use-table-row-amount-edit/useTableRowAmountEdit';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import {
    FundsExpendituresTransactionType,
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
} from '@/types/admin/reports';
import { ReactComponent as NotFoundIcon } from '@/assets/icons/not-found.svg';
import { ReactComponent as ArrowUpIcon } from '@/assets/icons/arrow-up.svg';
import { ReactComponent as CheckmarkIcon } from '@/assets/icons/checkmark.svg';
import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { Select } from '@/components/common/select/Select';
import { SortIcon } from '@/pages/admin/reports/components/funds-expenditures-section/components/funds-expenditures-table/components/sort-icon';
import {
    normalizeFundsExpendituresAmountInput,
    validateFundsExpendituresAmount,
    validateFundsExpendituresCategory,
} from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';
import { getProgramReportingYearOptions } from '@/utils/functions/get-reporting-year-options/get-reporting-year-options';
import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';
import cn from 'classnames';
import styles from './FundsExpendituresTable.module.scss';
import { Button } from '@/components/admin/button/Button';

export interface EnrichedRecord extends ReportFundsExpendituresRecord {
    categoryName: string;
}

export interface ProgramAggregateRow {
    reportingYear: string;
    categoryName: string;
    amountUah: string;
    amountUsd: string;
}

type SortableColumn = 'type' | 'categoryName' | 'amountUah' | 'amountUsd';
type SortDirection = 'asc' | 'desc' | null;

interface ColumnSort {
    column: SortableColumn | null;
    direction: SortDirection;
}

interface FundsExpendituresTableProps {
    records: EnrichedRecord[];
    categories: ReportFundsExpendituresCategory[];
    exchangeRate?: string | null;
    allRecordsForTypeInference?: ReportFundsExpendituresRecord[];
    isEditing?: boolean;
    isRowActionsDisabled?: boolean;
    onRowEditModeChange?: (isEditMode: boolean) => void;
    onRecordSave?: (
        recordId: number,
        data: { categoryId: number; amountUah: string; amountUsd: string },
    ) => boolean | Promise<boolean>;
    programAggregateRow?: ProgramAggregateRow | null;
    onProgramYearSave?: (reportingYear: string) => boolean | Promise<boolean>;
    onDeleteRecord?: (record: EnrichedRecord) => void;
    selectedRecordIds?: number[];
    eligibleRecordIds?: number[];
    onToggleRecordSelection?: (id: number) => void;
    onSelectAllToggle?: (checked: boolean) => void;
    onOpenBulkDelete?: () => void;
}

interface RowEditState {
    recordId: number;
    originalCategoryId: number;
    originalAmountUah: string;
    originalAmountUsd: string;
    categoryId: number | undefined;
    amountUah: string;
    amountUsd: string;
    errors: {
        category?: string;
        amountUah?: string;
        amountUsd?: string;
    };
    usdMismatchMessage?: string;
}

const TYPE_LABEL_MAP: Record<FundsExpendituresTransactionType, string> = {
    income: FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.INCOME,
    expense: FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.EXPENSE,
};

const sortRecords = (records: EnrichedRecord[], sort: ColumnSort): EnrichedRecord[] => {
    if (!sort.column || !sort.direction) {
        return records;
    }

    return [...records].sort((a, b) => {
        const { column, direction } = sort;
        let comparison = 0;

        if (column === 'type') {
            comparison = TYPE_LABEL_MAP[a.type].localeCompare(TYPE_LABEL_MAP[b.type], 'uk');
        } else if (column === 'categoryName') {
            comparison = a.categoryName.localeCompare(b.categoryName, 'uk');
        } else if (column === 'amountUah') {
            comparison = parseAmount(a.amountUah) - parseAmount(b.amountUah);
        } else if (column === 'amountUsd') {
            comparison = parseAmount(a.amountUsd) - parseAmount(b.amountUsd);
        }

        return direction === 'asc' ? comparison : -comparison;
    });
};

const getCategoriesForType = (
    categories: ReportFundsExpendituresCategory[],
    records: ReportFundsExpendituresRecord[],
    type: FundsExpendituresTransactionType,
): ReportFundsExpendituresCategory[] => {
    return categories
        .filter((category) => {
            if (category.type) {
                return category.type === type;
            }

            return records.some((record) => record.type === type && record.categoryId === category.id);
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'uk'));
};

const isAcceptButtonDisabled = (rowEditState: RowEditState | null): boolean => {
    if (!rowEditState) {
        return true;
    }

    const normalizedAmountUah = normalizeFundsExpendituresAmountInput(rowEditState.amountUah, true);
    const normalizedAmountUsd = normalizeFundsExpendituresAmountInput(rowEditState.amountUsd, true);
    const normalizedOriginalUah = normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUah, true);
    const normalizedOriginalUsd = normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUsd, true);

    const hasErrors =
        rowEditState.categoryId === undefined ||
        Boolean(rowEditState.errors.category) ||
        Boolean(rowEditState.errors.amountUah) ||
        Boolean(rowEditState.errors.amountUsd);

    const amountsEmpty = normalizedAmountUah === '' || normalizedAmountUsd === '';

    const noChanges =
        rowEditState.categoryId === rowEditState.originalCategoryId &&
        normalizedAmountUah === normalizedOriginalUah &&
        normalizedAmountUsd === normalizedOriginalUsd;

    return hasErrors || amountsEmpty || noChanges;
};

export const FundsExpendituresTable = ({
    records,
    categories,
    exchangeRate,
    allRecordsForTypeInference,
    isEditing = false,
    isRowActionsDisabled = false,
    onRowEditModeChange,
    onRecordSave,
    programAggregateRow,
    onProgramYearSave,
    onDeleteRecord,
    selectedRecordIds,
    eligibleRecordIds,
    onToggleRecordSelection,
    onSelectAllToggle,
    onOpenBulkDelete,
}: FundsExpendituresTableProps) => {
    const [sort, setSort] = useState<ColumnSort>({ column: null, direction: null });
    const [programYearEdit, setProgramYearEdit] = useState<{ year: string; originalYear: string } | null>(null);
    const [isSavingProgramYear, setIsSavingProgramYear] = useState(false);
    const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
    const { tableWrapperRef, isMoveToTopVisible, handleTableScroll, moveToTop } = useTableScrollToTop(records.length);
    const {
        rowEditState,
        setRowEditState,
        savingRecordId,
        setSavingRecordId,
        isAnyRowEditing,
        setRowEditMode,
        renderAmountEditRow,
    } = useTableRowAmountEdit<RowEditState>({
        isEditing,
        isRowActionsDisabled,
        exchangeRate,
        mismatchMessage: FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH,
        isAcceptButtonDisabled,
        onRowEditModeChange,
    });

    const typeInferenceSource = allRecordsForTypeInference ?? records;

    const categoriesByType = {
        income: getCategoriesForType(categories, typeInferenceSource, 'income'),
        expense: getCategoriesForType(categories, typeInferenceSource, 'expense'),
    };

    const getRowEditValidationError = useCallback(
        (
            record: EnrichedRecord,
            nextCategoryId: number | undefined,
            trigger: 'change' | 'blur' = 'change',
        ): string | undefined => {
            return validateFundsExpendituresCategory({
                recordId: record.id,
                recordType: record.type,
                categoryId: nextCategoryId,
                records: typeInferenceSource,
                trigger,
            });
        },
        [typeInferenceSource],
    );

    const handleStartRowEdit = useCallback(
        (record: EnrichedRecord) => {
            if (rowEditState || isRowActionsDisabled) {
                return;
            }

            setRowEditMode({
                recordId: record.id,
                originalCategoryId: record.categoryId,
                originalAmountUah: record.amountUah,
                originalAmountUsd: record.amountUsd,
                categoryId: record.categoryId,
                amountUah: record.amountUah,
                amountUsd: record.amountUsd,
                errors: {},
                usdMismatchMessage: undefined,
            });
        },
        [isRowActionsDisabled, rowEditState, setRowEditMode],
    );

    const handleStartProgramYearEdit = useCallback(() => {
        if (rowEditState || programYearEdit || isRowActionsDisabled || !programAggregateRow) {
            return;
        }

        setProgramYearEdit({
            year: programAggregateRow.reportingYear,
            originalYear: programAggregateRow.reportingYear,
        });
        onRowEditModeChange?.(true);
    }, [isRowActionsDisabled, onRowEditModeChange, programAggregateRow, programYearEdit, rowEditState]);

    const handleProgramYearChange = useCallback((year: string) => {
        setProgramYearEdit((prev) => (prev ? { ...prev, year } : prev));
    }, []);

    const handleCloseProgramYearEdit = useCallback(() => {
        setProgramYearEdit(null);
        onRowEditModeChange?.(false);
    }, [onRowEditModeChange]);

    const handleAcceptProgramYearEdit = useCallback(async () => {
        if (!programYearEdit || isSavingProgramYear) {
            return;
        }

        if (programYearEdit.year === programYearEdit.originalYear) {
            return;
        }

        setIsSavingProgramYear(true);

        try {
            const isSaved = await onProgramYearSave?.(programYearEdit.year);

            if (isSaved === false) {
                return;
            }

            setProgramYearEdit(null);
            onRowEditModeChange?.(false);
        } finally {
            setIsSavingProgramYear(false);
        }
    }, [isSavingProgramYear, onProgramYearSave, onRowEditModeChange, programYearEdit]);

    const handleRowCategoryChange = useCallback(
        (record: EnrichedRecord, categoryId: number | undefined) => {
            const nextError = getRowEditValidationError(record, categoryId, 'change');

            setRowEditState((prev) => {
                if (prev?.recordId !== record.id) {
                    return prev;
                }

                return {
                    ...prev,
                    categoryId,
                    errors: {
                        ...prev.errors,
                        category: nextError,
                    },
                };
            });
        },
        [getRowEditValidationError, setRowEditState],
    );

    const handleRowCategoryBlur = useCallback(
        (record: EnrichedRecord) => {
            setRowEditState((prev) => {
                if (prev?.recordId !== record.id) {
                    return prev;
                }

                return {
                    ...prev,
                    errors: {
                        ...prev.errors,
                        category: getRowEditValidationError(record, prev.categoryId, 'blur'),
                    },
                };
            });
        },
        [getRowEditValidationError, setRowEditState],
    );

    const handleAcceptRowEdit = useCallback(
        async (record: EnrichedRecord) => {
            if (rowEditState?.recordId !== record.id) {
                return;
            }

            if (savingRecordId !== null) {
                return;
            }

            const finalError = getRowEditValidationError(record, rowEditState.categoryId, 'blur');
            const isCategoryUnchanged = rowEditState.categoryId === rowEditState.originalCategoryId;
            const isCategoryMissing = rowEditState.categoryId === undefined;
            const preparedAmountUah = rowEditState.amountUah.trim();
            const preparedAmountUsd = rowEditState.amountUsd.trim();
            const amountUahError = validateFundsExpendituresAmount(preparedAmountUah, 'save');
            const amountUsdError = validateFundsExpendituresAmount(preparedAmountUsd, 'save');
            const isAmountsUnchanged =
                normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUah, true) ===
                    normalizeFundsExpendituresAmountInput(preparedAmountUah, true) &&
                normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUsd, true) ===
                    normalizeFundsExpendituresAmountInput(preparedAmountUsd, true);

            if (
                finalError ||
                isCategoryMissing ||
                amountUahError ||
                amountUsdError ||
                (isCategoryUnchanged && isAmountsUnchanged)
            ) {
                setRowEditState((prev) => {
                    if (prev?.recordId !== record.id) {
                        return prev;
                    }

                    return {
                        ...prev,
                        amountUah: preparedAmountUah,
                        amountUsd: preparedAmountUsd,
                        errors: {
                            ...prev.errors,
                            category: finalError,
                            amountUah: amountUahError,
                            amountUsd: amountUsdError,
                        },
                    };
                });

                return;
            }

            const nextCategoryId = rowEditState.categoryId;
            if (nextCategoryId === undefined) {
                return;
            }

            setSavingRecordId(record.id);

            try {
                const isSaved = await onRecordSave?.(record.id, {
                    categoryId: nextCategoryId,
                    amountUah: preparedAmountUah,
                    amountUsd: preparedAmountUsd,
                });

                if (isSaved === false) {
                    return;
                }

                setRowEditMode(null);
            } finally {
                setSavingRecordId(null);
            }
        },
        [
            getRowEditValidationError,
            onRecordSave,
            rowEditState,
            savingRecordId,
            setRowEditMode,
            setRowEditState,
            setSavingRecordId,
        ],
    );

    const handleSort = useCallback(
        (column: SortableColumn) => {
            if (rowEditState || programYearEdit) {
                return;
            }

            setSort((prev) => {
                if (prev.column !== column) {
                    return { column, direction: 'asc' };
                }

                if (prev.direction === 'asc') {
                    return { column, direction: 'desc' };
                }

                return { column: null, direction: null };
            });

            moveToTop();
        },
        [moveToTop, rowEditState],
    );

    const isProgramYearEditing = programYearEdit !== null;
    const isAnyEditingActive = isAnyRowEditing || isProgramYearEditing;
    const isSavingInProgress = savingRecordId !== null;
    const sortedRecords = sortRecords(records, sort);
    const colSpan = isEditing ? 7 : 5;
    const isProgramYearAcceptDisabled =
        !programYearEdit || programYearEdit.year === programYearEdit.originalYear || isSavingProgramYear;
    const programYearOptions = getProgramReportingYearOptions(
        programAggregateRow ? Number(programAggregateRow.reportingYear) : undefined,
    );

    const eligibleIds = eligibleRecordIds ?? [];
    const selectedIds = selectedRecordIds ?? [];
    const allEligibleSelected = eligibleIds.length > 0 && eligibleIds.every((id) => selectedIds.includes(id));
    const someEligibleSelected = eligibleIds.some((id) => selectedIds.includes(id));

    useEffect(() => {
        if (!headerCheckboxRef.current) return;
        headerCheckboxRef.current.indeterminate = !allEligibleSelected && someEligibleSelected;
    }, [allEligibleSelected, someEligibleSelected]);

    return (
        <div className={styles['table-container']}>
            <div
                className={cn(styles['selection-row'], {
                    [styles['selection-row-hidden']]: selectedIds.length === 0,
                })}
                data-testid="table-selection-summary"
                aria-hidden={selectedIds.length === 0}
            >
                <div className={styles['selection-pill']}>
                    {FUNDS_EXPENDITURES_TEXT.BULK.getSelectedLabel(selectedIds.length, records.length)}
                </div>
                <div className={styles['selection-actions']}>
                    <Button
                        buttonStyle="secondary"
                        className={styles['delete-selected-button']}
                        onClick={() => onOpenBulkDelete?.()}
                    >
                        {FUNDS_EXPENDITURES_TEXT.BULK.DELETE_BUTTON}
                    </Button>
                </div>
            </div>
            <div
                ref={tableWrapperRef}
                className={styles['table-wrapper']}
                data-testid="funds-table"
                data-record-count={records.length}
                onScroll={handleTableScroll}
            >
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {isEditing && (
                                <th className={cn(styles.th, styles['checkbox-th'])}>
                                    <input
                                        type="checkbox"
                                        ref={headerCheckboxRef}
                                        className={styles['header-checkbox']}
                                        aria-label="Select all records"
                                        checked={allEligibleSelected}
                                        onChange={(e) => onSelectAllToggle?.(e.target.checked)}
                                    />
                                </th>
                            )}
                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.REPORTING_YEAR}</th>
                            <th
                                className={cn(styles.th, styles.sortable, {
                                    [styles['sortable-disabled']]: isAnyRowEditing,
                                })}
                                onClick={() => handleSort('type')}
                            >
                                <span className={styles['th-inner']}>
                                    <span>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.TYPE}</span>
                                    <SortIcon isActive={sort.column === 'type'} direction={sort.direction} />
                                </span>
                            </th>
                            <th
                                className={cn(styles.th, styles.sortable, {
                                    [styles['sortable-disabled']]: isAnyRowEditing,
                                })}
                                onClick={() => handleSort('categoryName')}
                            >
                                <span className={styles['th-inner']}>
                                    <span>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.CATEGORY}</span>
                                    <SortIcon isActive={sort.column === 'categoryName'} direction={sort.direction} />
                                </span>
                            </th>
                            <th
                                className={cn(styles.th, styles.sortable, {
                                    [styles['sortable-disabled']]: isAnyRowEditing,
                                })}
                                onClick={() => handleSort('amountUah')}
                            >
                                <span className={styles['th-inner']}>
                                    <span>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_UAH}</span>
                                    <SortIcon isActive={sort.column === 'amountUah'} direction={sort.direction} />
                                </span>
                            </th>
                            <th
                                className={cn(styles.th, styles.sortable, {
                                    [styles['sortable-disabled']]: isAnyRowEditing,
                                })}
                                onClick={() => handleSort('amountUsd')}
                            >
                                <span className={styles['th-inner']}>
                                    <span>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_USD}</span>
                                    <SortIcon isActive={sort.column === 'amountUsd'} direction={sort.direction} />
                                </span>
                            </th>
                            {isEditing && <th className={cn(styles.th, styles['actions-th'])} />}
                        </tr>
                    </thead>
                    <tbody>
                        {programAggregateRow && (
                            <tr
                                className={cn(styles.tr, styles['program-aggregate-row'], {
                                    [styles['program-aggregate-row-editing']]: isProgramYearEditing,
                                })}
                                data-testid="program-aggregate-row"
                            >
                                {isEditing && (
                                    <td className={cn(styles.td, styles['checkbox-td'])} aria-hidden="true" />
                                )}
                                <td className={cn(styles.td, { [styles['category-edit-td']]: isProgramYearEditing })}>
                                    {isProgramYearEditing ? (
                                        <div className={styles['category-edit-wrapper']}>
                                            <Select<string>
                                                value={programYearEdit?.year}
                                                onValueChange={handleProgramYearChange}
                                                placeholder={
                                                    FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_PLACEHOLDER
                                                }
                                                className={styles['category-edit-select']}
                                                optionClassName={styles['category-edit-option']}
                                            >
                                                {programYearOptions.map((year) => (
                                                    <Select.Option key={year} value={year} name={year} />
                                                ))}
                                            </Select>
                                        </div>
                                    ) : (
                                        programAggregateRow.reportingYear
                                    )}
                                </td>
                                <td className={styles.td}>
                                    <span className={cn(styles['type-chip'], styles['type-chip-expense'])}>
                                        {FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.EXPENSE}
                                    </span>
                                </td>
                                <td className={styles.td}>{programAggregateRow.categoryName}</td>
                                <td className={styles.td}>{programAggregateRow.amountUah}</td>
                                <td className={styles.td}>{programAggregateRow.amountUsd}</td>
                                {isEditing && (
                                    <td className={cn(styles.td, styles['actions-td'])}>
                                        <div className={styles['row-actions']}>
                                            {isProgramYearEditing ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            styles['icon-button'],
                                                            styles['accept-icon-button'],
                                                        )}
                                                        aria-label="Accept program reporting year"
                                                        onClick={handleAcceptProgramYearEdit}
                                                        disabled={isProgramYearAcceptDisabled}
                                                    >
                                                        {isSavingProgramYear ? (
                                                            <InlineLoader size={1.2} />
                                                        ) : (
                                                            <CheckmarkIcon className={styles['action-icon']} />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            styles['icon-button'],
                                                            styles['close-icon-button'],
                                                        )}
                                                        aria-label="Close program reporting year edit"
                                                        onClick={handleCloseProgramYearEdit}
                                                        disabled={isSavingProgramYear}
                                                    >
                                                        <CrossIcon className={styles['action-icon']} />
                                                    </button>
                                                </>
                                            ) : (
                                                <IconButton
                                                    type="button"
                                                    className={cn(styles['icon-button'], styles['edit-icon-button'])}
                                                    aria-label="Edit program reporting year"
                                                    onClick={handleStartProgramYearEdit}
                                                    disabled={
                                                        isAnyRowEditing || isSavingInProgress || isRowActionsDisabled
                                                    }
                                                    DefaultIcon={ACTION_ICONS.edit.default}
                                                    FilledIcon={ACTION_ICONS.edit.hover}
                                                />
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        )}
                        {sortedRecords.length === 0 && isEditing ? (
                            <tr>
                                <td
                                    colSpan={colSpan}
                                    className={styles['empty-cell']}
                                    data-testid="funds-table-empty-cell"
                                >
                                    <div className={styles['empty-state']}>
                                        <NotFoundIcon className={styles['empty-state-image']} />
                                        <p className={styles['empty-state-message']}>
                                            {FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.MESSAGE}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sortedRecords.map((record) => {
                                const isEditedRow = rowEditState?.recordId === record.id;
                                const isAnotherRowEditing =
                                    (isAnyEditingActive && !isEditedRow) || isSavingInProgress || isRowActionsDisabled;
                                const isSavingCurrentRow = savingRecordId === record.id;
                                const editableCategories = categoriesByType[record.type];

                                return (
                                    <tr key={record.id} className={styles.tr}>
                                        {isEditing && (
                                            <td className={cn(styles.td, styles['checkbox-td'])}>
                                                <input
                                                    type="checkbox"
                                                    className={styles['row-checkbox']}
                                                    aria-label={`Select record ${record.id}`}
                                                    disabled={isAnyRowEditing}
                                                    checked={selectedIds.includes(record.id)}
                                                    onChange={() => onToggleRecordSelection?.(record.id)}
                                                />
                                            </td>
                                        )}
                                        <td className={styles.td}>{record.reportingYear}</td>
                                        <td className={styles.td}>
                                            <span
                                                className={cn(styles['type-chip'], {
                                                    [styles['type-chip-income']]: record.type === 'income',
                                                    [styles['type-chip-expense']]: record.type === 'expense',
                                                })}
                                            >
                                                {TYPE_LABEL_MAP[record.type]}
                                            </span>
                                        </td>
                                        <td className={cn(styles.td, { [styles['category-edit-td']]: isEditedRow })}>
                                            {isEditedRow ? (
                                                <div
                                                    className={styles['category-edit-wrapper']}
                                                    onBlurCapture={(event) => {
                                                        if (
                                                            !event.currentTarget.contains(
                                                                event.relatedTarget as Node | null,
                                                            )
                                                        ) {
                                                            handleRowCategoryBlur(record);
                                                        }
                                                    }}
                                                >
                                                    <Select<number | undefined>
                                                        value={rowEditState.categoryId}
                                                        onValueChange={(value) =>
                                                            handleRowCategoryChange(record, value)
                                                        }
                                                        placeholder={
                                                            FUNDS_EXPENDITURES_TEXT.FILTER.CATEGORY_PLACEHOLDER
                                                        }
                                                        className={styles['category-edit-select']}
                                                        optionClassName={styles['category-edit-option']}
                                                    >
                                                        <Select.Option
                                                            value={undefined}
                                                            name={FUNDS_EXPENDITURES_TEXT.FILTER.CATEGORY_PLACEHOLDER}
                                                        />
                                                        {editableCategories.map((category) => (
                                                            <Select.Option
                                                                key={category.id}
                                                                value={category.id}
                                                                name={category.name}
                                                            />
                                                        ))}
                                                    </Select>
                                                    {rowEditState.errors.category && (
                                                        <p className={styles['category-edit-error']}>
                                                            {rowEditState.errors.category}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                record.categoryName
                                            )}
                                        </td>
                                        {renderAmountEditRow(
                                            record,
                                            () => handleAcceptRowEdit(record),
                                            () => handleStartRowEdit(record),
                                            () => onDeleteRecord?.(record),
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <button
                type="button"
                className={cn(styles['to-top-button'], {
                    [styles['to-top-button-visible']]: isMoveToTopVisible,
                })}
                data-testid="funds-table-to-top"
                onClick={moveToTop}
                aria-label="Scroll table to top"
                aria-hidden={!isMoveToTopVisible}
                tabIndex={isMoveToTopVisible ? 0 : -1}
            >
                <ArrowUpIcon className={styles['to-top-icon']} />
            </button>
        </div>
    );
};
