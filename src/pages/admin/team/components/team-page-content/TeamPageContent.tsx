import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TeamMember, TeamCategory } from '../../../../../types/admin/TeamMembers';
import { DragPreviewModel, VisibilityStatus } from '../../../../../types/admin/Common';
import { TeamPageToolbar } from '../team-page-toolbar/TeamPageToolbar';
import { DeleteTeamMemberModal } from '../team-member-modals/DeleteTeamMemberModal';
import { InfiniteScrollList } from '../../../../../components/common/infinite-scroll-list/InfiniteScrollList';
import { TeamMemberModal } from '../team-member-modals/TeamMemberModal';
import { CategoryBar } from '../../../../../components/common/category-bar/CategoryBar';
import { TeamMembersApi } from '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamMembersApi/TeamMembersApi';
import { TeamCategoriesApi } from '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamCategoriesApi/TeamCategoriesApi';
import { TEAM_CATEGORY_TEXT, TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { useAdminClient } from '../../../../../utils/hooks/use-admin-client/useAdminClient';
import axios from 'axios';
import './team-page-content.scss';
import { MembersListItem } from '../members-list-item/MembersListItem';
import { MemberDragPreview } from '../member-drag-preview/MemberDragPreview';

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
    const client = useAdminClient();
    const [dragPreview, setDragPreview] = useState<DragPreviewModel<TeamMember>>({
        visible: false,
        x: 0,
        y: 0,
        member: null,
    });
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
    const [draggedId, setDraggedId] = useState<number | null>(null);

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
                const limit = pageSize;

                const fetchedMembers = await TeamMembersApi.getAll(
                    client,
                    searchCategoryId.id,
                    searchStatus,
                    offset,
                    limit,
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

                // For now, we'll assume we have more if we got a full page
                // In a real implementation, you'd get total count from the API
                setHasMore(currentItemsCountRef.current < fetchedMembers.totalItemsCount);
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

    const onStatusFilterChange = useCallback(
        (status: VisibilityStatus | undefined) => {
            setStatusFilter(status);
            resetMembersState();
        },
        [resetMembersState],
    );

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

    const handleDeleteProgramModalOpen = useCallback(
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

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDragStart = useCallback(
        (e: React.DragEvent<HTMLDivElement>, id: number) => {
            const member = members.filter((x) => x.id === id)[0];
            if (!member) {
                return;
            }
            setDraggedId(id);
            setDragPreview({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                member: member,
            });

            const dragImage = new Image();
            dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
            e.dataTransfer.setDragImage(dragImage, 0, 0);
        },
        [members],
    );
    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        if (e.clientX !== 0 && e.clientY !== 0) {
            setDragPreview((prev) => ({
                ...prev,
                x: e.clientX,
                y: e.clientY,
            }));
        }
    };
    const handleDragEnd = () => {
        setDragPreview({
            visible: false,
            x: 0,
            y: 0,
            member: null,
        });
        setDraggedId(null);
    };

    const handleDrop = useCallback(
        async (id: number) => {
            try {
                if (draggedId === null || draggedId === id) return;

                const updatedMembers = [...members];
                const fromIndex = updatedMembers.findIndex((m) => m.id === draggedId);
                const toIndex = updatedMembers.findIndex((m) => m.id === id);

                const [draggedItem] = updatedMembers.splice(fromIndex, 1);
                updatedMembers.splice(toIndex, 0, draggedItem);

                setMembers(updatedMembers);
                setDraggedId(null);

                const orderedIds = updatedMembers.map((m) => m.id);
                const categoryId = selectedCategory?.id ?? 0;

                await TeamMembersApi.reorder(client, categoryId, orderedIds);
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }

                setErrorState(TEAM_MEMBERS_TEXT.MESSAGE.FAIL_TO_REORDER_MEMBERS, 'members');
            }
        },
        [client, draggedId, members, selectedCategory?.id, setErrorState],
    );
    const renderMemberItem = useCallback(
        (member: TeamMember) => (
            <MembersListItem
                member={member}
                handleOnDeleteMember={handleDeleteProgramModalOpen}
                handleOnEditMember={handleEditMemberModalOpen}
                key={member.id}
                draggedIndex={draggedId}
                handleDragOver={handleDragOver}
                handleDragStart={handleDragStart}
                handleDrag={handleDrag}
                handleDragEnd={handleDragEnd}
                handleDrop={handleDrop}
                id={member.id}
            />
        ),
        [draggedId, handleDeleteProgramModalOpen, handleDragStart, handleDrop, handleEditMemberModalOpen],
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
    }, [selectedCategory, statusFilter, fetchMembers, resetMembersState]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (dragPreview.visible) {
                setDragPreview((prev) => ({
                    ...prev,
                    x: e.clientX,
                    y: e.clientY,
                }));
            }
        };

        if (dragPreview.visible) {
            document.addEventListener('mousemove', handleMouseMove);
        }

        if (dragPreview.visible) {
            document.addEventListener('mousemove', handleMouseMove);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
            };
        }

        return () => {};
    }, [dragPreview.visible]);

    const handleAddMember = useCallback(
        (member: TeamMember) => {
            setMembers((prevMembers) => {
                if (prevMembers.length < pageSize * currentPageRef.current) {
                    return [...prevMembers, member];
                } else {
                    setHasMore(true);
                }
                return prevMembers;
            });

            currentItemsCountRef.current += 1;

            updateModalState({ isAddMemberModalOpen: false });
        },
        [updateModalState, pageSize],
    );

    const handleEditMember = useCallback(
        (updatedMember: TeamMember) => {
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

    return (
        <div className="team-page-wrapper" data-testid="team-page-content">
            <MemberDragPreview dragPreview={dragPreview} />
            <div className="team-page-toolbar-container">
                <TeamPageToolbar
                    autocompleteValues={[]}
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
                    items={members}
                    renderItem={renderMemberItem}
                    onLoadMore={fetchMembers}
                    hasMore={hasMore}
                    isLoading={isMembersLoading || isCategoriesLoading}
                    emptyStateMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                />
            </div>

            <TeamMemberModal
                mode="add"
                isOpen={modalState.isAddMemberModalOpen}
                onClose={closeModalActions.addMember}
                onAddMember={handleAddMember}
                categories={categories}
            />

            <TeamMemberModal
                mode="edit"
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
        </div>
    );
};
