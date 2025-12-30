import { render, screen, fireEvent } from '@testing-library/react';
import { ImagesBottomSection, ImagesBottomSectionProps } from './ImagesBottomSection';

const baseConfig = {
    imageCount: 2,
    gridColumns: 2,
    imageConfig: {
        cropWidth: 100,
        cropHeight: 100,
        minWidth: 50,
        minHeight: 50,
    },
    elevatedIndices: [1],
    imageLabel: 'Test Image',
};

describe('ImagesBottomSection', () => {
    const defaultProps: ImagesBottomSectionProps = {
        variant: 'dual',
        title: 'Section Title',
        description: 'Section Description',
        images: ['img1.jpg', 'img2.jpg'],
        imageHandlers: [
            { key: '1', value: '', handler: jest.fn() },
            { key: '2', value: '', handler: jest.fn() },
        ],
        config: baseConfig,
        isTemplate: false,
        isEditable: false,
        onTitleChange: jest.fn(),
        onDescriptionChange: jest.fn(),
        className: '',
    };

    it('renders title and description', () => {
        render(<ImagesBottomSection {...defaultProps} />);
        expect(screen.getByText('Section Title')).toBeInTheDocument();
        expect(screen.getByText('Section Description')).toBeInTheDocument();
    });

    it('renders images in view mode', () => {
        render(<ImagesBottomSection {...defaultProps} />);
        // Use role 'presentation' because <img alt=""> is role=presentation
        const images = screen.getAllByRole('presentation');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveAttribute('src', 'img1.jpg');
        expect(images[1]).toHaveAttribute('src', 'img2.jpg');
    });

    it('renders PhotoInputGroup in editable mode', () => {
        render(<ImagesBottomSection {...defaultProps} isEditable={true} />);
        // The label is rendered as visible text, not as a label element
        expect(screen.getAllByText('Test Image')).toHaveLength(2);
    });

    it('calls onTitleChange when editable and title changes', () => {
        render(<ImagesBottomSection {...defaultProps} isEditable={true} />);
        const input = screen.getByDisplayValue('Section Title');
        fireEvent.change(input, { target: { value: 'New Title' } });
        expect(defaultProps.onTitleChange).toHaveBeenCalled();
    });

    it('applies elevated data attribute', () => {
        render(<ImagesBottomSection {...defaultProps} />);
        const wrappers = screen.getAllByTestId(/image-wrapper/);
        expect(wrappers[1].getAttribute('data-elevated')).toBe('true');
        expect(wrappers[0].getAttribute('data-elevated')).toBeNull();
    });
});
