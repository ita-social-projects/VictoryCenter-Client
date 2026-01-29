import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgramsPageContent } from './ProgramsPageContent';
import { Program, ProgramCategory } from '@/types/admin/programs';
import { VisibilityStatus } from '@/types/admin/common';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { ProgramsApi, ProgramsCategoriesApi } from '@/services/api/admin/programs/programs-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { ProgramsPageModalsProps } from '@/pages/admin/programs/components/programs-page-modals/ProgramsPageModals';
import { InfiniteScrollListProps } from '@/components/admin/infinite-scroll-list/InfiniteScrollList';
import { ProgramListItemProps } from '@/pages/admin/programs/components/program-list-item/ProgramListItem';
import { AdminPanelToolbarProps } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit', () => ({
    useLocalizationToolkit: () => ({
        allLanguages: [
            { id: 1, code: 'uk', name: 'Українська' },
            { id: 2, code: 'en', name: 'Англійська' },
        ],
        onLanguageChange: jest.fn(),
        onTranslationStatusFilterChange: jest.fn(),
        translationLanguages: [{ id: 1, code: 'en', name: 'Англійська' }],
        language: { id: 1, code: 'uk', name: 'Українська' },
    }),
}));

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: () => ({
        addToast: jest.fn(),
        removeToast: jest.fn(),
        toasts: [],
    }),
    ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/services/api/admin/programs/programs-api', () => ({
    ProgramsApi: {
        fetchProgramCategories: jest.fn(),
        fetchPrograms: jest.fn(),
        fetchProgramById: jest.fn(),
        fetchProgramSearchItems: jest.fn(),
    },
    ProgramsCategoriesApi: {
        fetchProgramCategories: jest.fn(),
        deleteProgramCategory: jest.fn(),
    },
}));

jest.mock('@/hooks/admin/use-modals-state/useModalsState', () => ({
    __esModule: true,
    useModalsState: jest.fn(),
}));

jest.mock('@/components/admin/admin-panel-toolbar/AdminPageToolbar', () => ({
    AdminPanelToolbar: ({
        onSearchClear,
        onStatusFilterChange,
        onAddItem,
        AddItemButtonText,
        onSuggestionSelect,
        fetchSearchItems,
    }: AdminPanelToolbarProps<any>) => (
        <div data-testid="programs-toolbar">
            <button data-testid="select-program" onClick={() => onSuggestionSelect(1)}>
                Select Program
            </button>
            <button data-testid="select-program-string" onClick={() => onSuggestionSelect('1')}>
                Select Program String
            </button>
            <button
                data-testid="trigger-fetch-search-items"
                onClick={() =>
                    fetchSearchItems('abc', {
                        offset: 0,
                        limit: 5,
                        requestOptions: { cancellationSignal: { aborted: false } as any },
                    })
                }
            >
                Trigger Fetch Search Items
            </button>
            <button data-testid="clear-search" onClick={onSearchClear}>
                Clear Search
            </button>
            <button onClick={() => onStatusFilterChange(1)}>Filter Published</button>
            <button data-testid="add-item-button" onClick={onAddItem}>
                {AddItemButtonText}
            </button>
        </div>
    ),
}));

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({ categories, selectedCategory, onCategorySelect, onContextMenuOptionSelected }: any) => (
        <div data-testid="category-bar">
            {categories.map((cat: any) => (
                <button
                    key={cat.id}
                    data-testid={`category-${cat.id}`}
                    onClick={() => onCategorySelect(cat)}
                    disabled={selectedCategory?.id === cat.id}
                >
                    {cat.name}
                </button>
            ))}
            <button data-testid="ctx-add" onClick={() => onContextMenuOptionSelected!('add')}>
                Add Category
            </button>
            <button data-testid="ctx-edit" onClick={() => onContextMenuOptionSelected!('edit')}>
                Edit Category
            </button>
            <button data-testid="ctx-delete" onClick={() => onContextMenuOptionSelected!('delete')}>
                Delete Category
            </button>
        </div>
    ),
}));

