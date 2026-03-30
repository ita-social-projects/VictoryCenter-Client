import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HippotherapyProgram, ProgramCategory, ProgramSearchItemData } from '@/types/admin/programs';
import { PaginationResult, VisibilityStatus } from '@/types/admin/common';
import { ProgramsPageModals } from '../programs-page-modals/ProgramsPageModals';
import { InfiniteScrollList } from '@/components/admin/infinite-scroll-list/InfiniteScrollList';
import { CategoryBar, ContextMenuOption } from '@/components/admin/category-bar/CategoryBar';
import { ProgramListItem } from '../program-list-item/ProgramListItem';
import { useModalsState } from '@/hooks/admin/use-modals-state/useModalsState';
import { useCategoriesCounter } from '@/hooks/admin/use-categories-counter/useCategoriesCounter';
import { ProgramsApi, ProgramsCategoriesApi } from '@/services/api/admin/programs/programs-api';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '@/const/admin/common';
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
import { mapHippotherapyProgramDtoToModel } from '@/utils/functions/mappers/admin/programs/programs-mappers';

const DEFAULT_LOAD_ITEMS_COUNT = 5;
const LIST_ITEM_HEIGHT_IN_PIXELS = 120;

interface ErrorState {
    message: string | null;
    type: 'categories' | 'programs' | 'search' | null;
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
    const modalsStateControl = useModalsState<HippotherapyProgram>();
    const { openModalActions, closeModalActions, isAnyModalOpened } = modalsStateControl;

    const handleTranslateProgramModalOpen = useCallback(
        async (program: HippotherapyProgram) => {
            if (isAnyModalOpened) return;

            try {
                const fullDto = await ProgramsApi.fetchProgramById(program.id, client);
                const fullProgram = fullDto ? mapHippotherapyProgramDtoToModel(fullDto) : program;
                openModalActions.openTranslateItemModal(fullProgram);
            } catch (e) {
                openModalActions.openTranslateItemModal(program);
            }
        },
        [isAnyModalOpened, openModalActions, client],
    );

    const { incrementCategoriesCount, decrementCategoriesCount, updateCategoriesCount } = useCategoriesCounter();

    const setErrorState = useCallback(
        (message: string, type: 'categories' | 'programs' | 'search') => setError({ message, type }),
        [],
    );
    const clearError = useCallback(() => setError({ message: null, type: null }), []);

    const {
        allLanguages,
        translationLanguages,
        selectedLanguage,
        onLanguageChange,
        translationStatusFilter,
        onTranslationStatusFilterChange,
    } = useLocalizationToolkit({
        setErrorState,
    });

    // Fetch functions
    const getProgramCategories = useCallback(async () => {
        const categories = await ProgramsCategoriesApi.fetchProgramCategories(client);

        return categories.map((category) => ({
            ...category,
            programsCount: category.programsCount ? category.programsCount : 0,
        }));
    }, [client]);

    const getFilteredPrograms = useCallback(
        async (params: PaginationRequestParams): Promise<PaginationResult<HippotherapyProgram>> => {
            if (!selectedCategory) {
                return { items: [], totalItemsCount: 0 };
            }
            const response = await ProgramsApi.fetchPrograms(
                client,
                selectedCategory.id,
                params.offset as number,
                params.limit as number,
                translationStatusFilter,
                statusFilter,
            );

            return {
                ...response,
                items: response.items.map(mapHippotherapyProgramDtoToModel),
            };
        },
        [selectedCategory, statusFilter, client, translationStatusFilter],
    );

