import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    forwardRef,
    useImperativeHandle
} from 'react';
import {
    fetchProgramsWithFilterAndPagination,
    programCategoriesDataFetch
} from '../../../../../services/data-fetch/admin-page/programs-data-fetch';
import { ProgramListItem } from '../program-list-item/ProgramListItem'
import { ContextMenu } from "../../../../../components/common/context-menu/ContextMenu";
import { Program, ProgramCategory, ProgramStatus } from '../../../../../types/ProgramAdminPage';
import { PROGRAMS_TEXT } from "../../../../../const/admin/programs";
import classNames from "classnames";
import LoaderIcon from "../../../../../assets/icons/load.svg";
import ArrowUpIcon from "../../../../../assets/icons/arrow-up.svg"
import NotFoundIcon from "../../../../../assets/icons/not-found.svg";
import './programs-list.scss'

export interface ProgramsListProps {
    searchByStatus: ProgramStatus | undefined;
    onEditProgram: (program: Program) => void;
    onDeleteProgram: (program: Program) => void;
}

export type ProgramListRef = {
  addProgram: (program: Program) => void;
  editProgram: (program: Program) => void;
  deleteProgram: (program: Program) => void;
  setPrograms: (programs: Program[]) => void;
}

const PAGE_SIZE = 5;
const BOTTOM_REACH_THRESHOLD_PIXELS = 5;

export const ProgramsList = forwardRef<ProgramListRef, ProgramsListProps>(({
                                 searchByStatus,
                                 onEditProgram,
                                 onDeleteProgram,
                            }: ProgramsListProps, ref) => {
    const [selectedCategory, setSelectedCategory] = useState<ProgramCategory>();
    const [categories, setCategories] = useState<ProgramCategory[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isProgramsLoading, setIsProgramsLoading] = useState(false);
    const [isMoveToTopVisible, setIsMoveToTopVisible] = useState<boolean>(false);

    const [categoryNameToAdd, setCategoryNameToAdd] = useState<string>('');
    const [editCategoryName, setEditCategoryName] = useState<string>('');
    const [categoryToEdit, setCategoryToEdit] = useState<ProgramCategory | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<ProgramCategory | null>(null);
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
        setPrograms(prevPrograms => {
            // If already contain program - replace it
            const index = prevPrograms.findIndex(p => p.id === program.id);
            if (index !== -1) {
                const updated = [...prevPrograms];
                updated[index] = program;
                return updated;
            }

            cureItemsCountRef.current += 1;
            if (totalItemsCountRef.current){
                totalItemsCountRef.current += 1;
            }

            return [program, ...prevPrograms];
        });
    }, []);

    const editProgramHandler = useCallback((program: Program) => {
        setPrograms(prevPrograms =>
            prevPrograms.map(p => p.id === program.id ? program : p)
        );
    }, []);

    const deleteProgramHandler = useCallback((program: Program) => {
        setPrograms(prevPrograms =>
            prevPrograms.filter(p => p.id !== program.id)
        );
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

    const loadPrograms = useCallback(async (reset: boolean = false) => {
        if (isProgramsLoadingRef.current || !selectedCategoryRef.current || !hasMoreRef.current) return;

        try {
            isProgramsLoadingRef.current = true;
            setIsProgramsLoading(true);

            const searchCategoryId = selectedCategoryRef.current;
            const searchStatus = searchByStatus;
            const pageToFetch = reset ? 1 : currentPageRef.current;
            const fetchResult = await fetchProgramsWithFilterAndPagination(
                searchCategoryId.id,
                pageToFetch,
                PAGE_SIZE,
                searchStatus,
            );

            setPrograms(prev => reset ? [...fetchResult.items] : [...prev, ...fetchResult.items]);
            setCurrentPage(prev => reset ? 2 : prev + 1);
            if (totalItemsCountRef.current === null || reset) {
                setTotalItems(fetchResult.totalItemsCount);
                totalItemsCountRef.current = fetchResult.totalItemsCount;
            }

            cureItemsCountRef.current += fetchResult.items.length;
            setHasMore(cureItemsCountRef.current < totalItemsCountRef.current);
        }
        catch (error) {
            // Handle if it needs
        }
        finally {
            isProgramsLoadingRef.current = false;
            setIsProgramsLoading(false);
        }
    }, [searchByStatus, selectedCategory]);

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

    useEffect(() => {
        const fetchCategories = async () => {
            const categoriesFetch = await programCategoriesDataFetch();
            setCategories(categoriesFetch);

            if (categoriesFetch.length > 0) {
                setSelectedCategory(categoriesFetch[0]);
            }
        }
        fetchCategories();
    }, []);

    const handleOnScroll = () => {
        const el = programListRef.current;
        if (!el || isProgramsLoading) return;

        if (el.scrollTop > 0) {
            setIsMoveToTopVisible(true);
        } else {
            setIsMoveToTopVisible(false);
        }

        if (hasMore) {
            const distanceToBottom = Math.abs((el.scrollHeight - el.scrollTop) - el.clientHeight);
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

    function handleOnOptionSelected(option: string) {
        if (option === "add") {
            setIsAddCategoryModalOpen(true);
        }
        else if (option === "edit") {
             setIsEditCategoryModalOpen(true);
        }
        else if (option === "delete") {
            setIsDeleteCategoryModalOpen(true);
        }
    }

    let content;

    if (programs.length > 0) {
        content = programs.map((program, index) => (
            <ProgramListItem
                key={index}
                program={program}
                handleOnEditProgram={onEditProgram}
                handleOnDeleteProgram={onDeleteProgram}/>
        ));
    } else if (!isProgramsLoading) {
        content = (
            <div className="members-not-found" data-testid="members-not-found">
                <img
                    src={NotFoundIcon}
                    alt="members-not-found"
                    data-testid="members-not-found-icon"
                />
                <p>{PROGRAMS_TEXT.LIST.NOT_FOUND}</p>
            </div>
        );
    } else {
        content = null; // or a loading spinner if you want
    }

    return (
        <>
            <div className='programs'>
                <div data-testid="programs-categories" className='programs-categories'>
                    <ContextMenu onOptionSelected={handleOnOptionSelected} className={'programs-categories-context-menu'}>
                        <ContextMenu.Option value={"add"}>
                            Додати
                        </ContextMenu.Option>
                         <ContextMenu.Option value={"edit"}>
                            Редагувати
                        </ContextMenu.Option>
                        <ContextMenu.Option value={"delete"}>
                            Видалити
                        </ContextMenu.Option>
                    </ContextMenu>
                    {categories.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedCategory(c)}
                            className={classNames('programs-categories-button', {
                                'programs-categories-selected': selectedCategory === c
                            })}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
                <div ref={programListRef} onScroll={handleOnScroll} data-testid="programs-list" className="programs-list">
                    {content}
                    {isProgramsLoading
                        ? (<div className='programs-list-loader' data-testid='programs-list-loader'>
                            <img src={LoaderIcon} alt="loader-icon" data-testid='programs-list-loader-icon'/>
                        </div>)
                        : (<></>)}
                    {isMoveToTopVisible ?
                        <button onClick={moveToTop} className='programs-list-list-to-top' >
                            <img src={ArrowUpIcon} alt="arrow-up-icon" data-testid="programs-list-list-to-top"/>
                        </button> : <></>}
                </div>
            </div>
        </>
    );
});