jest.mock('@/components/admin/infinite-scroll-list/InfiniteScrollList', () => ({
    InfiniteScrollList: ({
        items,
        renderItem,
        isLoading,
        hasMore,
        onLoadMore,
        emptyStateMessage,
    }: InfiniteScrollListProps<Program>) => (
        <div data-testid="infinite-scroll-list">
            {isLoading && <div data-testid="loader">Loading</div>}
            {!isLoading && items.length === 0 && <div data-testid="empty">{emptyStateMessage}</div>}
            {items.map((item) => (
                <div key={item.id} data-testid="program-item">
                    {renderItem(item)}
                </div>
            ))}
            {!isLoading && hasMore && <button data-testid="load-more" onClick={onLoadMore} />}
        </div>
    ),
}));

jest.mock('../program-list-item/ProgramListItem', () => ({
    ProgramListItem: ({ program, handleOnEditProgram, handleOnDeleteProgram }: ProgramListItemProps) => (
        <div>
            <span>{program.name}</span>
            <button data-testid="edit-program" onClick={() => handleOnEditProgram(program)} />
            <button data-testid="delete-program" onClick={() => handleOnDeleteProgram(program)} />
        </div>
    ),
}));

jest.mock('../programs-page-modals/ProgramsPageModals', () => {
    const { VisibilityStatus } = require('@/types/admin/common');
    return {
        ProgramsPageModals: (props: ProgramsPageModalsProps) => (
            <div data-testid="programs-modals">
                <button
                    data-testid="trigger-add"
                    onClick={() =>
                        props.onAddProgram({
                            id: 999,
                            name: 'New Program',
                            description: 'New Description',
                            meetingsCount: '123',
                            participantsCount: '123',
                            location: 'New Location',
                            previewImage: null,
                            backgroundImage: null,
                            status: VisibilityStatus.Published,
                            sections: [],
                            categories: [{ id: 1, name: 'Category A', programsCount: 2 }],
                            slug: 'new-program',
                        })
                    }
                />
                <button
                    data-testid="trigger-add-draft"
                    onClick={() =>
                        props.onAddProgram({
                            id: 998,
                            name: 'Draft Program',
                            description: 'Draft Description',
                            meetingsCount: '1',
                            participantsCount: '1',
                            location: 'Draft Location',
                            previewImage: null,
                            backgroundImage: null,
                            status: VisibilityStatus.Draft,
                            sections: [],
                            categories: [{ id: 1, name: 'Category A', programsCount: 2 }],
                            slug: 'draft-program',
                        })
                    }
                />
                <button
                    data-testid="trigger-edit"
                    onClick={() =>
                        props.onEditProgram({
                            id: 10,
                            name: 'Alpha Edited',
                            description: 'Edited Description',
                            meetingsCount: '1234',
                            participantsCount: '1234',
                            location: 'Edited Location',
                            previewImage: null,
                            backgroundImage: null,
                            status: VisibilityStatus.Published,
                            sections: [],
                            categories: [{ id: 2, name: 'Category B', programsCount: 1 }],
                            slug: 'alpha-edited',
                        })
                    }
                />
                <button
                    data-testid="trigger-edit-in-category-with-images"
                    onClick={() => {
                        const p = {
                            id: 10,
                            name: 'Alpha Edited With Images',
                            description: 'Edited Description',
                            meetingsCount: '1234',
                            participantsCount: '1234',
                            location: 'Edited Location',
                            previewImage: { url: 'http://example.com/p.png', mimeType: 'image/png', id: 1 },
                            backgroundImage: { url: 'http://example.com/b.png', mimeType: 'image/png', id: 2 },
                            status: VisibilityStatus.Published,
                            sections: [],
                            categories: [{ id: 1, name: 'Category A', programsCount: 2 }],
                            slug: 'alpha-edited-with-images',
                        } as any;
                        (globalThis as any).__lastEditedProgram = p;
                        props.onEditProgram(p);
                    }}
                />
                <button
                    data-testid="trigger-edit-search"
                    onClick={() =>
                        props.onEditProgram({
                            id: 10,
                            name: 'Alpha Search Edited',
                            description: 'Edited Description',
                            meetingsCount: '1234',
                            participantsCount: '1234',
                            location: 'Edited Location',
                            previewImage: null,
                            backgroundImage: null,
                            status: VisibilityStatus.Published,
                            sections: [],
                            categories: [{ id: 1, name: 'Category A', programsCount: 2 }],
                            slug: 'alpha-search-edited',
                        })
                    }
                />
                <button
                    data-testid="trigger-edit-unknown"
                    onClick={() =>
                        props.onEditProgram({
                            id: 777,
                            name: 'Unknown Edited',
                            description: 'Edited Description',
                            meetingsCount: '1',
                            participantsCount: '1',
                            location: 'Edited Location',
                            previewImage: null,
                            backgroundImage: null,
                            status: VisibilityStatus.Published,
                            sections: [],
                            categories: [{ id: 1, name: 'Category A', programsCount: 2 }],
                            slug: 'unknown-edited',
                        })
                    }
                />
                <button
                    data-testid="trigger-delete"
                    onClick={() =>
                        props.onDeleteProgram({
                            id: 10,
                            name: 'Alpha',
                            description: 'Description',
                            meetingsCount: '12',
                            participantsCount: '12',
                            location: 'DeletedLocation',
                            previewImage: null,
                            backgroundImage: null,
                            status: VisibilityStatus.Published,
                            sections: [],
                            categories: [{ id: 1, name: 'Category A', programsCount: 2 }],
                            slug: 'alpha',
                        })
                    }
                />

                <button
                    data-testid="trigger-add-category"
                    onClick={() => props.onAddCategory({ id: 3, name: 'Category C', programsCount: 0 })}
                />
                <button
                    data-testid="trigger-edit-category"
                    onClick={() => props.onEditCategory({ id: 2, name: 'Category B Updated', programsCount: 1 })}
                />
                <button data-testid="trigger-delete-category" onClick={() => props.onDeleteCategory(1)} />
            </div>
        ),
    };
});

