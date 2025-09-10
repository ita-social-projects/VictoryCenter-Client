import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GenericDetails, GenericDetailsProps } from './GenericDetails';
import { GenericFormRef } from '../generic-form/GenericForm';
import { forwardRef, useImperativeHandle } from 'react';
import { DONATE_TEXT } from '../../../../../const/admin/donate';

interface Item {
    id?: number;
    name: string;
}

const MockForm = forwardRef<GenericFormRef, any>(({ onSubmit, onClose, initialData }, ref) => {
    useImperativeHandle(ref, () => ({
        submit: async () => {},
        isChanged: () => false,
        isValid: () => true,
    }));

    const testId = initialData?.id ? `mock-form-${initialData.id}` : 'mock-form-new';

    return (
        <div data-testid={testId}>
            <p>{initialData?.name}</p>
            <button onClick={() => onSubmit({ id: Date.now(), name: 'New Item' })}>Submit</button>
            <button onClick={onClose}>Close</button>
        </div>
    );
});

const defaultProps: GenericDetailsProps<Item> = {
    title: 'Test Title',
    items: [{ id: 1, name: 'Item 1' }],
    isLoading: false,
    FormComponent: MockForm,
    addNewText: 'Add New',
    createEmptyItem: (data) => ({ ...data }),
};

describe('GenericDetails', () => {
    test('renders with title and items', () => {
        render(<GenericDetails {...defaultProps} />);
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    test('toggles expansion on title click', () => {
        render(<GenericDetails {...defaultProps} />);
        const title = screen.getByText('Test Title');
        fireEvent.click(title);
        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });

    test('shows add form when clicking add button', () => {
        render(<GenericDetails {...defaultProps} />);
        const addButton = screen.getByText('Додати нові реквізити');
        fireEvent.click(addButton);
        expect(screen.getByTestId('mock-form-new')).toBeInTheDocument();
    });

    test('adds a new item on form submit', async () => {
        render(<GenericDetails {...defaultProps} items={[]} />);
        fireEvent.click(screen.getByText('Add New'));

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(screen.getByText('New Item')).toBeInTheDocument();
        });
    });

    test('shows not found state when no items', () => {
        render(<GenericDetails {...defaultProps} items={[]} notFoundText="No Items Found" />);
        expect(screen.getByText('No Items Found')).toBeInTheDocument();
        expect(screen.getByText('Add New')).toBeInTheDocument();
    });

    test('calls onChangeItems when items update', () => {
        const onChangeItems = jest.fn();
        render(<GenericDetails {...defaultProps} onChangeItems={onChangeItems} />);
        fireEvent.click(screen.getByText('Submit'));
        expect(onChangeItems).toHaveBeenCalled();
    });

    it('toggles items expanded state via keydown', () => {
        render(<GenericDetails {...defaultProps} />);
        const header = screen.getByText('Test Title');
        header.focus();
        expect(document.activeElement).toBe(header);
        fireEvent.keyDown(header, { key: 'Enter' });
        fireEvent.keyDown(header, { key: ' ' });
        expect(header.querySelector('.arrow')?.classList.contains('expanded')).toBe(true);
    });

    it('renders not found state with add button', () => {
        render(<GenericDetails {...defaultProps} items={[]} notFoundText="No Items Found" />);
        expect(screen.getByText('No Items Found')).toBeInTheDocument();
        expect(screen.getByText('Add New')).toBeInTheDocument();
    });

    it('submits new item and adds to list', async () => {
        render(<GenericDetails {...defaultProps} items={[]} />);
        const addButton = screen.getByText('Add New');
        fireEvent.click(addButton);

        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('New Item')).toBeInTheDocument();
        });
    });

    it('renders children function for each item', () => {
        render(<GenericDetails {...defaultProps} children={({ formState }) => <span>{formState.name}</span>} />);
        expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('renders primaryAddButton style', () => {
        render(<GenericDetails {...defaultProps} primaryAddButton />);
        expect(screen.getByText(DONATE_TEXT.BANK_DETAILS.ADD_NEW)).toHaveClass('btn-primary');
    });

    it('renders child form correctly', () => {
        render(<GenericDetails {...defaultProps} isChildForm />);
        expect(document.querySelector('.generic-details.child')).toBeInTheDocument();
        expect(screen.getByText(DONATE_TEXT.CORRESPONDENT_BANKS.ADD_NEW)).toBeInTheDocument();
    });
});
