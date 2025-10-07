import { VisibilityStatus } from '../../../../../types/admin/common';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '../../../../../const/admin/common';
import { Select } from '../../../../../components/common/select/Select';
import { SearchBar } from '../../../../../components/admin/search-bar/SearchBar';
import { Button } from '../../../../../components/admin/button/Button';
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/plus.svg';
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
                    getSearchItemKey={(suggestion) => suggestion}
                    hasMore={false}
                    searchItems={[]}
                    onLoadMore={() => {}}
                    onQueryChange={onSearchQueryChange}
                    isLoading={false}
                    getSearchItemLabel={(suggestion) => suggestion}
                    onSearchItemSelect={(_) => {}}
                    placeholder={TEAM_MEMBERS_TEXT.SEARCH.INPUT_FULLNAME}
                    notFoundMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                    minCharactersToSearch={UI_CONFIG.SEARCH_BAR.MIN_CHARACTERS_FOR_SEARCH}
                    searchDelayMs={UI_CONFIG.SEARCH_BAR.SEARCH_DELAY_MS}
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
                    <PlusIcon />
                </Button>
            </div>
        </div>
    );
};
