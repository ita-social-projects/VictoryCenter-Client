import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';
import { ReportFundsExpendituresCategory } from '@/types/admin/reports';
import { AddFundsExpendituresCategoryModal } from './AddFundsExpendituresCategoryModal';

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
    const Select = ({ value, onValueChange, placeholder }: any) => (
        <input data-testid={placeholder} value={value ?? ''} onChange={(e) => onValueChange(e.target.value)} />
    );
    Select.Option = (_props: any) => null;
    return { Select };
});

describe('AddFundsExpendituresCategoryModal', () => {
    const TYPE_SELECT = FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.TYPE_PLACEHOLDER;
    const NAME_INPUT = 'category-name';
    const SUBMIT_BUTTON_NAME = FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.SUBMIT_BUTTON;
    const REQUIRED_ERROR = COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
    const MIN_ERROR = COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(FUNDS_EXPENDITURES_VALIDATION.categoryNameMin);
    const DUPLICATE_ERROR = FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.ERROR.NAME_DUPLICATE;

    const renderOpen = (onClose = jest.fn(), categories: ReportFundsExpendituresCategory[] = []) =>
        render(<AddFundsExpendituresCategoryModal isOpen={true} onClose={onClose} categories={categories} />);

    const getSubmitButton = () => screen.getByRole('button', { name: SUBMIT_BUTTON_NAME });

    const fillForm = (type = 'expense', name = 'Category A') => {
        fireEvent.change(screen.getByTestId(TYPE_SELECT), { target: { value: type } });
        fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: name } });
    };

    it('renders nothing when isOpen is false', () => {
        render(<AddFundsExpendituresCategoryModal isOpen={false} onClose={jest.fn()} />);
        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
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

        it('is disabled when form is incomplete', () => {
            renderOpen();
            fillForm('expense', 'abc');
            expect(getSubmitButton()).toBeDisabled();
        });

        it('is enabled when both type and valid name are set', () => {
            renderOpen();
            fillForm();
            expect(getSubmitButton()).not.toBeDisabled();
        });
    });

    describe('name field validation', () => {
        it('shows required error on blur when name is empty', () => {
            renderOpen();
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.getByText(REQUIRED_ERROR)).toBeInTheDocument();
        });

        it('shows min length error on blur when name is too short', () => {
            renderOpen();
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'abc' } });
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.getByText(MIN_ERROR)).toBeInTheDocument();
        });

        it('shows duplicate error on blur when name matches existing category for same type', () => {
            const categories: ReportFundsExpendituresCategory[] = [{ id: 1, name: 'Приватні донори', type: 'income', localizations: [] }];
            renderOpen(jest.fn(), categories);
            fireEvent.change(screen.getByTestId(TYPE_SELECT), { target: { value: 'income' } });
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'Донори приватні' } });
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.getByText(DUPLICATE_ERROR)).toBeInTheDocument();
        });

        it('does not show duplicate error when type differs from existing category', () => {
            const categories: ReportFundsExpendituresCategory[] = [{ id: 1, name: 'Приватні донори', type: 'expense', localizations: [] }];
            renderOpen(jest.fn(), categories);
            fireEvent.change(screen.getByTestId(TYPE_SELECT), { target: { value: 'income' } });
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'Приватні донори' } });
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.queryByText(DUPLICATE_ERROR)).not.toBeInTheDocument();
        });

        it('clears name error when name becomes valid on re-blur', () => {
            renderOpen();
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'ab' } });
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.getByText(MIN_ERROR)).toBeInTheDocument();

            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'Valid name' } });
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.queryByText(MIN_ERROR)).not.toBeInTheDocument();
        });
    });

    describe('name re-validation on type change', () => {
        it('shows duplicate error when type changes to one that has the same name', () => {
            const categories: ReportFundsExpendituresCategory[] = [{ id: 1, name: 'Category A', type: 'expense', localizations: [] }];
            renderOpen(jest.fn(), categories);
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'Category A' } });
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.queryByText(DUPLICATE_ERROR)).not.toBeInTheDocument();

            fireEvent.change(screen.getByTestId(TYPE_SELECT), { target: { value: 'expense' } });
            expect(screen.getByText(DUPLICATE_ERROR)).toBeInTheDocument();
        });

        it('clears duplicate error when type changes to one without the same name', () => {
            const categories: ReportFundsExpendituresCategory[] = [{ id: 1, name: 'Category A', type: 'income', localizations: [] }];
            renderOpen(jest.fn(), categories);
            fillForm('income', 'Category A');
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.getByText(DUPLICATE_ERROR)).toBeInTheDocument();

            fireEvent.change(screen.getByTestId(TYPE_SELECT), { target: { value: 'expense' } });
            expect(screen.queryByText(DUPLICATE_ERROR)).not.toBeInTheDocument();
        });

        it('does not show name error on type change before name has been blurred', () => {
            const categories: ReportFundsExpendituresCategory[] = [{ id: 1, name: 'Category A', type: 'expense', localizations: [] }];
            renderOpen(jest.fn(), categories);
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'Category A' } });

            fireEvent.change(screen.getByTestId(TYPE_SELECT), { target: { value: 'expense' } });
            expect(screen.queryByText(DUPLICATE_ERROR)).not.toBeInTheDocument();
        });
    });

    describe('type field validation', () => {
        it('shows required error when type field loses focus without selection', () => {
            renderOpen();
            fireEvent.blur(screen.getByTestId(TYPE_SELECT));
            expect(screen.getByText(REQUIRED_ERROR)).toBeInTheDocument();
        });

        it('clears type error when type is selected', () => {
            renderOpen();
            fireEvent.blur(screen.getByTestId(TYPE_SELECT));
            expect(screen.getByText(REQUIRED_ERROR)).toBeInTheDocument();

            fireEvent.change(screen.getByTestId(TYPE_SELECT), { target: { value: 'income' } });
            expect(screen.queryByText(REQUIRED_ERROR)).not.toBeInTheDocument();
        });
    });

    describe('submit behaviour', () => {
        const renderWithSubmit = (onSubmit: jest.Mock, onClose = jest.fn()) =>
            render(<AddFundsExpendituresCategoryModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);

        it('calls onSubmit with normalized name and type on click', async () => {
            const onSubmit = jest.fn().mockResolvedValue(true);
            renderWithSubmit(onSubmit);
            fillForm('income', '  Valid name  ');
            fireEvent.click(getSubmitButton());
            await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'Valid name', type: 'income' }));
        });

        it('resets form and calls onClose when onSubmit resolves true', async () => {
            const onClose = jest.fn();
            const onSubmit = jest.fn().mockResolvedValue(true);
            renderWithSubmit(onSubmit, onClose);
            fillForm('expense', 'Valid name');
            fireEvent.click(getSubmitButton());
            await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
            expect(screen.getByTestId('category-name')).toHaveValue('');
            expect(getSubmitButton()).toBeDisabled();
        });

        it('keeps modal open when onSubmit resolves false', async () => {
            const onClose = jest.fn();
            const onSubmit = jest.fn().mockResolvedValue(false);
            renderWithSubmit(onSubmit, onClose);
            fillForm('income', 'Valid name');
            fireEvent.click(getSubmitButton());
            await waitFor(() => expect(onSubmit).toHaveBeenCalled());
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        });

        it('disables submit button while submitting', async () => {
            let resolve!: (v: boolean) => void;
            const onSubmit = jest.fn().mockReturnValue(
                new Promise<boolean>((r) => {
                    resolve = r;
                }),
            );
            renderWithSubmit(onSubmit);
            fillForm('income', 'Valid name');
            fireEvent.click(getSubmitButton());
            expect(getSubmitButton()).toBeDisabled();
            await act(async () => {
                resolve(true);
            });
        });
    });

    it('normalizes whitespace in name input on blur', () => {
        renderOpen();
        const nameInput = screen.getByTestId(NAME_INPUT);
        fireEvent.change(nameInput, { target: { value: '  foo   bar  ' } });
        fireEvent.blur(nameInput);
        expect(nameInput).toHaveValue('foo bar');
    });

    describe('close behavior', () => {
        const triggerDirtyClose = (onClose = jest.fn()) => {
            renderOpen(onClose);
            fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value: 'dirty' } });
            fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
            return onClose;
        };

        it('calls onClose directly when form is clean', () => {
            const onClose = jest.fn();
            renderOpen(onClose);
            fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'false');
        });

        it('resets errors when closing a clean form', () => {
            renderOpen();
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.getByText(REQUIRED_ERROR)).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
            expect(screen.queryByText(REQUIRED_ERROR)).not.toBeInTheDocument();
        });

        it('opens confirmation modal when type is dirty on close request', () => {
            const onClose = jest.fn();
            renderOpen(onClose);
            fireEvent.change(screen.getByTestId(TYPE_SELECT), { target: { value: 'expense' } });
            fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'true');
        });

        it('opens confirmation modal when name is dirty on close request', () => {
            const onClose = triggerDirtyClose();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'true');
        });

        it('shows correct title in confirmation modal', () => {
            triggerDirtyClose();
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.CONFIRM_CLOSE_TITLE)).toBeInTheDocument();
        });

        it('dismisses confirmation and keeps modal open on cancel via onCancel', () => {
            const onClose = triggerDirtyClose();
            fireEvent.click(screen.getByTestId('confirm-no'));
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'false');
            expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        });

        it('dismisses confirmation and keeps modal open on cancel via onClose', () => {
            const onClose = triggerDirtyClose();
            fireEvent.click(screen.getByTestId('confirm-close'));
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'false');
        });

        it('calls onClose and resets form on confirm close', () => {
            const onClose = jest.fn();
            renderOpen(onClose);
            fillForm();
            expect(getSubmitButton()).not.toBeDisabled();

            fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
            fireEvent.click(screen.getByTestId('confirm-yes'));

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'false');
            expect(screen.getByTestId(NAME_INPUT)).toHaveValue('');
            expect(getSubmitButton()).toBeDisabled();
        });
    });
});
