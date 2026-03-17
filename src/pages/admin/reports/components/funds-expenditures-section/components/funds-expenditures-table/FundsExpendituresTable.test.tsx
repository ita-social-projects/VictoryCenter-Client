import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import type React from 'react';
import { FundsExpendituresTable, EnrichedRecord } from './FundsExpendituresTable';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { ReportFundsExpendituresCategory } from '@/types/admin/reports';

jest.mock('./FundsExpendituresTable.module.scss', () => ({
    'table-wrapper': 'table-wrapper',
    table: 'table',
    th: 'th',
    sortable: 'sortable',
    'sortable-disabled': 'sortable-disabled',
    'th-inner': 'th-inner',
    tr: 'tr',
    td: 'td',
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
    'accept-icon-button': 'accept-icon-button',
    'close-icon-button': 'close-icon-button',
    'action-icon': 'action-icon',
    'category-edit-td': 'category-edit-td',
    'category-edit-wrapper': 'category-edit-wrapper',
    'category-edit-select': 'category-edit-select',
    'category-edit-option': 'category-edit-option',
    'category-edit-error': 'category-edit-error',
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

jest.mock('@/assets/icons/checkmark.svg', () => ({
    ReactComponent: ({ className }: { className?: string }) => (
        <svg data-testid="checkmark-icon" className={className} />
    ),
}));

jest.mock('@/assets/icons/cross.svg', () => ({
    ReactComponent: ({ className }: { className?: string }) => <svg data-testid="cross-icon" className={className} />,
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

const MOCK_CATEGORIES: ReportFundsExpendituresCategory[] = [
    { id: 1, name: 'Грантові кошти', type: 'income' },
    { id: 2, name: 'Благодійні внески', type: 'income' },
    { id: 3, name: 'Власні надходження', type: 'income' },
    { id: 4, name: 'Адміністративні витрати', type: 'expense' },
    { id: 5, name: 'Програмні витрати', type: 'expense' },
];

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
        type: 'income',
        reportingYear: '2025',
        amountUah: '4 200',
        amountUsd: '4 200',
    },
    {
        id: 3,
        categoryId: 4,
        categoryName: 'Адміністративні витрати',
        type: 'expense',
        reportingYear: '2024',
        amountUah: '1 000',
        amountUsd: '1 000',
    },
];

const renderTable = (props?: Partial<React.ComponentProps<typeof FundsExpendituresTable>>) => {
    return render(<FundsExpendituresTable records={MOCK_RECORDS} categories={MOCK_CATEGORIES} {...props} />);
};

describe('FundsExpendituresTable', () => {
    it('should render all column headers', () => {
        renderTable({ records: [] });

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.REPORTING_YEAR)).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.TYPE)).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.CATEGORY)).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_UAH)).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_USD)).toBeInTheDocument();
    });

    it('should render all records', () => {
        renderTable();

        expect(screen.getAllByText('2025')).toHaveLength(2);
        expect(screen.getByText('2024')).toBeInTheDocument();
    });

    it('should show edit and delete icons per row in edit mode', () => {
        renderTable({ isEditing: true });

        expect(screen.getAllByTestId('edit-icon')).toHaveLength(MOCK_RECORDS.length);
        expect(screen.getAllByTestId('delete-icon')).toHaveLength(MOCK_RECORDS.length);
    });

    it('should render empty state row when records is empty', () => {
        renderTable({ records: [] });

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.MESSAGE)).toBeInTheDocument();
        expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });

    it('should sort records by amountUsd ascending', () => {
        renderTable();

        fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_USD));

        const rows = screen.getAllByRole('row').slice(1);
        const firstRowCells = within(rows[0]).getAllByRole('cell');

        expect(firstRowCells[4]).toHaveTextContent('1 000');
    });

    describe('row category editing', () => {
        it('should switch row actions to accept and close icons when row enters edit mode', () => {
            renderTable({ isEditing: true });

            fireEvent.click(screen.getByLabelText('Edit record 1'));

            expect(screen.getByLabelText('Accept record 1')).toBeInTheDocument();
            expect(screen.getByLabelText('Close edit for record 1')).toBeInTheDocument();
            expect(screen.getByTestId('checkmark-icon')).toBeInTheDocument();
            expect(screen.getByTestId('cross-icon')).toBeInTheDocument();
        });

        it('should disable other edit/delete actions and checkboxes while one row is in edit mode', () => {
            renderTable({ isEditing: true });

            fireEvent.click(screen.getByLabelText('Edit record 1'));

            expect(screen.getByLabelText('Edit record 2')).toBeDisabled();
            expect(screen.getByLabelText('Delete record 2')).toBeDisabled();
            expect(screen.getByLabelText('Select record 2')).toBeDisabled();
        });

        it('should disable accept when no category changes were made', () => {
            renderTable({ isEditing: true });

            fireEvent.click(screen.getByLabelText('Edit record 1'));

            expect(screen.getByLabelText('Accept record 1')).toBeDisabled();
        });

        it('should save category changes when valid and notify parent', () => {
            const onRecordCategorySave = jest.fn();

            renderTable({ isEditing: true, onRecordCategorySave });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.click(screen.getByTestId('select-option-Власні надходження-3'));

            const acceptButton = screen.getByLabelText('Accept record 1');
            expect(acceptButton).not.toBeDisabled();

            fireEvent.click(acceptButton);

            expect(onRecordCategorySave).toHaveBeenCalledWith(1, 3);
        });

        it('should show unique validation message when duplicate category is selected for the same type', () => {
            renderTable({ isEditing: true });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.click(screen.getByTestId('select-option-Благодійні внески-2'));

            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.VALIDATION.CATEGORY_UNIQUE)).toBeInTheDocument();
            expect(screen.getByLabelText('Accept record 1')).toBeDisabled();
        });

        it('should show unique validation message when duplicate category exists in another year', () => {
            const recordsWithDuplicateAcrossYears: EnrichedRecord[] = [
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
                    categoryId: 3,
                    categoryName: 'Власні надходження',
                    type: 'income',
                    reportingYear: '2024',
                    amountUah: '3 000',
                    amountUsd: '1 700',
                },
            ];

            renderTable({ isEditing: true, records: recordsWithDuplicateAcrossYears });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.click(screen.getByTestId('select-option-Власні надходження-3'));

            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.VALIDATION.CATEGORY_UNIQUE)).toBeInTheDocument();
            expect(screen.getByLabelText('Accept record 1')).toBeDisabled();
        });

        it('should notify parent when entering and leaving row edit mode', () => {
            const onRowEditModeChange = jest.fn();

            renderTable({ isEditing: true, onRowEditModeChange });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.click(screen.getByLabelText('Close edit for record 1'));

            expect(onRowEditModeChange).toHaveBeenNthCalledWith(1, true);
            expect(onRowEditModeChange).toHaveBeenNthCalledWith(2, false);
        });
    });
});
