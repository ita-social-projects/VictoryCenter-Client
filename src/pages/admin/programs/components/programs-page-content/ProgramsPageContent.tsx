import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Program, ProgramCategory } from '../../../../../types/admin/programs';
import { PaginationResult, VisibilityStatus } from '../../../../../types/admin/common';
import { ProgramsPageToolbar } from '../programs-page-toolbar/ProgramsPageToolbar';
import { DeleteProgramModal } from '../program-modals/DeleteProgramModal';
import { InfiniteScrollList } from '../../../../../components/admin/infinite-scroll-list/InfiniteScrollList';
import { ProgramModal } from '../program-modals/ProgramModal';
import { CategoryBar, ContextMenuOption } from '../../../../../components/admin/category-bar/CategoryBar';
import { DeleteCategoryModal } from '../program-category-modals/DeleteCategoryModal';
import { ProgramCategoryModal } from '../program-category-modals/ProgramCategoryModal';
import { ProgramListItem } from '../program-list-item/ProgramListItem';
import { useModalsState } from '../../../../../hooks/admin/use-modals-state/useModalsState';
import {
    PaginationRequestParams,
    useEntitiesPaginationFetch,
} from '../../../../../hooks/admin/fetch/use-entities-pagination-fetch/useEntitiesPaginationFetch';
import { useEntitiesFetch } from '../../../../../hooks/admin/fetch/use-entities-fetch/useEntitiesFetch';
import { useEntityFetch } from '../../../../../hooks/admin/fetch/use-entity-fetch/useEntityFetch';
import { ProgramsApi } from '../../../../../services/api/admin/programs/programs-api';
import { PROGRAM_CATEGORY_TEXT, PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { RequestOptions } from '../../../../../types/common/api';
import './ProgramsPageContent.scss';

const DEFAULT_LOAD_ITEMS_COUNT = 5;
const LIST_ITEM_HEIGHT_IN_PIXELS = 120;

interface ErrorState {
    message: string | null;
    type: 'categories' | 'programs' | null;
}

export const ProgramsPageContent = () => {
    const [selectedCategory, setSelectedCategory] = useState<ProgramCategory | null>(null);
    const [pageSize, setPageSize] = useState(DEFAULT_LOAD_ITEMS_COUNT);
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [searchProgramId, setSearchProgramId] = useState<number | undefined>();
    const [isSearchResultView, setIsSearchResultView] = useState(false);
    const [error, setError] = useState<ErrorState>({ message: null, type: null });

    const listContainerRef = useRef<HTMLDivElement>(null);

    const { modalState, isAnyModalOpened, openModalActions, closeModalActions } = useModalsState<Program>();

    // Fetch functions
    const getProgramCategories = useCallback(async (options: RequestOptions) => {
        return ProgramsApi.fetchProgramCategories();
    }, []);

    const getFilteredPrograms = useCallback(
        async (params: PaginationRequestParams): Promise<PaginationResult<Program>> => {
            if (!selectedCategory) {
                return { items: [], totalItemsCount: 0 };
            }

            return ProgramsApi.fetchPrograms(
                selectedCategory.id,
                params.offset,
                params.limit,
                statusFilter,
                params.requestOptions,
            );
        },
        [selectedCategory, statusFilter],
    );

    const getProgramById = useCallback(
        async (entityId: number, apiOptions: RequestOptions): Promise<Program | null> => {
            return ProgramsApi.fetchProgramById(entityId, apiOptions);
        },
        [],
    );

    // Data fetching hooks
    const customAddProgramHandler = useCallback((prev: Program[], newProgram: Program): Program[] => {
        return [newProgram, ...prev];
    }, []);

    const {
        entities: categories,
        error: categoriesFetchError,
        isLoading: isCategoriesLoading,
        actions: categoriesActions,
    } = useEntitiesFetch<ProgramCategory>({
        fetchEntitiesHandler: getProgramCategories,
        autoFetchDependencies: [],
        autoFetchDisabled: true,
    });

    const {
        entities: programs,
        isLoading: isProgramsLoading,
        hasMore: isHasMorePrograms,
        error: programsFetchError,
        actions: programsActions,
    } = useEntitiesPaginationFetch<Program>({
        fetchEntitiesHandler: getFilteredPrograms,
        autoFetchDependencies: [selectedCategory, statusFilter],
        autoFetchDisabled: isSearchResultView,
        pageSize: pageSize,
        customAddEntityHandler: customAddProgramHandler,
    });

    const {
        entity: searchedProgram,
        isLoading: isSearchProgramLoading,
        error: searchProgramError,
        actions: searchProgramActions,
    } = useEntityFetch<Program, number>({
        fetchEntityHandler: getProgramById,
        entityId: searchProgramId,
    });

    // Errors handling
    const setErrorState = useCallback((message: string, type: 'categories' | 'programs') => {
        setError({ message, type });
    }, []);

    const clearError = useCallback(() => {
        setError({ message: null, type: null });
    }, []);

    const handleRetry = useCallback(() => {
        clearError();

        if (error.type === 'categories') {
            categoriesActions.refetch();
        } else if (error.type === 'programs') {
            if (isSearchResultView) {
                searchProgramActions.refetch();
            } else {
                programsActions.fetchFromStart();
            }
        }
    }, [error.type, isSearchResultView, categoriesActions, programsActions, searchProgramActions]);

    useEffect(() => {
        if (categoriesFetchError) {
            setErrorState(PROGRAM_CATEGORY_TEXT.MESSAGE.FAIL_TO_FETCH_CATEGORIES, 'categories');
        }
    }, [categoriesFetchError]);

    useEffect(() => {
        if (programsFetchError) {
            setErrorState(PROGRAMS_TEXT.MESSAGE.FAIL_TO_FETCH_PROGRAMS, 'programs');
        }
    }, [programsFetchError]);

    useEffect(() => {
        if (searchProgramError) {
            setErrorState(PROGRAMS_TEXT.MESSAGE.FAIL_TO_FETCH_PROGRAM, 'programs');
        }
    }, [searchProgramError]);

    // Init + Auto-selection
    useEffect(() => {
        categoriesActions.refetch();
    }, []);

    useEffect(() => {
        if (!selectedCategory && categories.length > 0) {
            setSelectedCategory(categories[0]);
        }
    }, [categories, selectedCategory]);

    useEffect(() => {
        if (selectedCategory) {
            clearError();
        }
    }, [selectedCategory, statusFilter]);

    useEffect(() => {
        if (searchProgramId !== undefined) {
            clearError();
            searchProgramActions.refetch();
        }
    }, [searchProgramId]);

    // Resize handling
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

    // Toolbar handlers
    const onStatusFilterChange = useCallback((status: VisibilityStatus | undefined) => {
        setStatusFilter(status);
        setIsSearchResultView(false);
        setSearchProgramId(undefined);
    }, []);

    const handleProgramSelect = useCallback((programId: number) => {
        setIsSearchResultView(true);
        setSearchProgramId(programId);
    }, []);

    const handleSearchClear = useCallback(() => {
        setIsSearchResultView(false);
        setSearchProgramId(undefined);
    }, []);

    // Program handlers
    const handleAddProgram = useCallback(
        (addedProgram: Program) => {
            // Update program counters in categories
            const addedCategoryIds = new Set(addedProgram.categories.map((c) => c.id));
            categoriesActions.setEntities((prevCategories) =>
                prevCategories.map((cat) =>
                    addedCategoryIds.has(cat.id) ? { ...cat, programsCount: cat.programsCount + 1 } : cat,
                ),
            );

            programsActions.addEntity(addedProgram);
        },
        [closeModalActions],
    );

    const handleEditProgram = useCallback(
        (updatedProgram: Program) => {
            // Find original program
            const originalProgram = programs.find((p) => p.id === updatedProgram.id);
            if (!originalProgram) return;

            const originalCategoryIds = new Set(originalProgram.categories.map((c) => c.id));
            const updatedCategoryIds = new Set(updatedProgram.categories.map((c) => c.id));

            // Update program counters in categories
            categoriesActions.setEntities((prevCategories) =>
                prevCategories.map((category) => {
                    const wasInCategory = originalCategoryIds.has(category.id);
                    const isInCategory = updatedCategoryIds.has(category.id);

                    if (!wasInCategory && isInCategory) {
                        return { ...category, programsCount: category.programsCount + 1 };
                    }
                    if (wasInCategory && !isInCategory) {
                        return { ...category, programsCount: Math.max(0, category.programsCount - 1) };
                    }

                    // If nothing changed
                    return category;
                }),
            );

            // Apply edited program to list
            const belongsToSelectedCategory =
                selectedCategory && updatedProgram.categories.some((cat) => cat.id === selectedCategory.id);

            if (belongsToSelectedCategory) {
                programsActions.updateEntity(updatedProgram);
            } else {
                programsActions.removeEntity(updatedProgram.id);
            }
        },
        [selectedCategory, programs, closeModalActions],
    );

    const handleDeleteProgram = useCallback(
        (program: Program) => {
            // Update program counters in categories
            const deletedFromCategoryIds = new Set(program.categories.map((c) => c.id));
            categoriesActions.setEntities((prevCategories) =>
                prevCategories.map((cat) =>
                    deletedFromCategoryIds.has(cat.id)
                        ? { ...cat, programsCount: Math.max(0, cat.programsCount - 1) }
                        : cat,
                ),
            );

            programsActions.removeEntity(program.id);

            if (isSearchResultView) {
                console.log('searchedProgram?.id : ', searchedProgram?.id );
                if (searchedProgram?.id === program.id) {
                    setSearchProgramId(undefined);
                    setIsSearchResultView(false);
                }
            }
        },
        [closeModalActions],
    );

    // Category handlers
    const handleCategorySelect = useCallback((category: ProgramCategory) => {
        setSelectedCategory(category);
    }, []);

    const handleAddCategory = useCallback(
        (newCategory: ProgramCategory) => {
            categoriesActions.addEntity(newCategory);
        },
        [categoriesActions.addEntity],
    );

    const handleEditCategory = useCallback(
        (updatedCategory: ProgramCategory) => {
            categoriesActions.updateEntity(updatedCategory);
        },
        [categoriesActions.updateEntity],
    );

    const handleDeleteCategory = useCallback(
        (categoryIdToDelete: number) => {
            categoriesActions.setEntities((prev) => {
                const filtered = prev.filter((category) => category.id !== categoryIdToDelete);

                if (selectedCategory?.id === categoryIdToDelete && filtered.length > 0) {
                    if (filtered.length > 0) {
                        // Look for first available category
                        const currentCategoryIndex = prev.findIndex((category) => category.id === categoryIdToDelete);
                        const nextCategory = filtered[Math.min(currentCategoryIndex, filtered.length - 1)];
                        setSelectedCategory(nextCategory);
                    } else {
                        setSelectedCategory(null);
                    }
                }

                return filtered;
            });
        },
        [selectedCategory],
    );

    // Context menu handlers
    const categoryBarContextMenuOptions: ContextMenuOption[] = useMemo(
        () => [
            { id: 'add', name: PROGRAM_CATEGORY_TEXT.BUTTON.ADD_CATEGORY },
            { id: 'edit', name: PROGRAM_CATEGORY_TEXT.BUTTON.EDIT_CATEGORY },
            { id: 'delete', name: PROGRAM_CATEGORY_TEXT.BUTTON.DELETE_CATEGORY },
        ],
        [],
    );

    const onContextMenuOptionSelected = useCallback(
        (id: string) => {
            if (isAnyModalOpened){
                return;
            } else if (id === 'add') {
                openModalActions.openAddCategoryModal();
            } else if (id === 'edit') {
                openModalActions.openEditCategoryModal();
            } else if (id === 'delete') {
                openModalActions.openDeleteCategoryModal();
            }
        },
        [isAnyModalOpened, openModalActions],
    );

    // Render helpers
    const renderProgramItem = useCallback(
        (program: Program) => (
            <ProgramListItem
                key={program.id}
                program={program}
                handleOnEditProgram={openModalActions.openEditItemModal}
                handleOnDeleteProgram={openModalActions.openDeleteItemModal}
            />
        ),
        [openModalActions],
    );

    return (
        <div className="programs-page-wrapper" data-testid="programs-page-content">
            <div className="programs-page-toolbar-container">
                <ProgramsPageToolbar
                    onProgramSelect={handleProgramSelect}
                    onSearchClear={handleSearchClear}
                    statusFilterValue={statusFilter}
                    onStatusFilterChange={onStatusFilterChange}
                    onAddProgram={openModalActions.openAddItemModal}
                />
            </div>

            <div className="programs-page-list-container" ref={listContainerRef}>
                <CategoryBar<ProgramCategory>
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
                    <div className="programs-page-error-container" data-testid="programs-error-container">
                        <span>{error.message}</span>
                        <button onClick={handleRetry} type="button" className="retry-link">
                            {COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN}
                        </button>
                    </div>
                )}

                <InfiniteScrollList<Program>
                    items={isSearchResultView && searchedProgram ? [searchedProgram] : programs}
                    renderItem={renderProgramItem}
                    onLoadMore={programsActions.fetchMore}
                    hasMore={isSearchResultView ? false : isHasMorePrograms}
                    isLoading={isProgramsLoading || isCategoriesLoading || isSearchProgramLoading}
                    emptyStateMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                />
            </div>

            {/* Program Modals */}
            <ProgramModal
                mode="add"
                isOpen={modalState.isAddModalOpen}
                onClose={closeModalActions.closeAddItemModal}
                onAddProgram={handleAddProgram}
                categories={categories}
            />

            <ProgramModal
                mode="edit"
                isOpen={!!modalState.itemToEdit}
                onClose={closeModalActions.closeEditItemModal}
                programToEdit={modalState.itemToEdit!}
                onEditProgram={handleEditProgram}
                categories={categories}
            />

            <DeleteProgramModal
                isOpen={!!modalState.itemToDelete}
                onClose={closeModalActions.closeDeleteItemModal}
                programToDelete={modalState.itemToDelete!}
                onDeleteProgram={handleDeleteProgram}
            />

            {/* Category Modals */}
            <ProgramCategoryModal
                mode="add"
                isOpen={modalState.isAddCategoryModalOpen}
                onClose={closeModalActions.closeAddCategoryModal}
                categories={categories}
                onAddCategory={handleAddCategory}
            />

            <ProgramCategoryModal
                mode="edit"
                isOpen={modalState.isEditCategoryModalOpen}
                onClose={closeModalActions.closeEditCategoryModal}
                categories={categories}
                onEditCategory={handleEditCategory}
            />

            <DeleteCategoryModal
                isOpen={modalState.isDeleteCategoryModalOpen}
                onClose={closeModalActions.closeDeleteCategoryModal}
                onDeleteCategory={handleDeleteCategory}
                categories={categories}
            />
        </div>
    );
};
