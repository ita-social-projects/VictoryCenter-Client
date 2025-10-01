import { render, screen, waitFor } from '@testing-library/react';
import { MainValues } from './MainValue';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';
import { CustomSwiper } from '../../../../components/public/swiper/CustomSwiper';

jest.mock('../../../../components/public/swiper/CustomSwiper', () => ({
    CustomSwiper: ({ items, renderItem }: any) => (
        <div data-testid="custom-swiper">
            {items.map((item: any, index: number) => (
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
        render(<MainValues />);
        expect(screen.getByText(/Головна /i)).toBeInTheDocument();
        expect(screen.getByText(/цінність/i)).toBeInTheDocument();
        expect(screen.getByText(/Victory Center/i)).toBeInTheDocument();
        expect(screen.getByText(/це люди/i)).toBeInTheDocument();
    });

    it('should render correct number of people cards', () => {
        render(<MainValues />);
        const cards = screen.getAllByRole('img');
        expect(cards.length).toBe(ABOUT_US_DATA.PEOPLE_DATA.length);
    });

    it('should render correct people info texts', () => {
        render(<MainValues />);
        ABOUT_US_DATA.PEOPLE_DATA.forEach(({ INFO }) => {
            expect(screen.getByText(INFO)).toBeInTheDocument();
        });
    });

    it('should render summary block with correct lines', () => {
        render(<MainValues />);
        expect(screen.getByText(/Ми віримо в силу спільноти, в якій кожен голос /i)).toBeInTheDocument();
        expect(screen.getByText(/важливий, а кожен крок - наближує до спільної /i)).toBeInTheDocument();
        expect(screen.getByText(/перемоги./i)).toBeInTheDocument();
    });
});
