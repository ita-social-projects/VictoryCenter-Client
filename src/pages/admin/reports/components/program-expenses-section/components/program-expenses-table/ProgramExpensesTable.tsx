import { useEffect, useRef } from 'react';
import { ProgramExpensesEmptyState } from '@/pages/admin/reports/components/program-expenses-section/components/program-expenses-empty-state/ProgramExpensesEmptyState';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesRecord } from '@/types/admin/reports';
import { formatSummaryAmount } from '@/utils/functions/format-summary-amount/format-summary-amount';
import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { Button } from '@/components/admin/button/Button';
import cn from 'classnames';
import styles from './ProgramExpensesTable.module.scss';

interface ProgramExpensesTableProps {
    records: ProgramExpensesRecord[];
    hasAnyProgramExpenseRecords: boolean;
    isEditing?: boolean;
    isAddProgramExpenseDisabled?: boolean;
    onAddProgramExpense?: () => void;
    onEditRecord?: (record: ProgramExpensesRecord) => void;
    onDeleteRecord?: (record: ProgramExpensesRecord) => void;
    selectedRecordIds?: number[];
    onToggleRecordSelection?: (id: number) => void;
    onSelectAllToggle?: (checked: boolean) => void;
    onOpenBulkDelete?: () => void;
}

const READ_ONLY_TABLE_COLUMNS_COUNT = 5;
const EDITING_TABLE_COLUMNS_COUNT = 7;

export const ProgramExpensesTable = ({
    records,
    hasAnyProgramExpenseRecords,
    isEditing = false,
    isAddProgramExpenseDisabled = false,
    onAddProgramExpense,
    onEditRecord,
    onDeleteRecord,
    selectedRecordIds = [],
    onToggleRecordSelection,
    onSelectAllToggle,
    onOpenBulkDelete,
}: ProgramExpensesTableProps) => {
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const hasNoRecords = records.length === 0;
    const visibleRecordIds = records.map((record) => record.id);
    const selectedVisibleRecordIds = visibleRecordIds.filter((id) => selectedRecordIds.includes(id));
    const areAllVisibleRecordsSelected = records.length > 0 && selectedVisibleRecordIds.length === records.length;
    const hasSelectedVisibleRecords = selectedVisibleRecordIds.length > 0;
    const tableColumnsCount = isEditing ? EDITING_TABLE_COLUMNS_COUNT : READ_ONLY_TABLE_COLUMNS_COUNT;

    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = hasSelectedVisibleRecords && !areAllVisibleRecordsSelected;
        }
    }, [areAllVisibleRecordsSelected, hasSelectedVisibleRecords]);

    return (
        <div className={styles['table-container']}>
            <div
                className={cn(styles['selection-row'], {
                    [styles['selection-row-hidden']]: selectedRecordIds.length === 0,
                })}
                aria-hidden={selectedRecordIds.length === 0}
            >
                <div className={styles['selection-pill']}>
                    {PROGRAM_EXPENSES_TEXT.BULK.getSelectedLabel(selectedRecordIds.length, records.length)}
                </div>
                <div className={styles['selection-actions']}>
                    <Button
                        buttonStyle="secondary"
                        className={styles['delete-selected-button']}
                        onClick={() => onOpenBulkDelete?.()}
                    >
                        {PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON}
                    </Button>
                </div>
            </div>

            <div className={styles['table-wrapper']}>
                <table className={styles.table}>
                    <colgroup>
                        {isEditing && <col className={styles['column-checkbox']} />}
                        <col className={styles['column-year']} />
                        <col className={styles['column-type']} />
                        <col className={styles['column-program']} />
                        <col className={styles['column-amount']} />
                        <col className={styles['column-amount']} />
                        {isEditing && <col className={styles['column-actions']} />}
                    </colgroup>
                    <thead>
                        <tr>
                            {isEditing && (
                                <th className={cn(styles.th, styles['checkbox-th'])}>
                                    <input
                                        ref={headerCheckboxRef}
                                        type="checkbox"
                                        className={styles['row-checkbox']}
                                        aria-label="Select all program expense records"
                                        checked={areAllVisibleRecordsSelected}
                                        onChange={(event) => onSelectAllToggle?.(event.target.checked)}
                                    />
                                </th>
                            )}
                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.REPORTING_YEAR}</th>
                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.TYPE}</th>
                            <th className={styles.th}>{PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.PROGRAM}</th>
                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_UAH}</th>
                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_USD}</th>
                            {isEditing && (
                                <th className={cn(styles.th, styles['actions-th'])}>
                                    {PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.ACTIONS}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {hasNoRecords ? (
                            <ProgramExpensesEmptyState
                                colSpan={tableColumnsCount}
                                variant={hasAnyProgramExpenseRecords ? 'filtered' : 'program-expenses'}
                                isAddProgramExpenseDisabled={isAddProgramExpenseDisabled}
                                onAddProgramExpense={onAddProgramExpense}
                            />
                        ) : (
                            records.map((record) => (
                                <tr key={record.id} className={styles.tr}>
                                    {isEditing && (
                                        <td className={cn(styles.td, styles['checkbox-td'])}>
                                            <input
                                                type="checkbox"
                                                className={styles['row-checkbox']}
                                                aria-label={`Select record ${record.id}`}
                                                checked={selectedRecordIds.includes(record.id)}
                                                onChange={() => onToggleRecordSelection?.(record.id)}
                                            />
                                        </td>
                                    )}
                                    <td className={styles.td}>{record.reportingYear}</td>
                                    <td className={styles.td}>
                                        <span className={styles['type-chip']}>
                                            {PROGRAM_EXPENSES_TEXT.TABLE.TYPE_LABEL}
                                        </span>
                                    </td>
                                    <td className={styles.td}>{record.programName}</td>
                                    <td className={styles.td}>{formatSummaryAmount(parseAmount(record.amountUah))}</td>
                                    <td className={styles.td}>{formatSummaryAmount(parseAmount(record.amountUsd))}</td>
                                    {isEditing && (
                                        <td className={cn(styles.td, styles['actions-td'])}>
                                            <div className={styles['row-actions']}>
                                                <IconButton
                                                    type="button"
                                                    className={cn(styles['icon-button'], styles['edit-icon-button'])}
                                                    aria-label={`Edit record ${record.id}`}
                                                    onClick={() => onEditRecord?.(record)}
                                                    DefaultIcon={ACTION_ICONS.edit.default}
                                                    FilledIcon={ACTION_ICONS.edit.hover}
                                                />
                                                <IconButton
                                                    type="button"
                                                    className={cn(styles['icon-button'], styles['delete-icon-button'])}
                                                    aria-label={`Delete record ${record.id}`}
                                                    onClick={() => onDeleteRecord?.(record)}
                                                    DefaultIcon={ACTION_ICONS.delete.default}
                                                    FilledIcon={ACTION_ICONS.delete.hover}
                                                />
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
