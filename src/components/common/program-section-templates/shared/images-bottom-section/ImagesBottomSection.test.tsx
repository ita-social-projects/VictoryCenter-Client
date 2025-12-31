import { render, screen } from '@testing-library/react';
import type { ImagesBottomSectionProps } from './ImagesBottomSection';

jest.mock('../title-description-section/TitleDescriptionSection', () => {
    return {
        TitleDescriptionSection: jest.fn((props: any) => (
            <div
                data-testid="title-description-section"
                data-title={props.title}
                data-description={props.description}
                data-is-editable={String(props.isEditable)}
                data-is-template={String(props.isTemplate)}
            />
        )),
    };
});

jest.mock('@/components/admin/input-groups/photo-input-group/PhotoInputGroup', () => {
    return {
        PhotoInputGroup: jest.fn(() => <div data-testid="photo-input-group" />),
    };
});

const { ImagesBottomSection } = require('./ImagesBottomSection') as typeof import('./ImagesBottomSection');
const { TitleDescriptionSection } = jest.requireMock('../title-description-section/TitleDescriptionSection') as {
    TitleDescriptionSection: jest.Mock;
};
const { PhotoInputGroup } = jest.requireMock('@/components/admin/input-groups/photo-input-group/PhotoInputGroup') as {
    PhotoInputGroup: jest.Mock;
};

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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('passes title/description and template/editable flags to TitleDescriptionSection', () => {
        render(<ImagesBottomSection {...defaultProps} isEditable={true} isTemplate={true} />);

        expect(TitleDescriptionSection).toHaveBeenCalledTimes(1);
        const callProps = (TitleDescriptionSection as unknown as jest.Mock).mock.calls[0][0];
        expect(callProps.title).toBe('Section Title');
        expect(callProps.description).toBe('Section Description');
        expect(callProps.isEditable).toBe(true);
        expect(callProps.isTemplate).toBe(true);
    });

    it('uses empty string defaults for title/description when omitted', () => {
        const { title: _title, description: _description, ...rest } = defaultProps;
        render(<ImagesBottomSection {...rest} />);

        expect(TitleDescriptionSection).toHaveBeenCalledTimes(1);
        const callProps = (TitleDescriptionSection as unknown as jest.Mock).mock.calls[0][0];
        expect(callProps.title).toBe('');
        expect(callProps.description).toBe('');
    });

    it('defaults isTemplate/isEditable/className and keeps optional handlers undefined when omitted', () => {
        const minimalProps: ImagesBottomSectionProps = {
            variant: 'dual',
            images: ['img1.jpg', 'img2.jpg'],
            imageHandlers: [
                { key: '1', value: '', handler: jest.fn() },
                { key: '2', value: '', handler: jest.fn() },
            ],
            config: baseConfig,
        };

        const { container } = render(<ImagesBottomSection {...minimalProps} />);

        expect(TitleDescriptionSection).toHaveBeenCalledTimes(1);
        const callProps = (TitleDescriptionSection as unknown as jest.Mock).mock.calls[0][0];
        expect(callProps.isEditable).toBe(false);
        expect(callProps.isTemplate).toBe(false);
        expect(callProps.onTitleChange).toBeUndefined();
        expect(callProps.onDescriptionChange).toBeUndefined();

        expect(container.firstElementChild).not.toHaveClass('my-custom-class');
    });

    it('renders images in view mode', () => {
        render(<ImagesBottomSection {...defaultProps} />);
        // Use role 'presentation' because <img alt=""> is role=presentation
        const images = screen.getAllByRole('presentation');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveAttribute('src', 'img1.jpg');
        expect(images[1]).toHaveAttribute('src', 'img2.jpg');
    });

    it('renders when an image string is empty (key fallback branch coverage)', () => {
        render(<ImagesBottomSection {...defaultProps} images={['', 'img2.jpg']} />);

        const wrappers = screen.getAllByTestId('image-wrapper');
        expect(wrappers).toHaveLength(2);
        expect(screen.getAllByRole('presentation')).toHaveLength(2);
    });

    it('wires PhotoInputGroup props for each editable image', () => {
        const imageHandlers: ImagesBottomSectionProps['imageHandlers'] = [
            { key: '1', value: '', handler: undefined },
            { key: '2', value: 'img2.jpg', handler: jest.fn() },
        ];

        render(<ImagesBottomSection {...defaultProps} imageHandlers={imageHandlers} isEditable={true} />);

        expect(PhotoInputGroup).toHaveBeenCalledTimes(2);

        const firstCallProps = (PhotoInputGroup as unknown as jest.Mock).mock.calls[0][0];
        expect(firstCallProps.id).toBe('section-image-1');
        expect(firstCallProps.name).toBe('section-image-1');
        expect(firstCallProps.value).toBeNull();
        expect(typeof firstCallProps.onChange).toBe('function');
        expect(firstCallProps.cropWidth).toBe(baseConfig.imageConfig.cropWidth);
        expect(firstCallProps.cropHeight).toBe(baseConfig.imageConfig.cropHeight);
        expect(firstCallProps.minWidth).toBe(baseConfig.imageConfig.minWidth);
        expect(firstCallProps.minHeight).toBe(baseConfig.imageConfig.minHeight);
        expect(firstCallProps.imageLabel).toBe(baseConfig.imageLabel);
        expect(firstCallProps.className).toBe('program-section-image-input');

        const secondCallProps = (PhotoInputGroup as unknown as jest.Mock).mock.calls[1][0];
        expect(secondCallProps.id).toBe('section-image-2');
        expect(secondCallProps.name).toBe('section-image-2');
        expect(secondCallProps.value).toEqual({ id: null, url: 'img2.jpg', mimeType: '' });
        expect(secondCallProps.onChange).toBe(imageHandlers[1].handler);
    });

    it('includes custom className on the root element', () => {
        const { container } = render(<ImagesBottomSection {...defaultProps} className="my-custom-class" />);
        expect(container.firstElementChild).toHaveClass('my-custom-class');
    });

    it('applies elevated data attribute', () => {
        render(<ImagesBottomSection {...defaultProps} />);
        const wrappers = screen.getAllByTestId(/image-wrapper/);
        expect((wrappers[1] as HTMLElement).dataset.elevated).toBe('true');
        expect((wrappers[0] as HTMLElement).dataset.elevated).toBeUndefined();
    });

    it('applies elevated data attribute in editable mode too', () => {
        render(<ImagesBottomSection {...defaultProps} isEditable={true} />);
        const wrappers = screen.getAllByTestId(/image-wrapper/);
        expect((wrappers[1] as HTMLElement).dataset.elevated).toBe('true');
        expect((wrappers[0] as HTMLElement).dataset.elevated).toBeUndefined();
    });
});
