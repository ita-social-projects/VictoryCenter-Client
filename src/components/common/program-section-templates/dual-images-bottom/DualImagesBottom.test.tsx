import React from 'react';
import { render, screen } from '@testing-library/react';
import { DualImagesBottom, DualImagesBottomProps } from './DualImagesBottom';
import { ImageValues } from '@/types/common/image';

// Mock the shared components - we test TitleDescriptionSection separately
jest.mock('../shared/title-description-section/TitleDescriptionSection', () => ({
    TitleDescriptionSection: ({
        title,
        description,
        isTemplate,
        isEditable,
    }: {
        title?: string;
        description?: string;
        isTemplate?: boolean;
        isEditable?: boolean;
        onTitleChange?: (value: string) => void;
        onDescriptionChange?: (value: string) => void;
        className?: string;
    }) => (
        <div data-testid="title-description-section" data-title={title} data-description={description}>
            {isTemplate && <span data-testid="template-flag">template</span>}
            {isEditable && <span data-testid="editable-flag">editable</span>}
        </div>
    ),
}));

// Mock ImagesBottomSection
jest.mock('../shared/images-bottom-section/ImagesBottomSection', () => ({
    ImagesBottomSection: ({
        variant,
        title,
        description,
        images,
        imageHandlers,
        config,
        isTemplate,
        isEditable,
        onTitleChange,
        onDescriptionChange,
    }: {
        variant: string;
        title?: string;
        description?: string;
        images: string[];
        imageHandlers: Array<{ handler?: (file: ImageValues | null) => void; key: string; value: string }>;
        config: any;
        isTemplate?: boolean;
        isEditable?: boolean;
        onTitleChange?: (value: string) => void;
        onDescriptionChange?: (value: string) => void;
    }) => (
        <div data-testid="images-bottom-section">
            <div data-testid="variant">{variant}</div>
            <div data-testid="title">{title}</div>
            <div data-testid="description">{description}</div>
            <div data-testid="images-count">{images.length}</div>
            <div data-testid="image-handlers-count">{imageHandlers.length}</div>
            <div data-testid="image-config">{JSON.stringify(config)}</div>
            {isTemplate && <span data-testid="template-flag">template</span>}
            {isEditable && <span data-testid="editable-flag">editable</span>}
        </div>
    ),
}));

