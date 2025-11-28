import { useState, useEffect } from 'react';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import styles from './MemberComponent.module.scss';
import { ReactComponent as BlankUserImage } from '../../../../../assets/icons/blank-user.svg';
import { TeamMember } from '../../../../../types/admin/team-members';
import { VisibilityStatusLabel } from '../../../../../components/admin/visibility-status-label/VisibilityStatusLabel';

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
        <div className={styles['members-item']}>
            <div className={styles['members-profile']}>
                {error || !imageUrl ? (
                    <BlankUserImage className={styles['member-icon']} />
                ) : (
                    <img
                        src={imageUrl}
                        alt={`${TEAM_MEMBERS_TEXT.FORM.LABEL.PHOTO}-${member.fullName}`}
                        onError={() => setError(true)}
                    />
                )}
                <p>{member.fullName}</p>
            </div>
            <div className={styles['members-position']}>
                <p>{member.description}</p>
            </div>
            <div className={styles['members-controls']}>
                <div className={styles['program-info-status']}>
                    <VisibilityStatusLabel status={member.status} />
                </div>
                <div className={styles['members-actions']}>
                    <button
                        aria-label={TEAM_MEMBERS_TEXT.ACTIONS.EDIT}
                        type="button"
                        onClick={handleEditMember}
                        className={styles['members-actions-edit']}
                    />
                    <button
                        aria-label={TEAM_MEMBERS_TEXT.ACTIONS.DELETE}
                        type="button"
                        onClick={handleDeleteMember}
                        className={styles['members-actions-delete']}
                    />
                </div>
            </div>
        </div>
    );
};
