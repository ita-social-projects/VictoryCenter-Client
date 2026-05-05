import { render, screen, fireEvent, within, waitFor, act } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';
import { ReportFundsExpendituresCategory } from '@/types/admin/reports';
import { EditFundsExpendituresCategoryModal } from './EditFundsExpendituresCategoryModal';

jest.mock('@/components/admin/input-with-character-limit/InputWithCharacterLimit', () => ({
    InputWithCharacterLimit: ({ id, value, onChange, onBlur, placeholder }: any) => (
        <input data-testid={id} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} />
    ),
}));

const CATEGORY_SELECT = FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.CATEGORY_PLACEHOLDER;
const NAME_INPUT = 'edit-category-name';
const SAVE_BUTTON = FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.SUBMIT_BUTTON;
const MIN_ERROR = COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(FUNDS_EXPENDITURES_VALIDATION.categoryNameMin);
const REQUIRED_ERROR = COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
const DUPLICATE_ERROR = FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.ERROR.NAME_DUPLICATE;
const YES_BUTTON = COMMON_TEXT_ADMIN.BUTTON.YES;
const NO_BUTTON = COMMON_TEXT_ADMIN.BUTTON.NO;

const incomeCategory: ReportFundsExpendituresCategory = { id: 1, name: 'Донори', type: 'income' };
const expenseCategory: ReportFundsExpendituresCategory = { id: 2, name: 'Оренда', type: 'expense' };

const renderModal = (
    overrides: Partial<{
        isOpen: boolean;
        onClose: jest.Mock;
        categories: ReportFundsExpendituresCategory[];
        onSubmit: jest.Mock;
    }> = {},
) => {
    const props = {
        isOpen: true,
        onClose: jest.fn(),
        categories: [incomeCategory, expenseCategory],
        onSubmit: jest.fn().mockResolvedValue(true),
        ...overrides,
    };
    return { ...render(<EditFundsExpendituresCategoryModal {...props} />), ...props };
};

const getSaveButton = () => screen.getByRole('button', { name: SAVE_BUTTON });

const selectCategory = (name: string) => {
    fireEvent.click(screen.getByRole('button', { name: CATEGORY_SELECT }));
    fireEvent.click(screen.getByRole('button', { name }));
};

const typeName = (value: string) => {
    fireEvent.change(screen.getByTestId(NAME_INPUT), { target: { value } });
};

const fillForm = (categoryName = incomeCategory.name, name = 'Valid name') => {
    selectCategory(categoryName);
    typeName(name);
};

const getConfirmOverlayWithTitle = (title: string) =>
    screen.getAllByTestId('modal-overlay').find((el) => within(el).queryByText(title))!;

const clickYesInConfirm = (title: string) =>
    fireEvent.click(within(getConfirmOverlayWithTitle(title)).getByRole('button', { name: YES_BUTTON }));

const clickNoInConfirm = (title: string) =>
    fireEvent.click(within(getConfirmOverlayWithTitle(title)).getByRole('button', { name: NO_BUTTON }));

