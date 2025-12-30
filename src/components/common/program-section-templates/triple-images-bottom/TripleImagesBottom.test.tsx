import { render } from '@testing-library/react';
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

describe('TripleImagesBottom branch coverage', () => {
    const baseProps: TripleImagesBottomProps = {
        title: 'Test Title',
        description: 'Test Description',
        image1: 'img1.png',
        image2: 'img2.png',
        image3: 'img3.png',
        isTemplate: false,
        isEditable: false,
    };

    it('renders with isTemplate=true', () => {
        render(<TripleImagesBottom {...baseProps} isTemplate={true} />);
    });

    it('renders with isEditable=true', () => {
        render(<TripleImagesBottom {...baseProps} isEditable={true} />);
    });

    it('renders with only one or two images', () => {
        render(<TripleImagesBottom {...baseProps} image2={''} image3={''} />);
        render(<TripleImagesBottom {...baseProps} image1={''} image3={''} />);
        render(<TripleImagesBottom {...baseProps} image1={''} image2={''} />);
    });

    it('renders with no images', () => {
        render(<TripleImagesBottom {...baseProps} image1={''} image2={''} image3={''} />);
    });

    it('renders with no title/description', () => {
        render(<TripleImagesBottom {...baseProps} title={''} description={''} />);
    });
});
