import { render, screen } from '@testing-library/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DetailedProgramHeader } from './DetailedProgramHeader';
import { DetailedProgramDto } from '@/types/public/programs-page';

jest.mock('react-router-dom', () => ({
    useLocation: jest.fn(),
    useNavigate: jest.fn(),
}));

jest.mock('@/assets/icons/map-pin.svg', () => ({
    ReactComponent: () => <svg data-testid="map-pin-icon" />,
}));

jest.mock('@/assets/icons/users-round.svg', () => ({
    ReactComponent: () => <svg data-testid="users-round-icon" />,
}));

jest.mock('@/assets/icons/calendar-days.svg', () => ({
    ReactComponent: () => <svg data-testid="calendar-days-icon" />,
}));

jest.mock('@/components/public/background-media/BackgroundMedia', () => ({
    BackgroundMedia: ({ mediaUrl }: { mediaUrl: string }) => (
        <div data-testid="background-media" data-media-url={mediaUrl} />
    ),
}));

const mockProgram: DetailedProgramDto = {
    id: 1,
    slug: 'test-program',
    name: 'Test Program',
    description: 'Test description',
    location: 'Test Location',
    participantsCount: '100',
    meetingsCount: '10',
    previewImage: null,
    backgroundImage: { id: 1, url: 'https://example.com/image.jpg' } as DetailedProgramDto['backgroundImage'],
    localizations: [],
    sections: [],
};

describe('DetailedProgramHeader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/', search: '' });
        (useNavigate as jest.Mock).mockReturnValue(jest.fn());
    });

    it('renders nothing when backgroundImage is not provided', () => {
        const programWithoutBackground = { ...mockProgram, backgroundImage: null };

        render(<DetailedProgramHeader program={programWithoutBackground} />);

        expect(screen.queryByTestId('background-media')).not.toBeInTheDocument();
        expect(screen.queryByText('Test Program')).not.toBeInTheDocument();
    });

    it('renders program name, description, location, participants and meetings', () => {
        render(<DetailedProgramHeader program={mockProgram} />);

        expect(screen.getByText('Test Program')).toBeInTheDocument();
        expect(screen.getByText('Test description')).toBeInTheDocument();
        expect(screen.getByText('Test Location')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
        expect(screen.getByTestId('users-round-icon')).toBeInTheDocument();
        expect(screen.getByTestId('calendar-days-icon')).toBeInTheDocument();
    });

    it('passes resolved background image url to BackgroundMedia', () => {
        render(<DetailedProgramHeader program={mockProgram} />);

        expect(screen.getByTestId('background-media')).toHaveAttribute(
            'data-media-url',
            'https://example.com/image.jpg',
        );
    });

    it('does not render location info item when location is missing', () => {
        const programWithoutLocation = { ...mockProgram, location: '' };

        render(<DetailedProgramHeader program={programWithoutLocation} />);

        expect(screen.queryByTestId('map-pin-icon')).not.toBeInTheDocument();
    });

    it('does not render participants info item when participantsCount is missing', () => {
        const programWithoutParticipants = { ...mockProgram, participantsCount: '' };

        render(<DetailedProgramHeader program={programWithoutParticipants} />);

        expect(screen.queryByTestId('users-round-icon')).not.toBeInTheDocument();
    });

    it('does not render meetings info item when meetingsCount is missing', () => {
        const programWithoutMeetings = { ...mockProgram, meetingsCount: '' };

        render(<DetailedProgramHeader program={programWithoutMeetings} />);

        expect(screen.queryByTestId('calendar-days-icon')).not.toBeInTheDocument();
    });

    it('uses localized name, description and location when a localization matches the current language', () => {
        const programWithLocalization: DetailedProgramDto = {
            ...mockProgram,
            localizations: [
                {
                    entityId: 1,
                    name: 'Localized Name',
                    description: 'Localized Description',
                    location: 'Localized Location',
                    participantsCount: '50',
                    meetingsCount: '5',
                    translationStatus: 1,
                    localizationInfoDto: { id: 2, code: 'uk' },
                } as unknown as DetailedProgramDto['localizations'][number],
            ],
        };

        render(<DetailedProgramHeader program={programWithLocalization} />);

        expect(screen.getByText('Localized Name')).toBeInTheDocument();
        expect(screen.getByText('Localized Description')).toBeInTheDocument();
        expect(screen.getByText('Localized Location')).toBeInTheDocument();
    });

    it('does not apply localization to participants/meetings counts due to mismatched field names', () => {
        const programWithLocalization: DetailedProgramDto = {
            ...mockProgram,
            localizations: [
                {
                    entityId: 1,
                    name: 'Localized Name',
                    description: 'Localized Description',
                    location: 'Localized Location',
                    participantsCount: '50',
                    meetingsCount: '5',
                    translationStatus: 1,
                    localizationInfoDto: { id: 2, code: 'uk' },
                } as unknown as DetailedProgramDto['localizations'][number],
            ],
        };

        render(<DetailedProgramHeader program={programWithLocalization} />);

        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.queryByText('50')).not.toBeInTheDocument();
        expect(screen.queryByText('5')).not.toBeInTheDocument();
    });
});
