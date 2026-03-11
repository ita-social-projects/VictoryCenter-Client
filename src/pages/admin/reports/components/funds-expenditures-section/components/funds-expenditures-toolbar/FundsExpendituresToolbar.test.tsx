import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FundsExpendituresToolbar, TypeFilterValue, CategoryFilterValue } from './FundsExpendituresToolbar';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { ReportFundsExpendituresCategory } from '@/types/admin/reports';

jest.mock('./FundsExpendituresToolbar.module.scss', () => ({
    toolbar: 'toolbar',
    'toolbar-row': 'toolbar-row',
    'toolbar-right': 'toolbar-right',
    filters: 'filters',
    exchangeRate: 'exchangeRate',
    exchangeRateLabel: 'exchangeRateLabel',
    exchangeRateValue: 'exchangeRateValue',
    'exchange-rate-input': 'exchange-rate-input',
    filterSelect: 'filterSelect',
    filterOption: 'filterOption',
    'editing-actions': 'editing-actions',
    'add-income-button': 'add-income-button',
    'add-expense-button': 'add-expense-button',
    'cancel-button': 'cancel-button',
    'publish-button': 'publish-button',
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

jest.mock('@/components/common/select/Select', () => {
    const SelectOption = (_props: { value: unknown; name: string }) => null;

    const MockSelect = ({
        onValueChange,
        placeholder,
    }: {
        children?: React.ReactNode;
        onValueChange: (value: unknown) => void;
        placeholder?: string;
        value?: unknown;
    }) => {
        return (
            <div data-testid={`select-${placeholder}`}>
                <button
                    type="button"
                    data-testid={`select-${placeholder}-income`}
                    onClick={() => onValueChange('income')}
                >
                    Надходження
                </button>
                <button
                    type="button"
                    data-testid={`select-${placeholder}-expense`}
                    onClick={() => onValueChange('expense')}
                >
                    Витрати
                </button>
                <button
                    type="button"
                    data-testid={`select-${placeholder}-all`}
                    onClick={() => onValueChange(undefined)}
                >
                    Всі
                </button>
            </div>
        );
    };

    MockSelect.Option = SelectOption;
    return { Select: MockSelect };
});

const MOCK_CATEGORIES: ReportFundsExpendituresCategory[] = [
    { id: 1, name: 'Грантові кошти' },
    { id: 2, name: 'Благодійні внески' },
];

describe('FundsExpendituresToolbar', () => {
    const onTypeChange = jest.fn();
    const onCategoryChange = jest.fn();
    const onAddIncome = jest.fn();
    const onAddExpense = jest.fn();
    const onExchangeRateChange = jest.fn();

    const defaultProps = {
        categories: MOCK_CATEGORIES,
        selectedType: undefined as TypeFilterValue,
        selectedCategoryId: undefined as CategoryFilterValue,
        exchangeRate: '42.18',
        isEditing: false,
        isAddIncomeDisabled: false,
        isAddExpenseDisabled: false,
        onTypeChange,
        onCategoryChange,
        onExchangeRateChange,
        onAddIncome,
        onAddExpense,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render type filter dropdown', () => {
        render(<FundsExpendituresToolbar {...defaultProps} />);
        expect(screen.getByTestId(`select-${FUNDS_EXPENDITURES_TEXT.FILTER.TYPE_PLACEHOLDER}`)).toBeInTheDocument();
    });

    it('should render category filter dropdown', () => {
        render(<FundsExpendituresToolbar {...defaultProps} />);
        expect(screen.getByTestId(`select-${FUNDS_EXPENDITURES_TEXT.FILTER.CATEGORY_PLACEHOLDER}`)).toBeInTheDocument();
    });

    it('should display exchange rate label', () => {
        render(<FundsExpendituresToolbar {...defaultProps} />);
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL)).toBeInTheDocument();
    });

    it('should display the exchange rate value', () => {
        render(<FundsExpendituresToolbar {...defaultProps} />);
        expect(screen.getByText('42.18')).toBeInTheDocument();
    });

    it('should not display exchange rate section when exchangeRate is null', () => {
        render(<FundsExpendituresToolbar {...defaultProps} exchangeRate={null} />);
        expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL)).not.toBeInTheDocument();
    });

    it('should call onTypeChange when type filter income is selected', () => {
        render(<FundsExpendituresToolbar {...defaultProps} />);
        const incomeBtn = screen.getByTestId(`select-${FUNDS_EXPENDITURES_TEXT.FILTER.TYPE_PLACEHOLDER}-income`);
        fireEvent.click(incomeBtn);
        expect(onTypeChange).toHaveBeenCalledWith('income');
    });

    it('should call onTypeChange with undefined when "Всі" is selected', () => {
        render(<FundsExpendituresToolbar {...defaultProps} />);
        const allBtn = screen.getByTestId(`select-${FUNDS_EXPENDITURES_TEXT.FILTER.TYPE_PLACEHOLDER}-all`);
        fireEvent.click(allBtn);
        expect(onTypeChange).toHaveBeenCalledWith(undefined);
    });

    describe('edit mode', () => {
        it('should show Add Income button when editing', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} />);
            const actions = screen.getByTestId('editing-actions');
            expect(within(actions).getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_INCOME)).toBeInTheDocument();
        });

        it('should show Add Expense button when editing', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} />);
            const actions = screen.getByTestId('editing-actions');
            expect(within(actions).getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_EXPENSE)).toBeInTheDocument();
        });

        it('should show exchange rate input when editing', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} />);
            expect(screen.getByTestId('exchange-rate-input')).toBeInTheDocument();
        });

        it('should disable Add Income button when isAddIncomeDisabled is true', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} isAddIncomeDisabled={true} />);
            const actions = screen.getByTestId('editing-actions');
            expect(within(actions).getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_INCOME)).toBeDisabled();
        });

        it('should disable Add Expense button when isAddExpenseDisabled is true', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} isAddExpenseDisabled={true} />);
            const actions = screen.getByTestId('editing-actions');
            expect(within(actions).getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_EXPENSE)).toBeDisabled();
        });

        it('should call onExchangeRateChange when exchange rate input changes', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} />);
            const input = screen.getByTestId('exchange-rate-input');
            fireEvent.change(input, { target: { value: '50.00' } });
            expect(onExchangeRateChange).toHaveBeenCalledWith('50.00');
        });
    });
});
