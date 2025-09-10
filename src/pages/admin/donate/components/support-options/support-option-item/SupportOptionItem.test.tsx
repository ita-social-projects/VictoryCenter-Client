import { render, screen, fireEvent } from '@testing-library/react';
import { SupportOptionItem, SupportOptionItemMode } from './SupportOptionItem';
import { DONATE_TEXT } from '../../../../../../const/admin/donate';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';

describe('SupportOptionItem', () => {
    const defaultData = { id: 1, name: 'Option 1', value: 'Value 1' };

    test('renders in view mode with data', () => {
        render(<SupportOptionItem data={defaultData} />);
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'edit-btn' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'delete-btn' })).toBeInTheDocument();
    });

    test('switches to edit mode when edit button clicked', () => {
        render(<SupportOptionItem data={defaultData} />);
        const editButton = screen.getAllByRole('button')[0];
        fireEvent.click(editButton);
        expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Value 1')).toBeInTheDocument();
    });

    test('save calls onSave with updated values', () => {
        const onSave = jest.fn();
        render(<SupportOptionItem data={defaultData} onSave={onSave} initialMode={SupportOptionItemMode.Edit} />);
        const nameInput = screen.getByDisplayValue('Option 1');
        const valueInput = screen.getByDisplayValue('Value 1');

        fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
        fireEvent.change(valueInput, { target: { value: 'Updated Value' } });

        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH);
        fireEvent.click(publishButton);

        expect(onSave).toHaveBeenCalledWith({ id: 1, name: 'Updated Name', value: 'Updated Value' });
    });

    test('cancel with changes opens confirmation modal', () => {
        render(<SupportOptionItem data={defaultData} initialMode={SupportOptionItemMode.Edit} />);
        const nameInput = screen.getByDisplayValue('Option 1');
        fireEvent.change(nameInput, { target: { value: 'Changed' } });

        const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
        fireEvent.click(cancelButton);

        expect(screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE)).toBeInTheDocument();
    });

    test('delete button opens confirmation modal and calls onDelete', () => {
        const onDelete = jest.fn();
        render(<SupportOptionItem data={defaultData} onDelete={onDelete} />);
        const deleteButton = screen.getAllByRole('button')[1];
        fireEvent.click(deleteButton);

        expect(screen.getByText(DONATE_TEXT.QUESTION.SUPPORT_OPTION.DELETE)).toBeInTheDocument();

        const yesButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES);
        fireEvent.click(yesButton);

        expect(onDelete).toHaveBeenCalledWith(1);
    });

    test('create mode disables publish button if fields empty', () => {
        const onSave = jest.fn();
        render(<SupportOptionItem initialMode={SupportOptionItemMode.Create} onSave={onSave} />);
        const publishButton = screen.getByText(DONATE_TEXT.BUTTON.PUBLISH);
        expect(publishButton).toBeDisabled();
    });
});
