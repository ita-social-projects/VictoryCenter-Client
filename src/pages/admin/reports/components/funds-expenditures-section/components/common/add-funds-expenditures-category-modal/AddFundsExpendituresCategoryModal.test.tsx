import { render, screen, fireEvent } from '@testing-library/react';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { AddFundsExpendituresCategoryModal } from './AddFundsExpendituresCategoryModal';

jest.mock('@/components/common/modal/Modal', () => {
    const Modal = ({ isOpen, onClose, children }: any) => {
        if (!isOpen) return null;
        return (
            <div data-testid="modal">
                <button data-testid="modal-close" onClick={onClose} />
                {children}
            </div>
        );
    };
    Modal.Title = ({ children }: any) => <>{children}</>;
    Modal.Content = ({ children }: any) => <>{children}</>;
    Modal.Actions = ({ children }: any) => <>{children}</>;
    return { Modal };
});

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, title, onConfirm, onCancel, onClose }: any) => (
        <div data-testid="confirm-modal" data-open={String(isOpen)}>
            <span>{title}</span>
            <button data-testid="confirm-yes" onClick={onConfirm}>
                Yes
            </button>
            <button data-testid="confirm-no" onClick={onCancel}>
                No
            </button>
            <button data-testid="confirm-close" onClick={onClose}>
                Close
            </button>
        </div>
    ),
}));

jest.mock('@/components/admin/input-with-character-limit/InputWithCharacterLimit', () => ({
    InputWithCharacterLimit: ({ id, value, onChange, onBlur, placeholder }: any) => (
        <input data-testid={id} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} />
    ),
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
                onChange={(e) => {
                    const selected = options.find((item: any) => item.value === e.target.value);
                    onValueChange(selected?.value);
                }}
            >
                <option value="">placeholder</option>
                {options.map((option: any) => (
                    <option key={option.value} value={option.value}>
                        {option.name}
                    </option>
                ))}
            </select>
        );
    };

    Select.Option = (_props: any) => null;

    return { Select };
});

describe('AddFundsExpendituresCategoryModal', () => {
    const TYPE_SELECT = FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.TYPE_PLACEHOLDER;
    const NAME_INPUT = 'category-name';
    const SUBMIT_BUTTON_NAME = FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.SUBMIT_BUTTON;

    const renderOpen = (onClose = jest.fn()) =>
        render(<AddFundsExpendituresCategoryModal isOpen={true} onClose={onClose} />);

    const getSubmitButton = () => screen.getByRole('button', { name: SUBMIT_BUTTON_NAME });

    it('renders nothing when isOpen is false', () => {
        render(<AddFundsExpendituresCategoryModal isOpen={false} onClose={jest.fn()} />);
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('renders title and subtitle when open', () => {
        renderOpen();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.TITLE)).toBeInTheDocument();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.SUBTITLE)).toBeInTheDocument();
    });

    it('renders submit button with correct label', () => {
        renderOpen();
        expect(getSubmitButton()).toBeInTheDocument();
    });

    describe('submit button disabled state', () => {
        it('is disabled by default', () => {
            renderOpen();
            expect(getSubmitButton()).toBeDisabled();
        });

        it('is disabled when type is selected but name is empty', () => {
            renderOpen();
            fireEvent.change(screen.getByTestId(TYPE_SELECT), { target: { value: 'expense' } });
            expect(getSubmitButton()).toBeDisabled();
        });

        it('is disabled when name is entered but type is not selected', () => {
            renderOpen();
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'Category A' } });
            expect(getSubmitButton()).toBeDisabled();
        });

        it('is disabled when name contains only whitespace', () => {
            renderOpen();
            fireEvent.change(screen.getByTestId(TYPE_SELECT), { target: { value: 'income' } });
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: '   ' } });
            expect(getSubmitButton()).toBeDisabled();
        });

        it('is enabled when both type and non-empty name are set', () => {
            renderOpen();
            fireEvent.change(screen.getByTestId(TYPE_SELECT), { target: { value: 'expense' } });
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'Category A' } });
            expect(getSubmitButton()).not.toBeDisabled();
        });
    });

    it('clicking submit does not throw when enabled', () => {
        renderOpen();
        fireEvent.change(screen.getByTestId(TYPE_SELECT), { target: { value: 'income' } });
        fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'Valid name' } });
        expect(() => fireEvent.click(getSubmitButton())).not.toThrow();
    });

    it('normalizes whitespace in name input on blur', () => {
        renderOpen();
        const nameInput = screen.getByTestId(NAME_INPUT);
        fireEvent.change(nameInput, { target: { value: '  foo   bar  ' } });
        fireEvent.blur(nameInput);
        expect(nameInput).toHaveValue('foo bar');
    });

    describe('close behavior', () => {
        it('calls onClose directly when form is clean', () => {
            const onClose = jest.fn();
            renderOpen(onClose);
            fireEvent.click(screen.getByTestId('modal-close'));
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'false');
        });

        it('opens confirmation modal when type is dirty on close request', () => {
            const onClose = jest.fn();
            renderOpen(onClose);
            fireEvent.change(screen.getByTestId(TYPE_SELECT), { target: { value: 'expense' } });
            fireEvent.click(screen.getByTestId('modal-close'));
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'true');
        });

        it('opens confirmation modal when name is dirty on close request', () => {
            const onClose = jest.fn();
            renderOpen(onClose);
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'Some text' } });
            fireEvent.click(screen.getByTestId('modal-close'));
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'true');
        });

        it('shows correct title in confirmation modal', () => {
            renderOpen();
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'dirty' } });
            fireEvent.click(screen.getByTestId('modal-close'));
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.CONFIRM_CLOSE_TITLE)).toBeInTheDocument();
        });

        it('dismisses confirmation and keeps modal open on cancel via onCancel', () => {
            const onClose = jest.fn();
            renderOpen(onClose);
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'dirty' } });
            fireEvent.click(screen.getByTestId('modal-close'));
            fireEvent.click(screen.getByTestId('confirm-no'));
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'false');
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('dismisses confirmation and keeps modal open on cancel via onClose', () => {
            const onClose = jest.fn();
            renderOpen(onClose);
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'dirty' } });
            fireEvent.click(screen.getByTestId('modal-close'));
            fireEvent.click(screen.getByTestId('confirm-close'));
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'false');
        });

        it('calls onClose and resets form on confirm close', () => {
            const onClose = jest.fn();
            renderOpen(onClose);
            fireEvent.change(screen.getByTestId(TYPE_SELECT), { target: { value: 'expense' } });
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'Category A' } });
            expect(getSubmitButton()).not.toBeDisabled();

            fireEvent.click(screen.getByTestId('modal-close'));
            fireEvent.click(screen.getByTestId('confirm-yes'));

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'false');
            expect(screen.getByTestId(NAME_INPUT)).toHaveValue('');
            expect(getSubmitButton()).toBeDisabled();
        });
    });
});
