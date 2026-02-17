import { render, screen, fireEvent } from '@testing-library/react';
import { MemberCard } from '@/types/public/team-page';
import { TeamMemberCard } from './TeamMemberCard';
import { TranslationStatus } from '@/types/common/language';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';

jest.mock('@/assets/icons/team-member-blank.svg', () => ({
    ReactComponent: () => <svg data-testid="default-member-icon" />,
}));

jest.mock('@/hooks/common/use-get-localization/useGetLocalization', () => ({
    useGetLocalization: jest.fn(),
}));
const mockedUseGetLocalization = useGetLocalization as jest.Mock;

describe('TeamMemberCard component', () => {
    beforeEach(() => {
        mockedUseGetLocalization.mockImplementation((localizations, fallback) => {
            if (localizations && localizations.length > 0) {
                return {
                    fullName: localizations[0].fullName,
                    description: localizations[0].description,
                };
            }
            return fallback;
        });
    });
    const mockMember: MemberCard = {
        id: 1,
        name: 'Іван Іванов',
        role: 'учасник',
        photo: 'https://via.placeholder.com/200x250?text=Іван',
        localizations: [],
    };

    it("should render the member's name, role, and photo correctly", () => {
        render(<TeamMemberCard member={mockMember} />);

        expect(screen.getByText(mockMember.name)).toBeInTheDocument();
        expect(screen.getByText(mockMember.role)).toBeInTheDocument();

        const imgElement = screen.getByAltText(mockMember.name);
        expect(imgElement).toHaveAttribute('src', mockMember.photo);
    });
    it('should render localized name and role when localizations are available', () => {
        const localizedMember: MemberCard = {
            ...mockMember,
            localizations: [
                {
                    language: { id: 1, code: 'en' },
                    fullName: 'Ivan English',
                    description: 'Professional Member',
                    translationStatus: TranslationStatus.Relevant,
                },
            ],
        };

        mockedUseGetLocalization.mockReturnValue({
            fullName: 'Ivan English',
            description: 'Professional Member',
        });

        render(<TeamMemberCard member={localizedMember} />);

        expect(screen.getByText('Ivan English')).toBeInTheDocument();
        expect(screen.getByText('Professional Member')).toBeInTheDocument();

        expect(screen.queryByText(mockMember.name)).not.toBeInTheDocument();
    });
    it('should render default icon when photo is not provided', () => {
        const memberWithoutPhoto = { ...mockMember, photo: null };
        render(<TeamMemberCard member={memberWithoutPhoto} />);
        expect(screen.getByTestId('default-member-icon')).toBeInTheDocument();
    });

    it('renders default icon when image fails to load', () => {
        render(<TeamMemberCard member={mockMember} />);
        const imgElement = screen.getByAltText(mockMember.name);

        fireEvent.error(imgElement);

        expect(screen.getByTestId('default-member-icon')).toBeInTheDocument();
        expect(screen.queryByAltText(mockMember.name)).not.toBeInTheDocument();
    });
});
