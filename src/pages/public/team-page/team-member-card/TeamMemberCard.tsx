import { MemberCard } from '@/types/public/team-page';
import { ReactComponent as DefaultTeamMemberIcon } from '@/assets/icons/team-member-blank.svg';
import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { TeamMemberLocalizableFields } from '@/types/admin/team-members';

interface TeamMemberProps {
    member: MemberCard;
}

export const TeamMemberCard = ({ member }: TeamMemberProps) => {
    const [error, setError] = useState(false);
    const { currentLanguage } = useLocale();
    const [textFields, setTextFields] = useState<TeamMemberLocalizableFields>();

    useEffect(() => {
        setError(false);
    }, [member.photo]);

    useEffect(() => {
        const displayedLocalization = member.localizations?.find(
            (loc) => loc.localizationInfoDto.code === currentLanguage,
        );
        setTextFields({
            fullName: displayedLocalization?.fullName || member.name,
            description: displayedLocalization?.description || member.role,
        });
    }, [currentLanguage, member]);

    return (
        <div className="team-member">
            {error || !member.photo ? (
                <DefaultTeamMemberIcon className="member-photo" />
            ) : (
                <img src={member.photo} alt={member.name} className="member-photo" onError={() => setError(true)} />
            )}
            <div>
                <p className="member-name">{textFields?.fullName}</p>
                <p className="member-role">{textFields?.description}</p>
            </div>
        </div>
    );
};
