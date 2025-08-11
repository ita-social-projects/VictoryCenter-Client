import { TeamMember } from '../../../../../types/admin/team-members';
import DragIcon from '../../../../../assets/icons/dragger.svg';
import React from 'react';
import { MemberComponent } from '../member-component/MemberComponent';
import './MembersListItem.scss';
import classNames from 'classnames';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';

interface MembersListItemProps {
    member: TeamMember;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    handleDrag: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDragEnd: () => void;
    handleDrop: (index: number) => void;
    handleOnDeleteMember: (member: TeamMember) => void;
    handleOnEditMember: (member: TeamMember) => void;
    id: number;
    draggedIndex: number | null;
}

export const MembersListItem = ({
    draggedIndex,
    id,
    member,
    handleDragOver,
    handleDragEnd,
    handleDragStart,
    handleDrop,
    handleDrag,
    handleOnDeleteMember,
    handleOnEditMember,
}: MembersListItemProps) => {
    return (
        <div
            className={classNames('members-wrapper', { dragging: draggedIndex === id })}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(id)}
            onDragEnd={handleDragEnd}
        >
            <div
                className="members-dragger"
                draggable
                onDragStart={(e) => handleDragStart(e, id)}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                role="button"
                aria-label="Drag member"
                tabIndex={0}
            >
                <img src={DragIcon} alt={TEAM_MEMBERS_TEXT.ACTIONS.REORDER} />
            </div>

            <MemberComponent
                member={member}
                handleOnDeleteMember={handleOnDeleteMember}
                handleOnEditMember={handleOnEditMember}
            />
        </div>
    );
};
