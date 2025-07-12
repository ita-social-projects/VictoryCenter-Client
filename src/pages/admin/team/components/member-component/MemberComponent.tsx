import React from 'react';
import classNames from 'classnames';
import { Member } from '../members-list/MembersList';
import './member-component.scss';
import BlankUserImage from '../../../../../assets/images/admin/blank-user.svg';
export const MemberComponent = ({
    member,
    handleOnDeleteMember,
    handleOnEditMember,
}: {
    member: Member;
    handleOnDeleteMember: (fullName: string) => void;
    handleOnEditMember: (id: number) => void;
}) => {
    return (
        <div className="members-item">
            <div className="members-profile">
                <img src={member.img || BlankUserImage} alt={`${member.fullName}-img`} />
                <p>{member.fullName}</p>
            </div>
            <div className="members-position">
                <p>{member.description}</p>
            </div>
            <div className="members-controls">
                <div
                    data-testid={`member-status-${member.id}`}
                    className={classNames('members-status', {
                        'members-status-draft': member.status === 'Чернетка',
                        'members-status-published': member.status !== 'Чернетка',
                    })}
                >
                    <span>•</span>
                    <span>{member.status}</span>
                </div>
                <div className="members-actions">
                    <button
                        type="button"
                        onClick={() => handleOnEditMember(member.id)}
                        className="members-actions-edit"
                    />
                    <button
                        type="button"
                        onClick={() => handleOnDeleteMember(member.fullName)}
                        className="members-actions-delete"
                    />
                </div>
            </div>
        </div>
    );
};
