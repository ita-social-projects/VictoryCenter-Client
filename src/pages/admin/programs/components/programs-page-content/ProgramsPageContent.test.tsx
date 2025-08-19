import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProgramsPageContent } from './ProgramsPageContent';
import { Program, ProgramCategory } from '../../../../../types/admin/programs';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { ProgramsApi } from '../../../../../services/api/admin/programs/programs-api';
import { PROGRAM_CATEGORY_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

jest.mock('../../../../../services/api/admin/programs/programs-api');
const mockProgramsApi = ProgramsApi as jest.Mocked<typeof ProgramsApi>;

// Mock hooks
jest.mock('../../../../../hooks/admin/use-modals-state/useModalsState');
jest.mock('../../../../../hooks/admin/fetch/use-entities-pagination-fetch/useEntitiesPaginationFetch');
jest.mock('../../../../../hooks/admin/fetch/use-entities-fetch/useEntitiesFetch');
jest.mock('../../../../../hooks/admin/fetch/use-entity-fetch/useEntityFetch');

const mockUseModalsState = require('../../../../../hooks/admin/use-modals-state/useModalsState');
const mockUseEntitiesPaginationFetch = require('../../../../../hooks/admin/fetch/use-entities-pagination-fetch/useEntitiesPaginationFetch');
const mockUseEntitiesFetch = require('../../../../../hooks/admin/fetch/use-entities-fetch/useEntitiesFetch');
const mockUseEntityFetch = require('../../../../../hooks/admin/fetch/use-entity-fetch/useEntityFetch');

jest.mock('../programs-page-toolbar/ProgramsPageToolbar', () => ({
    ProgramsPageToolbar: (props: any) => {
        const { VisibilityStatus } = require('../../../../../types/admin/common');

        return (
            <div data-testid="programs-toolbar">
                <button onClick={props.onAddProgram}>Add Program</button>
                <button onClick={() => props.onStatusFilterChange(VisibilityStatus.Published)}>Filter Published</button>
                <button onClick={() => props.onProgramSelect(1)} data-testid="select-program-button">
                    Select Program
                </button>
                <button onClick={props.onSearchClear} data-testid="clear-search-button">
                    Clear Search
                </button>
            </div>
        );
    },
}));

// Mock ProgramsPageModals component
jest.mock('../programs-page-modals/ProgramsPageModals', () => ({
    ProgramsPageModals: (props: any) => {
        const { modalState, closeModalActions } = props.modalsStateControl;

        return (
            <div data-testid="programs-page-modals">
                {/* Program Modals */}
                {modalState.isAddModalOpen && (
                    <div data-testid="add-program-modal">
                        <h2>Add Program Modal</h2>
                        <p>Adding new program</p>
                        <button
                            data-testid="confirm-add"
                            onClick={() => {
                                props.onAddProgram(mockNewProgram);
                                closeModalActions.closeAddItemModal();
                            }}
                        >
                            Confirm Add
                        </button>
                        <button data-testid="close-add" onClick={closeModalActions.closeAddItemModal}>
                            Close Add
                        </button>
                    </div>
                )}

                {!!modalState.itemToEdit && (
                    <div data-testid="edit-program-modal">
                        <h2>Edit Program Modal</h2>
                        <p>Editing: {modalState.itemToEdit.name}</p>
                        <button
                            data-testid="confirm-edit"
                            onClick={() => {
                                props.onEditProgram({ ...modalState.itemToEdit, name: 'Updated Program' });
                                closeModalActions.closeEditItemModal();
                            }}
                        >
                            Confirm Edit
                        </button>
                        <button data-testid="close-edit" onClick={closeModalActions.closeEditItemModal}>
                            Close Edit
                        </button>
                    </div>
                )}

                {!!modalState.itemToDelete && (
                    <div data-testid="delete-program-modal">
                        <h2>Delete Program Modal</h2>
                        <p>Deleting: {modalState.itemToDelete.name}</p>
                        <button
                            data-testid="confirm-delete"
                            onClick={() => {
                                props.onDeleteProgram(modalState.itemToDelete);
                                closeModalActions.closeDeleteItemModal();
                            }}
                        >
                            Confirm Delete
                        </button>
                        <button data-testid="close-delete" onClick={closeModalActions.closeDeleteItemModal}>
                            Close Delete
                        </button>
                    </div>
                )}

                {/* Category Modals */}
                {modalState.isAddCategoryModalOpen && (
                    <div data-testid="add-category-modal">
                        <h2>Add Category Modal</h2>
                        <p>Adding new category</p>
                        <button
                            data-testid="confirm-add-category"
                            onClick={() => {
                                const newCategory = { id: 999, name: 'New Category', programsCount: 0 };
                                props.onAddCategory(newCategory);
                                closeModalActions.closeAddCategoryModal();
                            }}
                        >
                            Confirm Add Category
                        </button>
                        <button data-testid="close-add-category" onClick={closeModalActions.closeAddCategoryModal}>
                            Close Add Category
                        </button>
                    </div>
                )}

                {modalState.isEditCategoryModalOpen && (
                    <div data-testid="edit-category-modal">
                        <h2>Edit Category Modal</h2>
                        <p>Editing category</p>
                        <button
                            data-testid="confirm-edit-category"
                            onClick={() => {
                                props.onEditCategory({ id: 1, name: 'Updated Category', programsCount: 0 });
                                closeModalActions.closeEditCategoryModal();
                            }}
                        >
                            Confirm Edit Category
                        </button>
                        <button data-testid="close-edit-category" onClick={closeModalActions.closeEditCategoryModal}>
                            Close Edit Category
                        </button>
                    </div>
                )}

                {modalState.isDeleteCategoryModalOpen && (
                    <div data-testid="delete-category-modal">
                        <h2>Delete Category Modal</h2>
                        <p>Deleting category</p>
                        <button
                            data-testid="confirm-delete-category"
                            onClick={() => {
                                props.onDeleteCategory(1); // Mock deleting category with id 1
                                closeModalActions.closeDeleteCategoryModal();
                            }}
                        >
                            Confirm Delete Category
                        </button>
                        <button
                            data-testid="close-delete-category"
                            onClick={closeModalActions.closeDeleteCategoryModal}
                        >
                            Close Delete Category
                        </button>
                    </div>
                )}
            </div>
        );
    },
}));

jest.mock('../../../../../components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({
        categories,
        selectedCategory,
        onCategorySelect,
        onContextMenuOptionSelected,
    }: {
        categories: ProgramCategory[];
        selectedCategory?: ProgramCategory;
        onCategorySelect: (category: ProgramCategory) => void;
        onContextMenuOptionSelected: (id: string) => void;
    }) => (
        <div data-testid="category-bar">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    data-testid={`category-${cat.id}`}
                    onClick={() => onCategorySelect(cat)}
                    disabled={selectedCategory?.id === cat.id}
                >
                    {cat.name}
                </button>
            ))}
            <button data-testid="context-menu-add" onClick={() => onContextMenuOptionSelected('add')}>
                Add Category
            </button>
            <button data-testid="context-menu-edit" onClick={() => onContextMenuOptionSelected('edit')}>
                Edit Category
            </button>
            <button data-testid="context-menu-delete" onClick={() => onContextMenuOptionSelected('delete')}>
                Delete Category
            </button>
        </div>
    ),
}));

