import { ProgramExpensesEmptyState } from '@/pages/admin/reports/components/program-expenses-section/components/program-expenses-empty-state/ProgramExpensesEmptyState';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesRecord } from '@/types/admin/reports';
import { formatSummaryAmount } from '@/utils/functions/format-summary-amount/format-summary-amount';
import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';
import styles from './ProgramExpensesTable.module.scss';

interface ProgramExpensesTableProps {
    records: ProgramExpensesRecord[];
    hasAnyProgramExpenseRecords: boolean;
}

const TABLE_COLUMNS_COUNT = 5;

export const ProgramExpensesTable = ({ records, hasAnyProgramExpenseRecords }: ProgramExpensesTableProps) => {
    const hasNoRecords = records.length === 0;

    return (
        <div className={styles['table-wrapper']}>
            <table className={styles.table}>
                <colgroup>
                    <col className={styles['column-year']} />
                    <col className={styles['column-type']} />
                    <col className={styles['column-program']} />
                    <col className={styles['column-amount']} />
                    <col className={styles['column-amount']} />
                </colgroup>
                <thead>
                    <tr>
                        <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.REPORTING_YEAR}</th>
                        <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.TYPE}</th>
                        <th className={styles.th}>{PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.PROGRAM}</th>
                        <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_UAH}</th>
                        <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_USD}</th>
                    </tr>
                </thead>
                <tbody>
                    {hasNoRecords ? (
                        <ProgramExpensesEmptyState
                            colSpan={TABLE_COLUMNS_COUNT}
                            variant={hasAnyProgramExpenseRecords ? 'filtered' : 'program-expenses'}
                        />
                    ) : (
                        records.map((record) => (
                            <tr key={record.id} className={styles.tr}>
                                <td className={styles.td}>{record.reportingYear}</td>
                                <td className={styles.td}>
                                    <span className={styles['type-chip']}>{COMMON_TEXT_ADMIN.TAB.PROGRAMS}</span>
                                </td>
                                <td className={styles.td}>{record.programName}</td>
                                <td className={styles.td}>{formatSummaryAmount(parseAmount(record.amountUah))}</td>
                                <td className={styles.td}>{formatSummaryAmount(parseAmount(record.amountUsd))}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
