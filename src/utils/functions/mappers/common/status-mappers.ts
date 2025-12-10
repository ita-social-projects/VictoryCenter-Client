import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { VisibilityStatus, StatusFilter } from '@/types/admin/common';

const VisibilityLabels = [COMMON_TEXT_ADMIN.FILTER.STATUS.DRAFT, COMMON_TEXT_ADMIN.FILTER.STATUS.PUBLISHED] as const;

export const mapStatusToLabel = (status: VisibilityStatus): string => {
    return VisibilityLabels[status];
};

export const mapLabelToStatus = (label: string): VisibilityStatus | undefined => {
    const index = VisibilityLabels.indexOf(label as (typeof VisibilityLabels)[number]);
    return index === -1 ? undefined : index;
};
export const mapStatusFilterToStatus = (filter: StatusFilter): VisibilityStatus | null => {
    switch (filter) {
        case 'Опубліковано':
            return VisibilityStatus.Published;
        case 'Чернетка':
            return VisibilityStatus.Draft;
        case 'Усі':
        default:
            return null;
    }
};
