import { useCallback, useRef, useState } from 'react';
import axios, { AxiosInstance } from 'axios';
import { TEAM_SEARCH } from '@/const/admin/team';
import { TeamMember } from '@/types/admin/team-members';
import { TeamMembersApi } from '@/services/api/admin/team/team-members/team-members-api';

export const useTeamMemberSearch = (client: AxiosInstance) => {
    const [searchSuggestions, setSearchSuggestions] = useState<TeamMember[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [hasMoreSearch, setHasMoreSearch] = useState(false);

    const searchQueryRef = useRef('');
    const searchPageRef = useRef(0);
    const searchAbortControllerRef = useRef<AbortController | null>(null);

    const handleSearchQueryByName = useCallback(
        async (query: string) => {
            const trimmed = query.trim();
            if (trimmed === searchQueryRef.current) return;
            searchQueryRef.current = trimmed;

            if (trimmed.length === 0) {
                searchAbortControllerRef.current?.abort();
                setSearchSuggestions([]);
                setHasMoreSearch(false);
                setIsSearchLoading(false);
                searchPageRef.current = 0;
                return;
            }

            if (trimmed.length < TEAM_SEARCH.MIN_CHARACTERS_TO_SEARCH) return;

            searchAbortControllerRef.current?.abort();
            const abortController = new AbortController();
            searchAbortControllerRef.current = abortController;

            setIsSearchLoading(true);
            try {
                const res = await TeamMembersApi.search(
                    client,
                    trimmed,
                    0,
                    TEAM_SEARCH.SUGGESTIONS_PAGE_SIZE,
                    abortController.signal,
                );
                if (abortController.signal.aborted) return;

                setSearchSuggestions(res.items);
                searchPageRef.current = 1;
                setHasMoreSearch(res.items.length < res.totalItemsCount);
            } catch (e: any) {
                if (axios.isCancel?.(e) || e?.name === 'CanceledError' || e?.name === 'AbortError') return;
                setSearchSuggestions([]);
                setHasMoreSearch(false);
            } finally {
                if (!abortController.signal.aborted) setIsSearchLoading(false);
            }
        },
        [client],
    );

    const loadMoreSearchSuggestions = useCallback(async () => {
        if (isSearchLoading || !hasMoreSearch) return;

        const q = searchQueryRef.current;
        if (!q || q.length < TEAM_SEARCH.MIN_CHARACTERS_TO_SEARCH) return;

        searchAbortControllerRef.current?.abort();
        const abortController = new AbortController();
        searchAbortControllerRef.current = abortController;

        setIsSearchLoading(true);
        try {
            const offset = searchPageRef.current * TEAM_SEARCH.SUGGESTIONS_PAGE_SIZE;
            const res = await TeamMembersApi.search(
                client,
                q,
                offset,
                TEAM_SEARCH.SUGGESTIONS_PAGE_SIZE,
                abortController.signal,
            );
            if (abortController.signal.aborted) return;

            let actualLoadedCount = 0;

            setSearchSuggestions((prev) => {
                const existingIds = new Set(prev.map((m) => m.id));
                const newItems = res.items.filter((m) => !existingIds.has(m.id));

                const updatedList = [...prev, ...newItems];
                actualLoadedCount = updatedList.length;

                return updatedList;
            });

            searchPageRef.current += 1;

            setHasMoreSearch(actualLoadedCount < res.totalItemsCount);
        } catch (e: any) {
            if (axios.isCancel?.(e) || e?.name === 'CanceledError' || e?.name === 'AbortError') return;
        } finally {
            if (!abortController.signal.aborted) setIsSearchLoading(false);
        }
    }, [client, isSearchLoading, hasMoreSearch]);

    const cleanup = useCallback(() => {
        searchAbortControllerRef.current?.abort();
    }, []);

    return {
        searchSuggestions,
        isSearchLoading,
        hasMoreSearch,
        handleSearchQueryByName,
        loadMoreSearchSuggestions,
        cleanup,
    };
};
