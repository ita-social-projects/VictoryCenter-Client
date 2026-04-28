import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgramExpensesSection } from './ProgramExpensesSection';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesReadOnlyData } from '@/types/admin/reports';
import { ProgramExpensesApi } from '@/services/api/admin/reports/program-expenses-api';

const MOCK_PROGRAM_EXPENSES_DATA: ProgramExpensesReadOnlyData = {
    exchangeRate: '41.25',
    programs: [
        { id: 1, name: 'Program A' },
        { id: 2, name: 'Program B' },
        { id: 3, name: 'Program C' },
    ],
    summary: {
        totalAmountUah: 125000,
        totalAmountUsd: 3000,
    },
    records: [
        {
            id: 1,
            programId: 1,
            programName: 'Program A',
            type: 'expense',
            reportingYear: '2025',
            amountUah: '50000',
            amountUsd: '1200',
        },
        {
            id: 2,
            programId: 1,
            programName: 'Program A',
            type: 'expense',
            reportingYear: '2024',
            amountUah: '25000',
            amountUsd: '600',
        },
        {
            id: 3,
            programId: 2,
            programName: 'Program B',
            type: 'expense',
            reportingYear: '2025',
            amountUah: '50000',
            amountUsd: '1200',
        },
    ],
};

const EMPTY_PROGRAM_EXPENSES_DATA: ProgramExpensesReadOnlyData = {
    exchangeRate: null,
    programs: [],
    summary: {
        totalAmountUah: 0,
        totalAmountUsd: 0,
    },
    records: [],
};

const mockGetReadOnlyData = jest.fn();
jest.mock('@/services/api/admin/reports/program-expenses-api', () => ({
    ProgramExpensesApi: {
        getReadOnlyData: (...args: unknown[]) => mockGetReadOnlyData(...args),
    },
}));

let mockUseDataFetchResult = {
    data: MOCK_PROGRAM_EXPENSES_DATA,
    isLoading: false,
};

const mockUseDataFetch = jest.fn();
jest.mock('@/hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: (props: unknown) => mockUseDataFetch(props),
}));

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: ({ size }: { size?: number }) => <div data-testid="inline-loader">loader-{size ?? 2}</div>,
}));

jest.mock('@/assets/icons/not-found.svg', () => ({
    ReactComponent: () => <svg data-testid="not-found-icon" />,
}));

jest.mock('@/assets/icons/plus.svg', () => ({
    ReactComponent: () => <svg data-testid="plus-icon" />,
}));

