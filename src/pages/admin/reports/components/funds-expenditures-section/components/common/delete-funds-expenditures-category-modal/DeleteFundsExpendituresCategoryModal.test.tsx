import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { ReportFundsExpendituresCategory, ReportFundsExpendituresRecord } from '@/types/admin/reports';
import { DeleteFundsExpendituresCategoryModal } from './DeleteFundsExpendituresCategoryModal';

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
    ConfirmationModal: ({ isOpen, title, onConfirm, onCancel, onClose, isButtonsDisabled }: any) => (
        <div data-testid="confirm-modal" data-open={String(isOpen)}>
            <span>{title}</span>
            <button data-testid="confirm-yes" onClick={onConfirm} disabled={isButtonsDisabled}>
                Yes
            </button>
            <button data-testid="confirm-no" onClick={onCancel} disabled={isButtonsDisabled}>
                No
            </button>
            <button data-testid="confirm-close" onClick={onClose} disabled={isButtonsDisabled}>
                Close
            </button>
        </div>
    ),
}));

jest.mock('@/components/common/select/Select', () => {
    const Select = ({ value, onValueChange, placeholder, children }: any) => (
        <>
            <input
                data-testid={placeholder}
                value={value ?? ''}
                onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    onValueChange(isNaN(parsed) ? undefined : parsed);
                }}
            />
            {children}
        </>
    );
    Select.Option = ({ value, name }: any) => <option value={value}>{name}</option>;
    return { Select };
});

jest.mock('@/components/admin/hint-box/HintBox', () => ({
    HintBox: ({ title }: any) => <div data-testid="hint-box">{title}</div>,
}));

const CATEGORY_SELECT = FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.CATEGORY_PLACEHOLDER;
const DELETE_BUTTON_NAME = COMMON_TEXT_ADMIN.BUTTON.DELETE;
const CANCEL_BUTTON_NAME = COMMON_TEXT_ADMIN.BUTTON.CANCEL;

const incomeCategory: ReportFundsExpendituresCategory = { id: 1, name: 'Донори', type: 'income' };
const expenseCategory: ReportFundsExpendituresCategory = { id: 2, name: 'Оренда', type: 'expense' };

const incomeRecord: ReportFundsExpendituresRecord = {
    id: 10,
    categoryId: 1,
    type: 'income',
    reportingYear: '2024',
    amountUah: '1000',
    amountUsd: '25',
};

const expenseRecord: ReportFundsExpendituresRecord = {
    id: 20,
    categoryId: 2,
    type: 'expense',
    reportingYear: '2024',
    amountUah: '500',
    amountUsd: '12',
};

const renderModal = (
    overrides: Partial<{
        isOpen: boolean;
        onClose: jest.Mock;
        categories: ReportFundsExpendituresCategory[];
        records: ReportFundsExpendituresRecord[];
        onSubmit: jest.Mock;
    }> = {},
) => {
    const props = {
        isOpen: true,
        onClose: jest.fn(),
        categories: [incomeCategory, expenseCategory],
        records: [],
        onSubmit: jest.fn().mockResolvedValue(true),
        ...overrides,
    };
    return { ...render(<DeleteFundsExpendituresCategoryModal {...props} />), ...props };
};

const getDeleteButton = () => screen.getByRole('button', { name: DELETE_BUTTON_NAME });
const getCancelButton = () => screen.getByRole('button', { name: CANCEL_BUTTON_NAME });

const selectCategory = (id: number) => {
    fireEvent.change(screen.getByTestId(CATEGORY_SELECT), { target: { value: String(id) } });
};

