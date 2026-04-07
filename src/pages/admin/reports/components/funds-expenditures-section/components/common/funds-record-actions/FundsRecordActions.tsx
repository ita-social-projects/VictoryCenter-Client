import { Button } from '@/components/admin/button/Button';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import cn from 'classnames';
import styles from './FundsRecordActions.module.scss';

interface FundsRecordActionsProps {
    isAddIncomeDisabled?: boolean;
    isAddExpenseDisabled?: boolean;
    controlsDisabled?: boolean;
    onAddIncome?: () => void;
    onAddExpense?: () => void;
    className?: string;
    testId?: string;
}

export const FundsRecordActions = ({
    isAddIncomeDisabled = false,
    isAddExpenseDisabled = false,
    controlsDisabled = false,
    onAddIncome,
    onAddExpense,
    className,
    testId = 'editing-actions',
}: FundsRecordActionsProps) => {
    return (
        <div className={cn(styles['editing-actions'], className)} data-testid={testId}>
            <Button
                buttonStyle="primary"
                className={cn(styles['add-expense-button'], {
                    [styles['action-button-disabled-by-row-edit']]: controlsDisabled,
                })}
                onClick={onAddExpense}
                disabled={isAddExpenseDisabled || controlsDisabled}
            >
                <PlusIcon className={styles['plus-icon']} />
                {FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_EXPENSE}
            </Button>
            <Button
                buttonStyle="primary"
                className={cn(styles['add-income-button'], {
                    [styles['action-button-disabled-by-row-edit']]: controlsDisabled,
                })}
                onClick={onAddIncome}
                disabled={isAddIncomeDisabled || controlsDisabled}
            >
                <PlusIcon className={styles['plus-icon']} />
                {FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_INCOME}
            </Button>
        </div>
    );
};