jest.mock('@/components/admin/multi-select-input/MultiSelectInput', () => ({
    MultiSelectInput: ({
        options,
        onChange,
        placeholder,
    }: {
        options: { id: number; name: string }[];
        onChange: (value: { id: number; name: string }[]) => void;
        placeholder?: string;
    }) => {
        const filteredOptions = options.filter((option) => option.id !== 0);

        return (
            <div>
                <select
                    data-testid="program-select"
                    aria-label={placeholder}
                    defaultValue=""
                    onChange={(event) => {
                        const selectedOption = options.find((option) => option.id === Number(event.target.value));
                        onChange(selectedOption ? [selectedOption] : []);
                    }}
                >
                    <option value="">{placeholder}</option>
                    {filteredOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    data-testid="program-select-first-two"
                    onClick={() => onChange(options.filter((option) => option.id === 1 || option.id === 2))}
                >
                    First two programs
                </button>
                <button
                    type="button"
                    data-testid="program-select-no-records"
                    onClick={() => onChange([options.find((option) => option.id === 3)!])}
                >
                    Program without records
                </button>
                <button type="button" data-testid="program-select-clear" onClick={() => onChange([])}>
                    Clear programs
                </button>
            </div>
        );
    },
}));

describe('ProgramExpensesSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseDataFetchResult = {
            data: MOCK_PROGRAM_EXPENSES_DATA,
            isLoading: false,
        };
        mockUseDataFetch.mockImplementation(() => mockUseDataFetchResult);
    });

    it('should render loader during initial loading', () => {
        mockUseDataFetchResult = {
            data: {
                exchangeRate: null,
                programs: [],
                summary: {
                    totalAmountUah: 0,
                    totalAmountUsd: 0,
                },
                records: [],
            },
            isLoading: true,
        };

        render(<ProgramExpensesSection />);

        expect(screen.getByTestId('inline-loader')).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('should render summary, toolbar and all records by default', () => {
        render(<ProgramExpensesSection />);

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.SUMMARY_CARD.TITLE)).toBeInTheDocument();
        expect(screen.getByText('41.25')).toBeInTheDocument();

        const table = screen.getByRole('table');
        const rows = within(table).getAllByRole('row');

        expect(rows).toHaveLength(4);
        expect(within(table).getAllByText('Program A')).toHaveLength(2);
        expect(within(table).getByText('Program B')).toBeInTheDocument();
    });

    it('should filter table records by selected program', () => {
        render(<ProgramExpensesSection />);

        fireEvent.change(screen.getByTestId('program-select'), {
            target: { value: '2' },
        });

        const table = screen.getByRole('table');
        const rows = within(table).getAllByRole('row');

        expect(rows).toHaveLength(2);
        expect(within(table).getByText('Program B')).toBeInTheDocument();
        expect(within(table).queryByText('2024')).not.toBeInTheDocument();
    });

    it('should filter table records by multiple selected programs', () => {
        render(<ProgramExpensesSection />);

        fireEvent.click(screen.getByTestId('program-select-first-two'));

        const table = screen.getByRole('table');
        const rows = within(table).getAllByRole('row');

        expect(rows).toHaveLength(4);
        expect(within(table).getAllByText('Program A')).toHaveLength(2);
        expect(within(table).getByText('Program B')).toBeInTheDocument();
        expect(within(table).queryByText('Program C')).not.toBeInTheDocument();
    });

    it('should restore all table records when selected programs are cleared', () => {
        render(<ProgramExpensesSection />);

        fireEvent.change(screen.getByTestId('program-select'), {
            target: { value: '2' },
        });
        fireEvent.click(screen.getByTestId('program-select-clear'));

        const table = screen.getByRole('table');
        const rows = within(table).getAllByRole('row');

        expect(rows).toHaveLength(4);
        expect(within(table).getAllByText('Program A')).toHaveLength(2);
        expect(within(table).getByText('Program B')).toBeInTheDocument();
    });

    it('should render filtered empty state when selected program has no matching records', () => {
        render(<ProgramExpensesSection />);

        fireEvent.click(screen.getByTestId('program-select-no-records'));

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.MESSAGE)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE })).toBeNull();
    });

    it('should render program expenses empty state when records are missing', () => {
        mockUseDataFetchResult = {
            data: EMPTY_PROGRAM_EXPENSES_DATA,
            isLoading: false,
        };

        render(<ProgramExpensesSection />);

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.EMPTY_STATE.ADD_RECORD)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE })).toBeEnabled();
    });

    it('should pass fetch handler that calls ProgramExpensesApi.getReadOnlyData', async () => {
        mockGetReadOnlyData.mockResolvedValue(MOCK_PROGRAM_EXPENSES_DATA);

        render(<ProgramExpensesSection />);

        const useDataFetchProps = mockUseDataFetch.mock.calls[0][0] as {
            fetchHandler: (options?: unknown) => Promise<ProgramExpensesReadOnlyData>;
        };

        await useDataFetchProps.fetchHandler();
        await useDataFetchProps.fetchHandler({ test: true });

        expect(mockGetReadOnlyData).toHaveBeenCalledWith({});
        expect(ProgramExpensesApi.getReadOnlyData).toBeDefined();
        expect(mockGetReadOnlyData).toHaveBeenCalledWith({ test: true });
    });
});
