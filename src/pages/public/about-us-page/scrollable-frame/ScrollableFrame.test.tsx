import { render, screen, waitFor } from '@testing-library/react';
import { ScrollableFrame } from './ScrollableFrame';
import { useDataFetch } from '@hooks/common/use-data-fetch/useDataFetch';
import programsPageUk from '@locales/uk/programs.json';

jest.mock('@components/public/program-card/ProgramCard', () => ({
    ProgramCard: ({ program }: { program: any }) => (
        <div data-testid="program-card">{program.name || program.title}</div>
    ),
}));
jest.mock('@hooks/common/use-data-fetch/useDataFetch');

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

    it('renders loader when isLoading is true', () => {
        (useDataFetch as jest.Mock).mockReturnValue({
            data: null,
            isLoading: true,
            error: null,
        });

        render(<ScrollableFrame />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('renders error message when error exists', async () => {
        (useDataFetch as jest.Mock).mockReturnValue({
            data: null,
            isLoading: false,
            error: new Error('Failed to fetch'),
        });

        render(<ScrollableFrame />);

        await waitFor(() => {
            const alert = screen.getByRole('alert');
            expect(alert).toHaveTextContent(programsPageUk['FAILED_TO_LOAD_THE_PROGRAMS']);
        });

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    it('renders Swiper with program cards when data is loaded', async () => {
        const mockData = {
            programsData: [
                { id: 1, name: 'Program 1' },
                { id: 2, name: 'Program 2' },
                { id: 3, name: 'Program 3' },
            ],
        };

        (useDataFetch as jest.Mock).mockReturnValue({
            data: mockData,
            isLoading: false,
            error: null,
        });

        render(<ScrollableFrame />);

        const swiper = screen.getByTestId('swiper');
        expect(swiper).toBeInTheDocument();

        const cards = screen.getAllByTestId('program-card');
        expect(cards.length).toBe(mockData.programsData.length);

        mockData.programsData.forEach((program) => {
            expect(screen.getByText(program.name)).toBeInTheDocument();
        });

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
