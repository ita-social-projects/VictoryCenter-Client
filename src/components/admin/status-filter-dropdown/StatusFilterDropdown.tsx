import { Select } from '../../common/select/Select';
import { VisibilityStatus } from '../../../types/admin/common';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { mapLabelToStatus } from '../../../utils/functions/mappers/common/status-mappers';

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
