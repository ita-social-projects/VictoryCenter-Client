import { QuadImagesBottom, QuadImagesBottomProps } from './QuadImagesBottom';
import { createImagesBottomTestSuite } from '../shared/test-utils/imagesBottomTestFactory';

jest.mock('../shared/title-description-section/TitleDescriptionSection', () => {
    const { mockTitleDescriptionSection } = require('../shared/test-utils/imagesBottomTestMocks');
    return {
        TitleDescriptionSection: mockTitleDescriptionSection,
    };
});

jest.mock('../shared/images-bottom-section/ImagesBottomSection', () => {
    const { mockImagesBottomSection } = require('../shared/test-utils/imagesBottomTestMocks');
    return {
        ImagesBottomSection: mockImagesBottomSection,
    };
});

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
