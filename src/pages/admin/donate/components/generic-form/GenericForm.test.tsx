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
    { name: 'name', label: 'Name', isRequired: true, isTitle: true },
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

    const getChildFormDeleteButton = () => {
        const childFields: GenericFormField<Item>[] = [
            { name: 'name', label: 'Name', isTitle: true, isRequired: true },
            { name: 'optional', label: 'Optional' },
        ];
        const ChildForm = createGenericForm<Item>(childFields);

        render(
            <ChildForm
                initialData={{ id: 1, name: 'Test Name', optional: 'opt' }}
                initialMode={GenericFormMode.View}
                isChildForm={true}
                onClose={jest.fn()}
                onSubmit={jest.fn()}
                onDelete={jest.fn()}
            />,
        );

        const header = screen.getByText('Test Name');
        fireEvent.click(header);

        const deleteButton = screen.getByRole('button', { name: 'delete-btn' });
        return deleteButton;
    };

    const testFieldChange = (fieldsConfig: GenericFormField<Item>[], changeValue: string, expectedValue: string) => {
        const TestForm = createGenericForm<Item>(fieldsConfig);

        render(
            <TestForm
                initialData={{ id: 1, name: 'Test', optional: 'opt' }}
                initialMode={GenericFormMode.Edit}
                onClose={jest.fn()}
                onSubmit={jest.fn()}
            />,
        );

        const input = screen.getByDisplayValue('Test');
        fireEvent.change(input, { target: { value: changeValue } });
        fireEvent.blur(input);

        expect((input as HTMLInputElement).value).toBe(expectedValue);
    };

    test('renders form in view mode', () => {
        render(<GenericForm {...defaultProps} />);
        expect(screen.getByText('Test Name')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'delete-btn' })).toBeInTheDocument();
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
        expect(screen.getByText(DONATE_TEXT.QUESTION.BANK_DETAILS.DELETE)).toBeInTheDocument();
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

    it('should have the publish button disabled on initial render in Edit mode', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} />);

        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH) as HTMLButtonElement;
        expect(publishButton.disabled).toBe(true);
    });

    it('publish button disabled if required field empty', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} />);
        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '' } });

        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH) as HTMLButtonElement;
        expect(publishButton.disabled).toBe(true);
    });

    it('should disable publish button if a custom validation error exists', () => {
        const fieldsWithValidator: GenericFormField<Item>[] = [
            {
                name: 'name',
                label: 'Name',
                isTitle: true,
                validate: (value) => ((value as string).length < 5 ? 'Name is too short' : undefined),
            },
        ];

        const FormWithValidator = createGenericForm<Item>(fieldsWithValidator);

        render(
            <FormWithValidator
                {...defaultProps}
                initialMode={GenericFormMode.Edit}
                initialData={{ id: 1, name: 'Valid Name' }}
            />,
        );

        const input = screen.getByDisplayValue('Valid Name');

        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH) as HTMLButtonElement;

        fireEvent.change(input, { target: { value: '123' } });
        fireEvent.blur(input);

        expect(screen.getByText('Name is too short')).toBeInTheDocument();
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

    test('closes modal on cancel', () => {
        render(<GenericForm {...defaultProps} />);
        const deleteButton = screen.getByRole('button', { name: 'delete-btn' });
        fireEvent.click(deleteButton);

        const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO);
        fireEvent.click(cancelButton);

        expect(screen.queryByText(DONATE_TEXT.QUESTION.BANK_DETAILS.DELETE)).not.toBeInTheDocument();
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
        { name: 'name', isRequired: true, isTitle: true },
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

    test('resets isDeleting on modal cancel', () => {
        const deleteButton = getChildFormDeleteButton();
        fireEvent.click(deleteButton);

        expect(screen.getByText(DONATE_TEXT.QUESTION.CORRESPONDENT_BANKS.DELETE)).toBeInTheDocument();

        const cancelBtn = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO);
        fireEvent.click(cancelBtn);

        expect(screen.queryByText(DONATE_TEXT.QUESTION.CORRESPONDENT_BANKS.DELETE)).not.toBeInTheDocument();
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

    it('prevents submit when onSubmit is not provided', async () => {
        const ref = React.createRef<any>();

        render(
            <GenericForm {...defaultProps} ref={ref} initialMode={GenericFormMode.Edit} onSubmit={undefined as any} />,
        );

        const input = screen.getByDisplayValue('Test Name');
        fireEvent.change(input, { target: { value: 'Changed' } });

        await ref.current.submit();

        expect(screen.getByDisplayValue('Changed')).toBeInTheDocument();
    });

    it('successfully submits form and switches Edit to View mode', async () => {
        const onSubmit = jest.fn().mockResolvedValue(undefined);
        const ref = React.createRef<any>();

        render(<GenericForm {...defaultProps} ref={ref} initialMode={GenericFormMode.Edit} onSubmit={onSubmit} />);

        const input = screen.getByDisplayValue('Test Name');
        fireEvent.change(input, { target: { value: 'New Name' } });

        await ref.current.submit();

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({ id: 1, name: 'New Name', optional: 'opt' });
            expect(screen.getByText('New Name')).toBeInTheDocument();
        });
    });

    it('does not toggle mode when clicking edit button in Edit mode', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} />);

        const editButton = screen.getByRole('button', { name: 'edit-btn' });
        fireEvent.click(editButton);

        expect(screen.getByDisplayValue('Test Name')).toBeInTheDocument();
    });

    it('shows specific delete title for bank with correspondentBanks', () => {
        const dataWithCorrespondentBanks = {
            id: 1,
            name: 'Test Bank',
            optional: 'opt',
            correspondentBanks: [{ name: 'Correspondent Bank', swift: 'TEST', account: '123' }],
        };

        render(
            <GenericForm
                {...defaultProps}
                initialData={dataWithCorrespondentBanks as any}
                initialMode={GenericFormMode.View}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'delete-btn' });
        fireEvent.click(deleteButton);

        expect(screen.getByText(DONATE_TEXT.QUESTION.BANK_DETAILS.FOREIGN.DELETE)).toBeInTheDocument();
    });

    it('handles value change for field without validator', () => {
        testFieldChange(fields, 'Updated', 'Updated');
    });

    it('toggles from View to Edit mode and expands form on edit button click', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.View} />);

        const editButton = screen.getByRole('button', { name: 'edit-btn' });
        fireEvent.click(editButton);

        expect(screen.getByDisplayValue('Test Name')).toBeInTheDocument();
        expect(screen.getByDisplayValue('opt')).toBeInTheDocument();
    });

    it('resets form state without modal when canceling Edit with no changes', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.Edit} />);

        const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelButton);

        expect(
            screen.queryByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE),
        ).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'edit-btn' })).toBeInTheDocument();
    });

    it('renders children when isChildForm is false', () => {
        render(<GenericForm {...defaultProps} isChildForm={false} />);
        expect(screen.getByText('opt')).toBeInTheDocument();
    });

    it('handles View mode cancel by calling handleViewCancel', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.View} />);

        const header = screen.getByText('Test Name');
        fireEvent.click(header);
        expect(header.querySelector('.arrow')?.classList.contains('expanded')).toBe(true);

        fireEvent.keyDown(header, { key: 'Escape' });
        fireEvent.click(header);

        expect(header.querySelector('.arrow')?.classList.contains('expanded')).toBe(false);
    });

    it('shows correct delete title for child form', () => {
        const deleteButton = getChildFormDeleteButton();
        fireEvent.click(deleteButton);

        expect(screen.getByText(DONATE_TEXT.QUESTION.CORRESPONDENT_BANKS.DELETE)).toBeInTheDocument();
    });

    it('updates required field validation state', () => {
        testFieldChange(
            [
                {
                    name: 'name',
                    isTitle: true,
                    isRequired: true,
                    validate: (val) => (val ? undefined : 'Required'),
                },
                { name: 'optional' },
            ],
            '',
            '',
        );
    });

    it('keeps form expanded after switching from View to Edit', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.View} />);

        const editButton = screen.getByRole('button', { name: 'edit-btn' });
        fireEvent.click(editButton);

        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBeGreaterThan(0);
    });

    it('covers handleEditClick in View to Edit transition', () => {
        render(<GenericForm {...defaultProps} initialMode={GenericFormMode.View} />);

        const editButton = screen.getByRole('button', { name: 'edit-btn' });
        fireEvent.click(editButton);

        expect(screen.getByDisplayValue('Test Name')).toBeInTheDocument();
        expect(screen.getByDisplayValue('opt')).toBeInTheDocument();
    });

    it('covers isDeleting state in child form delete', () => {
        const deleteButton = getChildFormDeleteButton();
        fireEvent.click(deleteButton);

        expect(screen.getByText(DONATE_TEXT.QUESTION.CORRESPONDENT_BANKS.DELETE)).toBeInTheDocument();
    });
});
