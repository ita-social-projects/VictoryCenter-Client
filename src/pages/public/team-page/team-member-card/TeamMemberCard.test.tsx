import { render, screen, fireEvent } from '@testing-library/react';
import { MemberCard } from '@app-types/public/team-page';
import { TeamMemberCard } from './TeamMemberCard';

jest.mock('@assets/icons/team-member-blank.svg', () => ({
    ReactComponent: () => <svg data-testid="default-member-icon" />,
}));

describe('TeamMemberCard component', () => {
    const mockMember: MemberCard = {
        id: 1,
        name: 'Іван Іванов',
        role: 'учасник',
        photo: 'https://via.placeholder.com/200x250?text=Іван',
    };

    it("should render the member's name, role, and photo correctly", () => {
        render(<TeamMemberCard member={mockMember} />);
        const nameElement = screen.getByText(mockMember.name);
        expect(nameElement).toBeInTheDocument();
        expect(nameElement).toHaveClass('member-name');

        const roleElement = screen.getByText(mockMember.role);
        expect(roleElement).toBeInTheDocument();
        expect(roleElement).toHaveClass('member-role');

        const imgElement = screen.getByAltText(mockMember.name);
        expect(imgElement).toBeInTheDocument();
        expect(imgElement).toHaveAttribute('src', mockMember.photo);
        expect(imgElement).toHaveClass('member-photo');
    });

    it('should render the container with the correct class', () => {
        render(<TeamMemberCard member={mockMember} />);
        const container = screen.getByText(mockMember.name).closest('.team-member');
        expect(container).toBeInTheDocument();
    });

    it('should render default icon when photo is not provided', () => {
        const memberWithoutPhoto: MemberCard = {
            id: 2,
            name: 'Петро Петренко',
            role: 'учасник',
            photo: null,
        };

        render(<TeamMemberCard member={memberWithoutPhoto} />);

        expect(screen.getByTestId('default-member-icon')).toBeInTheDocument();
    });

    it('renders default icon when image fails to load', () => {
        render(<TeamMemberCard member={mockMember} />);

        const imgElement = screen.getByAltText(mockMember.name);
        expect(imgElement).toBeInTheDocument();

        fireEvent.error(imgElement);

        expect(screen.getByTestId('default-member-icon')).toBeInTheDocument();
        expect(screen.queryByAltText(mockMember.name)).not.toBeInTheDocument();
    });
});
