import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import './MemberComponent.scss';
import { ReactComponent as BlankUserImage } from '../../../../../assets/icons/blank-user.svg';
import { mapImageToBase64 } from '../../../../../utils/functions/map-image-to-base-64/map-image-to-base-64';
import { TeamMember } from '../../../../../types/admin/team-members';
import { VisibilityStatusLabel } from '../../../../../components/admin/visibility-status-label/VisibilityStatusLabel';

export interface MemberComponentProps {
    member: TeamMember;
    handleOnDeleteMember: (member: TeamMember) => void;
    handleOnEditMember: (member: TeamMember) => void;
}

export const MemberComponent = ({ member, handleOnDeleteMember, handleOnEditMember }: MemberComponentProps) => {
    const memberImage = mapImageToBase64(member.image);
    const isMemberImageValid = !!memberImage;

    const handleEditMember = () => {
        handleOnEditMember(member);
    };

    const handleDeleteMember = () => {
        handleOnDeleteMember(member);
    };

    return (
        <div className="members-item">
            <div className="members-profile">
                {isMemberImageValid ? (
                    <img
                        src={memberImage}
                        alt={`${TEAM_MEMBERS_TEXT.FORM.LABEL.PHOTO}-${member.fullName}`}
                        className="member-image"
                    />
                ) : (
                    <BlankUserImage className="member-image" />
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
