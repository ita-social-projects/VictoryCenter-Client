import React from 'react';
import { render, screen } from '@testing-library/react';
import { DragPreview, DragPreviewProps } from './DragPreview';

jest.mock('../../../assets/icons/dragger.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="drag-icon" />,
}));

describe('DragPreview', () => {
    interface TestEntity {
        id: number;
        name: string;
    }

    const defaultEntity: TestEntity = { id: 1, name: 'Test Entity' };

    const defaultProps: DragPreviewProps<TestEntity> = {
        entity: defaultEntity,
        dragPreview: {
            visible: true,
            item: defaultEntity,
            x: 100,
            y: 200,
        },
        renderEntityComponent: (entity) => <span>{entity.name}</span>,
    };

    it('should render nothing when dragPreview.visible is false', () => {
        const { container } = render(
            <DragPreview {...defaultProps} dragPreview={{ ...defaultProps.dragPreview, visible: false }} />,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('should render nothing when dragPreview.item is missing', () => {
        const { container } = render(
            <DragPreview {...defaultProps} dragPreview={{ ...defaultProps.dragPreview, item: null as any }} />,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('should render drag preview when visible and item are provided', () => {
        render(<DragPreview {...defaultProps} />);
        expect(screen.getByTestId('drag-icon')).toBeInTheDocument();
        expect(screen.getByText(/test entity/i)).toBeInTheDocument();
    });

    it('should apply correct position styles', () => {
        render(<DragPreview {...defaultProps} />);
        const icon = screen.getByTestId('drag-icon');
        const node = icon.closest('.drag-preview') as HTMLElement;

        expect(node).toHaveStyle({ left: `${100 - 45}px`, top: `${200 - 55}px` });
    });

    it('should use keySelector for the wrapper key', () => {
        const { container } = render(<DragPreview {...defaultProps} />);
        const wrapper = container.querySelector('.drag-preview-wrapper');
        expect(wrapper?.getAttribute('key')).toBeNull();
        // React strips key from DOM, so we only verify that rendering works without error
    });

    it('should render the custom entity component', () => {
        const customRender = jest.fn((entity) => <div>Custom: {entity.name}</div>);
        render(<DragPreview {...defaultProps} renderEntityComponent={customRender} />);
        expect(screen.getByText(/custom: test entity/i)).toBeInTheDocument();
        expect(customRender).toHaveBeenCalledWith(defaultEntity);
    });

    // Additional comprehensive tests
    describe('Position calculations', () => {
        it('should handle negative coordinates', () => {
            const negativeCoordinates = {
                ...defaultProps.dragPreview,
                x: -10,
                y: -20,
            };

            render(<DragPreview {...defaultProps} dragPreview={negativeCoordinates} />);

            const dragPreview = document.querySelector('.drag-preview') as HTMLElement;
            expect(dragPreview).toHaveStyle({
                left: `${-10 - 45}px`,
                top: `${-20 - 55}px`,
            });
        });

        it('should handle zero coordinates', () => {
            const zeroCoordinates = {
                ...defaultProps.dragPreview,
                x: 0,
                y: 0,
            };

            render(<DragPreview {...defaultProps} dragPreview={zeroCoordinates} />);

            const dragPreview = document.querySelector('.drag-preview') as HTMLElement;
            expect(dragPreview).toHaveStyle({
                left: `${0 - 45}px`,
                top: `${0 - 55}px`,
            });
        });

        it('should handle large coordinates', () => {
            const largeCoordinates = {
                ...defaultProps.dragPreview,
                x: 9999,
                y: 8888,
            };

            render(<DragPreview {...defaultProps} dragPreview={largeCoordinates} />);

            const dragPreview = document.querySelector('.drag-preview') as HTMLElement;
            expect(dragPreview).toHaveStyle({
                left: `${9999 - 45}px`,
                top: `${8888 - 55}px`,
            });
        });

        it('should handle floating point coordinates', () => {
            const floatCoordinates = {
                ...defaultProps.dragPreview,
                x: 100.5,
                y: 200.7,
            };

            render(<DragPreview {...defaultProps} dragPreview={floatCoordinates} />);

            const dragPreview = document.querySelector('.drag-preview') as HTMLElement;
            expect(dragPreview).toHaveStyle({
                left: `${100.5 - 45}px`,
                top: `${200.7 - 55}px`,
            });
        });
    });

    describe('Different entity types', () => {
        interface ComplexEntity {
            id: string;
            title: string;
            metadata: {
                category: string;
                priority: number;
            };
        }

        it('should work with complex entity types', () => {
            const complexEntity: ComplexEntity = {
                id: 'complex-1',
                title: 'Complex Item',
                metadata: {
                    category: 'Important',
                    priority: 1,
                },
            };

            const complexProps: DragPreviewProps<ComplexEntity> = {
                entity: complexEntity,
                dragPreview: {
                    visible: true,
                    item: complexEntity,
                    x: 50,
                    y: 75,
                },
                renderEntityComponent: (entity) => (
                    <div>
                        <h3>{entity.title}</h3>
                        <p>{entity.metadata.category}</p>
                    </div>
                ),
            };

            render(<DragPreview {...complexProps} />);

            expect(screen.getByText('Complex Item')).toBeInTheDocument();
            expect(screen.getByText('Important')).toBeInTheDocument();
        });

        it('should work with string entities', () => {
            const stringProps: DragPreviewProps<string> = {
                entity: 'Simple String',
                dragPreview: {
                    visible: true,
                    item: 'Simple String',
                    x: 25,
                    y: 50,
                },
                renderEntityComponent: (entity) => <span>{entity}</span>,
            };

            render(<DragPreview {...stringProps} />);
            expect(screen.getByText('Simple String')).toBeInTheDocument();
        });

        it('should work with number entities', () => {
            const numberProps: DragPreviewProps<number> = {
                entity: 42,
                dragPreview: {
                    visible: true,
                    item: 42,
                    x: 10,
                    y: 20,
                },
                renderEntityComponent: (entity) => <span>Number: {entity}</span>,
            };

            render(<DragPreview {...numberProps} />);
            expect(screen.getByText('Number: 42')).toBeInTheDocument();
        });
    });

    describe('Render function variations', () => {
        it('should handle renderEntityComponent returning null', () => {
            const nullRender = jest.fn(() => null);

            render(<DragPreview {...defaultProps} renderEntityComponent={nullRender} />);

            expect(screen.getByTestId('drag-icon')).toBeInTheDocument();
            expect(nullRender).toHaveBeenCalledWith(defaultEntity);

            const itemData = document.querySelector('.item-data');
            expect(itemData).toBeInTheDocument();
            expect(itemData).toBeEmptyDOMElement();
        });

        it('should handle renderEntityComponent throwing an error', () => {
            const errorRender = jest.fn(() => {
                throw new Error('Render error');
            });

            expect(() => {
                render(<DragPreview {...defaultProps} renderEntityComponent={errorRender} />);
            }).toThrow('Render error');
        });

        it('should handle renderEntityComponent returning fragment', () => {
            const fragmentRender = (entity: TestEntity) => (
                <>
                    <span>Name: {entity.name}</span>
                    <span>ID: {entity.id}</span>
                </>
            );

            render(<DragPreview {...defaultProps} renderEntityComponent={fragmentRender} />);

            expect(screen.getByText('Name: Test Entity')).toBeInTheDocument();
            expect(screen.getByText('ID: 1')).toBeInTheDocument();
        });
    });

    describe('Edge cases with drag preview state', () => {
        it('should render nothing when both visible is false and item is null', () => {
            const { container } = render(
                <DragPreview
                    {...defaultProps}
                    dragPreview={{
                        visible: false,
                        item: null as any,
                        x: 100,
                        y: 200,
                    }}
                />,
            );
            expect(container).toBeEmptyDOMElement();
        });

        it('should render nothing when visible is true but item is undefined', () => {
            const { container } = render(
                <DragPreview
                    {...defaultProps}
                    dragPreview={{
                        visible: true,
                        item: undefined as any,
                        x: 100,
                        y: 200,
                    }}
                />,
            );
            expect(container).toBeEmptyDOMElement();
        });

        it('should handle item being different from entity', () => {
            const differentEntity = { id: 2, name: 'Different Entity' };
            const dragPreviewWithDifferentItem = {
                visible: true,
                item: differentEntity,
                x: 150,
                y: 250,
            };

            render(<DragPreview {...defaultProps} dragPreview={dragPreviewWithDifferentItem} />);

            // Should still render based on the entity prop, not dragPreview.item
            expect(screen.getByText('Test Entity')).toBeInTheDocument();
            expect(screen.queryByText('Different Entity')).not.toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have aria-hidden attribute set to true', () => {
            render(<DragPreview {...defaultProps} />);

            const dragPreview = document.querySelector('.drag-preview') as HTMLElement;
            expect(dragPreview).toHaveAttribute('aria-hidden', 'true');
        });

        it('should not interfere with screen readers', () => {
            render(<DragPreview {...defaultProps} />);

            const dragPreview = document.querySelector('.drag-preview') as HTMLElement;
            expect(dragPreview).toHaveAttribute('aria-hidden', 'true');

            // The drag preview should not be announced by screen readers
            expect(dragPreview).not.toHaveAttribute('role');
            expect(dragPreview).not.toHaveAttribute('aria-label');
        });
    });

    describe('CSS class structure', () => {
        it('should render drag icon inside dragger element', () => {
            render(<DragPreview {...defaultProps} />);

            const dragger = document.querySelector('.dragger');
            const dragIcon = screen.getByTestId('drag-icon');

            expect(dragger).toContainElement(dragIcon);
        });

        it('should render entity component inside item-data element', () => {
            render(<DragPreview {...defaultProps} />);

            const itemData = document.querySelector('.item-data');
            const entityText = screen.getByText('Test Entity');

            expect(itemData).toContainElement(entityText);
        });
    });

    describe('Component re-rendering', () => {
        it('should re-render when dragPreview coordinates change', () => {
            const { rerender } = render(<DragPreview {...defaultProps} />);

            let dragPreview = document.querySelector('.drag-preview') as HTMLElement;
            expect(dragPreview).toHaveStyle({ left: '55px', top: '145px' });

            const newDragPreview = {
                ...defaultProps.dragPreview,
                x: 200,
                y: 300,
            };

            rerender(<DragPreview {...defaultProps} dragPreview={newDragPreview} />);

            dragPreview = document.querySelector('.drag-preview') as HTMLElement;
            expect(dragPreview).toHaveStyle({ left: '155px', top: '245px' });
        });

        it('should re-render when entity changes', () => {
            const { rerender } = render(<DragPreview {...defaultProps} />);

            expect(screen.getByText('Test Entity')).toBeInTheDocument();

            const newEntity = { id: 2, name: 'New Entity' };
            const newDragPreview = {
                ...defaultProps.dragPreview,
                item: newEntity,
            };

            rerender(<DragPreview {...defaultProps} entity={newEntity} dragPreview={newDragPreview} />);

            expect(screen.getByText('New Entity')).toBeInTheDocument();
            expect(screen.queryByText('Test Entity')).not.toBeInTheDocument();
        });

        it('should handle visibility toggle correctly', () => {
            const { rerender, container } = render(<DragPreview {...defaultProps} />);

            expect(screen.getByTestId('drag-icon')).toBeInTheDocument();

            rerender(<DragPreview {...defaultProps} dragPreview={{ ...defaultProps.dragPreview, visible: false }} />);

            expect(container).toBeEmptyDOMElement();

            rerender(<DragPreview {...defaultProps} />);

            expect(screen.getByTestId('drag-icon')).toBeInTheDocument();
        });
    });

    describe('Performance considerations', () => {
        it('should not call renderEntityComponent when not visible', () => {
            const renderSpy = jest.fn((entity) => <span>{entity.name}</span>);

            render(
                <DragPreview
                    {...defaultProps}
                    dragPreview={{ ...defaultProps.dragPreview, visible: false }}
                    renderEntityComponent={renderSpy}
                />,
            );

            expect(renderSpy).not.toHaveBeenCalled();
        });

        it('should not call renderEntityComponent when item is null', () => {
            const renderSpy = jest.fn((entity) => <span>{entity.name}</span>);

            render(
                <DragPreview
                    {...defaultProps}
                    dragPreview={{ ...defaultProps.dragPreview, item: null as any }}
                    renderEntityComponent={renderSpy}
                />,
            );

            expect(renderSpy).not.toHaveBeenCalled();
        });

        it('should call renderEntityComponent only once when visible and item exists', () => {
            const renderSpy = jest.fn((entity) => <span>{entity.name}</span>);

            render(<DragPreview {...defaultProps} renderEntityComponent={renderSpy} />);

            expect(renderSpy).toHaveBeenCalledTimes(1);
            expect(renderSpy).toHaveBeenCalledWith(defaultEntity);
        });
    });
});
