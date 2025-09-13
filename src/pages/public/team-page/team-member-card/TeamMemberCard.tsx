import { MemberCard } from '../../../../types/public/team-page';
import { ReactComponent as DefaultTeamMemberIcon } from '../../../../assets/icons/team-member-blank.svg';
import { useState } from 'react';

interface TeamMemberProps {
    member: MemberCard;
}

export const TeamMemberCard = ({ member }: TeamMemberProps) => {
    const [error, setError] = useState(false);

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
