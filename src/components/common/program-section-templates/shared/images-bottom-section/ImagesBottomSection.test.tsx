import { render, screen } from '@testing-library/react';
import type { ImagesBottomSectionProps } from './ImagesBottomSection';
import { ProgramSectionMode } from '@/types/common/program-sections';

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

jest.mock('@/components/admin/input-groups/photo-input-group/PhotoInputGroup', () => ({
    PhotoInputGroup: jest.fn(() => {
        const React = require('react');
        return React.createElement('div', { 'data-testid': 'photo-input-group' });
    }),
}));

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
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('passes title/description and mode to TitleDescriptionSection', () => {
        render(<ImagesBottomSection {...defaultProps} mode={ProgramSectionMode.Edit} />);

        expect(TitleDescriptionSection).toHaveBeenCalledTimes(1);
        const callProps = (TitleDescriptionSection as unknown as jest.Mock).mock.calls[0][0];
        expect(callProps.title).toBe('Section Title');
        expect(callProps.description).toBe('Section Description');
        expect(callProps.mode).toBe(ProgramSectionMode.Edit);
    });

    it('uses empty string defaults for title/description when omitted', () => {
        const { title: _title, description: _description, ...rest } = defaultProps;
        render(<ImagesBottomSection {...rest} mode={ProgramSectionMode.Published} />);

        expect(TitleDescriptionSection).toHaveBeenCalledTimes(1);
        const callProps = (TitleDescriptionSection as unknown as jest.Mock).mock.calls[0][0];
        expect(callProps.title).toBe('');
        expect(callProps.description).toBe('');
    });

    it('defaults mode to Published and keeps optional handlers undefined when omitted', () => {
        const minimalProps: ImagesBottomSectionProps = {
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

        const { container } = render(<ImagesBottomSection {...minimalProps} />);

        expect(TitleDescriptionSection).toHaveBeenCalledTimes(1);
        const callProps = (TitleDescriptionSection as unknown as jest.Mock).mock.calls[0][0];
        expect(callProps.mode).toBe(ProgramSectionMode.Published);
        expect(callProps.onTitleChange).toBeUndefined();
        expect(callProps.onDescriptionChange).toBeUndefined();

        expect(container.firstElementChild).not.toHaveClass('my-custom-class');
    });

    it('renders PhotoInputGroup components in view mode (not img elements)', () => {
        const imageHandlers: ImagesBottomSectionProps['imageHandlers'] = [
            { key: '1', value: { id: 1, url: 'img1.jpg', mimeType: 'image/jpeg' }, handler: jest.fn() },
            { key: '2', value: { id: 2, url: 'img2.jpg', mimeType: 'image/jpeg' }, handler: jest.fn() },
        ];

        render(
            <ImagesBottomSection {...defaultProps} imageHandlers={imageHandlers} mode={ProgramSectionMode.Published} />,
        );

        // PhotoInputGroup should be called twice in Published mode
        expect(PhotoInputGroup).toHaveBeenCalledTimes(2);
    });

    it('renders when an image string is empty (key fallback branch coverage)', () => {
        render(
            <ImagesBottomSection
                {...defaultProps}
                images={[null, { id: 2, url: 'img2.jpg', mimeType: 'image/jpeg' }]}
            />,
        );

        const wrappers = screen.getAllByTestId('image-wrapper');
        expect(wrappers).toHaveLength(2);

        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(1);
    });

    it('wires PhotoInputGroup props for each image in Edit mode', () => {
        const imageHandlers: ImagesBottomSectionProps['imageHandlers'] = [
            { key: '1', value: null, handler: undefined },
            { key: '2', value: { id: 2, url: 'img2.jpg', mimeType: 'image/jpeg' }, handler: jest.fn() },
        ];

        render(<ImagesBottomSection {...defaultProps} imageHandlers={imageHandlers} mode={ProgramSectionMode.Edit} />);

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
        expect(firstCallProps.variant).toBe('programSection');

        const secondCallProps = (PhotoInputGroup as unknown as jest.Mock).mock.calls[1][0];
        expect(secondCallProps.id).toBe('section-image-2');
        expect(secondCallProps.name).toBe('section-image-2');
        expect(secondCallProps.value).toEqual({ id: 2, url: 'img2.jpg', mimeType: 'image/jpeg' });
        expect(secondCallProps.onChange).toBe(imageHandlers[1].handler);
        expect(secondCallProps.variant).toBe('programSection');
    });

    it('renders images in published mode', () => {
        render(<ImagesBottomSection {...defaultProps} mode={ProgramSectionMode.Published} />);
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveAttribute('src', expect.stringContaining('img1.jpg'));
        expect(images[1]).toHaveAttribute('src', expect.stringContaining('img2.jpg'));
    });

    it('includes custom className on the root element', () => {
        const { container } = render(<ImagesBottomSection {...defaultProps} className="my-custom-class" />);
        expect(container.firstElementChild).toHaveClass('my-custom-class');
    });

    it('applies elevated data attribute', () => {
        render(<ImagesBottomSection {...defaultProps} />);
        const images = screen.getAllByRole('img');
        expect((images[1] as HTMLElement).dataset.elevated).toBe('true');
        expect((images[0] as HTMLElement).dataset.elevated).toBe('false');
    });

    it('applies elevated data attribute in Edit mode', () => {
        render(<ImagesBottomSection {...defaultProps} mode={ProgramSectionMode.Edit} />);
        const wrappers = screen.getAllByTestId(/image-wrapper/);
        expect((wrappers[1] as HTMLElement).dataset.elevated).toBe('true');
        expect((wrappers[0] as HTMLElement).dataset.elevated).toBeUndefined();
    });
});