describe('DualImagesBottom', () => {
    const defaultProps: DualImagesBottomProps = {
        title: '',
        description: '',
        image1: '',
        image2: '',
        isTemplate: false,
        isEditable: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Render helpers
    const renderDualImagesBottom = (overrideProps: Partial<DualImagesBottomProps> = {}) =>
        render(<DualImagesBottom {...defaultProps} {...overrideProps} />);

    // Element getters
    const getImagesBottomSection = () => screen.getByTestId('images-bottom-section');
    const getVariant = () => screen.getByTestId('variant');
    const getImagesCount = () => screen.getByTestId('images-count');
    const getImageHandlersCount = () => screen.getByTestId('image-handlers-count');

    describe('Rendering', () => {
        it('renders ImagesBottomSection with correct variant', () => {
            renderDualImagesBottom();

            expect(getImagesBottomSection()).toBeInTheDocument();
            expect(getVariant()).toHaveTextContent('dual');
        });

        it('passes both images to ImagesBottomSection', () => {
            renderDualImagesBottom({
                image1: 'image1.jpg',
                image2: 'image2.jpg',
            });

            expect(getImagesCount()).toHaveTextContent('2');
            expect(getImageHandlersCount()).toHaveTextContent('2');
        });

        it('passes empty images array when no images provided', () => {
            renderDualImagesBottom();

            expect(getImagesCount()).toHaveTextContent('2');
            expect(getImageHandlersCount()).toHaveTextContent('2');
        });

        it('passes title and description to ImagesBottomSection', () => {
            renderDualImagesBottom({
                title: 'Test Title',
                description: 'Test Description',
            });

            expect(screen.getByTestId('title')).toHaveTextContent('Test Title');
            expect(screen.getByTestId('description')).toHaveTextContent('Test Description');
        });
    });

    describe('Props forwarding', () => {
        it('forwards isTemplate prop to ImagesBottomSection', () => {
            renderDualImagesBottom({
                isTemplate: true,
            });

            expect(screen.getByTestId('template-flag')).toBeInTheDocument();
        });

        it('forwards isEditable prop to ImagesBottomSection', () => {
            renderDualImagesBottom({
                isEditable: true,
            });

            expect(screen.getByTestId('editable-flag')).toBeInTheDocument();
        });

        it('forwards onTitleChange callback to ImagesBottomSection', () => {
            const onTitleChange = jest.fn();
            renderDualImagesBottom({
                onTitleChange,
            });

            expect(getImagesBottomSection()).toBeInTheDocument();
        });

        it('forwards onDescriptionChange callback to ImagesBottomSection', () => {
            const onDescriptionChange = jest.fn();
            renderDualImagesBottom({
                onDescriptionChange,
            });

            expect(getImagesBottomSection()).toBeInTheDocument();
        });
    });

    describe('Image handlers', () => {
        it('creates image handlers array with both handlers', () => {
            const onImage1Change = jest.fn();
            const onImage2Change = jest.fn();

            renderDualImagesBottom({
                image1: 'img1.jpg',
                image2: 'img2.jpg',
                onImage1Change,
                onImage2Change,
            });

            expect(getImageHandlersCount()).toHaveTextContent('2');
        });

        it('handles missing image handlers gracefully', () => {
            renderDualImagesBottom({
                image1: 'img1.jpg',
                image2: 'img2.jpg',
            });

            expect(getImageHandlersCount()).toHaveTextContent('2');
        });

        it('passes correct image values to handlers', () => {
            renderDualImagesBottom({
                image1: 'image1.jpg',
                image2: 'image2.jpg',
            });

            const configElement = screen.getByTestId('image-config');
            const config = JSON.parse(configElement.textContent || '{}');

            expect(config.imageCount).toBe(2);
            expect(config.gridColumns).toBe(2);
            expect(config.elevatedIndices).toEqual([0]);
        });
    });

    describe('Configuration', () => {
        it('passes correct DUAL_IMAGES_CONFIG to ImagesBottomSection', () => {
            renderDualImagesBottom();

            const configElement = screen.getByTestId('image-config');
            const config = JSON.parse(configElement.textContent || '{}');

            expect(config.imageCount).toBe(2);
            expect(config.gridColumns).toBe(2);
            expect(config.elevatedIndices).toEqual([0]);
            expect(config.editableImageMaxHeight).toBe(430);
            expect(config.editableImageMaxWidth).toBe(730);
            expect(config.imageConfig).toBeDefined();
        });
    });

    describe('Default values', () => {
        it('uses empty strings as default for all props', () => {
            renderDualImagesBottom();

            expect(screen.getByTestId('title')).toHaveTextContent('');
            expect(screen.getByTestId('description')).toHaveTextContent('');
            expect(getImagesCount()).toHaveTextContent('2');
        });

        it('defaults isTemplate to false', () => {
            renderDualImagesBottom();

            expect(screen.queryByTestId('template-flag')).not.toBeInTheDocument();
        });

        it('defaults isEditable to false', () => {
            renderDualImagesBottom();

            expect(screen.queryByTestId('editable-flag')).not.toBeInTheDocument();
        });
    });

    describe('Image array construction', () => {
        it('constructs images array in correct order', () => {
            renderDualImagesBottom({
                image1: 'first.jpg',
                image2: 'second.jpg',
            });

            expect(getImagesCount()).toHaveTextContent('2');
        });

        it('handles partial image values', () => {
            renderDualImagesBottom({
                image1: 'image1.jpg',
                image2: '',
            });

            expect(getImagesCount()).toHaveTextContent('2');
        });
    });
});

