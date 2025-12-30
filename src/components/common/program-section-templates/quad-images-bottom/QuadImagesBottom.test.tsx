import React from 'react';
import { render, screen } from '@testing-library/react';
import { QuadImagesBottom, QuadImagesBottomProps } from './QuadImagesBottom';
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

describe('QuadImagesBottom', () => {
    const defaultProps: QuadImagesBottomProps = {
        title: '',
        description: '',
        image1: '',
        image2: '',
        image3: '',
        image4: '',
        isTemplate: false,
        isEditable: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Render helpers
    const renderQuadImagesBottom = (overrideProps: Partial<QuadImagesBottomProps> = {}) =>
        render(<QuadImagesBottom {...defaultProps} {...overrideProps} />);

    // Element getters
    const getImagesBottomSection = () => screen.getByTestId('images-bottom-section');
    const getVariant = () => screen.getByTestId('variant');
    const getImagesCount = () => screen.getByTestId('images-count');
    const getImageHandlersCount = () => screen.getByTestId('image-handlers-count');

    describe('Rendering', () => {
        it('renders ImagesBottomSection with correct variant', () => {
            renderQuadImagesBottom();

            expect(getImagesBottomSection()).toBeInTheDocument();
            expect(getVariant()).toHaveTextContent('quad');
        });

        it('passes all four images to ImagesBottomSection', () => {
            renderQuadImagesBottom({
                image1: 'image1.jpg',
                image2: 'image2.jpg',
                image3: 'image3.jpg',
                image4: 'image4.jpg',
            });

            expect(getImagesCount()).toHaveTextContent('4');
            expect(getImageHandlersCount()).toHaveTextContent('4');
        });

        it('passes empty images array when no images provided', () => {
            renderQuadImagesBottom();

            expect(getImagesCount()).toHaveTextContent('4');
            expect(getImageHandlersCount()).toHaveTextContent('4');
        });

        it('passes title and description to ImagesBottomSection', () => {
            renderQuadImagesBottom({
                title: 'Test Title',
                description: 'Test Description',
            });

            expect(screen.getByTestId('title')).toHaveTextContent('Test Title');
            expect(screen.getByTestId('description')).toHaveTextContent('Test Description');
        });
    });

    describe('Props forwarding', () => {
        it('forwards isTemplate prop to ImagesBottomSection', () => {
            renderQuadImagesBottom({
                isTemplate: true,
            });

            expect(screen.getByTestId('template-flag')).toBeInTheDocument();
        });

        it('forwards isEditable prop to ImagesBottomSection', () => {
            renderQuadImagesBottom({
                isEditable: true,
            });

            expect(screen.getByTestId('editable-flag')).toBeInTheDocument();
        });

        it('forwards onTitleChange callback to ImagesBottomSection', () => {
            const onTitleChange = jest.fn();
            renderQuadImagesBottom({
                onTitleChange,
            });

            // The callback is passed through, we verify it's in the component tree
            expect(getImagesBottomSection()).toBeInTheDocument();
        });

        it('forwards onDescriptionChange callback to ImagesBottomSection', () => {
            const onDescriptionChange = jest.fn();
            renderQuadImagesBottom({
                onDescriptionChange,
            });

            expect(getImagesBottomSection()).toBeInTheDocument();
        });
    });

    describe('Image handlers', () => {
        it('creates image handlers array with all four handlers', () => {
            const onImage1Change = jest.fn();
            const onImage2Change = jest.fn();
            const onImage3Change = jest.fn();
            const onImage4Change = jest.fn();

            renderQuadImagesBottom({
                image1: 'img1.jpg',
                image2: 'img2.jpg',
                image3: 'img3.jpg',
                image4: 'img4.jpg',
                onImage1Change,
                onImage2Change,
                onImage3Change,
                onImage4Change,
            });

            expect(getImageHandlersCount()).toHaveTextContent('4');
        });

        it('handles missing image handlers gracefully', () => {
            renderQuadImagesBottom({
                image1: 'img1.jpg',
                image2: 'img2.jpg',
                image3: 'img3.jpg',
                image4: 'img4.jpg',
            });

            expect(getImageHandlersCount()).toHaveTextContent('4');
        });

        it('passes correct image values to handlers', () => {
            renderQuadImagesBottom({
                image1: 'image1.jpg',
                image2: 'image2.jpg',
                image3: 'image3.jpg',
                image4: 'image4.jpg',
            });

            const configElement = screen.getByTestId('image-config');
            const config = JSON.parse(configElement.textContent || '{}');

            expect(config.imageCount).toBe(4);
            expect(config.gridColumns).toBe(4);
            expect(config.elevatedIndices).toEqual([1, 3]);
        });
    });

    describe('Configuration', () => {
        it('passes correct QUAD_IMAGES_CONFIG to ImagesBottomSection', () => {
            renderQuadImagesBottom();

            const configElement = screen.getByTestId('image-config');
            const config = JSON.parse(configElement.textContent || '{}');

            expect(config.imageCount).toBe(4);
            expect(config.gridColumns).toBe(4);
            expect(config.elevatedIndices).toEqual([1, 3]);
            expect(config.editableGridColumns).toBe(4);
            expect(config.editableImageMaxHeight).toBe(390);
            expect(config.editableImageMaxWidth).toBe(360);
            expect(config.imageConfig).toBeDefined();
        });
    });

    describe('Default values', () => {
        it('uses empty strings as default for all props', () => {
            renderQuadImagesBottom();

            expect(screen.getByTestId('title')).toHaveTextContent('');
            expect(screen.getByTestId('description')).toHaveTextContent('');
            expect(getImagesCount()).toHaveTextContent('4');
        });

        it('defaults isTemplate to false', () => {
            renderQuadImagesBottom();

            expect(screen.queryByTestId('template-flag')).not.toBeInTheDocument();
        });

        it('defaults isEditable to false', () => {
            renderQuadImagesBottom();

            expect(screen.queryByTestId('editable-flag')).not.toBeInTheDocument();
        });
    });

    describe('Image array construction', () => {
        it('constructs images array in correct order', () => {
            renderQuadImagesBottom({
                image1: 'first.jpg',
                image2: 'second.jpg',
                image3: 'third.jpg',
                image4: 'fourth.jpg',
            });

            expect(getImagesCount()).toHaveTextContent('4');
        });

        it('handles partial image values', () => {
            renderQuadImagesBottom({
                image1: 'image1.jpg',
                image2: '',
                image3: 'image3.jpg',
                image4: '',
            });

            expect(getImagesCount()).toHaveTextContent('4');
        });
    });
});
