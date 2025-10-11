import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TeamPageToolbar } from '../team-page-toolbar/TeamPageToolbar';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import axios from 'axios';
import './TeamPageContent.scss';
import { TeamMember } from '../../../../../types/admin/team-members';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { TeamCategoriesApi } from '../../../../../services/api/admin/team/team-categories/team-categories-api';
import { TeamMembersApi } from '../../../../../services/api/admin/team/team-members/team-members-api';
import { CategoryBar, ContextMenuOption } from '../../../../../components/admin/category-bar/CategoryBar';
import { InfiniteScrollList } from '../../../../../components/admin/infinite-scroll-list/InfiniteScrollList';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '../../../../../types/admin/toast';
import { ToastContainer } from '../../../../../components/admin/toast/toast-container/ToastContainer';
import { DraggableListItem } from '../../../../../components/admin/draggable-list-item/DraggableListItem';
import { MemberComponent } from '../member-component/MemberComponent';
import { TeamCategory } from '../../../../../types/admin/team-category';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { useModalsState } from '../../../../../hooks/admin/use-modals-state/useModalsState';
import { TeamPageModals } from '../team-page-modals/TeamPageModals';

const DEFAULT_LOAD_ITEMS_COUNT = 5;
const LIST_ITEM_HEIGHT_IN_PIXELS = 120;

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
    const modalsStateControl = useModalsState<TeamMember>();
    const { openModalActions, closeModalActions } = modalsStateControl;

    const listContainerRef = useRef<HTMLDivElement>(null);
    const currentItemsCountRef = useRef<number>(0);
    const totalItemsCountRef = useRef<number | null>(null);
    const selectedCategoryRef = useRef<TeamCategory | null>(null);
    const currentPageRef = useRef<number>(1);
    const hasMoreRef = useRef<boolean>(true);
    const isMembersLoadingRef = useRef(false);
    const isCategoriesLoadingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const setErrorState = useCallback((message: string, type: 'categories' | 'members') => {
        setError({ message, type });
    }, []);

    const clearError = useCallback(() => {
        setError({ message: null, type: null });
    }, []);

    const isAnyModalOpened = useMemo(() => {
        const { modalState } = modalsStateControl;
        return (
            modalState.isAddModalOpen ||
            modalState.isAddCategoryModalOpen ||
            modalState.isEditCategoryModalOpen ||
            modalState.isDeleteCategoryModalOpen ||
            !!modalState.itemToEdit ||
            !!modalState.itemToDelete
        );
    }, [modalsStateControl]);

    const onContextMenuOptionSelected = useCallback(
        (id: string) => {
            if (id === 'add') {
                openModalActions.openAddCategoryModal();
            } else if (id === 'edit') {
                openModalActions.openEditCategoryModal();
            } else if (id === 'delete') {
                openModalActions.openDeleteCategoryModal();
            }
        },
        [openModalActions],
    );

    const categoryBarContextMenuOptions: ContextMenuOption[] = useMemo(
        () => [
            { id: 'add', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_CATEGORY },
            { id: 'edit', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.EDIT_CATEGORY },
            { id: 'delete', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.DELETE_CATEGORY },
        ],
        [],
    );

    const resetMembersState = useCallback(() => {
        setMembers([]);
        setHasMore(true);
        clearError();
        currentPageRef.current = 1;
        currentItemsCountRef.current = 0;
        totalItemsCountRef.current = null;
        isMembersLoadingRef.current = false;
        hasMoreRef.current = true;
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
                setSelectedCategory((prevSelected: TeamCategory | null) => prevSelected ?? fetchedCategories[0]);
            }
        } catch (error: any) {
            if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                return;
            }

            setErrorState(COMMON_TEXT_ADMIN.CATEGORIES.MESSAGE.FAIL_TO_FETCH_CATEGORIES, 'categories');
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

    const handleSearchQueryByName = useCallback((_: string) => {
        // Implement search functionality
    }, []);

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
        openModalActions.openAddItemModal();
    }, [openModalActions]);

    const handleDeleteTeamMemberModalOpen = useCallback(
        (member: TeamMember) => {
            if (isAnyModalOpened) return;
            openModalActions.openDeleteItemModal(member);
        },
        [isAnyModalOpened, openModalActions],
    );

    const handleEditMemberModalOpen = useCallback(
        (member: TeamMember) => {
            if (isAnyModalOpened) return;
            openModalActions.openEditItemModal(member);
        },
        [isAnyModalOpened, openModalActions],
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
        if (selectedCategory) {
            resetMembersState();
        }
    }, [selectedCategory, resetMembersState]);

    useEffect(() => {
        if (selectedCategory) {
            resetMembersState();
            fetchMembers(true);
        }
    }, [statusFilter, selectedCategory, statusFilter, fetchMembers, resetMembersState]);

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

            setCategories((prevCategories) =>
                prevCategories.map((category) =>
                    category.id === selectedCategory!.id
                        ? { ...category, memberCount: category.teamMembersCount + 1 }
                        : category,
                ),
            );

            closeModalActions.closeAddItemModal();
            if (member.status === VisibilityStatus.Published) {
                addToast(TEAM_MEMBERS_TEXT.MESSAGE.DONT_FORGET_TO_ORDER, ToastType.Info);
            }
        },
        [closeModalActions, pageSize, selectedCategory?.id, addToast],
    );

    const handleEditMember = useCallback(
        (updatedMember: TeamMember) => {
            if (updatedMember.image && 'url' in updatedMember.image)
                updatedMember.image.url = `${updatedMember.image.url}?cb=${Date.now()}`;
            setMembers((prevMembers) =>
                prevMembers.map((member) => (member.id === updatedMember.id ? updatedMember : member)),
            );

            if (updatedMember.categoryId !== selectedCategory!.id) {
                setCategories((prevCategories) =>
                    prevCategories.map((category) => {
                        if (category.id === selectedCategory!.id) {
                            return { ...category, memberCount: category.teamMembersCount - 1 };
                        } else if (category.id === updatedMember.categoryId) {
                            return { ...category, memberCount: category.teamMembersCount + 1 };
                        }
                        return category;
                    }),
                );
            }

            closeModalActions.closeEditItemModal();
        },
        [closeModalActions, selectedCategory?.id],
    );

    const handleDeleteMember = useCallback(
        (memberToDelete: TeamMember) => {
            setMembers((prevMembers) => prevMembers.filter((member) => member.id !== memberToDelete.id));
            currentItemsCountRef.current -= 1;
            setCategories((prevCategories) =>
                prevCategories.map((category) =>
                    category.id === selectedCategory!.id
                        ? { ...category, memberCount: category.teamMembersCount - 1 }
                        : category,
                ),
            );

            closeModalActions.closeDeleteItemModal();
        },
        [closeModalActions, selectedCategory?.id],
    );

    const handleAddCategory = useCallback((newCategory: TeamCategory) => {
        setCategories((prevCategories) => [...prevCategories, newCategory]);
    }, []);

    const handleEditCategory = useCallback(
        (updatedCategory: TeamCategory) => {
            setCategories((prevCategories) =>
                prevCategories.map((category) => (category.id === updatedCategory.id ? updatedCategory : category)),
            );

            if (selectedCategory?.id === updatedCategory.id) {
                setSelectedCategory(updatedCategory);
            }
        },
        [selectedCategory?.id],
    );

    const handleDeleteCategory = useCallback(
        (categoryIdToDelete: number) => {
            setCategories((prevCategories) => {
                const updatedCategories = prevCategories.filter((category) => category.id !== categoryIdToDelete);

                if (selectedCategory?.id === categoryIdToDelete && updatedCategories.length > 0) {
                    setSelectedCategory(updatedCategories[0]);
                } else if (updatedCategories.length === 0) {
                    setSelectedCategory(null);
                }
                return updatedCategories;
            });
        },
        [selectedCategory?.id],
    );

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
                />
            </div>

            <div className="team-page-list-container" ref={listContainerRef}>
                <CategoryBar<TeamCategory>
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    getCategoryDisplayName={(category) => category.name}
                    getCategoryKey={(category) => category.id}
                    displayContextMenuButton={true}
                    contextMenuOptions={categoryBarContextMenuOptions}
                    onContextMenuOptionSelected={onContextMenuOptionSelected}
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
                    items={members}
                    renderItem={renderMemberItem}
                    onLoadMore={fetchMembers}
                    hasMore={hasMore}
                    isLoading={isMembersLoading || isCategoriesLoading}
                    emptyStateMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                />
            </div>

            <TeamPageModals
                modalsStateControl={modalsStateControl}
                categories={categories}
                onAddTeamMember={handleAddMember}
                onEditTeamMember={handleEditMember}
                onDeleteTeamMember={handleDeleteMember}
                onAddTeamCategory={handleAddCategory}
                onEditTeamCategory={handleEditCategory}
                onDeleteTeamCategory={handleDeleteCategory}
            />

            <ToastContainer />
        </div>
    );
};
