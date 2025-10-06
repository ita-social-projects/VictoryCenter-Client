import { render, screen } from '@testing-library/react';
import { SupportSectionResponsive } from './SupportSectionResponsive';
import { ABOUT_US_DATA } from '../../../../../const/public/about-us-page';
import { ContentType } from '../../../../../types/common/about-us';
import { AboutUsContent } from '../../../../../types/public/about-us-page';

describe('SupportSectionResponsive component', () => {
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

    it('renders main support title', () => {
        render(<SupportSectionResponsive content={content} />);
        expect(screen.getByText(ABOUT_US_DATA.SUPPORT_TITLE)).toBeInTheDocument();
    });

    it('renders all images with correct alt and src attributes', () => {
        render(<SupportSectionResponsive content={content} />);

        ABOUT_US_DATA.SUPPORT_DATA.forEach((data, index) => {
            const image = screen.getByAltText(data.ALT);
            expect(image).toHaveAttribute('src', content[index].image?.url);
        });
    });

    it('renders fallback images when image is null', () => {
        const contentWithoutImages = content.map((item) => ({ ...item, image: null }));
        render(<SupportSectionResponsive content={contentWithoutImages} />);

        ABOUT_US_DATA.SUPPORT_DATA.forEach((data) => {
            const image = screen.getByAltText(data.ALT);
            expect(image).toHaveAttribute('src', data.IMG);
        });
    });

    it('renders all descriptions correctly', () => {
        render(<SupportSectionResponsive content={content} />);
        content.forEach((item) => {
            expect(screen.getByText(item.description!)).toBeInTheDocument();
        });
    });

    it('renders nothing when content is null', () => {
        const { container } = render(<SupportSectionResponsive content={null} />);
        expect(container.firstChild).toBeNull();
    });
});
