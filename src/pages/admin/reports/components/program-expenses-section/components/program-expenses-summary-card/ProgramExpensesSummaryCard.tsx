import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesSummary } from '@/types/admin/reports';
import { formatSummaryAmount } from '@/utils/functions/format-summary-amount/format-summary-amount';
import styles from './ProgramExpensesSummaryCard.module.scss';

interface ProgramExpensesSummaryCardProps {
    summary: ProgramExpensesSummary;
}

const ZERO_PLACEHOLDER = '00';

const formatProgramExpensesAmount = (value?: number): string => {
    if (value === 0) {
        return ZERO_PLACEHOLDER;
    }

    return formatSummaryAmount(value);
};

export const ProgramExpensesSummaryCard = ({ summary }: ProgramExpensesSummaryCardProps) => {
    return (
        <div className={styles['summary-card']}>
            <span className={styles['summary-title']}>{PROGRAM_EXPENSES_TEXT.SUMMARY_CARD.TITLE}</span>
            <div className={styles['summary-amounts']}>
                <span className={styles['summary-amount']}>
                    {formatProgramExpensesAmount(summary.totalAmountUah)}{' '}
                    {FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.AMOUNT_SUFFIX_UAH}
                </span>
                <span className={styles['summary-amount']}>
                    {formatProgramExpensesAmount(summary.totalAmountUsd)}{' '}
                    {FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.AMOUNT_SUFFIX_USD}
                </span>
            </div>
        </div>
    );
};
