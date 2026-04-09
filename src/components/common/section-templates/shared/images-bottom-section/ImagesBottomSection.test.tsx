import React from 'react';
import { act, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { ImagesBottomSectionProps } from './ImagesBottomSection';
import { ImagesBottomSection } from './ImagesBottomSection';
import { SectionMode, SectionTemplate } from '@/types/common/program-sections';

jest.mock('react', () => {
    const actual = jest.requireActual('react');
    return {
        ...actual,
        useId: jest.fn(),
    };
});

jest.mock('../title-description-section/TitleDescriptionSection', () => ({
    TitleDescriptionSection: jest.fn(() => <div data-testid="title-description-section" />),
}));

jest.mock('./ViewImagesBottomSection', () => ({
    ViewImagesBottomSection: jest.fn(() => <div data-testid="view-images-bottom-section" />),
}));

jest.mock('./EditableImagesBottomSection', () => ({
    EditableImagesBottomSection: jest.fn(() => <div data-testid="editable-images-bottom-section" />),
}));

const { TitleDescriptionSection } = jest.requireMock('../title-description-section/TitleDescriptionSection') as {
    TitleDescriptionSection: jest.Mock;
};

const { ViewImagesBottomSection } = jest.requireMock('./ViewImagesBottomSection') as {
    ViewImagesBottomSection: jest.Mock;
};

const { EditableImagesBottomSection } = jest.requireMock('./EditableImagesBottomSection') as {
    EditableImagesBottomSection: jest.Mock;
};

const getUseIdMock = () => {
    const reactMod = jest.requireMock('react') as { useId: jest.Mock };
    return reactMod.useId;
};

const baseConfig: ImagesBottomSectionProps['config'] = {
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

const makeProps = (override: Partial<ImagesBottomSectionProps> = {}): ImagesBottomSectionProps => ({
    template: SectionTemplate.DualImagesBottom,
    title: 'Section Title',
    description: 'Section Description',
    images: [
        { id: 1, url: 'img1.jpg', mimeType: 'image/jpeg' } as any,
        { id: 2, url: 'img2.jpg', mimeType: 'image/jpeg' } as any,
    ],
    imageHandlers: [
        { key: '1', value: null, handler: jest.fn() },
        { key: '2', value: null, handler: jest.fn() },
    ],
    config: baseConfig,
    mode: SectionMode.View,
    onTitleChange: jest.fn(),
    onDescriptionChange: jest.fn(),
    validationResetKey: 1,
    className: '',
    topSectionClassName: '',
    bottomSectionClassName: '',
    imageWrapperClassName: '',
    imageClassName: '',
    ...override,
});

const renderComponent = (override: Partial<ImagesBottomSectionProps> = {}) => {
    const useId = getUseIdMock();
    useId.mockReturnValue('rid');

    TitleDescriptionSection.mockClear();
    ViewImagesBottomSection.mockClear();
    EditableImagesBottomSection.mockClear();

    const props = makeProps(override);
    const utils = render(<ImagesBottomSection {...props} />);
    const root = utils.container.firstElementChild as HTMLElement;

    return { props, root, ...utils };
};

describe('ImagesBottomSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('passes template/title/description/mode and handlers to TitleDescriptionSection', () => {
        const { props } = renderComponent({ mode: SectionMode.Edit });

        expect(TitleDescriptionSection).toHaveBeenCalledTimes(1);

        const tdProps = TitleDescriptionSection.mock.calls[0][0];
        expect(tdProps.template).toBe(props.template);
        expect(tdProps.title).toBe(props.title);
        expect(tdProps.description).toBe(props.description);
        expect(tdProps.mode).toBe(SectionMode.Edit);
        expect(tdProps.onTitleChange).toBe(props.onTitleChange);
        expect(tdProps.onDescriptionChange).toBe(props.onDescriptionChange);
        expect(tdProps.validationResetKey).toBe(props.validationResetKey);
    });

    it('uses default values for optional props (title/description/mode/className/top/bottom/wrapper/image)', () => {
        const { root } = renderComponent({
            title: undefined,
            description: undefined,
            mode: undefined,
            onTitleChange: undefined,
            onDescriptionChange: undefined,
            validationResetKey: undefined,
            className: undefined as any,
            topSectionClassName: undefined as any,
            bottomSectionClassName: undefined as any,
            imageWrapperClassName: undefined as any,
            imageClassName: undefined as any,
        });

        const tdProps = TitleDescriptionSection.mock.calls[0][0];
        expect(tdProps.title).toBe('');
        expect(tdProps.description).toBe('');
        expect(tdProps.mode).toBe(SectionMode.View);
        expect(tdProps.onTitleChange).toBeUndefined();
        expect(tdProps.onDescriptionChange).toBeUndefined();

        expect(root).toBeInTheDocument();
    });

    it('renders ViewImagesBottomSection in View mode and passes sliced images + styling props', () => {
        const images = [
            { id: 1, url: 'img1.jpg', mimeType: 'image/jpeg' } as any,
            { id: 2, url: 'img2.jpg', mimeType: 'image/jpeg' } as any,
            { id: 3, url: 'img3.jpg', mimeType: 'image/jpeg' } as any,
        ];

        renderComponent({
            images,
            bottomSectionClassName: 'b',
            imageWrapperClassName: 'w',
            imageClassName: 'i',
            mode: SectionMode.View,
        });

        expect(ViewImagesBottomSection).toHaveBeenCalledTimes(1);
        expect(EditableImagesBottomSection).not.toHaveBeenCalled();

        const p = ViewImagesBottomSection.mock.calls[0][0];
        expect(p.images).toEqual(images.slice(0, baseConfig.imageCount));
        expect(p.config).toBe(baseConfig);
        expect(p.bottomSectionClassName).toBe('b');
        expect(p.imageWrapperClassName).toBe('w');
        expect(p.imageClassName).toBe('i');
    });

    it('renders EditableImagesBottomSection in Edit mode and passes sliced images/handlers, keys and other props', () => {
        const images = [
            { id: 1, url: 'img1.jpg', mimeType: 'image/jpeg' } as any,
            { id: 2, url: 'img2.jpg', mimeType: 'image/jpeg' } as any,
            { id: 3, url: 'img3.jpg', mimeType: 'image/jpeg' } as any,
        ];

        const imageHandlers = [
            { key: '1', value: null, handler: jest.fn() },
            { key: '2', value: null, handler: jest.fn() },
            { key: '3', value: null, handler: jest.fn() },
        ];

        renderComponent({
            images,
            imageHandlers,
            bottomSectionClassName: 'b',
            imageWrapperClassName: 'w',
            mode: SectionMode.Edit,
        });

        expect(EditableImagesBottomSection).toHaveBeenCalledTimes(1);
        expect(ViewImagesBottomSection).not.toHaveBeenCalled();

        const first = EditableImagesBottomSection.mock.calls[0][0];

        expect(first.images).toEqual(images.slice(0, baseConfig.imageCount));
        expect(first.imageHandlers).toEqual(imageHandlers.slice(0, baseConfig.imageCount));
        expect(first.imageKeys).toEqual(['rid-image-0', 'rid-image-1']);
        expect(first.config).toBe(baseConfig);
        expect(first.mode).toBe(SectionMode.Edit);
        expect(first.bottomSectionClassName).toBe('b');
        expect(first.imageWrapperClassName).toBe('w');
        expect(first.errors).toEqual([]);
        expect(typeof first.onSetError).toBe('function');
    });

    it('renders EditableImagesBottomSection in Template mode too and passes template mode through', () => {
        renderComponent({ mode: SectionMode.Template });

        expect(EditableImagesBottomSection).toHaveBeenCalledTimes(1);
        expect(ViewImagesBottomSection).not.toHaveBeenCalled();

        const p = EditableImagesBottomSection.mock.calls[0][0];
        expect(p.mode).toBe(SectionMode.Template);
    });

    it('updates errors via onSetError and passes new errors to EditableImagesBottomSection', () => {
        renderComponent({ mode: SectionMode.Edit });

        const first = EditableImagesBottomSection.mock.calls[0][0];
        expect(first.errors).toEqual([]);

        act(() => {
            first.onSetError(1, 'err');
        });

        const last = EditableImagesBottomSection.mock.calls[EditableImagesBottomSection.mock.calls.length - 1][0];
        expect(last.errors[1]).toBe('err');

        act(() => {
            last.onSetError(1, null);
        });

        const last2 = EditableImagesBottomSection.mock.calls[EditableImagesBottomSection.mock.calls.length - 1][0];
        expect(last2.errors[1]).toBe('');
    });

    it('adds form-container class in Edit mode only', () => {
        {
            const { root, unmount } = renderComponent({ mode: SectionMode.Edit });
            expect(root).toHaveClass('form-container');
            unmount();
        }

        {
            const { root, unmount } = renderComponent({ mode: SectionMode.View });
            expect(root).not.toHaveClass('form-container');
            unmount();
        }

        {
            const { root } = renderComponent({ mode: SectionMode.Template });
            expect(root).not.toHaveClass('form-container');
        }
    });

    it('adds custom className on root', () => {
        const { root } = renderComponent({ className: 'my-custom-class' });
        expect(root).toHaveClass('my-custom-class');
    });

    it('passes topSectionClassName into TitleDescriptionSection.className', () => {
        renderComponent({ topSectionClassName: 'my-top' });

        const tdProps = TitleDescriptionSection.mock.calls[0][0];
        expect(tdProps.className).toContain('top-section');
        expect(tdProps.className).toContain('my-top');
    });

    it('passes template title/description classNames when mode is Template; otherwise empty strings', () => {
        {
            renderComponent({ mode: SectionMode.Template });

            const tdProps = TitleDescriptionSection.mock.calls[0][0];
            expect(tdProps.titleClassName).toBe('title-template');
            expect(tdProps.descriptionClassName).toBe('description-template');
        }

        {
            const { unmount } = renderComponent({ mode: SectionMode.Edit });
            const tdProps = TitleDescriptionSection.mock.calls[0][0];
            expect(tdProps.titleClassName).toBe('');
            expect(tdProps.descriptionClassName).toBe('');
            unmount();
        }
    });

    it('slices images/handlers to imageCount for editable branch and keys length matches displayed images length', () => {
        renderComponent({
            mode: SectionMode.Edit,
            config: { ...baseConfig, imageCount: 1 },
            images: [
                { id: 1, url: 'img1.jpg', mimeType: 'image/jpeg' } as any,
                { id: 2, url: 'img2.jpg', mimeType: 'image/jpeg' } as any,
            ],
            imageHandlers: [
                { key: '1', value: null, handler: jest.fn() },
                { key: '2', value: null, handler: jest.fn() },
            ],
        });

        const p = EditableImagesBottomSection.mock.calls[0][0];
        expect(p.images).toHaveLength(1);
        expect(p.imageHandlers).toHaveLength(1);
        expect(p.imageKeys).toEqual(['rid-image-0']);
    });
});
