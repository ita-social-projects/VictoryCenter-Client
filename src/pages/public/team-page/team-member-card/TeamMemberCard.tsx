import { MemberCard } from '../../../../types/public/team-page';
import default_team_member_photo from '../../../../assets/icons/team-member-blank.svg';
import React from 'react';
interface TeamMemberProps {
    member: MemberCard;
}

export const TeamMemberCard = ({ member }: TeamMemberProps) => {

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = default_team_member_photo;
    };

    return (
        <div className="team-member">
            <img src={member.photo} alt={member.name} className="member-photo" onError={handleImageError} />
            <div>
                <p className="member-name">{member.name}</p>
                <p className="member-role">{member.role}</p>
            </div>
        </div>
    );
};
