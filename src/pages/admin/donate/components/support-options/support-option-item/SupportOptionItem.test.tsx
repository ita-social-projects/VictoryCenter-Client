import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SupportOptionItem, SupportOptionItemMode } from './SupportOptionItem';
import { DONATE_TEXT } from '@/const/admin/donate';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { BankCurrency } from '@/types/admin/donate';

jest.mock('../../donate-input/DonateInput', () => ({
    DonateInput: ({ value, onValueChange, onBlur, name }: any) => (
        <input
            value={value}
            onChange={(e) => onValueChange?.(e.target.value)}
            onBlur={onBlur}
            data-testid={`input-${name}`}
            placeholder={name}
        />
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

describe('SupportOptionItem', () => {
    const defaultData = {
        id: 1,
        name: 'Option 1',
        value: 'Value 1',
        currency: BankCurrency.Uah,
    };

    it('renders in view mode with data', () => {
        render(<SupportOptionItem data={defaultData} />);
        expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('renders in create mode by default without data', () => {
        render(<SupportOptionItem />);
        expect(screen.getByTestId('input-name')).toBeInTheDocument();
        expect(screen.getByTestId('input-value')).toBeInTheDocument();
    });

    it('switches to edit mode when edit button clicked', () => {
        render(<SupportOptionItem data={defaultData} />);
        const editButton = screen.getByRole('button', { name: 'edit-btn' });
        fireEvent.click(editButton);
        expect(screen.getByTestId('input-name')).toBeInTheDocument();
    });

    it('calls onSave with updated values in edit mode', async () => {
        const onSave = jest.fn().mockResolvedValue(undefined);
        render(<SupportOptionItem data={defaultData} onSave={onSave} initialMode={SupportOptionItemMode.Edit} />);

        const nameInput = screen.getByTestId('input-name');
        const valueInput = screen.getByTestId('input-value');

        fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
        fireEvent.change(valueInput, { target: { value: 'Updated Value' } });

        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH);
        fireEvent.click(publishButton);

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith('Updated Name', 'Updated Value');
        });
    });

    it('shows confirmation modal when saving in create mode', async () => {
        const onSave = jest.fn().mockResolvedValue(undefined);
        render(<SupportOptionItem onSave={onSave} initialMode={SupportOptionItemMode.Create} />);

        const nameInput = screen.getByTestId('input-name');
        const valueInput = screen.getByTestId('input-value');

        fireEvent.change(nameInput, { target: { value: 'New Name' } });
        fireEvent.change(valueInput, { target: { value: 'New Value' } });

        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH);
        fireEvent.click(publishButton);

        await waitFor(() => {
            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        });

        const yesButton = screen.getByText('Yes');
        fireEvent.click(yesButton);

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith('New Name', 'New Value');
        });
    });

    it('cancel with changes opens confirmation modal', () => {
        render(<SupportOptionItem data={defaultData} initialMode={SupportOptionItemMode.Edit} />);
        const nameInput = screen.getByTestId('input-name');
        fireEvent.change(nameInput, { target: { value: 'Changed' } });

        const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelButton);

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    });

    it('cancel without changes resets form directly', () => {
        render(<SupportOptionItem data={defaultData} initialMode={SupportOptionItemMode.Edit} />);
        const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelButton);

        expect(screen.queryByTestId('input-name')).not.toBeInTheDocument();
    });

    it('cancel in create mode calls onCancel', () => {
        const onCancel = jest.fn();
        render(<SupportOptionItem onCancel={onCancel} initialMode={SupportOptionItemMode.Create} />);

        const nameInput = screen.getByTestId('input-name');
        fireEvent.change(nameInput, { target: { value: 'Test' } });

        const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelButton);

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();

        const yesButton = screen.getByText('Yes');
        fireEvent.click(yesButton);

        expect(onCancel).toHaveBeenCalled();
    });

    it('delete button opens confirmation modal and calls onDelete', async () => {
        const onDelete = jest.fn().mockResolvedValue(undefined);
        render(<SupportOptionItem data={defaultData} onDelete={onDelete} />);

        const deleteButton = screen.getByRole('button', { name: 'delete-btn' });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        });

        const yesButton = screen.getByText('Yes');
        fireEvent.click(yesButton);

        await waitFor(() => {
            expect(onDelete).toHaveBeenCalled();
        });
    });

    it('disables publish button if fields are empty', () => {
        render(<SupportOptionItem initialMode={SupportOptionItemMode.Create} />);
        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH);
        expect(publishButton).toBeDisabled();
    });

    it('disables publish button if no changes were made', () => {
        render(<SupportOptionItem data={defaultData} initialMode={SupportOptionItemMode.Edit} />);
        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH);
        expect(publishButton).toBeDisabled();
    });

    it('shows validation errors on blur', () => {
        render(<SupportOptionItem initialMode={SupportOptionItemMode.Create} />);

        const nameInput = screen.getByTestId('input-name');
        fireEvent.change(nameInput, { target: { value: 'A' } });
        fireEvent.blur(nameInput);

        expect(screen.getByText('Name too short')).toBeInTheDocument();
    });

    it('disables publish button when validation errors exist', () => {
        render(<SupportOptionItem data={defaultData} initialMode={SupportOptionItemMode.Edit} />);

        const nameInput = screen.getByTestId('input-name');
        fireEvent.blur(nameInput);

        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH);
        expect(publishButton).toBeDisabled();
    });

    it('updates state when data prop changes', () => {
        const { rerender } = render(<SupportOptionItem data={defaultData} />);

        const newData = { id: 2, name: 'New Option', value: 'New Value', currency: BankCurrency.Usd };
        rerender(<SupportOptionItem data={newData} />);

        expect(screen.getByText('New Option')).toBeInTheDocument();
    });

    it('closes modal on cancel button click', () => {
        render(<SupportOptionItem data={defaultData} initialMode={SupportOptionItemMode.Edit} />);

        const nameInput = screen.getByTestId('input-name');
        fireEvent.change(nameInput, { target: { value: 'Changed' } });

        const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelButton);

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();

        const noButton = screen.getByText('No');
        fireEvent.click(noButton);

        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });

    it('calls onModeChange when mode changes', () => {
        const mockOnModeChange = jest.fn();
        render(<SupportOptionItem data={defaultData} onModeChange={mockOnModeChange} />);
        expect(mockOnModeChange).toHaveBeenLastCalledWith(SupportOptionItemMode.View);
        mockOnModeChange.mockClear();

        const editButton = screen.getByRole('button', { name: 'edit-btn' });
        fireEvent.click(editButton);

        expect(mockOnModeChange).toHaveBeenLastCalledWith(SupportOptionItemMode.Edit);
        mockOnModeChange.mockClear();

        const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelButton);

        expect(mockOnModeChange).toHaveBeenLastCalledWith(SupportOptionItemMode.View);
    });

    it('keeps modal open if onConfirm (delete) throws an error', async () => {
        const mockOnDelete = jest.fn().mockRejectedValue(new Error('Delete failed'));
        render(<SupportOptionItem data={defaultData} onDelete={mockOnDelete} />);

        const deleteButton = screen.getByRole('button', { name: 'delete-btn' });
        fireEvent.click(deleteButton);

        const yesButton = await screen.findByText('Yes');
        fireEvent.click(yesButton);

        await waitFor(() => {
            expect(mockOnDelete).toHaveBeenCalled();
        });
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    });

    it('does not do anything if edit button is clicked while already in edit mode', () => {
        const mockOnModeChange = jest.fn();
        render(<SupportOptionItem data={defaultData} onModeChange={mockOnModeChange} />);

        const editButton = screen.getByRole('button', { name: 'edit-btn' });
        fireEvent.click(editButton);

        mockOnModeChange.mockClear();

        fireEvent.click(editButton);

        expect(mockOnModeChange).not.toHaveBeenCalled();
    });
});
