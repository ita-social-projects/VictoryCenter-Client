import { Button } from "../../../../../components/common/button/Button";
import { Select } from "../../../../../components/common/select/Select";
import { Input } from "../../../../../components/common/input/Input";
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from "../../../../../const/admin/common";
import { VisibilityStatus } from "../../../../../types/Common";
import PlusIcon from "../../../../../assets/icons/plus.svg";

export type ProgramPageToolbarProps = {
    onSearchQueryChange: (query: string) => void;
    onStatusFilterChange: (categoryFilter: VisibilityStatus | undefined) => void;
    autocompleteValues: string[];
    onAddProgram : () => void;
}

export const ProgramsPageToolbar = ({
                                    onSearchQueryChange,
                                    onStatusFilterChange,
                                    autocompleteValues,
                                    onAddProgram,
                                }: ProgramPageToolbarProps) => {
    return (
        <>
            <div className="toolbar">
                <div className="toolbar-search">
                    <Input
                        onChange={(e) => {
                            onSearchQueryChange(e);
                        }}
                        autocompleteValues={autocompleteValues}
                        data-testid="search-input"
                        placeholder={COMMON_TEXT_ADMIN.FILTER.SEARCH_BY_NAME}/>
                </div>
                <div className="toolbar-actions">
                    <Select<VisibilityStatus | undefined> onValueChange={onStatusFilterChange} data-testid="status-filter">
                        <Select.Option
                            key={1}
                            value={undefined}
                            name={COMMON_TEXT_ADMIN.FILTER.STATUS.ALL}/>
                        <Select.Option<VisibilityStatus>
                            key={2}
                            value={'Published'}
                            name={COMMON_TEXT_ADMIN.FILTER.STATUS.PUBLISHED}/>
                        <Select.Option<VisibilityStatus>
                            key={3}
                            value={'Draft'}
                            name={COMMON_TEXT_ADMIN.FILTER.STATUS.DRAFT}/>
                    </Select>
                    <Button
                        onClick={onAddProgram}
                        buttonStyle="primary"
                        data-testid="add-program-button"
                    >
                        {PROGRAMS_TEXT.BUTTON.ADD_PROGRAM}{' '}
                        <img src={PlusIcon} alt="plus"/>
                    </Button>
                </div>
            </div>
        </>
    );
};

export default ProgramsPageToolbar;
