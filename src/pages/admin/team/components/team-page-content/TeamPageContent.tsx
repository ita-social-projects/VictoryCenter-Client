import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TeamPageToolbar } from '../team-page-toolbar/TeamPageToolbar';
import { DeleteTeamMemberModal } from '../team-member-modals/delete-team-member-modal/DeleteTeamMemberModal';
import { TeamMemberModal } from '../team-member-modals/team-member-modal/TeamMemberModal';
import { TEAM_CATEGORY_TEXT, TEAM_MEMBERS_TEXT, TEAM_SEARCH } from '../../../../../const/admin/team';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import axios from 'axios';
import './TeamPageContent.scss';
import { TeamCategory, TeamMember } from '../../../../../types/admin/team-members';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { VisibilityStatus, ModalMode } from '../../../../../types/admin/common';
import { TeamCategoriesApi } from '../../../../../services/api/admin/team/team-categories/team-categories-api';
import { TeamMembersApi } from '../../../../../services/api/admin/team/team-members/team-members-api';
import { CategoryBar } from '../../../../../components/admin/category-bar/CategoryBar';
import { InfiniteScrollList } from '../../../../../components/admin/infinite-scroll-list/InfiniteScrollList';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '../../../../../types/admin/toast';
import { ToastContainer } from '../../../../../components/admin/toast/toast-container/ToastContainer';
import { DraggableListItem } from '../../../../../components/admin/draggable-list-item/DraggableListItem';
import { MemberComponent } from '../member-component/MemberComponent';

const DEFAULT_LOAD_ITEMS_COUNT = 5;
const LIST_ITEM_HEIGHT_IN_PIXELS = 120;

interface ModalState {
    isAddMemberModalOpen: boolean;
    memberToDelete: TeamMember | null;
    memberToEdit: TeamMember | null;
    isAddCategoryModalOpen: boolean;
    isEditCategoryModalOpen: boolean;
    isDeleteCategoryModalOpen: boolean;
}

interface ErrorState {
    message: string | null;
    type: 'categories' | 'members' | null;
}

