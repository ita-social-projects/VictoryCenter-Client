import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FundsExpendituresTable, EnrichedRecord } from './FundsExpendituresTable';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';

jest.mock('./FundsExpendituresTable.module.scss', () => ({
    tableWrapper: 'tableWrapper',
    table: 'table',
    th: 'th',
    sortable: 'sortable',
    thInner: 'thInner',
    tr: 'tr',
    td: 'td',
    sortIcons: 'sortIcons',
    sortIcon: 'sortIcon',
    sortIconActive: 'sortIconActive',
    typeChip: 'typeChip',
    typeChipIncome: 'typeChipIncome',
    typeChipExpense: 'typeChipExpense',
}));

jest.mock('@/assets/icons/chevron-up.svg', () => ({
    ReactComponent: ({ className }: { className?: string }) => <svg data-testid="chevron-up" className={className} />,
}));

jest.mock('@/assets/icons/chevron-down.svg', () => ({
    ReactComponent: ({ className }: { className?: string }) => <svg data-testid="chevron-down" className={className} />,
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
            expect(chip).toHaveClass('typeChipIncome');
        });
    });

    it('should display expense type chip with correct label', () => {
        render(<FundsExpendituresTable records={MOCK_RECORDS} />);
        const expenseChips = screen.getAllByText(FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.EXPENSE);
        expect(expenseChips.length).toBeGreaterThan(0);
        expenseChips.forEach((chip) => {
            expect(chip).toHaveClass('typeChipExpense');
        });
    });

    it('should render an empty table body when records is empty', () => {
        render(<FundsExpendituresTable records={[]} />);
        const rows = screen.queryAllByRole('row');
        expect(rows).toHaveLength(1);
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
    });

    it('should display amount values', () => {
        render(<FundsExpendituresTable records={MOCK_RECORDS} />);
        expect(screen.getByText('7 265')).toBeInTheDocument();
        expect(screen.getAllByText('4 200')).not.toHaveLength(0);
    });
});
