import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Program, ProgramCategory, ProgramSearchItemData } from '@/types/admin/programs';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { ProgramsPageModals } from '../programs-page-modals/ProgramsPageModals';
import { InfiniteScrollList } from '@/components/admin/infinite-scroll-list/InfiniteScrollList';
import { CategoryBar, ContextMenuOption } from '@/components/admin/category-bar/CategoryBar';
import { ProgramListItem } from '../program-list-item/ProgramListItem';
import { useModalsState } from '@/hooks/admin/use-modals-state/useModalsState';
import { useCategoriesCounter } from '@/hooks/admin/use-categories-counter/useCategoriesCounter';
import { ProgramsApi, ProgramsCategoriesApi } from '@/services/api/admin/programs/programs-api';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import {
    PaginationRequestParams,
    useDataPaginationFetch,
} from '@/hooks/admin/fetch/use-data-pagination-fetch/useDataPaginationFetch';
import './ProgramsPageContent.scss';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { AdminPanelToolbar } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { ProgramSearchItem } from '../program-search-item/ProgramSearchItem';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';

const DEFAULT_LOAD_ITEMS_COUNT = 5;
const LIST_ITEM_HEIGHT_IN_PIXELS = 120;

interface ErrorState {
    message: string | null;
    type: 'categories' | 'programs' | 'search' | 'members' | 'languages' | null;
}

