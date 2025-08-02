import classNames from 'classnames';
import './MemberComponent.scss';
import BlankUserImage from '../../../../../assets/icons/blank-user.svg';
import { mapImageToBase64 } from '../../../../../utils/functions/map-image-to-base-64/map-image-to-base-64';
import { TeamMember } from '../../../../../types/admin/team-members';
export const MemberComponent = ({
    member,
    handleOnDeleteMember,
    handleOnEditMember,
}: {
    member: TeamMember;
    handleOnDeleteMember: (fullName: string) => void;
    handleOnEditMember: (id: number) => void;
}) => {
    return (
        <div className="members-item">
            <div className="members-profile">
                <img src={mapImageToBase64(member.img) || BlankUserImage} alt={`${member.fullName}-img`} />
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
