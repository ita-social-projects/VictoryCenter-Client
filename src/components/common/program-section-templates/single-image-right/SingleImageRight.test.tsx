import { render, screen, fireEvent } from '@testing-library/react';
import { SingleImageRight } from './SingleImageRight';
import { ProgramSectionMode } from '@/types/common/program-sections';

const mockPhotoInputGroup = jest.fn();

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
    PhotoInputGroup: (props: any) => {
        mockPhotoInputGroup(props);
        const { id, value, onChange } = props;

        return (
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
        );
    },
}));

describe('SingleImageRight', () => {
    beforeEach(() => {
        mockPhotoInputGroup.mockClear();
    });

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
            const { container } = render(
                <SingleImageRight title="Test" image={{ id: 1, url: 'test-image.jpg', mimeType: 'image/jpeg' }} />,
            );

            const image = container.querySelector('img');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', expect.stringContaining('test-image.jpg'));
        });

        it('applies template class when mode is Template', () => {
            const { container } = render(<SingleImageRight title="Test" mode={ProgramSectionMode.Template} />);

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
        it('renders TextAreaWithCharacterLimitGroup components when mode is Edit', () => {
            render(<SingleImageRight title="Test" mode={ProgramSectionMode.Edit} />);

            expect(screen.getByTestId('textarea-group-section-title')).toBeInTheDocument();
            expect(screen.getByTestId('textarea-group-section-description')).toBeInTheDocument();
        });

        it('renders PhotoInputGroup when mode is Edit', () => {
            render(<SingleImageRight title="Test" mode={ProgramSectionMode.Edit} />);

            expect(screen.getByTestId('photo-input-group')).toBeInTheDocument();
        });

        it('applies form-container class when mode is Edit', () => {
            const { container } = render(<SingleImageRight title="Test" mode={ProgramSectionMode.Edit} />);

            expect(container.firstChild).toHaveClass('form-container');
        });

        it('calls onTitleChange when title textarea is changed', () => {
            const onTitleChange = jest.fn();
            render(<SingleImageRight title="Test" mode={ProgramSectionMode.Edit} onTitleChange={onTitleChange} />);

            const titleTextarea = screen.getByTestId('textarea-section-title');
            fireEvent.change(titleTextarea, { target: { value: 'New Title' } });

            expect(onTitleChange).toHaveBeenCalledWith('New Title');
        });

        it('calls onDescriptionChange when description textarea is changed', () => {
            const onDescriptionChange = jest.fn();
            render(
                <SingleImageRight
                    title="Test"
                    mode={ProgramSectionMode.Edit}
                    onDescriptionChange={onDescriptionChange}
                />,
            );

            const descriptionTextarea = screen.getByTestId('textarea-section-description');
            fireEvent.change(descriptionTextarea, { target: { value: 'New Description' } });

            expect(onDescriptionChange).toHaveBeenCalledWith('New Description');
        });

        it('calls onImageChange when image is changed', () => {
            const onImageChange = jest.fn();
            render(<SingleImageRight title="Test" mode={ProgramSectionMode.Edit} onImageChange={onImageChange} />);

            screen.getByTestId('photo-change').click();
            expect(onImageChange).toHaveBeenCalledWith({
                id: '123',
                url: 'new-image.jpg',
                mimeType: 'image/jpeg',
            });
        });

        it('passes title value to title TextAreaWithCharacterLimitGroup', () => {
            render(<SingleImageRight title="Existing Title" mode={ProgramSectionMode.Edit} />);

            const titleTextarea = screen.getByTestId('textarea-section-title');
            expect(titleTextarea).toHaveValue('Existing Title');
        });

        it('passes description value to description TextAreaWithCharacterLimitGroup', () => {
            render(<SingleImageRight description="Existing Description" mode={ProgramSectionMode.Edit} />);

            const descriptionTextarea = screen.getByTestId('textarea-section-description');
            expect(descriptionTextarea).toHaveValue('Existing Description');
        });

        it('passes null to PhotoInputGroup (not using image value)', () => {
            render(
                <SingleImageRight
                    title="Test"
                    mode={ProgramSectionMode.Edit}
                    image={{ id: 2, url: 'existing-image.jpg', mimeType: 'image/jpeg' }}
                />,
            );

            expect(screen.getByTestId('photo-value')).toHaveTextContent('existing-image.jpg');
        });

        it('does not render h2 and p tags in editable mode', () => {
            const { container } = render(
                <SingleImageRight title="Test" description="Desc" mode={ProgramSectionMode.Edit} />,
            );

            expect(container.querySelector('h2')).not.toBeInTheDocument();
            expect(container.querySelector('p')).not.toBeInTheDocument();
        });

        it('does not render regular img tag in editable mode', () => {
            const { container } = render(
                <SingleImageRight
                    title="Test"
                    mode={ProgramSectionMode.Edit}
                    image={{ id: 3, url: 'test.jpg', mimeType: 'image/jpeg' }}
                />,
            );

            expect(container.querySelector('img')).not.toBeInTheDocument();
        });

        it('handles missing callback props gracefully', () => {
            render(<SingleImageRight title="Test" mode={ProgramSectionMode.Edit} />);

            expect(screen.getByTestId('textarea-group-section-title')).toBeInTheDocument();
            expect(screen.getByTestId('textarea-group-section-description')).toBeInTheDocument();
            expect(screen.getByTestId('photo-input-group')).toBeInTheDocument();
        });

        it('has correct structure with left and right sections in editable mode', () => {
            const { container } = render(<SingleImageRight title="Test" mode={ProgramSectionMode.Edit} />);

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

        it('applies form-container class when mode is Edit', () => {
            const { container } = render(<SingleImageRight title="Test" mode={ProgramSectionMode.Edit} />);

            expect(container.firstChild).toHaveClass('form-container');
        });

        it('applies no additional classes when mode is Published', () => {
            const { container } = render(<SingleImageRight title="Test" mode={ProgramSectionMode.View} />);

            expect(container.firstChild).toHaveClass('container');
            expect(container.firstChild).not.toHaveClass('template');
            expect(container.firstChild).not.toHaveClass('form-container');
        });
    });

    describe('Props combinations', () => {
        it('renders correctly with all props provided', () => {
            const handlers = {
                onTitleChange: jest.fn(),
                onDescriptionChange: jest.fn(),
                onImageChange: jest.fn(),
            };

            render(
                <SingleImageRight
                    title="Full Title"
                    description="Full Description"
                    image={{ id: 4, url: 'full-image.jpg', mimeType: 'image/jpeg' }}
                    mode={ProgramSectionMode.Edit}
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
            render(<SingleImageRight title="Old Title" mode={ProgramSectionMode.Edit} onTitleChange={onTitleChange} />);

            const titleTextarea = screen.getByTestId('textarea-section-title');
            fireEvent.change(titleTextarea, { target: { value: 'New Title' } });

            expect(onTitleChange).toHaveBeenCalledWith('New Title');
        });

        it('handleDescriptionChange extracts value from event and calls onDescriptionChange', () => {
            const onDescriptionChange = jest.fn();
            render(
                <SingleImageRight
                    description="Old Description"
                    mode={ProgramSectionMode.Edit}
                    onDescriptionChange={onDescriptionChange}
                />,
            );

            const descriptionTextarea = screen.getByTestId('textarea-section-description');
            fireEvent.change(descriptionTextarea, { target: { value: 'New Description' } });

            expect(onDescriptionChange).toHaveBeenCalledWith('New Description');
        });
    });
});
