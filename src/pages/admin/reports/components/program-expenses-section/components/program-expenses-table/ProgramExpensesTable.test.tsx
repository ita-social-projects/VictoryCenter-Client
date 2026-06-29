import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesTable, ProgramExpensesTableProps } from './ProgramExpensesTable';

jest.mock(
    '@/pages/admin/reports/components/program-expenses-section/components/program-expenses-empty-state/ProgramExpensesEmptyState',
    () => ({
        ProgramExpensesEmptyState: ({
            colSpan = 5,
            variant = 'filtered',
        }: {
            colSpan?: number;
            variant?: 'filtered' | 'program-expenses';
        }) => (
            <tr data-testid="program-expenses-empty-state" data-variant={variant}>
                <td colSpan={colSpan} data-testid="program-expenses-empty-state-cell" />
            </tr>
        ),
    }),
);

jest.mock('@/components/admin/icon-button/IconButton', () => ({
    IconButton: ({
        'aria-label': ariaLabel,
        onClick,
        disabled,
    }: {
        'aria-label': string;
        onClick?: () => void;
        disabled?: boolean;
    }) => (
        <button type="button" aria-label={ariaLabel} onClick={onClick} disabled={disabled}>
            {ariaLabel}
        </button>
    ),
}));

jest.mock('@/components/common/select/Select', () => {
    const React = require('react');

    const stringifyValueForTestId = (value: unknown): string => {
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';

        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean') return value.toString();

        return 'non-primitive';
    };

    const SelectOption = (_props: { value: unknown; name: string }) => null;

    const MockSelect = ({
        children,
        onValueChange,
        placeholder,
    }: {
        children: React.ReactNode;
        onValueChange: (value: unknown) => void;
        placeholder?: string;
    }) => {
        const options = React.Children.toArray(children).filter(Boolean) as Array<{
            props: { value: unknown; name: string };
        }>;

        return (
            <div data-testid={`select-${placeholder}`}>
                {options.map((option, index) => (
                    <button
                        key={`${option.props.name}-${index}`}
                        type="button"
                        data-testid={`select-option-${option.props.name}-${stringifyValueForTestId(option.props.value)}`}
                        onClick={() => onValueChange(option.props.value)}
                    >
                        {option.props.name}
                    </button>
                ))}
            </div>
        );
    };

    MockSelect.Option = SelectOption;

    return { Select: MockSelect };
});

const getEmptyState = () => screen.getByTestId('program-expenses-empty-state');
const getEmptyStateCell = () => screen.getByTestId('program-expenses-empty-state-cell');

const expectEmptyState = (variant: 'filtered' | 'program-expenses', colSpan = '5') => {
    const emptyState = getEmptyState();

    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveAttribute('data-variant', variant);
    expect(getEmptyStateCell()).toHaveAttribute('colspan', colSpan);
};

