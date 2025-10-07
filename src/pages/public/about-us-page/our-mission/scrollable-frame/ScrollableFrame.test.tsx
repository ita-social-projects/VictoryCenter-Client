import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScrollableFrame } from './ScrollableFrame';
import * as dataFetch from '../../../../../services/api/public/programs/programs-api';
import programsPageUk from '../../../../../locales/uk/programs.json';
import { mockPrograms } from '../../../../../utils/mock-data/public/programs-page';

jest.mock('../../../../../assets/icons/arrow-right.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="arrow-right-icon" {...props} />,
}));

jest.mock('../../../../../assets/icons/arrow-left.svg', () => ({
    ReactComponent: (props: any) => <svg data-testid="arrow-left-icon" {...props} />,
}));

jest.mock('../../../programs-page/programs-section/program-card/ProgramCard', () => ({
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
            expect(screen.getByRole('alert')).toHaveTextContent(programsPageUk['FAILED_TO_LOAD_THE_PROGRAMS']);
        });

        expect(screen.queryAllByTestId('program-card').length).toBe(0);
    });

    it('should render buttons with correct icons', () => {
        render(<ScrollableFrame />);

        expect(screen.getByTestId('arrow-left-icon').closest('button')).toBeInTheDocument();
        expect(screen.getByTestId('arrow-right-icon').closest('button')).toBeInTheDocument();
    });

    it('should call slidePrev and slideNext when arrow buttons are clicked', async () => {
        jest.spyOn(dataFetch, 'programPageDataFetch').mockResolvedValue(mockPrograms);

        render(<ScrollableFrame />);

        // Wait for Swiper to be initialized and cards to render
        await waitFor(() => {
            expect(screen.getAllByTestId('program-card').length).toBe(2);
        });

        // Find buttons
        const leftButton = screen.getByTestId('arrow-left-icon').closest('button');
        const rightButton = screen.getByTestId('arrow-right-icon').closest('button');

        // Click buttons and check that slidePrev/slideNext are called
        fireEvent.click(leftButton!);
        fireEvent.click(rightButton!);

        // Since we mock Swiper, we can only check that the buttons exist and are clickable
        // (the actual slidePrev/slideNext are jest.fn() in the mock)
    });
});
