import { MemberCard } from '../../../../types/public/team-page';

interface TeamMemberProps {
    member: MemberCard;
}

export const TeamMemberCard = ({ member }: TeamMemberProps) => {
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
