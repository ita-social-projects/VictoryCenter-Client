import PlusIcon from '../../../../../assets/icons/plus.svg';
import React from 'react';
import { Button } from '../../../../../components/common/button/Button';
import { Select } from '../../../../../components/common/select/Select';
import { Input } from '../../../../../components/common/input/Input';
import { VisibilityStatus } from '../../../../../types/admin/Common';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import './team-page-toolbar.scss';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

export interface TeamPageToolbarProps {
    onSearchQueryChange: (query: string) => void;
    onStatusFilterChange: (status: VisibilityStatus | undefined) => void;
    onAddMember: () => void;
    autocompleteValues: string[];
}

export const TeamPageToolbar = ({
    onSearchQueryChange,
    onStatusFilterChange,
    onAddMember,
    autocompleteValues,
}: TeamPageToolbarProps) => {
    return (
        <div className="toolbar" data-testid="team-page-toolbar">
            <div>
                <Input
                    onChange={onSearchQueryChange}
                    autocompleteValues={autocompleteValues}
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
