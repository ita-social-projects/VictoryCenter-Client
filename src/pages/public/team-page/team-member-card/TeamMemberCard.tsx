import { MemberCard } from '@/types/public/team-page';
import { ReactComponent as DefaultTeamMemberIcon } from '@/assets/icons/team-member-blank.svg';
import { useState, useEffect } from 'react';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';

interface TeamMemberProps {
    member: MemberCard;
}

export const TeamMemberCard = ({ member }: TeamMemberProps) => {
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
    }, [member.photo]);

    const translated = useGetLocalization(member.localizations, {
        fullName: member.name,
        description: member.role,
    });

    return (
        <div className="team-member">
            {error || !member.photo ? (
                <DefaultTeamMemberIcon className="member-photo" />
            ) : (
                <img src={member.photo} alt={member.name} className="member-photo" onError={() => setError(true)} />
            )}
            <div>
                <p className="member-name">{translated.fullName}</p>
                <p className="member-role">{translated.description}</p>
            </div>
        </div>
    );
};
