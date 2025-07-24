import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import { Program, ProgramCategory } from '../../../../../types/ProgramAdminPage';
import { PROGRAM_CATEGORY_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { VisibilityStatus } from '../../../../../types/Common';
import LoaderIcon from '../../../../../assets/icons/load.svg';
import ArrowUpIcon from '../../../../../assets/icons/arrow-up.svg';
import NotFoundIcon from '../../../../../assets/icons/not-found.svg';
import ProgramListItem from '../program-list-item/ProgramListItem';
import AddCategoryModal from '../program-category-modals/AddCategoryModal';
import EditCategoryModal from '../program-category-modals/EditCategoryModal';
import DeleteCategoryModal from '../program-category-modals/DeleteCategoryModal';
import { CategoryBar } from '../../../../../components/common/category-bar/CategoryBar';
import './programs-list.scss';

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
        const [isMoveToTopVisible, setIsMoveToTopVisible] = useState<boolean>(false);

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
            setPrograms((prevPrograms) => prevPrograms.filter((p) => p.id !== program.id));
        }, []);

        const setProgramsHandler = useCallback((programs: Program[]) => {
            setPrograms(programs);
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
            const fetchCategories = async () => {
                const categoriesFetch = await ProgramsApi.fetchProgramCategories();
                setCategories(categoriesFetch);

                if (categoriesFetch.length > 0) {
                    setSelectedCategory(categoriesFetch[0]);
                }
            };
            fetchCategories();
        }, []);

        const loadPrograms = useCallback(
            async (reset: boolean = false) => {
                if (isProgramsLoadingRef.current || !selectedCategoryRef.current || !hasMoreRef.current) return;

                try {
                    isProgramsLoadingRef.current = true;
                    setIsProgramsLoading(true);

                    const searchCategoryId = selectedCategoryRef.current;
                    const searchStatus = searchByStatus;
                    const pageToFetch = reset ? 1 : currentPageRef.current;
                    const fetchResult = await ProgramsApi.fetchPrograms(
                        searchCategoryId.id,
                        pageToFetch,
                        PAGE_SIZE,
                        searchStatus,
                    );

                    setPrograms((prev) => (reset ? [...fetchResult.items] : [...prev, ...fetchResult.items]));
                    setCurrentPage((prev) => (reset ? 2 : prev + 1));
                    if (totalItemsCountRef.current === null || reset) {
                        setTotalItems(fetchResult.totalItemsCount);
                        totalItemsCountRef.current = fetchResult.totalItemsCount;
                    }

                    cureItemsCountRef.current += fetchResult.items.length;
                    setHasMore(cureItemsCountRef.current < totalItemsCountRef.current);
                } catch (error) {
                    // Handle if it needs
                } finally {
                    isProgramsLoadingRef.current = false;
                    setIsProgramsLoading(false);
                }
            },
            [searchByStatus],
        );

        useEffect(() => {
            setPrograms([]);
            setCurrentPage(1);
            setTotalItems(null);
            setHasMore(true);
            cureItemsCountRef.current = 0;
            isProgramsLoadingRef.current = false;
            hasMoreRef.current = true;
            loadPrograms(true);
        }, [selectedCategory, searchByStatus, loadPrograms]);

        useEffect(() => {
            if (isProgramsLoading && programListRef.current) {
                const el = programListRef.current;
                el.scrollTop = el.scrollHeight;
            }
        }, [isProgramsLoading]);

        const handleOnScroll = () => {
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
                    loadPrograms();
                }
            }
        };

        const moveToTop = () => {
            const el = programListRef.current;
            if (!el) return;

            el.scrollTop = 0;
        };

        const handleCategorySelect = (category: ProgramCategory) => {
            setSelectedCategory(category);
        };

        const handleAddCategory = (newCategory: ProgramCategory) => {
            setCategories((prev) => [...prev, newCategory]);
        };

        const handleEditCategory = (updatedCategory: ProgramCategory) => {
            setCategories((prev) => prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)));
        };

        const handleDeleteCategory = (categoryId: number) => {
            setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
            // If deleted category was selected, select first available
            if (selectedCategory?.id === categoryId) {
                const remaining = categories.filter((cat) => cat.id !== categoryId);
                if (remaining.length > 0) {
                    setSelectedCategory(remaining[0]);
                }
            }
        };

        let content;

        if (programs.length > 0) {
            content = programs.map((program, index) => (
                <ProgramListItem
                    key={index}
                    program={program}
                    handleOnEditProgram={onEditProgram}
                    handleOnDeleteProgram={onDeleteProgram}
                />
            ));
        } else if (!isProgramsLoading) {
            content = (
                <div className="members-not-found" data-testid="members-not-found">
                    <img src={NotFoundIcon} alt="members-not-found" data-testid="members-not-found-icon" />
                    <p>{COMMON_TEXT_ADMIN.LIST.NOT_FOUND}</p>
                </div>
            );
        } else {
            content = null; // or a loading spinner if you want
        }

        return (
            <>
                <AddCategoryModal
                    isOpen={isAddCategoryModalOpen}
                    onClose={() => setIsAddCategoryModalOpen(false)}
                    onAddCategory={handleAddCategory}
                    categories={categories}
                />

                <EditCategoryModal
                    isOpen={isEditCategoryModalOpen}
                    onClose={() => setIsEditCategoryModalOpen(false)}
                    onEditCategory={handleEditCategory}
                    categories={categories}
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
                        displayContextMenu={true}
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
                        {content}
                        {isProgramsLoading ? (
                            <div className="programs-list-loader" data-testid="programs-list-loader">
                                <img src={LoaderIcon} alt="loader-icon" data-testid="programs-list-loader-icon" />
                            </div>
                        ) : (
                            <></>
                        )}
                        {isMoveToTopVisible ? (
                            <button onClick={moveToTop} className="programs-list-list-to-top">
                                <img src={ArrowUpIcon} alt="arrow-up-icon" data-testid="programs-list-list-to-top" />
                            </button>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
            </>
        );
    },
);
