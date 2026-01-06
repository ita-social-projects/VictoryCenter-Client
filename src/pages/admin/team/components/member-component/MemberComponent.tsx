import { useState, useEffect } from 'react';
import { TEAM_MEMBERS_TEXT } from '@/const/admin/team';
import { ReactComponent as BlankUserImage } from '@/assets/icons/blank-user.svg';
import { TeamMember, TeamMemberLocalizableFields } from '@/types/admin/team-members';
import { VisibilityStatusLabel } from '@/components/admin/visibility-status-label/VisibilityStatusLabel';
import { returnDisplayedLocalization } from '@/utils/functions/localization/localization';
import { LocalizationLanguage } from '@/types/common/language';
import { LocalizationStatuses } from '@/components/admin/localization-statuses/LocalizationStatuses';
import './MemberComponent.scss';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

export interface MemberComponentProps {
    member: TeamMember;
    language: LocalizationLanguage;
    translationLanguages: LocalizationLanguage[];
    handleOnDeleteMember: (member: TeamMember) => void;
    handleOnEditMember: (member: TeamMember) => void;
    handleOnTranslateMember: (member: TeamMember) => void;
}

export const MemberComponent = ({
    member,
    language,
    translationLanguages,
    handleOnDeleteMember,
    handleOnEditMember,
    handleOnTranslateMember,
}: MemberComponentProps) => {
    const [error, setError] = useState(false);
    const [textFields, setTextFields] = useState<TeamMemberLocalizableFields>();
    const imageUrl = member.image && 'url' in member.image ? member.image.url : null;

    useEffect(() => {
        setError(false);
    }, [imageUrl]);

    useEffect(() => {
        const displayedLocalization = returnDisplayedLocalization(member, language.code);
        setTextFields({
            fullName: displayedLocalization?.fullName || member.fullName,
            description: displayedLocalization?.description || member.description,
        });
    }, [language, member]);

    const handleTranslateMember = () => {
        handleOnTranslateMember(member);
    };

    const handleEditMember = () => {
        handleOnEditMember(member);
    };

    const handleDeleteMember = () => {
        handleOnDeleteMember(member);
    };

    return (
        <div className="members-item">
            <div className="members-profile">
                {error || !imageUrl ? (
                    <BlankUserImage className="member-icon" />
                ) : (
                    <img
                        src={imageUrl}
                        alt={`${TEAM_MEMBERS_TEXT.FORM.LABEL.PHOTO}-${member.fullName}`}
                        onError={() => setError(true)}
                    />
                )}
                <div className="members-profile-data">
                    <p>{textFields?.fullName}</p>
                    <LocalizationStatuses languages={translationLanguages} localizedEntity={member} />
                </div>
            </div>
            <div className="members-position">
                <p>{textFields?.description}</p>
            </div>
            <div className="members-controls">
                <div className="program-info-status">
                    <VisibilityStatusLabel status={member.status} />
                </div>
                <div className="members-actions">
                    <button
                        aria-label={TEAM_MEMBERS_TEXT.ACTIONS.TRANSLATE}
                        type="button"
                        onClick={handleTranslateMember}
                        className="members-actions-translate"
                    />
                    <button
                        aria-label={TEAM_MEMBERS_TEXT.ACTIONS.EDIT}
                        type="button"
                        onClick={handleEditMember}
                        className="members-actions-edit"
                    />
                    <button
                        aria-label={TEAM_MEMBERS_TEXT.ACTIONS.DELETE}
                        type="button"
                        onClick={handleDeleteMember}
                        className="members-actions-delete"
                    />
                </div>
            </div>
        </div>
    );
};
