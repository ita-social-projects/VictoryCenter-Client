import { render, screen } from '@testing-library/react';
import { QuadImagesBottom } from './QuadImagesBottom';
import { ImageValues } from '@/types/common/image';

jest.mock('../shared/title-description-section/TitleDescriptionSection', () => ({
    TitleDescriptionSection: ({
        title,
        description,
        isEditable,
        isTemplate,
        onTitleChange,
        onDescriptionChange,
    }: any) => (
        <div data-testid="title-description-section">
            <div data-testid="title">{title}</div>
            <div data-testid="description">{description}</div>
            <div data-testid="is-editable">{String(isEditable)}</div>
            <div data-testid="is-template">{String(isTemplate)}</div>
            {onTitleChange && (
                <button data-testid="title-change" onClick={() => onTitleChange('new title')}>
                    Change Title
                </button>
            )}
            {onDescriptionChange && (
                <button data-testid="description-change" onClick={() => onDescriptionChange('new description')}>
                    Change Description
                </button>
            )}
        </div>
    ),
}));

jest.mock('@/components/admin/input-groups/photo-input-group/PhotoInputGroup', () => ({
    PhotoInputGroup: ({ id, value, onChange }: any) => (
        <div data-testid={`photo-input-group-${id}`}>
            <div data-testid={`photo-id-${id}`}>{id}</div>
            <div data-testid={`photo-value-${id}`}>{value?.url || 'no-image'}</div>
            <button
                data-testid={`photo-change-${id}`}
                onClick={() => onChange({ id: '123', url: `new-${id}.jpg`, mimeType: 'image/jpeg' })}
            >
                Change Photo
            </button>
        </div>
    ),
}));

