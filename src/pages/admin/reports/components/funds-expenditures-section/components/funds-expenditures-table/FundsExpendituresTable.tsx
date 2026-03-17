import { useState, useCallback } from 'react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import {
    FundsExpendituresTransactionType,
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
} from '@/types/admin/reports';
import { ReactComponent as NotFoundIcon } from '@/assets/icons/not-found.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/delete.svg';
import { ReactComponent as CheckmarkIcon } from '@/assets/icons/checkmark.svg';
import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg';
import { Select } from '@/components/common/select/Select';
import { SortIcon } from '@/pages/admin/reports/components/funds-expenditures-section/components/funds-expenditures-table/components/sort-icon';
import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';
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
    allRecordsForTypeInference?: ReportFundsExpendituresRecord[];
    isEditing?: boolean;
    onRowEditModeChange?: (isEditMode: boolean) => void;
    onRecordCategorySave?: (recordId: number, categoryId: number) => void;
}

interface RowEditState {
    recordId: number;
    originalCategoryId: number;
    categoryId: number | undefined;
    error: string | undefined;
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

export const FundsExpendituresTable = ({
    records,
    categories,
    allRecordsForTypeInference,
    isEditing = false,
    onRowEditModeChange,
    onRecordCategorySave,
}: FundsExpendituresTableProps) => {
    const [sort, setSort] = useState<ColumnSort>({ column: null, direction: null });
    const [rowEditState, setRowEditState] = useState<RowEditState | null>(null);

    const typeInferenceSource = allRecordsForTypeInference ?? records;

    const categoriesByType = {
        income: getCategoriesForType(categories, typeInferenceSource, 'income'),
        expense: getCategoriesForType(categories, typeInferenceSource, 'expense'),
    };

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
            if (nextCategoryId === undefined) {
                return trigger === 'blur' ? COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED : undefined;
            }

            const hasDuplicate = typeInferenceSource.some(
                (item) => item.id !== record.id && item.type === record.type && item.categoryId === nextCategoryId,
            );

            return hasDuplicate ? FUNDS_EXPENDITURES_TEXT.VALIDATION.CATEGORY_UNIQUE : undefined;
        },
        [typeInferenceSource],
    );

    const handleStartRowEdit = useCallback(
        (record: EnrichedRecord) => {
            if (rowEditState) {
                return;
            }

            setRowEditMode({
                recordId: record.id,
                originalCategoryId: record.categoryId,
                categoryId: record.categoryId,
                error: undefined,
            });
        },
        [rowEditState, setRowEditMode],
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
                    error: nextError,
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
                    error: getRowEditValidationError(record, prev.categoryId, 'blur'),
                };
            });
        },
        [getRowEditValidationError],
    );

    const handleAcceptRowEdit = useCallback(
        (record: EnrichedRecord) => {
            if (rowEditState?.recordId !== record.id) {
                return;
            }

            const finalError = getRowEditValidationError(record, rowEditState.categoryId, 'blur');
            const isCategoryUnchanged = rowEditState.categoryId === rowEditState.originalCategoryId;
            const isCategoryMissing = rowEditState.categoryId === undefined;

            if (finalError || isCategoryMissing || isCategoryUnchanged) {
                setRowEditState((prev) => {
                    if (prev?.recordId !== record.id) {
                        return prev;
                    }

                    return {
                        ...prev,
                        error: finalError,
                    };
                });

                return;
            }

            const nextCategoryId = rowEditState.categoryId;
            if (nextCategoryId === undefined) {
                return;
            }

            onRecordCategorySave?.(record.id, nextCategoryId);
            setRowEditMode(null);
        },
        [getRowEditValidationError, onRecordCategorySave, rowEditState, setRowEditMode],
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
        },
        [rowEditState],
    );

    const isAnyRowEditing = rowEditState !== null;
    const sortedRecords = sortRecords(records, sort);
    const colSpan = isEditing ? 7 : 5;

    return (
        <div className={styles['table-wrapper']} data-testid="funds-table" data-record-count={records.length}>
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
                            <td colSpan={colSpan} className={styles['empty-cell']} data-testid="funds-table-empty-cell">
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
                            const isAnotherRowEditing = isAnyRowEditing && !isEditedRow;
                            const editableCategories = categoriesByType[record.type];
                            const isAcceptDisabled =
                                !isEditedRow ||
                                rowEditState.categoryId === undefined ||
                                Boolean(rowEditState.error) ||
                                rowEditState.categoryId === rowEditState.originalCategoryId;

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
                                                    onValueChange={(value) => handleRowCategoryChange(record, value)}
                                                    placeholder={FUNDS_EXPENDITURES_TEXT.FILTER.CATEGORY_PLACEHOLDER}
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
                                                {rowEditState.error && (
                                                    <p className={styles['category-edit-error']}>
                                                        {rowEditState.error}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            record.categoryName
                                        )}
                                    </td>
                                    <td className={styles.td}>{record.amountUah}</td>
                                    <td className={styles.td}>{record.amountUsd}</td>
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
                                                            disabled={isAcceptDisabled}
                                                        >
                                                            <CheckmarkIcon className={styles['action-icon']} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={cn(
                                                                styles['icon-button'],
                                                                styles['close-icon-button'],
                                                            )}
                                                            aria-label={`Close edit for record ${record.id}`}
                                                            onClick={handleCloseRowEdit}
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
    );
};
