import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createGenericForm, GenericFormField, GenericFormMode, GenericFormProps } from './GenericForm';
import { DONATE_TEXT } from '../../../../../const/admin/donate';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

interface Item {
    id?: number;
    name: string;
}

const fields = [{ name: 'name', label: 'Name', isRequired: true } as GenericFormField<Item>];

const GenericForm = createGenericForm<Item>(fields);

describe('GenericForm', () => {
    const defaultProps: GenericFormProps<Item> = {
        initialData: { id: 1, name: 'Test Name' },
        initialMode: GenericFormMode.View,
        onClose: jest.fn(),
        onSubmit: jest.fn(),
        onDelete: jest.fn(),
    };

    test('renders form in view mode', () => {
        render(<GenericForm {...defaultProps} />);
        expect(screen.getByText('Test Name')).toBeInTheDocument();
        expect(screen.getByText(DONATE_TEXT.BUTTON.DELETE)).toBeInTheDocument();
    });

    test('switches to edit mode when edit button is clicked', () => {
        render(<GenericForm {...defaultProps} />);
        const editButton = screen.getByRole('button', { name: '' });
        fireEvent.click(editButton);
        expect(screen.getByDisplayValue('Test Name')).toBeInTheDocument();
    });

    test('changes input value', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} />);
        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'New Name' } });
        expect(input.value).toBe('New Name');
    });

    test('submit calls onSubmit', async () => {
        const onSubmit = jest.fn();
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} onSubmit={onSubmit} />);
        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Updated Name' } });

        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH);
        fireEvent.click(publishButton);

        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ id: 1, name: 'Updated Name' }));
    });

    test('cancel resets form state', () => {
        const onClose = jest.fn();
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Create} onClose={onClose} />);
        const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelButton);
        expect(onClose).toHaveBeenCalled();
    });

    test('shows validation error', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} />);
        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '' } });

        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH);
        fireEvent.click(publishButton);

        expect(screen.getByText(DONATE_TEXT.BUTTON.PUBLISH)).toBeInTheDocument();
    });

    test('opens confirmation modal on delete click', () => {
        render(<GenericForm {...defaultProps} />);
        const deleteButton = screen.getByRole('button', { name: '' });
        fireEvent.click(deleteButton);
        expect(screen.getByText(DONATE_TEXT.BUTTON.DELETE)).toBeInTheDocument();
    });
});
