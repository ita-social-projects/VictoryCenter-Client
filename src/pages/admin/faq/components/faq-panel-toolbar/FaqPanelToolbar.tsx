import { Button } from '../../../../../components/admin/button/Button';
import { SearchBar } from '../../../../../components/admin/search-bar/SearchBar';
import { StatusFilterDropdown } from '../../../../../components/admin/status-filter-dropdown/StatusFilterDropdown';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { VisibilityStatus } from '../../../../../types/admin/common';
import PlusIcon from '../../../../../assets/icons/plus.svg';
import { FAQ_TEXT } from '../../../../../const/admin/faq';
import './FaqPanelToolbar.scss';

interface FaqPanelToolbarProps {
    onSearchQueryChange: (query: string) => void;
    onStatusFilterChange: (filter: VisibilityStatus | undefined) => void;
    onAddFaq: () => void;
}

export const FaqPanelToolbar = ({ onSearchQueryChange, onStatusFilterChange, onAddFaq }: FaqPanelToolbarProps) => {
    return (
        <div className="faq-toolbar">
            <div className="faq-toolbar-search">
                <SearchBar
                    onChange={(e) => {
                        onSearchQueryChange(e);
                    }}
                    autocompleteValues={[]}
                    data-testid="search-input"
                    placeholder={COMMON_TEXT_ADMIN.FILTER.SEARCH_BY_NAME}
                />
            </div>
            <div className="faq-toolbar-actions">
                <StatusFilterDropdown onStatusFilterChange={onStatusFilterChange} />
                <Button onClick={onAddFaq} buttonStyle="primary">
                    {FAQ_TEXT.BUTTON.ADD_FAQ} <img src={PlusIcon} alt="plus" />
                </Button>
            </div>
        </div>
    );
};