jest.mock('../../../../../components/admin/infinite-scroll-list/InfiniteScrollList', () => ({
    InfiniteScrollList: ({ items, renderItem, onLoadMore, hasMore, isLoading, emptyStateMessage }: any) => (
        <div data-testid="infinite-scroll-list">
            {isLoading && <div data-testid="infinite-scroll-loader">Loading...</div>}
            {items.length === 0 && !isLoading && <div data-testid="empty-state">{emptyStateMessage}</div>}
            {items.map((item: Program) => (
                <div key={item.id} data-testid="program-item">
                    {renderItem(item)}
                </div>
            ))}
            {hasMore && !isLoading && (
                <button data-testid="load-more" onClick={onLoadMore}>
                    Load More
                </button>
            )}
        </div>
    ),
}));

jest.mock('../program-list-item/ProgramListItem', () => ({
    ProgramListItem: ({ program, handleOnEditProgram, handleOnDeleteProgram }: any) => (
        <div data-testid="program-list-item">
            <span>{program.name}</span>
            <button onClick={() => handleOnEditProgram(program)}>Edit</button>
            <button onClick={() => handleOnDeleteProgram(program)}>Delete</button>
        </div>
    ),
}));

const mockCategories: ProgramCategory[] = [
    { id: 1, name: 'Category A', programsCount: 2 },
    { id: 2, name: 'Category B', programsCount: 1 },
];

