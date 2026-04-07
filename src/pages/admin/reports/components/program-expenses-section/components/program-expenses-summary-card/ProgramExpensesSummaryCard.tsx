import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesSummary } from '@/types/admin/reports';
import { formatSummaryAmount } from '@/utils/functions/format-summary-amount/format-summary-amount';
import styles from './ProgramExpensesSummaryCard.module.scss';

interface ProgramExpensesSummaryCardProps {
    summary: ProgramExpensesSummary;
}

export const ProgramExpensesSummaryCard = ({ summary }: ProgramExpensesSummaryCardProps) => {
    return (
        <div className={styles['summary-card']}>
            <span className={styles['summary-title']}>{PROGRAM_EXPENSES_TEXT.SUMMARY_CARD.TITLE}</span>
            <div className={styles['summary-amounts']}>
                <span className={styles['summary-amount']}>
                    {formatSummaryAmount(summary.totalAmountUah)}{' '}
                    {FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.AMOUNT_SUFFIX_UAH}
                </span>
                <span className={styles['summary-amount']}>
                    {formatSummaryAmount(summary.totalAmountUsd)}{' '}
                    {FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.AMOUNT_SUFFIX_USD}
                </span>
            </div>
        </div>
    );
};
