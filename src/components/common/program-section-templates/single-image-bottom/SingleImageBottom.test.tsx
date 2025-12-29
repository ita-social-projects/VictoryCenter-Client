import { render, screen } from '@testing-library/react';
import { SingleImageBottom } from './SingleImageBottom';
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
        <div data-testid="photo-input-group">
            <div data-testid="photo-id">{id}</div>
            <div data-testid="photo-value">{value?.base64 || 'no-image'}</div>
            <button
                data-testid="photo-change"
                onClick={() => onChange({ id: '123', url: 'new-image.jpg', mimeType: 'image/jpeg' })}
            >
                Change Photo
            </button>
        </div>
    ),
}));

describe('SingleImageBottom', () => {
    describe('Non-editable mode', () => {
        it('renders with title and description', () => {
            render(<SingleImageBottom title="Test Title" description="Test Description" />);

            expect(screen.getByTestId('title')).toHaveTextContent('Test Title');
            expect(screen.getByTestId('description')).toHaveTextContent('Test Description');
        });

        it('renders image when provided', () => {
            const { container } = render(<SingleImageBottom title="Test" image1="test-image.jpg" />);

            const image = container.querySelector('img');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', 'test-image.jpg');
        });

        it('applies template class when isTemplate is true', () => {
            const { container } = render(<SingleImageBottom title="Test" isTemplate={true} />);

            expect(container.firstChild).toHaveClass('template');
        });

        it('passes isTemplate prop to TitleDescriptionSection', () => {
            render(<SingleImageBottom title="Test" isTemplate={true} />);

            expect(screen.getByTestId('is-template')).toHaveTextContent('true');
        });

        it('renders with default empty values', () => {
            render(<SingleImageBottom />);

            expect(screen.getByTestId('title')).toHaveTextContent('');
            expect(screen.getByTestId('description')).toHaveTextContent('');
        });

        it('does not render PhotoInputGroup in non-editable mode', () => {
            render(<SingleImageBottom title="Test" />);

            expect(screen.queryByTestId('photo-input-group')).not.toBeInTheDocument();
        });
    });

    describe('Editable mode', () => {
        it('renders PhotoInputGroup when isEditable is true', () => {
            render(<SingleImageBottom title="Test" isEditable={true} />);

            expect(screen.getByTestId('photo-input-group')).toBeInTheDocument();
        });

        it('applies editable class when isEditable is true', () => {
            const { container } = render(<SingleImageBottom title="Test" isEditable={true} />);

            expect(container.firstChild).toHaveClass('editable');
        });

        it('passes isEditable prop to TitleDescriptionSection', () => {
            render(<SingleImageBottom title="Test" isEditable={true} />);

            expect(screen.getByTestId('is-editable')).toHaveTextContent('true');
        });

        it('calls onTitleChange when title is changed', () => {
            const onTitleChange = jest.fn();
            render(<SingleImageBottom title="Test" isEditable={true} onTitleChange={onTitleChange} />);

            screen.getByTestId('title-change').click();
            expect(onTitleChange).toHaveBeenCalledWith('new title');
        });

        it('calls onDescriptionChange when description is changed', () => {
            const onDescriptionChange = jest.fn();
            render(<SingleImageBottom title="Test" isEditable={true} onDescriptionChange={onDescriptionChange} />);

            screen.getByTestId('description-change').click();
            expect(onDescriptionChange).toHaveBeenCalledWith('new description');
        });

        it('calls onImage1Change when image is changed', () => {
            const onImage1Change = jest.fn();
            render(<SingleImageBottom title="Test" isEditable={true} onImage1Change={onImage1Change} />);

            screen.getByTestId('photo-change').click();
            expect(onImage1Change).toHaveBeenCalledWith({
                id: '123',
                url: 'new-image.jpg',
                mimeType: 'image/jpeg',
            });
        });

        it('passes image1 value to PhotoInputGroup', () => {
            render(<SingleImageBottom title="Test" isEditable={true} image1="existing-image.jpg" />);

            expect(screen.getByTestId('photo-value')).toHaveTextContent('existing-image.jpg');
        });

        it('passes null to PhotoInputGroup when no image', () => {
            render(<SingleImageBottom title="Test" isEditable={true} />);

            expect(screen.getByTestId('photo-value')).toHaveTextContent('no-image');
        });

        it('does not render regular img tag in editable mode', () => {
            const { container } = render(<SingleImageBottom title="Test" isEditable={true} image1="test.jpg" />);

            expect(container.querySelector('img')).not.toBeInTheDocument();
        });

        it('handles missing callback props gracefully', () => {
            render(<SingleImageBottom title="Test" isEditable={true} />);

            expect(screen.getByTestId('photo-input-group')).toBeInTheDocument();
        });
    });

    describe('CSS classes', () => {
        it('applies container class', () => {
            const { container } = render(<SingleImageBottom title="Test" />);

            expect(container.firstChild).toHaveClass('container');
        });

        it('applies both template and editable classes when both props are true', () => {
            const { container } = render(<SingleImageBottom title="Test" isTemplate={true} isEditable={true} />);

            expect(container.firstChild).toHaveClass('template');
            expect(container.firstChild).toHaveClass('editable');
        });

        it('applies no additional classes when both props are false', () => {
            const { container } = render(<SingleImageBottom title="Test" isTemplate={false} isEditable={false} />);

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
            };

            render(
                <SingleImageBottom
                    title="Full Title"
                    description="Full Description"
                    image1="full-image.jpg"
                    isTemplate={true}
                    isEditable={true}
                    {...handlers}
                />,
            );

            expect(screen.getByTestId('title')).toHaveTextContent('Full Title');
            expect(screen.getByTestId('description')).toHaveTextContent('Full Description');
            expect(screen.getByTestId('photo-input-group')).toBeInTheDocument();
        });

        it('renders correctly with minimal props', () => {
            render(<SingleImageBottom />);

            expect(screen.getByTestId('title-description-section')).toBeInTheDocument();
        });
    });
});
