import { render, screen } from '@testing-library/react';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { ProgramsPageData } from '@/types/public/programs-page';
import { MainProgramsSection } from './MainProgramsSection';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const map: Record<string, string> = {
                PROGRAMS: 'Програми',
                FAILED_TO_LOAD_THE_PROGRAMS: 'Не вдалося завантажити дані програм.',
            };
            return map[key] ?? key;
        },
    }),
}));

jest.mock('@/hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: jest.fn(),
}));

jest.mock('@/components/public/program-card/ProgramCard', () => ({
    ProgramCard: ({ program }: { program: { name: string } }) => (
        <div data-testid="program-card">{program.name}</div>
    ),
}));

jest.mock('@/components/public/swiper/Swiper', () => ({
    Swiper: ({ items, renderItem }: { items: unknown[] | null; renderItem: (item: unknown, index: number) => React.ReactNode }) => {
        if (!items || items.length === 0) return null;
        return (
            <div data-testid="swiper">
                {items.map((item, index) => (
                    <div key={index} data-testid="swiper-slide">
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>
        );
    },
}));

jest.mock('./MainProgramsSection.module.scss', () => ({
    root: 'root',
    heading: 'heading',
    'swiper-wrapper': 'swiper-wrapper',
    'swiper-slide': 'swiper-slide',
    scrollbar: 'scrollbar',
    line: 'line',
    drag: 'drag',
    right: 'right',
    error: 'error',
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockedUseDataFetch = useDataFetch as jest.Mock;

const createMockProgram = (id: number, name: string) => ({
    id,
    name,
    slug: `program-${id}`,
    previewImage: { id, url: `image-${id}.jpg`, mimeType: 'image/jpeg' },
    description: `Description ${id}`,
    categories: [],
    localizations: [],
});

const mockFetch = (
    data: ProgramsPageData | null,
    isLoading = false,
    error: Error | null = null,
) => {
    mockedUseDataFetch.mockReturnValue({ data, isLoading, error });
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MainProgramsSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the section heading', () => {
        mockFetch(null);

        render(<MainProgramsSection />);

        expect(screen.getByText('Програми')).toBeInTheDocument();
    });

    it('renders a loading indicator while fetching', () => {
        mockFetch(null, true);

        render(<MainProgramsSection />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByTestId('swiper')).not.toBeInTheDocument();
    });

    it('renders an error message when fetch fails', () => {
        mockFetch(null, false, new Error('Network error'));

        render(<MainProgramsSection />);

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Не вдалося завантажити дані програм.')).toBeInTheDocument();
        expect(screen.queryByTestId('swiper')).not.toBeInTheDocument();
    });

    it('renders nothing in the swiper area when data is null', () => {
        mockFetch(null);

        render(<MainProgramsSection />);

        expect(screen.queryByTestId('swiper')).not.toBeInTheDocument();
        expect(screen.queryAllByTestId('program-card')).toHaveLength(0);
    });

    it('renders nothing in the swiper area when programsData is empty', () => {
        mockFetch({ programsData: [], programsCategories: [] });

        render(<MainProgramsSection />);

        expect(screen.queryByTestId('swiper')).not.toBeInTheDocument();
        expect(screen.queryAllByTestId('program-card')).toHaveLength(0);
    });

    it('renders a Swiper with one ProgramCard per program', () => {
        const programs = [
            createMockProgram(1, 'Program A'),
            createMockProgram(2, 'Program B'),
            createMockProgram(3, 'Program C'),
        ];
        mockFetch({ programsData: programs, programsCategories: [] });

        render(<MainProgramsSection />);

        expect(screen.getByTestId('swiper')).toBeInTheDocument();
        const cards = screen.getAllByTestId('program-card');
        expect(cards).toHaveLength(3);
        expect(screen.getByText('Program A')).toBeInTheDocument();
        expect(screen.getByText('Program B')).toBeInTheDocument();
        expect(screen.getByText('Program C')).toBeInTheDocument();
    });

    it('passes the fetched programs to the Swiper', () => {
        const programs = [createMockProgram(1, 'Solo Program')];
        mockFetch({ programsData: programs, programsCategories: [] });

        render(<MainProgramsSection />);

        expect(screen.getByText('Solo Program')).toBeInTheDocument();
    });

    it('renders the scrollbar container', () => {
        mockFetch({ programsData: [createMockProgram(1, 'P1')], programsCategories: [] });

        const { container } = render(<MainProgramsSection />);

        expect(container.querySelector('.scrollbar')).toBeInTheDocument();
    });

    it('calls useDataFetch with programPageDataFetch handler and no autoFetch dependencies', () => {
        mockFetch(null);

        render(<MainProgramsSection />);

        expect(mockedUseDataFetch).toHaveBeenCalledWith(
            expect.objectContaining({
                initialData: null,
            }),
        );
    });
});