describe('DeleteFundsExpendituresCategoryModal', () => {
    it('renders nothing when isOpen is false', () => {
        renderModal({ isOpen: false });
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('renders modal title when open', () => {
        renderModal();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.TITLE)).toBeInTheDocument();
    });

    it('renders category select and action buttons', () => {
        renderModal();
        expect(screen.getByTestId(CATEGORY_SELECT)).toBeInTheDocument();
        expect(getDeleteButton()).toBeInTheDocument();
        expect(getCancelButton()).toBeInTheDocument();
    });

    describe('delete button disabled state', () => {
        it('is disabled when no category is selected', () => {
            renderModal();
            expect(getDeleteButton()).toBeDisabled();
        });

        it('is enabled when a category with no record is selected', () => {
            renderModal({ records: [] });
            selectCategory(incomeCategory.id);
            expect(getDeleteButton()).not.toBeDisabled();
        });

        it('is disabled when selected category has an income record', () => {
            renderModal({ records: [incomeRecord] });
            selectCategory(incomeCategory.id);
            expect(getDeleteButton()).toBeDisabled();
        });

        it('is disabled when selected category has an expense record', () => {
            renderModal({ records: [expenseRecord] });
            selectCategory(expenseCategory.id);
            expect(getDeleteButton()).toBeDisabled();
        });
    });

    describe('type label display', () => {
        it('shows income type label when income category is selected', () => {
            renderModal();
            selectCategory(incomeCategory.id);
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.INCOME)).toBeInTheDocument();
        });

        it('shows expense type label when expense category is selected', () => {
            renderModal();
            selectCategory(expenseCategory.id);
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.EXPENSE)).toBeInTheDocument();
        });

        it('does not show type label when no category is selected', () => {
            renderModal();
            expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.INCOME)).not.toBeInTheDocument();
            expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.EXPENSE)).not.toBeInTheDocument();
        });
    });

    describe('record error hint', () => {
        it('shows income record error when selected income category has a record', () => {
            renderModal({ records: [incomeRecord] });
            selectCategory(incomeCategory.id);
            expect(screen.getByTestId('hint-box')).toHaveTextContent(
                FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.ERROR.HAS_INCOME_RECORD,
            );
        });

        it('shows expense record error when selected expense category has a record', () => {
            renderModal({ records: [expenseRecord] });
            selectCategory(expenseCategory.id);
            expect(screen.getByTestId('hint-box')).toHaveTextContent(
                FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.ERROR.HAS_EXPENSE_RECORD,
            );
        });

        it('does not show hint box when selected category has no record', () => {
            renderModal({ records: [] });
            selectCategory(incomeCategory.id);
            expect(screen.queryByTestId('hint-box')).not.toBeInTheDocument();
        });

        it('does not show hint box when no category is selected', () => {
            renderModal({ records: [incomeRecord] });
            expect(screen.queryByTestId('hint-box')).not.toBeInTheDocument();
        });
    });

    describe('confirmation modal', () => {
        it('opens confirmation modal when delete is clicked', () => {
            renderModal();
            selectCategory(incomeCategory.id);
            fireEvent.click(getDeleteButton());
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'true');
        });

        it('shows correct title in confirmation modal', () => {
            renderModal();
            selectCategory(incomeCategory.id);
            fireEvent.click(getDeleteButton());
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.CONFIRM_TITLE)).toBeInTheDocument();
        });

        it('closes confirmation modal when cancel is clicked inside confirm', () => {
            renderModal();
            selectCategory(incomeCategory.id);
            fireEvent.click(getDeleteButton());
            fireEvent.click(screen.getByTestId('confirm-no'));
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'false');
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('closes confirmation modal when close is triggered inside confirm', () => {
            renderModal();
            selectCategory(incomeCategory.id);
            fireEvent.click(getDeleteButton());
            fireEvent.click(screen.getByTestId('confirm-close'));
            expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'false');
        });
    });

    describe('submit behaviour', () => {
        it('calls onSubmit with the selected categoryId on confirm', async () => {
            const onSubmit = jest.fn().mockResolvedValue(true);
            renderModal({ onSubmit });
            selectCategory(incomeCategory.id);
            fireEvent.click(getDeleteButton());
            fireEvent.click(screen.getByTestId('confirm-yes'));
            await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(incomeCategory.id));
        });

        it('resets form and calls onClose when onSubmit resolves true', async () => {
            const onClose = jest.fn();
            const onSubmit = jest.fn().mockResolvedValue(true);
            renderModal({ onClose, onSubmit });
            selectCategory(incomeCategory.id);
            fireEvent.click(getDeleteButton());
            fireEvent.click(screen.getByTestId('confirm-yes'));
            await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
            expect(screen.getByTestId(CATEGORY_SELECT)).toHaveValue('');
            expect(getDeleteButton()).toBeDisabled();
        });

        it('keeps modal open and closes confirm when onSubmit resolves false', async () => {
            const onClose = jest.fn();
            const onSubmit = jest.fn().mockResolvedValue(false);
            renderModal({ onClose, onSubmit });
            selectCategory(incomeCategory.id);
            fireEvent.click(getDeleteButton());
            fireEvent.click(screen.getByTestId('confirm-yes'));
            await waitFor(() => expect(screen.getByTestId('confirm-modal')).toHaveAttribute('data-open', 'false'));
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('disables confirm buttons while submitting', async () => {
            let resolve!: (v: boolean) => void;
            const onSubmit = jest.fn().mockReturnValue(
                new Promise<boolean>((r) => {
                    resolve = r;
                }),
            );
            renderModal({ onSubmit });
            selectCategory(incomeCategory.id);
            fireEvent.click(getDeleteButton());
            fireEvent.click(screen.getByTestId('confirm-yes'));
            expect(screen.getByTestId('confirm-yes')).toBeDisabled();
            await act(async () => {
                resolve(true);
            });
        });
    });

    describe('close (cancel) behaviour', () => {
        it('calls onClose and resets form when cancel button is clicked', () => {
            const onClose = jest.fn();
            renderModal({ onClose });
            selectCategory(incomeCategory.id);
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.INCOME)).toBeInTheDocument();
            fireEvent.click(getCancelButton());
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('resets selection when modal-close button is clicked', () => {
            const onClose = jest.fn();
            renderModal({ onClose });
            selectCategory(incomeCategory.id);
            fireEvent.click(screen.getByTestId('modal-close'));
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('cancel button is disabled while submitting', async () => {
            let resolve!: (v: boolean) => void;
            const onSubmit = jest.fn().mockReturnValue(
                new Promise<boolean>((r) => {
                    resolve = r;
                }),
            );
            renderModal({ onSubmit });
            selectCategory(incomeCategory.id);
            fireEvent.click(getDeleteButton());
            fireEvent.click(screen.getByTestId('confirm-yes'));
            expect(getCancelButton()).toBeDisabled();
            await act(async () => {
                resolve(true);
            });
        });
    });
});
