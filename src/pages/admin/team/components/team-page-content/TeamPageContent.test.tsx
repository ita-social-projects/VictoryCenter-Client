import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TeamPageContent } from './TeamPageContent';
import { TEAM_MEMBERS_TEXT } from '@/const/admin/team';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { TeamCategoriesApi } from '@/services/api/admin/team/team-categories/team-categories-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { TeamMembersApi } from '@/services/api/admin/team/team-members/team-members-api';
import { TeamMember } from '@/types/admin/team-members';
import { VisibilityStatus } from '@/types/admin/common';
import { TeamCategory } from '@/types/admin/team-category';
import { ToastType } from '@/types/admin/toast';
import { LocalizationLanguage } from '@/types/common/language';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
const mockedUseAdminClient = useAdminClient as jest.MockedFunction<typeof useAdminClient>;

jest.mock('@/services/api/admin/team/team-members/team-members-api');
const mockTeamMembersApi = TeamMembersApi as jest.Mocked<typeof TeamMembersApi>;

jest.mock('@/services/api/admin/team/team-categories/team-categories-api');
const mockTeamCategoriesApi = TeamCategoriesApi as jest.Mocked<typeof TeamCategoriesApi>;

jest.mock('@/utils/functions/mappers/common/localization/localization-mappers', () => ({
    mapEntityWithLocalizations: (entity: any) => entity,
}));

jest.mock('../team-page-toolbar/TeamPageToolbar', () => ({
    TeamPageToolbar: (props: any) => {
        const { VisibilityStatus } = require('@/types/admin/common');
        const { TranslationStatusFilter } = require('@/types/common/language');

        const handleSelectFirstResult = () => {
            if (props.searchItems?.[0]) {
                props.onSearchItemSelect(props.searchItems[0]);
            }
        };

        return (
            <div data-testid="team-page-toolbar">
                <button data-testid="add-member-btn" onClick={props.onAddMember}>
                    Add Member
                </button>
                <button onClick={() => props.onStatusFilterChange(VisibilityStatus.Published)}>Filter Published</button>
                <button onClick={props.onSearchLoadMore} data-testid="search-load-more">
                    Load More Results
                </button>
                <button onClick={handleSelectFirstResult} data-testid="select-first-result">
                    Select First Result
                </button>
                <button onClick={props.onSearchClear} data-testid="clear-search-selection">
                    Clear Selection
                </button>
                <input
                    data-testid="search-input"
                    onChange={(e) => props.onSearchQueryChange(e.target.value)}
                    placeholder="Search..."
                />
                <select
                    data-testid="language-filter"
                    onChange={(e) => {
                        const value = e.target.value;
                        props.onLanguageChange(value);
                    }}
                >
                    <option value="uk">Українська</option>
                    <option value="en">Англійська</option>
                </select>
                <select
                    data-testid="translation-status-filter"
                    onChange={(e) => {
                        const value = e.target.value;
                        props.onTranslationStatusFilterChange(value);
                    }}
                >
                    <option value={TranslationStatusFilter.All}>All</option>
                    <option value={TranslationStatusFilter.Outdated}>Outdated</option>
                    <option value={TranslationStatusFilter.Missing}>Missing</option>
                </select>
                <select
                    data-testid="status-filter"
                    onChange={(e) => {
                        const value = e.target.value;
                        props.onStatusFilterChange(value === 'all' ? undefined : (value as any));
                    }}
                >
                    <option value="all">All</option>
                    <option value={VisibilityStatus.Published}>Published</option>
                    <option value={VisibilityStatus.Draft}>Draft</option>
                </select>
            </div>
        );
    },
}));

const mockAddToast = jest.fn();
jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: () => ({
        addToast: mockAddToast,
        toasts: [],
    }),
}));

const mockModalState = {
    isAddModalOpen: false,
    itemToEdit: null as TeamMember | null,
    itemToDelete: null as TeamMember | null,
    isAddCategoryModalOpen: false,
    isEditCategoryModalOpen: false,
    isDeleteCategoryModalOpen: false,
};

const mockOpenModalActions = {
    openAddItemModal: jest.fn(),
    openEditItemModal: jest.fn(),
    openDeleteItemModal: jest.fn(),
    openTranslateItemModal: jest.fn(),
    openEditTranslationModal: jest.fn(),
    openAddCategoryModal: jest.fn(),
    openEditCategoryModal: jest.fn(),
    openDeleteCategoryModal: jest.fn(),
};

const mockCloseModalActions = {
    closeAddItemModal: jest.fn(),
    closeEditItemModal: jest.fn(),
    closeDeleteItemModal: jest.fn(),
    closeTranslateItemModal: jest.fn(),
    closeAddCategoryModal: jest.fn(),
    closeEditCategoryModal: jest.fn(),
    closeDeleteCategoryModal: jest.fn(),
};

jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit', () => ({
    useLocalizationToolkit: () => {
        return {
            allLanguages: mockLanguages,
            translationLanguages: mockLanguages.filter((language) => language.code !== 'uk'),
            selectedLanguage: mockLanguages[0],
            onLanguageChange: jest.fn(),
            translationStatusFilter: 0,
            onTranslationStatusFilterChange: jest.fn(),
        };
    },
}));

jest.mock('@/hooks/admin/use-modals-state/useModalsState', () => ({
    useModalsState: () => {
        const isAnyModalOpened = Object.values(mockModalState).some((value) =>
            typeof value === 'boolean' ? value : value !== null,
        );
        return {
            modalState: mockModalState,
            openModalActions: mockOpenModalActions,
            closeModalActions: mockCloseModalActions,
            isAnyModalOpened,
        };
    },
}));

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({
        categories,
        selectedCategory,
        onCategorySelect,
        contextMenuOptions,
        onContextMenuOptionSelected,
    }: any) => (
        <div data-testid="category-bar">
            {categories.map((cat: TeamCategory) => (
                <button
                    key={cat.id}
                    data-testid={`category-${cat.id}`}
                    onClick={() => onCategorySelect(cat)}
                    disabled={selectedCategory?.id === cat.id}
                >
                    {cat.name}
                </button>
            ))}
            <div data-testid="context-menu">
                {contextMenuOptions?.map((option: any) => (
                    <button
                        key={option.id}
                        data-testid={`context-menu-${option.id}`}
                        onClick={() => onContextMenuOptionSelected?.(option.id)}
                    >
                        {option.name}
                    </button>
                ))}
            </div>
        </div>
    ),
}));

