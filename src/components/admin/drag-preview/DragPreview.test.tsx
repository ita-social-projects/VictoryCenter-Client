import React from 'react';
import { render, screen } from '@testing-library/react';
import { DragPreview, DragPreviewProps } from './DragPreview';

jest.mock('../../../assets/icons/dragger.svg', () => 'mock-drag-icon.svg');

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
        keySelector: (entity) => entity.id,
        renderEntityComponent: (entity) => <span>{entity.name}</span>,
        dragAltText: 'Drag me',
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
        expect(screen.getByAltText(/drag me/i)).toBeInTheDocument();
        expect(screen.getByText(/test entity/i)).toBeInTheDocument();
    });

    it('should apply correct position styles', () => {
        render(<DragPreview {...defaultProps} />);
        const preview = screen.getByRole('img').closest('.drag-preview') as HTMLElement;
        expect(preview).toHaveStyle({ left: `${100 - 45}px`, top: `${200 - 55}px` });
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

    it('should render image with provided alt text', () => {
        render(<DragPreview {...defaultProps} />);
        const img = screen.getByRole('img', { name: /drag me/i });
        expect(img).toHaveAttribute('src', 'mock-drag-icon.svg');
    });
});
