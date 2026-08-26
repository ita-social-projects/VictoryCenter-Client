import { render, screen, fireEvent } from '@testing-library/react';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { AddFundsExpendituresRecordModal } from './AddFundsExpendituresRecordModal';
import { useFundsExpendituresRecordForm } from '@/hooks/admin/use-funds-expenditures-record-form/useFundsExpendituresRecordForm';

jest.mock('@/hooks/admin/use-funds-expenditures-record-form/useFundsExpendituresRecordForm');

jest.mock(
    '@/pages/admin/reports/components/funds-expenditures-section/components/common/funds-expenditures-record-modal/FundsExpendituresRecordModal',
    () => ({
        FundsExpendituresRecordModal: ({ title, subtitle, submitButtonLabel, onSubmit, children }: any) => (
            <div data-testid="record-modal">
                <div data-testid="record-modal-title">{title}</div>
                <div data-testid="record-modal-subtitle">{subtitle}</div>
                <button data-testid="record-modal-submit" onClick={onSubmit}>
                    {submitButtonLabel}
                </button>
                {children}
            </div>
        ),
    }),
);

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, title, onConfirm, onCancel }: any) => (
        <div data-testid="confirm-modal" data-open={String(isOpen)}>
            <span>{title}</span>
            <button data-testid="confirm-yes" onClick={onConfirm}>
                Yes
            </button>
            <button data-testid="confirm-no" onClick={onCancel}>
                No
            </button>
        </div>
    ),
}));

jest.mock('@/components/admin/input-with-character-limit/InputWithCharacterLimit', () => ({
    InputWithCharacterLimit: ({ id, value, onChange, onBlur }: any) => (
        <input data-testid={id} value={value} onChange={onChange} onBlur={onBlur} />
    ),
}));

jest.mock('@/components/common/select/Select', () => {
    const React = require('react');

    const Select = ({ value, onValueChange, placeholder, children, className }: any) => {
        const options = React.Children.toArray(children)
            .filter((child: any) => child?.props)
            .map((child: any) => ({ value: child.props.value, name: child.props.name }));

        return (
            <select
                data-testid={placeholder}
                className={className}
                value={value ?? ''}
                onChange={(event) => {
                    const selected = options.find((item: any) => String(item.value) === event.target.value);
                    onValueChange(selected?.value);
                }}
            >
                <option value="">placeholder</option>
                {options.map((option: any) => (
                    <option key={String(option.value)} value={option.value}>
                        {option.name}
                    </option>
                ))}
            </select>
        );
    };

    Select.Option = (_props: any) => null;

    return { Select };
});

jest.mock('@/utils/functions/get-reporting-year-options/get-reporting-year-options', () => ({
    getReportingYearOptions: () => ['2025', '2026'],
}));

const mockedHook = useFundsExpendituresRecordForm as jest.MockedFunction<typeof useFundsExpendituresRecordForm>;

const amountChangeHandlers: Record<string, jest.Mock> = {
    amountUah: jest.fn(),
    amountUsd: jest.fn(),
};

const mockHandleAmountFieldChange = jest.fn();

const baseHookResult = {
    formState: {
        reportingYear: '2026',
        categoryId: 1,
        amountUah: '100',
        amountUsd: '10',
        errors: {},
    },
    filteredCategories: [
        { id: 1, name: 'Category 1', type: 'income' as const },
        { id: 2, name: 'Category 2', type: 'income' as const },
    ],
    isCategorySelectDisabled: false,
    isSubmitting: false,
    isDirty: true,
    isSubmitDisabled: false,
    isAddConfirmationOpen: false,
    usdMismatchMessage: undefined,
    handleReportingYearChange: jest.fn(),
    handleReportingYearBlur: jest.fn(),
    handleCategoryChange: jest.fn(),
    handleCategoryBlur: jest.fn(),
    handleAmountFieldChange: mockHandleAmountFieldChange,
    handleAmountBlur: jest.fn(),
    handleOpenAddConfirmation: jest.fn(),
    handleConfirmAdd: jest.fn(),
    handleCloseConfirmation: jest.fn(),
};

describe('AddFundsExpendituresRecordModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockHandleAmountFieldChange.mockImplementation((field: string) => amountChangeHandlers[field]);

        mockedHook.mockReturnValue(baseHookResult as any);
    });

    const renderComponent = (transactionType: 'income' | 'expense' = 'income', exchangeRate: string | null = '42') =>
        render(
            <AddFundsExpendituresRecordModal
                isOpen={true}
                onClose={jest.fn()}
                transactionType={transactionType}
                categories={[]}
                records={[]}
                exchangeRate={exchangeRate}
                onSubmit={jest.fn()}
            />,
        );

    it('renders income texts from config', () => {
        renderComponent('income');

        expect(screen.getByTestId('record-modal-title')).toHaveTextContent(FUNDS_EXPENDITURES_TEXT.MODAL.INCOME.TITLE);
        expect(screen.getByTestId('record-modal-subtitle')).toHaveTextContent(
            FUNDS_EXPENDITURES_TEXT.MODAL.INCOME.SUBTITLE,
        );
        expect(screen.getByTestId('record-modal-submit')).toHaveTextContent(
            FUNDS_EXPENDITURES_TEXT.MODAL.INCOME.SUBMIT_BUTTON,
        );
    });

    it('renders expense texts from config', () => {
        renderComponent('expense');

        expect(screen.getByTestId('record-modal-title')).toHaveTextContent(FUNDS_EXPENDITURES_TEXT.MODAL.EXPENSE.TITLE);
        expect(screen.getByTestId('record-modal-subtitle')).toHaveTextContent(
            FUNDS_EXPENDITURES_TEXT.MODAL.EXPENSE.SUBTITLE,
        );
        expect(screen.getByTestId('record-modal-submit')).toHaveTextContent(
            FUNDS_EXPENDITURES_TEXT.MODAL.EXPENSE.SUBMIT_BUTTON,
        );
    });

    it('renders disabled category placeholder when category select disabled', () => {
        mockedHook.mockReturnValue({
            ...baseHookResult,
            isCategorySelectDisabled: true,
        } as any);

        renderComponent();

        expect(screen.getByTestId('record-category-disabled-placeholder')).toBeInTheDocument();
    });

    it('renders field errors and applies select-error class to dropdowns when errors exist', () => {
        mockedHook.mockReturnValue({
            ...baseHookResult,
            usdMismatchMessage: 'Mismatch',
            formState: {
                ...baseHookResult.formState,
                errors: {
                    reportingYear: 'year error',
                    categoryId: 'category error',
                    amountUah: 'uah error',
                    amountUsd: 'usd error',
                },
            },
        } as any);

        renderComponent('income');

        expect(screen.getByText('year error')).toBeInTheDocument();
        expect(screen.getByText('category error')).toBeInTheDocument();
        expect(screen.getByText('uah error')).toBeInTheDocument();
        expect(screen.getByText('usd error')).toBeInTheDocument();
        expect(screen.getByText('Mismatch')).toBeInTheDocument();

        const yearSelect = screen.getByTestId(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_PLACEHOLDER);
        expect(yearSelect.className).toContain('select-error');

        const categorySelect = screen.getByTestId(FUNDS_EXPENDITURES_TEXT.MODAL.INCOME.CATEGORY_PLACEHOLDER);
        expect(categorySelect.className).toContain('select-error');
    });

    it('does not apply select-error class to dropdowns when no errors exist', () => {
        mockedHook.mockReturnValue({
            ...baseHookResult,
            formState: {
                ...baseHookResult.formState,
                errors: {},
            },
        } as any);

        renderComponent('income');

        const yearSelect = screen.getByTestId(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_PLACEHOLDER);
        expect(yearSelect.className).not.toContain('select-error');

        const categorySelect = screen.getByTestId(FUNDS_EXPENDITURES_TEXT.MODAL.INCOME.CATEGORY_PLACEHOLDER);
        expect(categorySelect.className).not.toContain('select-error');
    });

    it('calls handlers from hook on interactions', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_PLACEHOLDER), {
            target: { value: '2025' },
        });
        fireEvent.blur(screen.getByTestId(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_PLACEHOLDER));
        fireEvent.change(screen.getByTestId(FUNDS_EXPENDITURES_TEXT.MODAL.INCOME.CATEGORY_PLACEHOLDER), {
            target: { value: '2' },
        });
        fireEvent.blur(screen.getByTestId(FUNDS_EXPENDITURES_TEXT.MODAL.INCOME.CATEGORY_PLACEHOLDER));
        fireEvent.change(screen.getByTestId('add-record-amount-uah'), { target: { value: '111' } });
        fireEvent.blur(screen.getByTestId('add-record-amount-uah'));
        fireEvent.change(screen.getByTestId('add-record-amount-usd'), { target: { value: '22' } });
        fireEvent.blur(screen.getByTestId('add-record-amount-usd'));
        fireEvent.click(screen.getByTestId('record-modal-submit'));

        expect(baseHookResult.handleReportingYearChange).toHaveBeenCalled();
        expect(baseHookResult.handleReportingYearBlur).toHaveBeenCalledTimes(1);
        expect(baseHookResult.handleCategoryChange).toHaveBeenCalled();
        expect(baseHookResult.handleCategoryBlur).toHaveBeenCalledTimes(1);

        expect(mockHandleAmountFieldChange).toHaveBeenCalledWith('amountUah');
        expect(amountChangeHandlers.amountUah).toHaveBeenCalledWith('111');

        expect(mockHandleAmountFieldChange).toHaveBeenCalledWith('amountUsd');
        expect(amountChangeHandlers.amountUsd).toHaveBeenCalledWith('22');

        expect(baseHookResult.handleAmountBlur).toHaveBeenCalledWith('amountUah');
        expect(baseHookResult.handleAmountBlur).toHaveBeenCalledWith('amountUsd');
        expect(baseHookResult.handleOpenAddConfirmation).toHaveBeenCalledTimes(1);
    });

    it('calls confirmation handlers', () => {
        mockedHook.mockReturnValue({
            ...baseHookResult,
            isAddConfirmationOpen: true,
        } as any);

        renderComponent();

        fireEvent.click(screen.getByTestId('confirm-yes'));
        fireEvent.click(screen.getByTestId('confirm-no'));

        expect(baseHookResult.handleConfirmAdd).toHaveBeenCalledTimes(1);
        expect(baseHookResult.handleCloseConfirmation).toHaveBeenCalledTimes(1);
    });

    it('renders when exchange rate is null', () => {
        renderComponent('income', null);

        expect(screen.getByTestId('record-modal')).toBeInTheDocument();
    });
});
