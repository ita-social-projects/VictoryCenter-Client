import { render, screen, waitFor } from '@testing-library/react';
import { ScrollableFrame } from './ScrollableFrame';
import * as dataFetch from '../../../../utils/mock-data/public/program-page/programs-page';
import { FAILED_TO_LOAD_THE_PROGRAMS } from '../../../../const/public/programs-page';

jest.mock('../../../../assets/icons/arrow-left-white.svg', () => 'arrow-left.png');
jest.mock('../../../../assets/icons/arrow-right-white.svg', () => 'arrow-right.png');
jest.mock('../../../../assets/icons/arrow-left.svg', () => 'arrow-left-black.png');
jest.mock('../../../../assets/icons/arrow-right.svg', () => 'arrow-right-black.png');

jest.mock('../../../../pages/public/program-page/program-section/program-card/ProgramCard', () => ({
    ProgramCard: ({ program }: { program: any }) => <div data-testid="program-card">{program.title}</div>,
}));

jest.mock('swiper/react', () => {
    return {
        Swiper: (props: any) => {
            if (props.onSwiper) {
                props.onSwiper({
                    slideNext: jest.fn(),
                    slidePrev: jest.fn(),
                });
            }
            return <div data-testid="swiper">{props.children}</div>;
        },
        SwiperSlide: (props: any) => <div data-testid="swiper-slide">{props.children}</div>,
    };
});

const MockProgramData = [
    {
        image: 'firstImg',
        title: 'Коні лікують Літо 2025',
        subtitle: 'Ветеранська програма',
        description: 'Зменшення рівня стресу, тривоги та ПТСР у ветеранів...',
    },
    {
        image: 'secondImg',
        title: 'Програма 2',
        subtitle: 'Ветеранська програма',
        description: 'Опис 2',
    },
    {
        image: 'thirdImg',
        title: 'Програма 3',
        subtitle: 'Ветеранська програма',
        description: 'Опис 3',
    },
];

describe('ScrollableFrame', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render programs correctly', async () => {
        jest.spyOn(dataFetch, 'programPageDataFetch').mockResolvedValue({
            programData: MockProgramData,
        });

        render(<ScrollableFrame />);

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        const cards = await screen.findAllByTestId('program-card');
        expect(cards.length).toBe(MockProgramData.length);
        expect(cards[0]).toHaveTextContent('Коні лікують Літо 2025');
    });

    it('should show message about fetch error', async () => {
        jest.spyOn(dataFetch, 'programPageDataFetch').mockRejectedValue(new Error('Fetch error'));

        render(<ScrollableFrame />);

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(FAILED_TO_LOAD_THE_PROGRAMS);
        });

        expect(screen.queryAllByTestId('program-card').length).toBe(0);
    });
});
