import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GenericDetails, GenericDetailsProps } from './GenericDetails';
import { GenericFormMode, GenericFormRef } from '../generic-form/GenericForm';
import { forwardRef, useImperativeHandle } from 'react';

interface Item {
    id: number;
    name: string;
}

const MockForm = forwardRef<GenericFormRef, any>(({ onSubmit, onClose, initialData, onDelete, itemIndex }, ref) => {
    useImperativeHandle(ref, () => ({
        submit: async () => {},
        isChanged: () => false,
        isValid: () => true,
        cancel: () => onClose(),
    }));

    const testId = initialData?.id ? `mock-form-${initialData.id}` : 'mock-form-new';

    return (
        <div data-testid={testId}>
            <p>{initialData?.name}</p>
            <button
                onClick={() => onSubmit({ id: initialData?.id || Date.now(), name: initialData?.name || 'New Item' })}
            >
                Submit
            </button>
            <button onClick={onClose}>Close</button>
            <button onClick={() => onDelete?.(initialData?.id ?? null, itemIndex)}>Delete</button>
        </div>
    );
});

const MockFormWithModeChange = forwardRef<GenericFormRef, any>((props, ref) => {
    const { onModeChange, initialData, onSubmit, onClose, onDelete, itemIndex } = props;

    const submit = async () => {};
    const isChanged = () => false;
    const isValid = () => true;

    useImperativeHandle(ref, () => ({
        submit,
        isChanged,
        isValid,
        cancel: () => onClose(),
    }));

    const handleEdit = () => onModeChange?.(GenericFormMode.Edit);
    const handleView = () => onModeChange?.(GenericFormMode.View);
    const handleCreate = () => onModeChange?.(GenericFormMode.Create);
    const handleSubmit = () => onSubmit({ ...initialData });
    const handleDelete = () => onDelete?.(initialData?.id ?? null, itemIndex);

    return (
        <div data-testid={`mock-form-${initialData?.id}`}>
            <p>{initialData?.name}</p>
            <button onClick={handleEdit}>Edit {initialData?.name}</button>
            <button onClick={handleView}>View {initialData?.name}</button>
            <button onClick={handleCreate}>Create</button>
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={onClose}>Close</button>
            <button onClick={handleDelete}>Delete</button>
        </div>
    );
});

const defaultProps: GenericDetailsProps<Item> = {
    title: 'Test Title',
    items: [{ id: 1, name: 'Item 1' }],
    isLoading: false,
    FormComponent: MockForm,
    addNewText: 'Add New',
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
        const addButton = screen.getByText('Add New');
        fireEvent.click(addButton);
        expect(screen.getByTestId('mock-form-new')).toBeInTheDocument();
    });

    test('shows not found state when no items', () => {
        render(<GenericDetails {...defaultProps} items={[]} notFoundText="No Items Found" />);
        expect(screen.getByText('No Items Found')).toBeInTheDocument();
        expect(screen.getByText('Add New')).toBeInTheDocument();
    });

    it('toggles items expanded state via keydown', () => {
        render(<GenericDetails {...defaultProps} />);
        const header = screen.getByText('Test Title');
        header.focus();
        expect(document.activeElement).toBe(header);
        fireEvent.keyDown(header, { key: 'Enter' });
        expect(header.querySelector('.arrow')?.classList.contains('expanded')).toBe(false);
    });

    it('renders children function for each item', () => {
        render(<GenericDetails {...defaultProps}>{({ formState }) => <span>{formState.name}</span>}</GenericDetails>);
        expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('renders primaryAddButton style', () => {
        render(<GenericDetails {...defaultProps} primaryAddButton items={[]} />);
        expect(screen.getByText('Add New')).toBeInTheDocument();
    });

    it('renders child form correctly', () => {
        render(<GenericDetails {...defaultProps} isChildForm />);
        expect(document.querySelector('.generic-details.child')).toBeInTheDocument();
        expect(screen.getByText('Add New')).toBeInTheDocument();
    });

    it('does not show not found state while loading', () => {
        render(<GenericDetails {...defaultProps} items={[]} isLoading notFoundText="No Items" />);
        expect(screen.queryByText('No Items')).not.toBeInTheDocument();
    });

    it('does not render children when collapsed', () => {
        render(<GenericDetails {...defaultProps} children={({ formState }) => <span>{formState.name}-child</span>} />);
        const header = screen.getByText('Test Title');
        fireEvent.click(header);
        expect(screen.queryByText('Item 1-child')).not.toBeInTheDocument();
    });

    it('closes add form on handleClose', () => {
        render(<GenericDetails {...defaultProps} items={[]} />);
        fireEvent.click(screen.getByText('Add New'));
        expect(screen.getByTestId('mock-form-new')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Close'));
        expect(screen.queryByTestId('mock-form-new')).not.toBeInTheDocument();
    });

    it('renders only button in not found state for child form', () => {
        render(<GenericDetails {...defaultProps} items={[]} isChildForm addNewText="Add Child" />);
        expect(screen.queryByText('No Items Found')).not.toBeInTheDocument();
        expect(screen.getByText('Add Child')).toBeInTheDocument();
    });

    it('calls onSubmit when available', async () => {
        const onSubmit = jest.fn().mockResolvedValue(undefined);
        render(<GenericDetails {...defaultProps} items={[]} onSubmit={onSubmit} />);

        fireEvent.click(screen.getByText('Add New'));
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalled();
        });
    });

    it('calls onUpdate when available', async () => {
        const onUpdate = jest.fn().mockResolvedValue(undefined);
        render(<GenericDetails {...defaultProps} onUpdate={onUpdate} />);

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onUpdate).toHaveBeenCalledWith(1, expect.any(Object));
        });
    });

    it('calls onDelete when available', async () => {
        const onDelete = jest.fn().mockResolvedValue(undefined);
        render(<GenericDetails {...defaultProps} onDelete={onDelete} />);

        fireEvent.click(screen.getByText('Delete'));

        await waitFor(() => {
            expect(onDelete).toHaveBeenCalledWith(1);
        });
    });
});

