import { render, screen, waitFor } from '@testing-library/react';
import { ScrollableFrame } from './ScrollableFrame';
import { useDataFetch } from '../../../../hooks/common/use-data-fetch/useDataFetch';
import programsPageUk from '../../../../locales/uk/programs.json';

jest.mock('../../../../components/public/program-card/ProgramCard', () => ({
    ProgramCard: ({ program }: { program: any }) => (
        <div data-testid="program-card">{program.name || program.title}</div>
    ),
}));
jest.mock('../../../../hooks/common/use-data-fetch/useDataFetch');

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
        (useDataFetch as jest.Mock).mockReturnValue({
            data: null,
            isLoading: false,
            error: new Error('Failed to fetch'),
        });

        render(<ScrollableFrame />);

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(programsPageUk['FAILED_TO_LOAD_THE_PROGRAMS']);
        });

        expect(screen.queryAllByTestId('program-card').length).toBe(0);
    });
});
