import { render, screen, waitFor } from '@testing-library/react';
import { DetailedProgramPageContent } from './DetailedProgramPageContent';
import { DetailedProgramDto } from '@/types/public/programs-page';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}));

jest.mock('@/services/api/public/programs/programs-api', () => ({
    fetchProgramBySlug: jest.fn(),
}));

jest.mock('@/hooks/common/use-get-program-by-slug/useGetProgramBySlug', () => ({
    useProgramBySlug: jest.fn(),
}));

jest.mock('@/assets/icons/map-pin.svg', () => ({
    ReactComponent: () => <div data-testid="map-pin-icon" />,
}));

jest.mock('@/assets/icons/users-round.svg', () => ({
    ReactComponent: () => <div data-testid="users-round-icon" />,
}));

jest.mock('@/assets/icons/calendar-days.svg', () => ({
    ReactComponent: () => <div data-testid="calendar-days-icon" />,
}));

jest.mock('@/components/public/background-media/BackgroundMedia', () => ({
    BackgroundMedia: ({ mediaUrl }: { mediaUrl: string }) => (
        <div data-testid="background-media" data-media-url={mediaUrl} />
    ),
}));

jest.mock('@/components/public/ui/button', () => ({
    Button: ({ children, href }: { children: React.ReactNode; href?: string }) => (
        <a href={href || '#'} data-testid="button">
            {children}
        </a>
    ),
}));

jest.mock('@/pages/public/not-found-page/NotFound', () => ({
    NotFound: () => (
        <div data-testid="not-found-page">
            <div data-testid="not-found-message-container">NotFound</div>
        </div>
    ),
}));

jest.mock('@/components/public/detailed-program-section/DetailedProgramSection', () => ({
    DetailedProgramSection: ({ section }: { section: any }) => (
        <div data-testid="detailed-program-section" data-section-id={section.id}>
            Section: {section.template}
        </div>
    ),
}));

jest.mock('@/components/public/cta', () => ({
    CtaSection: ({ title, description }: any) => (
        <div data-testid="cta-section">
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
    ),
}));

const { useParams } = require('react-router-dom');
const { useProgramBySlug } = require('@/hooks/common/use-get-program-by-slug/useGetProgramBySlug');
const mockUseProgramBySlug = useProgramBySlug as jest.MockedFunction<typeof useProgramBySlug>;

const mockProgram = {
    id: 1,
    slug: 'test-program',
    name: 'Test Program',
    description: 'Test description',
    location: 'Test Location',
    participantsCount: 100,
    meetingsCount: 10,
    categories: [],
    status: 'published',
    previewImage: { url: 'https://example.com/preview.jpg' },
    sections: [],
    backgroundImage: {
        url: 'https://example.com/image.jpg',
    },
} as unknown as DetailedProgramDto;

