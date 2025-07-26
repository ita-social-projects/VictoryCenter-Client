import React, { createRef } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ProgramsList, ProgramsListProps, ProgramListRef } from './ProgramsList';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import { Program, ProgramCategory } from '../../../../../types/ProgramAdminPage';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { PROGRAM_CATEGORY_TEXT, PROGRAMS_TEXT } from '../../../../../const/admin/programs';

jest.mock('../../../../../services/api/admin/programs/programs-api');
const mockProgramsApi = ProgramsApi as jest.Mocked<typeof ProgramsApi>;

jest.mock('../program-list-item/ProgramListItem', () => ({
    ProgramListItem: ({ program }: { program: Program }) => (
        <div data-testid="program-list-item">
            <span>{program.name}</span>
        </div>
    ),
}));

jest.mock('../program-category-modals/DeleteCategoryModal', () => ({
    DeleteCategoryModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="delete-category-modal" /> : null,
}));

jest.mock('../program-category-modals/ProgramCategoryModal', () => ({
    ProgramCategoryModal: ({ isOpen, mode }: { isOpen: boolean; mode: 'add' | 'edit' }) =>
        isOpen ? <div data-testid={`program-category-modal-${mode}`} /> : null,
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
                Add
            </button>
            <button data-testid="context-menu-edit" onClick={() => onContextMenuOptionSelected('edit')}>
                Edit
            </button>
            <button data-testid="context-menu-delete" onClick={() => onContextMenuOptionSelected('delete')}>
                Delete
            </button>
        </div>
    ),
}));

jest.mock('../../../../../assets/icons/load.svg', () => 'LoaderIcon');
jest.mock('../../../../../assets/icons/arrow-up.svg', () => 'ArrowUpIcon');
jest.mock('../../../../../assets/icons/not-found.svg', () => 'NotFoundIcon');

const mockCategories: ProgramCategory[] = [
    { id: 1, name: 'Category A', programsCount: 2 },
    { id: 2, name: 'Category B', programsCount: 1 },
];

const mockProgramsPage1: Program[] = [
    {
        id: 101,
        name: 'Program 1',
        description: 'Desc 1',
        categories: [mockCategories[0]],
        status: 'Published',
        img: null,
    },
    { id: 102, name: 'Program 2', description: 'Desc 2', categories: [mockCategories[0]], status: 'Draft', img: null },
];

const mockProgramsPage2: Program[] = [
    {
        id: 103,
        name: 'Program 3',
        description: 'Desc 3',
        categories: [mockCategories[0]],
        status: 'Published',
        img: null,
    },
];

