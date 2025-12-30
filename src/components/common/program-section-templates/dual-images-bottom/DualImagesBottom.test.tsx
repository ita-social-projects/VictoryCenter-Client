import { DualImagesBottom, DualImagesBottomProps } from './DualImagesBottom';
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

createImagesBottomTestSuite<DualImagesBottomProps>({
    componentName: 'DualImagesBottom',
    variant: 'dual',
    imageCount: 2,
    Component: DualImagesBottom,
    createDefaultProps: () => ({
        title: '',
        description: '',
        image1: '',
        image2: '',
        isTemplate: false,
        isEditable: false,
    }),
    createImageProps: (images) => ({
        image1: images[0] || '',
        image2: images[1] || '',
    }),
    createImageHandlers: (handlers) => ({
        onImage1Change: handlers[0],
        onImage2Change: handlers[1],
    }),
    expectedConfig: {
        imageCount: 2,
        gridColumns: 2,
        elevatedIndices: [0],
        editableImageMaxHeight: 430,
        editableImageMaxWidth: 730,
    },
});
