import { Select } from '@/components/common/select/Select';
import { VisibilityStatus } from '@/types/admin/common';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { mapLabelToStatus } from '@/utils/functions/mappers/common/visibility-status/status-mappers';

export interface StatusFilterDropdownProps {
    value: VisibilityStatus | undefined;
    onStatusFilterChange: (statusFilter: VisibilityStatus | undefined) => void;
}

const STATUS_OPTIONS = Object.values(COMMON_TEXT_ADMIN.FILTER.STATUS).map((label) => ({
    value: mapLabelToStatus(label),
    name: label,
}));

export const StatusFilterDropdown = ({ value, onStatusFilterChange }: StatusFilterDropdownProps) => {
    return (
        <Select<VisibilityStatus | undefined> onValueChange={onStatusFilterChange} value={value}>
            {STATUS_OPTIONS.map((option) => (
                <Select.Option key={String(option.value)} value={option.value} name={option.name} />
            ))}
        </Select>
    );
};
