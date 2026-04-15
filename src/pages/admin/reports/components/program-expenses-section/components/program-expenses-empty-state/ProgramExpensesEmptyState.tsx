import cn from 'classnames';
import { Button } from '@/components/admin/button/Button';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ReactComponent as NotFoundIcon } from '@/assets/icons/not-found.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import styles from './ProgramExpensesEmptyState.module.scss';

interface ProgramExpensesEmptyStateProps {
    colSpan: number;
    variant: 'filtered' | 'program-expenses';
}

export const ProgramExpensesEmptyState = ({ colSpan, variant }: ProgramExpensesEmptyStateProps) => {
    if (variant === 'program-expenses') {
        return (
            <tr className={styles['empty-row-program-expenses']}>
                <td className={styles['empty-cell-program-expenses']} colSpan={colSpan}>
                    <div className={cn(styles['empty-state'], styles['empty-state-program-expenses'])}>
                        <NotFoundIcon
                            aria-hidden="true"
                            className={cn(styles['empty-state-image'], styles['empty-state-image-program-expenses'])}
                            focusable="false"
                        />
                        <p className={styles['empty-state-title']}>{FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.TITLE}</p>
                        <p className={styles['empty-state-message']}>{PROGRAM_EXPENSES_TEXT.EMPTY_STATE.ADD_RECORD}</p>
                        <div className={styles['empty-state-actions']}>
                            <Button buttonStyle="primary" className={styles['add-program-expense-button']}>
                                <PlusIcon aria-hidden="true" className={styles['plus-icon']} focusable="false" />
                                {PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE}
                            </Button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr>
            <td className={styles['empty-cell']} colSpan={colSpan}>
                <div className={styles['empty-state']}>
                    <NotFoundIcon aria-hidden="true" className={styles['empty-state-image']} focusable="false" />
                    <p className={cn(styles['empty-state-message'], styles['empty-state-message-filtered'])}>
                        {FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.MESSAGE}
                    </p>
                </div>
            </td>
        </tr>
    );
};
