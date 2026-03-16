import { TripleImagesBottom, TripleImagesBottomProps } from './TripleImagesBottom';
import { createImagesBottomTestSuite } from '../shared/test-utils/imagesBottomTestFactory';
import { ProgramSectionMode } from '@/types/common/program-sections';

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
    imageCount: 3,
    Component: TripleImagesBottom,
    createDefaultProps: () => ({
        title: '',
        description: '',
        images: [null, null, null],
        mode: ProgramSectionMode.View,
    }),
    createImageProps: (images) => ({ images }),
    createImageHandlers: (handlers) => ({
        onImagesChange: (index, file) => handlers[index]?.(file),
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
