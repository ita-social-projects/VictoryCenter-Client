import { DualImagesBottom, DualImagesBottomProps } from './DualImagesBottom';
import { createImagesBottomTestSuite } from '../shared/test-utils/imagesBottomTestFactory';
import { render } from '@testing-library/react';

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

describe('DualImagesBottom branch coverage', () => {
    const baseProps: DualImagesBottomProps = {
        title: 'Test Title',
        description: 'Test Description',
        image1: 'img1.png',
        image2: 'img2.png',
        isTemplate: false,
        isEditable: false,
    };

    it('renders with isTemplate=true', () => {
        render(<DualImagesBottom {...baseProps} isTemplate={true} />);
    });

    it('renders with isEditable=true', () => {
        render(<DualImagesBottom {...baseProps} isEditable={true} />);
    });

    it('renders with only one image', () => {
        render(<DualImagesBottom {...baseProps} image2={''} />);
        render(<DualImagesBottom {...baseProps} image1={''} />);
    });

    it('renders with no images', () => {
        render(<DualImagesBottom {...baseProps} image1={''} image2={''} />);
    });

    it('renders with no title/description', () => {
        render(<DualImagesBottom {...baseProps} title={''} description={''} />);
    });
});
