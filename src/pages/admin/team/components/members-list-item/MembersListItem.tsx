import { TeamMember } from '../../../../../types/admin/TeamMembers';
import DragIcon from '../../../../../assets/icons/dragger.svg';
import React from 'react';
import { MemberComponent } from '../member-component/MemberComponent';
import './members-list-item.scss';
import classNames from 'classnames';

type MembersListItemProps = {
    member: TeamMember;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    handleDrag: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDragEnd: () => void;
    handleDrop: (index: number) => void;
    handleOnDeleteMember: (fullName: string) => void;
    handleOnEditMember: (id: number) => void;
    index: number;
    draggedIndex: number | null;
};

export const MembersListItem = ({
    draggedIndex,
    index,
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
            className={classNames('members-wrapper', { dragging: draggedIndex === index })}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
        >
            <div
                className="members-dragger"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                role="button"
                aria-label="Drag member"
                tabIndex={0}
            >
                <img src={DragIcon} alt="Drag Handle" />
            </div>

            <MemberComponent
                member={member}
                handleOnDeleteMember={handleOnDeleteMember}
                handleOnEditMember={handleOnEditMember}
            />
        </div>
    );
};
