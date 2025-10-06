import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScrollableFrame } from './ScrollableFrame';
import * as dataFetch from '../../../../services/api/public/programs/programs-api';
import { FAILED_TO_LOAD_THE_PROGRAMS } from '../../../../const/public/programs-page';
import { mockPrograms } from '../../../../utils/mock-data/public/programs-page';

jest.mock('../../../../components/public/program-card/ProgramCard', () => ({
    ProgramCard: ({ program }: { program: any }) => (
        <div data-testid="program-card">{program.name || program.title}</div>
    ),
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

describe('ScrollableFrame', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
