import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { TeamPageToolbar } from './TeamPageToolbar';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { SearchBarProps } from '../../../../../components/admin/search-bar/SearchBar';
import { ProgramSearchItemData } from '../../../../../types/admin/programs';

jest.mock('../../../../../assets/icons/plus.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="plus-icon" />,
}));

jest.mock('../../../../../components/admin/search-bar/SearchBar', () => ({
    SearchBar: ({ onQueryChange, onClear, placeholder }: SearchBarProps<ProgramSearchItemData>) => (
        <div>
            <input
                placeholder={placeholder}
                onChange={(e) => onQueryChange?.(e.target.value)}
                data-testid="search-input"
            />
            <button onClick={onClear} data-testid="clear-button">
                Clear
            </button>
        </div>
    ),
}));

// Local mock for ResizeObserver used by hooks inside TeamPageToolbar
beforeAll(() => {
    class MockResizeObserver {
        observe = jest.fn();
        unobserve = jest.fn();
        disconnect = jest.fn();
    }
    (window as any).ResizeObserver = MockResizeObserver as any;
    (global as any).ResizeObserver = MockResizeObserver as any;
});
describe('TeamPageToolbar', () => {
    it('calls onSearchQueryChange when typing into input', () => {
        jest.useFakeTimers();
        const onSearchQueryChange = jest.fn();
        render(
            <TeamPageToolbar
                onSearchQueryChange={onSearchQueryChange}
                onStatusFilterChange={jest.fn()}
                onAddMember={jest.fn()}
            />,
        );

        const input = screen.getByPlaceholderText(TEAM_MEMBERS_TEXT.SEARCH.INPUT_FULLNAME);
        fireEvent.change(input, { target: { value: 'Jo' } });
        act(() => {
            jest.advanceTimersByTime(300);
        });
        expect(onSearchQueryChange).toHaveBeenLastCalledWith('Jo');
        jest.useRealTimers();
    });

    it('changes status filter to All, Published, Draft by interacting with select', () => {
        const onStatusFilterChange = jest.fn();
        render(
            <TeamPageToolbar
                onSearchQueryChange={jest.fn()}
                onStatusFilterChange={onStatusFilterChange}
                onAddMember={jest.fn()}
            />,
        );

        // Select root has role="toolbar"
        const statusSelect = screen.getByRole('toolbar');

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
            />,
        );

        const addBtn = screen.getByRole('button', { name: TEAM_MEMBERS_TEXT.BUTTON.ADD_MEMBER });
        expect(within(addBtn).getByTestId('plus-icon')).toBeInTheDocument();

        fireEvent.click(addBtn);
        expect(onAddMember).toHaveBeenCalled();
    });
});
