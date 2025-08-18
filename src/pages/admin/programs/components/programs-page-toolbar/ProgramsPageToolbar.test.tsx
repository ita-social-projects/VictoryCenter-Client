import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgramsPageToolbar } from './ProgramsPageToolbar';
import { ProgramSuggestion } from '../../../../../types/admin/programs';
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

// Mock dependencies
jest.mock('../../../../../components/admin/button/Button', () => ({
    Button: ({ children, onClick, buttonStyle, ...props }: any) => (
        <button onClick={onClick} {...props}>
            {children}
        </button>
    ),
}));

jest.mock('../../../../../components/admin/select/Select', () => ({
    Select: ({ children, onValueChange, value, ...props }: any) => (
        <div {...props}>
            <select onChange={(e) => onValueChange(e.target.value || undefined)} value={value || ''}>
                {children}
            </select>
        </div>
    ),
}));

jest.mock('../../../../../components/admin/select/Select', () => ({
    Select: Object.assign(
        ({ children, onValueChange, value, ...props }: any) => (
            <div {...props}>
                <select onChange={(e) => onValueChange(e.target.value || undefined)} value={value || ''}>
                    {children}
                </select>
            </div>
        ),
        {
            Option: ({ children, value, name }: any) => <option value={value}>{name}</option>,
        },
    ),
}));

jest.mock('../../../../../components/admin/search-bar/SearchBar', () => ({
    SearchBar: ({ onSearch, onClear, onSuggestionSelect, suggestions, placeholder, ...props }: any) => (
        <div>
            <input placeholder={placeholder} onChange={(e) => onSearch?.(e.target.value)} data-testid="search-input" />
            <button onClick={onClear} data-testid="clear-button">
                Clear
            </button>
            {suggestions.map((suggestion: any, index: number) => (
                <div key={index} onClick={() => onSuggestionSelect(suggestion)} data-testid={`suggestion-${index}`}>
                    {suggestion.name}
                </div>
            ))}
        </div>
    ),
}));

jest.mock('../../../../../hooks/admin/fetch/use-entities-pagination-fetch/useEntitiesPaginationFetch');
jest.mock('../../../../../services/api/admin/programs/programs-api');
jest.mock('./program-suggestion-item/ProgramSuggestionItem', () => ({
    ProgramSuggestionItem: ({ item }: any) => <div data-testid="suggestion-item">{item.name}</div>,
}));

const mockUseEntitiesPaginationFetch =
    require('../../../../../hooks/admin/fetch/use-entities-pagination-fetch/useEntitiesPaginationFetch').useEntitiesPaginationFetch;
const mockProgramsApi = require('../../../../../services/api/admin/programs/programs-api').ProgramsApi;

// Helper functions
const createSuggestion = (id: number, name: string): ProgramSuggestion => ({
    id,
    name,
    categories: ['Category'],
});

const createProps = (overrides = {}) => ({
    statusFilterValue: undefined,
    onStatusFilterChange: jest.fn(),
    onAddProgram: jest.fn(),
    onProgramSelect: jest.fn(),
    onSearchClear: jest.fn(),
    ...overrides,
});

