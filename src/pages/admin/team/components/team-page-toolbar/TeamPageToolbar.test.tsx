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
    SearchBar: ({
        onQueryChange,
        onClear,
        placeholder,
        searchItems = [],
        renderSearchItemComponent: view,
        getSearchItemKey,
        getSearchItemLabel,
        onSearchItemSelect,
        hasMore,
        onLoadMore,
    }: SearchBarProps<ProgramSearchItemData>) => (
        <div>
            <input
                placeholder={placeholder}
                onChange={(e) => onQueryChange?.(e.target.value)}
                data-testid="search-input"
            />
            <button onClick={onClear} data-testid="clear-button">
                Clear
            </button>
            <ul data-testid="search-results">
                {view &&
                    searchItems.map((item: any, index: number) => {
                        const key = getSearchItemKey ? getSearchItemKey(item) : index;
                        const View = view as any;
                        const label = getSearchItemLabel ? getSearchItemLabel(item) : '';
                        return (
                            <li key={key} onClick={() => onSearchItemSelect?.(item)}>
                                <span data-testid="search-label">{label}</span>
                                <View item={item} index={index} />
                            </li>
                        );
                    })}
            </ul>
            {hasMore ? (
                <button onClick={onLoadMore} data-testid="load-more">
                    Load more
                </button>
            ) : null}
        </div>
    ),
}));

jest.mock('../../../../../components/admin/search-bar/team-member-search-item/TeamMemberSearchItem', () => {
    const ReactActual = jest.requireActual('react');
    return {
        TeamMemberSearchItem: ReactActual.forwardRef(({ item, categories }: any, ref: any) => (
            <div ref={ref} data-testid="team-member-item">
                {item?.fullName} - {(categories?.length ?? 0).toString()}
            </div>
        )),
    };
});

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
                searchItems={[]}
                isSearchLoading={false}
                searchHasMore={false}
                onSearchLoadMore={jest.fn()}
                categories={[]}
                onSearchItemSelect={jest.fn()}
                onSearchClear={jest.fn()}
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
                searchItems={[]}
                isSearchLoading={false}
                searchHasMore={false}
                onSearchLoadMore={jest.fn()}
                categories={[]}
                onSearchItemSelect={jest.fn()}
                onSearchClear={jest.fn()}
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
                searchItems={[]}
                isSearchLoading={false}
                searchHasMore={false}
                onSearchLoadMore={jest.fn()}
                categories={[]}
                onSearchItemSelect={jest.fn()}
                onSearchClear={jest.fn()}
            />,
        );

        const addBtn = screen.getByRole('button', { name: TEAM_MEMBERS_TEXT.BUTTON.ADD_MEMBER });
        expect(within(addBtn).getByTestId('plus-icon')).toBeInTheDocument();

        fireEvent.click(addBtn);
        expect(onAddMember).toHaveBeenCalled();
    });

    it('calls onSearchClear when clear button clicked', () => {
        const onSearchClear = jest.fn();
        render(
            <TeamPageToolbar
                onSearchQueryChange={jest.fn()}
                onStatusFilterChange={jest.fn()}
                onAddMember={jest.fn()}
                searchItems={[]}
                isSearchLoading={false}
                searchHasMore={false}
                onSearchLoadMore={jest.fn()}
                categories={[]}
                onSearchItemSelect={jest.fn()}
                onSearchClear={onSearchClear}
            />,
        );
        fireEvent.click(screen.getByTestId('clear-button'));
        expect(onSearchClear).toHaveBeenCalled();
    });

    it('calls onSearchQueryChange after debounce when typing 2+ chars', () => {
        jest.useFakeTimers();
        const onSearchQueryChange = jest.fn();
        render(
            <TeamPageToolbar
                onSearchQueryChange={onSearchQueryChange}
                onStatusFilterChange={jest.fn()}
                onAddMember={jest.fn()}
                searchItems={[]}
                isSearchLoading={false}
                searchHasMore={false}
                onSearchLoadMore={jest.fn()}
                categories={[]}
                onSearchItemSelect={jest.fn()}
                onSearchClear={jest.fn()}
            />,
        );
        const input = screen.getByPlaceholderText(TEAM_MEMBERS_TEXT.SEARCH.INPUT_FULLNAME);
        fireEvent.change(input, { target: { value: 'John' } });
        act(() => {
            jest.advanceTimersByTime(300);
        });
        expect(onSearchQueryChange).toHaveBeenLastCalledWith('John');
        jest.useRealTimers();
    });

    it('renders search items via itemRenderer and selects item', () => {
        const onSearchItemSelect = jest.fn();
        const categories = [{ id: 'c1', name: 'Category 1' } as any];
        const searchItems = [{ id: '1', fullName: 'John Doe' } as any];

        render(
            <TeamPageToolbar
                onSearchQueryChange={jest.fn()}
                onStatusFilterChange={jest.fn()}
                onAddMember={jest.fn()}
                searchItems={searchItems}
                isSearchLoading={false}
                searchHasMore={false}
                onSearchLoadMore={jest.fn()}
                categories={categories}
                onSearchItemSelect={onSearchItemSelect}
                onSearchClear={jest.fn()}
            />,
        );

        const label = screen.getByTestId('search-label');
        expect(label).toHaveTextContent('John Doe');

        const item = screen.getByTestId('team-member-item');
        expect(item).toHaveTextContent('John Doe - 1');
        fireEvent.click(item);
        expect(onSearchItemSelect).toHaveBeenCalledWith(searchItems[0]);
    });

    it('calls onSearchLoadMore when hasMore is true', () => {
        const onSearchLoadMore = jest.fn();
        render(
            <TeamPageToolbar
                onSearchQueryChange={jest.fn()}
                onStatusFilterChange={jest.fn()}
                onAddMember={jest.fn()}
                searchItems={[]}
                isSearchLoading={false}
                searchHasMore={true}
                onSearchLoadMore={onSearchLoadMore}
                categories={[]}
                onSearchItemSelect={jest.fn()}
                onSearchClear={jest.fn()}
            />,
        );

        const loadMore = screen.getByTestId('load-more');
        fireEvent.click(loadMore);
        expect(onSearchLoadMore).toHaveBeenCalled();
    });

    it('updates rendered item when categories change', () => {
        const categories1 = [{ id: 'c1', name: 'Category 1' } as any];
        const categories2 = [{ id: 'c1', name: 'Category 1' } as any, { id: 'c2', name: 'Category 2' } as any];
        const searchItems = [{ id: '1', fullName: 'Jane Roe' } as any];

        const { rerender } = render(
            <TeamPageToolbar
                onSearchQueryChange={jest.fn()}
                onStatusFilterChange={jest.fn()}
                onAddMember={jest.fn()}
                searchItems={searchItems}
                isSearchLoading={false}
                searchHasMore={false}
                onSearchLoadMore={jest.fn()}
                categories={categories1}
                onSearchItemSelect={jest.fn()}
                onSearchClear={jest.fn()}
            />,
        );

        expect(screen.getByTestId('team-member-item')).toHaveTextContent('Jane Roe - 1');

        rerender(
            <TeamPageToolbar
                onSearchQueryChange={jest.fn()}
                onStatusFilterChange={jest.fn()}
                onAddMember={jest.fn()}
                searchItems={searchItems}
                isSearchLoading={false}
                searchHasMore={false}
                onSearchLoadMore={jest.fn()}
                categories={categories2}
                onSearchItemSelect={jest.fn()}
                onSearchClear={jest.fn()}
            />,
        );

        expect(screen.getByTestId('team-member-item')).toHaveTextContent('Jane Roe - 2');
    });
});
