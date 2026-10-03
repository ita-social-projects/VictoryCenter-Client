import React from 'react';
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { DraggableListItem, DraggableListItemProps } from './DraggableListItem';

jest.mock('@/assets/icons/dragger.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="drag-icon" />,
}));

jest.mock('@/components/admin/drag-preview/DragPreview', () => ({
    DragPreview: ({ dragPreview, dragAltText }: any) => (
        <div data-testid="drag-preview" data-visible={dragPreview.visible}>
            Preview Alt: {dragAltText}
        </div>
    ),
}));

describe('DraggableListItem', () => {
    interface TestEntity {
        id: number;
        name: string;
    }

    const entities: TestEntity[] = [
        { id: 1, name: 'Entity 1' },
        { id: 2, name: 'Entity 2' },
        { id: 3, name: 'Entity 3' },
    ];

    const defaultProps: DraggableListItemProps<TestEntity> = {
        entity: entities[0],
        id: 1,
        ariaLabel: 'Drag Item',
        renderEntityComponent: (entity) => <span>{entity.name}</span>,
        entities,
        idSelector: (entity) => entity.id,
        onEntitiesReordered: jest.fn(),
    };

    const renderComponent = (props: Partial<DraggableListItemProps<TestEntity>> = {}) => {
        render(<DraggableListItem {...defaultProps} {...props} />);
    };

    const getDragger = () => screen.getByRole('button', { name: /drag item/i });

    const getItem = (): HTMLElement =>
        screen.getByText('Entity 1').closest('.draggable-item') as HTMLElement;

    const createDragDataTransfer = () => ({
        setData: jest.fn(),
        setDragImage: jest.fn(),
    });

    const startDrag = (
        dragger: HTMLElement,
        dataTransfer = createDragDataTransfer(),
        clientX = 50,
        clientY = 60,
    ) => {
        fireEvent.dragStart(dragger, {
            clientX,
            clientY,
            dataTransfer,
        });

        return dataTransfer;
    };

    const dropEntity = (item: HTMLElement, draggedId: string) => {
        const dataTransfer = {
            getData: jest.fn(() => draggedId),
        };

        fireEvent.drop(item, {
            dataTransfer,
            preventDefault: jest.fn(),
        });

        return dataTransfer;
    };

    const createDragOverEvent = (item: HTMLElement) => {
        const event = createEvent.dragOver(item);
        event.preventDefault = jest.fn();

        return event;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with provided entity', () => {
        renderComponent();

        expect(screen.getByText('Entity 1')).toBeInTheDocument();
        expect(screen.getByTestId('drag-icon')).toBeInTheDocument();
    });

    it('sets drag preview visible on drag start', () => {
        renderComponent();

        const dataTransfer = startDrag(getDragger());

        expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', '1');
        expect(screen.getByTestId('drag-preview')).toHaveAttribute('data-visible', 'true');
    });

    it('updates drag preview position on drag', () => {
        renderComponent();

        fireEvent.drag(getDragger(), {
            clientX: 120,
            clientY: 140,
        });

        expect(screen.getByTestId('drag-preview')).toBeInTheDocument();
    });

    it('hides drag preview on drag end', () => {
        renderComponent();

        fireEvent.dragEnd(getDragger());

        expect(screen.getByTestId('drag-preview')).toHaveAttribute('data-visible', 'false');
    });

    it('calls onEntitiesReordered with correct order on drop', () => {
        const onReorder = jest.fn();
        renderComponent({ onEntitiesReordered: onReorder });

        dropEntity(getItem(), '3');

        expect(onReorder).toHaveBeenCalledWith([
            { id: 3, name: 'Entity 3' },
            { id: 1, name: 'Entity 1' },
            { id: 2, name: 'Entity 2' },
        ]);
    });

    it('hides drag preview on drop', () => {
        const onReorder = jest.fn();
        renderComponent({ onEntitiesReordered: onReorder });

        startDrag(getDragger());

        expect(screen.getByTestId('drag-preview')).toHaveAttribute('data-visible', 'true');

        dropEntity(getItem(), '3');

        expect(screen.getByTestId('drag-preview')).toHaveAttribute('data-visible', 'false');
    });

    it('does not reorder if same id is dropped', () => {
        const onReorder = jest.fn();
        renderComponent({ onEntitiesReordered: onReorder });

        dropEntity(getItem(), '1');

        expect(onReorder).not.toHaveBeenCalled();
    });

    it('prevents default on dragOver', () => {
        renderComponent();

        const item = getItem();
        const dragOverEvent = createDragOverEvent(item);

        fireEvent(item, dragOverEvent);

        expect(dragOverEvent.preventDefault).toHaveBeenCalled();
    });

    it('calls setDragImage when dragging a valid entity', () => {
        renderComponent();

        const dataTransfer = startDrag(getDragger());

        expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', '1');
        expect(dataTransfer.setDragImage).toHaveBeenCalled();
    });

    it('does nothing if dragging entity not found', () => {
        renderComponent({ id: 999 });

        const dataTransfer = startDrag(getDragger(), createDragDataTransfer(), 10, 20);

        expect(dataTransfer.setData).not.toHaveBeenCalled();
        expect(dataTransfer.setDragImage).not.toHaveBeenCalled();
    });

    it('updates position only when clientX and clientY are non-zero', () => {
        renderComponent();

        const dragger = getDragger();
        startDrag(dragger);

        const dragEventTrue = createEvent.drag(dragger);
        Object.assign(dragEventTrue, {
            clientX: 120,
            clientY: 140,
        });
        fireEvent(dragger, dragEventTrue);

        const dragEventFalse = createEvent.drag(dragger);
        Object.assign(dragEventFalse, {
            clientX: 0,
            clientY: 140,
        });
        fireEvent(dragger, dragEventFalse);

        expect(screen.getByTestId('drag-preview')).toBeInTheDocument();
    });

    it('keeps dragger visible but disables dragging when reordering is disabled', () => {
        renderComponent({ reorderDisabled: true });

        expect(screen.getByTestId('drag-icon')).toBeInTheDocument();

        const dragger = getDragger();

        expect(dragger).toHaveAttribute('draggable', 'false');
        expect(dragger).toHaveAttribute('tabindex', '-1');
        expect(screen.getByText('Entity 1')).toBeInTheDocument();
    });

    it('does not render dragger when drag handle is hidden', () => {
        renderComponent({ hideDragHandle: true });

        expect(screen.queryByTestId('drag-icon')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /drag item/i })).not.toBeInTheDocument();
        expect(screen.getByText('Entity 1')).toBeInTheDocument();
    });

    it.each([
        ['reordering is disabled', { reorderDisabled: true }],
        ['drag handle is hidden', { hideDragHandle: true }],
    ])('does not reorder entities when %s', (_, props) => {
        const onReorder = jest.fn();
        renderComponent({
            ...props,
            onEntitiesReordered: onReorder,
        });

        const dataTransfer = dropEntity(getItem(), '3');

        expect(dataTransfer.getData).not.toHaveBeenCalled();
        expect(onReorder).not.toHaveBeenCalled();
    });

    it.each([
        ['reordering is disabled', { reorderDisabled: true }],
        ['drag handle is hidden', { hideDragHandle: true }],
    ])('does not prevent default on dragOver when %s', (_, props) => {
        renderComponent(props);

        const item = getItem();
        const dragOverEvent = createDragOverEvent(item);

        fireEvent(item, dragOverEvent);

        expect(dragOverEvent.preventDefault).not.toHaveBeenCalled();
    });
});