import { ReactComponent as DragIcon } from '../../../../../assets/icons/dragger.svg';
import { DragPreviewModel } from '../../../../../types/admin/common';
import { MemberComponent } from '../member-component/MemberComponent';
import './MemberDragPreview.scss';
import { TeamMember } from '../../../../../types/admin/team-members';

export type MemberDragPreviewProps = {
    dragPreview: DragPreviewModel<TeamMember>;
};
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
                    <DragIcon aria-hidden={true} />
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