export const TeamPageContent = () => {
    const { addToast } = useToast();
    const client = useAdminClient();
    const [categories, setCategories] = useState<TeamCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<TeamCategory | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [pageSize, setPageSize] = useState(DEFAULT_LOAD_ITEMS_COUNT);
    const [hasMore, setHasMore] = useState(true);
    const [isMembersLoading, setIsMembersLoading] = useState(false);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [error, setError] = useState<ErrorState>({ message: null, type: null });
    const [modalState, setModalState] = useState<ModalState>({
        isAddMemberModalOpen: false,
        memberToDelete: null,
        memberToEdit: null,
        isAddCategoryModalOpen: false,
        isEditCategoryModalOpen: false,
        isDeleteCategoryModalOpen: false,
    });
    const [searchSuggestions, setSearchSuggestions] = useState<TeamMember[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [hasMoreSearch, setHasMoreSearch] = useState(false);
    const [selectedSearchMember, setSelectedSearchMember] = useState<TeamMember | null>(null);
    const [statusResetTick, setStatusResetTick] = useState(0);

    const listContainerRef = useRef<HTMLDivElement>(null);
    const currentItemsCountRef = useRef<number>(0);
    const totalItemsCountRef = useRef<number | null>(null);
    const selectedCategoryRef = useRef<TeamCategory | null>(null);
    const currentPageRef = useRef<number>(1);
    const hasMoreRef = useRef<boolean>(true);
    const isMembersLoadingRef = useRef(false);
    const isCategoriesLoadingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const searchQueryRef = useRef<string>('');
    const searchPageRef = useRef<number>(0);
    const searchAbortControllerRef = useRef<AbortController | null>(null);

    const setErrorState = useCallback((message: string, type: 'categories' | 'members') => {
        setError({ message, type });
    }, []);

    const clearError = useCallback(() => {
        setError({ message: null, type: null });
    }, []);

    const updateModalState = useCallback((updates: Partial<ModalState>) => {
        setModalState((prev) => ({ ...prev, ...updates }));
    }, []);

    const isAnyModalOpened = useMemo(() => {
        return Object.values(modalState).some((value) => (typeof value === 'boolean' ? value : value !== null));
    }, [modalState]);

    const closeModalActions = useMemo(
        () => ({
            addMember: () => updateModalState({ isAddMemberModalOpen: false }),
            editMember: () => updateModalState({ memberToEdit: null }),
            deleteMember: () => updateModalState({ memberToDelete: null }),
        }),
        [updateModalState],
    );

    const isSingleView = !!selectedSearchMember;
    const itemsToRender = useMemo(() => {
        if (isSingleView && selectedCategory && selectedSearchMember?.categoryId === selectedCategory.id) {
            return [selectedSearchMember];
        }
        return members;
    }, [isSingleView, selectedCategory, selectedSearchMember, members]);

    const resetMembersState = useCallback(() => {
        setMembers([]);
        setHasMore(true);
        clearError();
        currentPageRef.current = 1;
        currentItemsCountRef.current = 0;
        totalItemsCountRef.current = null;
        isMembersLoadingRef.current = false;
        hasMoreRef.current = true;

        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
    }, [clearError]);

    const fetchCategories = useCallback(async () => {
        if (isCategoriesLoadingRef.current) {
            return;
        }

        try {
            isCategoriesLoadingRef.current = true;
            setIsCategoriesLoading(true);
            clearError();

            const fetchedCategories = await TeamCategoriesApi.getAll(client);
            setCategories(fetchedCategories);

            if (fetchedCategories.length > 0) {
                setSelectedCategory((prevSelected) => prevSelected ?? fetchedCategories[0]);
            }
        } catch (error: any) {
            if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                return;
            }

            setErrorState(TEAM_CATEGORY_TEXT.MESSAGE.FAIL_TO_FETCH_CATEGORIES, 'categories');
        } finally {
            isCategoriesLoadingRef.current = false;
            setIsCategoriesLoading(false);
        }
    }, [clearError, setErrorState, client]);

    const fetchMembers = useCallback(
        async (shouldResetList: boolean = false) => {
            if (
                isMembersLoadingRef.current ||
                !selectedCategoryRef.current ||
                !hasMoreRef.current ||
                abortControllerRef.current?.signal.aborted
            ) {
                return;
            }

            abortControllerRef.current?.abort();

            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            try {
                isMembersLoadingRef.current = true;
                setIsMembersLoading(true);
                clearError();

                const searchCategoryId = selectedCategoryRef.current;
                const searchStatus = statusFilter;
                const pageToFetch = shouldResetList ? 0 : currentPageRef.current;
                const offset = pageToFetch * pageSize;

                const fetchedMembers = await TeamMembersApi.getAll(
                    client,
                    searchCategoryId.id,
                    searchStatus,
                    offset,
                    pageSize,
                );

                if (abortController.signal.aborted) {
                    return;
                }

                setMembers((prev) => {
                    if (shouldResetList) {
                        return [...fetchedMembers.items];
                    } else {
                        const existingIds = new Set(prev.map((m) => m.id));
                        const uniqueFetchedMembers = fetchedMembers.items.filter((m) => !existingIds.has(m.id));
                        return [...prev, ...uniqueFetchedMembers];
                    }
                });

                currentPageRef.current = pageToFetch + 1;

                if (shouldResetList) {
                    currentItemsCountRef.current = fetchedMembers.items.length;
                } else {
                    currentItemsCountRef.current += fetchedMembers.items.length;
                }

                setHasMore(currentItemsCountRef.current < fetchedMembers.totalItemsCount);
                hasMoreRef.current = currentItemsCountRef.current < fetchedMembers.totalItemsCount;
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }

                setErrorState(TEAM_MEMBERS_TEXT.MESSAGE.FAIL_TO_FETCH_MEMBERS, 'members');
            } finally {
                isMembersLoadingRef.current = false;
                setIsMembersLoading(false);
            }
        },
        [clearError, setErrorState, pageSize, statusFilter, client],
    );

    const handleSearchQueryByName = useCallback(
        async (query: string) => {
            const PAGE_SIZE = TEAM_SEARCH.SUGGESTIONS_PAGE_SIZE;

            const trimmed = (query ?? '').trim();
            if (trimmed === searchQueryRef.current) {
                return;
            }
            searchQueryRef.current = trimmed;

            if (trimmed.length === 0) {
                searchAbortControllerRef.current?.abort();
                setSearchSuggestions([]);
                setHasMoreSearch(false);
                setIsSearchLoading(false);
                searchPageRef.current = 0;
                return;
            }

            if (trimmed.length < 2) {
                return;
            }
            const localQuery = trimmed;

            searchAbortControllerRef.current?.abort();
            const abortController = new AbortController();
            searchAbortControllerRef.current = abortController;

            setIsSearchLoading(true);
            try {
                const res = await TeamMembersApi.search(client, trimmed, 0, PAGE_SIZE, abortController.signal);
                if (searchQueryRef.current !== localQuery) return;

                setSearchSuggestions(res.items);
                searchPageRef.current = 1;
                setHasMoreSearch(res.items.length < res.totalItemsCount);
            } catch (e) {
                if (axios.isCancel?.(e) || (e as any)?.name === 'CanceledError' || (e as any)?.name === 'AbortError')
                    return;
                setSearchSuggestions([]);
                setHasMoreSearch(false);
            } finally {
                if (!abortController.signal.aborted) setIsSearchLoading(false);
            }
        },
        [client],
    );

    const loadMoreSearchSuggestions = useCallback(async () => {
        const PAGE_SIZE = TEAM_SEARCH.SUGGESTIONS_PAGE_SIZE;

        if (isSearchLoading || !hasMoreSearch) return;
        const q = searchQueryRef.current;
        if (!q || q.length < 2) return;

        searchAbortControllerRef.current?.abort();
        const abortController = new AbortController();
        searchAbortControllerRef.current = abortController;

        setIsSearchLoading(true);
        try {
            const offset = searchPageRef.current * PAGE_SIZE;
            const res = await TeamMembersApi.search(client, q, offset, PAGE_SIZE);
            if (abortController.signal.aborted) return;

            setSearchSuggestions((prev) => {
                const existing = new Set(prev.map((m) => m.id));
                const unique = res.items.filter((m) => !existing.has(m.id));
                return [...prev, ...unique];
            });

            searchPageRef.current += 1;
            const loaded = searchPageRef.current * PAGE_SIZE;
            setHasMoreSearch(loaded < res.totalItemsCount);
        } catch (e) {
            if (axios.isCancel?.(e) || (e as any)?.name === 'CanceledError' || (e as any)?.name === 'AbortError')
                return;
        } finally {
            if (!abortController.signal.aborted) setIsSearchLoading(false);
        }
    }, [client, hasMoreSearch, isSearchLoading]);

    const onStatusFilterChange = useCallback((status: VisibilityStatus | undefined) => {
        setStatusFilter(status);
    }, []);

    const handleCategorySelect = useCallback(
        (category: TeamCategory) => {
            setSelectedCategory(category);
            resetMembersState();
        },
        [resetMembersState],
    );

    const handleAddMemberModalOpen = useCallback(() => {
        updateModalState({ isAddMemberModalOpen: true });
    }, [updateModalState]);

    const handleDeleteTeamMemberModalOpen = useCallback(
        (member: TeamMember) => {
            if (isAnyModalOpened) return;
            updateModalState({ memberToDelete: member });
        },
        [isAnyModalOpened, updateModalState],
    );

    const handleEditMemberModalOpen = useCallback(
        (member: TeamMember) => {
            if (isAnyModalOpened) return;
            updateModalState({ memberToEdit: member });
        },
        [isAnyModalOpened, updateModalState],
    );

    const handleEntitiesReordered = useCallback(
        async (members: TeamMember[]) => {
            try {
                setMembers(members);
                const orderedIds = members.map((m) => m.id);
                const categoryId = selectedCategory?.id ?? 0;

                await TeamMembersApi.reorder(client, categoryId, orderedIds);
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }

                setErrorState(TEAM_MEMBERS_TEXT.MESSAGE.FAIL_TO_REORDER_MEMBERS, 'members');
            }
        },
        [client, selectedCategory?.id, setErrorState],
    );

    const handleRetry = useCallback(() => {
        if (error.type === 'categories') {
            fetchCategories();
        } else if (error.type === 'members') {
            resetMembersState();
        }
    }, [error.type, fetchCategories, resetMembersState]);

    const updatePageSize = () => {
        if (listContainerRef.current) {
            const calculatedPageSize =
                Math.floor(listContainerRef.current.clientHeight / LIST_ITEM_HEIGHT_IN_PIXELS) + 1;
            setPageSize(Math.max(calculatedPageSize, DEFAULT_LOAD_ITEMS_COUNT));
        }
    };

    useEffect(() => {
        return () => {
            searchAbortControllerRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        window.addEventListener('resize', updatePageSize);
        return () => window.removeEventListener('resize', updatePageSize);
    }, []);

    useEffect(() => {
        updatePageSize();
    }, [listContainerRef]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        selectedCategoryRef.current = selectedCategory;
        if (selectedCategory && !selectedSearchMember) {
            resetMembersState();
            fetchMembers(true);
        }
    }, [selectedCategory, statusFilter, selectedSearchMember, resetMembersState, fetchMembers]);

    const handleAddMember = useCallback(
        (member: TeamMember) => {
            setMembers((prevMembers) => {
                if (
                    prevMembers.length < pageSize * currentPageRef.current &&
                    selectedCategory?.id === member.categoryId
                ) {
                    return [...prevMembers, member];
                } else {
                    setHasMore(true);
                    hasMoreRef.current = true;
                }
                return prevMembers;
            });

            currentItemsCountRef.current += 1;

            updateModalState({ isAddMemberModalOpen: false });
            if (member.status === VisibilityStatus.Published) {
                addToast(TEAM_MEMBERS_TEXT.MESSAGE.DONT_FORGET_TO_ORDER, ToastType.Info);
            }
        },
        [updateModalState, pageSize, selectedCategory?.id, addToast],
    );

    const handleEditMember = useCallback(
        (updatedMember: TeamMember) => {
            if (updatedMember.image && 'url' in updatedMember.image)
                updatedMember.image.url = `${updatedMember.image.url}?cb=${Date.now()}`;
            setMembers((prevMembers) =>
                prevMembers.map((member) => (member.id === updatedMember.id ? updatedMember : member)),
            );

            updateModalState({ memberToEdit: null });
        },
        [updateModalState],
    );

    const handleDeleteMember = useCallback(
        (memberToDelete: TeamMember) => {
            setMembers((prevMembers) => prevMembers.filter((member) => member.id !== memberToDelete.id));

            currentItemsCountRef.current -= 1;

            updateModalState({ memberToDelete: null });
        },
        [updateModalState],
    );

    const handleSearchItemSelect = useCallback(
        (member: TeamMember) => {
            setSelectedSearchMember(member);
            setStatusFilter(undefined);
            setStatusResetTick((t) => t + 1);
            const cat = categories.find((c) => c.id === member.categoryId) || null;
            if (cat) setSelectedCategory(cat);
        },
        [categories],
    );
    const handleSearchClearSelection = useCallback(() => {
        const wasSelected = selectedSearchMember !== null;
        setSelectedSearchMember(null);
        setStatusFilter(undefined);
        setStatusResetTick((t) => t + 1);
        resetMembersState();
        if (!wasSelected) fetchMembers(true);
    }, [selectedSearchMember, resetMembersState, fetchMembers]);

    const renderMemberItem = useCallback(
        (member: TeamMember) => (
            <DraggableListItem
                key={member.id}
                entity={member}
                id={member.id}
                ariaLabel={TEAM_MEMBERS_TEXT.ACTIONS.REORDER}
                renderEntityComponent={(m) => (
                    <MemberComponent
                        key={m.id}
                        member={m}
                        handleOnDeleteMember={handleDeleteTeamMemberModalOpen}
                        handleOnEditMember={handleEditMemberModalOpen}
                    />
                )}
                entities={members}
                idSelector={(m) => m.id}
                onEntitiesReordered={handleEntitiesReordered}
            ></DraggableListItem>
        ),
        [handleDeleteTeamMemberModalOpen, handleEditMemberModalOpen, handleEntitiesReordered, members],
    );

    return (
        <div className="team-page-wrapper" data-testid="team-page-content">
            <div className="team-page-toolbar-container">
                <TeamPageToolbar
                    onSearchQueryChange={handleSearchQueryByName}
                    onStatusFilterChange={onStatusFilterChange}
                    onAddMember={handleAddMemberModalOpen}
                    searchItems={searchSuggestions}
                    isSearchLoading={isSearchLoading}
                    searchHasMore={hasMoreSearch}
                    onSearchLoadMore={loadMoreSearchSuggestions}
                    categories={categories}
                    onSearchItemSelect={handleSearchItemSelect}
                    onSearchClear={handleSearchClearSelection}
                    statusResetKey={statusResetTick}
                />
            </div>

            <div className="team-page-list-container" ref={listContainerRef}>
                <CategoryBar<TeamCategory>
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    getCategoryDisplayName={(category) => category.name}
                    getCategoryKey={(category) => category.id}
                    displayContextMenuButton={false}
                />

                {error.message && (
                    <div className="team-page-error-container" data-testid="team-error-container">
                        <span>{error.message}</span>
                        <button onClick={handleRetry} type="button" className="retry-link">
                            {COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN}
                        </button>
                    </div>
                )}

                <InfiniteScrollList<TeamMember>
                    items={itemsToRender}
                    renderItem={renderMemberItem}
                    onLoadMore={fetchMembers}
                    hasMore={hasMore}
                    isLoading={isMembersLoading || isCategoriesLoading}
                    emptyStateMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                />
            </div>

            <TeamMemberModal
                mode={ModalMode.Add}
                isOpen={modalState.isAddMemberModalOpen}
                onClose={closeModalActions.addMember}
                onAddMember={handleAddMember}
                categories={categories}
            />

            <TeamMemberModal
                mode={ModalMode.Edit}
                isOpen={!!modalState.memberToEdit}
                onClose={closeModalActions.editMember}
                memberToEdit={modalState.memberToEdit!}
                onEditMember={handleEditMember}
                categories={categories}
            />

            <DeleteTeamMemberModal
                isOpen={!!modalState.memberToDelete}
                onClose={closeModalActions.deleteMember}
                memberToDelete={modalState.memberToDelete}
                onDeleteMember={handleDeleteMember}
            />

            <ToastContainer />
        </div>
    );
};
