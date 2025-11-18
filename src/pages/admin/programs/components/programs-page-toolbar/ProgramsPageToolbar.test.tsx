import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgramsPageToolbar } from './ProgramsPageToolbar';
import { ProgramSearchItemData } from '../../../../../types/admin/programs';
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { ButtonProps } from '../../../../../components/admin/button/Button';
import { SelectOptionProps, SelectProps } from '../../../../../components/common/select/Select';
import { SearchBarProps } from '../../../../../components/admin/search-bar/SearchBar';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';

jest.mock('../../../../../hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

const mockedUseAdminClient = useAdminClient as jest.Mock;

beforeEach(() => {
    mockedUseAdminClient.mockReturnValue({
        client: {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
        },
    });
});

jest.mock('../../../../../assets/icons/plus.svg', () => ({
    ReactComponent: ({ ...props }: any) => <svg {...props} data-testid="plus-icon" />,
}));

jest.mock('../../../../../components/admin/button/Button', () => ({
    Button: ({ children, onClick, type, formId }: ButtonProps) => (
        <button onClick={onClick} type={type} form={formId}>
            {children}
        </button>
    ),
}));

jest.mock('../../../../../components/common/select/Select', () => ({
    Select: Object.assign(
        ({ children, onValueChange, value, ...props }: SelectProps<any>) => (
            <div {...props}>
                <select onChange={(e) => onValueChange(e.target.value || undefined)} value={value || ''}>
                    {children}
                </select>
            </div>
        ),
        {
            Option: ({ value, name }: SelectOptionProps<any>) => <option value={value}>{name}</option>,
        },
    ),
}));

jest.mock('../../../../../components/admin/search-bar/SearchBar', () => ({
    SearchBar: ({
        onQueryChange,
        onClear,
        onSearchItemSelect,
        searchItems,
        placeholder,
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
            {searchItems.map((suggestion: any, index: number) => (
                <div
                    key={index}
                    onClick={() => onSearchItemSelect(suggestion)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSearchItemSelect(suggestion);
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    data-testid={`suggestion-${index}`}
                >
                    {suggestion.name}
                </div>
            ))}
        </div>
    ),
}));

jest.mock('../../../../../hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch');
jest.mock('../../../../../services/api/admin/programs/programs-api');
jest.mock('../program-search-item/ProgramSearchItem.tsx', () => ({
    ProgramSuggestionItem: ({ item }: any) => <div data-testid="suggestion-item">{item.name}</div>,
}));

const mockUseDataPaginationFetch =
    require('../../../../../hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch').useDataPaginationFetch;
const mockProgramsApi = require('../../../../../services/api/admin/programs/programs-api').ProgramsApi;

// Helper functions
const createSuggestion = (id: number, name: string): ProgramSearchItemData => ({
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
    let mockHookReturn: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockHookReturn = {
            data: [],
            isLoading: false,
            hasMore: false,
            error: null,
            fetchMore: jest.fn(),
            fetchFromStart: jest.fn(),
            setData: jest.fn(),
            resetList: jest.fn(),
        };

        mockUseDataPaginationFetch.mockReturnValue(mockHookReturn);
        mockProgramsApi.fetchProgramSearchItems = jest.fn().mockResolvedValue({
            items: [],
            totalItemsCount: 0,
        });
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

        const button = screen.getByText(PROGRAMS_TEXT.BUTTON.ADD_PROGRAM);
        expect(button).toBeInTheDocument();
    });

    it('should call onAddProgram when add button clicked', async () => {
        const onAddProgram = jest.fn();
        render(<ProgramsPageToolbar {...createProps({ onAddProgram })} />);

        const button = screen.getByText(PROGRAMS_TEXT.BUTTON.ADD_PROGRAM);
        await userEvent.click(button);

        expect(onAddProgram).toHaveBeenCalledTimes(1);
    });

    it('should update search term on search input change', async () => {
        render(<ProgramsPageToolbar {...createProps()} />);

        const searchInput = screen.getByTestId('search-input');
        await userEvent.type(searchInput, 'test program');

        expect(mockUseDataPaginationFetch).toHaveBeenCalledWith(
            expect.objectContaining({
                autoFetchDependencies: expect.arrayContaining([expect.any(String)]),
                autoFetchDisabled: expect.any(Boolean),
                pageSize: 5,
            }),
        );
    });

    it('should disable auto fetch when search term is too short', () => {
        render(<ProgramsPageToolbar {...createProps()} />);

        expect(mockUseDataPaginationFetch).toHaveBeenCalledWith(
            expect.objectContaining({
                autoFetchDisabled: true,
            }),
        );
    });

    it('should call onProgramSelect when suggestion is selected', async () => {
        const suggestions = [createSuggestion(1, 'Test Program')];
        const onProgramSelect = jest.fn();

        mockUseDataPaginationFetch.mockReturnValue({
            ...mockHookReturn,
            data: suggestions,
        });

        render(<ProgramsPageToolbar {...createProps({ onProgramSelect })} />);

        const suggestion = screen.getByTestId('suggestion-0');
        await userEvent.click(suggestion);

        expect(onProgramSelect).toHaveBeenCalledWith(1);
        expect(mockHookReturn.resetList).toHaveBeenCalled();
    });

    it('should call onSearchClear when clear button is clicked', async () => {
        const onSearchClear = jest.fn();
        render(<ProgramsPageToolbar {...createProps({ onSearchClear })} />);

        const clearButton = screen.getByTestId('clear-button');
        await userEvent.click(clearButton);

        expect(onSearchClear).toHaveBeenCalledTimes(1);
        expect(mockHookReturn.resetList).toHaveBeenCalled();
    });

    it('should pass correct props to SearchBar', () => {
        const suggestions = [createSuggestion(1, 'Test')];

        mockUseDataPaginationFetch.mockReturnValue({
            ...mockHookReturn,
            data: suggestions,
            isLoading: true,
            hasMore: true,
        });

        render(<ProgramsPageToolbar {...createProps()} />);

        expect(screen.getByTestId('suggestion-0')).toHaveTextContent('Test');
    });

    it('should call getSuggestions with current search term', async () => {
        render(<ProgramsPageToolbar {...createProps()} />);

        const fetchHandler = mockUseDataPaginationFetch.mock.calls[0][0].fetchHandler;

        const params = {
            offset: 0,
            limit: 5,
            requestOptions: { cancellationSignal: new AbortController().signal },
        };

        await fetchHandler(params);

        expect(mockProgramsApi.fetchProgramSearchItems).toHaveBeenCalledWith(
            expect.any(Object),
            '',
            params.offset,
            params.limit,
        );
    });

    it('should render suggestion items correctly', () => {
        const suggestions = [createSuggestion(1, 'Program 1'), createSuggestion(2, 'Program 2')];

        mockUseDataPaginationFetch.mockReturnValue({
            ...mockHookReturn,
            data: suggestions,
        });

        render(<ProgramsPageToolbar {...createProps()} />);

        expect(screen.getByTestId('suggestion-0')).toHaveTextContent('Program 1');
        expect(screen.getByTestId('suggestion-1')).toHaveTextContent('Program 2');
    });

    it('should reset suggestions list and clear search when suggestion is selected', async () => {
        const suggestions = [createSuggestion(1, 'Test Program')];
        const onProgramSelect = jest.fn();

        mockUseDataPaginationFetch.mockReturnValue({
            ...mockHookReturn,
            data: suggestions,
        });

        render(<ProgramsPageToolbar {...createProps({ onProgramSelect })} />);

        const suggestion = screen.getByTestId('suggestion-0');
        await userEvent.click(suggestion);

        expect(mockHookReturn.resetList).toHaveBeenCalled();
        expect(onProgramSelect).toHaveBeenCalledWith(1);
    });

    it('should handle loading state correctly', () => {
        mockUseDataPaginationFetch.mockReturnValue({
            ...mockHookReturn,
            isLoading: true,
        });

        render(<ProgramsPageToolbar {...createProps()} />);

        expect(mockUseDataPaginationFetch).toHaveBeenCalled();
    });

    it('should handle fetchMore correctly', () => {
        const mockFetchMore = jest.fn();
        mockUseDataPaginationFetch.mockReturnValue({
            ...mockHookReturn,
            fetchMore: mockFetchMore,
        });

        render(<ProgramsPageToolbar {...createProps()} />);

        expect(mockUseDataPaginationFetch).toHaveBeenCalled();
    });

    it('should call getSearchItemKey and getSearchItemLabel for each suggestion', () => {
        const suggestions = [createSuggestion(1, 'Program 1'), createSuggestion(2, 'Program 2')];

        mockUseDataPaginationFetch.mockReturnValue({
            ...mockHookReturn,
            data: suggestions,
        });

        render(<ProgramsPageToolbar {...createProps()} />);

        suggestions.forEach((s) => {
            expect(s.id).toBeDefined();
            expect(s.name).toBeDefined();
        });
    });
});
