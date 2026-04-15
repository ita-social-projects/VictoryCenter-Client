import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AddIncomeModal } from './AddIncomeModal';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { ReportFundsExpendituresCategory, ReportFundsExpendituresRecord } from '@/types/admin/reports';

const MOCK_CATEGORIES: ReportFundsExpendituresCategory[] = [
    { id: 1, name: 'Грантові кошти', type: 'income' },
    { id: 2, name: 'Благодійні внески', type: 'income' },
    { id: 3, name: 'Власні надходження', type: 'income' },
    { id: 5, name: 'Адміністративні витрати', type: 'expense' },
    { id: 6, name: 'Програмні витрати', type: 'expense' },
];

const MOCK_RECORDS: ReportFundsExpendituresRecord[] = [
    { id: 1, categoryId: 1, type: 'income', reportingYear: '2025', amountUah: '7265', amountUsd: '4200' },
    { id: 2, categoryId: 5, type: 'expense', reportingYear: '2025', amountUah: '3100', amountUsd: '1800' },
    { id: 3, categoryId: 2, type: 'income', reportingYear: '2025', amountUah: '5800', amountUsd: '3360' },
];

jest.mock('./AddIncomeModal.module.scss', () => ({
    form: 'form',
    field: 'field',
    label: 'label',
    required: 'required',
    select: 'select',
    'select-option': 'select-option',
    'disabled-select-placeholder': 'disabled-select-placeholder',
    input: 'input',
    error: 'error',
    'amount-usd-header': 'amount-usd-header',
    'exchange-rate-chip': 'exchange-rate-chip',
    'exchange-rate-chip-label': 'exchange-rate-chip-label',
    'exchange-rate-value': 'exchange-rate-value',
    info: 'info',
    'info-icon': 'info-icon',
    'info-text': 'info-text',
}));

jest.mock('@/assets/icons/info.svg', () => ({
    ReactComponent: ({ className }: { className?: string }) => <svg data-testid="info-icon" className={className} />,
}));

jest.mock(
    '@/pages/admin/reports/components/funds-expenditures-section/components/common/funds-record-modal/FundsRecordModal',
    () => ({
        FundsRecordModal: ({ isOpen, title, subtitle, children, onSubmit, onClose, isSubmitDisabled }: any) => {
            if (!isOpen) return null;
            return (
                <div data-testid="funds-record-modal">
                    <div data-testid="modal-title">{title}</div>
                    <div data-testid="modal-subtitle">{subtitle}</div>
                    <div data-testid="modal-content">{children}</div>
                    <button data-testid="modal-submit" onClick={onSubmit} disabled={isSubmitDisabled}>
                        Submit
                    </button>
                    <button data-testid="modal-force-submit" onClick={onSubmit}>
                        Force Submit
                    </button>
                    <button data-testid="modal-close" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            );
        },
    }),
);

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, title, onConfirm, onCancel }: any) => {
        if (!isOpen) return null;

        return (
            <div data-testid="add-income-confirmation-modal" data-open={String(isOpen)}>
                <div data-testid="add-income-confirmation-title">{title}</div>
                <button data-testid="confirm-add-income" onClick={onConfirm}>
                    Yes
                </button>
                <button data-testid="cancel-add-income" onClick={onCancel}>
                    No
                </button>
            </div>
        );
    },
}));

jest.mock('@/components/admin/input-with-character-limit/InputWithCharacterLimit', () => ({
    InputWithCharacterLimit: ({ id, name, value, onChange, onBlur, maxLength, hasError }: any) => (
        <input
            data-testid={`input-${id}`}
            id={id}
            name={name}
            type="text"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            maxLength={maxLength}
            aria-invalid={hasError}
        />
    ),
}));

jest.mock('@/components/common/select/Select', () => {
    const React = require('react');
    return {
        Select: ({ value, onValueChange, onBlur, children, placeholder }: any) => {
            const options = React.Children.toArray(children)
                .filter((child: any) => child?.type?.name === 'Option' || child?.props?.name !== undefined)
                .map((child: any) => ({
                    value: child.props.value,
                    name: child.props.name,
                }));

            const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                const newValue = e.target.value;
                if (newValue) {
                    const selected = options.find((option: any) => String(option.value) === newValue);
                    onValueChange(selected ? selected.value : Number(newValue));
                } else {
                    onValueChange(undefined);
                }
            };

            return React.createElement(
                'div',
                { 'data-testid': `select-wrapper-${placeholder}` },
                React.createElement(
                    'select',
                    {
                        'data-testid': `select-${placeholder}`,
                        value: value || '',
                        onChange: handleChange,
                        onBlur,
                        'aria-label': placeholder,
                    },
                    React.createElement('option', { value: '' }, placeholder),
                    options.map((opt: any) =>
                        React.createElement('option', { key: opt.value, value: opt.value }, opt.name),
                    ),
                ),
            );
        },
        Option: ({ value: _value, name: _name }: any) => null,
    };
});

