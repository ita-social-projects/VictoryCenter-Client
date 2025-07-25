import DragIcon from '../../../../../assets/icons/dragger.svg';
import React from 'react';
import { DragPreviewModel } from '../../../../../types/admin/Common';
import { MemberComponent } from '../member-component/MemberComponent';
import './member-drag-preview.scss';
import { TeamMember } from '../../../../../types/admin/TeamMembers';

export type MemberDragPreviewProps = {
    dragPreview: DragPreviewModel<TeamMember>;
};
export const MemberDragPreview = ({ dragPreview }: MemberDragPreviewProps) => {
    if (!dragPreview.visible || !dragPreview.member) return <></>;

    return (
        <div
            className="drag-preview"
            style={{
                left: dragPreview.x - 45,
                top: dragPreview.y - 55,
            }}
        >
            <div key={dragPreview.member.fullName} className="members-wrapper">
                <div className="members-dragger">
                    <img src={DragIcon} alt="dragger" />
                </div>
                <MemberComponent
                    member={dragPreview.member}
                    handleOnDeleteMember={() => {}}
                    handleOnEditMember={() => {}}
                ></MemberComponent>
            </div>
        </div>
    );
};
