import { render, screen, waitFor } from '@testing-library/react';
import { ScrollableFrame } from './ScrollableFrame';
import * as dataFetch from '../../../../services/api/public/programs/programs-api';
import { FAILED_TO_LOAD_THE_PROGRAMS } from '../../../../const/public/programs-page';

jest.mock('../../../../../assets/icons/arrow-right.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="arrow-right-icon" {...props} />,
}));

jest.mock('../../../../../assets/icons/arrow-left.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="arrow-left-icon" {...props} />,
}));

jest.mock('./program-card/ProgramCard', () => ({
    ProgramCard: ({ program }: { program: any }) => <div data-testid="program-card">{program.title}</div>,
}));

jest.mock('swiper/react', () => {
    const React = require('react');
    return {
        Swiper: ({ children, onSwiper }: any) => {
            React.useEffect(() => {
                if (onSwiper) {
                    onSwiper({
                        params: { slidesPerView: 1 },
                        slides: [{}, {}, {}],
                        isBeginning: true,
                        isEnd: false,
                        on: jest.fn(),
                        slideNext: jest.fn(),
                        slidePrev: jest.fn(),
                    });
                }
            }, [onSwiper]);
            return <div data-testid="swiper">{children}</div>;
        },
        SwiperSlide: ({ children }: any) => <div data-testid="swiper-slide">{children}</div>,
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

    it('should render buttons with correct icons', () => {
        render(<ScrollableFrame />);

        expect(screen.getByTestId('arrow-left-icon').closest('button')).toBeInTheDocument();
        expect(screen.getByTestId('arrow-right-icon').closest('button')).toBeInTheDocument();
    });
});
