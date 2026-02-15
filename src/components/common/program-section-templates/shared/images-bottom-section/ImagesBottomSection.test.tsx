import { render, act } from '@testing-library/react';
import type { ImagesBottomSectionProps } from './ImagesBottomSection';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';

jest.mock('nanoid', () => ({
    nanoid: jest.fn(),
}));

jest.mock('../title-description-section/TitleDescriptionSection', () => ({
    TitleDescriptionSection: jest.fn(() => <div data-testid="title-description-section" />),
}));

jest.mock('./PublishedImagesBottomSection', () => ({
    PublishedImagesBottomSection: jest.fn(() => <div data-testid="published-images-bottom-section" />),
}));

jest.mock('./EditableImagesBottomSection', () => ({
    EditableImagesBottomSection: jest.fn(() => <div data-testid="editable-images-bottom-section" />),
}));

const { ImagesBottomSection } = require('./ImagesBottomSection') as typeof import('./ImagesBottomSection');

const { nanoid } = jest.requireMock('nanoid') as { nanoid: jest.Mock };

const { TitleDescriptionSection } = jest.requireMock('../title-description-section/TitleDescriptionSection') as {
    TitleDescriptionSection: jest.Mock;
};

const { PublishedImagesBottomSection } = jest.requireMock('./PublishedImagesBottomSection') as {
    PublishedImagesBottomSection: jest.Mock;
};

