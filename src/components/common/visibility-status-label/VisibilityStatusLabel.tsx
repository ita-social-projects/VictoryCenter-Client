import React from 'react';
import classNames from 'classnames';
import { VisibilityStatus } from '../../../types/admin/Common';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import './visibility-status-label.scss';

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
            className={classNames('status', {
                'status-published': status === VisibilityStatus.Published,
                'status-draft': status === VisibilityStatus.Draft,
            })}
        >
            <span>•</span>
            <span>{visibilityStatusToText(status)}</span>
        </div>
    );
};
