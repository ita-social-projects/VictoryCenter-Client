import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    forwardRef,
    useImperativeHandle
} from 'react';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import { ProgramListItem } from '../program-list-item/ProgramListItem'
import { ContextMenu } from "../../../../../components/common/context-menu/ContextMenu";
import { Modal } from "../../../../../components/common/modal/Modal";
import { Button } from "../../../../../components/common/button/Button";
import {
    Program,
    ProgramCategory,
    ProgramCategoryCreateUpdate,
    ProgramStatus
} from '../../../../../types/ProgramAdminPage';
import { PROGRAMS_TEXT, PROGRAM_CATEGORY_TEXT } from "../../../../../const/admin/programs";
import classNames from "classnames";
import LoaderIcon from "../../../../../assets/icons/load.svg";
import ArrowUpIcon from "../../../../../assets/icons/arrow-up.svg"
import NotFoundIcon from "../../../../../assets/icons/not-found.svg";
import InfoIcon from "../../../../../assets/icons/info.svg";
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
const MAX_CATEGORY_NAME_LENGTH = 20;

const AddCategoryModal = ({
    isOpen,
    onClose,
    onAddCategory,
    categories,
}: {
    isOpen: boolean;
    onClose: () => void;
    onAddCategory: (category: ProgramCategory) => void;
    categories: ProgramCategory[];
}) => {
    const [categoryNameToAdd, setCategoryNameToAdd] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isDuplicateName, setIsDuplicateName] = useState<boolean>(false);
    const isSubmittingRef = useRef(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted");

        if (isSubmittingRef.current  || !categoryNameToAdd.trim() || isDuplicateName) {
            return;
        }

        try {
            isSubmittingRef.current = true;
            setIsSubmitting(true);
            setError('');

            const categoryToCreate: ProgramCategoryCreateUpdate = {
                id: null,
                name: categoryNameToAdd.trim()
            };

            console.log(`Creating category with name: ${categoryNameToAdd.trim()}`);
            const newCategory =  await ProgramsApi.addProgramCategory(categoryToCreate);

            onAddCategory(newCategory);
            setCategoryNameToAdd('');
            onClose();
        } catch (error) {
            // Or handle in your way
            setError(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_CATEGORY);
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (categoryNameToAdd.trim()) {
            const isDuplicate = categories.some(category =>
                category.name.toLowerCase() === categoryNameToAdd.trim().toLowerCase()
            );
            setIsDuplicateName(isDuplicate);
        } else {
            setIsDuplicateName(false);
        }
    }, [categoryNameToAdd, categories]);

    const handleClose = () => {
        if (isSubmitting) return;

        setCategoryNameToAdd('');
        setError('');
        setIsDuplicateName(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Title>
                <span className={'program-form-header'}>
                    {PROGRAM_CATEGORY_TEXT.FORM.TITLE.ADD_CATEGORY}
                </span>
            </Modal.Title>
            <Modal.Content>
                <form onSubmit={handleSubmit} className="program-form-main">
                    <div className='form-group form-group-name'>
                        <label htmlFor="add-category-name">
                            {PROGRAM_CATEGORY_TEXT.FORM.LABEL.NAME}
                        </label>
                        <input
                            value={categoryNameToAdd}
                            onChange={(e) => setCategoryNameToAdd(e.target.value)}
                            maxLength={MAX_CATEGORY_NAME_LENGTH}
                            name='name'
                            type="text"
                            id='add-category-name'
                            required
                            disabled={isSubmitting}
                        />
                        <div className='form-group-name-lenght-limit'>
                            {categoryNameToAdd.length}/{MAX_CATEGORY_NAME_LENGTH}
                        </div>
                        <div className='form-group'>
                            {isDuplicateName && (
                                <span className='error'>
                                    {PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.ALREADY_CONTAIN_CATEGORY_WITH_NAME}
                                </span>
                            )}
                            {error && (<span className='error'>{error}</span>)}
                        </div>
                    </div>
                    <Modal.Actions>
                        <div className='program-form-buttons-container'>
                            <Button
                                type="submit"
                                buttonStyle="primary"
                                disabled={isSubmitting || isDuplicateName || !categoryNameToAdd.trim()}
                            >
                            {PROGRAMS_TEXT.BUTTONS.SAVE}
                            </Button>
                        </div>
                    </Modal.Actions>
                </form>
            </Modal.Content>
        </Modal>
    );
};

const EditCategoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onEditCategory: (category: ProgramCategory) => void;
    categories: ProgramCategory[];
}> = ({ isOpen, onClose, onEditCategory, categories }) => {
    const [categoryToEdit, setCategoryToEdit] = useState<ProgramCategory | null>(null);
    const [editCategoryName, setEditCategoryName] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isDuplicateName, setIsDuplicateName] = useState<boolean>(false);
    const isSubmittingRef = useRef(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryToEdit || !editCategoryName.trim() || isDuplicateName) {
            return;
        }

        try {
            isSubmittingRef.current = true;
            setIsSubmitting(true);
            setError('');

            const categoryToUpdate = {
                id: categoryToEdit.id,
                name: editCategoryName.trim()
            };

            const updatedCategory = await ProgramsApi.editCategory(categoryToUpdate);
            onEditCategory(updatedCategory);
            handleClose();
        } catch (error) {
            setError('Не вдалося оновити категорію');
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setCategoryToEdit(null);
        setEditCategoryName('');
        setError('');
        setIsDuplicateName(false);
        onClose();
    };

    useEffect(() => {
        if (editCategoryName.trim() && categoryToEdit) {
            const isDuplicate = categories.some(category =>
                category.id !== categoryToEdit.id &&
                category.name.toLowerCase() === editCategoryName.trim().toLowerCase()
            );
            setIsDuplicateName(isDuplicate);
        } else {
            setIsDuplicateName(false);
        }
    }, [editCategoryName, categories, categoryToEdit]);

    useEffect(() => {
        if (isOpen && categories.length > 0) {
            setCategoryToEdit(categories[0]);
            setEditCategoryName(categories[0].name);
        }
    }, [isOpen, categories]);

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Title>
                <span className={'program-form-header'}>{PROGRAM_CATEGORY_TEXT.FORM.TITLE.EDIT_CATEGORY}</span>
            </Modal.Title>
            <Modal.Content>
                <form onSubmit={handleSubmit} className="program-form-main">
                    <div className='form-group'>
                        <label htmlFor="edit-category-select">{PROGRAM_CATEGORY_TEXT.FORM.LABEL.CATEGORY}</label>
                        <select
                            id="edit-category-select"
                            value={categoryToEdit?.id || ''}
                            onChange={(e) => {
                                const selectedId = parseInt(e.target.value);
                                const selected = categories.find(cat => cat.id === selectedId);
                                if (selected) {
                                    setCategoryToEdit(selected);
                                    setEditCategoryName(selected.name);
                                }
                            }}
                            disabled={isSubmitting}
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='form-group form-group-name'>
                        <label htmlFor="edit-category-name">{PROGRAM_CATEGORY_TEXT.FORM.LABEL.NAME}</label>
                        <input
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            maxLength={MAX_CATEGORY_NAME_LENGTH}
                            name='name'
                            type="text"
                            id='edit-category-name'
                            required
                            disabled={isSubmitting}
                        />
                        <div className='form-group-name-lenght-limit'>
                            {editCategoryName.length}/{MAX_CATEGORY_NAME_LENGTH}
                        </div>
                        {isDuplicateName && (
                            <span className='error'>
                                Категорія з такою назвою вже існує
                            </span>
                        )}
                        {error && (<span className='error'>{error}</span>)}
                    </div>
                    <Modal.Actions>
                        <div className={'program-form-buttons-container'}>
                            <Button
                                type="submit"
                                buttonStyle="primary"
                                disabled={isSubmitting || isDuplicateName || !editCategoryName.trim()}
                            >
                                {PROGRAM_CATEGORY_TEXT.FORM.BUTTON.CONFIRM_SAVE}
                            </Button>
                        </div>
                    </Modal.Actions>
                </form>
            </Modal.Content>
        </Modal>
    );
};

const DeleteCategoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onDeleteCategory: (categoryId: number) => void;
    categories: ProgramCategory[];
}> = ({ isOpen, onClose, onDeleteCategory, categories }) => {
    const [categoryToDelete, setCategoryToDelete] = useState<ProgramCategory | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const isSubmittingRef = useRef(false);

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            isSubmittingRef.current = true;
            setIsSubmitting(true);
            setError('');

            await ProgramsApi.deleteCategory(categoryToDelete.id);
            onDeleteCategory(categoryToDelete.id);
            handleClose();
        } catch (error) {
            setError('Не вдалося видалити категорію');
        } finally {
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setCategoryToDelete(null);
        setError('');
        onClose();
    };

    useEffect(() => {
        if (isOpen && categories.length > 0) {
            setCategoryToDelete(categories[0]);
        }
    }, [isOpen, categories]);

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Title>
                <span className={'program-form-header'}>Видалити категорію</span>
            </Modal.Title>
            <Modal.Content>
                <div className="program-form-main">
                    <div className='form-group'>
                        <label htmlFor="delete-category-select">Категорія</label>
                        <select
                            id="delete-category-select"
                            value={categoryToDelete?.id || ''}
                            onChange={(e) => {
                                const selectedId = parseInt(e.target.value);
                                const selected = categories.find(cat => cat.id === selectedId);
                                if (selected) {
                                    setCategoryToDelete(selected);
                                }
                            }}
                            disabled={isSubmitting}
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {categoryToDelete && categoryToDelete.programsCount > 0 && (
                        <div className="delete-category-warning">
                            <div className="warning-icon-container">
                                <img src={InfoIcon} alt="info-icon" className="warning-info-icon" />
                            </div>
                            <div className="warning-text">
                                <div className="warning-title">
                                    Категорія містить {categoryToDelete.programsCount} програм
                                </div>
                                <div className="warning-description">
                                    Перенесіть їх в іншу категорію або видаліть, щоб продовжити
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (<span className='error'>{error}</span>)}
                </div>
            </Modal.Content>
            <Modal.Actions>
                <div className="program-form-buttons-container">
                    <button
                        type='button'
                        className={'cancel-button'}
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Відмінити
                    </button>
                    <button
                        type='button'
                        disabled={!!(categoryToDelete && categoryToDelete.programsCount > 0) || isSubmitting}
                        className={'publisher-button'}
                        onClick={handleDelete}
                    >
                        Видалити
                    </button>
                </div>
            </Modal.Actions>
        </Modal>
    );
};


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

    useEffect(() => {
        const fetchCategories = async () => {
            console.log('fetchCategories');
            const categoriesFetch = await ProgramsApi.fetchProgramCategories();
            setCategories(categoriesFetch);

            if (categoriesFetch.length > 0) {
                setSelectedCategory(categoriesFetch[0]);
            }
        }
        fetchCategories();
    }, []);

    const loadPrograms = useCallback(async (reset: boolean = false) => {
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

    const handleAddCategory = (newCategory: ProgramCategory) => {
        setCategories(prev => [...prev, newCategory]);
    };

    const handleEditCategory = (updatedCategory: ProgramCategory) => {
        setCategories(prev => prev.map(cat =>
            cat.id === updatedCategory.id ? updatedCategory : cat
        ));
    };

    const handleDeleteCategory = (categoryId: number) => {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        // If deleted category was selected, select first available
        if (selectedCategory?.id === categoryId) {
            const remaining = categories.filter(cat => cat.id !== categoryId);
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
                    {categories.map(((c, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedCategory(c)}
                            className={classNames('programs-categories-button', {
                                'programs-categories-selected': selectedCategory === c
                            })}
                        >
                            {c.name}
                        </button>
                    )))}
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
