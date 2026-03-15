import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FundsExpendituresTable, EnrichedRecord } from './FundsExpendituresTable';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';

jest.mock('./FundsExpendituresTable.module.scss', () => ({
    'table-wrapper': 'table-wrapper',
    table: 'table',
    th: 'th',
    sortable: 'sortable',
    'th-inner': 'th-inner',
    tr: 'tr',
    td: 'td',
    'sort-icons': 'sort-icons',
    'sort-icon': 'sort-icon',
    'sort-icon-active': 'sort-icon-active',
    'type-chip': 'type-chip',
    'type-chip-income': 'type-chip-income',
    'type-chip-expense': 'type-chip-expense',
    'empty-cell': 'empty-cell',
    'empty-state': 'empty-state',
    'empty-state-image': 'empty-state-image',
    'empty-state-message': 'empty-state-message',
    'checkbox-th': 'checkbox-th',
    'checkbox-td': 'checkbox-td',
    'row-checkbox': 'row-checkbox',
    'actions-th': 'actions-th',
    'actions-td': 'actions-td',
    'row-actions': 'row-actions',
    'icon-button': 'icon-button',
    'action-icon': 'action-icon',
}));

jest.mock('@/assets/icons/chevron-up.svg', () => ({
    ReactComponent: ({ className }: { className?: string }) => <svg data-testid="chevron-up" className={className} />,
}));

jest.mock('@/assets/icons/chevron-down.svg', () => ({
    ReactComponent: ({ className }: { className?: string }) => <svg data-testid="chevron-down" className={className} />,
}));

jest.mock('@/assets/icons/not-found.svg', () => ({
    ReactComponent: ({ className }: { className?: string }) => <svg data-testid="not-found" className={className} />,
}));

jest.mock('@/assets/icons/edit.svg', () => ({
    ReactComponent: ({ className }: { className?: string }) => <svg data-testid="edit-icon" className={className} />,
}));

jest.mock('@/assets/icons/delete.svg', () => ({
    ReactComponent: ({ className }: { className?: string }) => <svg data-testid="delete-icon" className={className} />,
}));

const MOCK_RECORDS: EnrichedRecord[] = [
    {
        id: 1,
        categoryId: 1,
        categoryName: 'Грантові кошти',
        type: 'income',
        reportingYear: '2025',
        amountUah: '7 265',
        amountUsd: '4 200',
    },
    {
        id: 2,
        categoryId: 2,
        categoryName: 'Благодійні внески',
        type: 'expense',
        reportingYear: '2024',
        amountUah: '4 200',
        amountUsd: '4 200',
    },
    {
        id: 3,
        categoryId: 1,
        categoryName: 'Грантові кошти',
        type: 'income',
        reportingYear: '2023',
        amountUah: '1 000',
        amountUsd: '1 000',
    },
];

