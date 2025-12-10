import { render, screen } from '@testing-library/react';
import { MainValues } from './MainValue';
import { ABOUT_US_DATA } from '@/const/public/about-us-page';
import { ContentType } from '@/types/common/about-us';
import { AboutUsContent } from '@/types/public/about-us-page';
import { checkForSubstrings } from '@/utils/functions/test-helpers/test-helpers';
import { aboutUsPageUk } from '@/locales/uk';

jest.mock('@/components/public/swiper/Swiper', () => ({
    Swiper: ({ items, renderItem }: any) => (
        <div data-testid="custom-swiper">
            {items &&
                items.map((item: any, index: number) => (
                    <div key={index} data-testid="swiper-item">
                        {renderItem(item, index)}
                    </div>
                ))}
        </div>
    ),
}));

describe('MainValues component', () => {
    const Content: AboutUsContent[] = [
        {
            contentType: ContentType.Card,
            description: 'Description number 1',
            image: {
                id: 1,
                url: 'card1.jpg',
                mimeType: 'image.jpeg',
            },
            id: 1,
            title: null,
        },
        {
            contentType: ContentType.Card,
            image: {
                id: 2,
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
                id: 2,
                url: 'card3.jpg',
                mimeType: 'image.jpeg',
            },
            description: 'Description number 3',
            id: 3,
            title: null,
        },
    ];

    it('should render main title with correct parts and highlights', () => {
        render(<MainValues content={null} />);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE.FIRST_PART']);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE.FIRST_HIGHLIGHT']);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE.MIDDLE_PART']);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE.SECOND_HIGHLIGHT']);
    });

    it('should render correct default people cards', () => {
        const contentWithoutImages: AboutUsContent[] = JSON.parse(JSON.stringify(Content));
        contentWithoutImages.forEach((x) => (x.image = null));

        render(<MainValues content={contentWithoutImages} />);
        const items = screen.getAllByTestId('swiper-item');
        expect(items).toHaveLength(contentWithoutImages.length);

        for (let i = 0; i < items.length; i++) {
            const image = screen.getByAltText(aboutUsPageUk.PEOPLE_DATA[i].ALT);
            expect(image).toHaveAttribute('src', ABOUT_US_DATA.PEOPLE_DATA[i].IMG);
        }
    });

    it('should render correct custom people cards', () => {
        render(<MainValues content={Content} />);
        const items = screen.getAllByTestId('swiper-item');
        expect(items.length).toBe(Content.length);

        for (let i = 0; i < items.length; i++) {
            const image = screen.getByAltText(aboutUsPageUk.PEOPLE_DATA[i].ALT);
            const description = screen.getByText(`${Content[i].description}`);

            expect(image).toHaveAttribute('src', Content[i].image?.url);
            expect(description).toBeInTheDocument();
        }
    });

    it('should render summary block with correct lines', () => {
        render(<MainValues content={null} />);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE_DETAILS']);
    });
});
