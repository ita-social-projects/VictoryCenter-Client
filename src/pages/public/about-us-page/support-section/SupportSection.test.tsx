import { render, screen } from '@testing-library/react';
import { SupportSection } from './SupportSection';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { ContentType } from '../../../../types/common/about-us';
import { AboutUsContent } from '../../../../types/public/about-us-page';

describe('SupportSection component', () => {
    const Content: AboutUsContent[] = [
        {
            contentType: ContentType.Card,
            title: null,
            id: 1,
            image: {
                id: null,
                url: 'card1.jpg',
                mimeType: 'image.jpeg',
            },
            description: 'Description number 1',
        },
        {
            contentType: ContentType.Card,
            description: 'Description number 2',
            id: 2,
            image: {
                id: null,
                url: 'card2.jpg',
                mimeType: 'image.jpeg',
            },
            title: null,
        },
        {
            contentType: ContentType.Card,
            image: {
                id: null,
                url: 'card3.jpg',
                mimeType: 'image.jpeg',
            },
            description: 'Description number 3',
            id: 3,
            title: null,
        },
    ];

    it('renders section title', () => {
        render(<SupportSection content={Content} />);
        expect(screen.getByText(ABOUT_US_DATA.SUPPORT_TITLE)).toBeInTheDocument();
    });

    it('renders all default images', () => {
        const contentWithoutImages: AboutUsContent[] = JSON.parse(JSON.stringify(Content));
        contentWithoutImages.forEach((x) => (x.image = null));

        render(<SupportSection content={contentWithoutImages} />);

        const cards = screen.getAllByTestId('swiper-slide');
        for (let i = 0; i < cards.length; i++) {
            expect(screen.getByAltText(`${ABOUT_US_DATA.SUPPORT_DATA[i].ALT}`)).toHaveAttribute(
                'src',
                ABOUT_US_DATA.SUPPORT_DATA[i].IMG,
            );
        }
    });

    it('renders all cards correctly', () => {
        render(<SupportSection content={Content} />);

        const cards = screen.getAllByTestId('swiper-slide');
        for (let i = 0; i < cards.length; i++) {
            const image = screen.getByAltText(`${ABOUT_US_DATA.SUPPORT_DATA[i].ALT}`);
            const description = screen.getByText(`${Content[i].description}`);

            expect(image).toHaveAttribute('src', Content[i].image?.url);
            expect(description).toBeInTheDocument();
        }
    });
});
