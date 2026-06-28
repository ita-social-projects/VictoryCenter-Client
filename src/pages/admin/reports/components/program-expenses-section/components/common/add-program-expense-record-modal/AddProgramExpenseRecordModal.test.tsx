import { ChangeEvent, ComponentProps, ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { AddProgramExpenseRecordModal } from './AddProgramExpenseRecordModal';

interface ModalProps {
    children: ReactNode;
    isOpen: boolean;
}

jest.mock('@/components/common/modal/Modal', () => {
    const Modal = ({ children, isOpen, onClose }: ModalProps & { onClose?: () => void }) =>
        isOpen ? (
            <div data-testid="add-program-expense-modal">
                {children}
                {onClose && (
                    <button data-testid="mock-modal-close-btn" onClick={onClose}>
                        Mock Close
                    </button>
                )}
            </div>
        ) : null;

    Modal.Title = ({ children }: { children: ReactNode }) => <div data-testid="modal-title">{children}</div>;
    Modal.Content = ({ children }: { children: ReactNode }) => <div data-testid="modal-content">{children}</div>;
    Modal.Actions = ({ children }: { children: ReactNode }) => <div data-testid="modal-actions">{children}</div>;

    return { Modal };
});

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({
        isOpen,
        title,
        onConfirm,
        onCancel,
    }: {
        isOpen: boolean;
        title: string;
        onConfirm: () => void;
        onCancel: () => void;
    }) =>
        isOpen ? (
            <div data-testid="close-confirmation">
                <p>{title}</p>
                <button type="button" onClick={onConfirm}>
                    Confirm
                </button>
                <button type="button" onClick={onCancel}>
                    Cancel confirmation
                </button>
            </div>
        ) : null,
}));

jest.mock('@/components/admin/input-with-character-limit/InputWithCharacterLimit', () => ({
    InputWithCharacterLimit: ({
        id,
        value,
        onChange,
        onBlur,
    }: {
        id: string;
        value: string;
        onChange: (event: ChangeEvent<HTMLInputElement>) => void;
        onBlur?: () => void;
    }) => <input data-testid={id} value={value} onChange={onChange} onBlur={onBlur} />,
}));

jest.mock('@/utils/functions/get-reporting-year-options/get-reporting-year-options', () => ({
    getReportingYearOptions: () => ['2026', '2025'],
}));

const PROGRAMS = [
    { id: 2, name: 'Program B' },
    { id: 1, name: 'Program A' },
];

const RECORDS = [
    {
        id: 1,
        programId: 1,
        programName: 'Program A',
        type: 'expense' as const,
        reportingYear: '2025',
        amountUah: '100',
        amountUsd: '10',
    },
];

const renderModal = (props: Partial<ComponentProps<typeof AddProgramExpenseRecordModal>> = {}) =>
    render(
        <AddProgramExpenseRecordModal
            isOpen
            programs={PROGRAMS}
            records={RECORDS}
            exchangeRate="42.15"
            onClose={jest.fn()}
            onSubmit={jest.fn().mockResolvedValue(true)}
            {...props}
        />,
    );

const getSelectToggle = (displayValue: string): HTMLButtonElement => {
    const button = screen.getByText(displayValue).closest('button');

    if (!(button instanceof HTMLButtonElement)) {
        throw new Error(`Select toggle for "${displayValue}" was not found`);
    }

    return button;
};

const selectOption = (currentDisplayValue: string, nextDisplayValue: string) => {
    fireEvent.click(getSelectToggle(currentDisplayValue));
    fireEvent.click(screen.getByRole('button', { name: nextDisplayValue }));
};

