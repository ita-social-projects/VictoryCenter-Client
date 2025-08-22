import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar, SearchBarProps } from './SearchBar';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { SearchItemWrapperProps } from './search-item-wrapper/SearchItemWrapper';
import { TooltipProps } from '../tooltip/Tooltip';

interface TestItem {
    id: number;
    name: string;
}

jest.mock('../../../hooks/common/use-on-click-outside/useOnClickOutside');
jest.mock('../../../hooks/common/use-scroll-handler/useScrollHandler');
jest.mock('../../../hooks/common/use-debounced-value-callback/useDebouncedValueCallback');
jest.mock('../../../hooks/common/use-observe-element-size/useObserveElementSize');
jest.mock('../../../hooks/common/use-container-size-from-children/useContainerSizeFromChildren');

// @ts-ignore
jest.mock('./suggestion-wrapper/SuggestionWrapper', () => ({
    SuggestionWrapper: ({ item, onSelect, onHover, getItemLabel, isActive }: SearchItemWrapperProps<TestItem>) => (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <li
            className={`suggestion-item ${isActive ? 'active' : ''}`}
            onClick={onSelect}
            onKeyDown={(e) => e.key === 'Enter' && onSelect?.()}
            onMouseEnter={() => onHover}
            data-testid={`suggestion-${getItemLabel(item)}`}
        >
            {getItemLabel(item)}
        </li>
    ),
}));

jest.mock('../../common/inline-loader/InlineLoader', () => ({
    InlineLoader: () => <div data-testid="inline-loader" />,
}));

jest.mock('../tooltip/Tooltip', () => ({
    Tooltip: ({ children }: Partial<TooltipProps>) => <div data-testid="tooltip">{children}</div>,
}));

// Mock assets
jest.mock('../../../assets/icons/la_search.svg', () => 'search-icon');
jest.mock('../../../assets/icons/remove-query.svg', () => 'clear-icon');

