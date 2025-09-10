import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GenericDetails, GenericDetailsProps } from './GenericDetails';
import { GenericFormRef } from '../generic-form/GenericForm';
import { forwardRef, useImperativeHandle } from 'react';

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

    test('removes item on close', () => {
        render(<GenericDetails {...defaultProps} />);
        fireEvent.click(screen.getByText('Close'));
        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });

    test('shows not found state when no items', () => {
        render(<GenericDetails {...defaultProps} items={[]} notFoundText="No Items Found" />);
        expect(screen.getByText('No Items Found')).toBeInTheDocument();
        expect(screen.getByText('Add New')).toBeInTheDocument();
    });

    test('calls onChangeItems when items update', () => {
        const onChangeItems = jest.fn();
        render(<GenericDetails {...defaultProps} onChangeItems={onChangeItems} />);
        fireEvent.click(screen.getByText('Close'));
        expect(onChangeItems).toHaveBeenCalled();
    });
});
