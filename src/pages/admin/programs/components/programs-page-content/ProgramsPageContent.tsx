import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Program, ProgramCategory } from '../../../../../types/ProgramAdminPage';
import { VisibilityStatus } from '../../../../../types/Common';
import { ProgramsPageToolbar } from '../programs-page-toolbar/ProgramsPageToolbar';
import { DeleteProgramModal } from '../program-modals/DeleteProgramModal';
import { InfiniteScrollList } from '../../../../../components/common/infinite-scroll-list/InfiniteScrollList';
import { ProgramModal } from '../program-modals/ProgramModal';
import { CategoryBar, ContextMenuOption } from '../../../../../components/common/category-bar/CategoryBar';
import { DeleteCategoryModal } from '../program-category-modals/DeleteCategoryModal';
import { ProgramCategoryModal } from '../program-category-modals/ProgramCategoryModal';
import { ProgramListItem } from '../program-list-item/ProgramListItem';
import { ProgramsApi } from '../../../../../services/api/admin/programs/programs-api';
import { PROGRAM_CATEGORY_TEXT, PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import axios from 'axios';
import './programs-page-content.scss';

const DEFAULT_LOAD_ITEMS_COUNT = 5;

type ContextMenuAction = 'add' | 'edit' | 'delete';

interface ModalState {
    isAddProgramModalOpen: boolean;
    programToDelete: Program | null;
    programToEdit: Program | null;
    isAddCategoryModalOpen: boolean;
    isEditCategoryModalOpen: boolean;
    isDeleteCategoryModalOpen: boolean;
}

interface ErrorState {
    message: string | null;
    type: 'categories' | 'programs' | null;
}

export const ProgramsPageContent = () => {
    const [categories, setCategories] = useState<ProgramCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ProgramCategory | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isProgramsLoading, setIsProgramsLoading] = useState(false);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [autocompleteValues] = useState<string[]>([]);
    const [error, setError] = useState<ErrorState>({ message: null, type: null });
    const [modalState, setModalState] = useState<ModalState>({
        isAddProgramModalOpen: false,
        programToDelete: null,
        programToEdit: null,
        isAddCategoryModalOpen: false,
        isEditCategoryModalOpen: false,
        isDeleteCategoryModalOpen: false,
    });

    const listContainerRef = useRef<HTMLDivElement>(null);
    const currentItemsCountRef = useRef<number>(0);
    const totalItemsCountRef = useRef<number | null>(null);
    const selectedCategoryRef = useRef<ProgramCategory | null>(null);
    const currentPageRef = useRef<number>(1);
    const hasMoreRef = useRef<boolean>(true);
    const isProgramsLoadingRef = useRef(false);
    const isCategoriesLoadingRef = useRef(false);
    // Cancellation of previous unfinished requests
    const abortControllerRef = useRef<AbortController | null>(null);

    const isAnyModalOpened = useMemo(() => {
        return Object.values(modalState).some((value) => (typeof value === 'boolean' ? value : value !== null));
    }, [modalState]);

    const categoryBarContextMenuOptions: ContextMenuOption[] = useMemo(
        () => [
            { id: 'add', name: PROGRAM_CATEGORY_TEXT.BUTTON.ADD_CATEGORY },
            { id: 'edit', name: PROGRAM_CATEGORY_TEXT.BUTTON.EDIT_CATEGORY },
            { id: 'delete', name: PROGRAM_CATEGORY_TEXT.BUTTON.DELETE_CATEGORY },
        ],
        [],
    );

    const setErrorState = useCallback((message: string, type: 'categories' | 'programs') => {
        setError({ message, type });
    }, []);

    const clearError = useCallback(() => {
        setError({ message: null, type: null });
    }, []);

    const updateModalState = useCallback((updates: Partial<ModalState>) => {
        setModalState((prev) => ({ ...prev, ...updates }));
    }, []);

    const resetProgramsState = useCallback(() => {
        setPrograms([]);
        setHasMore(true);
        clearError();
        currentPageRef.current = 1;
        currentItemsCountRef.current = 0;
        totalItemsCountRef.current = null;
        isProgramsLoadingRef.current = false;
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

            const fetchedCategories = await ProgramsApi.fetchProgramCategories();
            setCategories(fetchedCategories);

            if (fetchedCategories.length > 0) {
                setSelectedCategory((prevSelected) => prevSelected ?? fetchedCategories[0]);
            }
        } catch (error) {
            setErrorState(PROGRAM_CATEGORY_TEXT.MESSAGE.FAIL_TO_FETCH_CATEGORIES, 'categories');
        } finally {
            isCategoriesLoadingRef.current = false;
            setIsCategoriesLoading(false);
        }
    }, [clearError, setErrorState]);

    const fetchPrograms = useCallback(
        async (shouldResetList: boolean = false, itemsToFetch: number | null = null) => {
            if (
                isProgramsLoadingRef.current ||
                !selectedCategoryRef.current ||
                !hasMoreRef.current ||
                abortControllerRef.current?.signal.aborted
            ) {
                return;
            }

            // Cancel previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            try {
                isProgramsLoadingRef.current = true;
                setIsProgramsLoading(true);
                clearError();

                const searchCategoryId = selectedCategoryRef.current;
                const searchStatus = statusFilter;
                const pageToFetch = shouldResetList ? 0 : currentPageRef.current;
                const offset = pageToFetch * DEFAULT_LOAD_ITEMS_COUNT;
                const limit = DEFAULT_LOAD_ITEMS_COUNT;

                const fetchResult = await ProgramsApi.fetchPrograms(searchCategoryId.id, offset, limit, searchStatus, {
                    cancellationSignal: abortController.signal,
                });

                if (abortController.signal.aborted) {
                    return;
                }

                const { items: fetchedPrograms, totalItemsCount: fetchedTotalItemsCount } = fetchResult;

                setPrograms((prev) => {
                    if (shouldResetList) {
                        return [...fetchedPrograms];
                    } else {
                        // Prevent duplicate programs when appending new items to existing list
                        const existingIds = new Set(prev.map((p) => p.id));
                        const uniqueFetchedPrograms = fetchedPrograms.filter((p) => !existingIds.has(p.id));
                        return [...prev, ...uniqueFetchedPrograms];
                    }
                });

                currentPageRef.current = pageToFetch + 1;

                if (shouldResetList) {
                    currentItemsCountRef.current = fetchedPrograms.length;
                } else {
                    currentItemsCountRef.current += fetchedPrograms.length;
                }

                totalItemsCountRef.current = fetchedTotalItemsCount;
                setHasMore(currentItemsCountRef.current < fetchedTotalItemsCount);
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }

                setErrorState(PROGRAMS_TEXT.MESSAGE.FAIL_TO_FETCH_PROGRAMS, 'programs');
            } finally {
                // Only update loading state if this request wasn't aborted
                if (!abortController.signal.aborted) {
                    isProgramsLoadingRef.current = false;
                    setIsProgramsLoading(false);
                }

                if (abortControllerRef.current === abortController) {
                    abortControllerRef.current = null;
                }
            }
        },
        [statusFilter, clearError, setErrorState],
    );

    useEffect(() => {
        hasMoreRef.current = hasMore;
        selectedCategoryRef.current = selectedCategory;
        isProgramsLoadingRef.current = isProgramsLoading;
    }, [selectedCategory, hasMore, isProgramsLoading]);

    // Initialize categories on mount
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Clear errors, reset and fetch programs when category or filter changes
    useEffect(() => {
        if (!selectedCategory) return;

        resetProgramsState();
        fetchPrograms(true);
    }, [selectedCategory, statusFilter, resetProgramsState, fetchPrograms]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Toolbar handlers
    const handleSearchQueryByName = useCallback((query: string) => {
        // TODO: Finish search by name
    }, []);

    const onStatusFilterChange = useCallback((status: VisibilityStatus | undefined) => {
        setStatusFilter(status);
    }, []);

    // Program handlers
    const handleAddProgramStarted = useCallback(() => {
        if (isAnyModalOpened) return;
        updateModalState({ isAddProgramModalOpen: true });
    }, [updateModalState, isAnyModalOpened]);

    const handleEditProgramStarted = useCallback(
        (program: Program) => {
            if (isAnyModalOpened) return;
            updateModalState({ programToEdit: program });
        },
        [updateModalState, isAnyModalOpened],
    );

    const handleDeleteProgramStarted = useCallback(
        (program: Program) => {
            if (isAnyModalOpened) return;
            updateModalState({ programToDelete: program });
        },
        [updateModalState, isAnyModalOpened],
    );

    const handleAddProgram = useCallback(
        (program: Program) => {
            setPrograms((prevPrograms) => {
                currentItemsCountRef.current += 1;
                if (totalItemsCountRef.current !== null) {
                    totalItemsCountRef.current += 1;
                }
                return [program, ...prevPrograms];
            });
            updateModalState({ isAddProgramModalOpen: false });
        },
        [updateModalState],
    );

    const handleEditProgram = useCallback(
        (program: Program) => {
            setPrograms((prevPrograms) => prevPrograms.map((p) => (p.id === program.id ? program : p)));
            updateModalState({ programToEdit: null });
        },
        [updateModalState],
    );

    const handleDeleteProgram = useCallback(
        (program: Program) => {
            setPrograms((prevPrograms) => {
                const filtered = prevPrograms.filter((p) => p.id !== program.id);

                currentItemsCountRef.current = Math.max(0, currentItemsCountRef.current - 1);
                if (totalItemsCountRef.current !== null) {
                    totalItemsCountRef.current = Math.max(0, totalItemsCountRef.current - 1);
                }

                return filtered;
            });
            updateModalState({ programToDelete: null });
        },
        [updateModalState],
    );

    // Category handlers
    const handleCategorySelect = useCallback((category: ProgramCategory) => {
        setSelectedCategory(category);
    }, []);

    const handleAddCategory = useCallback(
        (newCategory: ProgramCategory) => {
            setCategories((prev) => [...prev, newCategory]);
            updateModalState({ isAddCategoryModalOpen: false });
        },
        [updateModalState],
    );

    const handleEditCategory = useCallback(
        (updatedCategory: ProgramCategory) => {
            setCategories((prev) => prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)));
            updateModalState({ isEditCategoryModalOpen: false });
        },
        [updateModalState],
    );

    const handleDeleteCategory = useCallback(
        (categoryId: number) => {
            setCategories((prev) => {
                const filtered = prev.filter((category) => category.id !== categoryId);

                if (selectedCategory?.id === categoryId && filtered.length > 0) {
                    if (filtered.length > 0) {
                        // Look for first available category
                        const currentCategoryIndex = prev.findIndex((category) => category.id === categoryId);
                        const nextCategory = filtered[Math.min(currentCategoryIndex, filtered.length - 1)];
                        selectedCategoryRef.current = nextCategory;
                        setSelectedCategory(nextCategory);
                    } else {
                        selectedCategoryRef.current = null;
                        setSelectedCategory(null);
                    }
                }

                return filtered;
            });
            updateModalState({ isDeleteCategoryModalOpen: false });
        },
        [selectedCategory, updateModalState],
    );

    // Retry function for error recovery
    const handleRetry = useCallback(() => {
        if (error.type === 'programs') {
            clearError();
            fetchPrograms(true);
        } else if (error.type === 'categories') {
            clearError();
            fetchCategories();
        }
    }, [error.type, fetchPrograms, fetchCategories, clearError]);

    // Context menu handlers
    const onContextMenuOptionSelected = useCallback(
        (id: string) => {
            if (isAnyModalOpened) return;

            const action = id as ContextMenuAction;
            switch (action) {
                case 'add':
                    updateModalState({ isAddCategoryModalOpen: true });
                    break;
                case 'edit':
                    updateModalState({ isEditCategoryModalOpen: true });
                    break;
                case 'delete':
                    updateModalState({ isDeleteCategoryModalOpen: true });
                    break;
                default:
                    break;
            }
        },
        [isAnyModalOpened, updateModalState],
    );

    const renderProgramItem = useCallback(
        (program: Program) => (
            <ProgramListItem
                key={program.id}
                program={program}
                handleOnEditProgram={handleEditProgramStarted}
                handleOnDeleteProgram={handleDeleteProgramStarted}
            />
        ),
        [handleEditProgramStarted, handleDeleteProgramStarted],
    );

    const closeModalActions = useMemo(
        () => ({
            addProgram: () => updateModalState({ isAddProgramModalOpen: false }),
            editProgram: () => updateModalState({ programToEdit: null }),
            deleteProgram: () => updateModalState({ programToDelete: null }),
            addCategory: () => updateModalState({ isAddCategoryModalOpen: false }),
            editCategory: () => updateModalState({ isEditCategoryModalOpen: false }),
            deleteCategory: () => updateModalState({ isDeleteCategoryModalOpen: false }),
        }),
        [updateModalState],
    );

    return (
        <div className="programs-page-wrapper" data-testid="programs-page-content">
            <div className="programs-page-toolbar-container">
                <ProgramsPageToolbar
                    autocompleteValues={autocompleteValues}
                    onSearchQueryChange={handleSearchQueryByName}
                    onStatusFilterChange={onStatusFilterChange}
                    onAddProgram={handleAddProgramStarted}
                />
            </div>

            <div className="programs-page-list-container" ref={listContainerRef}>
                <CategoryBar<ProgramCategory>
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    getItemDisplayName={(category) => category.name}
                    getItemKey={(category) => category.id}
                    displayContextMenuButton={true}
                    contextMenuOptions={categoryBarContextMenuOptions}
                    onContextMenuOptionSelected={onContextMenuOptionSelected}
                />

                {error.message && (
                    <div className="programs-page-error-container" data-testid="programs-error-container">
                        <span>{error.message}</span>
                        <button onClick={handleRetry} type="button" className="retry-link">
                            {COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN}
                        </button>
                    </div>
                )}

                <InfiniteScrollList<Program>
                    items={programs}
                    renderItem={renderProgramItem}
                    onLoadMore={fetchPrograms}
                    hasMore={hasMore}
                    isLoading={isProgramsLoading || isCategoriesLoading}
                    emptyStateMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                />
            </div>

            {/* Program Modals */}
            <ProgramModal
                mode="add"
                isOpen={modalState.isAddProgramModalOpen}
                onClose={closeModalActions.addProgram}
                onAddProgram={handleAddProgram}
                categories={categories}
            />

            <ProgramModal
                mode="edit"
                isOpen={!!modalState.programToEdit}
                onClose={closeModalActions.editProgram}
                programToEdit={modalState.programToEdit!}
                onEditProgram={handleEditProgram}
                categories={categories}
            />

            <DeleteProgramModal
                programToDelete={modalState.programToDelete}
                onDeleteProgram={handleDeleteProgram}
                onClose={closeModalActions.deleteProgram}
                isOpen={!!modalState.programToDelete}
            />

            {/* Category Modals */}
            <ProgramCategoryModal
                mode="add"
                isOpen={modalState.isAddCategoryModalOpen}
                onClose={closeModalActions.addCategory}
                categories={categories}
                onAddCategory={handleAddCategory}
            />

            <ProgramCategoryModal
                mode="edit"
                isOpen={modalState.isEditCategoryModalOpen}
                onClose={closeModalActions.editCategory}
                categories={categories}
                onEditCategory={handleEditCategory}
            />

            <DeleteCategoryModal
                isOpen={modalState.isDeleteCategoryModalOpen}
                onClose={closeModalActions.deleteCategory}
                onDeleteCategory={handleDeleteCategory}
                categories={categories}
            />
        </div>
    );
};
