import { MemberCard } from '../../../../types/public/team-page';
import { ReactComponent as DefaultTeamMemberIcon } from '../../../../assets/icons/team-member-blank.svg';

interface TeamMemberProps {
    member: MemberCard;
}

export const TeamMemberCard = ({ member }: TeamMemberProps) => {
    return (
        <div className="team-member">
            {member.photo ? (
                <img src={member.photo} alt={member.name} className="member-photo" />
            ) : (
                <DefaultTeamMemberIcon className="member-photo" />
            )}
            <div>
                <p className="member-name">{member.name}</p>
                <p className="member-role">{member.role}</p>
            </div>
        </div>
    );
};
