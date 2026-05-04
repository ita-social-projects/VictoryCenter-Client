import { ChangeEvent, ComponentProps, ReactNode } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { AddProgramExpenseRecordModal } from './AddProgramExpenseRecordModal';

interface ModalProps {
    children: ReactNode;
    isOpen: boolean;
}

jest.mock('@/components/common/modal/Modal', () => {
    const Modal = ({ children, isOpen }: ModalProps) =>
        isOpen ? <div data-testid="add-program-expense-modal">{children}</div> : null;

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
    }: {
        id: string;
        value: string;
        onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    }) => <input data-testid={id} value={value} onChange={onChange} />,
}));

jest.mock('@/components/common/select/Select', () => {
    const React = require('react');

    const Select = ({ value, onValueChange, placeholder, children }: any) => {
        const options = React.Children.toArray(children)
            .filter((child: any) => child?.props)
            .map((child: any) => ({ value: child.props.value, name: child.props.name }));

        return (
            <select
                data-testid={placeholder}
                value={value ?? ''}
                onChange={(event) => {
                    const selectedOption = options.find((option: any) => String(option.value) === event.target.value);
                    onValueChange(selectedOption?.value);
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
    getReportingYearOptions: () => ['2026', '2025'],
}));

const PROGRAMS = [
    { id: 2, name: 'Program B' },
    { id: 1, name: 'Program A' },
];

const renderModal = (props: Partial<ComponentProps<typeof AddProgramExpenseRecordModal>> = {}) =>
    render(
        <AddProgramExpenseRecordModal isOpen programs={PROGRAMS} exchangeRate="42.15" onClose={jest.fn()} {...props} />,
    );

describe('AddProgramExpenseRecordModal', () => {
    it('renders modal content, disabled submit button and sorted programs', () => {
        renderModal();

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.MODAL.ADD.TITLE)).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.MODAL.ADD.SUBTITLE)).toBeInTheDocument();
        expect(screen.getByLabelText(FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL)).toHaveValue('42.15');
        expect(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.MODAL.ADD.SUBMIT_BUTTON })).toBeDisabled();

        const programSelect = screen.getByTestId(PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER);
        const programOptions = within(programSelect)
            .getAllByRole('option')
            .map((option) => option.textContent);

        expect(programOptions).toEqual(['placeholder', 'Program A', 'Program B']);
    });

    it('renders disabled program placeholder when programs are unavailable', () => {
        renderModal({ programs: [] });

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_NO_AVAILABLE)).toBeInTheDocument();
        expect(screen.queryByTestId(PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER)).not.toBeInTheDocument();
    });

    it('normalizes program expense amount inputs', () => {
        renderModal();

        const amountUahInput = screen.getByTestId('add-program-expense-amount-uah');
        const amountUsdInput = screen.getByTestId('add-program-expense-amount-usd');

        fireEvent.change(amountUahInput, { target: { value: '123 456 789 0' } });
        fireEvent.change(amountUsdInput, { target: { value: '12.345abc' } });

        expect(amountUahInput).toHaveValue('123456789');
        expect(amountUsdInput).toHaveValue('12,34');

        fireEvent.change(amountUsdInput, { target: { value: ',50' } });

        expect(amountUsdInput).toHaveValue('');
    });

    it('updates selected program value', () => {
        renderModal();

        const programSelect = screen.getByTestId(PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER);

        fireEvent.change(programSelect, { target: { value: '1' } });

        expect(programSelect).toHaveValue('1');
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

        fireEvent.change(screen.getByTestId(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_PLACEHOLDER), {
            target: { value: '2025' },
        });
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
            <AddProgramExpenseRecordModal isOpen programs={PROGRAMS} exchangeRate={null} onClose={jest.fn()} />,
        );

        const amountUahInput = screen.getByTestId('add-program-expense-amount-uah');

        fireEvent.change(amountUahInput, { target: { value: '100' } });
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));

        expect(screen.getByTestId('close-confirmation')).toBeInTheDocument();

        rerender(
            <AddProgramExpenseRecordModal isOpen={false} programs={PROGRAMS} exchangeRate={null} onClose={jest.fn()} />,
        );
        rerender(<AddProgramExpenseRecordModal isOpen programs={PROGRAMS} exchangeRate={null} onClose={jest.fn()} />);

        expect(screen.getByTestId('add-program-expense-amount-uah')).toHaveValue('');
        expect(screen.queryByTestId('close-confirmation')).not.toBeInTheDocument();
        expect(screen.getByLabelText(FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL)).toHaveValue('');
    });
});
