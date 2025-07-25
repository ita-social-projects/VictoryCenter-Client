import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import { Program, ProgramCategory } from '../../../../../types/ProgramAdminPage';
import { PROGRAM_CATEGORY_TEXT, PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { VisibilityStatus } from '../../../../../types/Common';
import LoaderIcon from '../../../../../assets/icons/load.svg';
import ArrowUpIcon from '../../../../../assets/icons/arrow-up.svg';
import NotFoundIcon from '../../../../../assets/icons/not-found.svg';
import { ProgramListItem } from '../program-list-item/ProgramListItem';
import { DeleteCategoryModal } from '../program-category-modals/DeleteCategoryModal';
import { CategoryBar } from '../../../../../components/common/category-bar/CategoryBar';
import { ProgramCategoryModal } from '../program-category-modals/ProgramCategoryModal';
import './programs-list.scss';
import axios from 'axios';

export interface ProgramsListProps {
    searchByStatus: VisibilityStatus | undefined;
    onEditProgram: (program: Program) => void;
    onDeleteProgram: (program: Program) => void;
}

export interface ProgramListRef {
    addProgram: (program: Program) => void;
    editProgram: (program: Program) => void;
    deleteProgram: (program: Program) => void;
    setPrograms: (programs: Program[]) => void;
}

const PAGE_SIZE = 5;
const BOTTOM_REACH_THRESHOLD_PIXELS = 5;

export const ProgramsList = forwardRef<ProgramListRef, ProgramsListProps>(
    ({ searchByStatus, onEditProgram, onDeleteProgram }: ProgramsListProps, ref) => {
        const [selectedCategory, setSelectedCategory] = useState<ProgramCategory>();
        const [categories, setCategories] = useState<ProgramCategory[]>([]);
        const [programs, setPrograms] = useState<Program[]>([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [totalItems, setTotalItems] = useState<number | null>(null);
        const [hasMore, setHasMore] = useState(true);
        const [isProgramsLoading, setIsProgramsLoading] = useState(false);
        const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
        const [isMoveToTopVisible, setIsMoveToTopVisible] = useState<boolean>(false);
        const [error, setError] = useState<string | null>(null);
        const [errorType, setErrorType] = useState<'categories' | 'programs' | null>(null);

        const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState<boolean>(false);
        const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState<boolean>(false);
        const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState<boolean>(false);

        const programListRef = useRef<HTMLDivElement>(null);
        const cureItemsCountRef = useRef<number>(0);
        const totalItemsCountRef = useRef<number | null>(totalItems);
        const selectedCategoryRef = useRef<ProgramCategory | undefined>(null);
        const currentPageRef = useRef<number>(currentPage);
        const hasMoreRef = useRef<boolean>(true);
        const isProgramsLoadingRef = useRef(false);

        // Used to abort previous program fetch if a new one starts before it completes
        const abortControllerRef = useRef<AbortController | null>(null);

        const addProgramHandler = useCallback((program: Program) => {
            setPrograms((prevPrograms) => {
                // If already contain program - replace it
                const index = prevPrograms.findIndex((p) => p.id === program.id);
                if (index !== -1) {
                    const updated = [...prevPrograms];
                    updated[index] = program;
                    return updated;
                }

                cureItemsCountRef.current += 1;
                if (totalItemsCountRef.current) {
                    totalItemsCountRef.current += 1;
                }

                return [program, ...prevPrograms];
            });
        }, []);

        const editProgramHandler = useCallback((program: Program) => {
            setPrograms((prevPrograms) => prevPrograms.map((p) => (p.id === program.id ? program : p)));
        }, []);

        const deleteProgramHandler = useCallback((program: Program) => {
            setPrograms((prevPrograms) => {
                const filtered = prevPrograms.filter((p) => p.id !== program.id);

                // Update counts when deleting - Fixed count management
                cureItemsCountRef.current = Math.max(0, cureItemsCountRef.current - 1);
                if (totalItemsCountRef.current) {
                    totalItemsCountRef.current = Math.max(0, totalItemsCountRef.current - 1);
                }

                return filtered;
            });
        }, []);

        const setProgramsHandler = useCallback((programs: Program[]) => {
            setPrograms(programs);
            cureItemsCountRef.current = programs.length;
        }, []);

        useImperativeHandle(ref, () => ({
            addProgram: addProgramHandler,
            editProgram: editProgramHandler,
            deleteProgram: deleteProgramHandler,
            setPrograms: setProgramsHandler,
        }));

        useEffect(() => {
            currentPageRef.current = currentPage;
        }, [currentPage]);

        useEffect(() => {
            totalItemsCountRef.current = totalItems;
        }, [totalItems]);

        useEffect(() => {
            selectedCategoryRef.current = selectedCategory;
        }, [selectedCategory]);

        useEffect(() => {
            hasMoreRef.current = hasMore;
        }, [hasMore]);

        useEffect(() => {
            isProgramsLoadingRef.current = isProgramsLoading;
        }, [isProgramsLoading]);

        useEffect(() => {
            setError(null);
            setErrorType(null);
        }, [selectedCategory, searchByStatus]);

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
                console.error('Failed to fetch categories:', error);
            } finally {
                setIsCategoriesLoading(false);
            }
        }, []);

        useEffect(() => {
            fetchCategories();
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
                    const searchStatus = searchByStatus;
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
                    console.error('Failed to fetch programs:', error);
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
            [searchByStatus],
        );

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
        }, [selectedCategory, searchByStatus, fetchPrograms]);

        // Cleanup on unmount
        useEffect(() => {
            return () => {
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
            };
        }, []);

        useEffect(() => {
            if (isProgramsLoading && programListRef.current) {
                const el = programListRef.current;
                el.scrollTop = el.scrollHeight;
            }
        }, [isProgramsLoading]);

        const handleOnScroll = useCallback(() => {
            const el = programListRef.current;
            if (!el || isProgramsLoading) return;

            if (el.scrollTop > 0) {
                setIsMoveToTopVisible(true);
            } else {
                setIsMoveToTopVisible(false);
            }

            if (hasMore) {
                const distanceToBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight);
                if (distanceToBottom <= BOTTOM_REACH_THRESHOLD_PIXELS) {
                    fetchPrograms();
                }
            }
        }, [isProgramsLoading, hasMore, fetchPrograms]);

        const moveToTop = useCallback(() => {
            const el = programListRef.current;
            if (!el) return;

            el.scrollTop = 0;
        }, []);

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

        // Retry function for error recovery - Added retry functionality
        const handleRetry = useCallback(() => {
            console.log('fdfsd');
            console.log(errorType);
            if (errorType === 'programs') {
                console.log('1111');
                setError(null);
                setErrorType(null);
                fetchPrograms(true);
            } else if (errorType === 'categories') {
                console.log('2222');
                setError(null);
                setErrorType(null);
                fetchCategories();
            }
        }, [errorType, fetchPrograms, fetchCategories]);

        let content;

        if (programs.length > 0) {
            content = programs.map((program) => (
                <ProgramListItem
                    key={program.id}
                    program={program}
                    handleOnEditProgram={onEditProgram}
                    handleOnDeleteProgram={onDeleteProgram}
                />
            ));
        } else if (!isProgramsLoading && !isCategoriesLoading && !error) {
            content = (
                <div className="members-not-found" data-testid="members-not-found">
                    <img src={NotFoundIcon} alt="members-not-found" data-testid="members-not-found-icon" />
                    <p>{COMMON_TEXT_ADMIN.LIST.NOT_FOUND}</p>
                </div>
            );
        } else {
            content = null;
        }

        return (
            <>
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

                <div className="programs">
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

                    <div
                        ref={programListRef}
                        onScroll={handleOnScroll}
                        data-testid="programs-list"
                        className="programs-list"
                    >
                        {error && (
                            <div className="programs-error-container" data-testid="programs-error-container">
                                <span>{error}</span>
                                <button onClick={handleRetry} type="button" className="retry-link">
                                    {COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN}
                                </button>
                            </div>
                        )}
                        {content}
                        {(isProgramsLoading || isCategoriesLoading) && (
                            <div className="programs-list-loader" data-testid="programs-list-loader">
                                <img src={LoaderIcon} alt="loader-icon" data-testid="programs-list-loader-icon" />
                            </div>
                        )}
                        {isMoveToTopVisible && (
                            <button onClick={moveToTop} className="programs-list-list-to-top">
                                <img src={ArrowUpIcon} alt="arrow-up-icon" data-testid="programs-list-list-to-top" />
                            </button>
                        )}
                    </div>
                </div>
            </>
        );
    },
);