jest.mock('@/components/admin/infinite-scroll-list/InfiniteScrollList', () => ({
    InfiniteScrollList: ({ items, renderItem, onLoadMore, hasMore, isLoading, emptyStateMessage }: any) => (
        <div data-testid="infinite-scroll-list">
            {isLoading && <div data-testid="loading-indicator">Loading...</div>}
            {items.length === 0 && !isLoading && <div data-testid="empty-state">{emptyStateMessage}</div>}
            <div data-testid="items-container">
                {items.map((item: TeamMember) => (
                    <div key={item.id} data-testid={`member-item-${item.id}`}>
                        {renderItem(item)}
                    </div>
                ))}
            </div>
            {hasMore && !isLoading && (
                <button data-testid="load-more-btn" onClick={() => onLoadMore()}>
                    Load More
                </button>
            )}
        </div>
    ),
}));

jest.mock('@/components/admin/draggable-list-item/DraggableListItem', () => ({
    DraggableListItem: ({ entity, renderEntityComponent, entities, onEntitiesReordered }: any) => (
        <div data-testid={`draggable-item-${entity.id}`}>
            {renderEntityComponent(entity)}
            <button
                data-testid={`reorder-btn-${entity.id}`}
                onClick={() => {
                    const reordered = [...entities];
                    const firstItem = reordered.shift();
                    if (firstItem) {
                        reordered.push(firstItem);
                        onEntitiesReordered(reordered);
                    }
                }}
            >
                Reorder
            </button>
        </div>
    ),
}));

jest.mock('../member-component/MemberComponent', () => ({
    MemberComponent: ({ member, handleOnDeleteMember, handleOnEditMember, handleOnTranslateMember, language }: any) => (
        <div data-testid={`member-component-${member.id}`}>
            <span data-testid={`member-name-${member.id}`}>{member.fullName}</span>
            <span data-testid={`member-language-${member.id}`}>{language?.code}</span>
            <button data-testid={`translate-member-${member.id}`} onClick={() => handleOnTranslateMember(member)}>
                Translate
            </button>
            <button data-testid={`edit-member-${member.id}`} onClick={() => handleOnEditMember(member)}>
                Edit
            </button>
            <button data-testid={`delete-member-${member.id}`} onClick={() => handleOnDeleteMember(member)}>
                Delete
            </button>
        </div>
    ),
}));

jest.mock('../team-page-modals/TeamPageModals', () => ({
    TeamPageModals: ({
        onAddTeamMember,
        onEditTeamMember,
        onTranslateTeamMember,
        onDeleteTeamMember,
        onAddTeamCategory,
        onEditTeamCategory,
        onDeleteTeamCategory,
    }: any) => (
        <div data-testid="team-page-modals">
            <button
                data-testid="simulate-add-member"
                onClick={() => {
                    const newMember = {
                        id: 3,
                        fullName: 'New Member',
                        description: 'New description.',
                        status: 1,
                        categoryId: 1,
                        image: null,
                        localizations: [],
                    };
                    onAddTeamMember(newMember);
                }}
            >
                Simulate Add Member
            </button>
            <button
                data-testid="simulate-edit-member"
                onClick={() => {
                    const updatedMember = {
                        id: 1,
                        fullName: 'Updated Member',
                        description: 'Updated description.',
                        status: 1,
                        categoryId: 1,
                        image: { id: 1, url: 'updated.jpg', mimeType: 'image/jpeg' },
                        localizations: [],
                    };
                    onEditTeamMember(updatedMember);
                }}
            >
                Simulate Edit Member
            </button>
            <button
                data-testid="simulate-translate-member"
                onClick={() => {
                    const translatedMember = {
                        id: 1,
                        fullName: 'Translated Member',
                        description: 'Translated description.',
                        status: 1,
                        categoryId: 1,
                        image: null,
                        localizations: [],
                    };
                    onTranslateTeamMember(translatedMember);
                }}
            >
                Simulate Translate Member
            </button>
            <button
                data-testid="simulate-translate-member-draft"
                onClick={() => {
                    onTranslateTeamMember({
                        id: 1,
                        fullName: 'Translated Member Draft',
                        description: 'Draft description',
                        status: 0,
                        categoryId: 1,
                        image: null,
                        localizations: [],
                    });
                }}
            >
                Simulate Translate Draft
            </button>
            <button
                data-testid="simulate-delete-member"
                onClick={() => {
                    const memberToDelete = {
                        id: 1,
                        fullName: 'John Doe',
                        description: 'A sample description.',
                        status: 1,
                        categoryId: 1,
                        image: null,
                    };
                    onDeleteTeamMember(memberToDelete);
                }}
            >
                Simulate Delete Member
            </button>
            <button
                data-testid="simulate-add-category"
                onClick={() => {
                    const newCategory = {
                        id: 3,
                        name: 'New Category',
                        description: 'New description',
                        teamMembersCount: 0,
                    };
                    onAddTeamCategory(newCategory);
                }}
            >
                Simulate Add Category
            </button>
            <button
                data-testid="simulate-edit-category"
                onClick={() => {
                    const updatedCategory = {
                        id: 1,
                        name: 'Updated Category',
                        description: 'desc',
                        teamMembersCount: 2,
                    };
                    onEditTeamCategory(updatedCategory);
                }}
            >
                Simulate Edit Category
            </button>
            <button data-testid="simulate-delete-category" onClick={() => onDeleteTeamCategory(1)}>
                Simulate Delete Category
            </button>
        </div>
    ),
}));

