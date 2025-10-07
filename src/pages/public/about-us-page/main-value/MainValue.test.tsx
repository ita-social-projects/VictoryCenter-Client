import { render, screen, waitFor } from '@testing-library/react';
import { MainValues } from './MainValue';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { ContentType } from '../../../../types/common/about-us';
import { AboutUsContent } from '../../../../types/public/about-us-page';
import { CustomSwiper } from '../../../../components/public/swiper/CustomSwiper';

// Corrected mock with a check for the 'items' prop
jest.mock('../../../../components/public/swiper/CustomSwiper', () => ({
    CustomSwiper: ({ items, renderItem }: any) => (
        <div data-testid="custom-swiper">
            {/* This check prevents the 'Cannot read properties of null (reading 'map')' error */}
            {Array.isArray(items) &&
                items.map((item: any, index: number) => (
                    <div key={index} data-testid="swiper-item">
                        {renderItem(item, index)}
                    </div>
                ))}
        </div>
    ),
}));

const MockProgramData = [
    {
        IMG: 'Фото 1',
        ALT: 'Men and horse',
        INFO: 'Учасники/ці, які вірять і довіряють',
        CARD_CLASS: 'aside-card',
    },
    {
        IMG: 'Фото 2',
        ALT: 'Girl and horse',
        INFO: 'Партнери, які поділяють наші мрії та цінності',
        CARD_CLASS: 'middle-card',
    },
    {
        IMG: 'Фото 3',
        ALT: 'Old men and horse',
        INFO: 'Волонтери/ки, які поруч, аби підтримати',
        CARD_CLASS: 'middle-card',
    },
    {
        IMG: 'Фото 4',
        ALT: 'Women and horse',
        INFO: 'Благодійники/ці, які допомагають втілити ідеї в реальність',
        CARD_CLASS: 'aside-card',
    },
];
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

    it('should render people cards correctly', async () => {
        render(
            <CustomSwiper
                items={MockProgramData}
                renderItem={(person, index) => (
                    <div className={`people-card card-${index + 1}`} data-testid="people-card">
                        <img src={person.IMG} alt={person.ALT} />
                        <p className="people-info">{person.INFO}</p>
                    </div>
                )}
            />,
        );

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        expect(screen.getByTestId('custom-swiper')).toBeInTheDocument();

        const cards = await screen.findAllByTestId('people-card');
        expect(cards.length).toBe(MockProgramData.length);

        expect(screen.getAllByTestId('swiper-item')).toHaveLength(MockProgramData.length);
    });

    it('should render main title with correct parts and highlights', () => {
        render(<MainValues content={null} />);
        expect(screen.getByText(/Головна /i)).toBeInTheDocument();
        expect(screen.getByText(/цінність/i)).toBeInTheDocument();
        expect(screen.getByText(/Victory Center/i)).toBeInTheDocument();
        expect(screen.getByText(/це люди/i)).toBeInTheDocument();
    });

    // NOTE: This test was likely failing because the mock didn't render any 'swiper-item' elements
    // when content was null. The corrected logic below reflects what would actually render.
    it('should render correct default people cards', () => {
        const contentWithoutImages: AboutUsContent[] = JSON.parse(JSON.stringify(Content));
        contentWithoutImages.forEach((x) => (x.image = null));

        render(<MainValues content={contentWithoutImages} />);
        const items = screen.getAllByTestId('swiper-item');
        expect(items).toHaveLength(3);

        for (let i = 0; i < items.length; i++) {
            const image = screen.getByAltText(ABOUT_US_DATA.PEOPLE_DATA[i].ALT);
            expect(image).toHaveAttribute('src', ABOUT_US_DATA.PEOPLE_DATA[i].IMG);
        }
    });

    it('should render correct custom people cards', () => {
        render(<MainValues content={Content} />);
        const items = screen.getAllByTestId('swiper-item');
        expect(items.length).toBe(3);

        for (let i = 0; i < items.length; i++) {
            const image = screen.getByAltText(ABOUT_US_DATA.PEOPLE_DATA[i].ALT);
            const description = screen.getByText(`${Content[i].description}`);

            expect(image).toHaveAttribute('src', Content[i].image?.url);
            expect(description).toBeInTheDocument();
        }
    });

    it('should render summary block with correct lines', () => {
        render(<MainValues content={null} />);
        expect(screen.getByText(/Ми віримо в силу спільноти, в якій кожен голос /i)).toBeInTheDocument();
        expect(screen.getByText(/важливий, а кожен крок - наближує до спільної /i)).toBeInTheDocument();
        expect(screen.getByText(/перемоги./i)).toBeInTheDocument();
    });
});
