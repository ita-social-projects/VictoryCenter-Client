import { render, screen, fireEvent } from '@testing-library/react';
import { SupportOptionsType } from '../../../../../../types/admin/donate';
import { SupportOptionsForm } from './SupportOptionsForm';
import { DONATE_TEXT } from '../../../../../../const/admin/donate';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';

const initialData: SupportOptionsType[] = [
    { id: 1, name: 'Option 1', value: 'Value 1' },
    { id: 2, name: 'Option 2', value: 'Value 2' },
];

describe('SupportOptionsForm', () => {
    test('renders with initial data', () => {
        render(<SupportOptionsForm initialData={initialData} />);
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.queryByTestId('support-options-not-found')).not.toBeInTheDocument();
    });

    test('shows not found block if no items', () => {
        render(<SupportOptionsForm initialData={[]} />);
        expect(screen.getByTestId('support-options-not-found')).toBeInTheDocument();
        expect(screen.getByText(DONATE_TEXT.SUPPORT_OPTIONS.NOT_FOUND)).toBeInTheDocument();
    });

    test('clicking add button shows new SupportOptionItem', () => {
        render(<SupportOptionsForm initialData={[]} />);
        const addButton = screen.getByText(DONATE_TEXT.SUPPORT_OPTIONS.ADD_FIRST);
        fireEvent.click(addButton);
        expect(screen.queryByTestId('support-options-not-found')).not.toBeInTheDocument();
    });

    test('adding new option calls onChangeItems', () => {
        const onChangeItems = jest.fn();
        render(<SupportOptionsForm initialData={[]} onChangeItems={onChangeItems} />);

        const addButton = screen.getByText(DONATE_TEXT.SUPPORT_OPTIONS.ADD_FIRST);
        fireEvent.click(addButton);
        const nameInput = screen.getByPlaceholderText('Введіть назву');
        const valueInput = screen.getByPlaceholderText('Введіть реквізити');

        fireEvent.change(nameInput, { target: { value: 'Option 3' } });
        fireEvent.change(valueInput, { target: { value: 'Value 3' } });
        const saveButton = screen.getByRole('button', { name: DONATE_TEXT.BUTTON.PUBLISH });
        fireEvent.click(saveButton);
        expect(screen.getByText(DONATE_TEXT.QUESTION.SUPPORT_OPTION.ADD)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));
        expect(onChangeItems).toHaveBeenCalled();
    });

    test('deleting option removes it from the list', () => {
        const onChangeItems = jest.fn();
        render(<SupportOptionsForm initialData={initialData} onChangeItems={onChangeItems} />);

        const deleteButtons = screen.getAllByRole('button', { name: 'delete-btn' });
        fireEvent.click(deleteButtons[0]);

        expect(screen.getByText(DONATE_TEXT.QUESTION.SUPPORT_OPTION.DELETE)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        expect(onChangeItems).toHaveBeenCalled();
    });

    test('cancel adding new option hides the form', () => {
        render(<SupportOptionsForm initialData={[]} />);
        fireEvent.click(screen.getByText(DONATE_TEXT.SUPPORT_OPTIONS.ADD_FIRST));
        const nameInput = screen.getByPlaceholderText('Введіть назву');
        expect(nameInput).toBeInTheDocument();

        const cancelButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL });
        fireEvent.click(cancelButton);

        expect(screen.queryByPlaceholderText('Введіть назву')).not.toBeInTheDocument();
    });

    test('clicking "Add New" when items exist shows new SupportOptionItem', () => {
        render(<SupportOptionsForm initialData={initialData} />);
        fireEvent.click(screen.getByText(DONATE_TEXT.SUPPORT_OPTIONS.ADD_NEW));

        expect(screen.getByPlaceholderText('Введіть назву')).toBeInTheDocument();
    });

    test('updating existing item calls onChangeItems', () => {
        const onChangeItems = jest.fn();
        render(<SupportOptionsForm initialData={initialData} onChangeItems={onChangeItems} />);

        const editButton = screen.getAllByRole('button', { name: 'edit-btn' })[0];
        fireEvent.click(editButton);
        const nameInput = screen.getAllByPlaceholderText('Введіть назву')[0];
        fireEvent.change(nameInput, { target: { value: 'Updated Option 1' } });

        const valueInput = screen.getAllByPlaceholderText('Введіть реквізити')[0];
        fireEvent.change(valueInput, { target: { value: 'Updated Value 1' } });

        const saveButton = screen.getByRole('button', { name: DONATE_TEXT.BUTTON.PUBLISH });
        fireEvent.click(saveButton);

        expect(onChangeItems).toHaveBeenCalledWith([
            { id: 1, name: 'Updated Option 1', value: 'Updated Value 1' },
            { id: 2, name: 'Option 2', value: 'Value 2' },
        ]);
    });

    test('useEffect resets items when initialData changes', () => {
        const { rerender } = render(<SupportOptionsForm initialData={[]} />);
        expect(screen.getByTestId('support-options-not-found')).toBeInTheDocument();

        rerender(<SupportOptionsForm initialData={initialData} />);
        expect(screen.queryByTestId('support-options-not-found')).not.toBeInTheDocument();
        expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
});