const mockUseModalsState = require('@/hooks/admin/use-modals-state/useModalsState');
const mockProgramsApi = ProgramsApi as jest.Mocked<typeof ProgramsApi>;
const mockProgramsCategoriesApi = ProgramsCategoriesApi as jest.Mocked<typeof ProgramsCategoriesApi>;

const mockedUseAdminClient = useAdminClient as jest.Mock;

beforeEach(() => {
    mockedUseAdminClient.mockReturnValue({
        client: {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
        },
    });
});

const mockCategories: ProgramCategory[] = [
    { id: 1, name: 'Category A', programsCount: 2 },
    { id: 2, name: 'Category B', programsCount: 1 },
];

const mockPrograms: Program[] = [
    {
        id: 10,
        name: 'Alpha',
        description: 'Description',
        location: 'So? Uhm yeah',
        participantsCount: 'I must add some test data',
        meetingsCount: 'To do list is not meeting count',
        previewImage: null,
        backgroundImage: null,
        status: VisibilityStatus.Published,
        sections: [],
        categories: [mockCategories[0]],
        slug: 'alpha',
    },
    {
        id: 11,
        name: 'Beta',
        description: 'Description',
        location: 'So? Uhm yeah',
        participantsCount: 'I must add some test data',
        meetingsCount: 'To do list is not meeting count',
        previewImage: null,
        backgroundImage: null,
        status: VisibilityStatus.Draft,
        sections: [],
        categories: [mockCategories[0]],
        slug: 'beta',
    },
];

