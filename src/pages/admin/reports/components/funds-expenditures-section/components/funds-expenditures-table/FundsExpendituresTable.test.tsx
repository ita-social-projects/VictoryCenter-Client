import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import type React from 'react';
import { FundsExpendituresTable, EnrichedRecord } from './FundsExpendituresTable';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
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
    'amount-edit-td': 'amount-edit-td',
    'amount-edit-wrapper': 'amount-edit-wrapper',
    'amount-edit-input': 'amount-edit-input',
    'amount-edit-input-error': 'amount-edit-input-error',
    'amount-edit-error': 'amount-edit-error',
    'to-top-button': 'to-top-button',
    'to-top-icon': 'to-top-icon',
    'to-top-button-visible': 'to-top-button-visible',
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

jest.mock('@/assets/icons/arrow-up.svg', () => ({
    ReactComponent: ({ className }: { className?: string }) => <svg data-testid="arrow-up" className={className} />,
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

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: ({ size }: { size?: number }) => <div data-testid="inline-loader">loader-{size ?? 2}</div>,
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

    it('should use correct empty-state colSpan in view and edit modes', () => {
        const { rerender } = render(
            <FundsExpendituresTable records={[]} categories={MOCK_CATEGORIES} isEditing={false} />,
        );

        expect(screen.getByTestId('funds-table-empty-cell')).toHaveAttribute('colspan', '5');

        rerender(<FundsExpendituresTable records={[]} categories={MOCK_CATEGORIES} isEditing />);

        expect(screen.getByTestId('funds-table-empty-cell')).toHaveAttribute('colspan', '7');
    });

    it('should sort records by amountUsd ascending', () => {
        renderTable();

        fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_USD));

        const rows = screen.getAllByRole('row').slice(1);
        const firstRowCells = within(rows[0]).getAllByRole('cell');

        expect(firstRowCells[4]).toHaveTextContent('1 000');
    });

    it('should render localized type labels for income and expense chips', () => {
        renderTable();

        expect(screen.getAllByText(FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.INCOME)).toHaveLength(2);
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.EXPENSE)).toBeInTheDocument();
    });

    it('should sort records by category name ascending', () => {
        renderTable();

        fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.CATEGORY));

        const rows = screen.getAllByRole('row').slice(1);
        const firstRowCells = within(rows[0]).getAllByRole('cell');

        expect(firstRowCells[2]).toHaveTextContent('Адміністративні витрати');
    });

    it('should toggle sort direction and reset to default order on third click', () => {
        renderTable();

        const amountUahHeader = screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_UAH);

        fireEvent.click(amountUahHeader);
        let rows = screen.getAllByRole('row').slice(1);
        let firstRowCells = within(rows[0]).getAllByRole('cell');
        expect(firstRowCells[3]).toHaveTextContent('1 000');

        fireEvent.click(amountUahHeader);
        rows = screen.getAllByRole('row').slice(1);
        firstRowCells = within(rows[0]).getAllByRole('cell');
        expect(firstRowCells[3]).toHaveTextContent('7 265');

        fireEvent.click(amountUahHeader);
        rows = screen.getAllByRole('row').slice(1);
        firstRowCells = within(rows[0]).getAllByRole('cell');
        expect(firstRowCells[3]).toHaveTextContent('7 265');
    });

    describe('scroll to top button', () => {
        it('should show to-top button when content overflows and table is scrolled', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} categories={MOCK_CATEGORIES} />);

            const table = screen.getByTestId('funds-table');
            Object.defineProperty(table, 'scrollHeight', { configurable: true, value: 900 });
            Object.defineProperty(table, 'clientHeight', { configurable: true, value: 300 });
            Object.defineProperty(table, 'scrollTop', { configurable: true, writable: true, value: 120 });

            fireEvent.scroll(table);

            expect(screen.getByTestId('funds-table-to-top')).toHaveClass('to-top-button-visible');
            expect(screen.getByTestId('arrow-up')).toBeInTheDocument();
        });

        it('should hide to-top button when list is at top', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} categories={MOCK_CATEGORIES} />);

            const table = screen.getByTestId('funds-table');
            Object.defineProperty(table, 'scrollHeight', { configurable: true, value: 900 });
            Object.defineProperty(table, 'clientHeight', { configurable: true, value: 300 });
            Object.defineProperty(table, 'scrollTop', { configurable: true, writable: true, value: 0 });

            fireEvent.scroll(table);

            expect(screen.getByTestId('funds-table-to-top')).not.toHaveClass('to-top-button-visible');
        });

        it('should scroll to top after clicking to-top button', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} categories={MOCK_CATEGORIES} />);

            const table = screen.getByTestId('funds-table');
            Object.defineProperty(table, 'scrollHeight', { configurable: true, value: 900 });
            Object.defineProperty(table, 'clientHeight', { configurable: true, value: 300 });
            Object.defineProperty(table, 'scrollTop', { configurable: true, writable: true, value: 220 });

            fireEvent.scroll(table);
            fireEvent.click(screen.getByTestId('funds-table-to-top'));

            expect((table as HTMLDivElement).scrollTop).toBe(0);
            expect(screen.getByTestId('funds-table-to-top')).not.toHaveClass('to-top-button-visible');
        });

        it('should reset scroll position to top when sorting is changed', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} categories={MOCK_CATEGORIES} />);

            const table = screen.getByTestId('funds-table');
            Object.defineProperty(table, 'scrollHeight', { configurable: true, value: 900 });
            Object.defineProperty(table, 'clientHeight', { configurable: true, value: 300 });
            Object.defineProperty(table, 'scrollTop', { configurable: true, writable: true, value: 180 });

            fireEvent.scroll(table);
            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.TYPE));

            expect((table as HTMLDivElement).scrollTop).toBe(0);
            expect(screen.getByTestId('funds-table-to-top')).not.toHaveClass('to-top-button-visible');
        });

        it('should not sort or reset scroll when a row is being edited', () => {
            renderTable({ isEditing: true });

            const table = screen.getByTestId('funds-table');
            Object.defineProperty(table, 'scrollTop', { configurable: true, writable: true, value: 180 });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_UAH));

            expect((table as HTMLDivElement).scrollTop).toBe(180);
            expect(screen.getByLabelText('Accept record 1')).toBeInTheDocument();
        });
    });

    describe('isEditing mode', () => {
        it('should not show checkboxes when isEditing is false (default)', () => {
            render(<FundsExpendituresTable records={MOCK_RECORDS} categories={MOCK_CATEGORIES} />);
            expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
        });
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
            const onRecordSave = jest.fn();

            renderTable({ isEditing: true, onRecordSave });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.click(screen.getByTestId('select-option-Власні надходження-3'));

            const acceptButton = screen.getByLabelText('Accept record 1');
            expect(acceptButton).not.toBeDisabled();

            fireEvent.click(acceptButton);

            expect(onRecordSave).toHaveBeenCalledWith(1, {
                categoryId: 3,
                amountUah: '7 265',
                amountUsd: '4 200',
            });
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

        it('should show required category validation on blur when category is cleared', () => {
            renderTable({ isEditing: true });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.click(
                screen.getByTestId(`select-option-${FUNDS_EXPENDITURES_TEXT.FILTER.CATEGORY_PLACEHOLDER}-undefined`),
            );

            const categoryEditWrapper = document.querySelector('.category-edit-wrapper');
            expect(categoryEditWrapper).not.toBeNull();

            if (categoryEditWrapper) {
                fireEvent.blur(categoryEditWrapper, { relatedTarget: null });
            }

            expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
            expect(screen.getByLabelText('Accept record 1')).toBeDisabled();
        });

        it('should infer editable categories from allRecordsForTypeInference', () => {
            const categoryWithoutType = {
                id: 99,
                name: 'Категорія без типу',
            } as unknown as ReportFundsExpendituresCategory;

            const records: EnrichedRecord[] = [
                {
                    id: 1,
                    categoryId: 1,
                    categoryName: 'Грантові кошти',
                    type: 'income',
                    reportingYear: '2025',
                    amountUah: '7 265',
                    amountUsd: '4 200',
                },
            ];

            const allRecordsForTypeInference = [
                {
                    id: 100,
                    categoryId: 99,
                    type: 'income' as const,
                    reportingYear: '2024',
                    amountUah: '10',
                    amountUsd: '10',
                },
            ];

            renderTable({
                isEditing: true,
                records,
                categories: [...MOCK_CATEGORIES, categoryWithoutType],
                allRecordsForTypeInference,
            });

            fireEvent.click(screen.getByLabelText('Edit record 1'));

            expect(screen.getByTestId('select-option-Категорія без типу-99')).toBeInTheDocument();
        });

        it('should notify parent when entering and leaving row edit mode', () => {
            const onRowEditModeChange = jest.fn();

            renderTable({ isEditing: true, onRowEditModeChange });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.click(screen.getByLabelText('Close edit for record 1'));

            expect(onRowEditModeChange).toHaveBeenNthCalledWith(1, true);
            expect(onRowEditModeChange).toHaveBeenNthCalledWith(2, false);
        });

        it('should restore row view mode values after closing edit', () => {
            renderTable({ isEditing: true });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.change(screen.getByLabelText('Amount UAH record 1'), { target: { value: '8 888' } });
            fireEvent.change(screen.getByLabelText('Amount USD record 1'), { target: { value: '9 999' } });
            fireEvent.click(screen.getByLabelText('Close edit for record 1'));

            expect(screen.queryByLabelText('Amount UAH record 1')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('Amount USD record 1')).not.toBeInTheDocument();

            const rowOne = screen.getByLabelText('Edit record 1').closest('tr');
            expect(rowOne).not.toBeNull();
            const rowOneScope = within(rowOne as HTMLElement);

            expect(rowOneScope.getByText('7 265')).toBeInTheDocument();
            expect(rowOneScope.getByText('4 200')).toBeInTheDocument();
        });

        it('should save category and amounts through unified save callback', () => {
            const onRecordSave = jest.fn();

            renderTable({ isEditing: true, onRecordSave });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.click(screen.getByTestId('select-option-Власні надходження-3'));
            fireEvent.change(screen.getByLabelText('Amount UAH record 1'), { target: { value: '7 300' } });
            fireEvent.change(screen.getByLabelText('Amount USD record 1'), { target: { value: '4 250' } });

            const acceptButton = screen.getByLabelText('Accept record 1');
            expect(acceptButton).not.toBeDisabled();

            fireEvent.click(acceptButton);

            expect(onRecordSave).toHaveBeenCalledWith(1, {
                categoryId: 3,
                amountUah: '7 300',
                amountUsd: '4 250',
            });
        });

        it('should show saving indicator and lock controls while row save is in progress', async () => {
            let resolveSave: (() => void) | undefined;
            const onRecordSave = jest.fn(
                () =>
                    new Promise<boolean>((resolve) => {
                        resolveSave = () => resolve(true);
                    }),
            );

            renderTable({ isEditing: true, onRecordSave });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.click(screen.getByTestId('select-option-Власні надходження-3'));
            fireEvent.click(screen.getByLabelText('Accept record 1'));

            expect(screen.getByTestId('inline-loader')).toBeInTheDocument();
            expect(screen.getByLabelText('Edit record 2')).toBeDisabled();

            resolveSave?.();

            await waitFor(() => {
                expect(screen.queryByTestId('inline-loader')).not.toBeInTheDocument();
            });
        });

        it('should show required validation for empty amount on blur', () => {
            renderTable({ isEditing: true });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.change(screen.getByLabelText('Amount UAH record 1'), { target: { value: '   ' } });
            fireEvent.blur(screen.getByLabelText('Amount UAH record 1'));

            expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
            expect(screen.getByLabelText('Accept record 1')).toBeDisabled();
        });

        it('should show numeric validation for non-number amount', () => {
            renderTable({ isEditing: true });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.change(screen.getByLabelText('Amount USD record 1'), { target: { value: 'abc' } });

            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_ONLY_NUMBER_GT_ZERO)).toBeInTheDocument();
            expect(screen.getByLabelText('Accept record 1')).toBeDisabled();
        });

        it('should show max-digits validation for too long amount', () => {
            renderTable({ isEditing: true });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.change(screen.getByLabelText('Amount UAH record 1'), { target: { value: '123456789012' } });

            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_MAX_DIGITS)).toBeInTheDocument();
            expect(screen.getByLabelText('Accept record 1')).toBeDisabled();
        });

        it('should show negative validation for negative amount', () => {
            renderTable({ isEditing: true });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.change(screen.getByLabelText('Amount USD record 1'), { target: { value: '-500' } });

            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_NEGATIVE)).toBeInTheDocument();
            expect(screen.getByLabelText('Accept record 1')).toBeDisabled();
        });

        it('should show required validation for empty USD amount on blur', () => {
            renderTable({ isEditing: true });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.change(screen.getByLabelText('Amount USD record 1'), { target: { value: '   ' } });
            fireEvent.blur(screen.getByLabelText('Amount USD record 1'));

            expect(screen.getByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toBeInTheDocument();
            expect(screen.getByLabelText('Accept record 1')).toBeDisabled();
        });

        it('should recalculate USD when UAH amount is changed and validated', () => {
            renderTable({ isEditing: true, exchangeRate: '40' });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.change(screen.getByLabelText('Amount UAH record 1'), { target: { value: '8 000' } });
            fireEvent.blur(screen.getByLabelText('Amount UAH record 1'));

            expect(screen.getByLabelText('Amount USD record 1')).toHaveValue('200');
        });

        it('should recalculate USD immediately on valid UAH change using current exchange rate', () => {
            renderTable({ isEditing: true, exchangeRate: '40' });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.change(screen.getByLabelText('Amount UAH record 1'), { target: { value: '8 000' } });

            expect(screen.getByLabelText('Amount USD record 1')).toHaveValue('200');
        });

        it('should recalculate UAH when USD amount is changed and validated', () => {
            renderTable({ isEditing: true, exchangeRate: '40' });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.change(screen.getByLabelText('Amount USD record 1'), { target: { value: '50' } });
            fireEvent.blur(screen.getByLabelText('Amount USD record 1'));

            expect(screen.getByLabelText('Amount UAH record 1')).toHaveValue('2000');
        });

        it('should recalculate UAH immediately on valid USD change using current exchange rate', () => {
            renderTable({ isEditing: true, exchangeRate: '40' });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.change(screen.getByLabelText('Amount USD record 1'), { target: { value: '50' } });

            expect(screen.getByLabelText('Amount UAH record 1')).toHaveValue('2000');
        });

        it('should not recalculate opposite amount when exchange rate is invalid', () => {
            renderTable({ isEditing: true, exchangeRate: null });

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            fireEvent.change(screen.getByLabelText('Amount UAH record 1'), { target: { value: '8 000' } });
            fireEvent.blur(screen.getByLabelText('Amount UAH record 1'));

            expect(screen.getByLabelText('Amount USD record 1')).toHaveValue('4 200');
        });

        it('should use current exchange rate instead of just adding/removing zeroes', () => {
            const records: EnrichedRecord[] = [
                {
                    id: 1,
                    categoryId: 1,
                    categoryName: 'Грантові кошти',
                    type: 'income',
                    reportingYear: '2025',
                    amountUah: '500 000',
                    amountUsd: '13 500',
                },
            ];

            renderTable({ isEditing: true, exchangeRate: '42', records });

            fireEvent.click(screen.getByLabelText('Edit record 1'));

            fireEvent.change(screen.getByLabelText('Amount UAH record 1'), { target: { value: '50 000' } });
            expect(screen.getByLabelText('Amount USD record 1')).toHaveValue('1190.48');

            fireEvent.change(screen.getByLabelText('Amount UAH record 1'), { target: { value: '500 000' } });
            expect(screen.getByLabelText('Amount USD record 1')).toHaveValue('11904.76');
        });
    });
});
