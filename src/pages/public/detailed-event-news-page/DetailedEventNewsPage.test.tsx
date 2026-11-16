import { render, screen } from '@testing-library/react';
import { DetailedEventNewsPage } from './DetailedEventNewsPage';
import { EventsNews } from '@/types/public/events-news';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/events-and-news/test-event', search: '' }),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => ({ currentLanguage: 'en' }),
}));

jest.mock('@/services/api/public/events-news/events-news-api', () => ({
    EventNewsApi: { get: jest.fn() },
}));

jest.mock('@/hooks/common/use-get-program-by-slug/useGetProgramBySlug', () => ({
    useProgramBySlug: jest.fn(),
}));

const mockUseLocale = jest.fn();
jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => mockUseLocale(),
}));

jest.mock('@/pages/public/not-found-page/NotFound', () => ({
    NotFound: () => <div data-testid="not-found-page">NotFound</div>,
}));

jest.mock('@/components/public/detailed-program-header/DetailedProgramHeader', () => ({
    DetailedProgramHeader: ({ program }: { program: EventsNews }) => (
        <div data-testid="detailed-program-header">{program.name}</div>
    ),
}));

jest.mock('@/components/public/detailed-program-section/DetailedProgramSection', () => ({
    DetailedProgramSection: ({ section }: { section: any }) => (
        <div data-testid="detailed-program-section" data-section-id={section.id}>
            Section: {section.template}
        </div>
    ),
}));

const { useParams } = require('react-router-dom');
const { useProgramBySlug } = require('@/hooks/common/use-get-program-by-slug/useGetProgramBySlug');
const mockUseProgramBySlug = useProgramBySlug as jest.MockedFunction<typeof useProgramBySlug>;
const { EventNewsApi } = require('@/services/api/public/events-news/events-news-api');

const mockEventNews = {
    id: '1',
    slug: 'test-event',
    name: 'Test Event',
    description: 'Test description',
    date: '2026-01-01',
    tags: [],
    previewImage: 'https://example.com/preview.jpg',
    backgroundImage: 'https://example.com/image.jpg',
    sections: [],
    localizations: [],
} as unknown as EventsNews;

describe('DetailedEventNewsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseLocale.mockReturnValue({ currentLanguage: 'uk' });
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders loading state', () => {
        useParams.mockReturnValue({ slug: 'test-event' });
        mockUseProgramBySlug.mockReturnValue({
            program: null,
            isLoading: true,
            error: null,
        });

        render(<DetailedEventNewsPage />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders loading state while no data and no error yet', () => {
        useParams.mockReturnValue({ slug: 'test-event' });
        mockUseProgramBySlug.mockReturnValue({
            program: null,
            isLoading: false,
            error: null,
        });

        render(<DetailedEventNewsPage />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders NotFound when there is an error', () => {
        useParams.mockReturnValue({ slug: 'test-event' });
        mockUseProgramBySlug.mockReturnValue({
            program: null,
            isLoading: false,
            error: new Error('Failed to fetch'),
        });

        render(<DetailedEventNewsPage />);

        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('renders NotFound when eventNews is missing despite no error', () => {
        useParams.mockReturnValue({ slug: 'test-event' });
        mockUseProgramBySlug.mockReturnValue({
            program: undefined,
            isLoading: false,
            error: new Error('not found'),
        });

        render(<DetailedEventNewsPage />);

        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('renders event news details successfully', () => {
        useParams.mockReturnValue({ slug: 'test-event' });
        mockUseProgramBySlug.mockReturnValue({
            program: mockEventNews,
            isLoading: false,
            error: null,
        });

        render(<DetailedEventNewsPage />);

        expect(screen.getByTestId('detailed-program-header')).toHaveTextContent('Test Event');
        expect(screen.queryByTestId('detailed-program-section')).not.toBeInTheDocument();
    });

    it('renders sections list when sections are provided', () => {
        const eventNewsWithSections = {
            ...mockEventNews,
            sections: [
                { id: 1, template: 'TextOnly' },
                { id: 2, template: 'SingleImageTop' },
            ],
        };

        useParams.mockReturnValue({ slug: 'test-event' });
        mockUseProgramBySlug.mockReturnValue({
            program: eventNewsWithSections,
            isLoading: false,
            error: null,
        });

        render(<DetailedEventNewsPage />);

        const sections = screen.getAllByTestId('detailed-program-section');
        expect(sections).toHaveLength(2);
        expect(sections[0]).toHaveAttribute('data-section-id', '1');
        expect(sections[1]).toHaveAttribute('data-section-id', '2');
    });

    it('does not render sections list when sections array is empty', () => {
        useParams.mockReturnValue({ slug: 'test-event' });
        mockUseProgramBySlug.mockReturnValue({
            program: mockEventNews,
            isLoading: false,
            error: null,
        });

        render(<DetailedEventNewsPage />);

        expect(screen.queryByTestId('detailed-program-section')).not.toBeInTheDocument();
    });

    it('uses section template as fallback key when section.id is missing', () => {
        const eventNewsWithSectionsNoIds = {
            ...mockEventNews,
            sections: [{ template: 'TextOnly' }, { template: 'SingleImageTop' }],
        };

        useParams.mockReturnValue({ slug: 'test-event' });
        mockUseProgramBySlug.mockReturnValue({
            program: eventNewsWithSectionsNoIds,
            isLoading: false,
            error: null,
        });

        render(<DetailedEventNewsPage />);

        const sections = screen.getAllByTestId('detailed-program-section');
        expect(sections).toHaveLength(2);
    });

    it('loads the event in the current language', async () => {
        mockUseLocale.mockReturnValue({ currentLanguage: 'en' });
        useParams.mockReturnValue({ slug: 'test-event' });
        mockUseProgramBySlug.mockReturnValue({ program: mockEventNews, isLoading: false, error: null });

        render(<DetailedEventNewsPage />);
        const [fetchEventNews, slug] = mockUseProgramBySlug.mock.calls[0];
        await fetchEventNews(slug);

        expect(slug).toBe('test-event');
        expect(EventNewsApi.get).toHaveBeenCalledWith('test-event', 'en');
    });
});