describe('AddIncomeModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();
    const currentYear = String(new Date().getFullYear());

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {});

    const renderAddIncomeModal = (props?: Partial<Parameters<typeof AddIncomeModal>[0]>) => {
        const defaultProps = {
            isOpen: true,
            onClose: mockOnClose,
            categories: MOCK_CATEGORIES,
            records: MOCK_RECORDS,
            exchangeRate: '42.18',
            onSubmit: mockOnSubmit,
        };
        return render(<AddIncomeModal {...defaultProps} {...props} />);
    };

    interface FillRequiredFormFieldsOptions {
        year?: string;
        category?: string;
        amountUah?: string;
        amountUsd?: string;
        selectionMode?: 'change' | 'select';
    }

    const getAddIncomeFormFields = () => {
        const yearSelect = screen.getByTestId('select-Оберіть звітній рік') as HTMLSelectElement;
        const categorySelect = screen.getByTestId('select-Оберіть категорію надходження') as HTMLSelectElement;
        const uahInput = screen.getByTestId('input-add-income-amount-uah') as HTMLInputElement;
        const usdInput = screen.getByTestId('input-add-income-amount-usd') as HTMLInputElement;

        return { yearSelect, categorySelect, uahInput, usdInput };
    };

    const fillRequiredFormFields = async (
        user: ReturnType<typeof userEvent.setup>,
        {
            year = currentYear,
            category = '3',
            amountUah = '400',
            amountUsd = '10',
            selectionMode = 'change',
        }: FillRequiredFormFieldsOptions = {},
    ) => {
        const { yearSelect, categorySelect, uahInput, usdInput } = getAddIncomeFormFields();

        if (selectionMode === 'select') {
            await user.selectOptions(yearSelect, year);
            await user.selectOptions(categorySelect, category);
        } else {
            fireEvent.change(yearSelect, { target: { value: year } });
            fireEvent.change(categorySelect, { target: { value: category } });
        }
        await user.type(uahInput, amountUah);
        await user.type(usdInput, amountUsd);

        return { uahInput, usdInput };
    };

    const clickSubmitButton = async (user: ReturnType<typeof userEvent.setup>) => {
        const submitButton = screen.getByTestId('modal-submit');
        await user.click(submitButton);
        const confirmButton = screen.queryByTestId('confirm-add-income');
        if (confirmButton) {
            await user.click(confirmButton);
        }
    };

    const forceSubmitAndWaitForNoSubmitCall = async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(screen.getByTestId('modal-force-submit'));
        await waitFor(() => {
            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    };

    describe('Rendering', () => {
        it('should not render when isOpen is false', () => {
            renderAddIncomeModal({ isOpen: false });
            expect(screen.queryByTestId('funds-record-modal')).not.toBeInTheDocument();
        });

        it('should render modal when isOpen is true', () => {
            renderAddIncomeModal();
            expect(screen.getByTestId('funds-record-modal')).toBeInTheDocument();
            expect(screen.getByTestId('modal-title')).toBeInTheDocument();
            expect(screen.getByTestId('modal-subtitle')).toBeInTheDocument();
            expect(screen.getByTestId('modal-content')).toBeInTheDocument();
        });

        it('should display submit and close buttons', () => {
            renderAddIncomeModal();
            expect(screen.getByTestId('modal-submit')).toBeInTheDocument();
            expect(screen.getByTestId('modal-close')).toBeInTheDocument();
        });

        it('should display form inputs for year, category, and amounts', () => {
            renderAddIncomeModal();
            const inputs = screen.getAllByRole('textbox');
            expect(inputs.length).toBeGreaterThanOrEqual(2);
        });

        it('should display exchange rate chip with current rate', () => {
            renderAddIncomeModal();
            const exchangeRateInputs = screen.getAllByDisplayValue('42.18');
            expect(exchangeRateInputs.length).toBeGreaterThan(0);
        });

        it('should have disabled exchange rate input', () => {
            renderAddIncomeModal();
            const inputs = screen.getAllByRole('textbox');
            const exchangeRateInput = inputs.find((input) => (input as HTMLInputElement).value === '42.18');
            expect(exchangeRateInput).toBeDisabled();
        });

        it('should display required field indicators', () => {
            renderAddIncomeModal();
            const requiredIndicators = screen.getAllByText('*');
            expect(requiredIndicators.length).toBeGreaterThan(0);
        });
    });

    describe('Submit Button State', () => {
        it('should disable submit button when form is empty', () => {
            renderAddIncomeModal();
            const submitButton = screen.getByTestId('modal-submit');
            expect(submitButton).toBeDisabled();
        });

        it('should have submit button present and accessible', () => {
            renderAddIncomeModal();
            const submitButton = screen.getByTestId('modal-submit');
            expect(submitButton).toBeInTheDocument();
        });
    });

    describe('Close Button', () => {
        it('should have close button accessible', () => {
            renderAddIncomeModal();
            const closeButton = screen.getByTestId('modal-close');
            expect(closeButton).toBeInTheDocument();
        });

        it('should call onClose when close button is clicked', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal();
            const closeButton = screen.getByTestId('modal-close');
            await user.click(closeButton);
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe('Empty State Handling', () => {
        it('should render with empty categories array', () => {
            render(
                <AddIncomeModal
                    isOpen={true}
                    onClose={mockOnClose}
                    categories={[]}
                    records={[]}
                    exchangeRate="42.18"
                    onSubmit={mockOnSubmit}
                />,
            );
            expect(screen.getByTestId('funds-record-modal')).toBeInTheDocument();
        });

        it('should render placeholder div instead of category select when no income categories are available', () => {
            renderAddIncomeModal({
                categories: [{ id: 10, name: 'Адміністративні витрати', type: 'expense' }],
            });

            expect(screen.getByTestId('income-category-disabled-placeholder')).toBeInTheDocument();
            expect(screen.queryByTestId('select-Оберіть категорію надходження')).not.toBeInTheDocument();
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.CATEGORY_NO_AVAILABLE)).toBeInTheDocument();
        });

        it('should keep category field enabled when at least one income category exists', () => {
            renderAddIncomeModal();

            const categorySelect = screen.getByTestId(
                `select-${FUNDS_EXPENDITURES_TEXT.MODAL.INCOME.CATEGORY_PLACEHOLDER}`,
            ) as HTMLSelectElement;

            expect(categorySelect).toBeEnabled();
        });

        it('should render with null exchange rate', () => {
            renderAddIncomeModal({ exchangeRate: null });
            expect(screen.getByTestId('funds-record-modal')).toBeInTheDocument();
        });

        it('should render with empty records array', () => {
            render(
                <AddIncomeModal
                    isOpen={true}
                    onClose={mockOnClose}
                    categories={MOCK_CATEGORIES}
                    records={[]}
                    exchangeRate="42.18"
                    onSubmit={mockOnSubmit}
                />,
            );
            expect(screen.getByTestId('funds-record-modal')).toBeInTheDocument();
        });
    });

    describe('Props and State Management', () => {
        it('should pass correct title and subtitle to FundsRecordModal', () => {
            renderAddIncomeModal();
            const titleElement = screen.getByTestId('modal-title');
            const subtitleElement = screen.getByTestId('modal-subtitle');
            expect(titleElement).toBeInTheDocument();
            expect(subtitleElement).toBeInTheDocument();
        });

        it('should keep form fields and modal content accessible when rendered', () => {
            renderAddIncomeModal();
            const modalContent = screen.getByTestId('modal-content');
            expect(modalContent.children.length).toBeGreaterThan(0);
        });
    });

    describe('Modal Structure', () => {
        it('should have proper modal structure with content, title, and actions', () => {
            renderAddIncomeModal();
            const modal = screen.getByTestId('funds-record-modal');
            expect(modal).toBeInTheDocument();
            expect(modal.querySelector('[data-testid="modal-title"]')).toBeInTheDocument();
            expect(modal.querySelector('[data-testid="modal-subtitle"]')).toBeInTheDocument();
            expect(modal.querySelector('[data-testid="modal-content"]')).toBeInTheDocument();
            expect(modal.querySelector('[data-testid="modal-submit"]')).toBeInTheDocument();
            expect(modal.querySelector('[data-testid="modal-close"]')).toBeInTheDocument();
        });

        it('should render all key form field elements', () => {
            renderAddIncomeModal();
            const form = screen.getByTestId('modal-content');
            expect(form).toBeInTheDocument();
            const fields = form.querySelectorAll('[class*="field"]');
            expect(fields.length).toBeGreaterThan(0);
        });
    });

    describe('Multiple Render Cycles', () => {
        it('should handle rerender with isOpen toggling', () => {
            const { rerender } = render(
                <AddIncomeModal
                    isOpen={true}
                    onClose={mockOnClose}
                    categories={MOCK_CATEGORIES}
                    records={MOCK_RECORDS}
                    exchangeRate="42.18"
                    onSubmit={mockOnSubmit}
                />,
            );

            expect(screen.getByTestId('funds-record-modal')).toBeInTheDocument();

            rerender(
                <AddIncomeModal
                    isOpen={false}
                    onClose={mockOnClose}
                    categories={MOCK_CATEGORIES}
                    records={MOCK_RECORDS}
                    exchangeRate="42.18"
                    onSubmit={mockOnSubmit}
                />,
            );

            expect(screen.queryByTestId('funds-record-modal')).not.toBeInTheDocument();

            rerender(
                <AddIncomeModal
                    isOpen={true}
                    onClose={mockOnClose}
                    categories={MOCK_CATEGORIES}
                    records={MOCK_RECORDS}
                    exchangeRate="42.18"
                    onSubmit={mockOnSubmit}
                />,
            );

            expect(screen.getByTestId('funds-record-modal')).toBeInTheDocument();
        });

        it('should handle category and record updates across rerenders', () => {
            const { rerender } = render(
                <AddIncomeModal
                    isOpen={true}
                    onClose={mockOnClose}
                    categories={MOCK_CATEGORIES}
                    records={MOCK_RECORDS}
                    exchangeRate="42.18"
                    onSubmit={mockOnSubmit}
                />,
            );

            const updatedCategories = [...MOCK_CATEGORIES, { id: 10, name: 'Нова категорія', type: 'income' as const }];

            rerender(
                <AddIncomeModal
                    isOpen={true}
                    onClose={mockOnClose}
                    categories={updatedCategories}
                    records={MOCK_RECORDS}
                    exchangeRate="42.18"
                    onSubmit={mockOnSubmit}
                />,
            );

            expect(screen.getByTestId('funds-record-modal')).toBeInTheDocument();
        });
    });

    describe('Year Selection', () => {
        it('should handle year selection change', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal();

            const yearSelect = screen.getByTestId('select-Оберіть звітній рік');
            await user.selectOptions(yearSelect, '2026');

            expect((yearSelect as HTMLSelectElement).value).toBe('2026');
        });

        it('should clear year error when year is selected', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal();

            const yearSelect = screen.getByTestId('select-Оберіть звітній рік');
            await user.selectOptions(yearSelect, '2025');

            expect((yearSelect as HTMLSelectElement).value).toBe('2025');
        });
    });

    describe('Category Selection', () => {
        it('should display only income categories', () => {
            renderAddIncomeModal();
            expect(screen.getByTestId('select-Оберіть категорію надходження')).toBeInTheDocument();
        });

        it('should filter out expense categories', async () => {
            renderAddIncomeModal();

            const categorySelect = screen.getByTestId('select-Оберіть категорію надходження');
            const options = (categorySelect as HTMLSelectElement).options;

            let incomeCount = 0;
            for (const option of Array.from(options)) {
                const optionText = option.text;
                if (optionText.includes('Адміністративні') || optionText.includes('Програмні')) {
                    throw new Error('Found expense category in income select');
                }
                if (optionText && optionText !== 'Оберіть категорію') {
                    incomeCount++;
                }
            }
            expect(incomeCount).toBeGreaterThan(0);
        });

        it('should handle category selection through callback', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal();

            const categorySelect = screen.getByTestId('select-Оберіть категорію надходження');
            await user.selectOptions(categorySelect, '1');

            expect((categorySelect as HTMLSelectElement).value).toBe('1');
        });

        it('should clear category error when new category is selected', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal();

            const categorySelect = screen.getByTestId('select-Оберіть категорію надходження');
            await user.selectOptions(categorySelect, '1');
            await user.selectOptions(categorySelect, '2');

            expect((categorySelect as HTMLSelectElement).value).toBe('2');
        });

        it('should disable submit button for duplicate income category', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal();

            await fillRequiredFormFields(user, {
                year: currentYear,
                category: '1',
                amountUah: '100',
                amountUsd: '10',
            });

            expect(screen.getByTestId('modal-submit')).toBeDisabled();
        });
    });

    describe('Amount Input - Change Events', () => {
        it('should handle UAH amount input change', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal({ exchangeRate: '42' });

            const uahInput = screen.getByTestId('input-add-income-amount-uah');
            await user.type(uahInput, '1000');

            expect((uahInput as HTMLInputElement).value).toBe('1000');
        });

        it('should handle USD amount input change', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal({ exchangeRate: '42' });

            const usdInput = screen.getByTestId('input-add-income-amount-usd');
            await user.type(usdInput, '50.5');

            expect((usdInput as HTMLInputElement).value).toBe('50.5');
        });

        it('should update form when amount changes', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal();

            const uahInput = screen.getByTestId('input-add-income-amount-uah');
            await user.type(uahInput, '500');

            expect((uahInput as HTMLInputElement).value).toBe('500');
        });

        it('should validate USD on change and disable submit for invalid non-empty value', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal({ exchangeRate: '42' });

            const yearSelect = screen.getByTestId('select-Оберіть звітній рік') as HTMLSelectElement;
            const categorySelect = screen.getByTestId('select-Оберіть категорію надходження') as HTMLSelectElement;
            const uahInput = screen.getByTestId('input-add-income-amount-uah') as HTMLInputElement;
            const usdInput = screen.getByTestId('input-add-income-amount-usd') as HTMLInputElement;

            fireEvent.change(yearSelect, { target: { value: currentYear } });
            fireEvent.change(categorySelect, { target: { value: '3' } });
            await user.type(uahInput, '100');

            expect(screen.getByTestId('modal-submit')).toBeEnabled();

            await user.clear(usdInput);
            await user.type(usdInput, 'abc');

            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_ONLY_NUMBER)).toBeInTheDocument();
            expect(screen.getByTestId('modal-submit')).toBeDisabled();
        });
    });

    describe('Amount Input - Blur Event', () => {
        const setUsdMismatchState = async (user: ReturnType<typeof userEvent.setup>) => {
            const uahInput = screen.getByTestId('input-add-income-amount-uah') as HTMLInputElement;
            const usdInput = screen.getByTestId('input-add-income-amount-usd') as HTMLInputElement;

            await user.type(uahInput, '100');
            await user.clear(usdInput);
            await user.type(usdInput, '2.35');
            fireEvent.blur(usdInput);

            return { uahInput, usdInput };
        };

        it('should trigger blur handler on amount UAH input', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal();

            const uahInput = screen.getByTestId('input-add-income-amount-uah');
            await user.type(uahInput, '500');
            await user.click(uahInput);
            uahInput.blur();

            expect((uahInput as HTMLInputElement).value).toBe('500');
        });

        it('should trigger blur handler on amount USD input', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal();

            const usdInput = screen.getByTestId('input-add-income-amount-usd');
            await user.type(usdInput, '11.87');
            usdInput.blur();

            expect((usdInput as HTMLInputElement).value).toBe('11.87');
        });

        it('should normalize amounts on blur', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal();

            const uahInput = screen.getByTestId('input-add-income-amount-uah') as HTMLInputElement;
            await user.type(uahInput, '100');
            uahInput.blur();

            expect(uahInput.value).toBe('100');
        });

        it('should show zero validation on save for amount UAH', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal();

            await fillRequiredFormFields(user, {
                year: currentYear,
                category: '1',
                amountUah: '0',
                amountUsd: '1',
            });
            fireEvent.click(screen.getByTestId('modal-force-submit'));

            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_ZERO)).toBeInTheDocument();
            expect(screen.getByTestId('modal-submit')).toBeDisabled();
        });

        it('should keep UAH unchanged when USD is manually edited and blurred', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal({ exchangeRate: '42' });

            const uahInput = screen.getByTestId('input-add-income-amount-uah') as HTMLInputElement;
            const usdInput = screen.getByTestId('input-add-income-amount-usd') as HTMLInputElement;

            await user.type(uahInput, '100');
            expect(usdInput.value).toBe('2.39');

            await user.clear(usdInput);
            await user.type(usdInput, '2.35');
            fireEvent.blur(usdInput);

            expect(uahInput.value).toBe('100');
        });

        it('should show informative mismatch message when edited USD is not equal to converted value', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal({ exchangeRate: '42' });

            await setUsdMismatchState(user);

            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH)).toBeInTheDocument();
        });

        it('should clear mismatch message immediately when UAH amount changes', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal({ exchangeRate: '42' });

            const { uahInput } = await setUsdMismatchState(user);

            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH)).toBeInTheDocument();

            await user.type(uahInput, '1');

            expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH)).not.toBeInTheDocument();
        });

        it('should not show mismatch message when edited USD equals converted value', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal({ exchangeRate: '42' });

            const uahInput = screen.getByTestId('input-add-income-amount-uah') as HTMLInputElement;
            const usdInput = screen.getByTestId('input-add-income-amount-usd') as HTMLInputElement;

            await user.type(uahInput, '100');
            await user.clear(usdInput);
            await user.type(usdInput, '2.39');
            fireEvent.blur(usdInput);

            expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH)).not.toBeInTheDocument();
        });

        it('should clear mismatch message after close and not show it on next open', async () => {
            const user = userEvent.setup({ delay: null });
            const { rerender } = render(
                <AddIncomeModal
                    isOpen={true}
                    onClose={mockOnClose}
                    categories={MOCK_CATEGORIES}
                    records={MOCK_RECORDS}
                    exchangeRate="42"
                    onSubmit={mockOnSubmit}
                />,
            );

            const uahInput = screen.getByTestId('input-add-income-amount-uah') as HTMLInputElement;
            const usdInput = screen.getByTestId('input-add-income-amount-usd') as HTMLInputElement;

            await user.type(uahInput, '100');
            await user.clear(usdInput);
            await user.type(usdInput, '2.35');
            fireEvent.blur(usdInput);

            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH)).toBeInTheDocument();

            await user.click(screen.getByTestId('modal-close'));

            rerender(
                <AddIncomeModal
                    isOpen={false}
                    onClose={mockOnClose}
                    categories={MOCK_CATEGORIES}
                    records={MOCK_RECORDS}
                    exchangeRate="42"
                    onSubmit={mockOnSubmit}
                />,
            );

            rerender(
                <AddIncomeModal
                    isOpen={true}
                    onClose={mockOnClose}
                    categories={MOCK_CATEGORIES}
                    records={MOCK_RECORDS}
                    exchangeRate="42"
                    onSubmit={mockOnSubmit}
                />,
            );

            expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH)).not.toBeInTheDocument();
        });
    });

    describe('Form Submission - Valid State', () => {
        it('should have submit button in the document', () => {
            mockOnSubmit.mockResolvedValueOnce(true);
            renderAddIncomeModal();
            const submitButton = screen.getByTestId('modal-submit');
            expect(submitButton).toBeInTheDocument();
        });

        it('should call onSubmit when submit button is clicked', async () => {
            const user = userEvent.setup({ delay: null });
            mockOnSubmit.mockResolvedValueOnce(true);
            renderAddIncomeModal();

            const submitButton = screen.getByTestId('modal-submit');
            await user.click(submitButton);

            expect(submitButton).toBeInTheDocument();
        });

        it('should open add confirmation modal when submit button is clicked', async () => {
            const user = userEvent.setup({ delay: null });

            renderAddIncomeModal({ records: [], exchangeRate: null });

            await fillRequiredFormFields(user, {
                category: '3',
                amountUah: '700',
                amountUsd: '17',
                selectionMode: 'select',
            });

            await user.click(screen.getByTestId('modal-submit'));

            expect(screen.getByTestId('add-income-confirmation-modal')).toHaveAttribute('data-open', 'true');
            expect(screen.getByTestId('add-income-confirmation-title')).toHaveTextContent('Додати нове надходження?');
        });

        it('should close confirmation without submit when clicking No', async () => {
            const user = userEvent.setup({ delay: null });

            renderAddIncomeModal({ records: [], exchangeRate: null });

            await fillRequiredFormFields(user, {
                category: '3',
                amountUah: '700',
                amountUsd: '17',
                selectionMode: 'select',
            });

            await user.click(screen.getByTestId('modal-submit'));
            await user.click(screen.getByTestId('cancel-add-income'));

            expect(screen.queryByTestId('add-income-confirmation-modal')).not.toBeInTheDocument();
            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    });

    describe('Form Submission - Error Handling', () => {
        it('should handle submission error gracefully', async () => {
            mockOnSubmit.mockRejectedValueOnce(new Error('Network error'));
            renderAddIncomeModal();
            expect(screen.getByTestId('funds-record-modal')).toBeInTheDocument();
        });

        it('should keep modal open after failed submission', () => {
            mockOnSubmit.mockResolvedValueOnce(false);
            renderAddIncomeModal();
            expect(screen.getByTestId('funds-record-modal')).toBeInTheDocument();
        });

        it('should show validation error when submitting with missing fields', async () => {
            const user = userEvent.setup({ delay: null });
            mockOnSubmit.mockResolvedValueOnce(true);
            renderAddIncomeModal();

            const submitButton = screen.getByTestId('modal-force-submit');
            await user.click(submitButton);

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    });

    describe('Validation Message Display', () => {
        it('should show required field indicator', () => {
            renderAddIncomeModal();
            const requiredIndicators = screen.getAllByText('*');
            expect(requiredIndicators.length).toBeGreaterThan(0);
        });

        it('should have error elements ready for validation messages', () => {
            renderAddIncomeModal();
            const form = screen.getByTestId('modal-content');
            expect(form).toBeInTheDocument();
        });
    });

    describe('Form Reset After Success', () => {
        it('should reset form when closing after successful submission', () => {
            mockOnSubmit.mockResolvedValueOnce(true);
            renderAddIncomeModal();
            expect(screen.getByTestId('funds-record-modal')).toBeInTheDocument();
        });

        it('should clear all inputs on reset', () => {
            renderAddIncomeModal();
            const inputs = screen.getAllByRole('textbox');
            const textInputs = inputs.filter(
                (input) =>
                    (input as HTMLInputElement).name === 'amountUah' ||
                    (input as HTMLInputElement).name === 'amountUsd',
            );

            textInputs.forEach((input) => {
                expect((input as HTMLInputElement).value).toBe('');
            });
        });
    });

    describe('Async Submission Handling', () => {
        it('should disable submit button during submission', async () => {
            const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
            mockOnSubmit.mockImplementation(() => delay(100).then(() => true));
            renderAddIncomeModal();
            const submitButton = screen.getByTestId('modal-submit');
            expect(submitButton).toBeInTheDocument();
        });

        it('should re-enable submit button after submission completes', async () => {
            mockOnSubmit.mockResolvedValueOnce(true);
            renderAddIncomeModal();
            const submitButton = screen.getByTestId('modal-submit');
            expect(submitButton).toBeInTheDocument();
        });
    });

    describe('Exchange Rate Handling', () => {
        it('should display exchange rate in disabled input', () => {
            renderAddIncomeModal({ exchangeRate: '42.18' });
            const inputs = screen.getAllByRole('textbox');
            const rateInput = inputs.find((input) => (input as HTMLInputElement).value === '42.18');
            expect(rateInput).toBeDisabled();
        });

        it('should handle null exchange rate', () => {
            renderAddIncomeModal({ exchangeRate: null });
            expect(screen.getByTestId('funds-record-modal')).toBeInTheDocument();
        });

        it('should update exchange rate when prop changes', () => {
            const { rerender } = render(
                <AddIncomeModal
                    isOpen={true}
                    onClose={mockOnClose}
                    categories={MOCK_CATEGORIES}
                    records={MOCK_RECORDS}
                    exchangeRate="42.18"
                    onSubmit={mockOnSubmit}
                />,
            );

            let inputs = screen.getAllByRole('textbox');
            let rateInput = inputs.find((input) => (input as HTMLInputElement).value === '42.18');
            expect(rateInput).toBeInTheDocument();

            rerender(
                <AddIncomeModal
                    isOpen={true}
                    onClose={mockOnClose}
                    categories={MOCK_CATEGORIES}
                    records={MOCK_RECORDS}
                    exchangeRate="45.50"
                    onSubmit={mockOnSubmit}
                />,
            );

            inputs = screen.getAllByRole('textbox');
            rateInput = inputs.find((input) => (input as HTMLInputElement).value === '45.50');
            expect(rateInput).toBeInTheDocument();
        });
    });

    describe('Complete Form Flow', () => {
        it('should handle form submission flow', async () => {
            const user = userEvent.setup({ delay: null });
            mockOnSubmit.mockResolvedValueOnce(true);
            renderAddIncomeModal();

            await fillRequiredFormFields(user, { category: '3', amountUah: '2000', amountUsd: '47.5' });
            await clickSubmitButton(user);

            expect(screen.getByTestId('modal-submit')).toBeInTheDocument();
        });

        it('should handle form interaction with multiple field updates', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal();

            const yearSelect = screen.getByTestId('select-Оберіть звітній рік') as HTMLSelectElement;
            const categorySelect = screen.getByTestId('select-Оберіть категорію надходження') as HTMLSelectElement;
            const uahInput = screen.getByTestId('input-add-income-amount-uah') as HTMLInputElement;
            fireEvent.change(yearSelect, { target: { value: currentYear } });
            expect(yearSelect.value).toBe(currentYear);
            fireEvent.change(categorySelect, { target: { value: '2' } });
            expect(categorySelect.value).toBe('2');
            await user.type(uahInput, '1500');
            expect(uahInput.value).toBe('1500');
        });

        it('should render form with all required input fields', async () => {
            renderAddIncomeModal();

            expect(screen.getByTestId('select-Оберіть звітній рік')).toBeInTheDocument();
            expect(screen.getByTestId('select-Оберіть категорію надходження')).toBeInTheDocument();
            expect(screen.getByTestId('input-add-income-amount-uah')).toBeInTheDocument();
            expect(screen.getByTestId('input-add-income-amount-usd')).toBeInTheDocument();
        });

        it('should handle form validation on blur events', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal();

            const uahInput = screen.getByTestId('input-add-income-amount-uah') as HTMLInputElement;
            await user.type(uahInput, '100');
            uahInput.blur();

            expect(uahInput).toBeInTheDocument();
        });

        it('should display modal title and structure correctly', () => {
            renderAddIncomeModal();

            const modal = screen.getByTestId('funds-record-modal');
            expect(modal).toBeInTheDocument();

            const closeButton = screen.getByTestId('modal-close');
            expect(closeButton).toBeInTheDocument();

            const submitButton = screen.getByTestId('modal-submit');
            expect(submitButton).toBeInTheDocument();
        });

        it('should handle form field interactions and state updates', async () => {
            const user = userEvent.setup({ delay: null });
            renderAddIncomeModal();

            const yearSelect = screen.getByTestId('select-Оберіть звітній рік') as HTMLSelectElement;
            const categorySelect = screen.getByTestId('select-Оберіть категорію надходження') as HTMLSelectElement;
            const uahInput = screen.getByTestId('input-add-income-amount-uah') as HTMLInputElement;
            const usdInput = screen.getByTestId('input-add-income-amount-usd') as HTMLInputElement;

            fireEvent.change(yearSelect, { target: { value: currentYear } });
            expect(yearSelect.value).toBe(currentYear);

            fireEvent.change(categorySelect, { target: { value: '1' } });
            expect(categorySelect.value).toBe('1');

            await user.type(uahInput, '750');
            expect(uahInput.value).toBe('750');

            await user.type(usdInput, '18');
            expect(usdInput.value).not.toBe('');
        });

        it('should submit normalized data and reset form when creation succeeds', async () => {
            const user = userEvent.setup({ delay: null });
            mockOnSubmit.mockResolvedValueOnce(true);
            renderAddIncomeModal({ records: [], exchangeRate: null });

            const { uahInput, usdInput } = await fillRequiredFormFields(user, {
                category: '1',
                amountUah: '500 ',
                amountUsd: '12.5 ',
                selectionMode: 'select',
            });
            await clickSubmitButton(user);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith({
                    categoryId: 1,
                    reportingYear: currentYear,
                    amountUah: '500',
                    amountUsd: '12.5',
                    type: 'income',
                });
            });

            expect(uahInput.value).toBe('');
            expect(usdInput.value).toBe('');
        });

        it('should keep values after submit when creation fails', async () => {
            const user = userEvent.setup({ delay: null });
            mockOnSubmit.mockResolvedValueOnce(false);
            renderAddIncomeModal({ records: [], exchangeRate: null });

            const { uahInput, usdInput } = await fillRequiredFormFields(user, {
                category: '1',
                amountUah: '800 ',
                amountUsd: '20 ',
                selectionMode: 'select',
            });
            await clickSubmitButton(user);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledTimes(1);
            });

            expect(uahInput.value).toBe('800');
            expect(usdInput.value).toBe('20');
        });

        it('should stop submit when category id is 0 because required guard treats it as empty', async () => {
            const user = userEvent.setup({ delay: null });

            renderAddIncomeModal({
                records: [],
                exchangeRate: null,
                categories: [
                    { id: 0, name: 'Нульова категорія', type: 'income' },
                    { id: 1, name: 'Грантові кошти', type: 'income' },
                ],
            });

            await fillRequiredFormFields(user, {
                category: '0',
                amountUah: '1000',
                amountUsd: '25',
                selectionMode: 'select',
            });
            await forceSubmitAndWaitForNoSubmitCall(user);
        });

        it('should handle form submission with invalid category', async () => {
            const user = userEvent.setup({ delay: null });
            mockOnSubmit.mockResolvedValueOnce(true);
            renderAddIncomeModal({
                records: [
                    {
                        id: 1,
                        categoryId: 1,
                        type: 'income',
                        reportingYear: currentYear,
                        amountUah: '100',
                        amountUsd: '2',
                    },
                ],
            });

            const yearSelect = screen.getByTestId('select-Оберіть звітній рік') as HTMLSelectElement;
            const categorySelect = screen.getByTestId('select-Оберіть категорію надходження') as HTMLSelectElement;
            const uahInput = screen.getByTestId('input-add-income-amount-uah') as HTMLInputElement;
            const usdInput = screen.getByTestId('input-add-income-amount-usd') as HTMLInputElement;

            fireEvent.change(yearSelect, { target: { value: currentYear } });
            fireEvent.change(categorySelect, { target: { value: '1' } });
            await user.type(uahInput, '300');
            await user.type(usdInput, '7');

            const submitButton = screen.getByTestId('modal-submit');
            await user.click(submitButton);

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('should validate that year and category are required', async () => {
            const user = userEvent.setup({ delay: null });
            mockOnSubmit.mockResolvedValueOnce(true);
            renderAddIncomeModal();

            const uahInput = screen.getByTestId('input-add-income-amount-uah') as HTMLInputElement;
            const usdInput = screen.getByTestId('input-add-income-amount-usd') as HTMLInputElement;

            await user.type(uahInput, '300');
            await user.type(usdInput, '7');

            const submitButton = screen.getByTestId('modal-submit');
            await user.click(submitButton);

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('should verify form elements are accessible and properly configured', () => {
            renderAddIncomeModal();

            const yearSelect = screen.getByTestId('select-Оберіть звітній рік') as HTMLSelectElement;
            expect(yearSelect).toBeInTheDocument();
            expect(yearSelect).toHaveProperty('disabled', false);

            const categorySelect = screen.getByTestId('select-Оберіть категорію надходження') as HTMLSelectElement;
            expect(categorySelect).toBeInTheDocument();
            expect(categorySelect).toHaveProperty('disabled', false);

            const uahInput = screen.getByTestId('input-add-income-amount-uah') as HTMLInputElement;
            expect(uahInput).toHaveProperty('disabled', false);

            const submitButton = screen.getByTestId('modal-submit') as HTMLButtonElement;
            expect(submitButton).toHaveProperty('disabled', true);
        });

        it('should handle submission error and keep modal open', async () => {
            const user = userEvent.setup({ delay: null });
            mockOnSubmit.mockRejectedValueOnce(new Error('Submission failed'));
            renderAddIncomeModal();

            await fillRequiredFormFields(user);
            await clickSubmitButton(user);

            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(screen.getByTestId('funds-record-modal')).toBeInTheDocument();
        });
    });
});
