import { Button } from '../../../../../components/admin/button/Button';
import { SearchBar } from '../../../../../components/admin/search-bar/SearchBar';
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { VisibilityStatus } from '../../../../../types/admin/common';
import PlusIcon from '../../../../../assets/icons/plus.svg';
import './ProgramsPageToolbar.scss';
import { StatusFilterDropdown } from '../../../../../components/admin/status-filter-dropdown/StatusFilterDropdown';

export interface ProgramPageToolbarProps {
    onSearchQueryChange: (query: string) => void;
    onStatusFilterChange: (categoryFilter: VisibilityStatus | undefined) => void;
    onAddProgram: () => void;
}

export const ProgramsPageToolbar = ({
    onSearchQueryChange,
    onStatusFilterChange,
    onAddProgram,
}: ProgramPageToolbarProps) => {
    return (
        <>
            <div className="programs-toolbar">
                <div className="programs-toolbar-search">
                    <SearchBar
                        onChange={(e) => {
                            onSearchQueryChange(e);
                        }}
                        autocompleteValues={[]}
                        data-testid="search-input"
                        placeholder={COMMON_TEXT_ADMIN.FILTER.SEARCH_BY_NAME}
                    />
                </div>
                <div className="programs-toolbar-actions">
                    <StatusFilterDropdown onStatusFilterChange={onStatusFilterChange} />
                    <Button onClick={onAddProgram} buttonStyle="primary" data-testid="add-program-button">
                        {PROGRAMS_TEXT.BUTTON.ADD_PROGRAM} <img src={PlusIcon} alt="plus" />
                    </Button>
                </div>
            </div>
        </>
    );
};
