import { render, screen } from '@testing-library/react';
import { SingleImageRight } from './SingleImageRight';
import { ImageValues } from '@/types/common/image';
import { fireEvent } from '@testing-library/react';

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({ label, value, onChange, id }: any) => (
            <div data-testid={`textarea-group-${id}`}>
                <label data-testid={`label-${id}`}>{label}</label>
                <textarea title="textarea" data-testid={`textarea-${id}`} value={value} onChange={onChange} />
            </div>
        ),
    }),
);

jest.mock('@/components/admin/input-groups/photo-input-group/PhotoInputGroup', () => ({
    PhotoInputGroup: ({ id, value, onChange }: any) => (
        <div data-testid="photo-input-group">
            <div data-testid="photo-id">{id}</div>
            <div data-testid="photo-value">{value?.url || 'no-image'}</div>
            <button
                data-testid="photo-change"
                onClick={() => onChange({ id: '123', url: 'new-image.jpg', mimeType: 'image/jpeg' })}
            >
                Change Photo
            </button>
        </div>
    ),
}));

describe('SingleImageRight', () => {
    describe('Non-editable mode', () => {
        it('renders with title and description', () => {
            render(<SingleImageRight title="Test Title" description="Test Description" />);

            expect(screen.getByText('Test Title')).toBeInTheDocument();
            expect(screen.getByText('Test Description')).toBeInTheDocument();
        });

        it('renders title in h2 tag', () => {
            const { container } = render(<SingleImageRight title="Test Title" description="Test Description" />);

            const h2 = container.querySelector('h2');
            expect(h2).toBeInTheDocument();
            expect(h2).toHaveTextContent('Test Title');
        });

        it('renders description in p tag', () => {
            const { container } = render(<SingleImageRight title="Test" description="Test Description" />);

            const p = container.querySelector('p');
            expect(p).toBeInTheDocument();
            expect(p).toHaveTextContent('Test Description');
        });

        it('renders image when provided', () => {
            const { container } = render(<SingleImageRight title="Test" image1="test-image.jpg" />);

            const image = container.querySelector('img');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', 'test-image.jpg');
        });

        it('applies template class when isTemplate is true', () => {
            const { container } = render(<SingleImageRight title="Test" isTemplate={true} />);

            expect(container.firstChild).toHaveClass('template');
        });

        it('renders with default empty values', () => {
            const { container } = render(<SingleImageRight />);

            const h2 = container.querySelector('h2');
            const p = container.querySelector('p');
            expect(h2).toHaveTextContent('');
            expect(p).toHaveTextContent('');
        });

        it('does not render TextAreaWithCharacterLimitGroup in non-editable mode', () => {
            render(<SingleImageRight title="Test" />);

            expect(screen.queryByTestId('textarea-group-section-title')).not.toBeInTheDocument();
            expect(screen.queryByTestId('textarea-group-section-description')).not.toBeInTheDocument();
        });

        it('does not render PhotoInputGroup in non-editable mode', () => {
            render(<SingleImageRight title="Test" />);

            expect(screen.queryByTestId('photo-input-group')).not.toBeInTheDocument();
        });

        it('has correct structure with left and right sections', () => {
            const { container } = render(<SingleImageRight title="Test" description="Description" />);

            const leftSection = container.querySelector('.left-section');
            const rightSection = container.querySelector('.right-section');

            expect(leftSection).toBeInTheDocument();
            expect(rightSection).toBeInTheDocument();
        });
    });

    describe('Editable mode', () => {
        it('renders TextAreaWithCharacterLimitGroup components when isEditable is true', () => {
            render(<SingleImageRight title="Test" isEditable={true} />);

            expect(screen.getByTestId('textarea-group-section-title')).toBeInTheDocument();
            expect(screen.getByTestId('textarea-group-section-description')).toBeInTheDocument();
        });

        it('renders PhotoInputGroup when isEditable is true', () => {
            render(<SingleImageRight title="Test" isEditable={true} />);

            expect(screen.getByTestId('photo-input-group')).toBeInTheDocument();
        });

        it('applies editable class when isEditable is true', () => {
            const { container } = render(<SingleImageRight title="Test" isEditable={true} />);

            expect(container.firstChild).toHaveClass('editable');
        });

        it('calls onTitleChange when title textarea is changed', () => {
            const onTitleChange = jest.fn();
            render(<SingleImageRight title="Test" isEditable={true} onTitleChange={onTitleChange} />);

            const titleTextarea = screen.getByTestId('textarea-section-title');
            // Simulate user typing
            fireEvent.change(titleTextarea, { target: { value: 'New Title' } });

            expect(onTitleChange).toHaveBeenCalledWith('New Title');
        });

        it('calls onDescriptionChange when description textarea is changed', () => {
            const onDescriptionChange = jest.fn();
            render(<SingleImageRight title="Test" isEditable={true} onDescriptionChange={onDescriptionChange} />);

            const descriptionTextarea = screen.getByTestId('textarea-section-description');
            fireEvent.change(descriptionTextarea, { target: { value: 'New Description' } });

            expect(onDescriptionChange).toHaveBeenCalledWith('New Description');
        });

        it('calls onImage1Change when image is changed', () => {
            const onImage1Change = jest.fn();
            render(<SingleImageRight title="Test" isEditable={true} onImage1Change={onImage1Change} />);

            screen.getByTestId('photo-change').click();
            expect(onImage1Change).toHaveBeenCalledWith({
                id: '123',
                url: 'new-image.jpg',
                mimeType: 'image/jpeg',
            });
        });

        it('passes title value to title TextAreaWithCharacterLimitGroup', () => {
            render(<SingleImageRight title="Existing Title" isEditable={true} />);

            const titleTextarea = screen.getByTestId('textarea-section-title');
            expect(titleTextarea).toHaveValue('Existing Title');
        });

        it('passes description value to description TextAreaWithCharacterLimitGroup', () => {
            render(<SingleImageRight description="Existing Description" isEditable={true} />);

            const descriptionTextarea = screen.getByTestId('textarea-section-description');
            expect(descriptionTextarea).toHaveValue('Existing Description');
        });

        it('passes null to PhotoInputGroup (not using image1 value)', () => {
            render(<SingleImageRight title="Test" isEditable={true} image1="existing-image.jpg" />);

            expect(screen.getByTestId('photo-value')).toHaveTextContent('no-image');
        });

        it('does not render h2 and p tags in editable mode', () => {
            const { container } = render(<SingleImageRight title="Test" description="Desc" isEditable={true} />);

            expect(container.querySelector('h2')).not.toBeInTheDocument();
            expect(container.querySelector('p')).not.toBeInTheDocument();
        });

        it('does not render regular img tag in editable mode', () => {
            const { container } = render(<SingleImageRight title="Test" isEditable={true} image1="test.jpg" />);

            expect(container.querySelector('img')).not.toBeInTheDocument();
        });

        it('handles missing callback props gracefully', () => {
            render(<SingleImageRight title="Test" isEditable={true} />);

            expect(screen.getByTestId('textarea-group-section-title')).toBeInTheDocument();
            expect(screen.getByTestId('textarea-group-section-description')).toBeInTheDocument();
            expect(screen.getByTestId('photo-input-group')).toBeInTheDocument();
        });

        it('has correct structure with left and right sections in editable mode', () => {
            const { container } = render(<SingleImageRight title="Test" isEditable={true} />);

            const leftSection = container.querySelector('.left-section');
            const rightSection = container.querySelector('.right-section');

            expect(leftSection).toBeInTheDocument();
            expect(rightSection).toBeInTheDocument();
        });
    });

    describe('CSS classes', () => {
        it('applies container class', () => {
            const { container } = render(<SingleImageRight title="Test" />);

            expect(container.firstChild).toHaveClass('container');
        });

        it('applies both template and editable classes when both props are true', () => {
            const { container } = render(<SingleImageRight title="Test" isTemplate={true} isEditable={true} />);

            expect(container.firstChild).toHaveClass('template');
            expect(container.firstChild).toHaveClass('editable');
        });

        it('applies no additional classes when both props are false', () => {
            const { container } = render(<SingleImageRight title="Test" isTemplate={false} isEditable={false} />);

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
                <SingleImageRight
                    title="Full Title"
                    description="Full Description"
                    image1="full-image.jpg"
                    isTemplate={true}
                    isEditable={true}
                    {...handlers}
                />,
            );

            expect(screen.getByTestId('textarea-section-title')).toHaveValue('Full Title');
            expect(screen.getByTestId('textarea-section-description')).toHaveValue('Full Description');
            expect(screen.getByTestId('photo-input-group')).toBeInTheDocument();
        });

        it('renders correctly with minimal props', () => {
            const { container } = render(<SingleImageRight />);

            expect(container.querySelector('.container')).toBeInTheDocument();
        });
    });

    describe('Event handlers', () => {
        it('handleTitleChange extracts value from event and calls onTitleChange', () => {
            const onTitleChange = jest.fn();
            render(<SingleImageRight title="Old Title" isEditable={true} onTitleChange={onTitleChange} />);

            const titleTextarea = screen.getByTestId('textarea-section-title');
            fireEvent.change(titleTextarea, { target: { value: 'New Title' } });

            expect(onTitleChange).toHaveBeenCalledWith('New Title');
        });

        it('handleDescriptionChange extracts value from event and calls onDescriptionChange', () => {
            const onDescriptionChange = jest.fn();
            render(
                <SingleImageRight
                    description="Old Description"
                    isEditable={true}
                    onDescriptionChange={onDescriptionChange}
                />,
            );

            const descriptionTextarea = screen.getByTestId('textarea-section-description');
            fireEvent.change(descriptionTextarea, { target: { value: 'New Description' } });

            expect(onDescriptionChange).toHaveBeenCalledWith('New Description');
        });
    });
});
