import { render, screen } from '@testing-library/react';
import { SingleImageTop, SingleImageTopProps } from './SingleImageTop';
import { ProgramSectionMode } from '@/types/common/program-sections';

const mockTitleDescriptionSection = jest.fn();
const mockPhotoInputGroup = jest.fn();

jest.mock('../shared/title-description-section/TitleDescriptionSection', () => ({
    TitleDescriptionSection: (props: any) => {
        mockTitleDescriptionSection(props);
        return <div data-testid="title-description-section" />;
    },
}));

jest.mock('@/components/admin/input-groups/photo-input-group/PhotoInputGroup', () => ({
    PhotoInputGroup: (props: any) => {
        mockPhotoInputGroup(props);
        return <div data-testid="photo-input-group" />;
    },
}));

describe('SingleImageTop', () => {
    const baseProps: SingleImageTopProps = {
        title: 'Test Title',
        description: 'Test Description',
        image: { id: 1, url: 'test-image.png', mimeType: 'image/png' },
        mode: ProgramSectionMode.Published,
    };

    beforeEach(() => {
        mockTitleDescriptionSection.mockClear();
        mockPhotoInputGroup.mockClear();
    });

    it('passes title/description handlers to TitleDescriptionSection in edit mode', () => {
        const onTitleChange = jest.fn();
        const onDescriptionChange = jest.fn();
        render(
            <SingleImageTop
                {...baseProps}
                mode={ProgramSectionMode.Edit}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
            />,
        );

        expect(screen.getByTestId('title-description-section')).toBeInTheDocument();
        expect(mockTitleDescriptionSection).toHaveBeenCalledWith(
            expect.objectContaining({
                title: baseProps.title,
                description: baseProps.description,
                mode: ProgramSectionMode.Edit,
                onTitleChange,
                onDescriptionChange,
            }),
        );
    });

    it('passes onImageChange to PhotoInputGroup in edit mode', () => {
        const onImageChange = jest.fn();
        render(<SingleImageTop {...baseProps} mode={ProgramSectionMode.Edit} onImageChange={onImageChange} />);

        expect(screen.getByTestId('photo-input-group')).toBeInTheDocument();
        expect(mockPhotoInputGroup).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'section-image-1',
                name: 'section-image-1',
                onChange: onImageChange,
            }),
        );
    });

    it('uses a fallback onChange when onImageChange is missing', () => {
        render(<SingleImageTop {...baseProps} mode={ProgramSectionMode.Edit} />);

        const photoProps = mockPhotoInputGroup.mock.calls[0]?.[0];
        expect(photoProps).toEqual(expect.any(Object));
        expect(photoProps.onChange).toEqual(expect.any(Function));
    });

    it('renders correctly in non-edit mode', () => {
        const { container } = render(<SingleImageTop {...baseProps} mode={ProgramSectionMode.Published} />);

        const img = container.querySelector('img');
        expect(img).not.toBeNull();

        const expectedSrc = baseProps.image && 'url' in baseProps.image ? baseProps.image.url : '';
        expect(img).toHaveAttribute('src', expectedSrc);

        expect(screen.getByTestId('title-description-section')).toBeInTheDocument();
        expect(mockTitleDescriptionSection).toHaveBeenCalledWith(
            expect.objectContaining({
                title: baseProps.title,
                description: baseProps.description,
                mode: ProgramSectionMode.Published,
            }),
        );
    });

    it('renders with mode=Template', () => {
        const { container } = render(<SingleImageTop {...baseProps} mode={ProgramSectionMode.Template} />);
        expect(container.firstChild).toHaveClass('template');
        expect(mockTitleDescriptionSection).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: ProgramSectionMode.Template,
            }),
        );
    });

    it('renders with default props', () => {
        const { container } = render(<SingleImageTop />);

        expect(container.firstChild).toBeInTheDocument();
        const img = container.querySelector('img');
        expect(img).toBeNull();
        expect(screen.getByTestId('title-description-section')).toBeInTheDocument();
        expect(mockTitleDescriptionSection).toHaveBeenCalledWith(
            expect.objectContaining({
                title: '',
                description: '',
                mode: ProgramSectionMode.Published,
            }),
        );
    });

    it('applies correct classNames for Template and Edit modes', () => {
        const { container, rerender } = render(<SingleImageTop mode={ProgramSectionMode.Template} />);
        expect(container.firstChild).toHaveClass('template');
        rerender(<SingleImageTop mode={ProgramSectionMode.Edit} />);
        expect(container.firstChild).toHaveClass('form-container');
    });
});