describe('ProgramExpensesTable', () => {
    const records = [
        {
            id: 1,
            programId: 100,
            programName: 'Program A',
            type: 'expense' as const,
            reportingYear: '2025',
            amountUah: '7 265',
            amountUsd: '4 200.5',
        },
        {
            id: 2,
            programId: 101,
            programName: 'Program B',
            type: 'expense' as const,
            reportingYear: '2024',
            amountUah: '3000',
            amountUsd: '1250',
        },
    ];

    const mockPrograms = [
        { id: 100, name: 'Program A' },
        { id: 101, name: 'Program B' },
        { id: 102, name: 'Program C' },
    ];

    const normalizeText = (value: string) => value.replaceAll('\u00A0', ' ').replaceAll(/\s+/g, ' ').trim();

    const renderTable = (props: Partial<ProgramExpensesTableProps> = {}) => {
        return render(
            <ProgramExpensesTable
                records={records}
                programs={mockPrograms}
                hasAnyProgramExpenseRecords
                isEditing
                {...props}
            />,
        );
    };

    it('should render table headers', () => {
        render(<ProgramExpensesTable records={records} hasAnyProgramExpenseRecords />);

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.REPORTING_YEAR)).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.TYPE)).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.PROGRAM)).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_UAH)).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_USD)).toBeInTheDocument();
    });

    it('should render formatted record values', () => {
        const { container } = render(<ProgramExpensesTable records={records} hasAnyProgramExpenseRecords />);
        const table = screen.getByRole('table');

        expect(within(table).getByText('2025')).toBeInTheDocument();
        expect(within(table).getByText('Program A')).toBeInTheDocument();
        expect(within(table).getAllByText(PROGRAM_EXPENSES_TEXT.TABLE.TYPE_LABEL)).toHaveLength(2);

        const normalizedText = normalizeText(container.textContent ?? '');
        expect(normalizedText).toContain('7 265');
        expect(normalizedText).toContain('4 200');
    });

    it('should render empty state when records are missing', () => {
        render(<ProgramExpensesTable records={[]} hasAnyProgramExpenseRecords />);

        expectEmptyState('filtered');
    });

    it('should render program expenses empty state when there are no records in system', () => {
        render(<ProgramExpensesTable records={[]} hasAnyProgramExpenseRecords={false} />);

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.PROGRAM)).toBeInTheDocument();
        expectEmptyState('program-expenses');
    });

    it('should render checkboxes and action column in edit mode', () => {
        renderTable();

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.ACTIONS)).toBeInTheDocument();
        expect(screen.getAllByRole('checkbox')).toHaveLength(3);
        expect(screen.getByRole('button', { name: 'Edit record 1' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Delete record 1' })).toBeEnabled();
    });

    it('should call onSelectAllToggle when header checkbox is clicked', () => {
        const onSelectAllToggle = jest.fn();

        renderTable({ onSelectAllToggle });

        fireEvent.click(screen.getByRole('checkbox', { name: 'Select all program expense records' }));

        expect(onSelectAllToggle).toHaveBeenCalledWith(true);
    });

    it('should call onToggleRecordSelection when row checkbox is clicked', () => {
        const onToggleRecordSelection = jest.fn();

        renderTable({ onToggleRecordSelection });

        fireEvent.click(screen.getByRole('checkbox', { name: 'Select record 1' }));

        expect(onToggleRecordSelection).toHaveBeenCalledWith(1);
    });

    it('should start inline edit and show accept/cancel buttons, disabling other checkboxes and buttons', () => {
        const onDeleteRecord = jest.fn();

        renderTable({ onDeleteRecord });

        fireEvent.click(screen.getByRole('button', { name: 'Edit record 1' }));

        expect(screen.getByLabelText('Accept record changes')).toBeInTheDocument();
        expect(screen.getByLabelText('Cancel record editing')).toBeInTheDocument();

        // Checkboxes and other edit buttons should be disabled
        expect(screen.getByRole('checkbox', { name: 'Select record 1' })).toBeDisabled();
        expect(screen.getByRole('checkbox', { name: 'Select record 2' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Edit record 2' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Delete record 2' })).toBeDisabled();
    });

    it('should call onDeleteRecord when delete button is clicked', () => {
        const onDeleteRecord = jest.fn();

        renderTable({ onDeleteRecord });

        fireEvent.click(screen.getByRole('button', { name: 'Delete record 1' }));

        expect(onDeleteRecord).toHaveBeenCalledWith(records[0]);
    });

    it('should enable accept button when category is changed and call onRecordSave upon clicking accept', async () => {
        const onRecordSave = jest.fn().mockResolvedValue(true);

        renderTable({ onRecordSave });

        fireEvent.click(screen.getByRole('button', { name: 'Edit record 1' }));

        const acceptButton = screen.getByLabelText('Accept record changes');
        // Originally selected program is 100, so accept should be disabled as no change yet
        expect(acceptButton).toBeDisabled();

        // Select Program C (id: 102)
        fireEvent.click(screen.getByTestId('select-option-Program C-102'));

        expect(acceptButton).not.toBeDisabled();

        fireEvent.click(acceptButton);

        await waitFor(() => {
            expect(onRecordSave).toHaveBeenCalledWith(1, 102, '2025', '7 265', '4 200.5');
        });
    });

    it('should use edit-mode colSpan for empty state', () => {
        render(<ProgramExpensesTable records={[]} hasAnyProgramExpenseRecords={false} isEditing />);

        expectEmptyState('program-expenses', '7');
    });

    it('should show selection bar with count and delete button when records are selected', () => {
        const onOpenBulkDelete = jest.fn();

        renderTable({ selectedRecordIds: [1], onOpenBulkDelete });

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.getSelectedLabel(1, 2))).toBeInTheDocument();

        fireEvent.click(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON));

        expect(onOpenBulkDelete).toHaveBeenCalled();
    });
});
