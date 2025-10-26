import { renderHook, act, waitFor } from '@testing-library/react';
import { useTeamMemberSearch } from './useTeamMemberSearch';
import { TeamMembersApi } from '../../../services/api/admin/team/team-members/team-members-api';
import { TEAM_SEARCH } from '../../../const/admin/team';
import { AxiosInstance } from 'axios';

jest.mock('../../../services/api/admin/team/team-members/team-members-api');
const mockTeamMembersApi = TeamMembersApi as jest.Mocked<typeof TeamMembersApi>;

const mockClient = {} as AxiosInstance;

const mockSearchResults = {
    items: [
        { id: 1, fullName: 'John Doe', categoryId: 1 },
        { id: 2, fullName: 'Jane Smith', categoryId: 2 },
    ],
    totalItemsCount: 10,
};

describe('useTeamMemberSearch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockTeamMembersApi.search.mockResolvedValue(mockSearchResults as any);
    });

    it('should handle API errors gracefully and reset state', async () => {
        const searchError = new Error('API Error');
        mockTeamMembersApi.search.mockRejectedValueOnce(searchError);

        const { result } = renderHook(() => useTeamMemberSearch(mockClient));

        await act(async () => {
            await result.current.handleSearchQueryByName('test');
        });

        await waitFor(() => {
            expect(result.current.searchSuggestions).toEqual([]);
            expect(result.current.hasMoreSearch).toBe(false);
            expect(result.current.isSearchLoading).toBe(false);
        });
    });

    it('should not load more suggestions when conditions are not met', async () => {
        const { result } = renderHook(() => useTeamMemberSearch(mockClient));

        await act(async () => {
            await result.current.loadMoreSearchSuggestions();
        });

        expect(mockTeamMembersApi.search).not.toHaveBeenCalled();

        await act(async () => {
            await result.current.handleSearchQueryByName('a');
        });

        await act(async () => {
            await result.current.loadMoreSearchSuggestions();
        });

        expect(mockTeamMembersApi.search).not.toHaveBeenCalled();
    });

    it('should initialize with empty state', () => {
        const { result } = renderHook(() => useTeamMemberSearch(mockClient));

        expect(result.current.searchSuggestions).toEqual([]);
        expect(result.current.isSearchLoading).toBe(false);
        expect(result.current.hasMoreSearch).toBe(false);
    });

    it('should not search for queries shorter than minimum length', async () => {
        const { result } = renderHook(() => useTeamMemberSearch(mockClient));

        await act(async () => {
            await result.current.handleSearchQueryByName('a');
        });

        expect(mockTeamMembersApi.search).not.toHaveBeenCalled();
    });

    it('should search when query meets minimum length', async () => {
        const { result } = renderHook(() => useTeamMemberSearch(mockClient));

        await act(async () => {
            await result.current.handleSearchQueryByName('ab');
        });

        expect(mockTeamMembersApi.search).toHaveBeenCalledWith(
            mockClient,
            'ab',
            0,
            TEAM_SEARCH.SUGGESTIONS_PAGE_SIZE,
            expect.any(AbortSignal),
        );
    });

    it('should clear suggestions on empty query', async () => {
        const { result } = renderHook(() => useTeamMemberSearch(mockClient));

        await act(async () => {
            await result.current.handleSearchQueryByName('ab');
        });

        await act(async () => {
            await result.current.handleSearchQueryByName('');
        });

        expect(result.current.searchSuggestions).toEqual([]);
        expect(result.current.hasMoreSearch).toBe(false);
        expect(result.current.isSearchLoading).toBe(false);
    });

    it('should load more suggestions', async () => {
        const { result } = renderHook(() => useTeamMemberSearch(mockClient));

        await act(async () => {
            await result.current.handleSearchQueryByName('ab');
        });

        await act(async () => {
            await result.current.loadMoreSearchSuggestions();
        });

        expect(mockTeamMembersApi.search).toHaveBeenCalledTimes(2);
    });

    it('should abort previous requests', async () => {
        const { result } = renderHook(() => useTeamMemberSearch(mockClient));

        await act(async () => {
            await result.current.handleSearchQueryByName('ab');
        });

        await act(async () => {
            await result.current.handleSearchQueryByName('abc');
        });

        expect(mockTeamMembersApi.search).toHaveBeenCalledTimes(2);
    });

    it('should cleanup on unmount', () => {
        const { result, unmount } = renderHook(() => useTeamMemberSearch(mockClient));

        act(() => {
            result.current.cleanup();
        });

        unmount();
    });
});
