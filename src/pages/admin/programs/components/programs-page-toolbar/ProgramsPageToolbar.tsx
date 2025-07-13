import { Button } from "../../../../../components/common/button/Button";
import { Select } from "../../../../../components/common/select/Select";
import { Input } from "../../../../../components/common/input/Input";
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { ProgramStatus } from "../../../../../types/ProgramAdminPage";
import PlusIcon from "../../../../../assets/icons/plus.svg";

export type StatusFilter = 'all' | 'published' | 'draft';

export type ProgramPageToolbarProps = {
    onSearchQueryChange: (query: string) => void;
    onStatusFilterChange: (categoryFilter: ProgramStatus | undefined) => void;
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
                        placeholder={PROGRAMS_TEXT.FILTER.SEARCH_BY_NAME}/>
                </div>
                <div className="toolbar-actions">
                    <Select<ProgramStatus | undefined> onValueChange={onStatusFilterChange} data-testid="status-filter">
                        <Select.Option
                            key={1}
                            value={undefined}
                            name={PROGRAMS_TEXT.FILTER.STATUS.ALL}/>
                        <Select.Option<ProgramStatus>
                            key={2}
                            value={'Published'}
                            name={PROGRAMS_TEXT.FILTER.STATUS.PUBLISHED}/>
                        <Select.Option<ProgramStatus>
                            key={3}
                            value={'Draft'}
                            name={PROGRAMS_TEXT.FILTER.STATUS.DRAFT}/>
                    </Select>
                    <Button
                        onClick={onAddProgram}
                        buttonStyle="primary"
                        data-testid="add-program-button"
                    >
                        {PROGRAMS_TEXT.BUTTONS.ADD_PROGRAM}{' '}
                        <img src={PlusIcon} alt="plus"/>
                    </Button>
                </div>
            </div>
        </>
    );
};
