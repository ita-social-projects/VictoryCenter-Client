import DragIcon from '../../../../../assets/icons/dragger.svg';
import { DragPreviewModel } from '../../../../../types/admin/common';
import { MemberComponent } from '../member-component/MemberComponent';
import './MemberDragPreview.scss';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { TeamMember } from '../../../../../types/admin/team-members';

export interface MemberDragPreviewProps {
    dragPreview: DragPreviewModel<TeamMember>;
}

export const MemberDragPreview = ({ dragPreview }: MemberDragPreviewProps) => {
    if (!dragPreview.visible || !dragPreview.item) return <></>;

    return (
        <div
            className="drag-preview"
            style={{
                left: dragPreview.x - 45,
                top: dragPreview.y - 55,
            }}
        >
            <div key={dragPreview.item.fullName} className="members-wrapper">
                <div className="members-dragger">
                    <img src={DragIcon} alt={TEAM_MEMBERS_TEXT.ACTIONS.REORDER} />
                </div>
                <MemberComponent
                    member={dragPreview.item}
                    handleOnDeleteMember={() => {}}
                    handleOnEditMember={() => {}}
                ></MemberComponent>
            </div>
        </div>
    );
};