    const getSearchedProgram = useCallback(async (): Promise<HippotherapyProgram | null> => {
        if (!searchProgramId) {
            return null;
        }

        const response = await ProgramsApi.fetchProgramById(searchProgramId, client);

        return response ? mapHippotherapyProgramDtoToModel(response) : null;
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

    const getProgramId = useCallback((program: HippotherapyProgram) => program.id, []);

    const syncProgramStatusWithServer = useCallback(
        async (program: HippotherapyProgram): Promise<HippotherapyProgram> => {
            try {
                const refreshedDto = await ProgramsApi.fetchProgramById(program.id, client);

                if (!refreshedDto) {
                    return program;
                }

                const refreshedProgram = mapHippotherapyProgramDtoToModel(refreshedDto);

                return {
                    ...program,
                    status: refreshedProgram.status,
                    localizations: refreshedProgram.localizations,
                };
            } catch {
                return program;
            }
        },
        [client],
    );

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
    } = useDataPaginationFetch<HippotherapyProgram>({
        initialData: [],
        getUniqueId: getProgramId,
        fetchHandler: getFilteredPrograms,
        autoFetchDependencies: [selectedCategory?.id, statusFilter, translationStatusFilter],
        autoFetchDisabled: isSearchResultView,
        pageSize: pageSize,
    });

    const handleTranslateProgramSuccess = useCallback(
        (updatedProgram: HippotherapyProgram) => {
            void (async () => {
                const syncedProgram = await syncProgramStatusWithServer(updatedProgram);

                updatePrograms((prev) => prev.map((p) => (p.id === syncedProgram.id ? syncedProgram : p)));
                closeModalActions.closeTranslateItemModal();
                addToast(
                    syncedProgram.status === VisibilityStatus.Published
                        ? COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_PUBLISHED_SUCCESS
                        : COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_SAVED_SUCCESS,
                    ToastType.Success,
                );
            })();
        },
        [closeModalActions, addToast, updatePrograms, syncProgramStatusWithServer],
    );
    const {
        data: fetchedSearchProgram,
        isLoading: isSearchProgramLoading,
        error: searchProgramError,
        setData: updateSearchedProgram,
        refetch: refetchSearchProgram,
    } = useDataFetch<HippotherapyProgram | null>({
        initialData: null,
        fetchHandler: getSearchedProgram,
        autoFetchDependencies: [searchProgramId],
        autoFetchDisabled: !isSearchResultView || !searchProgramId,
    });

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
        (addedProgram: HippotherapyProgram) => {
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
        (updatedProgram: HippotherapyProgram) => {
            void (async () => {
                const syncedProgram = await syncProgramStatusWithServer(updatedProgram);

                if (syncedProgram.status === VisibilityStatus.Draft) {
                    addToast(PROGRAMS_TEXT.FORM.MESSAGE.PROGRAM_SAVED_SUCCESSFULLY, ToastType.Info);
                } else if (syncedProgram.status === VisibilityStatus.Published) {
                    addToast(PROGRAMS_TEXT.FORM.MESSAGE.PUBLISHED_PROGRAM_EDITED_SUCCESSFULLY, ToastType.Info);
                }
                if (isSearchResultView && fetchedSearchProgram?.id === syncedProgram.id) {
                    updateSearchedProgram(syncedProgram);
                }

                const originalProgram =
                    fetchedPrograms.find((p) => p.id === syncedProgram.id) ??
                    (isSearchResultView && fetchedSearchProgram?.id === syncedProgram.id ? fetchedSearchProgram : null);
                if (!originalProgram) return;

                // Update program counters in categories
                updateCategories((prevCategories) =>
                    updateCategoriesCount(prevCategories, originalProgram, syncedProgram),
                );

                // Update program in local programs list
                const belongsToSelectedCategory =
                    !!selectedCategory && syncedProgram.categories.some((cat) => cat.id === selectedCategory.id);
                const statusMatches = statusFilter === undefined || syncedProgram.status === statusFilter;

                if (belongsToSelectedCategory && statusMatches) {
                    if (syncedProgram.previewImage && 'url' in syncedProgram.previewImage)
                        syncedProgram.previewImage.url = `${syncedProgram.previewImage.url}?cb=${Date.now()}`;
                    if (syncedProgram.backgroundImage && 'url' in syncedProgram.backgroundImage)
                        syncedProgram.backgroundImage.url = `${syncedProgram.backgroundImage.url}?cb=${Date.now()}`;
                    updatePrograms((prev) => prev.map((p) => (p.id === syncedProgram.id ? syncedProgram : p)));
                } else {
                    updatePrograms((prev) => prev.filter((p) => p.id !== syncedProgram.id));
                }
            })();
        },
        [
            syncProgramStatusWithServer,
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
        (program: HippotherapyProgram) => {
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
        (program: HippotherapyProgram) => {
            if (!selectedLanguage) return null;

            return (
                <ProgramListItem
                    key={program.id}
                    program={program}
                    handleOnTranslateProgram={handleTranslateProgramModalOpen}
                    handleOnEditProgram={openModalActions.openEditItemModal}
                    handleOnDeleteProgram={openModalActions.openDeleteItemModal}
                    language={selectedLanguage}
                    translationLanguages={translationLanguages}
                />
            );
        },
        [openModalActions, selectedLanguage, translationLanguages, handleTranslateProgramModalOpen],
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
                    maxCharactersToSearch={UI_CONFIG.SEARCH_BAR.MAX_CHARACTERS_FOR_SEARCH.PROGRAMS}
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

                <InfiniteScrollList<HippotherapyProgram>
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
                translatedLanguages={translationLanguages}
                onAddProgram={handleAddProgram}
                onEditProgram={handleEditProgram}
                onDeleteProgram={handleDeleteProgram}
                onTranslateProgram={handleTranslateProgramSuccess}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
            />
            <ToastContainer />
        </div>
    );
};