export const ProgramsPageContent = () => {
    const [selectedCategory, setSelectedCategory] = useState<ProgramCategory | null>(null);
    const [pageSize, setPageSize] = useState(DEFAULT_LOAD_ITEMS_COUNT);
    const client = useAdminClient();
    const { addToast } = useToast();
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [searchProgramId, setSearchProgramId] = useState<number | undefined>();
    const [isSearchResultView, setIsSearchResultView] = useState(false);
    const [error, setError] = useState<ErrorState>({ message: null, type: null });
    const listContainerRef = useRef<HTMLDivElement>(null);
    const modalsStateControl = useModalsState<Program>();
    const openModalActions = modalsStateControl.openModalActions;

    const { incrementCategoriesCount, decrementCategoriesCount, updateCategoriesCount } = useCategoriesCounter();

    // Fetch functions
    const getProgramCategories = useCallback(async () => {
        const categories = await ProgramsCategoriesApi.fetchProgramCategories(client);

        return categories.map((category) => ({
            ...category,
            programsCount: category.programsCount ? category.programsCount : 0,
        }));
    }, [client]);

    const getFilteredPrograms = useCallback(
        async (params: PaginationRequestParams): Promise<PaginationResult<Program>> => {
            if (!selectedCategory) {
                return { items: [], totalItemsCount: 0 };
            }
            return ProgramsApi.fetchPrograms(
                client,
                selectedCategory.id,
                params.offset as number,
                params.limit as number,
                statusFilter,
            );
        },
        [selectedCategory, statusFilter, client],
    );

    const getSearchedProgram = useCallback(async (): Promise<Program | null> => {
        if (!searchProgramId) {
            return null;
        }

        return ProgramsApi.fetchProgramById(searchProgramId, client);
    }, [searchProgramId, client]);

    const getProgramSearchItems = useCallback(
        async (
            searchTerm: string,
            paginationRequest: PaginationRequestParams,
        ): Promise<PaginationResult<ProgramSearchItemData>> =>
            ProgramsApi.fetchProgramSearchItems(
                client,
                searchTerm,
                paginationRequest.offset as number,
                paginationRequest.limit as number,
                paginationRequest.requestOptions?.cancellationSignal,
            ),
        [client],
    );

    const getProgramId = useCallback((program: Program) => program.id, []);

    // Data fetching hooks
    const {
        data: categories,
        error: categoriesError,
        isLoading: isCategoriesLoading,
        setData: updateCategories,
        refetch: refetchCategories,
    } = useDataFetch<ProgramCategory[]>({
        initialData: [],
        fetchHandler: getProgramCategories,
        autoFetchDependencies: [],
        autoFetchDisabled: false,
    });

    const {
        data: fetchedPrograms,
        isLoading: isProgramsLoading,
        hasMore: isHasMorePrograms,
        error: programsFetchError,
        fetchMore: fetchMorePrograms,
        fetchFromStart: fetchProgramsFromStart,
        resetList: resetProgramsList,
        setData: updatePrograms,
    } = useDataPaginationFetch<Program>({
        initialData: [],
        getUniqueId: getProgramId,
        fetchHandler: getFilteredPrograms,
        autoFetchDependencies: [selectedCategory?.id, statusFilter],
        autoFetchDisabled: isSearchResultView,
        pageSize: pageSize,
    });

    const {
        data: fetchedSearchProgram,
        isLoading: isSearchProgramLoading,
        error: searchProgramError,
        setData: updateSearchedProgram,
        refetch: refetchSearchProgram,
    } = useDataFetch<Program | null>({
        initialData: null,
        fetchHandler: getSearchedProgram,
        autoFetchDependencies: [searchProgramId],
        autoFetchDisabled: !isSearchResultView || !searchProgramId,
    });

    // Errors handling
    const setErrorState = useCallback(
        (message: string, type: 'categories' | 'programs' | 'search' | 'members' | 'languages') =>
            setError({ message, type }),
        [],
    );
    const clearError = useCallback(() => setError({ message: null, type: null }), []);

    const handleRetry = useCallback(() => {
        clearError();

        if (error.type === 'categories') {
            refetchCategories();
        } else if (error.type === 'programs') {
            fetchProgramsFromStart();
        } else if (error.type === 'search' && isSearchResultView) {
            refetchSearchProgram();
        }
    }, [isSearchResultView, clearError, error.type, refetchCategories, refetchSearchProgram, fetchProgramsFromStart]);
    const { allLanguages, onLanguageChange, onTranslationStatusFilterChange } = useLocalizationToolkit({
        setErrorState,
    });

    useEffect(() => {
        if (categoriesError) {
            setErrorState(COMMON_TEXT_ADMIN.CATEGORIES.MESSAGE.FAIL_TO_FETCH_CATEGORIES, 'categories');
        }
    }, [categoriesError, setErrorState]);

    useEffect(() => {
        if (programsFetchError) {
            setErrorState(PROGRAMS_TEXT.MESSAGE.FAIL_TO_FETCH_PROGRAMS, 'programs');
        }
    }, [programsFetchError, setErrorState]);

    useEffect(() => {
        if (searchProgramError) {
            setErrorState(PROGRAMS_TEXT.MESSAGE.FAIL_TO_FETCH_PROGRAM, 'search');
        }
    }, [searchProgramError, setErrorState]);

    useEffect(() => {
        if (!selectedCategory && categories && categories.length > 0) {
            setSelectedCategory(categories[0]);
        }
    }, [categories, selectedCategory]);

    useEffect(() => {
        if (selectedCategory) {
            clearError();
        }
    }, [selectedCategory, statusFilter, clearError]);

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
    }, []);

    // Toolbar handlers
    const onStatusFilterChange = useCallback(
        (status: VisibilityStatus | undefined) => {
            setStatusFilter(status);
            setIsSearchResultView(false);
            setSearchProgramId(undefined);
            updateSearchedProgram(null);
        },
        [updateSearchedProgram],
    );

    const handleProgramSuggestionSelect = useCallback(
        (programId: string | number) => {
            setIsSearchResultView(true);
            setSearchProgramId(typeof programId === 'string' ? parseInt(programId, 10) : programId);
            setStatusFilter(undefined);
            resetProgramsList();
        },
        [resetProgramsList],
    );

    const handleSearchClear = useCallback(() => {
        setIsSearchResultView(false);
        setSearchProgramId(undefined);
        updateSearchedProgram(null);
    }, [updateSearchedProgram]);

    // Program handlers
    const handleAddProgram = useCallback(
        (addedProgram: Program) => {
            if (addedProgram.status === VisibilityStatus.Draft) {
                addToast(PROGRAMS_TEXT.FORM.MESSAGE.PROGRAM_SAVED_SUCCESSFULLY, ToastType.Info);
            } else if (addedProgram.status === VisibilityStatus.Published) {
                addToast(PROGRAMS_TEXT.FORM.MESSAGE.PROGRAM_PUBLISHED_SUCCESSFULLY, ToastType.Info);
            }
            // Update program counters in categories
            updateCategories((prevCategories) => incrementCategoriesCount(prevCategories, addedProgram));

            const belongsToSelectedCategory = selectedCategory
                ? addedProgram.categories.some((c) => c.id === selectedCategory.id)
                : false;
            const statusMatches = statusFilter === undefined || addedProgram.status === statusFilter;
            if (belongsToSelectedCategory && statusMatches) {
                updatePrograms((prev) => [addedProgram, ...prev]);
            }
        },
        [updatePrograms, updateCategories, incrementCategoriesCount, selectedCategory, statusFilter, addToast],
    );

    const handleEditProgram = useCallback(
        (updatedProgram: Program) => {
            if (updatedProgram.status === VisibilityStatus.Draft) {
                addToast(PROGRAMS_TEXT.FORM.MESSAGE.PROGRAM_SAVED_SUCCESSFULLY, ToastType.Info);
            } else if (updatedProgram.status === VisibilityStatus.Published) {
                addToast(PROGRAMS_TEXT.FORM.MESSAGE.PROGRAM_PUBLISHED_SUCCESSFULLY, ToastType.Info);
            }
            if (isSearchResultView && fetchedSearchProgram?.id === updatedProgram.id) {
                updateSearchedProgram(updatedProgram);
            }

            const originalProgram =
                fetchedPrograms.find((p) => p.id === updatedProgram.id) ??
                (isSearchResultView && fetchedSearchProgram?.id === updatedProgram.id ? fetchedSearchProgram : null);
            if (!originalProgram) return;

            // Update program counters in categories
            updateCategories((prevCategories) =>
                updateCategoriesCount(prevCategories, originalProgram, updatedProgram),
            );

            // Update program in local programs list
            const belongsToSelectedCategory =
                !!selectedCategory && updatedProgram.categories.some((cat) => cat.id === selectedCategory.id);
            const statusMatches = statusFilter === undefined || updatedProgram.status === statusFilter;

            if (belongsToSelectedCategory && statusMatches) {
                if (updatedProgram.previewImage && 'url' in updatedProgram.previewImage)
                    updatedProgram.previewImage.url = `${updatedProgram.previewImage.url}?cb=${Date.now()}`;
                if (updatedProgram.backgroundImage && 'url' in updatedProgram.backgroundImage)
                    updatedProgram.backgroundImage.url = `${updatedProgram.backgroundImage.url}?cb=${Date.now()}`;
                updatePrograms((prev) => prev.map((p) => (p.id === updatedProgram.id ? updatedProgram : p)));
            } else {
                updatePrograms((prev) => prev.filter((p) => p.id !== updatedProgram.id));
            }
        },
        [
            updateCategories,
            updateSearchedProgram,
            updatePrograms,
            updateCategoriesCount,
            fetchedPrograms,
            selectedCategory,
            isSearchResultView,
            fetchedSearchProgram,
            statusFilter,
            addToast,
        ],
    );

    const handleDeleteProgram = useCallback(
        (program: Program) => {
            // Update program counters in categories
            updateCategories((prevCategories) => decrementCategoriesCount(prevCategories, program));

            // Remove program from local programs list
            updatePrograms((prev) => prev.filter((p) => p.id !== program.id));

            if (isSearchResultView && fetchedSearchProgram?.id === program.id) {
                setSearchProgramId(undefined);
                setIsSearchResultView(false);
                updateSearchedProgram(null);
            }
        },
        [
            updateCategories,
            updatePrograms,
            updateSearchedProgram,
            decrementCategoriesCount,
            isSearchResultView,
            fetchedSearchProgram,
        ],
    );

    // Category handlers
    const handleCategorySelect = useCallback(
        (category: ProgramCategory) => {
            setSelectedCategory(category);
            setSearchProgramId(undefined);
            setIsSearchResultView(false);
            updateSearchedProgram(null);
        },
        [updateSearchedProgram],
    );

    const handleAddCategory = useCallback(
        (newCategory: ProgramCategory) => {
            updateCategories((prev) => [...prev, newCategory]);
        },
        [updateCategories],
    );

    const handleEditCategory = useCallback(
        (updatedCategory: ProgramCategory) => {
            updateCategories((prev) => prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)));
        },
        [updateCategories],
    );

    const handleDeleteCategory = useCallback(
        (categoryIdToDelete: number) => {
            updateCategories((prev) => {
                const filtered = prev.filter((category) => category.id !== categoryIdToDelete);

                if (selectedCategory?.id === categoryIdToDelete && filtered.length > 0) {
                    const currentCategoryIndex = prev.findIndex((category) => category.id === categoryIdToDelete);
                    const nextCategory = filtered[Math.min(currentCategoryIndex, filtered.length - 1)];
                    setSelectedCategory(nextCategory);
                } else if (filtered.length === 0) {
                    setSelectedCategory(null);
                }

                return filtered;
            });
        },
        [updateCategories, selectedCategory],
    );

    // Context menu handlers
    const categoryBarContextMenuOptions: ContextMenuOption[] = useMemo(
        () => [
            { id: 'add', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_CATEGORY },
            { id: 'edit', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.EDIT_CATEGORY },
            { id: 'delete', name: COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.DELETE_CATEGORY },
        ],
        [],
    );

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

    // Get the items to display
    const displayItems = isSearchResultView ? (fetchedSearchProgram ? [fetchedSearchProgram] : []) : fetchedPrograms;

    return (
        <div className="programs-page-wrapper" data-testid="programs-page-content">
            <div className="programs-page-toolbar-container">
                <AdminPanelToolbar<ProgramSearchItemData>
                    getSearchItemKey={(item) => item.id}
                    getSearchItemLabel={(item) => item.name}
                    fetchSearchItems={getProgramSearchItems}
                    renderSearchItemComponent={ProgramSearchItem}
                    placeholder={PROGRAMS_TEXT.PLACEHOLDER.SEARCH_PROGRAMS}
                    onSearchClear={handleSearchClear}
                    statusFilter={statusFilter}
                    onStatusFilterChange={onStatusFilterChange}
                    onAddItem={openModalActions.openAddItemModal}
                    AddItemButtonText={PROGRAMS_TEXT.BUTTON.ADD_PROGRAM}
                    onSuggestionSelect={handleProgramSuggestionSelect}
                    languages={allLanguages}
                    onLanguageChange={onLanguageChange}
                    onTranslationStatusFilterChange={onTranslationStatusFilterChange}
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
                    items={displayItems}
                    renderItem={renderProgramItem}
                    onLoadMore={fetchMorePrograms}
                    hasMore={isSearchResultView ? false : isHasMorePrograms}
                    isLoading={isProgramsLoading || isCategoriesLoading || isSearchProgramLoading}
                    emptyStateMessage={COMMON_TEXT_ADMIN.LIST.NOT_FOUND}
                />
            </div>

            <ProgramsPageModals
                modalsStateControl={modalsStateControl}
                categories={categories}
                onAddProgram={handleAddProgram}
                onEditProgram={handleEditProgram}
                onDeleteProgram={handleDeleteProgram}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
            />
            <ToastContainer />
        </div>
    );
};
