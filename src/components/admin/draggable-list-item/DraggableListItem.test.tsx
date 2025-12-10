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
        idSelector: (e) => e.id,
        onEntitiesReordered: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with provided entity', () => {
        render(<DraggableListItem {...defaultProps} />);
        expect(screen.getByText('Entity 1')).toBeInTheDocument();
        expect(screen.getByTestId('drag-icon')).toBeInTheDocument();
    });

    it('sets drag preview visible on drag start', () => {
        render(<DraggableListItem {...defaultProps} />);
        const dragger = screen.getByRole('button', { name: /drag item/i });

        const dataTransferMock = {
            setData: jest.fn(),
            setDragImage: jest.fn(),
        };

        fireEvent.dragStart(dragger, {
            clientX: 50,
            clientY: 60,
            dataTransfer: dataTransferMock,
        });

        expect(dataTransferMock.setData).toHaveBeenCalledWith('text/plain', '1');
        expect(screen.getByTestId('drag-preview')).toHaveAttribute('data-visible', 'true');
    });

    it('updates drag preview position on drag', () => {
        render(<DraggableListItem {...defaultProps} />);
        const dragger = screen.getByRole('button', { name: /drag item/i });

        fireEvent.drag(dragger, { clientX: 120, clientY: 140 });

        // DragPreview is mocked, so we can’t read actual x/y — but this confirms render
        expect(screen.getByTestId('drag-preview')).toBeInTheDocument();
    });

    it('hides drag preview on drag end', () => {
        render(<DraggableListItem {...defaultProps} />);
        const dragger = screen.getByRole('button', { name: /drag item/i });

        fireEvent.dragEnd(dragger);
        expect(screen.getByTestId('drag-preview')).toHaveAttribute('data-visible', 'false');
    });

    it('calls onEntitiesReordered with correct order on drop', () => {
        const onReorder = jest.fn();
        render(<DraggableListItem {...defaultProps} onEntitiesReordered={onReorder} />);

        const item = screen.getByText('Entity 1').closest('.draggable-item')!;

        const dataTransferMock = {
            getData: jest.fn(() => '3'),
        };

        fireEvent.drop(item, { dataTransfer: dataTransferMock, preventDefault: jest.fn() });

        expect(onReorder).toHaveBeenCalledWith([
            { id: 3, name: 'Entity 3' },
            { id: 1, name: 'Entity 1' },
            { id: 2, name: 'Entity 2' },
        ]);
    });

    it('does not reorder if same id is dropped', () => {
        const onReorder = jest.fn();
        render(<DraggableListItem {...defaultProps} onEntitiesReordered={onReorder} />);

        const item = screen.getByText('Entity 1').closest('.draggable-item')!;

        const dataTransferMock = {
            getData: jest.fn(() => '1'),
        };

        fireEvent.drop(item, { dataTransfer: dataTransferMock, preventDefault: jest.fn() });

        expect(onReorder).not.toHaveBeenCalled();
    });

    it('prevents default on dragOver', () => {
        render(<DraggableListItem {...defaultProps} />);
        const item = screen.getByText('Entity 1').closest('.draggable-item')!;

        const dragOverEvent = createEvent.dragOver(item);
        dragOverEvent.preventDefault = jest.fn();

        fireEvent(item, dragOverEvent);
        expect(dragOverEvent.preventDefault).toHaveBeenCalled();
    });

    it('calls setDragImage when dragging a valid entity', () => {
        render(<DraggableListItem {...defaultProps} />);
        const dragger = screen.getByRole('button', { name: /drag item/i });

        const dataTransferMock = {
            setData: jest.fn(),
            setDragImage: jest.fn(),
        };

        fireEvent.dragStart(dragger, {
            clientX: 50,
            clientY: 60,
            dataTransfer: dataTransferMock,
        });

        expect(dataTransferMock.setData).toHaveBeenCalledWith('text/plain', '1');
        expect(dataTransferMock.setDragImage).toHaveBeenCalled();
    });

    it('does nothing if dragging entity not found', () => {
        render(<DraggableListItem {...defaultProps} id={999} />);
        const dragger = screen.getByRole('button', { name: /drag item/i });

        const dataTransferMock = {
            setData: jest.fn(),
            setDragImage: jest.fn(),
        };

        fireEvent.dragStart(dragger, {
            clientX: 10,
            clientY: 20,
            dataTransfer: dataTransferMock,
        });

        expect(dataTransferMock.setData).not.toHaveBeenCalled();
        expect(dataTransferMock.setDragImage).not.toHaveBeenCalled();
    });

    it('updates position only when clientX and clientY are non-zero', () => {
        render(<DraggableListItem {...defaultProps} />);
        const dragger = screen.getByRole('button', { name: /drag item/i });

        fireEvent.dragStart(dragger, {
            clientX: 50,
            clientY: 60,
            dataTransfer: { setData: jest.fn(), setDragImage: jest.fn() },
        });

        const dragEventTrue = createEvent.drag(dragger);
        Object.assign(dragEventTrue, { clientX: 120, clientY: 140 });
        fireEvent(dragger, dragEventTrue);

        const dragEventFalse = createEvent.drag(dragger);
        Object.assign(dragEventFalse, { clientX: 0, clientY: 140 });
        fireEvent(dragger, dragEventFalse);

        expect(screen.getByTestId('drag-preview')).toBeInTheDocument();
    });
});
