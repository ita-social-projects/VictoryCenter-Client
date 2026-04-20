import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgramExpensesToolbar } from './ProgramExpensesToolbar';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesProgram } from '@/types/admin/reports';

jest.mock('@/components/admin/multi-select-input/MultiSelectInput', () => ({
    MultiSelectInput: ({
        options,
        value,
        getOptionId,
        getOptionName,
        getDisplayValue,
        isOptionSelected,
        onChange,
        placeholder,
    }: {
        options: ProgramExpensesProgram[];
        value: ProgramExpensesProgram[];
        getOptionId: (value: ProgramExpensesProgram) => number;
        getOptionName: (value: ProgramExpensesProgram) => string;
        getDisplayValue: (value: ProgramExpensesProgram[]) => string;
        isOptionSelected: (option: ProgramExpensesProgram, value: ProgramExpensesProgram[]) => boolean;
        onChange: (value: ProgramExpensesProgram[]) => void;
        placeholder?: string;
    }) => {
        return (
            <div data-testid="program-expenses-select">
                <span>{placeholder}</span>
                <span data-testid="program-filter-display">{getDisplayValue(value)}</span>
                {options.map((option) => (
                    <span
                        key={getOptionId(option)}
                        data-testid={`program-filter-option-${getOptionId(option)}`}
                        data-selected={String(isOptionSelected(option, value))}
                    >
                        {getOptionName(option)}
                    </span>
                ))}
                <button
                    type="button"
                    data-testid="program-filter-all"
                    onClick={() => onChange([options.find((option) => option.id === 0)!])}
                >
                    All
                </button>
                <button
                    type="button"
                    data-testid="program-filter-1"
                    onClick={() => onChange([options.find((option) => option.id === 1)!])}
                >
                    Program 1
                </button>
                <button
                    type="button"
                    data-testid="program-filter-1-and-2"
                    onClick={() => onChange(options.filter((option) => option.id === 1 || option.id === 2))}
                >
                    Program 1 and 2
                </button>
                <button type="button" data-testid="program-filter-clear" onClick={() => onChange([])}>
                    Clear
                </button>
            </div>
        );
    },
}));

describe('ProgramExpensesToolbar', () => {
    const defaultProps = {
        programs: [
            { id: 1, name: 'Program 1' },
            { id: 2, name: 'Program 2' },
        ],
        selectedProgramIds: [],
        exchangeRate: '42.15',
        onProgramChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render program filter placeholder', () => {
        render(<ProgramExpensesToolbar {...defaultProps} />);

        expect(screen.getAllByText(PROGRAM_EXPENSES_TEXT.FILTER.PROGRAMS_PLACEHOLDER)).not.toHaveLength(0);
        expect(screen.getByTestId('program-filter-display')).toHaveTextContent(
            PROGRAM_EXPENSES_TEXT.FILTER.PROGRAMS_PLACEHOLDER,
        );
    });

    it('should render all option as selected when no programs are selected', () => {
        render(<ProgramExpensesToolbar {...defaultProps} />);

        expect(screen.getByTestId('program-filter-option-0')).toHaveTextContent(
            PROGRAM_EXPENSES_TEXT.FILTER.ALL_OPTION,
        );
        expect(screen.getByTestId('program-filter-option-0')).toHaveAttribute('data-selected', 'true');
        expect(screen.getByTestId('program-filter-option-1')).toHaveAttribute('data-selected', 'false');
    });

    it('should render selected program name as display value', () => {
        render(<ProgramExpensesToolbar {...defaultProps} selectedProgramIds={[1]} />);

        expect(screen.getByTestId('program-filter-display')).toHaveTextContent('Program 1');
        expect(screen.getByTestId('program-filter-option-0')).toHaveAttribute('data-selected', 'false');
        expect(screen.getByTestId('program-filter-option-1')).toHaveAttribute('data-selected', 'true');
    });

    it('should render selected programs counter as display value', () => {
        render(<ProgramExpensesToolbar {...defaultProps} selectedProgramIds={[1, 2]} />);

        expect(screen.getByTestId('program-filter-display')).toHaveTextContent(
            PROGRAM_EXPENSES_TEXT.FILTER.getProgramsCounterLabel(2),
        );
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

        expect(defaultProps.onProgramChange).toHaveBeenCalledWith([1]);
    });

    it('should call onProgramChange with multiple program ids when multiple programs are selected', () => {
        render(<ProgramExpensesToolbar {...defaultProps} />);

        fireEvent.click(screen.getByTestId('program-filter-1-and-2'));

        expect(defaultProps.onProgramChange).toHaveBeenCalledWith([1, 2]);
    });

    it('should call onProgramChange with empty array for all option', () => {
        render(<ProgramExpensesToolbar {...defaultProps} />);

        fireEvent.click(screen.getByTestId('program-filter-all'));

        expect(defaultProps.onProgramChange).toHaveBeenCalledWith([]);
    });

    it('should call onProgramChange with empty array when selection is cleared', () => {
        render(<ProgramExpensesToolbar {...defaultProps} />);

        fireEvent.click(screen.getByTestId('program-filter-clear'));

        expect(defaultProps.onProgramChange).toHaveBeenCalledWith([]);
    });
});
