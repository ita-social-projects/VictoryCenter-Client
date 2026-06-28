import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { ReportFundsExpendituresCategory, ReportFundsExpendituresRecord } from '@/types/admin/reports';
import { DeleteFundsExpendituresCategoryModal } from './DeleteFundsExpendituresCategoryModal';

const CATEGORY_SELECT = FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.CATEGORY_PLACEHOLDER;
const DELETE_BUTTON_NAME = COMMON_TEXT_ADMIN.BUTTON.DELETE;
const CANCEL_BUTTON_NAME = COMMON_TEXT_ADMIN.BUTTON.CANCEL;
const YES_BUTTON = COMMON_TEXT_ADMIN.BUTTON.YES;
const NO_BUTTON = COMMON_TEXT_ADMIN.BUTTON.NO;

const incomeCategory: ReportFundsExpendituresCategory = { id: 1, name: 'Донори', type: 'income', localizations: [] };
const expenseCategory: ReportFundsExpendituresCategory = { id: 2, name: 'Оренда', type: 'expense', localizations: [] };

const incomeRecord: ReportFundsExpendituresRecord = {
    id: 10,
    categoryId: 1,
    type: 'income',
    reportingYear: '2024',
    amountUah: '1000',
    amountUsd: '25',
};

const incomeRecord2: ReportFundsExpendituresRecord = {
    id: 11,
    categoryId: 1,
    type: 'income',
    reportingYear: '2023',
    amountUah: '2000',
    amountUsd: '50',
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

const selectCategory = (name: string) => {
    fireEvent.click(screen.getByRole('button', { name: CATEGORY_SELECT }));
    fireEvent.click(screen.getByRole('button', { name }));
};

const getConfirmOverlay = () =>
    screen.getAllByTestId('modal-overlay').find((el) => within(el).queryByRole('button', { name: YES_BUTTON }))!;

describe('DeleteFundsExpendituresCategoryModal', () => {
    it('renders nothing when isOpen is false', () => {
        renderModal({ isOpen: false });
        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
    });

    it('renders modal title when open', () => {
        renderModal();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.TITLE)).toBeInTheDocument();
    });

    it('renders category select and action buttons', () => {
        renderModal();
        expect(screen.getByRole('button', { name: CATEGORY_SELECT })).toBeInTheDocument();
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
            selectCategory(incomeCategory.name);
            expect(getDeleteButton()).not.toBeDisabled();
        });

        it('is disabled when selected category has an income record', () => {
            renderModal({ records: [incomeRecord] });
            selectCategory(incomeCategory.name);
            expect(getDeleteButton()).toBeDisabled();
        });

        it('is disabled when selected category has an expense record', () => {
            renderModal({ records: [expenseRecord] });
            selectCategory(expenseCategory.name);
            expect(getDeleteButton()).toBeDisabled();
        });
    });

    describe('record error hint', () => {
        it('shows income record error when selected income category has a record', () => {
            renderModal({ records: [incomeRecord] });
            selectCategory(incomeCategory.name);
            expect(
                screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.ERROR.getHasIncomeRecordTitle(1)),
            ).toBeInTheDocument();
            expect(
                screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.ERROR.HAS_RECORD_TEXT),
            ).toBeInTheDocument();
        });

        it('shows expense record error when selected expense category has a record', () => {
            renderModal({ records: [expenseRecord] });
            selectCategory(expenseCategory.name);
            expect(
                screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.ERROR.getHasExpenseRecordTitle(1)),
            ).toBeInTheDocument();
            expect(
                screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.ERROR.HAS_RECORD_TEXT),
            ).toBeInTheDocument();
        });

        it('does not show hint box when selected category has no record', () => {
            renderModal({ records: [] });
            selectCategory(incomeCategory.name);
            expect(
                screen.queryByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.ERROR.getHasIncomeRecordTitle(1)),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.ERROR.HAS_RECORD_TEXT),
            ).not.toBeInTheDocument();
        });

        it('does not show hint box when no category is selected', () => {
            renderModal({ records: [incomeRecord] });
            expect(
                screen.queryByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.ERROR.getHasIncomeRecordTitle(1)),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.ERROR.HAS_RECORD_TEXT),
            ).not.toBeInTheDocument();
        });

        it('shows correct plural form when category has multiple records', () => {
            renderModal({ records: [incomeRecord, incomeRecord2] });
            selectCategory(incomeCategory.name);
            expect(
                screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.ERROR.getHasIncomeRecordTitle(2)),
            ).toBeInTheDocument();
        });
    });

    describe('confirmation modal', () => {
        it('opens confirmation when delete is clicked', () => {
            renderModal();
            selectCategory(incomeCategory.name);
            fireEvent.click(getDeleteButton());
            expect(getConfirmOverlay()).toBeInTheDocument();
        });

        it('shows correct confirm title', () => {
            renderModal();
            selectCategory(incomeCategory.name);
            fireEvent.click(getDeleteButton());
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.CONFIRM_TITLE)).toBeInTheDocument();
        });

        it('closes confirmation on cancel', () => {
            renderModal();
            selectCategory(incomeCategory.name);
            fireEvent.click(getDeleteButton());
            fireEvent.click(within(getConfirmOverlay()).getByRole('button', { name: NO_BUTTON }));
            expect(screen.queryAllByTestId('modal-overlay').length).toBe(1);
        });
    });

    describe('submit behaviour', () => {
        it('calls onSubmit with categoryId on confirm', async () => {
            const onSubmit = jest.fn().mockResolvedValue(true);
            renderModal({ onSubmit });
            selectCategory(incomeCategory.name);
            fireEvent.click(getDeleteButton());
            fireEvent.click(within(getConfirmOverlay()).getByRole('button', { name: YES_BUTTON }));
            await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(incomeCategory.id));
        });

        it('resets form and calls onClose when onSubmit resolves true', async () => {
            const onClose = jest.fn();
            const onSubmit = jest.fn().mockResolvedValue(true);
            renderModal({ onClose, onSubmit });
            selectCategory(incomeCategory.name);
            fireEvent.click(getDeleteButton());
            fireEvent.click(within(getConfirmOverlay()).getByRole('button', { name: YES_BUTTON }));
            await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
            expect(getDeleteButton()).toBeDisabled();
        });

        it('keeps modal open and closes confirm when onSubmit resolves false', async () => {
            const onClose = jest.fn();
            const onSubmit = jest.fn().mockResolvedValue(false);
            renderModal({ onClose, onSubmit });
            selectCategory(incomeCategory.name);
            fireEvent.click(getDeleteButton());
            fireEvent.click(within(getConfirmOverlay()).getByRole('button', { name: YES_BUTTON }));
            await waitFor(() => expect(screen.queryByRole('button', { name: YES_BUTTON })).not.toBeInTheDocument());
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getAllByTestId('modal-overlay').length).toBe(1);
        });

        it('disables confirm buttons while submitting', async () => {
            let resolve!: (v: boolean) => void;
            const onSubmit = jest.fn().mockReturnValue(
                new Promise<boolean>((r) => {
                    resolve = r;
                }),
            );
            renderModal({ onSubmit });
            selectCategory(incomeCategory.name);
            fireEvent.click(getDeleteButton());
            const yesBtn = within(getConfirmOverlay()).getByRole('button', { name: YES_BUTTON });
            fireEvent.click(yesBtn);
            expect(yesBtn).toBeDisabled();
            await act(async () => {
                resolve(true);
            });
        });
    });

    describe('cancel button', () => {
        it('closes modal on cancel', () => {
            const onClose = jest.fn();
            renderModal({ onClose });
            fireEvent.click(getCancelButton());
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('resets form on cancel', () => {
            renderModal();
            selectCategory(incomeCategory.name);
            expect(getDeleteButton()).not.toBeDisabled();
            fireEvent.click(getCancelButton());
            expect(getDeleteButton()).toBeDisabled();
        });
    });
});
