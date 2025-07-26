import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProgramsPageContent } from './ProgramsPageContent';
import { Program, ProgramCategory } from '../../../../../types/ProgramAdminPage';
import { VisibilityStatus } from '../../../../../types/Common';
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
                            props.onAddProgram(mockProgram);
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

// Mock data
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
        status: 'Published' as VisibilityStatus,
        img: null,
    },
    {
        id: 2,
        name: 'Test Program Beta',
        description: 'Another description.',
        categories: [],
        status: 'Draft' as VisibilityStatus,
        img: null,
    },
];

const mockProgram = mockPrograms[0];

describe('ProgramsPageContent', () => {
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
            render(<ProgramsPageContent />);

            expect(screen.getByTestId('programs-page-content')).toBeInTheDocument();
            expect(screen.getByTestId('programs-toolbar')).toBeInTheDocument();
            expect(screen.getByTestId('category-bar')).toBeInTheDocument();
            expect(screen.getByTestId('infinite-scroll-list')).toBeInTheDocument();

            await waitFor(() => {
                expect(mockProgramsApi.fetchProgramCategories).toHaveBeenCalledTimes(1);
            });

            await waitFor(() => {
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledWith(
                    mockCategories[0].id,
                    1,
                    5,
                    undefined,
                    expect.any(Object),
                );
            });

            // Check that programs are rendered
            await waitFor(() => {
                expect(screen.getAllByTestId('program-item')).toHaveLength(2);
            });
        });

        it('should show empty state when no programs are found', async () => {
            mockProgramsApi.fetchPrograms.mockResolvedValue({
                items: [],
                totalItemsCount: 0,
            });

            render(<ProgramsPageContent />);

            await waitFor(() => {
                expect(screen.getByTestId('empty-state')).toBeInTheDocument();
                expect(screen.getByText(COMMON_TEXT_ADMIN.LIST.NOT_FOUND)).toBeInTheDocument();
            });
        });
    });

    describe('Program Modal interactions', () => {
        const modalTestCases = [
            {
                modalType: 'Add Program',
                triggerAction: () => fireEvent.click(screen.getByText('Add Program')),
                modalTestId: 'add-program-modal',
                closeTestId: 'close-add',
                confirmTestId: 'confirm-add',
                expectedTitle: 'Add Program Modal',
                expectedContent: 'Adding new program',
            },
        ];

        describe.each(modalTestCases)(
            '$modalType Modal',
            ({ triggerAction, modalTestId, closeTestId, confirmTestId, expectedTitle, expectedContent }) => {
                it('should open and close correctly', async () => {
                    render(<ProgramsPageContent />);

                    // Wait for initial load
                    await waitFor(() => {
                        expect(screen.getAllByTestId('program-item')).toHaveLength(2);
                    });

                    // Open modal
                    triggerAction();
                    expect(screen.getByTestId(modalTestId)).toBeInTheDocument();
                    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
                    expect(screen.getByText(expectedContent)).toBeInTheDocument();

                    // Close modal
                    fireEvent.click(screen.getByTestId(closeTestId));
                    expect(screen.queryByTestId(modalTestId)).not.toBeInTheDocument();
                });

                it('should perform the action and close modal', async () => {
                    render(<ProgramsPageContent />);

                    await waitFor(() => {
                        expect(screen.getAllByTestId('program-item')).toHaveLength(2);
                    });

                    triggerAction();
                    fireEvent.click(screen.getByTestId(confirmTestId));

                    // Modal should close
                    expect(screen.queryByTestId(modalTestId)).not.toBeInTheDocument();

                    // Programs should be updated (new program added at the beginning)
                    await waitFor(() => {
                        expect(screen.getAllByTestId('program-item')).toHaveLength(3);
                    });
                });
            },
        );

        it('should handle edit program modal', async () => {
            render(<ProgramsPageContent />);

            await waitFor(() => {
                expect(screen.getAllByTestId('program-item')).toHaveLength(2);
            });

            // Click edit on first program
            const editButtons = screen.getAllByText('Edit');
            fireEvent.click(editButtons[0]);

            expect(screen.getByTestId('edit-program-modal')).toBeInTheDocument();
            expect(screen.getByText('Edit Program Modal')).toBeInTheDocument();
            expect(screen.getByText(`Editing: ${mockProgram.name}`)).toBeInTheDocument();

            // Confirm edit
            fireEvent.click(screen.getByTestId('confirm-edit'));

            expect(screen.queryByTestId('edit-program-modal')).not.toBeInTheDocument();
        });

        it('should handle delete program modal', async () => {
            render(<ProgramsPageContent />);

            await waitFor(() => {
                expect(screen.getAllByTestId('program-item')).toHaveLength(2);
            });

            // Click delete on first program
            const deleteButtons = screen.getAllByText('Delete');
            fireEvent.click(deleteButtons[0]);

            expect(screen.getByTestId('delete-program-modal')).toBeInTheDocument();
            expect(screen.getByText('Delete Program Modal')).toBeInTheDocument();
            expect(screen.getByText(`Deleting: ${mockProgram.name}`)).toBeInTheDocument();

            // Confirm delete
            fireEvent.click(screen.getByTestId('confirm-delete'));

            expect(screen.queryByTestId('delete-program-modal')).not.toBeInTheDocument();

            // Program should be removed
            await waitFor(() => {
                expect(screen.getAllByTestId('program-item')).toHaveLength(1);
            });
        });
    });

    describe('Category Modal interactions', () => {
        const categoryModalTestCases = [
            {
                modalType: 'Add Category',
                triggerAction: () => fireEvent.click(screen.getByTestId('context-menu-add')),
                modalTestId: 'add-category-modal',
                closeTestId: 'close-add-category',
                confirmTestId: 'confirm-add-category',
                expectedTitle: 'Add Category Modal',
                expectedContent: 'Adding new category',
            },
            {
                modalType: 'Edit Category',
                triggerAction: () => fireEvent.click(screen.getByTestId('context-menu-edit')),
                modalTestId: 'edit-category-modal',
                closeTestId: 'close-edit-category',
                confirmTestId: 'confirm-edit-category',
                expectedTitle: 'Edit Category Modal',
                expectedContent: 'Editing category',
            },
            {
                modalType: 'Delete Category',
                triggerAction: () => fireEvent.click(screen.getByTestId('context-menu-delete')),
                modalTestId: 'delete-category-modal',
                closeTestId: 'close-delete-category',
                confirmTestId: 'confirm-delete-category',
                expectedTitle: 'Delete Category Modal',
                expectedContent: 'Deleting category',
            },
        ];

        describe.each(categoryModalTestCases)(
            '$modalType Modal',
            ({ modalType, triggerAction, modalTestId, closeTestId, confirmTestId, expectedTitle, expectedContent }) => {
                it('should open and close correctly', async () => {
                    render(<ProgramsPageContent />);

                    // Wait for initial load
                    await waitFor(() => {
                        expect(screen.getAllByTestId('program-item')).toHaveLength(2);
                    });

                    // Open modal
                    triggerAction();
                    expect(screen.getByTestId(modalTestId)).toBeInTheDocument();
                    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
                    expect(screen.getByText(expectedContent)).toBeInTheDocument();

                    // Close modal
                    fireEvent.click(screen.getByTestId(closeTestId));
                    expect(screen.queryByTestId(modalTestId)).not.toBeInTheDocument();
                });

                it('should perform the action and close modal', async () => {
                    render(<ProgramsPageContent />);

                    await waitFor(() => {
                        expect(screen.getAllByTestId('program-item')).toHaveLength(2);
                    });

                    triggerAction();
                    fireEvent.click(screen.getByTestId(confirmTestId));

                    // Modal should close
                    expect(screen.queryByTestId(modalTestId)).not.toBeInTheDocument();
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

            render(<ProgramsPageContent />);

            // Wait for initial load
            await waitFor(() => {
                expect(screen.getAllByTestId('program-item')).toHaveLength(2);
            });

            // Mock programs for category B
            mockProgramsApi.fetchPrograms.mockResolvedValueOnce({
                items: categoryBPrograms,
                totalItemsCount: 1,
            });

            // Click on category B
            fireEvent.click(screen.getByTestId('category-2'));

            await waitFor(() => {
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledWith(
                    mockCategories[1].id,
                    1,
                    5,
                    undefined,
                    expect.any(Object),
                );
            });
        });

        it('should handle status filter changes', async () => {
            render(<ProgramsPageContent />);

            await waitFor(() => {
                expect(screen.getAllByTestId('program-item')).toHaveLength(2);
            });

            // Change status filter
            fireEvent.click(screen.getByText('Filter Published'));

            await waitFor(() => {
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledWith(
                    mockCategories[0].id,
                    1,
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

            render(<ProgramsPageContent />);

            await waitFor(() => {
                expect(screen.getByTestId('programs-error-container')).toBeInTheDocument();
                expect(screen.getByText(PROGRAM_CATEGORY_TEXT.MESSAGE.FAIL_TO_FETCH_CATEGORIES)).toBeInTheDocument();
            });

            // Test retry functionality
            mockProgramsApi.fetchProgramCategories.mockResolvedValueOnce(mockCategories);
            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN));

            await waitFor(() => {
                expect(mockProgramsApi.fetchProgramCategories).toHaveBeenCalledTimes(2);
            });
        });

        it('should display error when programs fail to load', async () => {
            mockProgramsApi.fetchPrograms.mockRejectedValueOnce(new Error('API Error'));

            render(<ProgramsPageContent />);

            await waitFor(() => {
                expect(screen.getByTestId('programs-error-container')).toBeInTheDocument();
                expect(screen.getByText(PROGRAMS_TEXT.MESSAGE.FAIL_TO_FETCH_PROGRAMS)).toBeInTheDocument();
            });

            // Test retry functionality
            mockProgramsApi.fetchPrograms.mockResolvedValueOnce({
                items: mockPrograms,
                totalItemsCount: mockPrograms.length,
            });
            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN));

            await waitFor(() => {
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('Search functionality', () => {
        it('should handle search query changes', async () => {
            render(<ProgramsPageContent />);

            await waitFor(() => {
                expect(screen.getAllByTestId('program-item')).toHaveLength(2);
            });

            const searchInput = screen.getByTestId('search-input');
            fireEvent.change(searchInput, { target: { value: 'test search query' } });

            expect(searchInput).toHaveValue('test search query');
        });
    });
});
