import React from 'react';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { VisibilityStatus } from '../../../types/common';
import './Status.scss';

export interface StatusProps {
    status: VisibilityStatus;
}

const getStatusClass = (statusType: VisibilityStatus) => {
    switch (statusType) {
        case 'Published':
            return 'status-published';
        case 'Draft':
            return 'status-draft';
        default:
            return 'status-draft';
    }
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
