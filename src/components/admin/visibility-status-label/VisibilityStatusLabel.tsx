import classNames from 'classnames';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import styles from './VisibilityStatusLabel.module.scss';
import { VisibilityStatus } from '../../../types/admin/common';

export interface VisibilityStatusLabelProps {
    status: VisibilityStatus;
}

export const visibilityStatusToText = (statusType: VisibilityStatus) => {
    switch (statusType) {
        case VisibilityStatus.Published:
            return COMMON_TEXT_ADMIN.STATUS.PUBLISHED;
        case VisibilityStatus.Draft:
            return COMMON_TEXT_ADMIN.STATUS.DRAFT;
        default:
            return statusType;
    }
};

export const VisibilityStatusLabel = ({ status }: VisibilityStatusLabelProps) => {
    return (
        <div
            className={classNames(styles['status'], {
                [styles['status-published']]: status === VisibilityStatus.Published,
                [styles['status-draft']]: status === VisibilityStatus.Draft,
            })}
        >
            <span>•</span>
            <span>{visibilityStatusToText(status)}</span>
        </div>
    );
};
