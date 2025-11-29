import { render, screen } from '@testing-library/react';
import { SupportSectionTablet } from './SupportSectionTablet';
import { AboutUsContent } from '../../../../../../types/public/about-us-page';
import { ContentType } from '../../../../../../types/common/about-us';
import { ABOUT_US_DATA } from '../../../../../../const/public/about-us-page';
import { aboutUsPageUk } from '../../../../../../locales/uk';

jest.mock('../../../../../../const/public/about-us-page', () => ({
    ABOUT_US_DATA: {
        SUPPORT_TITLE: 'Support Title',
        SUPPORT_DATA: [
            {
                IMG: 'img1.jpg',
                ALT: 'Alt 1',
                DESCRIPTION: 'Description 1',
            },
            {
                IMG: 'img2.jpg',
                ALT: 'Alt 2',
                DESCRIPTION: 'Description 2',
            },
            {
                IMG: 'img3.jpg',
                ALT: 'Alt 3',
                DESCRIPTION: 'Description 3',
            },
        ],
    },
}));

describe('SupportSectionTablet component', () => {
    const content: AboutUsContent[] = [
        {
            contentType: ContentType.Card,
            title: null,
            id: 1,
            image: { id: null, url: 'card1.jpg', mimeType: 'image/jpeg' },
            description: 'Description 1',
        },
        {
            contentType: ContentType.Card,
            title: null,
            id: 2,
            image: { id: null, url: 'card2.jpg', mimeType: 'image/jpeg' },
            description: 'Description 2',
        },
        {
            contentType: ContentType.Card,
            title: null,
            id: 3,
            image: { id: null, url: 'card3.jpg', mimeType: 'image/jpeg' },
            description: 'Description 3',
        },
    ];

    const mockStylesModule = {
        'support-block': 'support-block',
        'main-values-title': 'main-values-title',
        'support-columns': 'support-columns',
        'support-col': 'support-col',
        left: 'left',
        right: 'right',
        'support-card': 'support-card',
        'card-1': 'card-1',
        'card-2': 'card-2',
        'card-3': 'card-3',
        'support-description': 'support-description',
    };

    it('should render main support title', () => {
        render(<SupportSectionTablet content={content} stylesModule={mockStylesModule} />);
        expect(screen.getByText(aboutUsPageUk.SUPPORT_TITLE)).toBeInTheDocument();
    });

    it('renders all images with correct alt and src attributes', () => {
        render(<SupportSectionTablet content={content} stylesModule={mockStylesModule} />);

        aboutUsPageUk.SUPPORT_DATA.forEach((data, index) => {
            const image = screen.getByAltText(data.ALT);
            expect(image).toHaveAttribute('src', content[index].image?.url);
        });
    });

    it('renders fallback images when image is null', () => {
        const contentWithoutImages = content.map((item) => ({ ...item, image: null }));
        render(<SupportSectionTablet content={contentWithoutImages} stylesModule={mockStylesModule} />);

        aboutUsPageUk.SUPPORT_DATA.forEach((data, index) => {
            const image = screen.getByAltText(data.ALT);
            expect(image).toHaveAttribute('src', ABOUT_US_DATA.SUPPORT_DATA[index].IMG);
        });
    });

    it('should render support card descriptions correctly', () => {
        render(<SupportSectionTablet content={content} stylesModule={mockStylesModule} />);
        content.forEach((card) => {
            expect(screen.getByText(card.description!)).toBeInTheDocument();
        });
    });

    it('renders all descriptions correctly', () => {
        render(<SupportSectionTablet content={content} stylesModule={mockStylesModule} />);
        content.forEach((item) => {
            expect(screen.getByText(item.description!)).toBeInTheDocument();
        });
    });

    it('renders nothing when content is null', () => {
        const { container } = render(<SupportSectionTablet content={null} stylesModule={mockStylesModule} />);
        expect(container.firstChild).toBeNull();
    });
});
