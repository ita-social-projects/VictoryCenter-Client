import React from "react";
import {Member} from "../members-list/MembersList";

export const MemberComponent = ({member, handleOnDeleteMember, handleOnEditMember}: {member: Member, handleOnDeleteMember: (fullName: string) => void, handleOnEditMember: (id: number) => void }) => {
    return (<div className='members-item'>
        <div className='members-profile'>
            <img src={member.img} alt={`${member.fullName}-img`}/>
            <p>{member.fullName}</p>
        </div>
        <div className='members-position'>
            <p>{member.description}</p>
        </div>
        <div className='members-controls'>
            <div className={`members-status ${member.status === "Чернетка" ? "members-status-draft" : "members-status-published"}`}>
                <span>
                    •
                </span>
                <span >
                    {member.status}
                </span>
            </div>
            <div className='members-actions'>
                <div onClick={() => handleOnEditMember(member.id)} className='members-actions-edit'/>
                <div onClick={() => handleOnDeleteMember(member.fullName)} className='members-actions-delete'/>
            </div>
        </div>
    </div>);
}
