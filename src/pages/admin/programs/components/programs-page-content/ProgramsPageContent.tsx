import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Program, ProgramCategory } from '../../../../../types/ProgramAdminPage';
import { VisibilityStatus } from '../../../../../types/Common';
import { ProgramsPageToolbar } from '../programs-page-toolbar/ProgramsPageToolbar';
import { DeleteProgramModal } from '../program-modals/DeleteProgramModal';
import { InfiniteScrollList } from '../../../../../components/common/infinite-scroll-list/InfiniteScrollList';
import { ProgramModal } from '../program-modals/ProgramModal';
import { CategoryBar } from '../../../../../components/common/category-bar/CategoryBar';
import { DeleteCategoryModal } from '../program-category-modals/DeleteCategoryModal';
import { ProgramCategoryModal } from '../program-category-modals/ProgramCategoryModal';
import { ProgramListItem } from '../program-list-item/ProgramListItem';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import { PROGRAM_CATEGORY_TEXT, PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import axios from 'axios';
import './programs-page-content.scss';

const PAGE_SIZE = 5;

export const ProgramsPageContent = () => {
    // UI state
    const [searchByNameTerm, setSearchByNameTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus | undefined>();
    const [autocompleteValues] = useState<string[]>([]);

    // Modal states
    const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);
    const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
    const [programToEdit, setProgramToEdit] = useState<Program | null>(null);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState<boolean>(false);
    const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState<boolean>(false);
    const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState<boolean>(false);

    // Data state
    const [selectedCategory, setSelectedCategory] = useState<ProgramCategory>();
    const [categories, setCategories] = useState<ProgramCategory[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isProgramsLoading, setIsProgramsLoading] = useState(false);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<'categories' | 'programs' | null>(null);

    // Refs for managing state in async operations
    const cureItemsCountRef = useRef<number>(0);
    const totalItemsCountRef = useRef<number | null>(null);
    const selectedCategoryRef = useRef<ProgramCategory | undefined>(null);
    const currentPageRef = useRef<number>(1);
    const hasMoreRef = useRef<boolean>(true);
    const isProgramsLoadingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchCategories = useCallback(async () => {
        try {
            setIsCategoriesLoading(true);
            setError(null);
            setErrorType(null);
            const categoriesFetch = await ProgramsApi.fetchProgramCategories();
            setCategories(categoriesFetch);

            if (categoriesFetch.length > 0) {
                setSelectedCategory(categoriesFetch[0]);
            }
        } catch (error) {
            setError(PROGRAM_CATEGORY_TEXT.MESSAGE.FAIL_TO_FETCH_CATEGORIES);
            setErrorType('categories');
        } finally {
            setIsCategoriesLoading(false);
        }
    }, []);

    const fetchPrograms = useCallback(
        async (shouldResetPage: boolean = false) => {
            if (isProgramsLoadingRef.current || !selectedCategoryRef.current || !hasMoreRef.current) return;

            // Cancel previous request if exists
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new AbortController for this request
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            try {
                isProgramsLoadingRef.current = true;
                setIsProgramsLoading(true);
                setError(null);
                setErrorType(null);

                const searchCategoryId = selectedCategoryRef.current;
                const searchStatus = statusFilter;
                const pageToFetch = shouldResetPage ? 1 : currentPageRef.current;

                const fetchResult = await ProgramsApi.fetchPrograms(
                    searchCategoryId.id,
                    pageToFetch,
                    PAGE_SIZE,
                    searchStatus,
                    { signal: abortController.signal },
                );

                if (abortController.signal.aborted) {
                    return;
                }

                setPrograms((prev) => (shouldResetPage ? [...fetchResult.items] : [...prev, ...fetchResult.items]));
                setCurrentPage((prev) => (shouldResetPage ? 2 : prev + 1));

                if (totalItemsCountRef.current === null || shouldResetPage) {
                    setTotalItems(fetchResult.totalItemsCount);
                    totalItemsCountRef.current = fetchResult.totalItemsCount;
                }

                if (shouldResetPage) {
                    cureItemsCountRef.current = fetchResult.items.length;
                } else {
                    cureItemsCountRef.current += fetchResult.items.length;
                }

                setHasMore(cureItemsCountRef.current < (totalItemsCountRef.current || 0));
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }

                setError(PROGRAMS_TEXT.MESSAGE.FAIL_TO_FETCH_PROGRAMS);
                setErrorType('programs');
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
        [statusFilter],
    );

    useEffect(() => {
        currentPageRef.current = currentPage;
        totalItemsCountRef.current = totalItems;
        selectedCategoryRef.current = selectedCategory;
        hasMoreRef.current = hasMore;
        isProgramsLoadingRef.current = isProgramsLoading;
    }, [currentPage, totalItems, selectedCategory, hasMore, isProgramsLoading]);

    // Clear errors when filters change
    useEffect(() => {
        setError(null);
        setErrorType(null);
    }, [selectedCategory, statusFilter]);

    // Initialize categories on mount
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Reset and fetch programs when category or filter changes
    useEffect(() => {
        setPrograms([]);
        setCurrentPage(1);
        setTotalItems(null);
        setHasMore(true);
        setError(null);
        setErrorType(null);
        cureItemsCountRef.current = 0;
        isProgramsLoadingRef.current = false;
        hasMoreRef.current = true;

        fetchPrograms(true);
    }, [selectedCategory, statusFilter, fetchPrograms]);

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
        setSearchByNameTerm(query);
    }, []);

    const onStatusFilterChange = useCallback((status: VisibilityStatus | undefined) => {
        setStatusFilter(status);
    }, []);

    // Program handlers
    const handleAddProgramStarted = useCallback(() => {
        setIsAddProgramModalOpen(true);
    }, []);

    const handleEditProgramStarted = useCallback((program: Program) => {
        setProgramToEdit(program);
    }, []);

    const handleDeleteProgramStarted = useCallback((program: Program) => {
        setProgramToDelete(program);
    }, []);

    const handleAddProgram = useCallback((program: Program) => {
        setPrograms((prevPrograms) => {
            cureItemsCountRef.current += 1;
            if (totalItemsCountRef.current) {
                totalItemsCountRef.current += 1;
            }

            return [program, ...prevPrograms];
        });
    }, []);

    const handleEditProgram = useCallback((program: Program) => {
        setPrograms((prevPrograms) => prevPrograms.map((p) => (p.id === program.id ? program : p)));
    }, []);

    const handleDeleteProgram = useCallback((program: Program) => {
        setPrograms((prevPrograms) => {
            const filtered = prevPrograms.filter((p) => p.id !== program.id);

            // Update counts when deleting
            cureItemsCountRef.current = Math.max(0, cureItemsCountRef.current - 1);
            if (totalItemsCountRef.current) {
                totalItemsCountRef.current = Math.max(0, totalItemsCountRef.current - 1);
            }

            return filtered;
        });
    }, []);

    // Category handlers
    const handleCategorySelect = useCallback((category: ProgramCategory) => {
        setSelectedCategory(category);
    }, []);

    const handleAddCategory = useCallback((newCategory: ProgramCategory) => {
        setCategories((prev) => [...prev, newCategory]);
    }, []);

    const handleEditCategory = useCallback((updatedCategory: ProgramCategory) => {
        setCategories((prev) => prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)));
    }, []);

    const handleDeleteCategory = useCallback(
        (categoryId: number) => {
            setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
            // If deleted category was selected, select first available
            if (selectedCategory?.id === categoryId) {
                const remaining = categories.filter((cat) => cat.id !== categoryId);
                if (remaining.length > 0) {
                    setSelectedCategory(remaining[0]);
                }
            }
        },
        [selectedCategory, categories],
    );

    // Retry function for error recovery
    const handleRetry = useCallback(() => {
        if (errorType === 'programs') {
            setError(null);
            setErrorType(null);
            fetchPrograms(true);
        } else if (errorType === 'categories') {
            setError(null);
            setErrorType(null);
            fetchCategories();
        }
    }, [errorType, fetchPrograms, fetchCategories]);

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
            <div className="programs-page-list-container">
                <CategoryBar<ProgramCategory>
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    getItemName={(category) => category.name}
                    getItemKey={(category) => category.id}
                    displayContextMenuButton={true}
                    contextMenuOptions={[
                        { id: 'add', name: PROGRAM_CATEGORY_TEXT.BUTTON.ADD_CATEGORY },
                        { id: 'edit', name: PROGRAM_CATEGORY_TEXT.BUTTON.EDIT_CATEGORY },
                        { id: 'delete', name: PROGRAM_CATEGORY_TEXT.BUTTON.DELETE_CATEGORY },
                    ]}
                    onContextMenuOptionSelected={(id) => {
                        switch (id) {
                            case 'add':
                                setIsAddCategoryModalOpen(true);
                                break;
                            case 'edit':
                                setIsEditCategoryModalOpen(true);
                                break;
                            case 'delete':
                                setIsDeleteCategoryModalOpen(true);
                                break;
                        }
                    }}
                />

                {error && (
                    <div className="programs-page-error-container" data-testid="programs-error-container">
                        <span>{error}</span>
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
                isOpen={isAddProgramModalOpen}
                onClose={() => setIsAddProgramModalOpen(false)}
                onAddProgram={handleAddProgram}
            />

            <ProgramModal
                mode="edit"
                isOpen={!!programToEdit}
                onClose={() => setProgramToEdit(null)}
                programToEdit={programToEdit!!}
                onEditProgram={handleEditProgram}
            />

            <DeleteProgramModal
                programToDelete={programToDelete}
                onDeleteProgram={handleDeleteProgram}
                onClose={() => setProgramToDelete(null)}
                isOpen={!!programToDelete}
            />

            {/* Category Modals */}
            <ProgramCategoryModal
                mode="add"
                isOpen={isAddCategoryModalOpen}
                onClose={() => setIsAddCategoryModalOpen(false)}
                categories={categories}
                onAddCategory={handleAddCategory}
            />

            <ProgramCategoryModal
                mode="edit"
                isOpen={isEditCategoryModalOpen}
                onClose={() => setIsEditCategoryModalOpen(false)}
                categories={categories}
                onEditCategory={handleEditCategory}
            />

            <DeleteCategoryModal
                isOpen={isDeleteCategoryModalOpen}
                onClose={() => setIsDeleteCategoryModalOpen(false)}
                onDeleteCategory={handleDeleteCategory}
                categories={categories}
            />
        </div>
    );
};
