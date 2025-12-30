import React from 'react';
import { QuadImagesBottom, QuadImagesBottomProps } from './QuadImagesBottom';
import { createImagesBottomTestSuite } from '../shared/test-utils/imagesBottomTestFactory';

// Mock the shared components
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
    }) => (
        <div data-testid="title-description-section" data-title={title} data-description={description}>
            {isTemplate && <span data-testid="template-flag">template</span>}
            {isEditable && <span data-testid="editable-flag">editable</span>}
        </div>
    ),
}));

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
    }: any) => (
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

createImagesBottomTestSuite<QuadImagesBottomProps>({
    componentName: 'QuadImagesBottom',
    variant: 'quad',
    imageCount: 4,
    Component: QuadImagesBottom,
    createDefaultProps: () => ({
        title: '',
        description: '',
        image1: '',
        image2: '',
        image3: '',
        image4: '',
        isTemplate: false,
        isEditable: false,
    }),
    createImageProps: (images) => ({
        image1: images[0] || '',
        image2: images[1] || '',
        image3: images[2] || '',
        image4: images[3] || '',
    }),
    createImageHandlers: (handlers) => ({
        onImage1Change: handlers[0],
        onImage2Change: handlers[1],
        onImage3Change: handlers[2],
        onImage4Change: handlers[3],
    }),
    expectedConfig: {
        imageCount: 4,
        gridColumns: 4,
        elevatedIndices: [1, 3],
        editableGridColumns: 4,
        editableImageMaxHeight: 390,
        editableImageMaxWidth: 360,
    },
});
