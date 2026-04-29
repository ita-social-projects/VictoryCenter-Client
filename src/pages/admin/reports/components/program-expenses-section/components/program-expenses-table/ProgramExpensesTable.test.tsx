import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgramExpensesTable } from './ProgramExpensesTable';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';

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
    IconButton: ({ 'aria-label': ariaLabel, onClick }: { 'aria-label': string; onClick?: () => void }) => (
        <button type="button" aria-label={ariaLabel} onClick={onClick}>
            {ariaLabel}
        </button>
    ),
}));

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

    const normalizeText = (value: string) => value.replaceAll('\u00A0', ' ').replaceAll(/\s+/g, ' ').trim();

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
        render(<ProgramExpensesTable records={records} hasAnyProgramExpenseRecords isEditing />);

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.ACTIONS)).toBeInTheDocument();
        expect(screen.getAllByRole('checkbox')).toHaveLength(3);
        expect(screen.getByRole('button', { name: 'Edit record 1' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Delete record 1' })).toBeEnabled();
    });

    it('should select all visible records from the header checkbox', () => {
        render(<ProgramExpensesTable records={records} hasAnyProgramExpenseRecords isEditing />);

        fireEvent.click(screen.getByRole('checkbox', { name: 'Select all program expense records' }));

        expect(screen.getByRole('checkbox', { name: 'Select record 1' })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: 'Select record 2' })).toBeChecked();
    });

    it('should toggle a single record checkbox in edit mode', () => {
        render(<ProgramExpensesTable records={records} hasAnyProgramExpenseRecords isEditing />);

        fireEvent.click(screen.getByRole('checkbox', { name: 'Select record 1' }));

        expect(screen.getByRole('checkbox', { name: 'Select record 1' })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: 'Select record 2' })).not.toBeChecked();
    });

    it('should call edit and delete callbacks from row action icons', () => {
        const onEditRecord = jest.fn();
        const onDeleteRecord = jest.fn();

        render(
            <ProgramExpensesTable
                records={records}
                hasAnyProgramExpenseRecords
                isEditing
                onEditRecord={onEditRecord}
                onDeleteRecord={onDeleteRecord}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Edit record 1' }));
        fireEvent.click(screen.getByRole('button', { name: 'Delete record 1' }));

        expect(onEditRecord).toHaveBeenCalledWith(records[0]);
        expect(onDeleteRecord).toHaveBeenCalledWith(records[0]);
    });

    it('should use edit-mode colSpan for empty state', () => {
        render(<ProgramExpensesTable records={[]} hasAnyProgramExpenseRecords={false} isEditing />);

        expectEmptyState('program-expenses', '7');
    });
});