describe('SearchBar', () => {
    const mockSuggestions: TestItem[] = [
        { id: 1, name: 'Apple' },
        { id: 2, name: 'Banana' },
        { id: 3, name: 'Cherry' },
    ];

    const defaultProps: SearchBarProps<TestItem> = {
        suggestions: mockSuggestions,
        onQueryChange: jest.fn(),
        onSuggestionSelect: jest.fn(),
        getSuggestionKey: (item) => item.id,
        getSuggestionLabel: (item) => item.name,
        onLoadMore: jest.fn(),
        isLoading: false,
        hasMore: true,
    };

    beforeAll(() => {
        Element.prototype.scrollIntoView = jest.fn();
    });

    beforeEach(() => {
        jest.clearAllMocks();

        require('../../../hooks/common/use-scroll-handler/useScrollHandler').useScrollHandler.mockReturnValue({
            handleScroll: jest.fn(),
        });
        require('../../../hooks/common/use-observe-element-size/useObserveElementSize').useObserveElementSize.mockReturnValue(
            {
                width: 300,
            },
        );
        require('../../../hooks/common/use-container-size-from-children/useContainerSizeFromChildren').useContainerSizeFromChildren.mockReturnValue(
            {
                calculatedSize: 200,
            },
        );
    });

    // Render helpers
    const renderSearchBar = (overrideProps: Partial<SearchBarProps<TestItem>> = {}) =>
        render(<SearchBar {...defaultProps} {...overrideProps} />);

    // Element getters
    const getInput = () => screen.getByRole('textbox');
    const getClearButton = () => screen.getByRole('button');
    const getSuggestionsList = () => screen.queryByRole('list');
    const getSuggestionItem = (name: string) => screen.queryByTestId(`suggestion-${name}`);
    const getNotFoundMessage = () => screen.queryByText('No items found');
    const getLoader = () => screen.queryByTestId('inline-loader');

    // Action helpers
    const typeInInput = (value: string) => fireEvent.change(getInput(), { target: { value } });
    const clickClearButton = () => fireEvent.click(getClearButton());
    const pressKey = (key: string) => fireEvent.keyDown(getInput(), { key });
    const clickSuggestion = (name: string) => {
        const suggestion = getSuggestionItem(name);
        if (suggestion) fireEvent.click(suggestion);
    };

    // Assertion helpers
    const expectDropdownToBeVisible = () => expect(getSuggestionsList()).toBeInTheDocument();
    const expectDropdownToBeHidden = () => expect(getSuggestionsList()).not.toBeInTheDocument();
    const expectInputValue = (value: string) => expect(getInput()).toHaveValue(value);
    const expectSuggestionToBeActive = (name: string) => expect(getSuggestionItem(name)).toHaveClass('active');

    describe('Basic rendering', () => {
        it('renders search input with default placeholder', () => {
            renderSearchBar();
            expect(getInput()).toBeInTheDocument();
            expect(getInput()).toHaveAttribute('placeholder', COMMON_TEXT_ADMIN.FILTER.SEARCH_BY_NAME);
        });

        it('renders search input with custom placeholder', () => {
            renderSearchBar({ placeholder: 'Search items...' });
            expect(getInput()).toHaveAttribute('placeholder', 'Search items...');
        });

        it('does not show clear button when input is empty', () => {
            renderSearchBar();
            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });

        it('shows clear button when input has value', () => {
            renderSearchBar();
            typeInInput('test');
            expect(getClearButton()).toBeInTheDocument();
        });
    });

    describe('Dropdown behavior', () => {
        it('shows dropdown when typing meets minimum characters', () => {
            renderSearchBar({ minCharactersToSearch: 2 });
            typeInInput('ap');
            expectDropdownToBeVisible();
        });

        it('hides dropdown when input is below minimum characters', () => {
            renderSearchBar({ minCharactersToSearch: 2 });
            typeInInput('a');
            expectDropdownToBeHidden();
        });

        it('shows dropdown on focus when input meets requirements', () => {
            renderSearchBar();
            typeInInput('test');
            expectDropdownToBeVisible();
        });

        it('renders suggestions in dropdown', () => {
            renderSearchBar();
            typeInInput('a');
            expect(getSuggestionItem('Apple')).toBeInTheDocument();
            expect(getSuggestionItem('Banana')).toBeInTheDocument();
            expect(getSuggestionItem('Cherry')).toBeInTheDocument();
        });

        it('shows not found message when no suggestions and not loading', () => {
            renderSearchBar({ suggestions: [], notFoundMessage: 'No items found' });
            typeInInput('test');
            expect(getNotFoundMessage()).toBeInTheDocument();
        });

        it('shows loader when loading', () => {
            renderSearchBar({ isLoading: true });
            typeInInput('test');
            expect(getLoader()).toBeInTheDocument();
        });
    });

    describe('User interactions', () => {
        it('calls onSuggestionSelect when suggestion is clicked', () => {
            renderSearchBar();
            typeInInput('a');
            clickSuggestion('Apple');
            expect(defaultProps.onSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0]);
        });

        it('updates input value when suggestion is selected', () => {
            renderSearchBar();
            typeInInput('a');
            clickSuggestion('Apple');
            expectInputValue('Apple');
        });

        it('clears input when clear button is clicked', () => {
            renderSearchBar();
            typeInInput('test');
            clickClearButton();
            expectInputValue('');
            expect(defaultProps.onQueryChange).toHaveBeenCalledWith('');
        });

        it('calls onClear when clear button is clicked', () => {
            const onClear = jest.fn();
            renderSearchBar({ onClear });
            typeInInput('test');
            clickClearButton();
            expect(onClear).toHaveBeenCalled();
        });
    });

    describe('Keyboard navigation', () => {
        it('navigates down with arrow key', () => {
            renderSearchBar();
            typeInInput('a');
            pressKey('ArrowDown');
            expectSuggestionToBeActive('Apple');
        });

        it('navigates up with arrow key', () => {
            renderSearchBar();
            typeInInput('a');
            pressKey('ArrowDown');
            pressKey('ArrowDown');
            pressKey('ArrowUp');
            expectSuggestionToBeActive('Apple');
        });

        it('selects suggestion with Enter key', () => {
            renderSearchBar();
            typeInInput('a');
            pressKey('ArrowDown');
            pressKey('Enter');
            expect(defaultProps.onSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0]);
        });

        it('selects suggestion with Space key', () => {
            renderSearchBar();
            typeInInput('a');
            pressKey('ArrowDown');
            pressKey(' ');
            expect(defaultProps.onSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0]);
        });

        it('closes dropdown with Escape key', () => {
            renderSearchBar();
            typeInInput('a');
            pressKey('Escape');
            expectDropdownToBeHidden();
        });
    });
});
