import React from 'react';
import { VisibilityStatus } from "../../../types/Common";
import { COMMON_TEXT_ADMIN } from "../../../const/admin/common";

const Status = ({ status }: { status: VisibilityStatus }) => {
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

    const getStatusClass = (statusType: VisibilityStatus) => {
        return statusType === 'Draft' ? 'draft' : 'published';
    };

    return (
        <div className={`program-status ${getStatusClass(status)}`}>
            <span>•</span>
            <span>{statusTypeToText(status)}</span>
        </div>
    );
};

export default Status;