describe('FundsExpendituresTable', () => {
    it('should render all column headers', () => {
        render(<FundsExpendituresTable records={[]} />);
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.REPORTING_YEAR)).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.TYPE)).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.CATEGORY)).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_UAH)).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_USD)).toBeInTheDocument();
    });

    it('should render all records', () => {
        render(<FundsExpendituresTable records={MOCK_RECORDS} />);
        expect(screen.getByText('2025')).toBeInTheDocument();
        expect(screen.getByText('2024')).toBeInTheDocument();
        expect(screen.getByText('2023')).toBeInTheDocument();
    });

    it('should display category names', () => {
        render(<FundsExpendituresTable records={MOCK_RECORDS} />);
        expect(screen.getAllByText('Грантові кошти')).toHaveLength(2);
        expect(screen.getByText('Благодійні внески')).toBeInTheDocument();
    });

    it('should display income type chip with correct label', () => {
        render(<FundsExpendituresTable records={MOCK_RECORDS} />);
        const incomeChips = screen.getAllByText(FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.INCOME);
        expect(incomeChips.length).toBeGreaterThan(0);
        incomeChips.forEach((chip) => {
            expect(chip).toHaveClass('type-chip-income');
        });
    });

    it('should display expense type chip with correct label', () => {
        render(<FundsExpendituresTable records={MOCK_RECORDS} />);
        const expenseChips = screen.getAllByText(FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.EXPENSE);
        expect(expenseChips.length).toBeGreaterThan(0);
        expenseChips.forEach((chip) => {
            expect(chip).toHaveClass('type-chip-expense');
        });
    });

    it('should render empty state row when records is empty', () => {
        render(<FundsExpendituresTable records={[]} />);
        const rows = screen.queryAllByRole('row');
        expect(rows).toHaveLength(2);
    });

    it('should show empty state message and image when records is empty', () => {
        render(<FundsExpendituresTable records={[]} />);
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.MESSAGE)).toBeInTheDocument();
        expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });

    describe('sorting', () => {
        it('should sort by type ascending on first click', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} />);
            const typeHeader = screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.TYPE);
            fireEvent.click(typeHeader);

            const rows = screen.getAllByRole('row').slice(1);
            const firstRowCells = within(rows[0]).getAllByRole('cell');
            expect(firstRowCells[1]).toHaveTextContent(FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.EXPENSE);
        });

        it('should sort by type descending on second click', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} />);
            const typeHeader = screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.TYPE);
            fireEvent.click(typeHeader);
            fireEvent.click(typeHeader);

            const rows = screen.getAllByRole('row').slice(1);
            const firstRowCells = within(rows[0]).getAllByRole('cell');
            expect(firstRowCells[1]).toHaveTextContent(FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.INCOME);
        });

        it('should reset sort on third click', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} />);
            const typeHeader = screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.TYPE);
            fireEvent.click(typeHeader);
            fireEvent.click(typeHeader);
            fireEvent.click(typeHeader);

            const rows = screen.getAllByRole('row').slice(1);
            const firstRowCells = within(rows[0]).getAllByRole('cell');
            expect(firstRowCells[0]).toHaveTextContent('2025');
        });

        it('should sort by categoryName ascending on first click', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} />);
            const categoryHeader = screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.CATEGORY);
            fireEvent.click(categoryHeader);

            const rows = screen.getAllByRole('row').slice(1);
            const firstRowCells = within(rows[0]).getAllByRole('cell');
            expect(firstRowCells[2]).toHaveTextContent('Благодійні внески');
        });

        it('should sort by amountUah ascending on first click', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} />);
            const amountUahHeader = screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_UAH);
            fireEvent.click(amountUahHeader);

            const rows = screen.getAllByRole('row').slice(1);
            const firstRowCells = within(rows[0]).getAllByRole('cell');
            expect(firstRowCells[3]).toHaveTextContent('1 000');
        });

        it('should sort by amountUsd ascending on first click', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} />);
            const amountUsdHeader = screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_USD);
            fireEvent.click(amountUsdHeader);

            const rows = screen.getAllByRole('row').slice(1);
            const firstRowCells = within(rows[0]).getAllByRole('cell');
            expect(firstRowCells[4]).toHaveTextContent('1 000');
        });
    });

    it('should display amount values', () => {
        render(<FundsExpendituresTable records={MOCK_RECORDS} />);
        expect(screen.getByText('7 265')).toBeInTheDocument();
        expect(screen.getAllByText('4 200')).not.toHaveLength(0);
    });

    describe('isEditing mode', () => {
        it('should not show checkboxes when isEditing is false (default)', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} />);
            expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
        });

        it('should show a checkbox per row when isEditing is true', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} isEditing={true} />);
            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes).toHaveLength(MOCK_RECORDS.length);
        });

        it('should show edit and delete icons per row when isEditing is true', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} isEditing={true} />);
            expect(screen.getAllByTestId('edit-icon')).toHaveLength(MOCK_RECORDS.length);
            expect(screen.getAllByTestId('delete-icon')).toHaveLength(MOCK_RECORDS.length);
        });

        it('should not show edit and delete icons when isEditing is false', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} isEditing={false} />);
            expect(screen.queryAllByTestId('edit-icon')).toHaveLength(0);
            expect(screen.queryAllByTestId('delete-icon')).toHaveLength(0);
        });

        it('should use colSpan of 7 for empty state when isEditing is true', () => {
            render(<FundsExpendituresTable records={[]} isEditing={true} />);
            const emptyCell = screen.getByTestId('funds-table-empty-cell');
            expect(emptyCell).toHaveAttribute('colspan', '7');
        });

        it('should use colSpan of 5 for empty state when not editing', () => {
            render(<FundsExpendituresTable records={[]} isEditing={false} />);
            const emptyCell = screen.getByTestId('funds-table-empty-cell');
            expect(emptyCell).toHaveAttribute('colspan', '5');
        });
    });
});
