import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SupportOptionItem, SupportOptionItemMode } from './SupportOptionItem';
import { DONATE_TEXT } from '@/const/admin/donate';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { BankCurrency } from '@/types/admin/donate';

jest.mock('../../donate-input/DonateInput', () => ({
    DonateInput: ({ value, onValueChange, onBlur, name, error }: any) => (
        <div>
            <input
                value={value}
                onChange={(e) => onValueChange?.(e.target.value)}
                onBlur={onBlur}
                data-testid={`input-${name}`}
                placeholder={name}
            />
            {error && <span>{error}</span>}
        </div>
    ),
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, title, onConfirm, onCancel }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <p>{title}</p>
                <button onClick={onConfirm}>Yes</button>
                <button onClick={onCancel}>No</button>
            </div>
        ) : null,
}));

jest.mock('@/validation/admin/bank-details-schema/bank-details-schema', () => ({
    SUPPORT_OPTIONS_VALIDATION_FUNCTIONS: {
        validateName: (val: string) => (val.length < 2 ? 'Name too short' : undefined),
        validateValue: (val: string) => (val.length < 2 ? 'Value too short' : undefined),
    },
}));

const defaultData = {
    id: 1,
    name: 'Option 1',
    value: 'Value 1',
    currency: BankCurrency.Uah,
};

interface RenderOptions {
    data?: typeof defaultData | null;
    initialMode?: SupportOptionItemMode;
    onSave?: jest.Mock;
    onDelete?: jest.Mock;
    onCancel?: jest.Mock;
    onModeChange?: jest.Mock;
}

const renderItem = (options: RenderOptions = {}) => {
    const { data = defaultData, initialMode, onSave, onDelete, onCancel, onModeChange } = options;

    return render(
        <SupportOptionItem
            data={data === null ? undefined : data}
            initialMode={initialMode}
            onSave={onSave}
            onDelete={onDelete}
            onCancel={onCancel}
            onModeChange={onModeChange}
        />,
    );
};

const getNameInput = () => screen.getByTestId('input-name');
const getValueInput = () => screen.getByTestId('input-value');
const getPublishButton = () => screen.getByText(DONATE_TEXT.BUTTON.PUBLISH);
const getCancelButton = () => screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
const getEditButton = () => screen.getByRole('button', { name: 'edit-btn' });
const getDeleteButton = () => screen.getByRole('button', { name: 'delete-btn' });
const getModal = () => screen.getByTestId('confirmation-modal');
const getYesButton = () => screen.getByText('Yes');
const getNoButton = () => screen.getByText('No');

const clickButton = (button: HTMLElement) => fireEvent.click(button);
const changeInput = (input: HTMLElement, value: string) => {
    fireEvent.change(input, { target: { value } });
};
const blurInput = (input: HTMLElement) => fireEvent.blur(input);

const fillInputs = (name: string, value: string) => {
    changeInput(getNameInput(), name);
    changeInput(getValueInput(), value);
};

const confirmModal = () => clickButton(getYesButton());
const cancelModal = () => clickButton(getNoButton());

