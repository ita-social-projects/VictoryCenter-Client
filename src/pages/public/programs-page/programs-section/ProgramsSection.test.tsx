import { ProgramsSection } from './ProgramsSection';
import { render, screen, waitFor } from '@testing-library/react';
import * as ProgramsPageFetchModule from '../../../../services/api/public/programs/programs-api';
import { PublishedProgram } from '../../../../types/public/programs-page';

const spyProgramsPageDataFetch = jest.spyOn(ProgramsPageFetchModule, 'programPageDataFetch');

const mockPrograms: PublishedProgram[] = [
    {
        image: 'https://via.placeholder.com/200x200?text=Ponys',
        title: 'titletest1',
        subtitle: 'subtitletest1',
        description: 'descriptiontest1',
    },
    {
        image: 'https://via.placeholder.com/200x200?text=Ponys',
        title: 'titletest2',
        subtitle: 'subtitletest2',
        description: 'descriptiontest2',
    },
    {
        image: 'https://via.placeholder.com/200x200?text=Ponys',
        title: 'titletest3',
        subtitle: 'subtitletest3',
        description: 'descriptiontest3',
    },
];
jest.mock('../../../../components/public/program-card/ProgramCard', () => ({
    ProgramCard: ({ program }: { program: PublishedProgram }) => (
        <div data-testid="test-card-content">
            <img src={program.image} alt={program.title} />
            <h2>{program.title}</h2>
            <h4>{program.subtitle}</h4>
            <p>{program.description}</p>
        </div>
    ),
}));
describe('test program section', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });
    test('should render correctly', async () => {
        spyProgramsPageDataFetch.mockResolvedValue({ programData: mockPrograms });
        render(<ProgramsSection />);
        expect(spyProgramsPageDataFetch).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(screen.getByText('titletest1')).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'subtitletest1' })).toBeInTheDocument();

            expect(screen.getByText('titletest2')).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'subtitletest2' })).toBeInTheDocument();

            expect(screen.getByText('titletest3')).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'subtitletest3' })).toBeInTheDocument();

            expect(screen.getByAltText('titletest1')).toBeInTheDocument();
            expect(screen.getByAltText('titletest1')).toHaveAttribute(
                'src',
                'https://via.placeholder.com/200x200?text=Ponys',
            );

            const cards = screen.queryAllByTestId('test-card-content');
            expect(cards.length).toEqual(3);
        });
    });
    test('should render with no cards', async () => {
        spyProgramsPageDataFetch.mockResolvedValue({ programData: [] });
        render(<ProgramsSection />);
        expect(spyProgramsPageDataFetch).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            const cards = screen.queryAllByTestId('test-card-content');
            expect(cards.length).toEqual(0);
        });
    });
    test('should render without crashing', async () => {
        spyProgramsPageDataFetch.mockRejectedValueOnce(new Error('Fetch failed'));
        render(<ProgramsSection />);
        expect(spyProgramsPageDataFetch).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            const cards = screen.queryAllByTestId('test-card-content');
            expect(cards.length).toEqual(0);
            const errorMessage = document.querySelector('.error-message');
            expect(errorMessage).toBeInTheDocument();
        });
    });
});
