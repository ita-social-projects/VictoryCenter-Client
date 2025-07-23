import React from 'react';
import { VisibilityStatus } from '../../../types/Common';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import './status.scss';

export interface StatusProps {
    status: VisibilityStatus;
}

const getStatusClass = (statusType: VisibilityStatus) => {
    return statusType === 'Draft' ? 'status-draft' : 'status-published';
};

const statusTypeToText = (statusType: VisibilityStatus) => {
    switch (statusType) {
        case 'Draft':
            return COMMON_TEXT_ADMIN.STATUS.DRAFT;
        case 'Published':
            return COMMON_TEXT_ADMIN.STATUS.PUBLISHED;
        default:
            return statusType;
    }
};

export const Status = ({ status }: StatusProps) => {
    return (
        <div className={`status ${getStatusClass(status)}`}>
            <span>•</span>
            <span>{statusTypeToText(status)}</span>
        </div>
    );
};

export default Status;