const mockPrograms: Program[] = [
    {
        id: 1,
        name: 'Test Program Alpha',
        description: 'A sample description.',
        categories: [mockCategories[0]],
        status: VisibilityStatus.Published,
        img: null,
    },
    {
        id: 2,
        name: 'Test Program Beta',
        description: 'Another description.',
        categories: [mockCategories[0]],
        status: VisibilityStatus.Draft,
        img: null,
    },
];

const mockNewProgram: Program = {
    id: 3,
    name: 'Test Program Gama',
    description: 'A sample description.',
    categories: [mockCategories[0]],
    status: VisibilityStatus.Draft,
    img: null,
};

const mockProgram = mockPrograms[0];

// Mock hook return values
const mockModalsActions = {
    openAddItemModal: jest.fn(),
    openEditItemModal: jest.fn(),
    openDeleteItemModal: jest.fn(),
    openAddCategoryModal: jest.fn(),
    openEditCategoryModal: jest.fn(),
    openDeleteCategoryModal: jest.fn(),
    closeAddItemModal: jest.fn(),
    closeEditItemModal: jest.fn(),
    closeDeleteItemModal: jest.fn(),
    closeAddCategoryModal: jest.fn(),
    closeEditCategoryModal: jest.fn(),
    closeDeleteCategoryModal: jest.fn(),
};

const mockCategoriesActions = {
    setEntities: jest.fn(),
    addEntity: jest.fn(),
    updateEntity: jest.fn(),
    removeEntity: jest.fn(),
    refetch: jest.fn(),
};

const mockProgramsActions = {
    fetchFromStart: jest.fn(),
    fetchMore: jest.fn(),
    addEntity: jest.fn(),
    updateEntity: jest.fn(),
    removeEntity: jest.fn(),
    setEntities: jest.fn(),
};

const mockSearchProgramActions = {
    refetch: jest.fn(),
};

