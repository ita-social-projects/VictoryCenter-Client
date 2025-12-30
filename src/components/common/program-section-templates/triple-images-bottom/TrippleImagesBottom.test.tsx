import { TripleImagesBottom, TripleImagesBottomProps } from './TripleImagesBottom';
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

createImagesBottomTestSuite<TripleImagesBottomProps>({
    componentName: 'TripleImagesBottom',
    variant: 'triple',
    imageCount: 3,
    Component: TripleImagesBottom,
    createDefaultProps: () => ({
        title: '',
        description: '',
        image1: '',
        image2: '',
        image3: '',
        isTemplate: false,
        isEditable: false,
    }),
    createImageProps: (images) => ({
        image1: images[0] || '',
        image2: images[1] || '',
        image3: images[2] || '',
    }),
    createImageHandlers: (handlers) => ({
        onImage1Change: handlers[0],
        onImage2Change: handlers[1],
        onImage3Change: handlers[2],
    }),
    expectedConfig: {
        imageCount: 3,
        gridColumns: 3,
        elevatedIndices: [0, 2],
        editableGridColumns: 4,
        editableImageMaxHeight: 480,
        editableImageMaxWidth: 480,
    },
});