describe('GenericDetails - Additional Coverage', () => {
    it('toggles items expanded state via Space key', () => {
        render(<GenericDetails {...defaultProps} />);
        const header = screen.getByText('Test Title');

        expect(screen.getByText('Item 1')).toBeInTheDocument();

        fireEvent.keyDown(header, { key: ' ' });

        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });

    it('shows loader when loading with no items and no add form', () => {
        render(<GenericDetails {...defaultProps} items={[]} isLoading />);

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(document.querySelector('.generic-details-loader')).toBeInTheDocument();
    });

    it('does not show loader when loading but has items', () => {
        render(<GenericDetails {...defaultProps} isLoading />);

        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(document.querySelector('.generic-details-loader')).not.toBeInTheDocument();
    });

    it('does not show loader when add form is visible', () => {
        const { rerender } = render(<GenericDetails {...defaultProps} items={[]} isLoading={false} />);

        fireEvent.click(screen.getByText('Add New'));

        rerender(<GenericDetails {...defaultProps} items={[]} isLoading />);

        expect(document.querySelector('.generic-details-loader')).not.toBeInTheDocument();
        expect(screen.getByTestId('mock-form-new')).toBeInTheDocument();
    });

    it('shows disabled class on add button when form is visible', () => {
        render(<GenericDetails {...defaultProps} />);

        const addButton = screen.getByText('Add New');
        expect(addButton.parentElement).not.toHaveClass('disabled');

        fireEvent.click(addButton);

        const buttons = screen.getAllByText('Add New');
        const addButtonAfter = buttons.find((btn) => btn.parentElement?.classList.contains('btn-add-new'));

        expect(addButtonAfter?.parentElement).toHaveClass('disabled');
    });

    it('renders without title', () => {
        render(<GenericDetails {...defaultProps} title={undefined} />);

        expect(screen.queryByRole('button', { name: /Test Title/i })).not.toBeInTheDocument();
        expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('initializes with collapsed state when initialIsItemsExpanded is false', () => {
        render(<GenericDetails {...defaultProps} initialIsItemsExpanded={false} />);

        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();

        const header = screen.getByText('Test Title');
        fireEvent.click(header);

        expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('does not render children when children prop is undefined', () => {
        render(<GenericDetails {...defaultProps} children={undefined} />);

        expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('disables add button when any item is in edit mode', () => {
        render(
            <GenericDetails
                {...defaultProps}
                items={[
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                ]}
                FormComponent={MockFormWithModeChange}
            />,
        );

        let addButton = screen.getByText('Add New').closest('button');
        expect(addButton).not.toBeDisabled();

        const editItem2Button = screen.getByText('Edit Item 2');
        fireEvent.click(editItem2Button);

        addButton = screen.getByText('Add New').closest('button');
        expect(addButton).toBeDisabled();
        expect(addButton).toHaveClass('disabled');
    });

    it('does not clear editingItemId when different item mode changes', () => {
        render(
            <GenericDetails
                {...defaultProps}
                items={[
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                ]}
                FormComponent={MockFormWithModeChange}
            />,
        );

        const editItem1 = screen.getByText('Edit Item 1');
        fireEvent.click(editItem1);

        const addButton = screen.getByText('Add New').closest('button');
        expect(addButton).toBeDisabled();

        const createButtons = screen.getAllByText('Create');
        fireEvent.click(createButtons[1]);

        expect(screen.getByText('Add New').closest('button')).toBeDisabled();
    });

    it('calls onLocalSubmit when isParentCreating is true', async () => {
        const onLocalSubmit = jest.fn();
        render(<GenericDetails {...defaultProps} items={[]} isParentCreating={true} onLocalSubmit={onLocalSubmit} />);

        fireEvent.click(screen.getByText('Add New'));
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onLocalSubmit).toHaveBeenCalled();
        });
    });

    it('calls onLocalUpdate when isParentCreating is true', async () => {
        const onLocalUpdate = jest.fn();
        render(<GenericDetails {...defaultProps} isParentCreating={true} onLocalUpdate={onLocalUpdate} />);

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onLocalUpdate).toHaveBeenCalledWith(0, expect.any(Object));
        });
    });

    it('calls onLocalDelete when isParentCreating is true', async () => {
        const onLocalDelete = jest.fn();
        render(<GenericDetails {...defaultProps} isParentCreating={true} onLocalDelete={onLocalDelete} />);

        fireEvent.click(screen.getByText('Delete'));

        await waitFor(() => {
            expect(onLocalDelete).toHaveBeenCalledWith(0);
        });
    });

    it('add button after cancel in child edit mode', async () => {
        render(
            <GenericDetails
                {...defaultProps}
                items={[{ id: 1, name: 'Item 1' }]}
                isChildForm={true}
                FormComponent={MockFormWithModeChange}
            />,
        );
        fireEvent.click(screen.getByText('Edit Item 1'));
        expect(screen.getByText('Add New').closest('button')).toBeDisabled();
        fireEvent.click(screen.getByText('View Item 1'));
        expect(screen.getByText('Add New').closest('button')).not.toBeDisabled();
    });
});
