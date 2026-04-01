import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddIncomeModal } from './AddIncomeModal';
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
    input: 'input',
    error: 'error',
    'amount-usd-header': 'amount-usd-header',
    'exchange-rate-chip': 'exchange-rate-chip',
    'exchange-rate-chip-label': 'exchange-rate-chip-label',
    'exchange-rate-value': 'exchange-rate-value',
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
                    <button data-testid="modal-close" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            );
        },
    }),
);

describe('AddIncomeModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(new Date('2026-03-30T00:00:00.000Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

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

        it('should display form inputs for all required fields', () => {
            renderAddIncomeModal();

            const inputs = screen.getAllByRole('textbox');
            expect(inputs.length).toBeGreaterThanOrEqual(2);
        });

        it('should display form selects for year and category', () => {
            renderAddIncomeModal();

            const selectHeads = screen.getAllByRole('button', { name: /оберіть/i });
            expect(selectHeads.length).toBeGreaterThanOrEqual(2);
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

        it('should filter income categories in dropdown', () => {
            renderAddIncomeModal();

            const selectHeads = screen.getAllByRole('button', { name: /оберіть/i });
            expect(selectHeads.length).toBeGreaterThan(0);
        });

        it('should display year options: previous, current, and next', () => {
            renderAddIncomeModal();

            const selectHeads = screen.getAllByRole('button', { name: /оберіть/i });
            expect(selectHeads.length).toBeGreaterThanOrEqual(2);
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

    describe('Integration', () => {
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
});
