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
    imageCount: number;
    Component: React.ComponentType<TProps>;
    createDefaultProps: () => TProps;
    createImageProps: (images: string[]) => Partial<TProps>;
    createImageHandlers: (handlers: Array<jest.Mock>) => Partial<TProps>;
    expectedConfig: ExpectedImageConfig;
}

const buildImages = (imageCount: number, prefix = 'image') => {
    return Array.from({ length: imageCount }, (_, i) => `${prefix}${i + 1}.jpg`);
};

const buildAlternatingImages = (imageCount: number) => {
    return Array.from({ length: imageCount }, (_, i) => (i % 2 === 0 ? `image${i + 1}.jpg` : ''));
};

const createMockHandlers = (count: number): Array<jest.Mock> => {
    const handlers: Array<jest.Mock> = [];
    for (let i = 0; i < count; i += 1) {
        handlers.push(jest.fn());
    }
    return handlers;
};

const parseJson = <T,>(json: string | null | undefined, fallback: T): T => {
    if (!json) return fallback;
    try {
        return JSON.parse(json) as T;
    } catch {
        return fallback;
    }
};

const parseJsonFromTestId = <T,>(testId: string, fallback: T): T => {
    const el = screen.getByTestId(testId);
    return parseJson<T>(el.textContent, fallback);
};

const buildHandlersSummaryExpectation = (images: string[], hasHandler: boolean) => {
    return images.map((value, i) => ({
        key: `image${i + 1}`,
        value,
        hasHandler,
    }));
};

const expectImageConfigMatches = (actual: any, expected: ExpectedImageConfig) => {
    expect(actual.imageCount).toBe(expected.imageCount);
    expect(actual.gridColumns).toBe(expected.gridColumns);
    expect(actual.elevatedIndices).toEqual(expected.elevatedIndices);

    if (expected.editableGridColumns !== undefined) {
        expect(actual.editableGridColumns).toBe(expected.editableGridColumns);
    }

    expect(actual.editableImageMaxHeight).toBe(expected.editableImageMaxHeight);
    expect(actual.editableImageMaxWidth).toBe(expected.editableImageMaxWidth);
    expect(actual.imageConfig).toBeDefined();
};

// Element getters
const getImagesBottomSection = () => screen.getByTestId('images-bottom-section');
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

        const renderComponent = (overrideProps: Partial<TProps> = {}) => {
            const defaultProps = createDefaultProps();
            return render(<Component {...defaultProps} {...overrideProps} />);
        };

        describe('Rendering', () => {
            it('renders with no props (default destructuring branch)', () => {
                render(<Component {...({} as TProps)} />);

                expect(getImagesBottomSection()).toBeInTheDocument();
                expect(getImagesCount()).toHaveTextContent(imageCount.toString());
                expect(getNonEmptyImagesCount()).toHaveTextContent('0');
            });

            it(`passes all ${imageCount} images to ImagesBottomSection`, () => {
                const images = buildImages(imageCount);
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
                const handlers = createMockHandlers(imageCount);
                const images = buildImages(imageCount, 'img');

                const imageProps = createImageProps(images);
                const handlerProps = createImageHandlers(handlers);

                renderComponent({ ...imageProps, ...handlerProps } as unknown as Partial<TProps>);

                expect(getImageHandlersCount()).toHaveTextContent(imageCount.toString());
                const summary = parseJson<any[]>(getImageHandlersSummary().textContent, []);
                expect(summary).toEqual(expect.arrayContaining(buildHandlersSummaryExpectation(images, true)));
            });

            it('handles missing image handlers gracefully', () => {
                const images = buildImages(imageCount, 'img');
                const imageProps = createImageProps(images);

                renderComponent(imageProps);

                expect(getImageHandlersCount()).toHaveTextContent(imageCount.toString());
                const summary = parseJson<any[]>(getImageHandlersSummary().textContent, []);
                expect(summary).toEqual(expect.arrayContaining(buildHandlersSummaryExpectation(images, false)));
            });

            it('passes correct image values to handlers', () => {
                const images = buildImages(imageCount);
                const imageProps = createImageProps(images);

                renderComponent(imageProps);

                const config = parseJsonFromTestId<any>('image-config', {});
                expectImageConfigMatches(config, expectedConfig);
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
                const images = buildImages(imageCount);
                const imageProps = createImageProps(images);

                renderComponent(imageProps);

                expect(getImagesCount()).toHaveTextContent(imageCount.toString());
                expect(getImagesJson()).toHaveTextContent(JSON.stringify(images));
            });

            it('handles partial image values', () => {
                const images = buildAlternatingImages(imageCount);
                const imageProps = createImageProps(images);

                renderComponent(imageProps);

                expect(getImagesCount()).toHaveTextContent(imageCount.toString());
                expect(getNonEmptyImagesCount()).toHaveTextContent(Math.ceil(imageCount / 2).toString());
                expect(getImagesJson()).toHaveTextContent(JSON.stringify(images));
            });
        });
    });
}
