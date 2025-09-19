import { render, screen } from '@testing-library/react';
import { MainValues } from './MainValue';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { ContentType } from '../../../../types/common/about-us';
import { AboutUsContent } from '../../../../types/public/about-us-page';

describe('MainValues component', () => {
    const Content: AboutUsContent[] = [
        {
            contentType: ContentType.Card,
            description: 'Description number 1',
            image: {
                id: null,
                url: 'card1.jpg',
                mimeType: 'image.jpeg',
            },
            id: 1,
            title: null,
        },
        {
            contentType: ContentType.Card,
            image: {
                id: null,
                url: 'card2.jpg',
                mimeType: 'image.jpeg',
            },
            description: 'Description number 2',
            id: 2,
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

    it('should render main title with correct parts and highlights', () => {
        render(<MainValues />);
        expect(screen.getByText(/Головна /i)).toBeInTheDocument();
        expect(screen.getByText(/цінність/i)).toBeInTheDocument();
        expect(screen.getByText(/Victory Center/i)).toBeInTheDocument();
        expect(screen.getByText(/це люди/i)).toBeInTheDocument();
    });

    it('should render correct default people cards', () => {
        const contentWithoutImages: AboutUsContent[] = JSON.parse(JSON.stringify(Content));
        contentWithoutImages.forEach((x) => (x.image = null));

        render(<MainValues content={contentWithoutImages} />);
        const cards = screen.getAllByTestId('swiper-slide');
        expect(cards).toHaveLength(3);

        for (let i = 0; i < cards.length; i++) {
            const image = ABOUT_US_DATA.PEOPLE_DATA[i].ALT;
            expect(screen.getByAltText(image)).toHaveAttribute('src', ABOUT_US_DATA.PEOPLE_DATA[i].IMG);
        }
    });

    it('should render correct custom people cards', () => {
        render(<MainValues content={Content} />);
        const cards = screen.getAllByRole('img');
        expect(cards.length).toBe(3);

        for (let i = 0; i < cards.length; i++) {
            const image = screen.getByAltText(ABOUT_US_DATA.PEOPLE_DATA[i].ALT);
            const description = screen.getByText(`${Content[i].description}`);
            expect(image).toHaveAttribute('src', Content[i].image?.url);
            expect(description).toBeInTheDocument();
        }
    });

    it('should render summary block with correct lines', () => {
        render(<MainValues />);
        expect(screen.getByText(/Ми віримо в силу спільноти, в якій кожен голос /i)).toBeInTheDocument();
        expect(screen.getByText(/важливий, а кожен крок - наближує до спільної /i)).toBeInTheDocument();
        expect(screen.getByText(/перемоги./i)).toBeInTheDocument();
    });
});
