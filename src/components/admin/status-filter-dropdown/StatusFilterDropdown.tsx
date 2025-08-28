import { Select } from '../select/Select';
import { mapLabelToStatus, VisibilityStatus } from '../../../types/admin/common';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

interface StatusFilterDropdownProps {
    onStatusFilterChange: (statusFilter: VisibilityStatus | undefined) => void;
}

export const StatusFilterDropdown = ({ onStatusFilterChange }: StatusFilterDropdownProps) => {
    return (
        <Select<VisibilityStatus | undefined> onValueChange={onStatusFilterChange}>
            {Object.entries(COMMON_TEXT_ADMIN.FILTER.STATUS).map(([, value], index) => (
                <Select.Option key={index} value={mapLabelToStatus(value)} name={value} />
            ))}
        </Select>
    );
};
