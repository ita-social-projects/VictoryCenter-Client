import React from 'react';
import { render, screen } from '@testing-library/react';

interface ExpectedImageConfig {
    imageCount: number;
    gridColumns: number;
    elevatedIndices: number[];
    editableGridColumns?: number;
    editableImageMaxHeight: number;
    editableImageMaxWidth: number;
}

interface TestConfig<TProps> {
    componentName: string;
    variant: string;
    imageCount: number;
    Component: React.ComponentType<TProps>;
    createDefaultProps: () => TProps;
    createImageProps: (images: string[]) => Partial<TProps>;
    createImageHandlers: (handlers: Array<jest.Mock>) => Partial<TProps>;
    expectedConfig: ExpectedImageConfig;
}

// Element getters
const getImagesBottomSection = () => screen.getByTestId('images-bottom-section');
const getVariant = () => screen.getByTestId('variant');
const getImagesCount = () => screen.getByTestId('images-count');
const getNonEmptyImagesCount = () => screen.getByTestId('non-empty-images-count');
const getImagesJson = () => screen.getByTestId('images-json');
const getImageHandlersCount = () => screen.getByTestId('image-handlers-count');
const getImageHandlersSummary = () => screen.getByTestId('image-handlers-summary');
const getHasOnTitleChange = () => screen.getByTestId('has-onTitleChange');
const getHasOnDescriptionChange = () => screen.getByTestId('has-onDescriptionChange');