describe('ProgramsPageToolbar', () => {
    const mockActions = {
        fetchMore: jest.fn(),
        fetchFromStart: jest.fn(),
        addEntity: jest.fn(),
        updateEntity: jest.fn(),
        removeEntity: jest.fn(),
        resetList: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseEntitiesPaginationFetch.mockReturnValue({
            entities: [],
            isLoading: false,
            hasMore: false,
            actions: mockActions,
        });
        mockProgramsApi.fetchProgramSuggestions = jest.fn().mockResolvedValue([]);
    });

    it('should render search bar with correct placeholder', () => {
        render(<ProgramsPageToolbar {...createProps()} />);

        expect(screen.getByPlaceholderText(PROGRAMS_TEXT.PLACEHOLDER.SEARCH_PROGRAMS)).toBeInTheDocument();
    });

    it('should render status filter with all options', () => {
        render(<ProgramsPageToolbar {...createProps()} />);

        const select = screen.getByTestId('status-filter').querySelector('select');
        expect(select).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.FILTER.STATUS.ALL)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.FILTER.STATUS.PUBLISHED)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.FILTER.STATUS.DRAFT)).toBeInTheDocument();
    });

    it('should render add program button', () => {
        render(<ProgramsPageToolbar {...createProps()} />);

        const button = screen.getByTestId('add-program-button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Додати програму');
    });

    it('should call onAddProgram when add button clicked', async () => {
        const onAddProgram = jest.fn();
        render(<ProgramsPageToolbar {...createProps({ onAddProgram })} />);

        const button = screen.getByTestId('add-program-button');
        await userEvent.click(button);

        expect(onAddProgram).toHaveBeenCalledTimes(1);
    });

    it('should update search term on search input change', async () => {
        render(<ProgramsPageToolbar {...createProps()} />);

        const searchInput = screen.getByTestId('search-input');
        await userEvent.type(searchInput, 'test program');

        // Check that useEntitiesPaginationFetch was called with correct dependencies
        expect(mockUseEntitiesPaginationFetch).toHaveBeenCalledWith(
            expect.objectContaining({
                autoFetchDependencies: ['test program'],
                autoFetchDisabled: false,
                pageSize: 5,
            }),
        );
    });

    it('should disable auto fetch when search term is too short', () => {
        render(<ProgramsPageToolbar {...createProps()} />);

        expect(mockUseEntitiesPaginationFetch).toHaveBeenCalledWith(
            expect.objectContaining({
                autoFetchDisabled: true,
            }),
        );
    });

    it('should call onProgramSelect when suggestion is selected', async () => {
        const suggestions = [createSuggestion(1, 'Test Program')];
        const onProgramSelect = jest.fn();

        mockUseEntitiesPaginationFetch.mockReturnValue({
            entities: suggestions,
            isLoading: false,
            hasMore: false,
            actions: mockActions,
        });

        render(<ProgramsPageToolbar {...createProps({ onProgramSelect })} />);

        const suggestion = screen.getByTestId('suggestion-0');
        await userEvent.click(suggestion);

        expect(onProgramSelect).toHaveBeenCalledWith(1);
    });

    it('should call onSearchClear when clear button is clicked', async () => {
        const onSearchClear = jest.fn();
        render(<ProgramsPageToolbar {...createProps({ onSearchClear })} />);

        const clearButton = screen.getByTestId('clear-button');
        await userEvent.click(clearButton);

        expect(onSearchClear).toHaveBeenCalledTimes(1);
    });

    it('should pass correct props to SearchBar', () => {
        const suggestions = [createSuggestion(1, 'Test')];

        mockUseEntitiesPaginationFetch.mockReturnValue({
            entities: suggestions,
            isLoading: true,
            hasMore: true,
            actions: mockActions,
        });

        render(<ProgramsPageToolbar {...createProps()} />);

        // Verify SearchBar receives correct props by checking if suggestions are rendered
        expect(screen.getByTestId('suggestion-0')).toHaveTextContent('Test');
    });

    it('should call getSuggestions with current search term', async () => {
        render(<ProgramsPageToolbar {...createProps()} />);

        // Get the fetchEntitiesHandler from useEntitiesPaginationFetch call
        const fetchHandler = mockUseEntitiesPaginationFetch.mock.calls[0][0].fetchEntitiesHandler;

        const params = {
            offset: 0,
            limit: 5,
            requestOptions: { cancellationSignal: new AbortController().signal },
        };

        await fetchHandler(params);

        expect(mockProgramsApi.fetchProgramSuggestions).toHaveBeenCalledWith(
            '',
            params.offset,
            params.limit,
            params.requestOptions,
        );
    });

    it('should render suggestion items correctly', () => {
        const suggestions = [createSuggestion(1, 'Program 1'), createSuggestion(2, 'Program 2')];

        mockUseEntitiesPaginationFetch.mockReturnValue({
            entities: suggestions,
            isLoading: false,
            hasMore: false,
            actions: mockActions,
        });

        render(<ProgramsPageToolbar {...createProps()} />);

        expect(screen.getByTestId('suggestion-0')).toHaveTextContent('Program 1');
        expect(screen.getByTestId('suggestion-1')).toHaveTextContent('Program 2');
    });
});