describe('SupportOptionItem', () => {
    describe('Rendering', () => {
        it('renders in view mode with data', () => {
            renderItem();
            expect(screen.getByText('Option 1')).toBeInTheDocument();
        });

        it('renders in create mode by default without data', () => {
            renderItem({ data: null });
            expect(getNameInput()).toBeInTheDocument();
            expect(getValueInput()).toBeInTheDocument();
        });

        it('does not render name field in view mode', () => {
            renderItem({ initialMode: SupportOptionItemMode.View });
            expect(screen.queryByTestId('input-name')).not.toBeInTheDocument();
            expect(getValueInput()).toBeInTheDocument();
        });

        it('renders name field in edit and create modes', () => {
            const { rerender } = renderItem({ initialMode: SupportOptionItemMode.Edit });
            expect(getNameInput()).toBeInTheDocument();

            rerender(<SupportOptionItem initialMode={SupportOptionItemMode.Create} />);
            expect(getNameInput()).toBeInTheDocument();
        });
    });

    describe('Mode Switching', () => {
        it('switches to edit mode when edit button clicked', () => {
            renderItem();
            clickButton(getEditButton());
            expect(getNameInput()).toBeInTheDocument();
        });

        it('does not do anything if edit button is clicked while already in edit mode', () => {
            const mockOnModeChange = jest.fn();
            renderItem({ onModeChange: mockOnModeChange });

            clickButton(getEditButton());
            mockOnModeChange.mockClear();
            clickButton(getEditButton());

            expect(mockOnModeChange).not.toHaveBeenCalled();
        });

        it('calls onModeChange when mode changes', () => {
            const mockOnModeChange = jest.fn();
            renderItem({ onModeChange: mockOnModeChange });
            expect(mockOnModeChange).toHaveBeenLastCalledWith(SupportOptionItemMode.View);
            mockOnModeChange.mockClear();

            clickButton(getEditButton());
            expect(mockOnModeChange).toHaveBeenLastCalledWith(SupportOptionItemMode.Edit);
            mockOnModeChange.mockClear();

            clickButton(getCancelButton());
            expect(mockOnModeChange).toHaveBeenLastCalledWith(SupportOptionItemMode.View);
        });

        it('transitions from create to view mode after successful save', async () => {
            const onSave = jest.fn().mockResolvedValue(undefined);
            const onModeChange = jest.fn();

            renderItem({
                onSave,
                onModeChange,
                initialMode: SupportOptionItemMode.Edit,
            });

            changeInput(getNameInput(), 'Updated Name');
            clickButton(getPublishButton());

            await waitFor(() => {
                expect(onSave).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(onModeChange).toHaveBeenLastCalledWith(SupportOptionItemMode.View);
            });
        });
    });

    describe('Form Submission', () => {
        it('calls onSave with updated values in edit mode', async () => {
            const onSave = jest.fn().mockResolvedValue(undefined);
            renderItem({ onSave, initialMode: SupportOptionItemMode.Edit });

            fillInputs('Updated Name', 'Updated Value');
            clickButton(getPublishButton());

            await waitFor(() => {
                expect(onSave).toHaveBeenCalledWith('Updated Name', 'Updated Value');
            });
        });

        it('shows confirmation modal when saving in create mode', async () => {
            const onSave = jest.fn().mockResolvedValue(undefined);
            renderItem({ data: null, onSave, initialMode: SupportOptionItemMode.Create });

            fillInputs('New Name', 'New Value');
            clickButton(getPublishButton());

            await waitFor(() => {
                expect(getModal()).toBeInTheDocument();
            });

            confirmModal();

            await waitFor(() => {
                expect(onSave).toHaveBeenCalledWith('New Name', 'New Value');
            });
        });

        it('does not save if onSave is not provided', async () => {
            renderItem({ initialMode: SupportOptionItemMode.Edit });

            changeInput(getNameInput(), 'Updated Name');
            const publishButton = getPublishButton();
            expect(publishButton).not.toBeDisabled();
            clickButton(publishButton);

            await waitFor(() => {
                expect(getNameInput()).toBeInTheDocument();
            });
        });
    });

    describe('Validation', () => {
        it('shows validation errors on blur', () => {
            renderItem({ data: null, initialMode: SupportOptionItemMode.Create });

            changeInput(getNameInput(), 'A');
            blurInput(getNameInput());

            expect(screen.getByText('Name too short')).toBeInTheDocument();
        });

        it('validates name field on change', () => {
            renderItem({ data: null, initialMode: SupportOptionItemMode.Create });

            changeInput(getNameInput(), 'A');
            expect(screen.getByText('Name too short')).toBeInTheDocument();
        });

        it('validates value field on change', () => {
            renderItem({ data: null, initialMode: SupportOptionItemMode.Create });

            changeInput(getValueInput(), 'B');
            expect(screen.getByText('Value too short')).toBeInTheDocument();
        });

        it('clears validation errors when valid input is provided', () => {
            renderItem({ data: null, initialMode: SupportOptionItemMode.Create });

            changeInput(getNameInput(), 'A');
            expect(screen.getByText('Name too short')).toBeInTheDocument();

            changeInput(getNameInput(), 'Valid Name');
            expect(screen.queryByText('Name too short')).not.toBeInTheDocument();
        });

        it('does not call onSave if validation fails', async () => {
            const onSave = jest.fn().mockResolvedValue(undefined);
            renderItem({ onSave, initialMode: SupportOptionItemMode.Edit });

            changeInput(getNameInput(), 'A');
            clickButton(getPublishButton());

            await waitFor(() => {
                expect(onSave).not.toHaveBeenCalled();
            });
        });

        it('validates both fields before saving', async () => {
            const onSave = jest.fn().mockResolvedValue(undefined);
            renderItem({ onSave, initialMode: SupportOptionItemMode.Edit });

            fillInputs('A', 'B');
            clickButton(getPublishButton());

            await waitFor(() => {
                expect(onSave).not.toHaveBeenCalled();
            });

            expect(screen.getByText('Name too short')).toBeInTheDocument();
            expect(screen.getByText('Value too short')).toBeInTheDocument();
        });

        it('resets errors when data changes', () => {
            const { rerender } = renderItem({ initialMode: SupportOptionItemMode.Edit });

            changeInput(getNameInput(), 'A');
            expect(screen.getByText('Name too short')).toBeInTheDocument();

            const newData = { id: 2, name: 'New Option', value: 'New Value', currency: BankCurrency.Usd };
            rerender(<SupportOptionItem data={newData} initialMode={SupportOptionItemMode.Edit} />);

            expect(screen.queryByText('Name too short')).not.toBeInTheDocument();
        });
    });

    describe('Publish Button States', () => {
        it('disables publish button if fields are empty', () => {
            renderItem({ data: null, initialMode: SupportOptionItemMode.Create });
            expect(getPublishButton()).toBeDisabled();
        });

        it('disables publish button if no changes were made', () => {
            renderItem({ initialMode: SupportOptionItemMode.Edit });
            expect(getPublishButton()).toBeDisabled();
        });

        it('disables publish button when validation errors exist', () => {
            renderItem({ initialMode: SupportOptionItemMode.Edit });

            blurInput(getNameInput());
            expect(getPublishButton()).toBeDisabled();
        });

        it('disables publish button when only whitespace is entered', () => {
            renderItem({ data: null, initialMode: SupportOptionItemMode.Create });

            fillInputs('   ', '   ');
            expect(getPublishButton()).toBeDisabled();
        });
    });

    describe('Cancel Behavior', () => {
        it('cancel with changes opens confirmation modal', () => {
            renderItem({ initialMode: SupportOptionItemMode.Edit });
            changeInput(getNameInput(), 'Changed');
            clickButton(getCancelButton());

            expect(getModal()).toBeInTheDocument();
        });

        it('cancel without changes resets form directly', () => {
            renderItem({ initialMode: SupportOptionItemMode.Edit });
            clickButton(getCancelButton());

            expect(screen.queryByTestId('input-name')).not.toBeInTheDocument();
        });

        it('cancel in create mode calls onCancel', () => {
            const onCancel = jest.fn();
            renderItem({ data: null, onCancel, initialMode: SupportOptionItemMode.Create });

            changeInput(getNameInput(), 'Test');
            clickButton(getCancelButton());

            expect(getModal()).toBeInTheDocument();

            confirmModal();
            expect(onCancel).toHaveBeenCalled();
        });

        it('closes modal on cancel button click', () => {
            renderItem({ initialMode: SupportOptionItemMode.Edit });

            changeInput(getNameInput(), 'Changed');
            clickButton(getCancelButton());

            expect(getModal()).toBeInTheDocument();

            cancelModal();

            expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        });

        it('closes modal via onClose callback', () => {
            renderItem({ initialMode: SupportOptionItemMode.Edit });

            changeInput(getNameInput(), 'Changed');
            clickButton(getCancelButton());

            expect(getModal()).toBeInTheDocument();

            cancelModal();

            expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        });

        it('shows different confirmation message for edit cancel vs create cancel', () => {
            const { rerender } = renderItem({ initialMode: SupportOptionItemMode.Edit });

            changeInput(getNameInput(), 'Changed');
            clickButton(getCancelButton());

            expect(
                screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE),
            ).toBeInTheDocument();

            cancelModal();

            rerender(<SupportOptionItem initialMode={SupportOptionItemMode.Create} />);

            changeInput(getNameInput(), 'New');
            clickButton(getCancelButton());

            expect(screen.getByText(DONATE_TEXT.QUESTION.SUPPORT_OPTION.CANCEL_CREATE)).toBeInTheDocument();
        });
    });

    describe('Delete Functionality', () => {
        it('delete button opens confirmation modal and calls onDelete', async () => {
            const onDelete = jest.fn().mockResolvedValue(undefined);
            renderItem({ onDelete });

            clickButton(getDeleteButton());

            await waitFor(() => {
                expect(getModal()).toBeInTheDocument();
            });

            confirmModal();

            await waitFor(() => {
                expect(onDelete).toHaveBeenCalled();
            });
        });

        it('does not delete if onDelete is not provided', async () => {
            renderItem();

            clickButton(getDeleteButton());

            const yesButton = await screen.findByText('Yes');
            clickButton(yesButton);

            await waitFor(() => {
                expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('keeps modal open if onConfirm (delete) throws an error', async () => {
            const mockOnDelete = jest.fn().mockRejectedValue(new Error('Delete failed'));
            renderItem({ onDelete: mockOnDelete });

            clickButton(getDeleteButton());

            const yesButton = await screen.findByText('Yes');
            clickButton(yesButton);

            await waitFor(() => {
                expect(mockOnDelete).toHaveBeenCalled();
            });
            expect(getModal()).toBeInTheDocument();
        });

        it('keeps modal open if onConfirm (save in create mode) throws an error', async () => {
            const mockOnSave = jest.fn().mockRejectedValue(new Error('Save failed'));
            renderItem({ data: null, onSave: mockOnSave, initialMode: SupportOptionItemMode.Create });

            fillInputs('New Name', 'New Value');
            clickButton(getPublishButton());

            const yesButton = await screen.findByText('Yes');
            clickButton(yesButton);

            await waitFor(() => {
                expect(mockOnSave).toHaveBeenCalled();
            });

            expect(getModal()).toBeInTheDocument();
        });
    });

    describe('Loading States', () => {
        it('disables buttons while submitting in edit mode', async () => {
            const onSave = jest.fn<Promise<void>, [string, string]>(
                () => new Promise((resolve) => setTimeout(() => resolve(), 100)),
            );
            renderItem({ onSave, initialMode: SupportOptionItemMode.Edit });

            changeInput(getNameInput(), 'Updated Name');

            const publishButton = getPublishButton();
            const cancelButton = getCancelButton();

            clickButton(publishButton);

            await waitFor(() => {
                expect(publishButton).toBeDisabled();
                expect(cancelButton).toBeDisabled();
            });
        });

        it('disables edit and delete buttons while submitting', async () => {
            const onDelete = jest.fn<Promise<void>, []>(
                () => new Promise((resolve) => setTimeout(() => resolve(), 100)),
            );
            renderItem({ onDelete });

            const deleteButton = getDeleteButton();
            clickButton(deleteButton);

            const yesButton = await screen.findByText('Yes');
            clickButton(yesButton);

            await waitFor(() => {
                expect(getEditButton()).toBeDisabled();
                expect(deleteButton).toBeDisabled();
            });
        });
    });

    describe('Data Updates', () => {
        it('updates state when data prop changes', () => {
            const { rerender } = renderItem();

            const newData = { id: 2, name: 'New Option', value: 'New Value', currency: BankCurrency.Usd };
            rerender(<SupportOptionItem data={newData} />);

            expect(screen.getByText('New Option')).toBeInTheDocument();
        });
    });
});
