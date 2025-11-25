import { VisibilityStatus } from '../../../../../types/admin/common';
import { TEAM_MEMBERS_TEXT, TEAM_SEARCH } from '../../../../../const/admin/team';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '../../../../../const/admin/common';
import { SearchBar } from '../../../../../components/admin/search-bar/SearchBar';
import { StatusFilterDropdown } from '../../../../../components/admin/status-filter-dropdown/StatusFilterDropdown';
import { Button } from '../../../../../components/admin/button/Button';
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/plus.svg';
import './TeamPageToolbar.scss';
import { TeamMember } from '../../../../../types/admin/team-members';
import { TeamCategory } from '../../../../../types/admin/team-category';
import { TeamMemberSearchItem } from '../../../../../components/admin/search-bar/team-member-search-item/TeamMemberSearchItem';
import { forwardRef, useMemo } from 'react';
import {
    SearchItemContentRef,
    SearchItemContentRenderProps,
} from '../../../../../components/admin/search-bar/search-item-wrapper/SearchItemWrapper';
import {
    LocalizationToolkit,
    LocalizationToolkitProps,
} from '../../../../../components/admin/localization-toolkit/LocalizationToolkit';

export interface TeamPageToolbarProps extends LocalizationToolkitProps {
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
    languages,
    onLanguageChange,
    onTranslationStatusFilterChange,
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
                <LocalizationToolkit
                    languages={languages}
                    onLanguageChange={onLanguageChange}
                    onTranslationStatusFilterChange={onTranslationStatusFilterChange}
                />
                <StatusFilterDropdown onStatusFilterChange={onStatusFilterChange} />
                <Button onClick={onAddMember} buttonStyle="primary">
                    {TEAM_MEMBERS_TEXT.BUTTON.ADD_MEMBER}
                    <PlusIcon />
                </Button>
            </div>
        </div>
    );
};
