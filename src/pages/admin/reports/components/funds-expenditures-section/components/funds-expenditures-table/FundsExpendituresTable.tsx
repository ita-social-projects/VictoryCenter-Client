import { useState, useCallback } from 'react';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { FundsExpendituresTransactionType, ReportFundsExpendituresRecord } from '@/types/admin/reports';
import { ReactComponent as ChevronUp } from '@/assets/icons/chevron-up.svg';
import { ReactComponent as ChevronDown } from '@/assets/icons/chevron-down.svg';
import { ReactComponent as NotFoundIcon } from '@/assets/icons/not-found.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/delete.svg';
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
    isEditing?: boolean;
}

const TYPE_LABEL_MAP: Record<FundsExpendituresTransactionType, string> = {
    income: FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.INCOME,
    expense: FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.EXPENSE,
};

const parseAmount = (value: string): number => Number.parseFloat(value.replaceAll(' ', '')) || 0;

const sortRecords = (records: EnrichedRecord[], sort: ColumnSort): EnrichedRecord[] => {
    if (!sort.column || !sort.direction) return records;

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

const SortIcon = ({ column, sort }: { column: SortableColumn; sort: ColumnSort }) => {
    if (sort.column !== column) {
        return (
            <span className={styles['sort-icons']}>
                <ChevronUp className={styles['sort-icon']} />
                <ChevronDown className={styles['sort-icon']} />
            </span>
        );
    }
    return sort.direction === 'asc' ? (
        <ChevronUp className={cn(styles['sort-icon'], styles['sort-icon-active'])} />
    ) : (
        <ChevronDown className={cn(styles['sort-icon'], styles['sort-icon-active'])} />
    );
};

export const FundsExpendituresTable = ({ records, isEditing = false }: FundsExpendituresTableProps) => {
    const [sort, setSort] = useState<ColumnSort>({ column: null, direction: null });

    const handleSort = useCallback((column: SortableColumn) => {
        setSort((prev) => {
            if (prev.column !== column) return { column, direction: 'asc' };
            if (prev.direction === 'asc') return { column, direction: 'desc' };
            return { column: null, direction: null };
        });
    }, []);

    const sortedRecords = sortRecords(records, sort);
    const colSpan = isEditing ? 7 : 5;

    return (
        <div className={styles['table-wrapper']} data-testid="funds-table" data-record-count={records.length}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {isEditing && <th className={cn(styles.th, styles['checkbox-th'])} />}
                        <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.REPORTING_YEAR}</th>
                        <th className={cn(styles.th, styles.sortable)} onClick={() => handleSort('type')}>
                            <span className={styles['th-inner']}>
                                <span>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.TYPE}</span>
                                <SortIcon column="type" sort={sort} />
                            </span>
                        </th>
                        <th className={cn(styles.th, styles.sortable)} onClick={() => handleSort('categoryName')}>
                            <span className={styles['th-inner']}>
                                <span>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.CATEGORY}</span>
                                <SortIcon column="categoryName" sort={sort} />
                            </span>
                        </th>
                        <th className={cn(styles.th, styles.sortable)} onClick={() => handleSort('amountUah')}>
                            <span className={styles['th-inner']}>
                                <span>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_UAH}</span>
                                <SortIcon column="amountUah" sort={sort} />
                            </span>
                        </th>
                        <th className={cn(styles.th, styles.sortable)} onClick={() => handleSort('amountUsd')}>
                            <span className={styles['th-inner']}>
                                <span>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_USD}</span>
                                <SortIcon column="amountUsd" sort={sort} />
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
                        sortedRecords.map((record) => (
                            <tr key={record.id} className={styles.tr}>
                                {isEditing && (
                                    <td className={cn(styles.td, styles['checkbox-td'])}>
                                        <input
                                            type="checkbox"
                                            className={styles['row-checkbox']}
                                            aria-label={`Select record ${record.id}`}
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
                                <td className={styles.td}>{record.categoryName}</td>
                                <td className={styles.td}>{record.amountUah}</td>
                                <td className={styles.td}>{record.amountUsd}</td>
                                {isEditing && (
                                    <td className={cn(styles.td, styles['actions-td'])}>
                                        <div className={styles['row-actions']}>
                                            <button
                                                type="button"
                                                className={styles['icon-button']}
                                                aria-label={`Edit record ${record.id}`}
                                            >
                                                <EditIcon className={styles['action-icon']} />
                                            </button>
                                            <button
                                                type="button"
                                                className={styles['icon-button']}
                                                aria-label={`Delete record ${record.id}`}
                                            >
                                                <DeleteIcon className={styles['action-icon']} />
                                            </button>
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
