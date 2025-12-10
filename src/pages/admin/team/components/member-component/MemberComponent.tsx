import { useState, useEffect } from 'react';
import { TEAM_MEMBERS_TEXT } from '@/const/admin/team';
import './MemberComponent.scss';
import { ReactComponent as BlankUserImage } from '@/assets/icons/blank-user.svg';
import { TeamMember } from '@/types/admin/team-members';
import { VisibilityStatusLabel } from '@/components/admin/visibility-status-label/VisibilityStatusLabel';

export interface MemberComponentProps {
    member: TeamMember;
    handleOnDeleteMember: (member: TeamMember) => void;
    handleOnEditMember: (member: TeamMember) => void;
}

export const MemberComponent = ({ member, handleOnDeleteMember, handleOnEditMember }: MemberComponentProps) => {
    const [error, setError] = useState(false);
    const imageUrl = member.image && 'url' in member.image ? member.image.url : null;

    useEffect(() => {
        setError(false);
    }, [imageUrl]);

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
                <p>{member.fullName}</p>
            </div>
            <div className="members-position">
                <p>{member.description}</p>
            </div>
            <div className="members-controls">
                <div className="program-info-status">
                    <VisibilityStatusLabel status={member.status} />
                </div>
                <div className="members-actions">
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
