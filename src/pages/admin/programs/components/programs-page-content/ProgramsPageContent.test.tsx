import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProgramsPageContent } from './ProgramsPageContent';
import { Program, ProgramCategory } from '../../../../../types/admin/Programs';
import { VisibilityStatus } from '../../../../../types/admin/Common';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import { PROGRAM_CATEGORY_TEXT, PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

jest.mock('../../../../../services/api/admin/programs/programs-api');
const mockProgramsApi = ProgramsApi as jest.Mocked<typeof ProgramsApi>;

jest.mock('../programs-page-toolbar/ProgramsPageToolbar', () => ({
    ProgramsPageToolbar: (props: any) => (
        <div data-testid="programs-toolbar">
            <button onClick={props.onAddProgram}>Add Program</button>
            <button onClick={() => props.onStatusFilterChange('Published' as VisibilityStatus)}>
                Filter Published
            </button>
            <input
                data-testid="search-input"
                onChange={(e) => props.onSearchQueryChange(e.target.value)}
                placeholder="Search..."
            />
        </div>
    ),
}));

jest.mock('../program-modals/ProgramModal', () => ({
    ProgramModal: (props: any) => {
        if (!props.isOpen) return null;

        const isAddMode = props.mode === 'add';
        const isEditMode = props.mode === 'edit';

        return (
            <div data-testid={isAddMode ? 'add-program-modal' : 'edit-program-modal'}>
                <h2>{isAddMode ? 'Add Program Modal' : 'Edit Program Modal'}</h2>
                {isEditMode && props.programToEdit && <p>Editing: {props.programToEdit.name}</p>}
                {isAddMode && <p>Adding new program</p>}
                <button
                    data-testid={isAddMode ? 'confirm-add' : 'confirm-edit'}
                    onClick={() => {
                        if (isAddMode && props.onAddProgram) {
                            props.onAddProgram(mockNewProgram);
                        } else if (isEditMode && props.onEditProgram && props.programToEdit) {
                            props.onEditProgram({ ...props.programToEdit, name: 'Updated Program' });
                        }
                        props.onClose();
                    }}
                >
                    {isAddMode ? 'Confirm Add' : 'Confirm Edit'}
                </button>
                <button data-testid={isAddMode ? 'close-add' : 'close-edit'} onClick={props.onClose}>
                    {isAddMode ? 'Close Add' : 'Close Edit'}
                </button>
            </div>
        );
    },
}));

jest.mock('../program-modals/DeleteProgramModal', () => ({
    DeleteProgramModal: (props: any) =>
        props.isOpen ? (
            <div data-testid="delete-program-modal">
                <h2>Delete Program Modal</h2>
                <p>Deleting: {props.programToDelete?.name}</p>
                <button
                    data-testid="confirm-delete"
                    onClick={() => {
                        props.onDeleteProgram(props.programToDelete);
                        props.onClose();
                    }}
                >
                    Confirm Delete
                </button>
                <button data-testid="close-delete" onClick={props.onClose}>
                    Close Delete
                </button>
            </div>
        ) : null,
}));

jest.mock('../program-category-modals/ProgramCategoryModal', () => ({
    ProgramCategoryModal: (props: any) => {
        if (!props.isOpen) return null;

        const isAddMode = props.mode === 'add';
        const isEditMode = props.mode === 'edit';

        return (
            <div data-testid={isAddMode ? 'add-category-modal' : 'edit-category-modal'}>
                <h2>{isAddMode ? 'Add Category Modal' : 'Edit Category Modal'}</h2>
                {isAddMode && <p>Adding new category</p>}
                {isEditMode && <p>Editing category</p>}
                <button
                    data-testid={isAddMode ? 'confirm-add-category' : 'confirm-edit-category'}
                    onClick={() => {
                        const newCategory = { id: 999, name: 'New Category', programsCount: 0 };
                        if (isAddMode && props.onAddCategory) {
                            props.onAddCategory(newCategory);
                        } else if (isEditMode && props.onEditCategory) {
                            props.onEditCategory({ id: 1, name: 'Updated Category', programsCount: 0 });
                        }
                        props.onClose();
                    }}
                >
                    {isAddMode ? 'Confirm Add Category' : 'Confirm Edit Category'}
                </button>
                <button data-testid={isAddMode ? 'close-add-category' : 'close-edit-category'} onClick={props.onClose}>
                    {isAddMode ? 'Close Add Category' : 'Close Edit Category'}
                </button>
            </div>
        );
    },
}));

jest.mock('../program-category-modals/DeleteCategoryModal', () => ({
    DeleteCategoryModal: (props: any) =>
        props.isOpen ? (
            <div data-testid="delete-category-modal">
                <h2>Delete Category Modal</h2>
                <p>Deleting category</p>
                <button
                    data-testid="confirm-delete-category"
                    onClick={() => {
                        props.onDeleteCategory(1); // Mock deleting category with id 1
                        props.onClose();
                    }}
                >
                    Confirm Delete Category
                </button>
                <button data-testid="close-delete-category" onClick={props.onClose}>
                    Close Delete Category
                </button>
            </div>
        ) : null,
}));

jest.mock('../../../../../components/common/category-bar/CategoryBar', () => ({
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

jest.mock('../../../../../components/common/infinite-scroll-list/InfiniteScrollList', () => ({
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
        categories: [],
        status: 'Published',
        img: null,
    },
    {
        id: 2,
        name: 'Test Program Beta',
        description: 'Another description.',
        categories: [],
        status: 'Draft',
        img: null,
    },
];

const mockNewProgram: Program = {
    id: 3,
    name: 'Test Program Gama',
    description: 'A sample description.',
    categories: [],
    status: 'Draft',
    img: null,
};

const mockProgram = mockPrograms[0];

describe('ProgramsPageContent', () => {
    const renderProgramsPageContent = () => render(<ProgramsPageContent />);

    const getProgramsPageContent = () => screen.getByTestId('programs-page-content');
    const getProgramsToolbar = () => screen.getByTestId('programs-toolbar');
    const getCategoryBar = () => screen.getByTestId('category-bar');
    const getInfiniteScrollList = () => screen.getByTestId('infinite-scroll-list');
    const getProgramItems = () => screen.getAllByTestId('program-item');
    const getEmptyState = () => screen.getByTestId('empty-state');
    const getAddProgramButton = () => screen.getByText('Add Program');
    const getEditButtons = () => screen.getAllByText('Edit');
    const getDeleteButtons = () => screen.getAllByText('Delete');
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
    const getSearchInput = () => screen.getByTestId('search-input');
    const getProgramsErrorContainer = () => screen.getByTestId('programs-error-container');
    const getTryAgainButton = () => screen.getByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN);
    const getConfirmAddButton = () => screen.getByTestId('confirm-add');
    const getConfirmEditButton = () => screen.getByTestId('confirm-edit');
    const getConfirmDeleteButton = () => screen.getByTestId('confirm-delete');
    const getConfirmAddCategoryButton = () => screen.getByTestId('confirm-add-category');
    const getConfirmEditCategoryButton = () => screen.getByTestId('confirm-edit-category');
    const getConfirmDeleteCategoryButton = () => screen.getByTestId('confirm-delete-category');
    const getCloseAddButton = () => screen.getByTestId('close-add');
    const getCloseEditButton = () => screen.getByTestId('close-edit');
    const getCloseDeleteButton = () => screen.getByTestId('close-delete');

    const clickAddProgramButton = () => fireEvent.click(getAddProgramButton());
    const clickFirstEditButton = () => fireEvent.click(getEditButtons()[0]);
    const clickFirstDeleteButton = () => fireEvent.click(getDeleteButtons()[0]);
    const clickContextMenuAddButton = () => fireEvent.click(getContextMenuAddButton());
    const clickContextMenuEditButton = () => fireEvent.click(getContextMenuEditButton());
    const clickContextMenuDeleteButton = () => fireEvent.click(getContextMenuDeleteButton());
    const clickCategoryButton = (id: number) => fireEvent.click(getCategoryButton(id));
    const clickFilterPublishedButton = () => fireEvent.click(getFilterPublishedButton());
    const clickTryAgainButton = () => fireEvent.click(getTryAgainButton());
    const clickConfirmAddButton = () => fireEvent.click(getConfirmAddButton());
    const clickConfirmEditButton = () => fireEvent.click(getConfirmEditButton());
    const clickConfirmDeleteButton = () => fireEvent.click(getConfirmDeleteButton());
    const clickConfirmAddCategoryButton = () => fireEvent.click(getConfirmAddCategoryButton());
    const clickConfirmEditCategoryButton = () => fireEvent.click(getConfirmEditCategoryButton());
    const clickConfirmDeleteCategoryButton = () => fireEvent.click(getConfirmDeleteCategoryButton());
    const clickCloseAddButton = () => fireEvent.click(getCloseAddButton());
    const clickCloseEditButton = () => fireEvent.click(getCloseEditButton());
    const clickCloseDeleteButton = () => fireEvent.click(getCloseDeleteButton());
    const typeInSearchInput = (value: string) => fireEvent.change(getSearchInput(), { target: { value } });

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

    const expectModalToBeClosed = (modal: HTMLElement | null) => {
        expect(modal).not.toBeInTheDocument();
    };

    const expectApiCallsToHaveBeenMade = () => {
        expect(mockProgramsApi.fetchProgramCategories).toHaveBeenCalledTimes(1);
        expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledWith(
            mockCategories[0].id,
            0,
            5,
            undefined,
            expect.any(Object),
        );
    };

    const expectErrorToBeDisplayed = (errorMessage: string) => {
        expect(getProgramsErrorContainer()).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockProgramsApi.fetchProgramCategories.mockResolvedValue(mockCategories);
        mockProgramsApi.fetchPrograms.mockResolvedValue({
            items: mockPrograms,
            totalItemsCount: mockPrograms.length,
        });
    });

    describe('Initial render', () => {
        it('should render all main components and fetch initial data', async () => {
            renderProgramsPageContent();

            expectMainComponentsToBeRendered();

            await waitFor(() => {
                expect(mockProgramsApi.fetchProgramCategories).toHaveBeenCalledTimes(1);
            });

            await waitFor(() => {
                expectApiCallsToHaveBeenMade();
            });

            await waitFor(() => {
                expect(getProgramItems()).toHaveLength(2);
            });
        });

        it('should show empty state when no programs are found', async () => {
            mockProgramsApi.fetchPrograms.mockResolvedValue({
                items: [],
                totalItemsCount: 0,
            });

            renderProgramsPageContent();

            await waitFor(() => {
                expectEmptyStateToBeShown();
            });
        });
    });

    describe('Program Modal interactions', () => {
        const modalTestCases = [
            {
                modalType: 'Add Program',
                triggerAction: () => clickAddProgramButton(),
                getModal: () => getAddProgramModal(),
                closeAction: () => clickCloseAddButton(),
                confirmAction: () => clickConfirmAddButton(),
                expectedTitle: 'Add Program Modal',
                expectedContent: 'Adding new program',
            },
            {
                modalType: 'Edit Program',
                triggerAction: () => clickFirstEditButton(),
                getModal: () => getEditProgramModal(),
                closeAction: () => clickCloseEditButton(),
                confirmAction: () => clickConfirmEditButton(),
                expectedTitle: 'Edit Program Modal',
                expectedContent: `Editing: ${mockProgram.name}`,
            },
            {
                modalType: 'Delete Program',
                triggerAction: () => clickFirstDeleteButton(),
                getModal: () => getDeleteProgramModal(),
                closeAction: () => clickCloseDeleteButton(),
                confirmAction: () => clickConfirmDeleteButton(),
                expectedTitle: 'Delete Program Modal',
                expectedContent: `Deleting: ${mockProgram.name}`,
            },
        ];

        describe.each(modalTestCases)(
            '$modalType Modal',
            ({ triggerAction, getModal, closeAction, confirmAction, expectedTitle, expectedContent }) => {
                it('should open and close correctly', async () => {
                    renderProgramsPageContent();
                    await waitFor(() => expect(getProgramItems()).toHaveLength(2));

                    triggerAction();
                    expectModalToBeOpen(getModal(), expectedTitle, expectedContent);

                    closeAction();
                    expectModalToBeClosed(getModal());
                });

                it('should perform the action and close modal', async () => {
                    renderProgramsPageContent();
                    await waitFor(() => expect(getProgramItems()).toHaveLength(2));

                    triggerAction();
                    confirmAction();

                    expectModalToBeClosed(getModal());
                });
            },
        );
    });

    describe('Category Modal interactions', () => {
        const categoryModalTestCases = [
            {
                modalType: 'Add Category',
                triggerAction: () => clickContextMenuAddButton(),
                getModal: () => getAddCategoryModal(),
                confirmAction: () => clickConfirmAddCategoryButton(),
                expectedTitle: 'Add Category Modal',
                expectedContent: 'Adding new category',
            },
            {
                modalType: 'Edit Category',
                triggerAction: () => clickContextMenuEditButton(),
                getModal: () => getEditCategoryModal(),
                confirmAction: () => clickConfirmEditCategoryButton(),
                expectedTitle: 'Edit Category Modal',
                expectedContent: 'Editing category',
            },
            {
                modalType: 'Delete Category',
                triggerAction: () => clickContextMenuDeleteButton(),
                getModal: () => getDeleteCategoryModal(),
                confirmAction: () => clickConfirmDeleteCategoryButton(),
                expectedTitle: 'Delete Category Modal',
                expectedContent: 'Deleting category',
            },
        ];

        describe.each(categoryModalTestCases)(
            '$modalType Modal',
            ({ triggerAction, getModal, confirmAction, expectedTitle, expectedContent }) => {
                it('should open and perform the action and close modal', async () => {
                    renderProgramsPageContent();
                    await waitFor(() => expect(getProgramItems()).toHaveLength(2));

                    triggerAction();

                    await waitFor(() => {
                        expectModalToBeOpen(getModal(), expectedTitle, expectedContent);
                    });

                    confirmAction();

                    await waitFor(() => {
                        expectModalToBeClosed(getModal());
                    });
                });
            },
        );
    });

    describe('Category selection and filtering', () => {
        it('should change programs when different category is selected', async () => {
            const categoryBPrograms = [
                {
                    id: 3,
                    name: 'Category B Program',
                    description: 'Program from category B',
                    categories: [mockCategories[1]],
                    status: 'Published' as VisibilityStatus,
                    img: null,
                },
            ];
            renderProgramsPageContent();
            await waitFor(() => expect(getProgramItems()).toHaveLength(2));

            mockProgramsApi.fetchPrograms.mockResolvedValueOnce({
                items: categoryBPrograms,
                totalItemsCount: 1,
            });
            clickCategoryButton(2);

            await waitFor(() => {
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledWith(
                    mockCategories[1].id,
                    0,
                    5,
                    undefined,
                    expect.any(Object),
                );
            });
        });

        it('should handle status filter changes', async () => {
            renderProgramsPageContent();
            await waitFor(() => expect(getProgramItems()).toHaveLength(2));

            clickFilterPublishedButton();

            await waitFor(() => {
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledWith(
                    mockCategories[0].id,
                    0,
                    5,
                    'Published',
                    expect.any(Object),
                );
            });
        });
    });

    describe('Error handling', () => {
        it('should display error when categories fail to load', async () => {
            mockProgramsApi.fetchProgramCategories.mockRejectedValueOnce(new Error('API Error'));
            renderProgramsPageContent();

            await waitFor(() => {
                expectErrorToBeDisplayed(PROGRAM_CATEGORY_TEXT.MESSAGE.FAIL_TO_FETCH_CATEGORIES);
            });

            mockProgramsApi.fetchProgramCategories.mockResolvedValueOnce(mockCategories);
            clickTryAgainButton();

            await waitFor(() => {
                expect(mockProgramsApi.fetchProgramCategories).toHaveBeenCalledTimes(2);
            });
        });

        it('should display error when programs fail to load', async () => {
            mockProgramsApi.fetchPrograms.mockRejectedValueOnce(new Error('API Error'));
            renderProgramsPageContent();

            await waitFor(() => {
                expectErrorToBeDisplayed(PROGRAMS_TEXT.MESSAGE.FAIL_TO_FETCH_PROGRAMS);
            });

            mockProgramsApi.fetchPrograms.mockResolvedValueOnce({
                items: mockPrograms,
                totalItemsCount: mockPrograms.length,
            });
            clickTryAgainButton();

            await waitFor(() => {
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('Search functionality', () => {
        it('should handle search query changes', async () => {
            renderProgramsPageContent();
            await waitFor(() => expect(getProgramItems()).toHaveLength(2));

            typeInSearchInput('test search query');
            expect(getSearchInput()).toHaveValue('test search query');
        });
    });

    describe('Empty categories handling', () => {
        it('should handle empty categories list without setting selected category', async () => {
            mockProgramsApi.fetchProgramCategories.mockResolvedValueOnce([]);

            renderProgramsPageContent();

            await waitFor(() => {
                expect(mockProgramsApi.fetchProgramCategories).toHaveBeenCalledTimes(1);
            });

            expect(getCategoryBar()).toBeInTheDocument();
            // Should not call fetchPrograms because no category is selected
            expect(mockProgramsApi.fetchPrograms).not.toHaveBeenCalled();
        });
    });

    describe('Programs fetching with null category', () => {
        it('should not fetch programs when selectedCategory is null', async () => {
            mockProgramsApi.fetchProgramCategories.mockResolvedValueOnce([]);

            renderProgramsPageContent();

            await waitFor(() => {
                expect(mockProgramsApi.fetchProgramCategories).toHaveBeenCalledTimes(1);
            });

            // Verify fetchPrograms is not called when selectedCategory is null
            expect(mockProgramsApi.fetchPrograms).not.toHaveBeenCalled();
        });
    });
});
