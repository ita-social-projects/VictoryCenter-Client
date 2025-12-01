import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { TeamPageToolbar } from './TeamPageToolbar';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { SearchBarProps } from '../../../../../components/admin/search-bar/SearchBar';
import { ProgramSearchItemData } from '../../../../../types/admin/programs';

type PartialProps = Partial<React.ComponentProps<typeof TeamPageToolbar>>;

const DEFAULT_PROPS: React.ComponentProps<typeof TeamPageToolbar> = {
    onSearchQueryChange: jest.fn(),
    onStatusFilterChange: jest.fn(),
    onAddMember: jest.fn(),
    searchItems: [],
    isSearchLoading: false,
    searchHasMore: false,
    onSearchLoadMore: jest.fn(),
    categories: [],
    onSearchItemSelect: jest.fn(),
    onSearchClear: jest.fn(),
};

const renderToolbar = (overrides: PartialProps = {}) => {
    const props = { ...DEFAULT_PROPS, ...overrides };
    return render(<TeamPageToolbar {...props} />);
};

const CATS_1 = [{ id: 'c1', name: 'Category 1' } as any];
const CATS_2 = [...CATS_1, { id: 'c2', name: 'Category 2' } as any];
const ITEM_JOHN = [{ id: '1', fullName: 'John Doe' } as any];
const ITEM_JANE = [{ id: '1', fullName: 'Jane Roe' } as any];

jest.mock('../../../../../assets/icons/plus.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="plus-icon" />,
}));

jest.mock('../../../../../components/admin/search-bar/SearchBar', () => ({
    SearchBar: (props: SearchBarProps<ProgramSearchItemData>) => {
        const {
            onQueryChange,
            onClear,
            placeholder,
            searchItems = [],
            renderSearchItemComponent: View,
            getSearchItemKey,
            getSearchItemLabel,
            onSearchItemSelect,
            hasMore,
            onLoadMore,
        } = props;

        return (
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
                    {View &&
                        searchItems.map((item: any, index: number) => {
                            const key = getSearchItemKey ? getSearchItemKey(item) : index;
                            const label = getSearchItemLabel ? getSearchItemLabel(item) : '';
                            const C = View as any;
                            return (
                                <li key={key}>
                                    <button
                                        type="button"
                                        data-testid="search-item-button"
                                        onClick={() => onSearchItemSelect?.(item)}
                                    >
                                        <span data-testid="search-label">{label}</span>
                                        <C item={item} index={index} />
                                    </button>
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
        );
    },
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

const testSearchQueryChange = (inputValue: string) => {
    jest.useFakeTimers();
    const onSearchQueryChange = jest.fn();
    renderToolbar({ onSearchQueryChange });

    const input = screen.getByPlaceholderText(TEAM_MEMBERS_TEXT.SEARCH.INPUT_FULLNAME);
    fireEvent.change(input, { target: { value: inputValue } });
    act(() => {
        jest.advanceTimersByTime(300);
    });

    expect(onSearchQueryChange).toHaveBeenLastCalledWith(inputValue);
    jest.useRealTimers();
};

describe('TeamPageToolbar', () => {
    it('calls onSearchQueryChange when typing into input', () => {
        testSearchQueryChange('Jo');
    });

    it('changes status filter to All, Published, Draft by interacting with select', () => {
        const onStatusFilterChange = jest.fn();
        renderToolbar({ onStatusFilterChange });

        const statusSelect = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.STATUS.DEFAULT });
        fireEvent.click(statusSelect);

        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.FILTER.STATUS.ALL));
        expect(onStatusFilterChange).toHaveBeenCalledWith(undefined);

        fireEvent.click(statusSelect);
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.FILTER.STATUS.PUBLISHED));
        expect(onStatusFilterChange).toHaveBeenCalledWith(VisibilityStatus.Published);

        fireEvent.click(statusSelect);
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.FILTER.STATUS.DRAFT));
        expect(onStatusFilterChange).toHaveBeenCalledWith(VisibilityStatus.Draft);
    });

    it('fires onAddMember when Add Member button clicked', () => {
        const onAddMember = jest.fn();
        renderToolbar({ onAddMember });

        const addBtn = screen.getByRole('button', { name: TEAM_MEMBERS_TEXT.BUTTON.ADD_MEMBER });
        expect(within(addBtn).getByTestId('plus-icon')).toBeInTheDocument();

        fireEvent.click(addBtn);
        expect(onAddMember).toHaveBeenCalled();
    });

    it('calls onSearchClear when clear button clicked', () => {
        const onSearchClear = jest.fn();
        renderToolbar({ onSearchClear });

        fireEvent.click(screen.getByTestId('clear-button'));
        expect(onSearchClear).toHaveBeenCalled();
    });

    it('calls onSearchQueryChange after debounce when typing 2+ chars', () => {
        testSearchQueryChange('John');
    });

    it('renders search items via itemRenderer and selects item', () => {
        const onSearchItemSelect = jest.fn();
        renderToolbar({ onSearchItemSelect, categories: CATS_1, searchItems: ITEM_JOHN });

        const label = screen.getByTestId('search-label');
        expect(label).toHaveTextContent('John Doe');

        const trigger = screen.getByTestId('search-item-button');
        fireEvent.click(trigger);
        expect(onSearchItemSelect).toHaveBeenCalledWith(ITEM_JOHN[0]);
    });

    it('calls onSearchLoadMore when hasMore is true', () => {
        const onSearchLoadMore = jest.fn();
        renderToolbar({ onSearchLoadMore, searchHasMore: true });

        const loadMore = screen.getByTestId('load-more');
        fireEvent.click(loadMore);
        expect(onSearchLoadMore).toHaveBeenCalled();
    });

    it('updates rendered item when categories change', () => {
        const { rerender } = renderToolbar({ categories: CATS_1, searchItems: ITEM_JANE });

        expect(screen.getByTestId('team-member-item')).toHaveTextContent('Jane Roe - 1');

        rerender(<TeamPageToolbar {...{ ...DEFAULT_PROPS, categories: CATS_2, searchItems: ITEM_JANE }} />);

        expect(screen.getByTestId('team-member-item')).toHaveTextContent('Jane Roe - 2');
    });
});
