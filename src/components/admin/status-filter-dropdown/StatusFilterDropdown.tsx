import { Select } from '../../common/select/Select';
import { VisibilityStatus } from '../../../types/admin/common';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { mapLabelToStatus } from '../../../utils/functions/mappers/common/status-mappers';

export interface StatusFilterDropdownProps {
    value: VisibilityStatus | undefined;
    onStatusFilterChange: (statusFilter: VisibilityStatus | undefined) => void;
}

export const StatusFilterDropdown = ({ value, onStatusFilterChange }: StatusFilterDropdownProps) => {
    return (
        <Select<VisibilityStatus | undefined> onValueChange={onStatusFilterChange} value={value}>
            {Object.entries(COMMON_TEXT_ADMIN.FILTER.STATUS).map(([, label], index) => (
                <Select.Option key={index} value={mapLabelToStatus(label)} name={label} />
            ))}
        </Select>
    );
};
