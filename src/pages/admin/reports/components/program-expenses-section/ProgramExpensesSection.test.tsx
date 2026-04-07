import { ChangeEvent, ReactNode } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgramExpensesSection } from './ProgramExpensesSection';
import { PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesReadOnlyData } from '@/types/admin/reports';
import { ProgramExpensesApi } from '@/services/api/admin/reports/program-expenses-api';

const MOCK_PROGRAM_EXPENSES_DATA: ProgramExpensesReadOnlyData = {
    exchangeRate: '41.25',
    programs: [
        { id: 1, name: 'Program A' },
        { id: 2, name: 'Program B' },
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

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({}),
}));

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

jest.mock('@/components/common/select/Select', () => {
    const React = require('react');

    interface MockSelectProps<TValue> {
        value: TValue;
        onValueChange: (value: TValue) => void;
        children: ReactNode;
        placeholder?: string;
    }

    interface MockSelectOptionProps<TValue> {
        value: TValue;
        name: string;
    }

    const Option = <TValue,>(_props: MockSelectOptionProps<TValue>) => null;

    const Select = <TValue,>({ value, onValueChange, children, placeholder }: MockSelectProps<TValue>) => {
        const options = React.Children.toArray(children) as React.ReactElement<MockSelectOptionProps<TValue>>[];
        const normalizedValue = value === undefined ? '' : String(value);

        return (
            <select
                data-testid="program-select"
                aria-label={placeholder}
                value={normalizedValue}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    const nextValue = event.target.value === '' ? undefined : Number(event.target.value);
                    onValueChange(nextValue as TValue);
                }}
            >
                {options.map((option) => (
                    <option
                        key={String(option.props.value)}
                        value={option.props.value === undefined ? '' : String(option.props.value)}
                    >
                        {option.props.name}
                    </option>
                ))}
            </select>
        );
    };

    Select.Option = Option;

    return { Select };
});

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

    it('should pass fetch handler that calls ProgramExpensesApi.getReadOnlyData', async () => {
        mockGetReadOnlyData.mockResolvedValue(MOCK_PROGRAM_EXPENSES_DATA);

        render(<ProgramExpensesSection />);

        const useDataFetchProps = mockUseDataFetch.mock.calls[0][0] as {
            fetchHandler: (options?: unknown) => Promise<ProgramExpensesReadOnlyData>;
        };

        await useDataFetchProps.fetchHandler();
        await useDataFetchProps.fetchHandler({ test: true });

        expect(mockGetReadOnlyData).toHaveBeenCalledWith({}, {});
        expect(ProgramExpensesApi.getReadOnlyData).toBeDefined();
        expect(mockGetReadOnlyData).toHaveBeenCalledWith({}, { test: true });
    });
});
