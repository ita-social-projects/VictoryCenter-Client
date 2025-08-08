import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemberCard } from '../../../../types/public/team-page';
import { TeamMemberCard } from './TeamMemberCard';

describe('TeamMember component', () => {
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
});
