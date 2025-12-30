import { render } from '@testing-library/react';
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

describe('QuadImagesBottom branch coverage', () => {
    const baseProps: QuadImagesBottomProps = {
        title: 'Test Title',
        description: 'Test Description',
        image1: 'img1.png',
        image2: 'img2.png',
        image3: 'img3.png',
        image4: 'img4.png',
        isTemplate: false,
        isEditable: false,
    };

    it('renders with isTemplate=true', () => {
        render(<QuadImagesBottom {...baseProps} isTemplate={true} />);
    });

    it('renders with isEditable=true', () => {
        render(<QuadImagesBottom {...baseProps} isEditable={true} />);
    });

    it('renders with only one, two, or three images', () => {
        render(<QuadImagesBottom {...baseProps} image2={''} image3={''} image4={''} />);
        render(<QuadImagesBottom {...baseProps} image1={''} image3={''} image4={''} />);
        render(<QuadImagesBottom {...baseProps} image1={''} image2={''} image4={''} />);
        render(<QuadImagesBottom {...baseProps} image1={''} image2={''} image3={''} />);
    });

    it('renders with no images', () => {
        render(<QuadImagesBottom {...baseProps} image1={''} image2={''} image3={''} image4={''} />);
    });

    it('renders with no title/description', () => {
        render(<QuadImagesBottom {...baseProps} title={''} description={''} />);
    });
});