describe('DetailedProgramPageContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state', () => {
        useParams.mockReturnValue({ slug: 'test-program' });
        mockUseProgramBySlug.mockReturnValue({
            program: null,
            isLoading: true,
            error: null,
        });

        render(<DetailedProgramPageContent />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders error state when fetch fails', async () => {
        useParams.mockReturnValue({ slug: 'test-program' });
        mockUseProgramBySlug.mockReturnValue({
            program: null,
            isLoading: false,
            error: new Error('Failed to fetch'),
        });

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('not-found-message-container')).toBeInTheDocument();
        });
    });

    it('renders error state when no slug provided', async () => {
        useParams.mockReturnValue({ slug: undefined });
        mockUseProgramBySlug.mockReturnValue({
            program: null,
            isLoading: false,
            error: new Error('No slug provided'),
        });

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('not-found-message-container')).toBeInTheDocument();
        });
    });

    it('renders program details successfully', async () => {
        useParams.mockReturnValue({ slug: 'test-program' });
        mockUseProgramBySlug.mockReturnValue({
            program: mockProgram,
            isLoading: false,
            error: null,
        });

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            expect(screen.getByText('Test Program')).toBeInTheDocument();
            expect(screen.getByText('Test description')).toBeInTheDocument();
            expect(screen.getByText('Test Location')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
        });
    });

    it('renders background image with correct src', async () => {
        useParams.mockReturnValue({ slug: 'test-program' });
        mockUseProgramBySlug.mockReturnValue({
            program: mockProgram,
            isLoading: false,
            error: null,
        });

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            const backgroundMedia = screen.getByTestId('background-media');
            expect(backgroundMedia).toHaveAttribute('data-media-url', 'https://example.com/image.jpg');
        });
    });

    it('does not render location when not provided', async () => {
        const programWithoutLocation = { ...mockProgram, location: undefined };
        useParams.mockReturnValue({ slug: 'test-program' });
        mockUseProgramBySlug.mockReturnValue({
            program: programWithoutLocation as unknown as DetailedProgramDto,
            isLoading: false,
            error: null,
        });

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            expect(screen.queryByTestId('map-pin-icon')).not.toBeInTheDocument();
        });
    });

    it('does not render participantsCount when not provided', async () => {
        const programWithoutParticipants = { ...mockProgram, participantsCount: undefined };
        useParams.mockReturnValue({ slug: 'test-program' });
        mockUseProgramBySlug.mockReturnValue({
            program: programWithoutParticipants as unknown as DetailedProgramDto,
            isLoading: false,
            error: null,
        });

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            expect(screen.queryByTestId('users-round-icon')).not.toBeInTheDocument();
        });
    });

    it('does not render meetingsCount when not provided', async () => {
        const programWithoutMeetings = { ...mockProgram, meetingsCount: undefined };
        useParams.mockReturnValue({ slug: 'test-program' });
        mockUseProgramBySlug.mockReturnValue({
            program: programWithoutMeetings as unknown as DetailedProgramDto,
            isLoading: false,
            error: null,
        });

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            expect(screen.queryByTestId('calendar-days-icon')).not.toBeInTheDocument();
        });
    });

    it('renders sections list when sections are provided', async () => {
        const programWithSections = {
            ...mockProgram,
            sections: [
                {
                    id: 1,
                    template: 'TextOnly',
                    contents: [
                        { id: 1, contentType: 'Title', title: 'Section 1', order: 0 },
                        { id: 2, contentType: 'Description', description: 'Description 1', order: 1 },
                    ],
                },
                {
                    id: 2,
                    template: 'SingleImageTop',
                    contents: [
                        { id: 3, contentType: 'Title', title: 'Section 2', order: 0 },
                        { id: 4, contentType: 'Description', description: 'Description 2', order: 1 },
                    ],
                },
            ],
        };

        useParams.mockReturnValue({ slug: 'test-program' });
        mockUseProgramBySlug.mockReturnValue({
            program: programWithSections as unknown as DetailedProgramDto,
            isLoading: false,
            error: null,
        });

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            const sections = screen.getAllByTestId('detailed-program-section');
            expect(sections).toHaveLength(2);
            expect(sections[0]).toHaveAttribute('data-section-id', '1');
            expect(sections[1]).toHaveAttribute('data-section-id', '2');
            expect(screen.getByText('Section: TextOnly')).toBeInTheDocument();
            expect(screen.getByText('Section: SingleImageTop')).toBeInTheDocument();
        });
    });

    it('does not render sections list when sections array is empty', async () => {
        const programWithoutSections = {
            ...mockProgram,
            sections: [],
        };

        useParams.mockReturnValue({ slug: 'test-program' });
        mockUseProgramBySlug.mockReturnValue({
            program: programWithoutSections as unknown as DetailedProgramDto,
            isLoading: false,
            error: null,
        });

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            expect(screen.queryByTestId('detailed-program-section')).not.toBeInTheDocument();
        });
    });

    it('uses section template as fallback key when section.id is missing', async () => {
        const programWithSectionsNoIds = {
            ...mockProgram,
            sections: [
                {
                    template: 'TextOnly',
                    contents: [],
                },
                {
                    template: 'SingleImageTop',
                    contents: [],
                },
            ],
        };

        useParams.mockReturnValue({ slug: 'test-program' });
        mockUseProgramBySlug.mockReturnValue({
            program: programWithSectionsNoIds as unknown as DetailedProgramDto,
            isLoading: false,
            error: null,
        });

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            const sections = screen.getAllByTestId('detailed-program-section');
            expect(sections).toHaveLength(2);
        });
    });

    it('does not render background section when backgroundImage is not provided', async () => {
        const programWithoutBackground = {
            ...mockProgram,
            backgroundImage: null,
        };

        useParams.mockReturnValue({ slug: 'test-program' });
        mockUseProgramBySlug.mockReturnValue({
            program: programWithoutBackground as unknown as DetailedProgramDto,
            isLoading: false,
            error: null,
        });

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            expect(screen.queryByTestId('background-media')).not.toBeInTheDocument();
        });
    });
});
