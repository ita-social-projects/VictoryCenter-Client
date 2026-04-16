import { render, screen } from '@testing-library/react';
import { SingleImageBottom, SingleImageBottomProps } from './SingleImageBottom';
import { SECTION_IMAGE_CONFIGS } from '@/const/admin/sections';
import { SectionMode } from '@/types/common/sections';

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

const getLastCallProps = (fn: jest.Mock) => fn.mock.calls[fn.mock.calls.length - 1]?.[0];

const renderSingleImageBottom = (props: Partial<SingleImageBottomProps> = {}) =>
    render(<SingleImageBottom {...props} />);

describe('SingleImageBottom', () => {
    beforeEach(() => {
        mockTitleDescriptionSection.mockClear();
        mockPhotoInputGroup.mockClear();
    });

    it('renders non-editable layout: shows image and passes mode to TitleDescriptionSection', () => {
        const { container } = renderSingleImageBottom({
            title: 'T',
            description: 'D',
            image: { id: 1, url: 'test-image.jpg', mimeType: 'image/jpeg' },
            mode: SectionMode.Template,
        });

        const img = container.querySelector('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', expect.stringContaining('test-image.jpg'));
        expect(screen.getByTestId('title-description-section')).toBeInTheDocument();
        expect(mockPhotoInputGroup).not.toHaveBeenCalled();

        expect(getLastCallProps(mockTitleDescriptionSection)).toEqual(
            expect.objectContaining({
                title: 'T',
                description: 'D',
                mode: SectionMode.Template,
                className: 'top-section',
            }),
        );
    });

    it('renders editable layout: wires handlers and configures PhotoInputGroup', () => {
        const onTitleChange = jest.fn();
        const onDescriptionChange = jest.fn();
        const onImageChange = jest.fn();

        const { container } = renderSingleImageBottom({
            title: 'T',
            description: 'D',
            image: { base64: 'base64-data', mimeType: 'image/jpeg' },
            mode: SectionMode.Edit,
            onTitleChange,
            onDescriptionChange,
            onImageChange,
        });

        expect(screen.getByTestId('title-description-section')).toBeInTheDocument();
        expect(screen.getByTestId('photo-input-group')).toBeInTheDocument();
        expect(container.querySelector('img')).not.toBeInTheDocument();

        expect(getLastCallProps(mockTitleDescriptionSection)).toEqual(
            expect.objectContaining({
                title: 'T',
                description: 'D',
                mode: SectionMode.Edit,
                onTitleChange,
                onDescriptionChange,
                className: 'top-section',
            }),
        );

        const photoProps = getLastCallProps(mockPhotoInputGroup);
        expect(photoProps).toEqual(
            expect.objectContaining({
                id: 'section-image-1',
                name: 'section-image-1',
                cropWidth: SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.cropWidth,
                cropHeight: SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.cropHeight,
                minWidth: SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.minWidth,
                minHeight: SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.minHeight,
                value: { base64: 'base64-data', mimeType: 'image/jpeg' },
                onChange: expect.any(Function),
            }),
        );

        photoProps.onChange({ base64: 'new', mimeType: 'image/png' });
        expect(onImageChange).toHaveBeenCalledWith({ base64: 'new', mimeType: 'image/png' });
    });

    it('uses null value for PhotoInputGroup when image is empty (editable branch)', () => {
        renderSingleImageBottom({
            image: null,
            mode: SectionMode.Edit,
        });

        const photoProps = getLastCallProps(mockPhotoInputGroup);
        expect(photoProps).toEqual(expect.objectContaining({ value: null }));
    });

    it('uses a fallback onChange when onImageChange is not provided', () => {
        renderSingleImageBottom({
            mode: SectionMode.Edit,
        });

        const photoProps = getLastCallProps(mockPhotoInputGroup);
        expect(photoProps.onChange).toEqual(expect.any(Function));
        expect(() => photoProps.onChange(null)).not.toThrow();
    });

    it('applies template/form-container CSS module class toggles on the container', () => {
        const { container, rerender } = renderSingleImageBottom({ mode: SectionMode.Template });
        expect(container.firstChild).toHaveClass('container');
        expect(container.firstChild).toHaveClass('template');
        expect(container.firstChild).not.toHaveClass('form-container');

        rerender(<SingleImageBottom mode={SectionMode.Edit} />);
        expect(container.firstChild).toHaveClass('form-container');
        expect(container.firstChild).not.toHaveClass('template');
    });
});
