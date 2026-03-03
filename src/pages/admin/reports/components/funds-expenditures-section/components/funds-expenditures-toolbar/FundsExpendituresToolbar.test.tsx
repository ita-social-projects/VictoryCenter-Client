import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FundsExpendituresToolbar, TypeFilterValue, CategoryFilterValue } from './FundsExpendituresToolbar';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { ReportFundsExpendituresCategory } from '@/types/admin/reports';

jest.mock('./FundsExpendituresToolbar.module.scss', () => ({
    toolbar: 'toolbar',
    filters: 'filters',
    exchangeRate: 'exchangeRate',
    exchangeRateLabel: 'exchangeRateLabel',
    exchangeRateValue: 'exchangeRateValue',
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

    const defaultProps = {
        categories: MOCK_CATEGORIES,
        selectedType: undefined as TypeFilterValue,
        selectedCategoryId: undefined as CategoryFilterValue,
        exchangeRate: '42.18',
        onTypeChange,
        onCategoryChange,
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
});
