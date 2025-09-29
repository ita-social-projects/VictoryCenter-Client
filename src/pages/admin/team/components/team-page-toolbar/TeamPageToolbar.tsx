import { VisibilityStatus } from '../../../../../types/admin/common';
import { TEAM_MEMBERS_TEXT, TEAM_SEARCH } from '../../../../../const/admin/team';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '../../../../../const/admin/common';
import { Select } from '../../../../../components/admin/select/Select';
import { SearchBar } from '../../../../../components/admin/search-bar/SearchBar';
import { Button } from '../../../../../components/admin/button/Button';
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/plus.svg';
import './TeamPageToolbar.scss';
import { TeamCategory, TeamMember } from '../../../../../types/admin/team-members';
import { TeamMemberSearchItem } from '../../../../../components/admin/search-bar/team-member-search-item/TeamMemberSearchItem';
import { forwardRef, useMemo } from 'react';
import {
    SearchItemContentRef,
    SearchItemContentRenderProps,
} from '../../../../../components/admin/search-bar/search-item-wrapper/SearchItemWrapper';

export interface TeamPageToolbarProps {
    onSearchQueryChange: (query: string) => void;
    onStatusFilterChange: (status: VisibilityStatus | undefined) => void;
    onAddMember: () => void;
    searchItems: TeamMember[];
    isSearchLoading: boolean;
    searchHasMore: boolean;
    onSearchLoadMore: () => void;
    categories: TeamCategory[];
    onSearchItemSelect: (item: TeamMember) => void;
    onSearchClear: () => void;
    statusResetKey?: number;
}
const TeamMemberItemRenderer = forwardRef<
    SearchItemContentRef,
    SearchItemContentRenderProps<TeamMember> & { categories: TeamCategory[] }
>(({ categories, ...props }, ref) => <TeamMemberSearchItem {...props} categories={categories} ref={ref} />);

const createItemRenderer = (categories: TeamCategory[]) =>
    forwardRef<SearchItemContentRef, SearchItemContentRenderProps<TeamMember>>((props, ref) => (
        <TeamMemberItemRenderer {...props} categories={categories} ref={ref} />
    ));

export const TeamPageToolbar = ({
    onSearchQueryChange,
    onStatusFilterChange,
    onAddMember,
    searchItems,
    isSearchLoading,
    searchHasMore,
    onSearchLoadMore,
    categories,
    onSearchItemSelect,
    onSearchClear,
    statusResetKey,
}: TeamPageToolbarProps) => {
    const itemRenderer = useMemo(() => createItemRenderer(categories), [categories]);

    return (
        <div className="toolbar" data-testid="team-page-toolbar">
            <div className="toolbar-search">
                <SearchBar<TeamMember>
                    searchItems={searchItems}
                    isLoading={isSearchLoading}
                    hasMore={searchHasMore}
                    onLoadMore={onSearchLoadMore}
                    onQueryChange={onSearchQueryChange}
                    getSearchItemKey={(m) => m.id}
                    getSearchItemLabel={(m) => m.fullName}
                    onSearchItemSelect={onSearchItemSelect}
                    renderSearchItemComponent={itemRenderer}
                    placeholder={TEAM_MEMBERS_TEXT.SEARCH.INPUT_FULLNAME}
                    notFoundMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                    minCharactersToSearch={TEAM_SEARCH.MIN_CHARACTERS_TO_SEARCH}
                    searchDelayMs={UI_CONFIG.SEARCH_BAR.SEARCH_DELAY_MS}
                    onClear={onSearchClear}
                />
            </div>
            <div className="toolbar-actions">
                <Select<VisibilityStatus | undefined>
                    key={statusResetKey}
                    onValueChange={onStatusFilterChange}
                    data-testid="status-filter"
                >
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
