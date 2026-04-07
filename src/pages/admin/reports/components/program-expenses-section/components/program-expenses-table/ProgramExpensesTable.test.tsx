import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgramExpensesTable } from './ProgramExpensesTable';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';

jest.mock('@/assets/icons/not-found.svg', () => ({
    ReactComponent: () => <svg data-testid="not-found-icon" />,
}));

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
        render(<ProgramExpensesTable records={records} />);

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.REPORTING_YEAR)).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.TYPE)).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.PROGRAM)).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.AMOUNT_UAH)).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.AMOUNT_USD)).toBeInTheDocument();
    });

    it('should render formatted record values', () => {
        const { container } = render(<ProgramExpensesTable records={records} />);
        const table = screen.getByRole('table');

        expect(within(table).getByText('2025')).toBeInTheDocument();
        expect(within(table).getByText('Program A')).toBeInTheDocument();
        expect(within(table).getAllByText(PROGRAM_EXPENSES_TEXT.TABLE.TYPE_LABEL)).toHaveLength(2);

        const normalizedText = normalizeText(container.textContent ?? '');
        expect(normalizedText).toContain('7 265');
        expect(normalizedText).toContain('4 200');
    });

    it('should render empty state when records are missing', () => {
        render(<ProgramExpensesTable records={[]} />);

        expect(screen.getByTestId('not-found-icon')).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.MESSAGE)).toBeInTheDocument();
    });
});
