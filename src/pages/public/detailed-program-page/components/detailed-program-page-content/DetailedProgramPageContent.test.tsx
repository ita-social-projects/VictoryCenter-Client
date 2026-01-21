import { render, screen, waitFor } from '@testing-library/react';
import { DetailedProgramPageContent } from './DetailedProgramPageContent';
import { fetchProgramBySlug } from '@/services/api/public/programs/programs-api';
import { DetailedProgram } from '@/types/public/programs-page';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}));

jest.mock('@/services/api/public/programs/programs-api', () => ({
    fetchProgramBySlug: jest.fn(),
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

const { useParams } = require('react-router-dom');
const mockFetchProgramBySlug = fetchProgramBySlug as jest.MockedFunction<typeof fetchProgramBySlug>;

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
} as unknown as DetailedProgram;

describe('DetailedProgramPageContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state', () => {
        useParams.mockReturnValue({ slug: 'test-program' });
        mockFetchProgramBySlug.mockImplementation(() => new Promise(() => {}));

        render(<DetailedProgramPageContent />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders error state when fetch fails', async () => {
        useParams.mockReturnValue({ slug: 'test-program' });
        mockFetchProgramBySlug.mockRejectedValue(new Error('Failed to fetch'));

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText('Failed to load program details')).toBeInTheDocument();
        });
    });

    it('renders error state when no slug provided', async () => {
        useParams.mockReturnValue({ slug: undefined });

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });

    it('renders program details successfully', async () => {
        useParams.mockReturnValue({ slug: 'test-program' });
        mockFetchProgramBySlug.mockResolvedValue(mockProgram);

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
        mockFetchProgramBySlug.mockResolvedValue(mockProgram);

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            const backgroundMedia = screen.getByTestId('background-media');
            expect(backgroundMedia).toHaveAttribute('data-media-url', 'https://example.com/image.jpg');
        });
    });

    it('does not render location when not provided', async () => {
        const programWithoutLocation = { ...mockProgram, location: undefined };
        useParams.mockReturnValue({ slug: 'test-program' });
        mockFetchProgramBySlug.mockResolvedValue(programWithoutLocation as unknown as DetailedProgram);

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            expect(screen.queryByTestId('map-pin-icon')).not.toBeInTheDocument();
        });
    });

    it('does not render participantsCount when not provided', async () => {
        const programWithoutParticipants = { ...mockProgram, participantsCount: undefined };
        useParams.mockReturnValue({ slug: 'test-program' });
        mockFetchProgramBySlug.mockResolvedValue(programWithoutParticipants as unknown as DetailedProgram);

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            expect(screen.queryByTestId('users-round-icon')).not.toBeInTheDocument();
        });
    });

    it('does not render meetingsCount when not provided', async () => {
        const programWithoutMeetings = { ...mockProgram, meetingsCount: undefined };
        useParams.mockReturnValue({ slug: 'test-program' });
        mockFetchProgramBySlug.mockResolvedValue(programWithoutMeetings as unknown as DetailedProgram);

        render(<DetailedProgramPageContent />);

        await waitFor(() => {
            expect(screen.queryByTestId('calendar-days-icon')).not.toBeInTheDocument();
        });
    });
});
