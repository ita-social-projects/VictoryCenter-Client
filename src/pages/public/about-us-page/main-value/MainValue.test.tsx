import { render, screen, waitFor } from '@testing-library/react';
import { MainValues } from './MainValue';
import aboutUsPageUk from '../../../../locales/uk/about-us.json';
import { checkForSubstrings } from '../../../../utils/functions/test-helpers/test-helpers';
import { Swiper } from '../../../../components/public/swiper/Swiper';
import { ABOUT_US_DATA } from '../../../../const/public/about-us-page';

jest.mock('../../../../components/public/swiper/Swiper', () => ({
    Swiper: ({ items, renderItem }: any) => (
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
        ALT: 'Men and horse',
        INFO: 'Учасники/ці, які вірять і довіряють',
        CARD_CLASS: 'aside-card',
    },
    {
        ALT: 'Girl and horse',
        INFO: 'Партнери, які поділяють наші мрії та цінності',
        CARD_CLASS: 'middle-card',
    },
    {
        ALT: 'Old men and horse',
        INFO: 'Волонтери/ки, які поруч, аби підтримати',
        CARD_CLASS: 'middle-card',
    },
    {
        ALT: 'Women and horse',
        INFO: 'Благодійники/ці, які допомагають втілити ідеї в реальність',
        CARD_CLASS: 'aside-card',
    },
];
describe('MainValues component', () => {
    it('should render people cards correctly', async () => {
        render(
            <Swiper
                items={MockProgramData}
                renderItem={(person, index) => (
                    <div className={`people-card card-${index + 1}`} data-testid="people-card">
                        <img src={ABOUT_US_DATA.PEOPLE_DATA[index].IMG} alt={person.ALT} />
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
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE.FIRST_PART']);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE.FIRST_HIGHLIGHT']);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE.MIDDLE_PART']);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE.SECOND_HIGHLIGHT']);
    });

    it('should render correct number of people cards', () => {
        render(<MainValues />);
        const cards = screen.getAllByRole('img');
        expect(cards.length).toBe(aboutUsPageUk.PEOPLE_DATA.length);
    });

    it('should render correct people info texts', () => {
        render(<MainValues />);
        aboutUsPageUk.PEOPLE_DATA.forEach(({ INFO }) => {
            expect(screen.getByText(INFO)).toBeInTheDocument();
        });
    });

    it('should render summary block with correct lines', () => {
        render(<MainValues />);
        checkForSubstrings(aboutUsPageUk['MAIN_VALUE_DETAILS']);
    });
});
