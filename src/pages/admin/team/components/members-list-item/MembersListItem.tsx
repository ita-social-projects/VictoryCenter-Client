import {Member} from "../members-list/MembersList";
import DragIcon from "../../../../../assets/icons/dragger.svg";
import React from "react";
import {MemberComponent} from "../member-component/MemberComponent";
import "./members-list-item.scss"

type MembersListItemProps = {
    member: Member,
    handleDragOver: (e: React.DragEvent<HTMLButtonElement>) => void;
    handleDragStart: (e: React.DragEvent<HTMLButtonElement>, index: number) => void;
    handleDrag: (e: React.DragEvent<HTMLButtonElement>) => void;
    handleDragEnd: () => void;
    handleDrop: (index: number) => void;
    handleOnDeleteMember: (fullName: string) => void;
    handleOnEditMember: (id: number) => void;
    index: number;
    draggedIndex: number | null;
};

export const MembersListItem = ({draggedIndex, index, member, handleDragOver, handleDragEnd, handleDragStart, handleDrop, handleDrag, handleOnDeleteMember, handleOnEditMember}: MembersListItemProps) => {
    return (
        <button
            className={`members-wrapper ${draggedIndex === index ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
        >
            <button
                disabled
                className='members-dragger'
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
            >
                <img src={DragIcon} alt="Drag Handle"/>
            </button>
            <MemberComponent member={member} handleOnDeleteMember={handleOnDeleteMember} handleOnEditMember={handleOnEditMember}></MemberComponent>
        </button>
    );
}

