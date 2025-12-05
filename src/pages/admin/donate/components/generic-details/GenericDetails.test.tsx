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

    test('adds a new item on form submit', async () => {
        const onLocalSubmit = jest.fn().mockResolvedValue(undefined);
        const items: Item[] = [];

        const { rerender } = render(
            <GenericDetails
                {...defaultProps}
                items={items}
                isParentCreating={true}
                isChildForm={true}
                onLocalSubmit={onLocalSubmit}
            />,
        );

        fireEvent.click(screen.getByText('Add New'));
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onLocalSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Item' }));
        });

        const newItem = { id: Date.now(), name: 'New Item' };
        rerender(
            <GenericDetails
                {...defaultProps}
                items={[newItem]}
                isParentCreating={true}
                isChildForm={true}
                onLocalSubmit={onLocalSubmit}
            />,
        );

        await waitFor(() => {
            expect(screen.getByText('New Item')).toBeInTheDocument();
        });
    });

    test('shows not found state when no items', () => {
        render(<GenericDetails {...defaultProps} items={[]} notFoundText="No Items Found" />);
        expect(screen.getByText('No Items Found')).toBeInTheDocument();
        expect(screen.getByText('Add New')).toBeInTheDocument();
    });

    test('calls onLocalUpdate when updating an item', async () => {
        const onLocalUpdate = jest.fn();
        render(<GenericDetails {...defaultProps} onLocalUpdate={onLocalUpdate} isParentCreating={true} />);

        const submitButtons = screen.getAllByText('Submit');
        fireEvent.click(submitButtons[0]);

        await waitFor(() => {
            expect(onLocalUpdate).toHaveBeenCalledWith(0, expect.any(Object));
        });
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

    it('removes item on delete', () => {
        const onLocalDelete = jest.fn();
        const { rerender } = render(
            <GenericDetails {...defaultProps} onLocalDelete={onLocalDelete} isParentCreating={true} />,
        );

        expect(screen.getByText('Item 1')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Delete'));

        expect(onLocalDelete).toHaveBeenCalled();

        rerender(<GenericDetails {...defaultProps} items={[]} onLocalDelete={onLocalDelete} isParentCreating={true} />);

        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
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

    it('adds item with generated ID when no onSubmit and not isChildForm', async () => {
        const onLocalSubmit = jest.fn().mockResolvedValue(undefined);

        render(
            <GenericDetails
                {...defaultProps}
                items={[]}
                isParentCreating={true}
                isChildForm={true}
                onLocalSubmit={onLocalSubmit}
            />,
        );

        fireEvent.click(screen.getByText('Add New'));
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onLocalSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'New Item',
                    id: expect.any(Number),
                }),
            );
        });
    });

    it('adds item without ID modification when isChildForm', async () => {
        const onLocalSubmit = jest.fn().mockResolvedValue(undefined);

        render(
            <GenericDetails
                {...defaultProps}
                items={[]}
                isChildForm
                isParentCreating={true}
                onLocalSubmit={onLocalSubmit}
            />,
        );

        fireEvent.click(screen.getByText('Add New'));
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onLocalSubmit).toHaveBeenCalled();
        });

        const submittedData = onLocalSubmit.mock.calls[0][0];
        expect(submittedData).toHaveProperty('name');
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

    it('handles item update without onUpdate callback', async () => {
        const onLocalUpdate = jest.fn().mockResolvedValue(undefined);
        const items = [{ id: 1, name: 'Item 1' }];

        render(
            <GenericDetails {...defaultProps} items={items} isParentCreating={true} onLocalUpdate={onLocalUpdate} />,
        );

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onLocalUpdate).toHaveBeenCalledWith(0, expect.objectContaining({ id: 1, name: 'Item 1' }));
        });
    });

    it('handles item delete without onDelete callback', async () => {
        const onLocalDelete = jest.fn().mockResolvedValue(undefined);
        const items = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
        ];

        render(
            <GenericDetails {...defaultProps} items={items} isParentCreating={true} onLocalDelete={onLocalDelete} />,
        );

        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(onLocalDelete).toHaveBeenCalledWith(0);
        });
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

    it('handles delete without id (falsy id case)', async () => {
        const onLocalDelete = jest.fn().mockResolvedValue(undefined);
        const items = [{ id: 0, name: 'Item Zero' }];

        render(
            <GenericDetails {...defaultProps} items={items} isParentCreating={true} onLocalDelete={onLocalDelete} />,
        );

        fireEvent.click(screen.getByText('Delete'));

        await waitFor(() => {
            expect(onLocalDelete).toHaveBeenCalledWith(0);
        });
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

    it('calls onLocalSubmit when parent is creating and isChildForm is true', async () => {
        const onLocalSubmit = jest.fn().mockResolvedValue(undefined);

        render(
            <GenericDetails
                {...defaultProps}
                items={[]}
                isParentCreating={true}
                isChildForm={true}
                onLocalSubmit={onLocalSubmit}
            />,
        );

        fireEvent.click(screen.getByText('Add New'));

        expect(screen.getByTestId('mock-form-new')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onLocalSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Item' }));
        });

        await waitFor(() => {
            expect(screen.queryByTestId('mock-form-new')).not.toBeInTheDocument();
        });
    });

    it('handles item update via onLocalUpdate when parent is creating', async () => {
        const onLocalUpdate = jest.fn().mockResolvedValue(undefined);
        const items = [{ id: 1, name: 'Item 1' }];

        render(
            <GenericDetails {...defaultProps} items={items} isParentCreating={true} onLocalUpdate={onLocalUpdate} />,
        );

        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(onLocalUpdate).toHaveBeenCalledWith(0, expect.objectContaining({ name: 'Item 1' }));
        });
    });

    it('handles item delete via onLocalDelete when parent is creating', async () => {
        const onLocalDelete = jest.fn().mockResolvedValue(undefined);
        const items = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
        ];

        render(
            <GenericDetails {...defaultProps} items={items} isParentCreating={true} onLocalDelete={onLocalDelete} />,
        );

        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(onLocalDelete).toHaveBeenCalledWith(0);
        });
    });
});
