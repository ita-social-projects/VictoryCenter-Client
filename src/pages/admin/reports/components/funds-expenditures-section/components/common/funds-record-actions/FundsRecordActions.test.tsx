import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FundsRecordActions } from './FundsRecordActions';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';

jest.mock('./FundsRecordActions.module.scss', () => ({
    'editing-actions': 'editing-actions',
    'add-expense-button': 'add-expense-button',
    'add-income-button': 'add-income-button',
    'action-button-disabled-by-row-edit': 'action-button-disabled-by-row-edit',
    'plus-icon': 'plus-icon',
}));

jest.mock('@/assets/icons/plus.svg', () => ({
    ReactComponent: ({ className }: { className?: string }) => <svg data-testid="plus-icon" className={className} />,
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({
        children,
        onClick,
        disabled,
        className,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
        className?: string;
    }) => (
        <button onClick={onClick} disabled={disabled} className={className}>
            {children}
        </button>
    ),
}));

describe('FundsRecordActions', () => {
    const onAddIncome = jest.fn();
    const onAddExpense = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render both action buttons', () => {
        render(<FundsRecordActions onAddIncome={onAddIncome} onAddExpense={onAddExpense} />);

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_EXPENSE)).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_INCOME)).toBeInTheDocument();
        expect(screen.getAllByTestId('plus-icon')).toHaveLength(2);
    });

    it('should call add handlers when buttons are clicked', () => {
        render(<FundsRecordActions onAddIncome={onAddIncome} onAddExpense={onAddExpense} />);

        fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_EXPENSE));
        fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_INCOME));

        expect(onAddExpense).toHaveBeenCalledTimes(1);
        expect(onAddIncome).toHaveBeenCalledTimes(1);
    });

    it('should disable buttons via own disabled flags', () => {
        render(
            <FundsRecordActions
                onAddIncome={onAddIncome}
                onAddExpense={onAddExpense}
                isAddIncomeDisabled={true}
                isAddExpenseDisabled={true}
            />,
        );

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_EXPENSE)).toBeDisabled();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_INCOME)).toBeDisabled();
    });

    it('should disable both buttons when controls are disabled', () => {
        render(<FundsRecordActions onAddIncome={onAddIncome} onAddExpense={onAddExpense} controlsDisabled={true} />);

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_EXPENSE)).toBeDisabled();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_INCOME)).toBeDisabled();
    });

    it('should render with custom testId and className', () => {
        render(
            <FundsRecordActions
                onAddIncome={onAddIncome}
                onAddExpense={onAddExpense}
                testId="empty-state-actions"
                className="custom-actions"
            />,
        );

        const wrapper = screen.getByTestId('empty-state-actions');
        expect(wrapper).toBeInTheDocument();
        expect(wrapper).toHaveClass('custom-actions');
    });
});