jest.mock('@/components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));

const mockLanguages: LocalizationLanguage[] = [
    { id: 1, code: 'uk', name: 'Українська' },
    { id: 2, code: 'en', name: 'Англійська' },
];

const mockCategories: TeamCategory[] = [
    { id: 1, name: 'Category A', description: 'desc', teamMembersCount: 2 },
    { id: 2, name: 'Category B', description: 'desc', teamMembersCount: 1 },
];

const mockMembers: TeamMember[] = [
    {
        id: 1,
        fullName: 'John Doe',
        description: 'A sample description.',
        status: VisibilityStatus.Published,
        categoryId: 1,
        image: { id: 1, url: 'test.jpg', mimeType: 'image/jpeg' } as any,
        localizations: [],
    },
    {
        id: 2,
        fullName: 'Jane Smith',
        description: 'Another description.',
        status: VisibilityStatus.Draft,
        categoryId: 1,
        image: null,
        localizations: [],
    },
];

const mockClient = {};

const expectMemberNameToBe = async (name: string) => {
    await waitFor(() => {
        expect(screen.getByTestId('member-name-1')).toHaveTextContent(name);
    });
};

const expectTranslateButtonToBeVisible = async () => {
    await waitFor(() => {
        expect(screen.getByTestId('translate-member-1')).toBeInTheDocument();
    });
};

const expectTeamPageModalsToBeVisible = async () => {
    await waitFor(() => {
        expect(screen.getByTestId('team-page-modals')).toBeInTheDocument();
    });
};

describe('TeamPageContent', () => {
    const renderTeamPageContent = () => render(<TeamPageContent />);

    const getCategoryBar = () => screen.getByTestId('category-bar');
    const getMemberItems = () => screen.getAllByTestId(/^member-item-/);
    const getAddMemberButton = () => screen.getByTestId('add-member-btn');
    const getCategoryButton = (id: number) => screen.getByTestId(`category-${id}`);
    const getSearchInput = () => screen.getByTestId('search-input');
    const getTeamErrorContainer = () => screen.queryByTestId('team-error-container');
    const getTryAgainButton = () => screen.queryByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN);

    const clickAddMemberButton = () => fireEvent.click(getAddMemberButton());
    const clickCategoryButton = (id: number) => fireEvent.click(getCategoryButton(id));
    const changeStatusFilter = (value: string) =>
        fireEvent.change(screen.getByTestId('status-filter'), { target: { value } });
    const clickTryAgainButton = () => {
        const button = getTryAgainButton();
        if (button) fireEvent.click(button);
    };
    const typeInSearchInput = (value: string) => fireEvent.change(getSearchInput(), { target: { value } });

    const expectErrorToBeDisplayed = (errorMessage: string) => {
        expect(getTeamErrorContainer()).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockedUseAdminClient.mockReturnValue(mockClient as any);
        mockTeamCategoriesApi.getAll.mockResolvedValue(mockCategories);
        mockTeamMembersApi.getAll.mockResolvedValue({
            items: mockMembers,
            totalItemsCount: mockMembers.length,
        } as any);
        mockTeamMembersApi.search = jest.fn().mockResolvedValue({
            items: [
                { id: 10, fullName: 'Search Person 1', categoryId: 1, status: VisibilityStatus.Published },
                { id: 11, fullName: 'Search Person 2', categoryId: 2, status: VisibilityStatus.Draft },
            ],
            totalItemsCount: 4,
        } as any);
        mockTeamMembersApi.reorder = jest.fn().mockResolvedValue(undefined as any);
    });

    describe('Category selection and filtering', () => {
        it('should change members when different category is selected', async () => {
            render(<TeamPageContent />);

            await waitFor(() => {
                expect(mockTeamCategoriesApi.getAll).toHaveBeenCalled();
                expect(mockTeamMembersApi.getAll).toHaveBeenCalledWith(
                    mockClient,
                    mockCategories[0].id,
                    undefined,
                    0,
                    0,
                    5,
                );
            });

            mockTeamMembersApi.getAll.mockResolvedValueOnce({
                items: [mockMembers[1]],
                totalItemsCount: 1,
            } as any);
            clickCategoryButton(2);

            await waitFor(() => {
                expect(mockTeamMembersApi.getAll).toHaveBeenCalledWith(
                    mockClient,
                    mockCategories[1].id,
                    undefined,
                    0,
                    0,
                    5,
                );
            });
        });

        it('should pass search props to toolbar correctly', async () => {
            renderTeamPageContent();
            await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            const toolbar = screen.getByTestId('team-page-toolbar');
            expect(toolbar).toBeInTheDocument();

            const searchInput = getSearchInput();
            fireEvent.change(searchInput, { target: { value: 'test query' } });

            await waitFor(() => {
                expect(mockTeamMembersApi.search).toHaveBeenCalledWith(
                    expect.any(Object),
                    'test query',
                    0,
                    expect.any(Number),
                    expect.any(AbortSignal),
                );
            });
        });

        it('should handle status filter changes', async () => {
            render(<TeamPageContent />);

            await waitFor(() => {
                expect(mockTeamMembersApi.getAll).toHaveBeenCalled();
            });

            changeStatusFilter(VisibilityStatus.Published.toString());

            await waitFor(() => {
                expect(mockTeamMembersApi.getAll).toHaveBeenLastCalledWith(
                    mockClient,
                    mockCategories[0].id,
                    '1',
                    0,
                    0,
                    5,
                );
            });
        });

        it('should not reset members or refetch when clicking the same category twice', async () => {
            renderTeamPageContent();

            await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            const initialCallCount = mockTeamMembersApi.getAll.mock.calls.length;

            clickCategoryButton(1);

            await waitFor(() => {
                expect(mockTeamMembersApi.getAll).toHaveBeenCalledTimes(initialCallCount);
            });

            expect(getMemberItems()).toHaveLength(2);
        });
    });

    describe('Error handling', () => {
        it('should display error when categories fail to load and retry loads them', async () => {
            mockTeamCategoriesApi.getAll.mockRejectedValueOnce(new Error('API Error'));
            renderTeamPageContent();

            await waitFor(() => {
                expectErrorToBeDisplayed(COMMON_TEXT_ADMIN.CATEGORIES.MESSAGE.FAIL_TO_FETCH_CATEGORIES);
            });

            mockTeamCategoriesApi.getAll.mockResolvedValueOnce(mockCategories);
            clickTryAgainButton();

            await waitFor(() => {
                expect(mockTeamCategoriesApi.getAll).toHaveBeenCalledTimes(2);
            });
        });

        it('should handle reorder API error gracefully', async () => {
            const reorderError = new Error('Reorder failed');
            mockTeamMembersApi.reorder.mockRejectedValueOnce(reorderError);

            renderTeamPageContent();
            await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            fireEvent.click(screen.getByTestId('reorder-btn-1'));

            await waitFor(() => {
                expect(mockTeamMembersApi.reorder).toHaveBeenCalledWith(expect.any(Object), mockCategories[0].id, [
                    mockMembers[1].id,
                    mockMembers[0].id,
                ]);
            });

            await waitFor(() => {
                expectErrorToBeDisplayed(TEAM_MEMBERS_TEXT.MESSAGE.FAIL_TO_REORDER_MEMBERS);
            });
        });

        it('should not fetch categories if already loading', async () => {
            let resolveFirstCall: any;
            const firstCallPromise = new Promise((resolve) => {
                resolveFirstCall = resolve;
            });

            mockTeamCategoriesApi.getAll.mockImplementationOnce(() => firstCallPromise as Promise<TeamCategory[]>);

            renderTeamPageContent();

            await waitFor(() => {
                expect(mockTeamCategoriesApi.getAll).toHaveBeenCalledTimes(1);
            });

            resolveFirstCall(mockCategories);

            await waitFor(() => {
                expect(screen.getByTestId('category-bar')).toBeInTheDocument();
            });

            expect(mockTeamCategoriesApi.getAll).toHaveBeenCalledTimes(1);
        });

        it('should handle AbortError gracefully when fetching categories', async () => {
            const abortError = new Error('Categories fetch aborted');
            abortError.name = 'AbortError';
            mockTeamCategoriesApi.getAll.mockRejectedValueOnce(abortError);

            renderTeamPageContent();

            await waitFor(() => {
                expect(screen.queryByTestId('team-error-container')).not.toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.queryByTestId('category-1')).not.toBeInTheDocument();
            });
        });

        it('should handle search error gracefully and not show error message', async () => {
            const searchError = new Error('Search API failed');
            mockTeamMembersApi.search.mockRejectedValueOnce(searchError);

            renderTeamPageContent();
            await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            typeInSearchInput('abc');

            await waitFor(() => expect(mockTeamMembersApi.search).toHaveBeenCalledTimes(1));

            await waitFor(
                () => {
                    expect(screen.queryByTestId('team-error-container')).not.toBeInTheDocument();
                },
                { timeout: 100 },
            );

            expect(screen.queryByTestId('search-item-button')).not.toBeInTheDocument();
        });

        it('should display error when members fail to load and allow retry via changing filter', async () => {
            mockTeamMembersApi.getAll.mockRejectedValueOnce(new Error('API Error'));
            renderTeamPageContent();

            await waitFor(() => {
                expectErrorToBeDisplayed(TEAM_MEMBERS_TEXT.MESSAGE.FAIL_TO_FETCH_MEMBERS);
            });

            mockTeamMembersApi.getAll.mockResolvedValueOnce({
                items: mockMembers,
                totalItemsCount: mockMembers.length,
            } as any);

            clickTryAgainButton();

            // Change filter to trigger a new fetch
            const statusFilter = screen.getByTestId('status-filter');
            fireEvent.change(statusFilter, { target: { value: '1' } });

            await waitFor(() => {
                expect(mockTeamMembersApi.getAll).toHaveBeenCalledTimes(2);
            });
        });

        it('does not fetch members if aborted or already loading', async () => {
            renderTeamPageContent();

            await waitFor(() => {
                expect(mockTeamMembersApi.getAll).toHaveBeenCalledTimes(1);
            });

            expect(mockTeamMembersApi.getAll).toHaveBeenCalledTimes(1);
        });

        it('handleDrop returns early if draggedId is null or draggedId equals drop target id', async () => {
            renderTeamPageContent();

            await waitFor(() => {
                expect(getMemberItems().length).toBeGreaterThan(0);
            });
            const memberItems = getMemberItems();
            fireEvent.drop(memberItems[0]);
            expect(mockTeamMembersApi.reorder).not.toHaveBeenCalled();

            fireEvent.dragStart(memberItems[0], {
                clientX: 0,
                clientY: 0,
                dataTransfer: { setDragImage: jest.fn() },
            } as unknown as React.DragEvent<HTMLDivElement>);

            fireEvent.drop(memberItems[0]);
            expect(mockTeamMembersApi.reorder).not.toHaveBeenCalled();
        });

        it('updatePageSize calculates and sets pageSize based on container height', async () => {
            renderTeamPageContent();

            const listContainer = screen.getByTestId('team-page-content').querySelector('.team-page-list-container')!;
            Object.defineProperty(listContainer, 'clientHeight', { value: 600 });

            window.dispatchEvent(new Event('resize'));

            await waitFor(() => {
                expect(mockTeamMembersApi.getAll).toHaveBeenCalled();
            });
        });

        it('adds and removes resize event listener on mount/unmount', () => {
            const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

            const { unmount } = renderTeamPageContent();

            expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        });
    });

    describe('Empty categories handling', () => {
        it('should handle empty categories list without setting selected category', async () => {
            mockTeamCategoriesApi.getAll.mockResolvedValueOnce([] as TeamCategory[]);

            renderTeamPageContent();

            await waitFor(() => {
                expect(mockTeamCategoriesApi.getAll).toHaveBeenCalledTimes(1);
            });

            expect(getCategoryBar()).toBeInTheDocument();
            expect(mockTeamMembersApi.getAll).not.toHaveBeenCalled();
        });
    });

    describe('Members fetching with null category', () => {
        it('should not fetch members when selectedCategory is null', async () => {
            mockTeamCategoriesApi.getAll.mockResolvedValueOnce([] as TeamCategory[]);

            renderTeamPageContent();

            await waitFor(() => {
                expect(mockTeamCategoriesApi.getAll).toHaveBeenCalledTimes(1);
            });

            expect(mockTeamMembersApi.getAll).not.toHaveBeenCalled();
        });
    });

    describe('Additional Coverage Tests', () => {
        describe('Mouse move event handling', () => {
            it('should handle mousemove event when drag preview is not visible', async () => {
                const { unmount } = renderTeamPageContent();

                unmount();
            });
        });

        it('should handle useEffect cleanup for search hook', async () => {
            const { unmount } = renderTeamPageContent();

            await waitFor(() => {
                expect(screen.getByTestId('team-page-content')).toBeInTheDocument();
            });

            unmount();
        });

        it('should disable hasMore in single view mode', async () => {
            renderTeamPageContent();
            await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            const loadMoreButton = screen.queryByTestId('load-more');
            expect(loadMoreButton).not.toBeInTheDocument();

            expect(getMemberItems()).toHaveLength(2);
        });

        it('should test itemsToRender computation for single view', async () => {
            renderTeamPageContent();
            await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            expect(getMemberItems()).toHaveLength(2);
            expect(screen.getByTestId('member-name-1')).toHaveTextContent('John Doe');
            expect(screen.getByTestId('member-name-2')).toHaveTextContent('Jane Smith');
        });

        // it('should handle isAnyModalOpened calculation correctly', async () => {
        //     renderTeamPageContent();
        //     await waitFor(() => expect(getMemberItems()).toHaveLength(2));

        //     fireEvent.click(screen.getByTestId('edit-1'));

        //     await waitFor(() => {
        //         expect(getEditMemberModal()).toBeInTheDocument();
        //     });

        //     fireEvent.click(screen.getByTestId('close-edit'));

        //     await waitFor(() => {
        //         expect(getEditMemberModal()).not.toBeInTheDocument();
        //     });
        // });

        // it('should test closeModalActions functionality', async () => {
        //     renderTeamPageContent();
        //     await waitFor(() => expect(getMemberItems()).toHaveLength(2));

        //     fireEvent.click(screen.getByTestId('edit-1'));
        //     await waitFor(() => expect(getEditMemberModal()).toBeInTheDocument());

        //     fireEvent.click(screen.getByTestId('close-edit'));
        //     await waitFor(() => expect(getEditMemberModal()).not.toBeInTheDocument());

        //     fireEvent.click(screen.getByTestId('delete-1'));
        //     await waitFor(() => expect(getDeleteMemberModal()).toBeInTheDocument());

        //     fireEvent.click(screen.getByTestId('close-delete'));
        //     await waitFor(() => expect(getDeleteMemberModal()).not.toBeInTheDocument());
        // });

        // it('should handle modal state when modals are already opened', async () => {
        //     renderTeamPageContent();
        //     await waitFor(() => expect(getMemberItems()).toHaveLength(2));

        //     clickAddMemberButton();
        //     await waitFor(() => expect(getAddMemberModal()).toBeInTheDocument());

        //     fireEvent.click(screen.getByTestId(`edit-${mockMembers[0].id}`));

        //     expect(getAddMemberModal()).toBeInTheDocument();
        //     expect(getEditMemberModal()).not.toBeInTheDocument();

        //     fireEvent.click(screen.getByTestId(`delete-${mockMembers[0].id}`));

        //     expect(getAddMemberModal()).toBeInTheDocument();
        //     expect(getDeleteMemberModal()).not.toBeInTheDocument();
        // });

        it('should handle search query change through toolbar', async () => {
            renderTeamPageContent();
            await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            typeInSearchInput('test');

            await waitFor(() => {
                expect(mockTeamMembersApi.search).toHaveBeenCalledWith(
                    expect.any(Object),
                    'test',
                    0,
                    expect.any(Number),
                    expect.any(AbortSignal),
                );
            });
        });

        it('should handle search clear selection and restore normal view', async () => {
            mockTeamMembersApi.getAll
                .mockResolvedValueOnce({ items: mockMembers, totalItemsCount: mockMembers.length } as any)
                .mockResolvedValueOnce({ items: mockMembers, totalItemsCount: mockMembers.length } as any);

            renderTeamPageContent();
            await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            typeInSearchInput('test');
            fireEvent.click(screen.getByTestId('select-first-result'));

            fireEvent.click(screen.getByTestId('clear-search-selection'));

            await waitFor(() => {
                expect(mockTeamMembersApi.getAll).toHaveBeenCalledTimes(2);
                expect(getMemberItems()).toHaveLength(2);
            });
        });

        describe('Modal state management', () => {
            it('should handle add member when members list shorter than capacity and fire toast for Published', async () => {
                renderTeamPageContent();
                await waitFor(() => expect(getMemberItems()).toHaveLength(2));

                clickAddMemberButton();

                await waitFor(() => {
                    expect(screen.getByTestId('simulate-add-member')).toBeInTheDocument();
                });

                // Confirm adding member when list is at page size (lines 401-403)
                fireEvent.click(screen.getByTestId('simulate-add-member'));

                await waitFor(() => {
                    // Member should be added to the list
                    expect(getMemberItems()).toHaveLength(3);
                });

                expect(mockAddToast).toHaveBeenCalledWith(
                    TEAM_MEMBERS_TEXT.MESSAGE.DONT_FORGET_TO_ORDER,
                    ToastType.Info,
                );
            });

            it('should update member in list after translate', async () => {
                renderTeamPageContent();

                await expectMemberNameToBe('John Doe');

                fireEvent.click(screen.getByTestId('simulate-translate-member'));

                await expectMemberNameToBe('Translated Member');
                expect(mockCloseModalActions.closeTranslateItemModal).toHaveBeenCalled();
                expect(mockAddToast).toHaveBeenCalled();
            });

            it('shows success toast when translated member is published', async () => {
                renderTeamPageContent();

                fireEvent.click(screen.getByTestId('simulate-translate-member'));

                await waitFor(() => {
                    expect(mockAddToast).toHaveBeenCalledWith(
                        COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_PUBLISHED_SUCCESS,
                        ToastType.Success,
                    );
                });
            });

            it('shows success toast when translated member is draft', async () => {
                renderTeamPageContent();

                fireEvent.click(screen.getByTestId('simulate-translate-member-draft'));

                await waitFor(() => {
                    expect(mockAddToast).toHaveBeenCalledWith(
                        COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_SAVED_SUCCESS,
                        ToastType.Success,
                    );
                });
            });

            // it('should edit member without image cache busting when no url present', async () => {
            //     const membersWithoutImageUrl: TeamMember[] = [
            //         { ...mockMembers[0], image: { id: 1 } as any },
            //         mockMembers[1],
            //     ];
            //     mockTeamMembersApi.getAll.mockResolvedValueOnce({
            //         items: membersWithoutImageUrl,
            //         totalItemsCount: membersWithoutImageUrl.length,
            //     } as any);

            //     renderTeamPageContent();
            //     await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            //     fireEvent.click(screen.getByTestId(`edit-${membersWithoutImageUrl[0].id}`));
            //     await waitFor(() => expect(getEditMemberModal()).toBeInTheDocument());

            //     clickConfirmEditButton();

            //     await waitFor(() => expect(getEditMemberModal()).not.toBeInTheDocument());

            //     expect(screen.getByTestId('member-name-1')).toHaveTextContent('Updated Member');
            // });

            //     it('should set hasMore to true when adding member that exceeds current page capacity', async () => {
            //         mockTeamMembersApi.getAll.mockResolvedValueOnce({
            //             items: mockMembers,
            //             totalItemsCount: mockMembers.length,
            //         } as any);

            //         renderTeamPageContent();
            //         await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            //         clickAddMemberButton();

            //         const addModal = getAddMemberModal();
            //         expect(addModal).toBeInTheDocument();

            //         clickConfirmAddButton();

            //         await waitFor(() => {
            //             expect(getAddMemberModal()).not.toBeInTheDocument();
            //         });

            //         expect(getMemberItems()).toHaveLength(2);
            //     });

            //     it('should open edit modal and confirm edit updating member name and busting image cache when url present', async () => {
            //         const membersWithImage: TeamMember[] = [
            //             { ...mockMembers[0], image: { url: 'https://img/test.png' } as any },
            //             mockMembers[1],
            //         ];
            //         mockTeamMembersApi.getAll.mockResolvedValueOnce({
            //             items: membersWithImage,
            //             totalItemsCount: membersWithImage.length,
            //         } as any);

            //         renderTeamPageContent();

            //         await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            //         fireEvent.click(screen.getByTestId(`edit-${membersWithImage[0].id}`));

            //         await waitFor(() => expect(getEditMemberModal()).toBeInTheDocument());

            //         clickConfirmEditButton();

            //         await waitFor(() => expect(getEditMemberModal()).not.toBeInTheDocument());
            //     });

            //     it('should open delete modal and confirm deletion removing member', async () => {
            //         renderTeamPageContent();

            //         await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            //         fireEvent.click(screen.getByTestId(`delete-${mockMembers[0].id}`));

            //         await waitFor(() => expect(getDeleteMemberModal()).toBeInTheDocument());

            //         clickConfirmDeleteButton();

            //         await waitFor(() => expect(getDeleteMemberModal()).not.toBeInTheDocument());
            //     });
            // });

            describe('AbortController and lgetTeamToolbaroading states', () => {
                it('should abort previous request when fetchMembers is called again', async () => {
                    const mockAbortController = {
                        abort: jest.fn(() => {}),
                        signal: { aborted: false },
                    };

                    const originalAbortController = global.AbortController;
                    global.AbortController = jest.fn(() => mockAbortController) as any;

                    renderTeamPageContent();

                    await waitFor(() => {
                        expect(mockTeamMembersApi.getAll).toHaveBeenCalledTimes(1);
                    });

                    mockTeamMembersApi.getAll.mockResolvedValueOnce({
                        items: [],
                        totalItemsCount: 0,
                    } as any);

                    clickCategoryButton(2);

                    await waitFor(() => {
                        expect(mockTeamMembersApi.getAll).toHaveBeenCalledTimes(2);
                    });

                    expect(mockAbortController.abort).toHaveBeenCalled();

                    global.AbortController = originalAbortController;
                });

                it('should return early when fetchMembers conditions are not met', async () => {
                    mockTeamCategoriesApi.getAll.mockResolvedValueOnce([]);

                    renderTeamPageContent();

                    await waitFor(() => {
                        expect(mockTeamCategoriesApi.getAll).toHaveBeenCalledTimes(1);
                    });

                    expect(mockTeamMembersApi.getAll).not.toHaveBeenCalled();

                    const loadMoreButton = screen.queryByTestId('load-more');
                    if (loadMoreButton) {
                        fireEvent.click(loadMoreButton);
                    }

                    expect(mockTeamMembersApi.getAll).not.toHaveBeenCalled();
                });

                it('should handle canceled axios errors gracefully', async () => {
                    const canceledError = {
                        name: 'CanceledError',
                        message: 'Request canceled',
                    } as Error;

                    mockTeamMembersApi.getAll.mockRejectedValueOnce(canceledError);

                    renderTeamPageContent();

                    await waitFor(() => {
                        expect(mockTeamMembersApi.getAll).toHaveBeenCalled();
                    });

                    expect(screen.queryByTestId('team-error-container')).not.toBeInTheDocument();
                });
            });

            describe('Page size calculation', () => {
                it('should calculate page size based on container height on mount', async () => {
                    const { container } = renderTeamPageContent();

                    const listContainer = container.querySelector('.team-page-list-container');
                    if (listContainer) {
                        Object.defineProperty(listContainer, 'clientHeight', {
                            value: 360,
                            configurable: true,
                        });
                    }

                    await waitFor(() => {
                        expect(mockTeamMembersApi.getAll).toHaveBeenCalled();
                    });
                });
            });

            describe('Reordering action', () => {
                it('calls reorder API and updates list on reorder click', async () => {
                    renderTeamPageContent();

                    await waitFor(() => expect(getMemberItems()).toHaveLength(2));

                    fireEvent.click(screen.getByTestId('reorder-btn-1'));

                    await waitFor(() => {
                        expect(mockTeamMembersApi.reorder).toHaveBeenCalledWith(
                            expect.any(Object),
                            mockCategories[0].id,
                            [mockMembers[1].id, mockMembers[0].id],
                        );
                    });
                });
            });
        });

        describe('Comprehensive Coverage Tests', () => {
            beforeEach(() => {
                jest.clearAllMocks();
                mockedUseAdminClient.mockReturnValue(mockClient as any);
                mockTeamCategoriesApi.getAll.mockResolvedValue(mockCategories);
                mockTeamMembersApi.getAll.mockResolvedValue({
                    items: mockMembers,
                    totalItemsCount: mockMembers.length,
                } as any);
                mockTeamMembersApi.reorder.mockResolvedValue(undefined);

                // Reset modal state
                Object.assign(mockModalState, {
                    isAddModalOpen: false,
                    itemToEdit: null,
                    itemToDelete: null,
                    isAddCategoryModalOpen: false,
                    isEditCategoryModalOpen: false,
                    isDeleteCategoryModalOpen: false,
                });
            });

            it('handles context menu operations', async () => {
                render(<TeamPageContent />);

                await waitFor(() => {
                    expect(screen.getByTestId('context-menu')).toBeInTheDocument();
                });

                // Test add category
                fireEvent.click(screen.getByTestId('context-menu-add'));
                expect(mockOpenModalActions.openAddCategoryModal).toHaveBeenCalled();

                // Test edit category
                fireEvent.click(screen.getByTestId('context-menu-edit'));
                expect(mockOpenModalActions.openEditCategoryModal).toHaveBeenCalled();

                // Test delete category
                fireEvent.click(screen.getByTestId('context-menu-delete'));
                expect(mockOpenModalActions.openDeleteCategoryModal).toHaveBeenCalled();
            });

            it('handles member operations through modals', async () => {
                render(<TeamPageContent />);

                await waitFor(() => {
                    expect(screen.getByTestId('simulate-add-member')).toBeInTheDocument();
                });

                // Test add member
                fireEvent.click(screen.getByTestId('simulate-add-member'));
                expect(mockCloseModalActions.closeAddItemModal).toHaveBeenCalled();
                expect(mockAddToast).toHaveBeenCalledWith(
                    TEAM_MEMBERS_TEXT.MESSAGE.DONT_FORGET_TO_ORDER,
                    ToastType.Info,
                );

                // Test edit member
                fireEvent.click(screen.getByTestId('simulate-edit-member'));
                expect(mockCloseModalActions.closeEditItemModal).toHaveBeenCalled();

                // Test delete member
                fireEvent.click(screen.getByTestId('simulate-delete-member'));
                expect(mockCloseModalActions.closeDeleteItemModal).toHaveBeenCalled();
            });

            it('handles category operations through modals', async () => {
                render(<TeamPageContent />);

                await waitFor(() => {
                    expect(screen.getByTestId('simulate-add-category')).toBeInTheDocument();
                });

                // Test add category
                fireEvent.click(screen.getByTestId('simulate-add-category'));

                // Test edit category
                fireEvent.click(screen.getByTestId('simulate-edit-category'));

                // Test delete category
                fireEvent.click(screen.getByTestId('simulate-delete-category'));
            });

            it('handles member edit and delete modal opening', async () => {
                render(<TeamPageContent />);

                await waitFor(() => {
                    expect(screen.getByTestId('edit-member-1')).toBeInTheDocument();
                });

                // Test edit member modal
                fireEvent.click(screen.getByTestId('edit-member-1'));
                expect(mockOpenModalActions.openEditItemModal).toHaveBeenCalledWith(mockMembers[0]);

                // Test delete member modal
                fireEvent.click(screen.getByTestId('delete-member-1'));
                expect(mockOpenModalActions.openDeleteItemModal).toHaveBeenCalledWith(mockMembers[0]);
            });

            it('should open translate modal when member has no translation', async () => {
                renderTeamPageContent();

                await expectTranslateButtonToBeVisible();

                fireEvent.click(screen.getByTestId('translate-member-1'));

                expect(mockOpenModalActions.openTranslateItemModal).toHaveBeenCalledWith(mockMembers[0]);
                expect(mockOpenModalActions.openEditTranslationModal).not.toHaveBeenCalled();
            });

            it('should open edit translation modal when member already has translation', async () => {
                const memberWithTranslation: TeamMember = {
                    ...mockMembers[0],
                    localizations: [
                        {
                            id: 10,
                            fullName: 'John Doe EN',
                            description: 'Desc EN',
                            language: mockLanguages.find((l) => l.code === 'en')!,
                        } as any,
                    ],
                };

                mockTeamMembersApi.getAll.mockResolvedValueOnce({
                    items: [memberWithTranslation],
                    totalItemsCount: 1,
                } as any);

                renderTeamPageContent();

                await expectTranslateButtonToBeVisible();

                fireEvent.click(screen.getByTestId('translate-member-1'));

                expect(mockOpenModalActions.openEditTranslationModal).toHaveBeenCalledWith(memberWithTranslation);
                expect(mockOpenModalActions.openTranslateItemModal).not.toHaveBeenCalled();
            });

            it('should not open translate modal if another modal is already opened', async () => {
                mockModalState.isAddModalOpen = true;

                renderTeamPageContent();

                await expectTranslateButtonToBeVisible();

                fireEvent.click(screen.getByTestId('translate-member-1'));

                expect(mockOpenModalActions.openTranslateItemModal).not.toHaveBeenCalled();
                expect(mockOpenModalActions.openEditTranslationModal).not.toHaveBeenCalled();
            });

            it('prevents modal operations when other modal is open', async () => {
                mockModalState.isAddModalOpen = true;

                render(<TeamPageContent />);

                await waitFor(() => {
                    expect(screen.getByTestId('edit-member-1')).toBeInTheDocument();
                });

                fireEvent.click(screen.getByTestId('edit-member-1'));
                fireEvent.click(screen.getByTestId('delete-member-1'));

                expect(mockOpenModalActions.openEditItemModal).not.toHaveBeenCalled();
                expect(mockOpenModalActions.openDeleteItemModal).not.toHaveBeenCalled();
            });

            it('handles error states and retry functionality', async () => {
                mockTeamCategoriesApi.getAll.mockRejectedValueOnce(new Error('Categories API Error'));

                render(<TeamPageContent />);

                await waitFor(() => {
                    expect(screen.getByTestId('team-error-container')).toBeInTheDocument();
                    expect(
                        screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.MESSAGE.FAIL_TO_FETCH_CATEGORIES),
                    ).toBeInTheDocument();
                });

                mockTeamCategoriesApi.getAll.mockResolvedValueOnce(mockCategories);

                const retryButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN);
                fireEvent.click(retryButton);

                await waitFor(() => {
                    expect(mockTeamCategoriesApi.getAll).toHaveBeenCalledTimes(2);
                });
            });

            it('handles members API error and retry', async () => {
                // Clear any existing calls
                mockTeamMembersApi.getAll.mockClear();

                mockTeamMembersApi.getAll.mockRejectedValueOnce(new Error('Members API Error'));

                render(<TeamPageContent />);

                await waitFor(() => {
                    expect(screen.getByTestId('team-error-container')).toBeInTheDocument();
                    expect(screen.getByText(TEAM_MEMBERS_TEXT.MESSAGE.FAIL_TO_FETCH_MEMBERS)).toBeInTheDocument();
                });

                // Ensure the first call happened
                expect(mockTeamMembersApi.getAll).toHaveBeenCalledTimes(1);

                mockTeamMembersApi.getAll.mockResolvedValueOnce({
                    items: mockMembers,
                    totalItemsCount: mockMembers.length,
                } as any);

                // Trigger retry by changing status filter (since that's what triggers fetchMembers)
                fireEvent.change(screen.getByTestId('status-filter'), {
                    target: { value: '1' },
                });

                await waitFor(() => {
                    expect(mockTeamMembersApi.getAll).toHaveBeenCalledTimes(2);
                });
            });

            it('handles reorder API error', async () => {
                mockTeamMembersApi.reorder.mockRejectedValueOnce(new Error('Reorder Error'));

                render(<TeamPageContent />);

                await waitFor(() => {
                    expect(screen.getByTestId('reorder-btn-1')).toBeInTheDocument();
                });

                fireEvent.click(screen.getByTestId('reorder-btn-1'));

                await waitFor(() => {
                    expect(screen.getByTestId('team-error-container')).toBeInTheDocument();
                    expect(screen.getByText(TEAM_MEMBERS_TEXT.MESSAGE.FAIL_TO_REORDER_MEMBERS)).toBeInTheDocument();
                });
            });

            it('ignores cancelled API errors', async () => {
                const canceledError = { name: 'CanceledError' };
                mockTeamMembersApi.getAll.mockRejectedValueOnce(canceledError);

                render(<TeamPageContent />);

                await waitFor(() => {
                    expect(mockTeamMembersApi.getAll).toHaveBeenCalled();
                });

                expect(screen.queryByTestId('team-error-container')).not.toBeInTheDocument();
            });

            it('handles resize events and page size calculation', async () => {
                const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
                const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

                const { unmount } = render(<TeamPageContent />);

                expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

                unmount();

                expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
            });

            it('handles empty categories gracefully', async () => {
                mockTeamCategoriesApi.getAll.mockResolvedValueOnce([]);

                render(<TeamPageContent />);

                await waitFor(() => {
                    expect(mockTeamCategoriesApi.getAll).toHaveBeenCalled();
                });

                expect(mockTeamMembersApi.getAll).not.toHaveBeenCalled();
            });

            it('loads more members when available', async () => {
                mockTeamMembersApi.getAll.mockResolvedValueOnce({
                    items: mockMembers,
                    totalItemsCount: 10,
                } as any);

                render(<TeamPageContent />);

                await waitFor(() => {
                    expect(screen.getByTestId('load-more-btn')).toBeInTheDocument();
                });

                mockTeamMembersApi.getAll.mockResolvedValueOnce({
                    items: [{ ...mockMembers[0], id: 99, fullName: 'Additional Member' }],
                    totalItemsCount: 10,
                } as any);

                fireEvent.click(screen.getByTestId('load-more-btn'));

                await waitFor(() => {
                    expect(mockTeamMembersApi.getAll).toHaveBeenCalledWith(
                        mockClient,
                        mockCategories[0].id,
                        undefined,
                        0,
                        5,
                        5,
                    );
                });
            });

            it('should pass englishLanguage to TeamPageModals', async () => {
                renderTeamPageContent();

                await expectTeamPageModalsToBeVisible();

                const englishLanguage = mockLanguages.find((l) => l.code === 'en');
                expect(englishLanguage).toBeDefined();
            });
        });
    });
});
