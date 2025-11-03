import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramsSection } from './ProgramsSection';
import { useDataFetch } from '../../../../hooks/common/use-data-fetch/useDataFetch';
import { mockPrograms } from '../../../../utils/mock-data/public/programs-page';
import programsPageUk from '../../../../locales/uk/programs.json';

jest.mock('../../../../components/public/program-card/ProgramCard', () => ({
    ProgramCard: ({ program }: any) => <div data-testid="program-card">{program.name}</div>,
}));

jest.mock('../../../../services/api/public/programs/programs-api');
jest.mock('../../../../hooks/common/use-data-fetch/useDataFetch');

describe('ProgramsSection', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', async () => {
        (useDataFetch as jest.Mock).mockReturnValue({
            data: mockPrograms,
            isLoading: true,
            error: null,
        });

        render(<ProgramsSection />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders programs after successful fetch', async () => {
        (useDataFetch as jest.Mock).mockReturnValue({
            data: mockPrograms,
            isLoading: false,
            error: null,
        });

        render(<ProgramsSection />);

        expect(await screen.findAllByTestId('program-card')).toHaveLength(2);
        expect(screen.getByText('Program A')).toBeInTheDocument();
        expect(screen.getByText('Program B')).toBeInTheDocument();

        expect(screen.getByText('Category 1')).toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
        expect(screen.getByText(programsPageUk['PROGRAMS_ALL'])).toBeInTheDocument();
    });

    it('filters programs by category', async () => {
        (useDataFetch as jest.Mock).mockReturnValue({
            data: mockPrograms,
            isLoading: false,
            error: null,
        });

        render(<ProgramsSection />);

        await screen.findAllByTestId('program-card');

        fireEvent.click(screen.getByText('Category 1'));

        expect(screen.getByText('Program A')).toBeInTheDocument();
        expect(screen.queryByText('Program B')).not.toBeInTheDocument();
    });

    it('resets filter when selecting all programs', async () => {
        (useDataFetch as jest.Mock).mockReturnValue({
            data: mockPrograms,
            isLoading: false,
            error: null,
        });

        render(<ProgramsSection />);

        await screen.findAllByTestId('program-card');

        fireEvent.click(screen.getByText('Category 2'));
        expect(screen.getByText('Program B')).toBeInTheDocument();
        expect(screen.queryByText('Program A')).not.toBeInTheDocument();

        fireEvent.click(screen.getByText(programsPageUk['PROGRAMS_ALL']));
        expect(screen.getByText('Program A')).toBeInTheDocument();
        expect(screen.getByText('Program B')).toBeInTheDocument();
    });

    it('renders error message when fetch fails', async () => {
        (useDataFetch as jest.Mock).mockReturnValue({
            data: mockPrograms,
            isLoading: false,
            error: programsPageUk['FAILED_TO_LOAD_THE_PROGRAMS'],
        });

        render(<ProgramsSection />);

        expect(await screen.findByRole('alert')).toHaveTextContent(programsPageUk['FAILED_TO_LOAD_THE_PROGRAMS']);
    });
});
