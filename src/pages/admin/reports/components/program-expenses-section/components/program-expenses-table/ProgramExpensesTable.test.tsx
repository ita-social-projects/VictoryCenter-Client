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

jest.mock(
    '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema',
    () => ({
        normalizeFundsExpendituresAmountInput: (value: string) => value.trim(),
        validateFundsExpendituresAmount: (value: string) =>
            value === 'invalid' ? 'Invalid amount' : undefined,
    }),
);

jest.mock('@/utils/functions/update-funds-amounts/update-funds-amounts', () => ({
    updateFundsAmounts:
        (field: 'amountUah' | 'amountUsd', value: string) =>
            (state: {
                amountUah: string;
                amountUsd: string;
                errors: Record<string, string | undefined>;
            }) => ({
                amountUah: field === 'amountUah' ? value : state.amountUah,
                amountUsd: field === 'amountUsd' ? value : state.amountUsd,
                errors: { amountUah: undefined, amountUsd: undefined },
            }),
}));

jest.mock('@/utils/functions/validate-usd-amount-mismatch/validate-usd-amount-mismatch', () => ({
    isUsdAmountMismatch: jest.fn(() => false),
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

    const mockPrograms = [
        { id: 100, name: 'Program A' },
        { id: 101, name: 'Program B' },
        { id: 102, name: 'Program C' },
    ];

    const normalizeText = (value: string) =>
        value.replaceAll('\u00A0', ' ').replaceAll(/\s+/g, ' ').trim();

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

        expectEmptyState('filtered', '4');
    });

    it('should render program expenses empty state when there are no records in system', () => {
        render(<ProgramExpensesTable records={[]} hasAnyProgramExpenseRecords={false} />);

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.queryByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.PROGRAM)).not.toBeInTheDocument();
        expectEmptyState('program-expenses', '4');
    });

    it('should use edit-mode colSpan for empty state', () => {
        render(<ProgramExpensesTable records={[]} hasAnyProgramExpenseRecords={false} isEditing />);

        expectEmptyState('program-expenses', '5');
    });

    it('should not render checkbox and program columns in empty edit mode', () => {
        render(<ProgramExpensesTable records={[]} hasAnyProgramExpenseRecords={false} isEditing />);

        expect(screen.queryByLabelText('Select all program expense records')).not.toBeInTheDocument();
        expect(screen.queryByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.PROGRAM)).not.toBeInTheDocument();
    });

    it('should render checkbox and program columns when records exist', () => {
        renderTable();

        expect(screen.getByLabelText('Select all program expense records')).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.PROGRAM)).toBeInTheDocument();
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

        expect(screen.getByLabelText('Accept record 1')).toBeInTheDocument();
        expect(screen.getByLabelText('Close edit for record 1')).toBeInTheDocument();

        expect(screen.getByRole('checkbox', { name: 'Select record 1' })).toBeDisabled();
        expect(screen.getByRole('checkbox', { name: 'Select record 2' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Edit record 2' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Delete record 2' })).toBeDisabled();
    });

    it('should enable accept button when category is changed and call onRecordSave upon clicking accept', async () => {
        const onRecordSave = jest.fn().mockResolvedValue(true);

        renderTable({ onRecordSave });

        fireEvent.click(screen.getByRole('button', { name: 'Edit record 1' }));

        const acceptButton = screen.getByLabelText('Accept record 1');

        expect(acceptButton).toBeDisabled();

        fireEvent.click(screen.getByTestId('select-option-Program C-102'));

        expect(acceptButton).not.toBeDisabled();

        fireEvent.click(acceptButton);

        await waitFor(() => {
            expect(onRecordSave).toHaveBeenCalledWith(1, 102, '2025', '7 265', '4 200.5');
        });
    });

    it('should show selection bar with count and delete button when records are selected', () => {
        const onOpenBulkDelete = jest.fn();

        renderTable({ selectedRecordIds: [1], onOpenBulkDelete });

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.getSelectedLabel(1, 2))).toBeInTheDocument();

        fireEvent.click(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON));

        expect(onOpenBulkDelete).toHaveBeenCalled();
    });

    it('should set header checkbox indeterminate state when some but not all records are selected', () => {
        renderTable({ selectedRecordIds: [1] });

        const headerCheckbox = screen.getByRole('checkbox', {
            name: 'Select all program expense records',
        }) as HTMLInputElement;

        expect(headerCheckbox.indeterminate).toBe(true);
    });

    it('should call onDeleteRecord when delete icon is clicked', () => {
        const onDeleteRecord = jest.fn();

        renderTable({ onDeleteRecord });

        fireEvent.click(screen.getByRole('button', { name: 'Delete record 1' }));

        expect(onDeleteRecord).toHaveBeenCalledWith(records[0]);
    });

    it('should enter row edit mode with amount inputs and accept/close buttons when edit icon is clicked', () => {
        const onRowEditModeChange = jest.fn();

        renderTable({ onRowEditModeChange });

        fireEvent.click(screen.getByRole('button', { name: 'Edit record 1' }));

        expect(onRowEditModeChange).toHaveBeenCalledWith(true);
        expect(screen.getByLabelText('Amount UAH record 1')).toHaveValue('7 265');
        expect(screen.getByLabelText('Amount USD record 1')).toHaveValue('4 200.5');
        expect(screen.getByRole('button', { name: 'Accept record 1' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Close edit for record 1' })).toBeEnabled();
        expect(screen.queryByRole('button', { name: 'Edit record 1' })).not.toBeInTheDocument();
    });

    it('should close row edit mode without saving when close icon is clicked', () => {
        const onRowEditModeChange = jest.fn();
        const onRecordSave = jest.fn();

        renderTable({ onRowEditModeChange, onRecordSave });

        fireEvent.click(screen.getByRole('button', { name: 'Edit record 1' }));
        fireEvent.change(screen.getByLabelText('Amount UAH record 1'), { target: { value: '8000' } });
        fireEvent.click(screen.getByRole('button', { name: 'Close edit for record 1' }));

        expect(onRowEditModeChange).toHaveBeenLastCalledWith(false);
        expect(onRecordSave).not.toHaveBeenCalled();
        expect(screen.queryByLabelText('Amount UAH record 1')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Edit record 1' })).toBeInTheDocument();
    });

    it('should enable accept button only after an amount value changes', () => {
        renderTable();

        fireEvent.click(screen.getByRole('button', { name: 'Edit record 1' }));

        expect(screen.getByRole('button', { name: 'Accept record 1' })).toBeDisabled();

        fireEvent.change(screen.getByLabelText('Amount UAH record 1'), { target: { value: '8000' } });

        expect(screen.getByRole('button', { name: 'Accept record 1' })).toBeEnabled();
    });

    it('should call onRecordSave with trimmed amounts and close edit mode on success', async () => {
        const onRecordSave = jest.fn().mockResolvedValue(true);

        renderTable({ onRecordSave });

        fireEvent.click(screen.getByRole('button', { name: 'Edit record 1' }));
        fireEvent.change(screen.getByLabelText('Amount UAH record 1'), { target: { value: '8000' } });
        fireEvent.click(screen.getByRole('button', { name: 'Accept record 1' }));

        await waitFor(() => {
            expect(onRecordSave).toHaveBeenCalledWith(1, 100, '2025', '8000', '4 200.5');
        });

        await waitFor(() => {
            expect(screen.queryByLabelText('Amount UAH record 1')).not.toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: 'Edit record 1' })).toBeInTheDocument();
    });

    it('should keep row in edit mode when onRecordSave resolves false', async () => {
        const onRecordSave = jest.fn().mockResolvedValue(false);

        renderTable({ onRecordSave });

        fireEvent.click(screen.getByRole('button', { name: 'Edit record 1' }));
        fireEvent.change(screen.getByLabelText('Amount UAH record 1'), { target: { value: '8000' } });
        fireEvent.click(screen.getByRole('button', { name: 'Accept record 1' }));

        await waitFor(() => {
            expect(onRecordSave).toHaveBeenCalled();
        });

        expect(screen.getByLabelText('Amount UAH record 1')).toBeInTheDocument();
    });

    it('should show validation error and disable accept button for an invalid amount', () => {
        const onRecordSave = jest.fn();

        renderTable({ onRecordSave });

        fireEvent.click(screen.getByRole('button', { name: 'Edit record 1' }));
        fireEvent.change(screen.getByLabelText('Amount UAH record 1'), { target: { value: 'invalid' } });
        fireEvent.click(screen.getByRole('button', { name: 'Accept record 1' }));

        expect(screen.getByText('Invalid amount')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Accept record 1' })).toBeDisabled();
        expect(onRecordSave).not.toHaveBeenCalled();
    });

    it('should disable edit, delete and checkbox controls for other rows while a row is being edited', () => {
        renderTable();

        fireEvent.click(screen.getByRole('button', { name: 'Edit record 1' }));

        expect(screen.getByRole('button', { name: 'Edit record 2' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Delete record 2' })).toBeDisabled();
        expect(screen.getByRole('checkbox', { name: 'Select record 1' })).toBeDisabled();
        expect(screen.getByRole('checkbox', { name: 'Select record 2' })).toBeDisabled();
    });

    it('should disable all edit and delete buttons when isRowActionsDisabled is true', () => {
        renderTable({ isRowActionsDisabled: true });

        expect(screen.getByRole('button', { name: 'Edit record 1' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Delete record 1' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Edit record 2' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Delete record 2' })).toBeDisabled();
    });

    it('should render the scroll-to-top button hidden by default', () => {
        renderTable();

        const toTopButton = screen.getByTestId('program-expenses-table-to-top');

        expect(toTopButton).toHaveAttribute('aria-hidden', 'true');
        expect(toTopButton).toHaveAttribute('tabIndex', '-1');
    });

    it('should disable bulk delete action when row actions are disabled', () => {
        renderTable({
            isEditing: true,
            isRowActionsDisabled: true,
            selectedRecordIds: [1, 2],
        });

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON)).toBeDisabled();
    });
});
