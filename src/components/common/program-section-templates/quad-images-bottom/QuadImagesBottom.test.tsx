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
        images: ['', '', '', ''],
        isTemplate: false,
        isEditable: false,
    }),
    createImageProps: (images) => ({ images }),
    createImageHandlers: (handlers) => ({
        onImagesChange: (index, file) => handlers[index]?.(file),
    }),
    expectedConfig: {
        imageCount: 4,
        gridColumns: 4,
        elevatedIndices: [0, 2],
        editableGridColumns: 4,
        editableImageMaxHeight: 390,
        editableImageMaxWidth: 360,
    },
});
