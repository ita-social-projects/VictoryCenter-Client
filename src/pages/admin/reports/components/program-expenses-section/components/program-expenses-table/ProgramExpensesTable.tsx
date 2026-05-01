import { useEffect, useRef, useState } from 'react';
import { ProgramExpensesEmptyState } from '@/pages/admin/reports/components/program-expenses-section/components/program-expenses-empty-state/ProgramExpensesEmptyState';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesRecord } from '@/types/admin/reports';
import { formatSummaryAmount } from '@/utils/functions/format-summary-amount/format-summary-amount';
import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { ACTION_ICONS } from '@/const/common/action-icons';
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
}: ProgramExpensesTableProps) => {
    const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
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

    useEffect(() => {
        if (!isEditing) {
            setSelectedRecordIds([]);
        }
    }, [isEditing]);

    const handleSelectAllVisibleRecords = (isChecked: boolean) => {
        const visibleRecordIdsSet = new Set(visibleRecordIds);

        if (isChecked) {
            setSelectedRecordIds(Array.from(new Set([...selectedRecordIds, ...visibleRecordIds])));
            return;
        }

        setSelectedRecordIds(selectedRecordIds.filter((id) => !visibleRecordIdsSet.has(id)));
    };

    const handleSelectRecord = (recordId: number, isChecked: boolean) => {
        if (isChecked) {
            setSelectedRecordIds(Array.from(new Set([...selectedRecordIds, recordId])));
            return;
        }

        setSelectedRecordIds(selectedRecordIds.filter((id) => id !== recordId));
    };

    return (
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
                                    disabled={records.length === 0}
                                    onChange={(event) => handleSelectAllVisibleRecords(event.target.checked)}
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
                                            onChange={(event) => handleSelectRecord(record.id, event.target.checked)}
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
    );
};
