import { render, screen, waitFor } from '@testing-library/react';
import { TeamPage } from './TeamPage';
import * as teamPageDataFetch from '@/services/api/public/team/team-api';
import { MemberCard, TeamItem } from '@/types/public/team-page';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { EntityLocalization } from '@/types/common/language';

jest.mock('@/assets/videos/public/team-page/quote_background.mp4', () => 'mocked-video.mp4');
jest.mock('@/hooks/common/use-get-localization/useGetLocalization', () => ({
    useGetLocalization: jest.fn(),
}));

const spyTeamPageDataFetch = jest.spyOn(teamPageDataFetch, 'teamPageDataFetch');
const mockedUseGetLocalization = useGetLocalization as jest.Mock;

const mockTeamDataSingle: TeamItem[] = [
    {
        title: 'Основна команда',
        description:
            'Люди, які щодня координують роботу програм, супроводжують учасників, будують логістику, фасилітують сесії.',
        localizations: [
            {
                language: {
                    id: 2,
                    code: 'en',
                },
                name: 'Main team',
                description: 'People who coordinate the work of the programs on a daily basis, accompany participants, organize logistics, and facilitate sessions.',
                translationStatus: 0,
            },
        ],
        members: [
            {
                id: 1,
                name: 'Настя Попандопулус',
                role: 'виконавча директорка',
                photo: 'https://via.placeholder.com/200x250?text=Настя',
            },
        ],
    },
];

const mockTeamDataMultiple: TeamItem[] = [
    ...mockTeamDataSingle,
    {
        title: 'Додаткова команда',
        description: 'Інший опис',
        localizations: [
            {
                language: {
                    id: 2,
                    code: 'en',
                },
                name: 'Additional team',
                description: 'Another description',
                translationStatus: 0,
            },
        ],
        members: [
            {
                id: 1,
                name: 'Іван Іванов',
                role: 'учасник',
                photo: 'https://via.placeholder.com/200x250?text=Іван',
            },
        ],
    },
];

jest.mock('./team-member-card/TeamMemberCard', () => ({
    TeamMemberCard: ({ member }: { member: MemberCard }) => (
        <div data-testid="team-member">
            <img alt={member.name} src={member.photo ?? undefined} />
            <div>{member.name}</div>
            <div>{member.role}</div>
        </div>
    ),
}));

describe('TeamPage component', () => {
    beforeEach(() => {
        mockedUseGetLocalization.mockImplementation((_localizations, fallback) => {
            return fallback;
        });
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch data and display the single team section correctly', async () => {
        spyTeamPageDataFetch.mockResolvedValueOnce({
            teamData: mockTeamDataSingle,
        });

        render(<TeamPage />);
        expect(spyTeamPageDataFetch).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(screen.getByText('Основна команда')).toBeInTheDocument();
            expect(
                screen.getByText(
                    'Люди, які щодня координують роботу програм, супроводжують учасників, будують логістику, фасилітують сесії.',
                ),
            ).toBeInTheDocument();

            expect(screen.getByText('Настя Попандопулус')).toBeInTheDocument();
            expect(screen.getByText('виконавча директорка')).toBeInTheDocument();
            expect(screen.getByAltText('Настя Попандопулус')).toHaveAttribute(
                'src',
                'https://via.placeholder.com/200x250?text=Настя',
            );
        });
        const teamSections = document.querySelectorAll('.team-section');
        expect(teamSections.length).toBe(1);
        expect(teamSections[0].classList.contains('last-section')).toBe(true);
    });

    it("should render multiple team sections and assign the 'last-section' class only to the last", async () => {
        spyTeamPageDataFetch.mockResolvedValueOnce({
            teamData: mockTeamDataMultiple,
        });

        render(<TeamPage />);
        await waitFor(() => {
            expect(screen.getByText('Основна команда')).toBeInTheDocument();
            expect(screen.getByText('Додаткова команда')).toBeInTheDocument();
        });

        const teamSections = document.querySelectorAll('.team-section');
        expect(teamSections.length).toBe(2);
        expect(teamSections[0].classList.contains('last-section')).toBe(false);
        expect(teamSections[1].classList.contains('last-section')).toBe(true);
    });

    it('should render team sections with English localization', async () => {
        mockedUseGetLocalization.mockImplementation((localizations, fallback) => {
            const enLocalization = localizations?.find((loc: EntityLocalization) => loc.language.code === 'en');
            
            if (enLocalization) {
                const { language: _language, translationStatus: _translationStatus, ...localizableFields } = enLocalization;
                return {
                    ...fallback,
                    ...localizableFields,
                };
            }
            return fallback;
        });

        spyTeamPageDataFetch.mockResolvedValueOnce({
            teamData: mockTeamDataMultiple,
        });

        render(<TeamPage />);
        
        await waitFor(() => {
            expect(screen.getByText('Main team')).toBeInTheDocument();
            expect(
                screen.getByText(
                    'People who coordinate the work of the programs on a daily basis, accompany participants, organize logistics, and facilitate sessions.',
                ),
            ).toBeInTheDocument();
            expect(screen.getByText('Additional team')).toBeInTheDocument();
            expect(screen.getByText('Another description')).toBeInTheDocument();
        });
    });

    it('should render no team sections if the data is an empty array', async () => {
        spyTeamPageDataFetch.mockResolvedValueOnce({
            teamData: [],
        });

        render(<TeamPage />);

        await waitFor(() => {
            expect(document.querySelectorAll('.team-section').length).toBe(0);
        });
    });

    it('should handle fetch errors gracefully without crashing', async () => {
        spyTeamPageDataFetch.mockRejectedValueOnce(new Error('Fetch failed'));

        render(<TeamPage />);
        await waitFor(() => {
            expect(document.querySelectorAll('.team-section').length).toBe(0);
        });
    });

    it('should display the static quote and author', async () => {
        spyTeamPageDataFetch.mockResolvedValueOnce({ teamData: [] });

        render(<TeamPage />);

        const quoteText = 'Я тут, тому що знаю з власного досвіду – коні нас рятують.';
        const author = 'Вікторія Яковенко';

        await waitFor(() => {
            expect(screen.getByText(author)).toBeInTheDocument();
            expect(screen.getByText(quoteText)).toBeInTheDocument();
        });
    });

    it('should render the background video element', async () => {
        spyTeamPageDataFetch.mockResolvedValueOnce({ teamData: [] });

        render(<TeamPage />);

        const videoElement = await waitFor(() => document.querySelector('video'));

        expect(videoElement).toBeInTheDocument();
        expect(videoElement?.querySelector('source')?.getAttribute('src')).toBe('mocked-video.mp4');
        expect(videoElement?.hasAttribute('autoplay')).toBe(true);
        expect(videoElement?.hasAttribute('loop')).toBe(true);
        expect(videoElement?.hasAttribute('playsinline')).toBe(true);
    });
});
