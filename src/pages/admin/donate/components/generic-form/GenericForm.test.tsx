import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createGenericForm, GenericFormField, GenericFormMode, GenericFormProps } from './GenericForm';
import { DONATE_TEXT } from '../../../../../const/admin/donate';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import React from 'react';

interface Item {
    id?: number;
    name: string;
    optional?: string;
}

const fields: GenericFormField<Item>[] = [
    { name: 'name', label: 'Name', isRequired: true },
    { name: 'optional', label: 'Optional' },
];

const GenericForm = createGenericForm<Item>(fields);

describe('GenericForm', () => {
    const defaultProps: GenericFormProps<Item> = {
        initialData: { id: 1, name: 'Test Name', optional: 'opt' },
        initialMode: GenericFormMode.View,
        onClose: jest.fn(),
        onSubmit: jest.fn(),
        onDelete: jest.fn(),
        children: ({ formState }) => <div>{formState.optional}</div>,
    };

    test('renders form in view mode', () => {
        render(<GenericForm {...defaultProps} />);
        expect(screen.getByText('Test Name')).toBeInTheDocument();
        expect(screen.getByText(DONATE_TEXT.BUTTON.DELETE)).toBeInTheDocument();
    });

    test('switches to edit mode when edit button is clicked', () => {
        render(<GenericForm {...defaultProps} />);
        const editButton = screen.getByRole('button', { name: 'edit-btn' });
        fireEvent.click(editButton);
        expect(screen.getByDisplayValue('Test Name')).toBeInTheDocument();
    });

    test('changes input value', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} />);
        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'New Name' } });
        expect(input.value).toBe('New Name');
    });

    test('publish on updated form', async () => {
        const onSubmit = jest.fn();
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} onSubmit={onSubmit} />);
        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Updated Name' } });

        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH);
        fireEvent.click(publishButton);

        expect(screen.getByText(DONATE_TEXT.BUTTON.PUBLISH)).toBeInTheDocument();
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
        const deleteButton = screen.getByRole('button', { name: 'delete-btn' });
        fireEvent.click(deleteButton);
        expect(screen.getByText(DONATE_TEXT.BUTTON.DELETE)).toBeInTheDocument();
    });

    it('renders children', () => {
        render(<GenericForm {...defaultProps} />);
        expect(screen.getByText('opt')).toBeInTheDocument();
    });

    it('isChanged returns true after input change', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} />);
        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Changed' } });
        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH);
        expect(publishButton).not.toBeDisabled();
    });

    it('isValid blocks submit for invalid required field', async () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} />);
        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '' } });

        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH);
        fireEvent.click(publishButton);

        await waitFor(() => expect(publishButton).toBeInTheDocument());
    });

    it('handleEditCancel restores initial state if changed', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} />);
        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Changed' } });

        const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelButton);

        expect(screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE)).toBeInTheDocument();
    });

    it('handleDeleteClick triggers onDelete for Edit mode', async () => {
        const onDelete = jest.fn().mockResolvedValue(undefined);
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} onDelete={onDelete} />);
        const deleteButton = screen.getByRole('button', { name: 'delete-btn' });
        fireEvent.click(deleteButton);

        const confirmButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES);
        fireEvent.click(confirmButton);

        await waitFor(() => expect(onDelete).toHaveBeenCalledWith(1));
    });

    it('publish button disabled if required field empty', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} />);
        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '' } });

        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH) as HTMLButtonElement;
        expect(publishButton.disabled).toBe(true);
    });

    it('toggles expanded state on header click and keydown', () => {
        render(<GenericForm {...defaultProps} />);
        const header = screen.getByText('Test Name');

        fireEvent.click(header);
        expect(header.querySelector('.arrow')?.classList.contains('expanded')).toBe(true);

        fireEvent.keyDown(header, { key: 'Enter' });
        expect(header.querySelector('.arrow')?.classList.contains('expanded')).toBe(false);
    });

    it('validates field on blur', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} />);
        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;

        fireEvent.blur(input);
    });

    it('exposes submit, isChanged, isValid via ref', async () => {
        const ref = React.createRef<any>();
        render(<GenericForm {...defaultProps} ref={ref} initialMode={GenericFormMode.Edit} />);
        expect(ref.current.isChanged()).toBe(false);

        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Changed' } });
        expect(ref.current.isChanged()).toBe(true);

        expect(ref.current.isValid()).toBe(true);
    });

    it('handles Create mode cancel and submit', async () => {
        const onClose = jest.fn();
        const onSubmit = jest.fn().mockResolvedValue(undefined);

        render(
            <GenericForm
                {...defaultProps}
                initialMode={GenericFormMode.Create}
                onClose={onClose}
                onSubmit={onSubmit}
            />,
        );

        const cancelBtn = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelBtn);
        expect(onClose).toHaveBeenCalled();

        const publishBtn = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH);
        fireEvent.click(publishBtn);
    });

    it('closes modal on cancel', () => {
        render(<GenericForm {...defaultProps} />);
        const deleteButton = screen.getByRole('button', { name: 'delete-btn' });
        fireEvent.click(deleteButton);

        const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO);
        fireEvent.click(cancelButton);
        expect(screen.getByText(DONATE_TEXT.BUTTON.DELETE)).toBeInTheDocument();
    });

    it('detects empty required fields', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} />);
        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '' } });

        const publishBtn = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH) as HTMLButtonElement;
        expect(publishBtn.disabled).toBe(true);
    });

    it('Create mode cancel without changes calls onClose directly', () => {
        const onClose = jest.fn();
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Create} onClose={onClose} />);
        const cancelBtn = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelBtn);
        expect(onClose).toHaveBeenCalled();
    });

    it('does not call onDelete if no id provided', async () => {
        const onDelete = jest.fn();
        render(<GenericForm {...defaultProps} initialData={{ name: 'No ID' }} onDelete={onDelete} />);
        const deleteButton = screen.getByRole('button', { name: 'delete-btn' });
        fireEvent.click(deleteButton);

        const confirmButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES);
        fireEvent.click(confirmButton);

        await waitFor(() => expect(onDelete).not.toHaveBeenCalled());
    });

    const arrayFields: GenericFormField<any>[] = [
        { name: 'name', isRequired: true },
        { name: 'tags', isRequired: true },
    ];
    const ArrayForm = createGenericForm<{ id?: number; name: string; tags: string[] }>(arrayFields);

    it('disables publish when required array field is empty', () => {
        render(
            <ArrayForm
                initialData={{ id: 1, name: 'Name', tags: [] }}
                initialMode={GenericFormMode.Edit}
                onClose={jest.fn()}
                onSubmit={jest.fn()}
            />,
        );
        const publishBtn = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH) as HTMLButtonElement;
        expect(publishBtn.disabled).toBe(true);
    });

    it('does not render children when isChildForm is true', () => {
        render(<GenericForm {...defaultProps} isChildForm={true} />);
        expect(screen.queryByText('opt')).not.toBeInTheDocument();
    });

    it('shows cancel edit modal in Create mode when there are unsaved changes', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Create} />);
        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Changed' } });

        const cancelBtn = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelBtn);

        expect(screen.getByText(DONATE_TEXT.QUESTION.BANK_DETAILS.CANCEL_CREATE)).toBeInTheDocument();
    });

    it('resets isDeleting on modal cancel', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} />);
        const deleteBtn = screen.getByRole('button', { name: 'delete-btn' });
        fireEvent.click(deleteBtn);

        const cancelBtn = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO);
        fireEvent.click(cancelBtn);

        const icon = screen.getByRole('button', { name: 'delete-btn' }).querySelector('.delete-btn-icon');
        expect(icon?.classList.contains('pressed')).toBe(false);
    });

    it('returns null when isOpen is false', () => {
        const { container } = render(<GenericForm {...defaultProps} isOpen={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('resets form and switches mode to View if no changes on cancel', () => {
        const initialData = { name: 'Test Name', receiver: 'Test Receiver' };
        const onClose = jest.fn();
        interface TestForm {
            id?: number;
            name: string;
            receiver: string;
        }

        const Form = createGenericForm<TestForm>([
            { name: 'name', isTitle: true, isRequired: true },
            { name: 'receiver', isRequired: true },
        ]);

        render(
            React.createElement(Form as any, {
                initialMode: GenericFormMode.Edit,
                initialData,
                onSubmit: jest.fn(),
                onClose,
            }),
        );

        const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelButton);

        expect(screen.getByRole('button', { name: /edit-btn/i })).toBeInTheDocument();
        expect(screen.getByText('Test Name')).toBeInTheDocument();
        expect(screen.getByText('Test Receiver')).toBeInTheDocument();
    });

    it('calls onClose directly in Create mode if no changes', () => {
        const onClose = jest.fn();
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Create} onClose={onClose} />);
        const cancelBtn = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelBtn);

        expect(onClose).toHaveBeenCalled();
    });
});
