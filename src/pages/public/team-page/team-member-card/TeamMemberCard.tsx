import { MemberCard } from '../../../../types/public/team-page';
import { ReactComponent as DefaultTeamMemberIcon } from '../../../../assets/icons/team-member-blank.svg';
import React from 'react';

interface TeamMemberProps {
    member: MemberCard;
}

export const TeamMemberCard = ({ member }: TeamMemberProps) => {
    const [error, setError] = React.useState(false);

    return (
        <div className="team-member">
            {error || !member.photo ? (
                <DefaultTeamMemberIcon className="member-photo" />
            ) : (
                <img src={member.photo} alt={member.name} className="member-photo" onError={() => setError(true)} />
            )}
            <div>
                <p className="member-name">{member.name}</p>
                <p className="member-role">{member.role}</p>
            </div>
        </div>
    );
};