describe('ProgramsList', () => {
    const onEditProgram = jest.fn();
    const onDeleteProgram = jest.fn();

    const defaultProps: ProgramsListProps = {
        searchByStatus: undefined,
        onEditProgram,
        onDeleteProgram,
    };

    const renderProgramsList = (props: Partial<ProgramsListProps> = {}, ref?: React.Ref<ProgramListRef>) => {
        return render(<ProgramsList {...defaultProps} {...props} ref={ref} />);
    };

    const getProgramsListContainer = () => screen.getByTestId('programs-list');
    const getLoader = () => screen.queryByTestId('programs-list-loader');
    const getNotFoundMessage = () => screen.queryByText(COMMON_TEXT_ADMIN.LIST.NOT_FOUND);
    const getErrorContainer = () => screen.queryByTestId('programs-error-container');
    const getRetryButton = () => screen.queryByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN);
    const getMoveToTopButton = () => screen.queryByTestId('programs-list-list-to-top');
    const getProgramItems = () => screen.queryAllByTestId('program-list-item');

    beforeEach(() => {
        jest.clearAllMocks();
        mockProgramsApi.fetchProgramCategories.mockResolvedValue(mockCategories);
        mockProgramsApi.fetchPrograms.mockResolvedValue({ items: mockProgramsPage1, totalItemsCount: 3 });
    });

    describe('Initial Render and Data Fetch', () => {
        it('should show loader, fetch categories, then fetch and display programs for the first category', async () => {
            renderProgramsList();

            expect(getLoader()).toBeInTheDocument();

            await waitFor(() => {
                expect(mockProgramsApi.fetchProgramCategories).toHaveBeenCalledTimes(1);
            });

            await waitFor(() => {
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledTimes(1);
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledWith(
                    mockCategories[0].id,
                    1,
                    5,
                    undefined,
                    expect.any(Object),
                );
            });

            await waitFor(() => {
                expect(getLoader()).not.toBeInTheDocument();
                expect(getProgramItems()).toHaveLength(2);
                expect(screen.getByText('Program 1')).toBeInTheDocument();
            });

            expect(getNotFoundMessage()).not.toBeInTheDocument();
            expect(getErrorContainer()).not.toBeInTheDocument();
        });

        it('should display "not found" message when no programs are returned', async () => {
            mockProgramsApi.fetchPrograms.mockResolvedValue({ items: [], totalItemsCount: 0 });
            renderProgramsList();

            await waitFor(() => {
                expect(getNotFoundMessage()).toBeInTheDocument();
            });
            expect(getProgramItems()).toHaveLength(0);
            expect(getLoader()).not.toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should display an error if fetching categories fails and allow retrying', async () => {
            mockProgramsApi.fetchProgramCategories.mockRejectedValueOnce(new Error('API Error'));
            renderProgramsList();

            await waitFor(() => {
                expect(getErrorContainer()).toBeInTheDocument();
                expect(screen.getByText(PROGRAM_CATEGORY_TEXT.MESSAGE.FAIL_TO_FETCH_CATEGORIES)).toBeInTheDocument();
            });

            expect(mockProgramsApi.fetchPrograms).not.toHaveBeenCalled();

            // Setup for successful retry
            mockProgramsApi.fetchProgramCategories.mockResolvedValue(mockCategories);
            fireEvent.click(getRetryButton()!);

            await waitFor(() => {
                expect(mockProgramsApi.fetchProgramCategories).toHaveBeenCalledTimes(2);
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledTimes(1);
                expect(getProgramItems()).toHaveLength(2);
            });
            expect(getErrorContainer()).not.toBeInTheDocument();
        });

        it('should display an error if fetching programs fails and allow retrying', async () => {
            mockProgramsApi.fetchPrograms.mockRejectedValueOnce(new Error('API Error'));
            renderProgramsList();

            await waitFor(() => {
                expect(getErrorContainer()).toBeInTheDocument();
                expect(screen.getByText(PROGRAMS_TEXT.MESSAGE.FAIL_TO_FETCH_PROGRAMS)).toBeInTheDocument();
            });

            // Setup for successful retry
            mockProgramsApi.fetchPrograms.mockResolvedValue({ items: mockProgramsPage1, totalItemsCount: 2 });
            fireEvent.click(getRetryButton()!);

            await waitFor(() => {
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledTimes(2);
                expect(getProgramItems()).toHaveLength(2);
            });
            expect(getErrorContainer()).not.toBeInTheDocument();
        });
    });

    describe('User Interactions', () => {
        it('should fetch new programs when a different category is selected', async () => {
            renderProgramsList();
            await waitFor(() => expect(getProgramItems()).toHaveLength(2));

            expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledTimes(1);
            expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledWith(
                mockCategories[0].id,
                1,
                5,
                undefined,
                expect.any(Object),
            );

            const categoryBButton = screen.getByTestId('category-2');
            fireEvent.click(categoryBButton);

            await waitFor(() => {
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledTimes(2);
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledWith(
                    mockCategories[1].id,
                    1,
                    5,
                    undefined,
                    expect.any(Object),
                );
            });
        });

        it('should fetch more programs on scroll to bottom', async () => {
            renderProgramsList();
            await waitFor(() => expect(getProgramItems()).toHaveLength(2));

            mockProgramsApi.fetchPrograms.mockResolvedValue({ items: mockProgramsPage2, totalItemsCount: 3 });

            const listContainer = getProgramsListContainer();
            // Simulate scrolling to the bottom
            fireEvent.scroll(listContainer, { target: { scrollY: 1000 } });

            await waitFor(() => {
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledTimes(2);
                expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledWith(
                    mockCategories[0].id,
                    2,
                    5,
                    undefined,
                    expect.any(Object),
                );
            });

            await waitFor(() => {
                expect(getProgramItems()).toHaveLength(3); // 2 initial + 1 new
                expect(screen.getByText('Program 3')).toBeInTheDocument();
            });
        });

        it('should show "move to top" button on scroll and hide it when at top', async () => {
            renderProgramsList();
            await waitFor(() => expect(getProgramItems()).toHaveLength(2));

            const listContainer = getProgramsListContainer();
            expect(getMoveToTopButton()).not.toBeInTheDocument();

            // Scroll down
            fireEvent.scroll(listContainer, { target: { scrollTop: 100 } });

            await waitFor(() => {
                expect(getMoveToTopButton()).toBeInTheDocument();
            });

            // Scroll back to top
            fireEvent.scroll(listContainer, { target: { scrollTop: 0 } });

            await waitFor(() => {
                expect(getMoveToTopButton()).not.toBeInTheDocument();
            });
        });

        it('should scroll list to top when "move to top" button is clicked', async () => {
            renderProgramsList();
            await waitFor(() => expect(getProgramItems()).toHaveLength(2));

            const listContainer = getProgramsListContainer();
            // Show the button
            fireEvent.scroll(listContainer, { target: { scrollTop: 100 } });
            const moveToTopBtn = await screen.findByTestId('programs-list-list-to-top');

            listContainer.scrollTop = 150;
            fireEvent.click(moveToTopBtn);
            expect(listContainer.scrollTop).toBe(0);
        });
    });

    describe('Imperative Handle Methods', () => {
        const ref = createRef<ProgramListRef>();

        it('should add a program to the top of the list via addProgram', async () => {
            renderProgramsList({}, ref);
            await waitFor(() => expect(getProgramItems()).toHaveLength(2));

            const newProgram: Program = {
                id: 999,
                name: 'New Added Program',
                description: '',
                categories: [],
                status: 'Draft',
                img: null,
            };

            act(() => {
                ref.current?.addProgram(newProgram);
            });

            await waitFor(() => {
                const items = getProgramItems();
                expect(items).toHaveLength(3);
                expect(items[0]).toHaveTextContent('New Added Program');
            });
        });

        it('should edit an existing program via editProgram', async () => {
            renderProgramsList({}, ref);
            await screen.findByText('Program 1');

            const editedProgram: Program = { ...mockProgramsPage1[0], name: 'Edited Program 1' };

            act(() => {
                ref.current?.editProgram(editedProgram);
            });

            await waitFor(() => {
                expect(screen.queryByText('Program 1')).not.toBeInTheDocument();
                expect(screen.getByText('Edited Program 1')).toBeInTheDocument();
            });
        });

        it('should delete a program from the list via deleteProgram', async () => {
            renderProgramsList({}, ref);
            await waitFor(() => expect(getProgramItems()).toHaveLength(2));

            act(() => {
                ref.current?.deleteProgram(mockProgramsPage1[0]);
            });

            await waitFor(() => {
                expect(getProgramItems()).toHaveLength(1);
                expect(screen.queryByText('Program 1')).not.toBeInTheDocument();
                expect(screen.getByText('Program 2')).toBeInTheDocument();
            });
        });

        it('should replace all programs via setPrograms', async () => {
            renderProgramsList({}, ref);
            await waitFor(() => expect(getProgramItems()).toHaveLength(2));

            const newPrograms: Program[] = [
                { id: 801, name: 'Replaced 1', description: '', categories: [], status: 'Published', img: null },
            ];

            act(() => {
                ref.current?.setPrograms(newPrograms);
            });

            await waitFor(() => {
                const items = getProgramItems();
                expect(items).toHaveLength(1);
                expect(items[0]).toHaveTextContent('Replaced 1');
                expect(screen.queryByText('Program 1')).not.toBeInTheDocument();
            });
        });
    });

    describe('Category Context Menu', () => {
        it.each([
            {
                action: 'add',
                buttonTestId: 'context-menu-add',
                modalTestId: 'program-category-modal-add',
            },
            {
                action: 'edit',
                buttonTestId: 'context-menu-edit',
                modalTestId: 'program-category-modal-edit',
            },
            {
                action: 'delete',
                buttonTestId: 'context-menu-delete',
                modalTestId: 'delete-category-modal',
            },
        ])(
            'should open the $action category modal when its button is clicked',
            async ({ buttonTestId, modalTestId }) => {
                renderProgramsList();
                await waitFor(() => expect(getProgramItems()).toHaveLength(2));
                expect(screen.queryByTestId(modalTestId)).not.toBeInTheDocument();
                fireEvent.click(screen.getByTestId(buttonTestId));
                expect(screen.getByTestId(modalTestId)).toBeInTheDocument();
            },
        );
    });
});