describe('EditFundsExpendituresCategoryModal', () => {
    it('renders nothing when isOpen is false', () => {
        renderModal({ isOpen: false });
        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
    });

    it('renders modal title when open', () => {
        renderModal();
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.TITLE)).toBeInTheDocument();
    });

    it('renders category select, name input and save button', () => {
        renderModal();
        expect(screen.getByRole('button', { name: CATEGORY_SELECT })).toBeInTheDocument();
        expect(screen.getByTestId(NAME_INPUT)).toBeInTheDocument();
        expect(getSaveButton()).toBeInTheDocument();
    });

    describe('save button disabled state', () => {
        it('is disabled by default', () => {
            renderModal();
            expect(getSaveButton()).toBeDisabled();
        });

        it('is disabled when only category is selected', () => {
            renderModal();
            selectCategory(incomeCategory.name);
            expect(getSaveButton()).toBeDisabled();
        });

        it('is disabled when name is too short', () => {
            renderModal();
            fillForm(incomeCategory.name, 'abc');
            expect(getSaveButton()).toBeDisabled();
        });

        it('is enabled when category is selected and name is valid', () => {
            renderModal();
            fillForm();
            expect(getSaveButton()).not.toBeDisabled();
        });

        it('is not disabled when name matches a category of a different type', () => {
            renderModal();
            fillForm(incomeCategory.name, expenseCategory.name);
            expect(getSaveButton()).not.toBeDisabled();
        });

        it('is disabled when name duplicates another category of the same type', () => {
            const categories = [incomeCategory, expenseCategory, { id: 3, name: 'Гранти', type: 'income' as const }];
            renderModal({ categories });
            selectCategory(incomeCategory.name);
            typeName('Гранти');
            expect(getSaveButton()).toBeDisabled();
        });
    });

    describe('name field validation on blur', () => {
        it('shows required error when name is empty', () => {
            renderModal();
            selectCategory(incomeCategory.name);
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.getByText(REQUIRED_ERROR)).toBeInTheDocument();
        });

        it('shows min length error when name is too short', () => {
            renderModal();
            fillForm(incomeCategory.name, 'abc');
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.getByText(MIN_ERROR)).toBeInTheDocument();
        });

        it('shows duplicate error when name matches another category of the same type', () => {
            const categories = [incomeCategory, expenseCategory, { id: 3, name: 'Гранти', type: 'income' as const }];
            renderModal({ categories });
            selectCategory(incomeCategory.name);
            typeName('Гранти');
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.getByText(DUPLICATE_ERROR)).toBeInTheDocument();
        });

        it('does not show duplicate error when name matches selected category itself', () => {
            renderModal();
            selectCategory(incomeCategory.name);
            typeName(incomeCategory.name);
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.queryByText(DUPLICATE_ERROR)).not.toBeInTheDocument();
        });

        it('clears error when name becomes valid on re-blur', () => {
            renderModal();
            selectCategory(incomeCategory.name);
            typeName('ab');
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.getByText(MIN_ERROR)).toBeInTheDocument();

            typeName('Valid name');
            fireEvent.blur(screen.getByTestId(NAME_INPUT));
            expect(screen.queryByText(MIN_ERROR)).not.toBeInTheDocument();
        });
    });

    describe('confirmation save modal', () => {
        it('opens save confirmation when save button is clicked', () => {
            renderModal();
            fillForm();
            fireEvent.click(getSaveButton());
            expect(
                screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.CONFIRM_SAVE_TITLE),
            ).toBeInTheDocument();
        });

        it('closes save confirmation on cancel', () => {
            renderModal();
            fillForm();
            fireEvent.click(getSaveButton());
            clickNoInConfirm(FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.CONFIRM_SAVE_TITLE);
            expect(
                screen.queryByText(FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.CONFIRM_SAVE_TITLE),
            ).not.toBeInTheDocument();
        });
    });

    describe('submit behaviour', () => {
        it('calls onSubmit with categoryId and normalized name on confirm', async () => {
            const onSubmit = jest.fn().mockResolvedValue(true);
            renderModal({ onSubmit });
            fillForm(incomeCategory.name, '  Valid name  ');
            fireEvent.click(getSaveButton());
            clickYesInConfirm(FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.CONFIRM_SAVE_TITLE);
            await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(incomeCategory.id, 'Valid name'));
        });

        it('resets form and calls onClose when onSubmit resolves true', async () => {
            const onClose = jest.fn();
            const onSubmit = jest.fn().mockResolvedValue(true);
            renderModal({ onClose, onSubmit });
            fillForm();
            fireEvent.click(getSaveButton());
            clickYesInConfirm(FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.CONFIRM_SAVE_TITLE);
            await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
            expect(screen.getByTestId(NAME_INPUT)).toHaveValue('');
            expect(getSaveButton()).toBeDisabled();
        });

        it('keeps modal open and closes confirm when onSubmit resolves false', async () => {
            const onClose = jest.fn();
            const onSubmit = jest.fn().mockResolvedValue(false);
            renderModal({ onClose, onSubmit });
            fillForm();
            fireEvent.click(getSaveButton());
            clickYesInConfirm(FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.CONFIRM_SAVE_TITLE);
            await waitFor(() => expect(screen.queryByRole('button', { name: YES_BUTTON })).not.toBeInTheDocument());
            expect(onClose).not.toHaveBeenCalled();
        });

        it('disables confirm buttons while submitting', async () => {
            let resolve!: (v: boolean) => void;
            const onSubmit = jest.fn().mockReturnValue(
                new Promise<boolean>((r) => {
                    resolve = r;
                }),
            );
            renderModal({ onSubmit });
            fillForm();
            fireEvent.click(getSaveButton());
            const yesBtn = within(
                getConfirmOverlayWithTitle(FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.CONFIRM_SAVE_TITLE),
            ).getByRole('button', { name: YES_BUTTON });
            fireEvent.click(yesBtn);
            expect(yesBtn).toBeDisabled();
            await act(async () => {
                resolve(true);
            });
        });
    });

    describe('close behaviour', () => {
        it('closes directly when form is clean', () => {
            const onClose = jest.fn();
            renderModal({ onClose });
            fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('opens close confirmation when name is dirty', () => {
            const onClose = jest.fn();
            renderModal({ onClose });
            typeName('dirty');
            fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.CONFIRM_CLOSE_TITLE)).toBeInTheDocument();
        });

        it('calls onClose and resets form on confirm close', () => {
            const onClose = jest.fn();
            renderModal({ onClose });
            fillForm();
            fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
            clickYesInConfirm(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.CONFIRM_CLOSE_TITLE);
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.getByTestId(NAME_INPUT)).toHaveValue('');
        });

        it('keeps modal open on cancel close', () => {
            const onClose = jest.fn();
            renderModal({ onClose });
            typeName('dirty');
            fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
            clickNoInConfirm(FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.CONFIRM_CLOSE_TITLE);
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        });
    });

    it('normalizes whitespace in name on blur', () => {
        renderModal();
        typeName('  foo   bar  ');
        fireEvent.blur(screen.getByTestId(NAME_INPUT));
        expect(screen.getByTestId(NAME_INPUT)).toHaveValue('foo bar');
    });
});