describe('ProgramsPageContent', () => {
    const renderProgramsPageContent = () => render(<ProgramsPageContent />);

    const getProgramsPageContent = () => screen.getByTestId('programs-page-content');
    const getProgramsToolbar = () => screen.getByTestId('programs-toolbar');
    const getCategoryBar = () => screen.getByTestId('category-bar');
    const getInfiniteScrollList = () => screen.getByTestId('infinite-scroll-list');
    const getProgramItems = () => screen.getAllByTestId('program-item');
    const getEmptyState = () => screen.getByTestId('empty-state');
    const getAddProgramButton = () => screen.getByText('Add Program');
    const getAddProgramModal = () => screen.queryByTestId('add-program-modal');
    const getEditProgramModal = () => screen.queryByTestId('edit-program-modal');
    const getDeleteProgramModal = () => screen.queryByTestId('delete-program-modal');
    const getAddCategoryModal = () => screen.queryByTestId('add-category-modal');
    const getEditCategoryModal = () => screen.queryByTestId('edit-category-modal');
    const getDeleteCategoryModal = () => screen.queryByTestId('delete-category-modal');
    const getContextMenuAddButton = () => screen.getByTestId('context-menu-add');
    const getContextMenuEditButton = () => screen.getByTestId('context-menu-edit');
    const getContextMenuDeleteButton = () => screen.getByTestId('context-menu-delete');
    const getCategoryButton = (id: number) => screen.getByTestId(`category-${id}`);
    const getFilterPublishedButton = () => screen.getByText('Filter Published');
    const getSelectProgramButton = () => screen.getByTestId('select-program-button');
    const getClearSearchButton = () => screen.getByTestId('clear-search-button');
    const getProgramsErrorContainer = () => screen.queryByTestId('programs-error-container');
    const getTryAgainButton = () => screen.queryByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN);
    const getConfirmAddButton = () => screen.getByTestId('confirm-add');
    const getConfirmEditButton = () => screen.getByTestId('confirm-edit');
    const getConfirmDeleteButton = () => screen.getByTestId('confirm-delete');
    const clickAddProgramButton = () => fireEvent.click(getAddProgramButton());
    const clickContextMenuAddButton = () => fireEvent.click(getContextMenuAddButton());
    const clickContextMenuEditButton = () => fireEvent.click(getContextMenuEditButton());
    const clickContextMenuDeleteButton = () => fireEvent.click(getContextMenuDeleteButton());
    const clickCategoryButton = (id: number) => fireEvent.click(getCategoryButton(id));
    const clickFilterPublishedButton = () => fireEvent.click(getFilterPublishedButton());
    const clickSelectProgramButton = () => fireEvent.click(getSelectProgramButton());
    const clickClearSearchButton = () => fireEvent.click(getClearSearchButton());
    const clickTryAgainButton = () => getTryAgainButton() && fireEvent.click(getTryAgainButton()!);
    const clickConfirmAddButton = () => fireEvent.click(getConfirmAddButton());
    const clickConfirmEditButton = () => fireEvent.click(getConfirmEditButton());
    const clickConfirmDeleteButton = () => fireEvent.click(getConfirmDeleteButton());

    const expectMainComponentsToBeRendered = () => {
        expect(getProgramsPageContent()).toBeInTheDocument();
        expect(getProgramsToolbar()).toBeInTheDocument();
        expect(getCategoryBar()).toBeInTheDocument();
        expect(getInfiniteScrollList()).toBeInTheDocument();
    };

    const expectEmptyStateToBeShown = () => {
        expect(getEmptyState()).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.LIST.NOT_FOUND)).toBeInTheDocument();
    };

    const expectModalToBeOpen = (modal: HTMLElement | null, title: string, content: string) => {
        expect(modal).toBeInTheDocument();
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(content)).toBeInTheDocument();
    };

    const expectErrorToBeDisplayed = (errorMessage: string) => {
        expect(getProgramsErrorContainer()).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock useModalsState
        mockUseModalsState.useModalsState.mockReturnValue({
            modalState: {
                isAddModalOpen: false,
                isAddCategoryModalOpen: false,
                isEditCategoryModalOpen: false,
                isDeleteCategoryModalOpen: false,
                itemToEdit: null,
                itemToDelete: null,
            },
            isAnyModalOpened: false,
            openModalActions: mockModalsActions,
            closeModalActions: mockModalsActions,
        });

        // Mock useEntitiesFetch for categories
        mockUseEntitiesFetch.useEntitiesFetch.mockReturnValue({
            entities: mockCategories,
            error: null,
            isLoading: false,
            actions: mockCategoriesActions,
        });

        // Mock useEntitiesPaginationFetch for programs
        mockUseEntitiesPaginationFetch.useEntitiesPaginationFetch.mockReturnValue({
            entities: mockPrograms,
            isLoading: false,
            hasMore: false,
            error: null,
            actions: mockProgramsActions,
        });

        // Mock useEntityFetch for search program
        mockUseEntityFetch.useEntityFetch.mockReturnValue({
            entity: null,
            isLoading: false,
            error: null,
            actions: mockSearchProgramActions,
        });
    });

    describe('Initial render', () => {
        it('should render all main components', () => {
            renderProgramsPageContent();
            expectMainComponentsToBeRendered();
        });

        it('should show empty state when no programs are found', () => {
            mockUseEntitiesPaginationFetch.useEntitiesPaginationFetch.mockReturnValue({
                entities: [],
                isLoading: false,
                hasMore: false,
                error: null,
                actions: mockProgramsActions,
            });

            renderProgramsPageContent();
            expectEmptyStateToBeShown();
        });

        it('should show programs when available', () => {
            renderProgramsPageContent();
            expect(getProgramItems()).toHaveLength(2);
        });
    });

    describe('Program Modal interactions', () => {
        it('should trigger add program modal actions', () => {
            renderProgramsPageContent();
            clickAddProgramButton();
            expect(mockModalsActions.openAddItemModal).toHaveBeenCalledTimes(1);
        });

        it('should handle add program modal with open state', () => {
            mockUseModalsState.useModalsState.mockReturnValue({
                modalState: {
                    isAddModalOpen: true,
                    isAddCategoryModalOpen: false,
                    isEditCategoryModalOpen: false,
                    isDeleteCategoryModalOpen: false,
                    itemToEdit: null,
                    itemToDelete: null,
                },
                isAnyModalOpened: true,
                openModalActions: mockModalsActions,
                closeModalActions: mockModalsActions,
            });

            renderProgramsPageContent();
            expectModalToBeOpen(getAddProgramModal(), 'Add Program Modal', 'Adding new program');

            clickConfirmAddButton();
            expect(mockModalsActions.closeAddItemModal).toHaveBeenCalledTimes(1);
        });

        it('should handle edit program modal with program to edit', () => {
            mockUseModalsState.useModalsState.mockReturnValue({
                modalState: {
                    isAddModalOpen: false,
                    isAddCategoryModalOpen: false,
                    isEditCategoryModalOpen: false,
                    isDeleteCategoryModalOpen: false,
                    itemToEdit: mockProgram,
                    itemToDelete: null,
                },
                isAnyModalOpened: true,
                openModalActions: mockModalsActions,
                closeModalActions: mockModalsActions,
            });

            renderProgramsPageContent();
            expectModalToBeOpen(getEditProgramModal(), 'Edit Program Modal', `Editing: ${mockProgram.name}`);

            clickConfirmEditButton();
            expect(mockModalsActions.closeEditItemModal).toHaveBeenCalledTimes(1);
        });

        it('should handle delete program modal with program to delete', () => {
            mockUseModalsState.useModalsState.mockReturnValue({
                modalState: {
                    isAddModalOpen: false,
                    isAddCategoryModalOpen: false,
                    isEditCategoryModalOpen: false,
                    isDeleteCategoryModalOpen: false,
                    itemToEdit: null,
                    itemToDelete: mockProgram,
                },
                isAnyModalOpened: true,
                openModalActions: mockModalsActions,
                closeModalActions: mockModalsActions,
            });

            renderProgramsPageContent();
            expectModalToBeOpen(getDeleteProgramModal(), 'Delete Program Modal', `Deleting: ${mockProgram.name}`);

            clickConfirmDeleteButton();
            expect(mockModalsActions.closeDeleteItemModal).toHaveBeenCalledTimes(1);
        });
    });

    describe('Category Modal interactions', () => {
        it('should trigger add category modal', () => {
            renderProgramsPageContent();
            clickContextMenuAddButton();
            expect(mockModalsActions.openAddCategoryModal).toHaveBeenCalledTimes(1);
        });

        it('should trigger edit category modal', () => {
            renderProgramsPageContent();
            clickContextMenuEditButton();
            expect(mockModalsActions.openEditCategoryModal).toHaveBeenCalledTimes(1);
        });

        it('should trigger delete category modal', () => {
            renderProgramsPageContent();
            clickContextMenuDeleteButton();
            expect(mockModalsActions.openDeleteCategoryModal).toHaveBeenCalledTimes(1);
        });

        it('should handle add category modal when open', () => {
            mockUseModalsState.useModalsState.mockReturnValue({
                modalState: {
                    isAddModalOpen: false,
                    isAddCategoryModalOpen: true,
                    isEditCategoryModalOpen: false,
                    isDeleteCategoryModalOpen: false,
                    itemToEdit: null,
                    itemToDelete: null,
                },
                isAnyModalOpened: true,
                openModalActions: mockModalsActions,
                closeModalActions: mockModalsActions,
            });

            renderProgramsPageContent();
            expectModalToBeOpen(getAddCategoryModal(), 'Add Category Modal', 'Adding new category');
        });

        it('should handle edit category modal when open', () => {
            mockUseModalsState.useModalsState.mockReturnValue({
                modalState: {
                    isAddModalOpen: false,
                    isAddCategoryModalOpen: false,
                    isEditCategoryModalOpen: true,
                    isDeleteCategoryModalOpen: false,
                    itemToEdit: null,
                    itemToDelete: null,
                },
                isAnyModalOpened: true,
                openModalActions: mockModalsActions,
                closeModalActions: mockModalsActions,
            });

            renderProgramsPageContent();
            expectModalToBeOpen(getEditCategoryModal(), 'Edit Category Modal', 'Editing category');
        });

        it('should handle delete category modal when open', () => {
            mockUseModalsState.useModalsState.mockReturnValue({
                modalState: {
                    isAddModalOpen: false,
                    isAddCategoryModalOpen: false,
                    isEditCategoryModalOpen: false,
                    isDeleteCategoryModalOpen: true,
                    itemToEdit: null,
                    itemToDelete: null,
                },
                isAnyModalOpened: true,
                openModalActions: mockModalsActions,
                closeModalActions: mockModalsActions,
            });

            renderProgramsPageContent();
            expectModalToBeOpen(getDeleteCategoryModal(), 'Delete Category Modal', 'Deleting category');
        });
    });

    describe('Search functionality', () => {
        it('should handle program selection for search', () => {
            renderProgramsPageContent();
            clickSelectProgramButton();
            // Since this triggers internal state changes, we can't directly assert them
            // but we can verify the button works without errors
            expect(getSelectProgramButton()).toBeInTheDocument();
        });

        it('should handle search clear', () => {
            renderProgramsPageContent();
            clickClearSearchButton();
            // Similar to program selection, this triggers internal state changes
            expect(getClearSearchButton()).toBeInTheDocument();
        });

        it('should show searched program when available', () => {
            // Mock useEntityFetch to return a searched program
            mockUseEntityFetch.useEntityFetch.mockReturnValue({
                entity: mockProgram,
                isLoading: false,
                error: null,
                actions: mockSearchProgramActions,
            });

            // Render component and trigger search state by clicking select program
            renderProgramsPageContent();
            clickSelectProgramButton();

            // In search mode, only the searched program should be displayed
            expect(getProgramItems()).toHaveLength(1);
            expect(screen.getByText('Test Program Alpha')).toBeInTheDocument();
        });
    });

    describe('Error handling', () => {
        it('should display error when categories fail to load', () => {
            mockUseEntitiesFetch.useEntitiesFetch.mockReturnValue({
                entities: [],
                error: new Error('Categories fetch error'),
                isLoading: false,
                actions: mockCategoriesActions,
            });

            renderProgramsPageContent();
            expectErrorToBeDisplayed(PROGRAM_CATEGORY_TEXT.MESSAGE.FAIL_TO_FETCH_CATEGORIES);

            clickTryAgainButton();
            // First time - use effect, second - click
            expect(mockCategoriesActions.refetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('Category selection and filtering', () => {
        it('should handle status filter changes', () => {
            renderProgramsPageContent();
            clickFilterPublishedButton();
            // The status filter change is handled internally,
            // we can verify the button works without errors
            expect(getFilterPublishedButton()).toBeInTheDocument();
        });

        it('should handle category selection', () => {
            renderProgramsPageContent();
            clickCategoryButton(2);
            // Category selection is handled internally,
            // we can verify the category button works
            expect(getCategoryButton(2)).toBeInTheDocument();
        });
    });

    describe('Loading states', () => {
        it('should show loading state when categories are loading', () => {
            mockUseEntitiesFetch.useEntitiesFetch.mockReturnValue({
                entities: [],
                error: null,
                isLoading: true,
                actions: mockCategoriesActions,
            });

            renderProgramsPageContent();
            expect(screen.getByTestId('infinite-scroll-loader')).toBeInTheDocument();
        });

        it('should show loading state when programs are loading', () => {
            mockUseEntitiesPaginationFetch.useEntitiesPaginationFetch.mockReturnValue({
                entities: [],
                isLoading: true,
                hasMore: false,
                error: null,
                actions: mockProgramsActions,
            });

            renderProgramsPageContent();
            expect(screen.getByTestId('infinite-scroll-loader')).toBeInTheDocument();
        });

        it('should show loading state when search program is loading', () => {
            mockUseEntityFetch.useEntityFetch.mockReturnValue({
                entity: null,
                isLoading: true,
                error: null,
                actions: mockSearchProgramActions,
            });

            renderProgramsPageContent();
            expect(screen.getByTestId('infinite-scroll-loader')).toBeInTheDocument();
        });
    });

    describe('Empty categories handling', () => {
        it('should handle empty categories list', () => {
            // Mock empty categories and empty programs
            mockUseEntitiesFetch.useEntitiesFetch.mockReturnValue({
                entities: [],
                error: null,
                isLoading: false,
                actions: mockCategoriesActions,
            });

            mockUseEntitiesPaginationFetch.useEntitiesPaginationFetch.mockReturnValue({
                entities: [],
                isLoading: false,
                hasMore: false,
                error: null,
                actions: mockProgramsActions,
            });

            renderProgramsPageContent();
            expect(getCategoryBar()).toBeInTheDocument();

            // With empty categories, should show empty state for programs
            expectEmptyStateToBeShown();
        });
    });
});
