import { DualImagesBottom, DualImagesBottomProps } from './DualImagesBottom';
import { createImagesBottomTestSuite } from '../shared/test-utils/imagesBottomTestFactory';
import { SectionMode } from '@/types/common/sections';

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
    imageCount: 2,
    Component: DualImagesBottom,
    createDefaultProps: () => ({
        title: '',
        description: '',
        images: [null, null],
        mode: SectionMode.View,
    }),
    createImageProps: (images) => ({ images }),
    createImageHandlers: (handlers) => ({
        onImagesChange: (index, file) => handlers[index]?.(file),
    }),
    expectedConfig: {
        imageCount: 2,
        gridColumns: 2,
        elevatedIndices: [0],
        editableImageMaxHeight: 430,
        editableImageMaxWidth: 730,
    },
});
