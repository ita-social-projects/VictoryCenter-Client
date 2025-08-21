import { VisibilityStatus } from '../../../../../types/admin/common';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { Select } from '../../../../../components/admin/select/Select';
import { SearchBar } from '../../../../../components/admin/search-bar/SearchBar';
import { Button } from '../../../../../components/admin/button/Button';
import PlusIcon from '../../../../../assets/icons/plus.svg';
import './TeamPageToolbar.scss';
export interface TeamPageToolbarProps {
    onSearchQueryChange: (query: string) => void;
    onStatusFilterChange: (status: VisibilityStatus | undefined) => void;
    onAddMember: () => void;
}

export const TeamPageToolbar = ({ onSearchQueryChange, onStatusFilterChange, onAddMember }: TeamPageToolbarProps) => {
    return (
        <div className="toolbar" data-testid="team-page-toolbar">
            <div>
                <SearchBar<string>
                    getSuggestionKey={(suggestion) => suggestion}
                    hasMore={false}
                    suggestions={[]}
                    onLoadMore={() => {}}
                    onQueryChange={onSearchQueryChange}
                    isLoading={false}
                    getSuggestionLabel={(suggestion) => suggestion}
                    onSuggestionSelect={(_) => {}}
                    placeholder={TEAM_MEMBERS_TEXT.SEARCH.INPUT_FULLNAME}
                />
            </div>
            <div className="toolbar-actions">
                <Select<VisibilityStatus | undefined> onValueChange={onStatusFilterChange} data-testid="status-filter">
                    <Select.Option key={1} value={undefined} name={COMMON_TEXT_ADMIN.FILTER.STATUS.ALL} />
                    <Select.Option<VisibilityStatus>
                        key={2}
                        value={VisibilityStatus.Published}
                        name={COMMON_TEXT_ADMIN.FILTER.STATUS.PUBLISHED}
                    />
                    <Select.Option<VisibilityStatus>
                        key={3}
                        value={VisibilityStatus.Draft}
                        name={COMMON_TEXT_ADMIN.FILTER.STATUS.DRAFT}
                    />
                </Select>
                <Button onClick={onAddMember} buttonStyle="primary">
                    {TEAM_MEMBERS_TEXT.BUTTON.ADD_MEMBER}
                    <img src={PlusIcon} alt={TEAM_MEMBERS_TEXT.BUTTON.ADD_MEMBER} />
                </Button>
            </div>
        </div>
    );
};
