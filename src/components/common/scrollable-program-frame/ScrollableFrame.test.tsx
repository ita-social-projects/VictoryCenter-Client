import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ScrollableFrame } from './ScrollableFrame';
import * as dataFetch from '../../../services/data-fetch/program-page-data-fetch/program-page-data-fetch';

jest.mock('../../../assets/about-us-images/icons/arrow-left.png', () => 'arrow-left.png');
jest.mock('../../../assets/about-us-images/icons/arrow-right.png', () => 'arrow-right.png');
jest.mock('../../../assets/about-us-images/icons/arrow-left-black.png', () => 'arrow-left-black.png');
jest.mock('../../../assets/about-us-images/icons/arrow-right-black.png', () => 'arrow-right-black.png');

jest.mock('../../../pages/program-page/program-page/program-section/program-card/ProgramCard', () => ({
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
            expect(screen.getByRole('alert')).toHaveTextContent(
                'Не вдалося завантажити дані програм. Будь-ласка спробуйте пізніше.',
            );
        });

        expect(screen.queryAllByTestId('program-card').length).toBe(0);
    });
});
