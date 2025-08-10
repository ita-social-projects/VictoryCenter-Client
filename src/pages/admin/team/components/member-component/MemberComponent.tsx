import React from 'react';
import { TeamMember } from '../../../../../types/admin/TeamMembers';
import './member-component.scss';
import BlankUserImage from '../../../../../assets/images/admin/blank-user.svg';
import { mapImageToBase64 } from '../../../../../utils/functions/mapImageToBase64';
import { VisibilityStatusLabel } from '../../../../../components/common/visibility-status-label/VisibilityStatusLabel';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';

export interface MemberComponentProps {
    member: TeamMember;
    handleOnDeleteMember: (member: TeamMember) => void;
    handleOnEditMember: (member: TeamMember) => void;
}

export const MemberComponent = ({ member, handleOnDeleteMember, handleOnEditMember }: MemberComponentProps) => {
    const handleEditMember = () => {
        handleOnEditMember(member);
    };

    const handleDeleteMember = () => {
        handleOnDeleteMember(member);
    };

    return (
        <div className="members-item">
            <div className="members-profile">
                <img
                    src={mapImageToBase64(member.image) || BlankUserImage}
                    alt={`${TEAM_MEMBERS_TEXT.FORM.LABEL.PHOTO}-${member.fullName}`}
                />
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