describe('AddProgramExpenseRecordModal', () => {
    it('renders modal content, disabled submit button and sorted programs', () => {
        renderModal();

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.MODAL.ADD.TITLE)).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.MODAL.ADD.SUBTITLE)).toBeInTheDocument();
        expect(screen.getByLabelText(FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL)).toHaveValue('42.15');
        expect(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.MODAL.ADD.SUBMIT_BUTTON })).toBeDisabled();

        fireEvent.click(getSelectToggle(PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER));
        const programOptions = screen
            .getAllByRole('button', { name: /^Program [AB]$/ })
            .map((option) => option.textContent);

        expect(programOptions).toEqual(['Program A', 'Program B']);
    });

    it('renders disabled program placeholder when programs are unavailable', () => {
        renderModal({ programs: [] });

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_NO_AVAILABLE)).toBeInTheDocument();
        expect(screen.queryByText(PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER)).not.toBeInTheDocument();
    });

    it('validates program expense amount inputs on change and blur', () => {
        renderModal();

        const amountUahInput = screen.getByTestId('add-program-expense-amount-uah');
        const amountUsdInput = screen.getByTestId('add-program-expense-amount-usd');

        fireEvent.change(amountUahInput, { target: { value: '1234567890' } });
        fireEvent.change(amountUsdInput, { target: { value: 'abc' } });

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_MAX_DIGITS)).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_ONLY_NUMBER)).toBeInTheDocument();

        fireEvent.change(amountUsdInput, { target: { value: '0' } });

        expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_ZERO)).not.toBeInTheDocument();

        fireEvent.change(amountUahInput, { target: { value: '0' } });
        fireEvent.blur(amountUahInput);
        fireEvent.blur(amountUsdInput);

        expect(screen.getAllByText(FUNDS_EXPENDITURES_TEXT.VALIDATION.AMOUNT_NOT_ZERO)).toHaveLength(2);
    });

    it('normalizes UAH amount on blur', () => {
        renderModal();

        const amountUahInput = screen.getByTestId('add-program-expense-amount-uah');

        fireEvent.change(amountUahInput, { target: { value: ' 100.50 ' } });
        fireEvent.blur(amountUahInput);

        expect(amountUahInput).toHaveValue('100,50');
    });

    it('updates selected program value', () => {
        renderModal();

        selectOption(PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER, 'Program A');

        expect(getSelectToggle('Program A')).toBeInTheDocument();
    });

    it('shows required errors on blur for empty selects', () => {
        renderModal();

        fireEvent.blur(getSelectToggle(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_PLACEHOLDER));
        fireEvent.blur(getSelectToggle(PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER));

        expect(screen.getAllByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).toHaveLength(2);
    });

    it('does not validate selects when focus stays inside the select field', () => {
        renderModal();

        const reportingYearToggle = getSelectToggle(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_PLACEHOLDER);
        const programToggle = getSelectToggle(PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER);

        fireEvent.blur(reportingYearToggle, { relatedTarget: reportingYearToggle });
        fireEvent.blur(programToggle, { relatedTarget: programToggle });

        expect(screen.queryByText(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)).not.toBeInTheDocument();
    });

    it('shows duplicate program category error and keeps submit disabled', () => {
        renderModal();

        selectOption(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_PLACEHOLDER, '2026');
        selectOption(PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER, 'Program A');
        fireEvent.change(screen.getByTestId('add-program-expense-amount-uah'), { target: { value: '100' } });

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.VALIDATION.PROGRAM_UNIQUE)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.MODAL.ADD.SUBMIT_BUTTON })).toBeDisabled();
    });

    it('enables submit when all validation rules pass', () => {
        renderModal();

        selectOption(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_PLACEHOLDER, '2026');
        selectOption(PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER, 'Program B');
        fireEvent.change(screen.getByTestId('add-program-expense-amount-uah'), { target: { value: '100' } });

        expect(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.MODAL.ADD.SUBMIT_BUTTON })).toBeEnabled();
    });

    it('closes immediately when the form is clean', () => {
        const onClose = jest.fn();
        renderModal({ onClose });

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('close-confirmation')).not.toBeInTheDocument();
    });

    it('asks for confirmation before closing dirty form and handles cancel or confirm', () => {
        const onClose = jest.fn();
        renderModal({ onClose });

        selectOption(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_PLACEHOLDER, '2025');
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));

        expect(screen.getByTestId('close-confirmation')).toHaveTextContent(
            PROGRAM_EXPENSES_TEXT.MODAL.ADD.CONFIRM_CLOSE_TITLE,
        );
        expect(onClose).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'Cancel confirmation' }));

        expect(screen.queryByTestId('close-confirmation')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('resets form state and close confirmation when modal closes', () => {
        const { rerender } = render(
            <AddProgramExpenseRecordModal
                isOpen
                programs={PROGRAMS}
                records={RECORDS}
                exchangeRate={null}
                onClose={jest.fn()}
                onSubmit={jest.fn().mockResolvedValue(true)}
            />,
        );

        const amountUahInput = screen.getByTestId('add-program-expense-amount-uah');

        fireEvent.change(amountUahInput, { target: { value: '100' } });
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));

        expect(screen.getByTestId('close-confirmation')).toBeInTheDocument();

        rerender(
            <AddProgramExpenseRecordModal
                isOpen={false}
                programs={PROGRAMS}
                records={RECORDS}
                exchangeRate={null}
                onClose={jest.fn()}
                onSubmit={jest.fn().mockResolvedValue(true)}
            />,
        );
        rerender(
            <AddProgramExpenseRecordModal
                isOpen
                programs={PROGRAMS}
                records={RECORDS}
                exchangeRate={null}
                onClose={jest.fn()}
                onSubmit={jest.fn().mockResolvedValue(true)}
            />,
        );

        expect(screen.getByTestId('add-program-expense-amount-uah')).toHaveValue('');
        expect(screen.queryByTestId('close-confirmation')).not.toBeInTheDocument();
        expect(screen.getByLabelText(FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL)).toHaveValue('');
    });

    it('auto-fills USD when UAH is entered and shows mismatch message on manual USD change', () => {
        renderModal({ exchangeRate: '40' });

        fireEvent.change(screen.getByTestId('add-program-expense-amount-uah'), { target: { value: '100' } });

        expect(screen.getByTestId('add-program-expense-amount-usd')).not.toHaveValue('');

        fireEvent.change(screen.getByTestId('add-program-expense-amount-usd'), { target: { value: '999' } });
        fireEvent.blur(screen.getByTestId('add-program-expense-amount-usd'));

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH)).toBeInTheDocument();
    });

    describe('edit mode', () => {
        const recordToEdit = {
            id: 1,
            programId: 1,
            programName: 'Program A',
            type: 'expense' as const,
            reportingYear: '2025',
            amountUah: '100',
            amountUsd: '10',
        };

        it('renders edit mode titles and populates form with recordToEdit details', () => {
            renderModal({ recordToEdit });

            expect(screen.getByText(PROGRAM_EXPENSES_TEXT.MODAL.EDIT.TITLE)).toBeInTheDocument();
            expect(screen.getByText(PROGRAM_EXPENSES_TEXT.MODAL.EDIT.SUBTITLE)).toBeInTheDocument();

            expect(screen.getByRole('button', { name: '2025' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Program A' })).toBeInTheDocument();
            expect(screen.getByTestId('add-program-expense-amount-uah')).toHaveValue('100');
            expect(screen.getByTestId('add-program-expense-amount-usd')).toHaveValue('10');

            expect(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.MODAL.EDIT.SUBMIT_BUTTON })).toBeDisabled();
        });

        it('calls onSubmit with modified data when save is clicked', async () => {
            const onSubmit = jest.fn().mockResolvedValue(true);
            renderModal({ recordToEdit, onSubmit });

            fireEvent.change(screen.getByTestId('add-program-expense-amount-uah'), { target: { value: '200' } });
            expect(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.MODAL.EDIT.SUBMIT_BUTTON })).toBeEnabled();

            fireEvent.click(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.MODAL.EDIT.SUBMIT_BUTTON }));

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith({
                    programId: 1,
                    reportingYear: '2025',
                    amountUah: '200',
                    amountUsd: '4,75', // auto calculated based on rate 42.15 and rounded up
                });
            });
        });

        it('displays correct confirmation close title when closing a dirty form in edit mode', () => {
            const onClose = jest.fn();
            renderModal({ recordToEdit, onClose });

            fireEvent.change(screen.getByTestId('add-program-expense-amount-uah'), { target: { value: '200' } });
            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));

            expect(screen.getByTestId('close-confirmation')).toHaveTextContent(
                PROGRAM_EXPENSES_TEXT.MODAL.EDIT.CONFIRM_CLOSE_TITLE,
            );
        });

        it('blocks close requests when submitting is pending', async () => {
            const onClose = jest.fn();
            let resolveSubmit!: (val: boolean) => void;
            const onSubmit = jest.fn().mockImplementation(() => new Promise((resolve) => {
                resolveSubmit = resolve;
            }));

            renderModal({ recordToEdit, onSubmit, onClose });

            fireEvent.change(screen.getByTestId('add-program-expense-amount-uah'), { target: { value: '200' } });
            fireEvent.click(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.MODAL.EDIT.SUBMIT_BUTTON }));

            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL })).toBeDisabled();

            fireEvent.click(screen.getByTestId('mock-modal-close-btn'));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.queryByTestId('close-confirmation')).not.toBeInTheDocument();

            resolveSubmit(true);
        });
    });
});