describe('ProgramsPageContent', () => {
    let openActions: any;
    let closeActions: any;

    beforeEach(() => {
        jest.clearAllMocks();

        openActions = {
            openAddItemModal: jest.fn(),
            openEditItemModal: jest.fn(),
            openDeleteItemModal: jest.fn(),
            openAddCategoryModal: jest.fn(),
            openEditCategoryModal: jest.fn(),
            openDeleteCategoryModal: jest.fn(),
        };
        closeActions = {
            closeAddItemModal: jest.fn(),
            closeEditItemModal: jest.fn(),
            closeDeleteItemModal: jest.fn(),
            closeAddCategoryModal: jest.fn(),
            closeEditCategoryModal: jest.fn(),
            closeDeleteCategoryModal: jest.fn(),
        };

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
            openModalActions: openActions,
            closeModalActions: closeActions,
        });

        (globalThis as any).__lastEditedProgram = undefined;

        mockProgramsCategoriesApi.fetchProgramCategories.mockResolvedValue(mockCategories);
        mockProgramsApi.fetchPrograms.mockResolvedValue({
            items: mockPrograms,
            totalItemsCount: mockPrograms.length,
        });
        mockProgramsApi.fetchProgramById.mockResolvedValue(mockPrograms[0]);
        mockProgramsApi.fetchProgramSearchItems.mockResolvedValue({ items: [], totalItemsCount: 0 });
    });

    it('renders main sections and program items', async () => {
        render(<ProgramsPageContent />);

        expect(screen.getByTestId('programs-toolbar')).toBeInTheDocument();
        expect(screen.getByTestId('category-bar')).toBeInTheDocument();
        expect(screen.getByTestId('infinite-scroll-list')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
        });
    });

    it('shows empty state when no programs', async () => {
        mockProgramsApi.fetchPrograms.mockResolvedValue({
            items: [],
            totalItemsCount: 0,
        });

        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('empty')).toBeInTheDocument();
            expect(screen.getByText(COMMON_TEXT_ADMIN.LIST.NOT_FOUND)).toBeInTheDocument();
        });
    });

    it('displays categories fetch error and retries', async () => {
        mockProgramsCategoriesApi.fetchProgramCategories.mockRejectedValue(new Error('Categories fetch failed'));

        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.MESSAGE.FAIL_TO_FETCH_CATEGORIES)).toBeInTheDocument();
            expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN)).toBeInTheDocument();
        });

        mockProgramsCategoriesApi.fetchProgramCategories.mockResolvedValue(mockCategories);

        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN));

        await waitFor(() => {
            expect(mockProgramsCategoriesApi.fetchProgramCategories).toHaveBeenCalledTimes(2);
        });
    });

    it('switches to search view on program select (number or string) and clears on request', async () => {
        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
        });

        fireEvent.click(screen.getByTestId('select-program'));

        await waitFor(() => {
            expect(mockProgramsApi.fetchProgramById).toHaveBeenCalledTimes(1);
            expect(mockProgramsApi.fetchProgramById).toHaveBeenNthCalledWith(1, 1, expect.any(Object));
            expect(screen.getAllByTestId('program-item')).toHaveLength(1);
            expect(screen.getByText('Alpha')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('clear-search'));

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
        });

        fireEvent.click(screen.getByTestId('select-program-string'));

        await waitFor(() => {
            expect(mockProgramsApi.fetchProgramById).toHaveBeenCalledTimes(2);
            expect(mockProgramsApi.fetchProgramById).toHaveBeenNthCalledWith(2, 1, expect.any(Object));
            expect(screen.getAllByTestId('program-item')).toHaveLength(1);
        });

        fireEvent.click(screen.getByTestId('clear-search'));

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
        });
    });

    it('resets search state on status filter change', async () => {
        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
        });

        fireEvent.click(screen.getByTestId('select-program'));

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(1);
        });

        fireEvent.click(screen.getByText('Filter Published'));

        await waitFor(() => {
            expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledWith(
                expect.any(Object),
                1,
                0,
                5,
                VisibilityStatus.Published,
            );
        });
    });

    it('handles add/edit/delete program via modal callbacks', async () => {
        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
        });

        fireEvent.click(screen.getByTestId('trigger-add'));
        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(3);
            expect(screen.getByText('New Program')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('trigger-edit'));
        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
            expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
            expect(screen.queryByText('Alpha Edited')).not.toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('trigger-delete'));
        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
        });
    });

    it('opens category modals from context menu', async () => {
        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('category-bar')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('ctx-add'));
        expect(openActions.openAddCategoryModal).toHaveBeenCalled();

        fireEvent.click(screen.getByTestId('ctx-edit'));
        expect(openActions.openEditCategoryModal).toHaveBeenCalled();

        fireEvent.click(screen.getByTestId('ctx-delete'));
        expect(openActions.openDeleteCategoryModal).toHaveBeenCalled();
    });

    it('shows loader when data is loading', async () => {
        mockProgramsCategoriesApi.fetchProgramCategories.mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(mockCategories), 100)),
        );

        render(<ProgramsPageContent />);

        expect(screen.getByTestId('loader')).toBeInTheDocument();

        await waitFor(
            () => {
                expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
            },
            { timeout: 200 },
        );
    });

    it('handles empty categories: still renders bar and empty state for programs', async () => {
        mockProgramsCategoriesApi.fetchProgramCategories.mockResolvedValue([]);
        mockProgramsApi.fetchPrograms.mockResolvedValue({
            items: [],
            totalItemsCount: 0,
        });

        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('category-bar')).toBeInTheDocument();
            expect(screen.getByTestId('empty')).toBeInTheDocument();
        });
    });

    it('displays programs fetch error and retries', async () => {
        mockProgramsApi.fetchPrograms.mockRejectedValue(new Error('Programs fetch failed'));

        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getByText(PROGRAMS_TEXT.MESSAGE.FAIL_TO_FETCH_PROGRAMS)).toBeInTheDocument();
            expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN)).toBeInTheDocument();
        });

        mockProgramsApi.fetchPrograms.mockResolvedValue({
            items: mockPrograms,
            totalItemsCount: mockPrograms.length,
        });

        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN));

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
        });
    });

    it('handles no selected category in getFilteredPrograms', async () => {
        mockProgramsCategoriesApi.fetchProgramCategories.mockResolvedValue([]);

        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('empty')).toBeInTheDocument();
        });
    });

    it('handles no searchProgramId in getSearchedProgram', async () => {
        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
        });

        fireEvent.click(screen.getByTestId('select-program'));
        fireEvent.click(screen.getByTestId('clear-search'));

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
        });
    });

    it('displays search program fetch error and retries with refetchSearchProgram', async () => {
        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
        });

        mockProgramsApi.fetchProgramById.mockRejectedValue(new Error('Search failed'));

        fireEvent.click(screen.getByTestId('select-program'));

        await waitFor(() => {
            expect(screen.getByText(PROGRAMS_TEXT.MESSAGE.FAIL_TO_FETCH_PROGRAM)).toBeInTheDocument();
            expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN)).toBeInTheDocument();
        });

        mockProgramsApi.fetchProgramById.mockResolvedValue(mockPrograms[0]);

        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN));

        await waitFor(() => {
            expect(mockProgramsApi.fetchProgramById).toHaveBeenCalledTimes(2);
            expect(screen.getAllByTestId('program-item')).toHaveLength(1);
        });
    });

    it('handles category selection change', async () => {
        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('category-1')).toBeDisabled();
            expect(screen.getByTestId('category-2')).not.toBeDisabled();
        });

        fireEvent.click(screen.getByTestId('category-2'));

        await waitFor(() => {
            expect(screen.getByTestId('category-1')).not.toBeDisabled();
            expect(screen.getByTestId('category-2')).toBeDisabled();
            expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledTimes(2);
        });
    });

    it('calls fetchProgramSearchItems through toolbar and forwards cancellation signal', async () => {
        render(<ProgramsPageContent />);

        fireEvent.click(screen.getByTestId('trigger-fetch-search-items'));

        await waitFor(() => {
            const call = mockProgramsApi.fetchProgramSearchItems.mock.calls[0];
            expect(call[1]).toBe('abc');
            expect(call[2]).toBe(0);
            expect(call[3]).toBe(5);
            expect(call[4]).toEqual(expect.objectContaining({ aborted: false }));
        });
    });

    it('adds draft program when no status filter and it matches selected category', async () => {
        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
        });

        fireEvent.click(screen.getByTestId('trigger-add-draft'));

        await waitFor(() => {
            expect(screen.getByText('Draft Program')).toBeInTheDocument();
            expect(screen.getAllByTestId('program-item')).toHaveLength(3);
        });
    });

    it('does not add program when status filter mismatches', async () => {
        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
        });

        fireEvent.click(screen.getByText('Filter Published'));

        await waitFor(() => {
            expect(mockProgramsApi.fetchPrograms).toHaveBeenCalledWith(
                expect.any(Object),
                1,
                0,
                5,
                VisibilityStatus.Published,
            );
        });

        fireEvent.click(screen.getByTestId('trigger-add-draft'));

        await waitFor(() => {
            expect(screen.queryByText('Draft Program')).not.toBeInTheDocument();
        });
    });

    it('keeps edited program in list when it matches selected category and adds cache buster to image urls', async () => {
        const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(123456);

        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getByText('Alpha')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('trigger-edit-in-category-with-images'));

        await waitFor(() => {
            expect(screen.getByText('Alpha Edited With Images')).toBeInTheDocument();
        });

        const edited = (globalThis as any).__lastEditedProgram;
        expect(edited.previewImage.url).toBe('http://example.com/p.png?cb=123456');
        expect(edited.backgroundImage.url).toBe('http://example.com/b.png?cb=123456');

        nowSpy.mockRestore();
    });

    it('ignores edit when original program is not found in local lists', async () => {
        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getByText('Alpha')).toBeInTheDocument();
            expect(screen.getByText('Beta')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('trigger-edit-unknown'));

        await waitFor(() => {
            expect(screen.queryByText('Unknown Edited')).not.toBeInTheDocument();
            expect(screen.getByText('Alpha')).toBeInTheDocument();
            expect(screen.getByText('Beta')).toBeInTheDocument();
        });
    });

    it('updates searched program on edit in search view', async () => {
        render(<ProgramsPageContent />);

        fireEvent.click(screen.getByTestId('select-program'));

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(1);
            expect(screen.getByText('Alpha')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('trigger-edit-search'));

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(1);
            expect(screen.getByText('Alpha Search Edited')).toBeInTheDocument();
        });
    });

    it('deletes program from search view and exits search mode', async () => {
        mockProgramsApi.fetchPrograms
            .mockResolvedValueOnce({ items: mockPrograms, totalItemsCount: mockPrograms.length })
            .mockResolvedValueOnce({ items: [mockPrograms[1]], totalItemsCount: 1 });

        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(2);
        });

        fireEvent.click(screen.getByTestId('select-program'));

        await waitFor(() => {
            expect(screen.getAllByTestId('program-item')).toHaveLength(1);
            expect(screen.getByText('Alpha')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('trigger-delete'));

        await waitFor(() => {
            expect(screen.getByText('Beta')).toBeInTheDocument();
        });
    });

    it('handles add/edit/delete category and updates selection', async () => {
        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('category-1')).toBeDisabled();
        });

        fireEvent.click(screen.getByTestId('trigger-add-category'));

        await waitFor(() => {
            expect(screen.getByTestId('category-3')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('trigger-edit-category'));

        await waitFor(() => {
            expect(screen.getByText('Category B Updated')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('trigger-delete-category'));

        await waitFor(() => {
            expect(screen.queryByTestId('category-1')).not.toBeInTheDocument();
            expect(screen.getByTestId('category-2')).toBeDisabled();
        });
    });

    it('clears selection when deleting the last category', async () => {
        mockProgramsCategoriesApi.fetchProgramCategories.mockResolvedValue([{ id: 1, name: 'Only', programsCount: 1 }]);

        render(<ProgramsPageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('category-1')).toBeDisabled();
        });

        fireEvent.click(screen.getByTestId('trigger-delete-category'));

        await waitFor(() => {
            expect(screen.queryByTestId('category-1')).not.toBeInTheDocument();
        });
    });
});