export function createImagesBottomTestSuite<TProps extends Record<string, any>>(config: TestConfig<TProps>) {
    const {
        componentName,
        variant,
        imageCount,
        Component,
        createDefaultProps,
        createImageProps,
        createImageHandlers,
        expectedConfig,
    } = config;

    describe(componentName, () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        // Render helper
        const renderComponent = (overrideProps: Partial<TProps> = {}) => {
            const defaultProps = createDefaultProps();
            return render(<Component {...defaultProps} {...overrideProps} />);
        };

        describe('Rendering', () => {
            it('renders with no props (default destructuring branch)', () => {
                render(<Component {...({} as TProps)} />);

                expect(getImagesBottomSection()).toBeInTheDocument();
                expect(getVariant()).toHaveTextContent(variant);
                expect(getImagesCount()).toHaveTextContent(imageCount.toString());
                expect(getNonEmptyImagesCount()).toHaveTextContent('0');
            });

            it('renders ImagesBottomSection with correct variant', () => {
                renderComponent();

                expect(getImagesBottomSection()).toBeInTheDocument();
                expect(getVariant()).toHaveTextContent(variant);
            });

            it(`passes all ${imageCount} images to ImagesBottomSection`, () => {
                const images = Array.from({ length: imageCount }, (_, i) => `image${i + 1}.jpg`);
                const imageProps = createImageProps(images);

                renderComponent(imageProps);

                expect(getImagesCount()).toHaveTextContent(imageCount.toString());
                expect(getNonEmptyImagesCount()).toHaveTextContent(imageCount.toString());
                expect(getImagesJson()).toHaveTextContent(JSON.stringify(images));
                expect(getImageHandlersCount()).toHaveTextContent(imageCount.toString());
            });

            it('passes empty images array when no images provided', () => {
                renderComponent();

                expect(getImagesCount()).toHaveTextContent(imageCount.toString());
                expect(getNonEmptyImagesCount()).toHaveTextContent('0');
                expect(getImageHandlersCount()).toHaveTextContent(imageCount.toString());
            });

            it('passes title and description to ImagesBottomSection', () => {
                renderComponent({
                    title: 'Test Title',
                    description: 'Test Description',
                } as unknown as Partial<TProps>);

                expect(screen.getByTestId('title')).toHaveTextContent('Test Title');
                expect(screen.getByTestId('description')).toHaveTextContent('Test Description');
            });
        });

        describe('Props forwarding', () => {
            it('forwards isTemplate prop to ImagesBottomSection', () => {
                renderComponent({ isTemplate: true } as unknown as Partial<TProps>);

                expect(screen.getByTestId('template-flag')).toBeInTheDocument();
            });

            it('forwards isEditable prop to ImagesBottomSection', () => {
                renderComponent({ isEditable: true } as unknown as Partial<TProps>);

                expect(screen.getByTestId('editable-flag')).toBeInTheDocument();
            });

            it('forwards onTitleChange callback to ImagesBottomSection', () => {
                const onTitleChange = jest.fn();
                renderComponent({ onTitleChange } as unknown as Partial<TProps>);

                expect(getImagesBottomSection()).toBeInTheDocument();
                expect(getHasOnTitleChange()).toHaveTextContent('true');
            });

            it('forwards onDescriptionChange callback to ImagesBottomSection', () => {
                const onDescriptionChange = jest.fn();
                renderComponent({ onDescriptionChange } as unknown as Partial<TProps>);

                expect(getImagesBottomSection()).toBeInTheDocument();
                expect(getHasOnDescriptionChange()).toHaveTextContent('true');
            });
        });

        describe('Image handlers', () => {
            it(`creates image handlers array with all ${imageCount} handlers`, () => {
                const handlers = Array.from({ length: imageCount }, () => jest.fn());
                const images = Array.from({ length: imageCount }, (_, i) => `img${i + 1}.jpg`);

                const imageProps = createImageProps(images);
                const handlerProps = createImageHandlers(handlers);

                renderComponent({ ...imageProps, ...handlerProps } as unknown as Partial<TProps>);

                expect(getImageHandlersCount()).toHaveTextContent(imageCount.toString());
                const summary = JSON.parse(getImageHandlersSummary().textContent || '[]');
                expect(summary).toHaveLength(imageCount);
                summary.forEach((h: any, i: number) => {
                    expect(h).toEqual(
                        expect.objectContaining({
                            key: `image${i + 1}`,
                            value: images[i],
                            hasHandler: true,
                        }),
                    );
                });
            });

            it('handles missing image handlers gracefully', () => {
                const images = Array.from({ length: imageCount }, (_, i) => `img${i + 1}.jpg`);
                const imageProps = createImageProps(images);

                renderComponent(imageProps);

                expect(getImageHandlersCount()).toHaveTextContent(imageCount.toString());
                const summary = JSON.parse(getImageHandlersSummary().textContent || '[]');
                expect(summary).toHaveLength(imageCount);
                summary.forEach((h: any, i: number) => {
                    expect(h).toEqual(
                        expect.objectContaining({
                            key: `image${i + 1}`,
                            value: images[i],
                            hasHandler: false,
                        }),
                    );
                });
            });

            it('passes correct image values to handlers', () => {
                const images = Array.from({ length: imageCount }, (_, i) => `image${i + 1}.jpg`);
                const imageProps = createImageProps(images);

                renderComponent(imageProps);

                const configElement = screen.getByTestId('image-config');
                const config = JSON.parse(configElement.textContent || '{}');

                expect(config.imageCount).toBe(expectedConfig.imageCount);
                expect(config.gridColumns).toBe(expectedConfig.gridColumns);
                expect(config.elevatedIndices).toEqual(expectedConfig.elevatedIndices);
            });
        });

        describe('Configuration', () => {
            it(`passes correct ${variant.toUpperCase()}_IMAGES_CONFIG to ImagesBottomSection`, () => {
                renderComponent();

                const configElement = screen.getByTestId('image-config');
                const config = JSON.parse(configElement.textContent || '{}');

                expect(config.imageCount).toBe(expectedConfig.imageCount);
                expect(config.gridColumns).toBe(expectedConfig.gridColumns);
                expect(config.elevatedIndices).toEqual(expectedConfig.elevatedIndices);

                if (expectedConfig.editableGridColumns !== undefined) {
                    expect(config.editableGridColumns).toBe(expectedConfig.editableGridColumns);
                }

                expect(config.editableImageMaxHeight).toBe(expectedConfig.editableImageMaxHeight);
                expect(config.editableImageMaxWidth).toBe(expectedConfig.editableImageMaxWidth);
                expect(config.imageConfig).toBeDefined();
            });
        });

        describe('Default values', () => {
            it('uses empty strings as default for all props', () => {
                renderComponent();

                expect(screen.getByTestId('title')).toHaveTextContent('');
                expect(screen.getByTestId('description')).toHaveTextContent('');
                expect(getImagesCount()).toHaveTextContent(imageCount.toString());
            });

            it('defaults isTemplate to false', () => {
                renderComponent();

                expect(screen.queryByTestId('template-flag')).not.toBeInTheDocument();
            });

            it('defaults isEditable to false', () => {
                renderComponent();

                expect(screen.queryByTestId('editable-flag')).not.toBeInTheDocument();
            });
        });

        describe('Image array construction', () => {
            it('constructs images array in correct order', () => {
                const images = Array.from({ length: imageCount }, (_, i) => `image${i + 1}.jpg`);
                const imageProps = createImageProps(images);

                renderComponent(imageProps);

                expect(getImagesCount()).toHaveTextContent(imageCount.toString());
                expect(getImagesJson()).toHaveTextContent(JSON.stringify(images));
            });

            it('handles partial image values', () => {
                const images = Array.from({ length: imageCount }, (_, i) => (i % 2 === 0 ? `image${i + 1}.jpg` : ''));
                const imageProps = createImageProps(images);

                renderComponent(imageProps);

                expect(getImagesCount()).toHaveTextContent(imageCount.toString());
                expect(getNonEmptyImagesCount()).toHaveTextContent(Math.ceil(imageCount / 2).toString());
                expect(getImagesJson()).toHaveTextContent(JSON.stringify(images));
            });
        });
    });
}
