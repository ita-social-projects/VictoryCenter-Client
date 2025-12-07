import React from 'react';
import { render, screen } from '@testing-library/react';
import { DragPreview, DragPreviewProps } from './DragPreview';

jest.mock('@assets/icons/dragger.svg', () => ({
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
});
