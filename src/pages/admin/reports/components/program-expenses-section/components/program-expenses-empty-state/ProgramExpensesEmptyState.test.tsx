import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesEmptyState } from './ProgramExpensesEmptyState';

jest.mock('@/assets/icons/not-found.svg', () => ({
    ReactComponent: () => <svg data-testid="not-found-icon" />,
}));

jest.mock('@/assets/icons/plus.svg', () => ({
    ReactComponent: () => <svg data-testid="plus-icon" />,
}));

const renderFilteredEmptyState = () =>
    render(
        <table>
            <tbody>
                <ProgramExpensesEmptyState colSpan={5} variant="filtered" />
            </tbody>
        </table>,
    );

const renderProgramExpensesEmptyState = () =>
    render(
        <table>
            <tbody>
                <ProgramExpensesEmptyState colSpan={5} variant="program-expenses" />
            </tbody>
        </table>,
    );

describe('ProgramExpensesEmptyState', () => {
    it('should render filtered empty message', () => {
        renderFilteredEmptyState();

        expect(screen.getByRole('cell')).toHaveAttribute('colspan', '5');
        expect(screen.getByTestId('not-found-icon')).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.MESSAGE)).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render program expenses empty state with active button', () => {
        renderProgramExpensesEmptyState();

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByRole('cell')).toHaveAttribute('colspan', '5');
        expect(screen.getByTestId('not-found-icon')).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.EMPTY_STATE.ADD_RECORD)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE })).toBeEnabled();
    });
});
