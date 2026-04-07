import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesRecord } from '@/types/admin/reports';
import { ReactComponent as NotFoundIcon } from '@/assets/icons/not-found.svg';
import { formatSummaryAmount } from '@/utils/functions/format-summary-amount/format-summary-amount';
import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';
import styles from './ProgramExpensesTable.module.scss';

interface ProgramExpensesTableProps {
    records: ProgramExpensesRecord[];
}

export const ProgramExpensesTable = ({ records }: ProgramExpensesTableProps) => {
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
                        <th className={styles.th}>{PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.REPORTING_YEAR}</th>
                        <th className={styles.th}>{PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.TYPE}</th>
                        <th className={styles.th}>{PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.PROGRAM}</th>
                        <th className={styles.th}>{PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.AMOUNT_UAH}</th>
                        <th className={styles.th}>{PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.AMOUNT_USD}</th>
                    </tr>
                </thead>
                <tbody>
                    {records.length === 0 ? (
                        <tr>
                            <td className={styles['empty-cell']} colSpan={5}>
                                <div className={styles['empty-state']}>
                                    <NotFoundIcon className={styles['empty-state-image']} />
                                    <p className={styles['empty-state-message']}>
                                        {FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.MESSAGE}
                                    </p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        records.map((record) => (
                            <tr key={record.id} className={styles.tr}>
                                <td className={styles.td}>{record.reportingYear}</td>
                                <td className={styles.td}>
                                    <span className={styles['type-chip']}>
                                        {PROGRAM_EXPENSES_TEXT.TABLE.TYPE_LABEL}
                                    </span>
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
