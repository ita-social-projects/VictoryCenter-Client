import { useState, useCallback, useRef, useEffect } from 'react';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import {
    FundsExpendituresTransactionType,
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
} from '@/types/admin/reports';
import { ReactComponent as NotFoundIcon } from '@/assets/icons/not-found.svg';
import { ReactComponent as ArrowUpIcon } from '@/assets/icons/arrow-up.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/delete.svg';
import { ReactComponent as CheckmarkIcon } from '@/assets/icons/checkmark.svg';
import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg';
import { Select } from '@/components/common/select/Select';
import { SortIcon } from '@/pages/admin/reports/components/funds-expenditures-section/components/funds-expenditures-table/components/sort-icon';
import {
    normalizeFundsExpendituresAmountInput,
    validateFundsExpendituresAmount,
    validateFundsExpendituresCategory,
} from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';
import { getConvertedAmount } from '@/utils/functions/get-converted-amount/get-converted-amount';
import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import cn from 'classnames';
import styles from './FundsExpendituresTable.module.scss';

export interface EnrichedRecord extends ReportFundsExpendituresRecord {
    categoryName: string;
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
    onDeleteRecord?: (record: EnrichedRecord) => void;
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
    onDeleteRecord,
}: FundsExpendituresTableProps) => {
    const [sort, setSort] = useState<ColumnSort>({ column: null, direction: null });
    const [rowEditState, setRowEditState] = useState<RowEditState | null>(null);
    const [savingRecordId, setSavingRecordId] = useState<number | null>(null);
    const [isMoveToTopVisible, setIsMoveToTopVisible] = useState(false);
    const tableWrapperRef = useRef<HTMLDivElement>(null);

    const typeInferenceSource = allRecordsForTypeInference ?? records;

    const categoriesByType = {
        income: getCategoriesForType(categories, typeInferenceSource, 'income'),
        expense: getCategoriesForType(categories, typeInferenceSource, 'expense'),
    };

    const updateMoveToTopVisibility = useCallback(() => {
        const tableWrapper = tableWrapperRef.current;
        if (!tableWrapper) return;

        const isScrollable = tableWrapper.scrollHeight > tableWrapper.clientHeight;
        setIsMoveToTopVisible(isScrollable && tableWrapper.scrollTop > 0);
    }, []);

    const moveToTop = useCallback(() => {
        const tableWrapper = tableWrapperRef.current;
        if (!tableWrapper) return;

        tableWrapper.scrollTop = 0;
        setIsMoveToTopVisible(false);
    }, []);

    const handleTableScroll = useCallback(() => {
        updateMoveToTopVisibility();
    }, [updateMoveToTopVisibility]);

    useEffect(() => {
        updateMoveToTopVisibility();
    }, [records.length, updateMoveToTopVisibility]);

    const setRowEditMode = useCallback(
        (nextState: RowEditState | null) => {
            setRowEditState(nextState);
            onRowEditModeChange?.(nextState !== null);
        },
        [onRowEditModeChange],
    );

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
            });
        },
        [isRowActionsDisabled, rowEditState, setRowEditMode],
    );

    const handleCloseRowEdit = useCallback(() => {
        setRowEditMode(null);
    }, [setRowEditMode]);

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
        [getRowEditValidationError],
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
        [getRowEditValidationError],
    );

    const handleAmountChange = useCallback(
        (recordId: number, field: 'amountUah' | 'amountUsd', nextValue: string) => {
            const normalized = normalizeFundsExpendituresAmountInput(nextValue);

            setRowEditState((prev) => {
                if (prev?.recordId !== recordId) {
                    return prev;
                }

                const currentFieldError = validateFundsExpendituresAmount(normalized, 'change');

                let nextAmountUah = field === 'amountUah' ? normalized : prev.amountUah;
                let nextAmountUsd = field === 'amountUsd' ? normalized : prev.amountUsd;
                let nextAmountUahError = field === 'amountUah' ? currentFieldError : prev.errors.amountUah;
                let nextAmountUsdError = field === 'amountUsd' ? currentFieldError : prev.errors.amountUsd;

                if (!currentFieldError) {
                    const convertedAmount = getConvertedAmount(normalized, field, exchangeRate);

                    if (convertedAmount !== null) {
                        if (field === 'amountUah') {
                            nextAmountUsd = convertedAmount;
                            nextAmountUsdError = validateFundsExpendituresAmount(convertedAmount, 'change');
                        } else {
                            nextAmountUah = convertedAmount;
                            nextAmountUahError = validateFundsExpendituresAmount(convertedAmount, 'change');
                        }
                    }
                }

                return {
                    ...prev,
                    amountUah: nextAmountUah,
                    amountUsd: nextAmountUsd,
                    errors: {
                        ...prev.errors,
                        amountUah: nextAmountUahError,
                        amountUsd: nextAmountUsdError,
                    },
                };
            });
        },
        [exchangeRate],
    );

    const handleAmountBlur = useCallback(
        (recordId: number, field: 'amountUah' | 'amountUsd') => {
            setRowEditState((prev) => {
                if (prev?.recordId !== recordId) {
                    return prev;
                }

                const normalized = normalizeFundsExpendituresAmountInput(prev[field], true);
                const currentFieldError = validateFundsExpendituresAmount(normalized, 'blur');

                let nextAmountUah = field === 'amountUah' ? normalized : prev.amountUah;
                let nextAmountUsd = field === 'amountUsd' ? normalized : prev.amountUsd;
                let nextAmountUahError = field === 'amountUah' ? currentFieldError : prev.errors.amountUah;
                let nextAmountUsdError = field === 'amountUsd' ? currentFieldError : prev.errors.amountUsd;

                if (!currentFieldError) {
                    const convertedAmountString = getConvertedAmount(normalized, field, exchangeRate);

                    if (convertedAmountString !== null && field === 'amountUah') {
                        nextAmountUsd = convertedAmountString;
                        nextAmountUsdError = validateFundsExpendituresAmount(convertedAmountString, 'blur');
                    } else if (convertedAmountString !== null) {
                        nextAmountUah = convertedAmountString;
                        nextAmountUahError = validateFundsExpendituresAmount(convertedAmountString, 'blur');
                    }
                }

                return {
                    ...prev,
                    amountUah: nextAmountUah,
                    amountUsd: nextAmountUsd,
                    errors: {
                        ...prev.errors,
                        amountUah: nextAmountUahError,
                        amountUsd: nextAmountUsdError,
                    },
                };
            });
        },
        [exchangeRate],
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
            const normalizedAmountUah = normalizeFundsExpendituresAmountInput(rowEditState.amountUah, true);
            const normalizedAmountUsd = normalizeFundsExpendituresAmountInput(rowEditState.amountUsd, true);
            const amountUahError = validateFundsExpendituresAmount(normalizedAmountUah, 'save');
            const amountUsdError = validateFundsExpendituresAmount(normalizedAmountUsd, 'save');
            const isAmountsUnchanged =
                normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUah, true) === normalizedAmountUah &&
                normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUsd, true) === normalizedAmountUsd;

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
                        amountUah: normalizedAmountUah,
                        amountUsd: normalizedAmountUsd,
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
                    amountUah: normalizedAmountUah,
                    amountUsd: normalizedAmountUsd,
                });

                if (isSaved === false) {
                    return;
                }

                setRowEditMode(null);
            } finally {
                setSavingRecordId(null);
            }
        },
        [getRowEditValidationError, onRecordSave, rowEditState, savingRecordId, setRowEditMode],
    );

    const handleSort = useCallback(
        (column: SortableColumn) => {
            if (rowEditState) {
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

            const tableWrapper = tableWrapperRef.current;
            if (tableWrapper) {
                tableWrapper.scrollTop = 0;
                setIsMoveToTopVisible(false);
            }
        },
        [rowEditState],
    );

    const isAnyRowEditing = rowEditState !== null;
    const isSavingInProgress = savingRecordId !== null;
    const sortedRecords = sortRecords(records, sort);
    const colSpan = isEditing ? 7 : 5;

    return (
        <div className={styles['table-container']}>
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
                            {isEditing && <th className={cn(styles.th, styles['checkbox-th'])} />}
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
                        {sortedRecords.length === 0 ? (
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
                                    (isAnyRowEditing && !isEditedRow) || isSavingInProgress || isRowActionsDisabled;
                                const isSavingCurrentRow = savingRecordId === record.id;
                                const editableCategories = categoriesByType[record.type];
                                const isAcceptDisabled = !isEditedRow || isAcceptButtonDisabled(rowEditState);

                                return (
                                    <tr key={record.id} className={styles.tr}>
                                        {isEditing && (
                                            <td className={cn(styles.td, styles['checkbox-td'])}>
                                                <input
                                                    type="checkbox"
                                                    className={styles['row-checkbox']}
                                                    aria-label={`Select record ${record.id}`}
                                                    disabled={isAnyRowEditing}
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
                                        <td className={cn(styles.td, { [styles['amount-edit-td']]: isEditedRow })}>
                                            {isEditedRow ? (
                                                <div className={styles['amount-edit-wrapper']}>
                                                    <input
                                                        type="text"
                                                        className={cn(styles['amount-edit-input'], {
                                                            [styles['amount-edit-input-error']]:
                                                                rowEditState.errors.amountUah,
                                                        })}
                                                        value={rowEditState.amountUah}
                                                        aria-label={`Amount UAH record ${record.id}`}
                                                        onChange={(event) =>
                                                            handleAmountChange(
                                                                record.id,
                                                                'amountUah',
                                                                event.target.value,
                                                            )
                                                        }
                                                        onBlur={() => handleAmountBlur(record.id, 'amountUah')}
                                                        disabled={isSavingCurrentRow}
                                                    />
                                                    {rowEditState.errors.amountUah && (
                                                        <p className={styles['amount-edit-error']}>
                                                            {rowEditState.errors.amountUah}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                record.amountUah
                                            )}
                                        </td>
                                        <td className={cn(styles.td, { [styles['amount-edit-td']]: isEditedRow })}>
                                            {isEditedRow ? (
                                                <div className={styles['amount-edit-wrapper']}>
                                                    <input
                                                        type="text"
                                                        className={cn(styles['amount-edit-input'], {
                                                            [styles['amount-edit-input-error']]:
                                                                rowEditState.errors.amountUsd,
                                                        })}
                                                        value={rowEditState.amountUsd}
                                                        aria-label={`Amount USD record ${record.id}`}
                                                        onChange={(event) =>
                                                            handleAmountChange(
                                                                record.id,
                                                                'amountUsd',
                                                                event.target.value,
                                                            )
                                                        }
                                                        onBlur={() => handleAmountBlur(record.id, 'amountUsd')}
                                                        disabled={isSavingCurrentRow}
                                                    />
                                                    {rowEditState.errors.amountUsd && (
                                                        <p className={styles['amount-edit-error']}>
                                                            {rowEditState.errors.amountUsd}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                record.amountUsd
                                            )}
                                        </td>
                                        {isEditing && (
                                            <td className={cn(styles.td, styles['actions-td'])}>
                                                <div className={styles['row-actions']}>
                                                    {isEditedRow ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className={cn(
                                                                    styles['icon-button'],
                                                                    styles['accept-icon-button'],
                                                                )}
                                                                aria-label={`Accept record ${record.id}`}
                                                                onClick={() => handleAcceptRowEdit(record)}
                                                                disabled={isAcceptDisabled || isSavingCurrentRow}
                                                            >
                                                                {isSavingCurrentRow ? (
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
                                                                aria-label={`Close edit for record ${record.id}`}
                                                                onClick={handleCloseRowEdit}
                                                                disabled={isSavingCurrentRow}
                                                            >
                                                                <CrossIcon className={styles['action-icon']} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className={styles['icon-button']}
                                                                aria-label={`Edit record ${record.id}`}
                                                                onClick={() => handleStartRowEdit(record)}
                                                                disabled={isAnotherRowEditing}
                                                            >
                                                                <EditIcon className={styles['action-icon']} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={styles['icon-button']}
                                                                aria-label={`Delete record ${record.id}`}
                                                                onClick={() => onDeleteRecord?.(record)}
                                                                disabled={isAnotherRowEditing}
                                                            >
                                                                <DeleteIcon className={styles['action-icon']} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
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
