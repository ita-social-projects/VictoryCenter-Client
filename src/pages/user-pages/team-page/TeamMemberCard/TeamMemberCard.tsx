import React from 'react';
import { TeamMemberProps } from '../../../../types/TeamPage';

export const TeamMember: React.FC<TeamMemberProps> = ({ member }) => {
    return (
        <div className="team-member">
            <img src={member.photo} alt={member.name} className="member-photo" />
            <div>
                <p className="member-name">{member.name}</p>
                <p className="member-role">{member.role}</p>
            </div>
        </div>
    );
};
