import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TeamPageToolbar } from './TeamPageToolbar';
import { VisibilityStatus } from '../../../../../types/admin/Common';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

describe('TeamPageToolbar', () => {
    const autocompleteValues = ['John', 'Jane'];

    it('calls onSearchQueryChange when typing into input', () => {
        const onSearchQueryChange = jest.fn();
        render(
            <TeamPageToolbar
                onSearchQueryChange={onSearchQueryChange}
                onStatusFilterChange={jest.fn()}
                onAddMember={jest.fn()}
                autocompleteValues={autocompleteValues}
            />,
        );

        const input = screen.getByPlaceholderText(TEAM_MEMBERS_TEXT.SEARCH.INPUT_FULLNAME);
        fireEvent.change(input, { target: { value: 'Jo' } });
        expect(onSearchQueryChange).toHaveBeenLastCalledWith('Jo');
    });

    it('changes status filter to All, Published, Draft by interacting with select', () => {
        const onStatusFilterChange = jest.fn();
        render(
            <TeamPageToolbar
                onSearchQueryChange={jest.fn()}
                onStatusFilterChange={onStatusFilterChange}
                onAddMember={jest.fn()}
                autocompleteValues={autocompleteValues}
            />,
        );

        // There are two elements with role toolbar (autocomplete select and status select).
        // The status select lives within the actions container (second one typically).
        const toolbars = screen.getAllByRole('toolbar');
        const statusSelect = toolbars[1];

        // Open select
        fireEvent.click(statusSelect);

        // Choose All (undefined)
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.FILTER.STATUS.ALL));
        expect(onStatusFilterChange).toHaveBeenCalledWith(undefined);

        // Open again and choose Published
        fireEvent.click(statusSelect);
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.FILTER.STATUS.PUBLISHED));
        expect(onStatusFilterChange).toHaveBeenCalledWith(VisibilityStatus.Published);

        // Open again and choose Draft
        fireEvent.click(statusSelect);
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.FILTER.STATUS.DRAFT));
        expect(onStatusFilterChange).toHaveBeenCalledWith(VisibilityStatus.Draft);
    });

    it('fires onAddMember when Add Member button clicked', () => {
        const onAddMember = jest.fn();
        render(
            <TeamPageToolbar
                onSearchQueryChange={jest.fn()}
                onStatusFilterChange={jest.fn()}
                onAddMember={onAddMember}
                autocompleteValues={autocompleteValues}
            />,
        );

        const addBtn = screen.getByRole('button', { name: /Додати учасника/ });
        fireEvent.click(addBtn);
        expect(onAddMember).toHaveBeenCalled();
    });
});