describe('QuadImagesBottom', () => {
    describe('Non-editable mode', () => {
        it('renders with title and description', () => {
            render(<QuadImagesBottom title="Test Title" description="Test Description" />);

            expect(screen.getByTestId('title')).toHaveTextContent('Test Title');
            expect(screen.getByTestId('description')).toHaveTextContent('Test Description');
        });

        it('renders all four images when provided', () => {
            const { container } = render(
                <QuadImagesBottom
                    title="Test"
                    image1="image1.jpg"
                    image2="image2.jpg"
                    image3="image3.jpg"
                    image4="image4.jpg"
                />,
            );

            const images = container.querySelectorAll('img');
            expect(images).toHaveLength(4);
            expect(images[0]).toHaveAttribute('src', 'image1.jpg');
            expect(images[1]).toHaveAttribute('src', 'image2.jpg');
            expect(images[2]).toHaveAttribute('src', 'image3.jpg');
            expect(images[3]).toHaveAttribute('src', 'image4.jpg');
        });

        it('renders empty images when no images provided', () => {
            const { container } = render(<QuadImagesBottom title="Test" />);

            const images = container.querySelectorAll('img');
            expect(images).toHaveLength(4);
            images.forEach((img) => {
                expect(img.getAttribute('src')).toBeFalsy();
            });
        });

        it('applies template class when isTemplate is true', () => {
            const { container } = render(<QuadImagesBottom title="Test" isTemplate={true} />);

            expect(container.firstChild).toHaveClass('template');
        });

        it('passes isTemplate prop to TitleDescriptionSection', () => {
            render(<QuadImagesBottom title="Test" isTemplate={true} />);

            expect(screen.getByTestId('is-template')).toHaveTextContent('true');
        });

        it('renders with default empty values', () => {
            render(<QuadImagesBottom />);

            expect(screen.getByTestId('title')).toHaveTextContent('');
            expect(screen.getByTestId('description')).toHaveTextContent('');
        });

        it('does not render PhotoInputGroup in non-editable mode', () => {
            render(<QuadImagesBottom title="Test" />);

            expect(screen.queryByTestId('photo-input-group-section-image-1')).not.toBeInTheDocument();
            expect(screen.queryByTestId('photo-input-group-section-image-2')).not.toBeInTheDocument();
            expect(screen.queryByTestId('photo-input-group-section-image-3')).not.toBeInTheDocument();
            expect(screen.queryByTestId('photo-input-group-section-image-4')).not.toBeInTheDocument();
        });

        it('applies elevated class to correct images (index % 2 === 1)', () => {
            const { container } = render(
                <QuadImagesBottom
                    title="Test"
                    image1="img1.jpg"
                    image2="img2.jpg"
                    image3="img3.jpg"
                    image4="img4.jpg"
                />,
            );

            const imageWrappers = container.querySelectorAll('.image-wrapper');
            expect(imageWrappers).toHaveLength(4);
            expect(imageWrappers[0]).not.toHaveClass('elevated');
            expect(imageWrappers[1]).toHaveClass('elevated');
            expect(imageWrappers[2]).not.toHaveClass('elevated');
            expect(imageWrappers[3]).toHaveClass('elevated');
        });
    });

    describe('Editable mode', () => {
        it('renders all four PhotoInputGroups when isEditable is true', () => {
            render(<QuadImagesBottom title="Test" isEditable={true} />);

            expect(screen.getByTestId('photo-input-group-section-image-1')).toBeInTheDocument();
            expect(screen.getByTestId('photo-input-group-section-image-2')).toBeInTheDocument();
            expect(screen.getByTestId('photo-input-group-section-image-3')).toBeInTheDocument();
            expect(screen.getByTestId('photo-input-group-section-image-4')).toBeInTheDocument();
        });

        it('applies editable class when isEditable is true', () => {
            const { container } = render(<QuadImagesBottom title="Test" isEditable={true} />);

            expect(container.firstChild).toHaveClass('editable');
        });

        it('passes isEditable prop to TitleDescriptionSection', () => {
            render(<QuadImagesBottom title="Test" isEditable={true} />);

            expect(screen.getByTestId('is-editable')).toHaveTextContent('true');
        });

        it('calls onTitleChange when title is changed', () => {
            const onTitleChange = jest.fn();
            render(<QuadImagesBottom title="Test" isEditable={true} onTitleChange={onTitleChange} />);

            screen.getByTestId('title-change').click();
            expect(onTitleChange).toHaveBeenCalledWith('new title');
        });

        it('calls onDescriptionChange when description is changed', () => {
            const onDescriptionChange = jest.fn();
            render(<QuadImagesBottom title="Test" isEditable={true} onDescriptionChange={onDescriptionChange} />);

            screen.getByTestId('description-change').click();
            expect(onDescriptionChange).toHaveBeenCalledWith('new description');
        });

        it('calls onImage1Change when first image is changed', () => {
            const onImage1Change = jest.fn();
            render(<QuadImagesBottom title="Test" isEditable={true} onImage1Change={onImage1Change} />);

            screen.getByTestId('photo-change-section-image-1').click();
            expect(onImage1Change).toHaveBeenCalledWith({
                id: '123',
                url: 'new-section-image-1.jpg',
                mimeType: 'image/jpeg',
            });
        });

        it('calls onImage2Change when second image is changed', () => {
            const onImage2Change = jest.fn();
            render(<QuadImagesBottom title="Test" isEditable={true} onImage2Change={onImage2Change} />);

            screen.getByTestId('photo-change-section-image-2').click();
            expect(onImage2Change).toHaveBeenCalledWith({
                id: '123',
                url: 'new-section-image-2.jpg',
                mimeType: 'image/jpeg',
            });
        });

        it('calls onImage3Change when third image is changed', () => {
            const onImage3Change = jest.fn();
            render(<QuadImagesBottom title="Test" isEditable={true} onImage3Change={onImage3Change} />);

            screen.getByTestId('photo-change-section-image-3').click();
            expect(onImage3Change).toHaveBeenCalledWith({
                id: '123',
                url: 'new-section-image-3.jpg',
                mimeType: 'image/jpeg',
            });
        });

        it('calls onImage4Change when fourth image is changed', () => {
            const onImage4Change = jest.fn();
            render(<QuadImagesBottom title="Test" isEditable={true} onImage4Change={onImage4Change} />);

            screen.getByTestId('photo-change-section-image-4').click();
            expect(onImage4Change).toHaveBeenCalledWith({
                id: '123',
                url: 'new-section-image-4.jpg',
                mimeType: 'image/jpeg',
            });
        });

        it('passes image values to PhotoInputGroups', () => {
            render(
                <QuadImagesBottom
                    title="Test"
                    isEditable={true}
                    image1="existing1.jpg"
                    image2="existing2.jpg"
                    image3="existing3.jpg"
                    image4="existing4.jpg"
                />,
            );

            expect(screen.getByTestId('photo-value-section-image-1')).toHaveTextContent('existing1.jpg');
            expect(screen.getByTestId('photo-value-section-image-2')).toHaveTextContent('existing2.jpg');
            expect(screen.getByTestId('photo-value-section-image-3')).toHaveTextContent('existing3.jpg');
            expect(screen.getByTestId('photo-value-section-image-4')).toHaveTextContent('existing4.jpg');
        });

        it('passes null to PhotoInputGroups when no images', () => {
            render(<QuadImagesBottom title="Test" isEditable={true} />);

            expect(screen.getByTestId('photo-value-section-image-1')).toHaveTextContent('no-image');
            expect(screen.getByTestId('photo-value-section-image-2')).toHaveTextContent('no-image');
            expect(screen.getByTestId('photo-value-section-image-3')).toHaveTextContent('no-image');
            expect(screen.getByTestId('photo-value-section-image-4')).toHaveTextContent('no-image');
        });

        it('does not render regular img tags in editable mode', () => {
            const { container } = render(
                <QuadImagesBottom
                    title="Test"
                    isEditable={true}
                    image1="test1.jpg"
                    image2="test2.jpg"
                    image3="test3.jpg"
                    image4="test4.jpg"
                />,
            );

            expect(container.querySelectorAll('img')).toHaveLength(0);
        });

        it('handles missing callback props gracefully', () => {
            render(<QuadImagesBottom title="Test" isEditable={true} />);

            expect(screen.getByTestId('photo-input-group-section-image-1')).toBeInTheDocument();
            expect(screen.getByTestId('photo-input-group-section-image-2')).toBeInTheDocument();
            expect(screen.getByTestId('photo-input-group-section-image-3')).toBeInTheDocument();
            expect(screen.getByTestId('photo-input-group-section-image-4')).toBeInTheDocument();
        });

        it('applies elevated class to correct PhotoInputGroups (index % 2 === 1)', () => {
            const { container } = render(<QuadImagesBottom title="Test" isEditable={true} />);

            const imageWrappers = container.querySelectorAll('.image-wrapper');
            expect(imageWrappers).toHaveLength(4);
            expect(imageWrappers[0]).not.toHaveClass('elevated');
            expect(imageWrappers[1]).toHaveClass('elevated');
            expect(imageWrappers[2]).not.toHaveClass('elevated');
            expect(imageWrappers[3]).toHaveClass('elevated');
        });
    });

    describe('CSS classes', () => {
        it('applies container class', () => {
            const { container } = render(<QuadImagesBottom title="Test" />);

            expect(container.firstChild).toHaveClass('container');
        });

        it('applies both template and editable classes when both props are true', () => {
            const { container } = render(<QuadImagesBottom title="Test" isTemplate={true} isEditable={true} />);

            expect(container.firstChild).toHaveClass('template');
            expect(container.firstChild).toHaveClass('editable');
        });

        it('applies no additional classes when both props are false', () => {
            const { container } = render(<QuadImagesBottom title="Test" isTemplate={false} isEditable={false} />);

            expect(container.firstChild).toHaveClass('container');
            expect(container.firstChild).not.toHaveClass('template');
            expect(container.firstChild).not.toHaveClass('editable');
        });
    });

    describe('Props combinations', () => {
        it('renders correctly with all props provided', () => {
            const handlers = {
                onTitleChange: jest.fn(),
                onDescriptionChange: jest.fn(),
                onImage1Change: jest.fn(),
                onImage2Change: jest.fn(),
                onImage3Change: jest.fn(),
                onImage4Change: jest.fn(),
            };

            render(
                <QuadImagesBottom
                    title="Full Title"
                    description="Full Description"
                    image1="full1.jpg"
                    image2="full2.jpg"
                    image3="full3.jpg"
                    image4="full4.jpg"
                    isTemplate={true}
                    isEditable={true}
                    {...handlers}
                />,
            );

            expect(screen.getByTestId('title')).toHaveTextContent('Full Title');
            expect(screen.getByTestId('description')).toHaveTextContent('Full Description');
            expect(screen.getByTestId('photo-input-group-section-image-1')).toBeInTheDocument();
            expect(screen.getByTestId('photo-input-group-section-image-2')).toBeInTheDocument();
            expect(screen.getByTestId('photo-input-group-section-image-3')).toBeInTheDocument();
            expect(screen.getByTestId('photo-input-group-section-image-4')).toBeInTheDocument();
        });

        it('renders correctly with minimal props', () => {
            render(<QuadImagesBottom />);

            expect(screen.getByTestId('title-description-section')).toBeInTheDocument();
        });

        it('renders correctly with partial images', () => {
            const { container } = render(<QuadImagesBottom title="Test" image1="img1.jpg" image3="img3.jpg" />);

            const images = container.querySelectorAll('img');
            expect(images).toHaveLength(4);
            expect(images[0]).toHaveAttribute('src', 'img1.jpg');
            expect(images[1].getAttribute('src')).toBeFalsy();
            expect(images[2]).toHaveAttribute('src', 'img3.jpg');
            expect(images[3].getAttribute('src')).toBeFalsy();
        });
    });
});
