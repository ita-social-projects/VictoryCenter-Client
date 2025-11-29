import { MemberCard } from '../../../../types/public/team-page';
import { ReactComponent as DefaultTeamMemberIcon } from '../../../../assets/icons/team-member-blank.svg';
import { useState, useEffect } from 'react';

interface TeamMemberProps {
    member: MemberCard;
    stylesModule: Record<string, string>;
}

export const TeamMemberCard = ({ member, stylesModule }: TeamMemberProps) => {
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false);
    }, [member.photo]);

    return (
        <div className={stylesModule['team-member']}>
            {error || !member.photo ? (
                <DefaultTeamMemberIcon className={stylesModule['member-photo']} />
            ) : (
                <img
                    src={member.photo}
                    alt={member.name}
                    className={stylesModule['member-photo']}
                    onError={() => setError(true)}
                />
            )}
            <div>
                <p className={stylesModule['member-name']}>{member.name}</p>
                <p className={stylesModule['member-role']}>{member.role}</p>
            </div>
        </div>
    );
};