const { EditableImagesBottomSection } = jest.requireMock('./EditableImagesBottomSection') as {
    EditableImagesBottomSection: jest.Mock;
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
        template: ProgramSectionTemplate.DualImagesBottom,
        title: 'Section Title',
        description: 'Section Description',
        images: [
            { id: 1, url: 'img1.jpg', mimeType: 'image/jpeg' },
            { id: 2, url: 'img2.jpg', mimeType: 'image/jpeg' },
        ],
        imageHandlers: [
            { key: '1', value: null, handler: jest.fn() },
            { key: '2', value: null, handler: jest.fn() },
        ],
        config: baseConfig,
        mode: ProgramSectionMode.Published,
        onTitleChange: jest.fn(),
        onDescriptionChange: jest.fn(),
        className: '',
        topSectionClassName: '',
        bottomSectionClassName: '',
        imageWrapperClassName: '',
        imageClassName: '',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        nanoid.mockReset();
    });

    it('passes template/title/description/mode and handlers to TitleDescriptionSection', () => {
        render(<ImagesBottomSection {...defaultProps} mode={ProgramSectionMode.Edit} />);

        expect(TitleDescriptionSection).toHaveBeenCalledTimes(1);

        const props = TitleDescriptionSection.mock.calls[0][0];
        expect(props.template).toBe(defaultProps.template);
        expect(props.title).toBe('Section Title');
        expect(props.description).toBe('Section Description');
        expect(props.mode).toBe(ProgramSectionMode.Edit);
        expect(props.onTitleChange).toBe(defaultProps.onTitleChange);
        expect(props.onDescriptionChange).toBe(defaultProps.onDescriptionChange);
    });

    it('uses default values for optional props (title/description/className/mode)', () => {
        const minimal: ImagesBottomSectionProps = {
            template: ProgramSectionTemplate.DualImagesBottom,
            images: [
                { id: 1, url: 'img1.jpg', mimeType: 'image/jpeg' },
                { id: 2, url: 'img2.jpg', mimeType: 'image/jpeg' },
            ],
            imageHandlers: [
                { key: '1', value: null, handler: jest.fn() },
                { key: '2', value: null, handler: jest.fn() },
            ],
            config: baseConfig,
        };

        const { container } = render(<ImagesBottomSection {...minimal} />);

        const tdProps = TitleDescriptionSection.mock.calls[0][0];
        expect(tdProps.title).toBe('');
        expect(tdProps.description).toBe('');
        expect(tdProps.mode).toBe(ProgramSectionMode.Published);
        expect(tdProps.onTitleChange).toBeUndefined();
        expect(tdProps.onDescriptionChange).toBeUndefined();

        expect(container.firstElementChild).toBeInTheDocument();
    });

    it('renders PublishedImagesBottomSection in Published mode and passes sliced images + styling props', () => {
        const images = [
            { id: 1, url: 'img1.jpg', mimeType: 'image/jpeg' },
            { id: 2, url: 'img2.jpg', mimeType: 'image/jpeg' },
            { id: 3, url: 'img3.jpg', mimeType: 'image/jpeg' },
        ];

        render(
            <ImagesBottomSection
                {...defaultProps}
                images={images}
                bottomSectionClassName="b"
                imageWrapperClassName="w"
                imageClassName="i"
                mode={ProgramSectionMode.Published}
            />,
        );

        expect(PublishedImagesBottomSection).toHaveBeenCalledTimes(1);
        expect(EditableImagesBottomSection).not.toHaveBeenCalled();

        const p = PublishedImagesBottomSection.mock.calls[0][0];
        expect(p.images).toEqual(images.slice(0, baseConfig.imageCount));
        expect(p.config).toBe(baseConfig);
        expect(p.bottomSectionClassName).toBe('b');
        expect(p.imageWrapperClassName).toBe('w');
        expect(p.imageClassName).toBe('i');
    });

    it('renders EditableImagesBottomSection in Edit mode and passes sliced images/handlers, keys, errors and onSetError', () => {
        nanoid.mockImplementationOnce(() => 'k1').mockImplementationOnce(() => 'k2');

        const images = [
            { id: 1, url: 'img1.jpg', mimeType: 'image/jpeg' },
            { id: 2, url: 'img2.jpg', mimeType: 'image/jpeg' },
            { id: 3, url: 'img3.jpg', mimeType: 'image/jpeg' },
        ];

        const imageHandlers = [
            { key: '1', value: null, handler: jest.fn() },
            { key: '2', value: null, handler: jest.fn() },
            { key: '3', value: null, handler: jest.fn() },
        ];

        render(
            <ImagesBottomSection
                {...defaultProps}
                images={images}
                imageHandlers={imageHandlers}
                bottomSectionClassName="b"
                imageWrapperClassName="w"
                mode={ProgramSectionMode.Edit}
            />,
        );

        expect(EditableImagesBottomSection).toHaveBeenCalledTimes(1);
        expect(PublishedImagesBottomSection).not.toHaveBeenCalled();

        const first = EditableImagesBottomSection.mock.calls[0][0];

        expect(first.images).toEqual(images.slice(0, baseConfig.imageCount));
        expect(first.imageHandlers).toEqual(imageHandlers.slice(0, baseConfig.imageCount));
        expect(first.imageKeys).toEqual(['k1', 'k2']);
        expect(first.config).toBe(baseConfig);
        expect(first.mode).toBe(ProgramSectionMode.Edit);
        expect(first.bottomSectionClassName).toBe('b');
        expect(first.imageWrapperClassName).toBe('w');
        expect(first.errors).toEqual([]);
        expect(typeof first.onSetError).toBe('function');
    });

    it('updates errors via onSetError and passes new errors to EditableImagesBottomSection', () => {
        nanoid.mockImplementationOnce(() => 'k1').mockImplementationOnce(() => 'k2');

        render(<ImagesBottomSection {...defaultProps} mode={ProgramSectionMode.Edit} />);

        const first = EditableImagesBottomSection.mock.calls[0][0];
        expect(first.errors).toEqual([]);

        act(() => {
            first.onSetError(1, 'err');
        });

        const lastCall = EditableImagesBottomSection.mock.calls[EditableImagesBottomSection.mock.calls.length - 1][0];
        expect(lastCall.errors[1]).toBe('err');

        act(() => {
            lastCall.onSetError(1, null);
        });

        const last2 = EditableImagesBottomSection.mock.calls[EditableImagesBottomSection.mock.calls.length - 1][0];
        expect(last2.errors[1]).toBe('');
    });

    it('adds form-container class in Edit and View modes', () => {
        const { container: c1 } = render(<ImagesBottomSection {...defaultProps} mode={ProgramSectionMode.Edit} />);
        expect(c1.firstElementChild).toHaveClass('form-container');

        const { container: c2 } = render(<ImagesBottomSection {...defaultProps} mode={ProgramSectionMode.View} />);
        expect(c2.firstElementChild).toHaveClass('form-container');
    });

    it('adds custom className on root', () => {
        const { container } = render(<ImagesBottomSection {...defaultProps} className="my-custom-class" />);
        expect(container.firstElementChild).toHaveClass('my-custom-class');
    });

    it('passes topSectionClassName into TitleDescriptionSection.className', () => {
        render(<ImagesBottomSection {...defaultProps} topSectionClassName="my-top" />);
        const props = TitleDescriptionSection.mock.calls[0][0];
        expect(props.className).toContain('top-section');
        expect(props.className).toContain('my-top');
    });

    it('passes template title/description classNames when mode is Template', () => {
        render(<ImagesBottomSection {...defaultProps} mode={ProgramSectionMode.Template} />);
        const props = TitleDescriptionSection.mock.calls[0][0];
        expect(props.titleClassName).toBe('title-template');
        expect(props.descriptionClassName).toBe('description-template');
    });
});
