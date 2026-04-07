import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgramExpensesToolbar } from './ProgramExpensesToolbar';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';

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
            <div data-testid="program-expenses-select">
                <span>{placeholder}</span>
                <button type="button" data-testid="program-filter-all" onClick={() => onValueChange(undefined)}>
                    All
                </button>
                <button type="button" data-testid="program-filter-1" onClick={() => onValueChange(1)}>
                    Program 1
                </button>
            </div>
        );
    };

    MockSelect.Option = SelectOption;

    return { Select: MockSelect };
});

describe('ProgramExpensesToolbar', () => {
    const defaultProps = {
        programs: [
            { id: 1, name: 'Program 1' },
            { id: 2, name: 'Program 2' },
        ],
        selectedProgramId: undefined,
        exchangeRate: '42.15',
        onProgramChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render program filter placeholder', () => {
        render(<ProgramExpensesToolbar {...defaultProps} />);

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.PROGRAM)).toBeInTheDocument();
    });

    it('should render exchange rate label and value', () => {
        render(<ProgramExpensesToolbar {...defaultProps} />);

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL)).toBeInTheDocument();
        expect(screen.getByText('42.15')).toBeInTheDocument();
    });

    it('should render fallback value when exchange rate is null', () => {
        render(<ProgramExpensesToolbar {...defaultProps} exchangeRate={null} />);

        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should call onProgramChange when program is selected', () => {
        render(<ProgramExpensesToolbar {...defaultProps} />);

        fireEvent.click(screen.getByTestId('program-filter-1'));

        expect(defaultProps.onProgramChange).toHaveBeenCalledWith(1);
    });

    it('should call onProgramChange with undefined for all option', () => {
        render(<ProgramExpensesToolbar {...defaultProps} />);

        fireEvent.click(screen.getByTestId('program-filter-all'));

        expect(defaultProps.onProgramChange).toHaveBeenCalledWith(undefined);
    });
});
