import { render, screen, fireEvent } from '@testing-library/react';
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

jest.mock(
    '@/pages/admin/reports/components/funds-expenditures-section/components/common/funds-record-actions/FundsRecordActions',
    () => ({
        FundsRecordActions: ({
            controlsDisabled,
            isAddIncomeDisabled,
            isAddExpenseDisabled,
            onAddIncome,
            onAddExpense,
            testId,
        }: {
            controlsDisabled?: boolean;
            isAddIncomeDisabled?: boolean;
            isAddExpenseDisabled?: boolean;
            onAddIncome?: () => void;
            onAddExpense?: () => void;
            testId?: string;
        }) => (
            <div
                data-testid={testId ?? 'editing-actions'}
                data-controls-disabled={String(Boolean(controlsDisabled))}
                data-add-income-disabled={String(Boolean(isAddIncomeDisabled))}
                data-add-expense-disabled={String(Boolean(isAddExpenseDisabled))}
            >
                <button type="button" data-testid="toolbar-trigger-add-expense" onClick={onAddExpense}>
                    add-expense
                </button>
                <button type="button" data-testid="toolbar-trigger-add-income" onClick={onAddIncome}>
                    add-income
                </button>
            </div>
        ),
    }),
);

jest.mock('@/components/common/select/Select', () => {
    const SelectOption = (_props: { value: unknown; name: string }) => null;

    const MockSelect = ({
        onValueChange,
        placeholder,
    }: {
        onValueChange: (value: unknown) => void;
        placeholder?: string;
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
    { id: 1, name: 'Грантові кошти', type: 'income' },
    { id: 2, name: 'Благодійні внески', type: 'income' },
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

    it('should call onCategoryChange when category filter "Всі" is selected', () => {
        render(<FundsExpendituresToolbar {...defaultProps} />);

        const allBtn = screen.getByTestId(`select-${FUNDS_EXPENDITURES_TEXT.FILTER.CATEGORY_PLACEHOLDER}-all`);
        fireEvent.click(allBtn);

        expect(onCategoryChange).toHaveBeenCalledWith(undefined);
    });

    it('should not call onTypeChange when controls are disabled', () => {
        render(<FundsExpendituresToolbar {...defaultProps} controlsDisabled={true} />);

        const incomeBtn = screen.getByTestId(`select-${FUNDS_EXPENDITURES_TEXT.FILTER.TYPE_PLACEHOLDER}-income`);
        fireEvent.click(incomeBtn);

        expect(onTypeChange).not.toHaveBeenCalled();
    });

    it('should not call onCategoryChange when controls are disabled', () => {
        render(<FundsExpendituresToolbar {...defaultProps} controlsDisabled={true} />);

        const allBtn = screen.getByTestId(`select-${FUNDS_EXPENDITURES_TEXT.FILTER.CATEGORY_PLACEHOLDER}-all`);
        fireEvent.click(allBtn);

        expect(onCategoryChange).not.toHaveBeenCalled();
    });

    describe('edit mode', () => {
        it('should render FundsRecordActions when editing', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} />);
            expect(screen.getByTestId('editing-actions')).toBeInTheDocument();
        });

        it('should not render FundsRecordActions when not editing', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={false} />);
            expect(screen.queryByTestId('editing-actions')).not.toBeInTheDocument();
        });

        it('should show exchange rate input when editing', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} />);
            expect(screen.getByTestId('exchange-rate-input')).toBeInTheDocument();
        });

        it('should pass add-income disabled flag to FundsRecordActions', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} isAddIncomeDisabled={true} />);
            const actions = screen.getByTestId('editing-actions');
            expect(actions).toHaveAttribute('data-add-income-disabled', 'true');
        });

        it('should pass add-expense disabled flag to FundsRecordActions', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} isAddExpenseDisabled={true} />);
            const actions = screen.getByTestId('editing-actions');
            expect(actions).toHaveAttribute('data-add-expense-disabled', 'true');
        });

        it('should pass controlsDisabled flag to FundsRecordActions', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} controlsDisabled={true} />);
            const actions = screen.getByTestId('editing-actions');
            expect(actions).toHaveAttribute('data-controls-disabled', 'true');
        });

        it('should call onAddIncome through FundsRecordActions', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} />);
            fireEvent.click(screen.getByTestId('toolbar-trigger-add-income'));
            expect(onAddIncome).toHaveBeenCalledTimes(1);
        });

        it('should call onAddExpense through FundsRecordActions', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} />);
            fireEvent.click(screen.getByTestId('toolbar-trigger-add-expense'));
            expect(onAddExpense).toHaveBeenCalledTimes(1);
        });

        it('should call onExchangeRateChange when exchange rate input changes', () => {
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} />);
            const input = screen.getByTestId('exchange-rate-input');
            fireEvent.change(input, { target: { value: '50.00' } });
            expect(onExchangeRateChange).toHaveBeenCalledWith('50.00');
        });

        it('should show exchange rate validation error when provided', () => {
            const errorMessage = FUNDS_EXPENDITURES_TEXT.VALIDATION.EXCHANGE_RATE_ONLY_NUMERIC;
            render(<FundsExpendituresToolbar {...defaultProps} isEditing={true} exchangeRateError={errorMessage} />);

            expect(screen.getByTestId('exchange-rate-error')).toHaveTextContent(errorMessage);
        });
    });
});
