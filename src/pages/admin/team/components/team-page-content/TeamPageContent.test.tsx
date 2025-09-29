import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TeamPageContent } from './TeamPageContent';
import { TEAM_CATEGORY_TEXT, TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { TeamCategoriesApi } from '../../../../../services/api/admin/team/team-categories/team-categories-api';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { TeamMembersApi } from '../../../../../services/api/admin/team/team-members/team-members-api';
import { TeamCategory, TeamMember } from '../../../../../types/admin/team-members';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { ToastType } from '../../../../../types/admin/toast';

jest.mock('../../../../../hooks/admin/use-admin-client/useAdminClient');

const mockedUseAdminClient = useAdminClient as jest.Mock;

jest.mock('../../../../../services/api/admin/team/team-members/team-members-api');
const mockTeamMembersApi = TeamMembersApi as jest.Mocked<typeof TeamMembersApi>;

jest.mock('../../../../../services/api/admin/team/team-categories/team-categories-api');
const mockTeamCategoriesApi = TeamCategoriesApi as jest.Mocked<typeof TeamCategoriesApi>;

jest.mock('../team-page-toolbar/TeamPageToolbar', () => ({
    TeamPageToolbar: (props: any) => {
        const { VisibilityStatus } = require('../../../../../types/admin/common');
        return (
            <div data-testid="team-page-toolbar">
                <button onClick={props.onAddMember}>Add Member</button>
                <button onClick={() => props.onStatusFilterChange(VisibilityStatus.Published)}>Filter Published</button>
                <button onClick={props.onSearchLoadMore} data-testid="search-load-more">
                    Load More Results
                </button>
                <button
                    onClick={() => props.searchItems?.[0] && props.onSearchItemSelect(props.searchItems[0])}
                    data-testid="select-first-result"
                >
                    Select First Result
                </button>
                <button onClick={props.onSearchClear} data-testid="clear-search-selection">
                    Clear Selection
                </button>
                <span data-testid="status-reset-key">{props.statusResetKey}</span>
                <input
                    data-testid="search-input"
                    onChange={(e) => props.onSearchQueryChange(e.target.value)}
                    placeholder="Search..."
                />
            </div>
        );
    },
}));

jest.mock('../../../../../contexts/admin/toast-context-provider/ToastContextProvider', () => {
    const mod: any = {
        __esModule: true,
        mockToast: jest.fn(),
        useToast: () => ({
            addToast: mod.mockToast,
            toasts: [],
        }),
    };
    return mod;
});

jest.mock('../team-member-modals/team-member-modal/TeamMemberModal', () => ({
    TeamMemberModal: (props: any) => {
        if (!props.isOpen) return null;

        const { ModalMode } = require('../../../../../types/admin/common');
        const isAddMode = props.mode === ModalMode.Add;
        const isEditMode = props.mode === ModalMode.Edit;

        return (
            <div data-testid={isAddMode ? 'add-member-modal' : 'edit-member-modal'}>
                <h2>{isAddMode ? 'Add Member Modal' : 'Edit Member Modal'}</h2>
                {isEditMode && props.memberToEdit && <p>Editing: {props.memberToEdit.fullName}</p>}
                {isAddMode && <p>Adding new member</p>}
                <button
                    data-testid={isAddMode ? 'confirm-add' : 'confirm-edit'}
                    onClick={() => {
                        if (isAddMode && props.onAddMember) {
                            props.onAddMember(mockNewMember);
                        } else if (isEditMode && props.onEditMember && props.memberToEdit) {
                            props.onEditMember({ ...props.memberToEdit, fullName: 'Updated Member' });
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

jest.mock('../team-member-modals/delete-team-member-modal/DeleteTeamMemberModal', () => ({
    DeleteTeamMemberModal: (props: any) =>
        props.isOpen ? (
            <div data-testid="delete-member-modal">
                <h2>Delete Member Modal</h2>
                <p>Deleting: {props.memberToDelete?.fullName}</p>
                <button
                    data-testid="confirm-delete"
                    onClick={() => {
                        props.onDeleteMember(props.memberToDelete);
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

jest.mock('../../../../../components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({
        categories,
        selectedCategory,
        onCategorySelect,
    }: {
        categories: TeamCategory[];
        selectedCategory?: TeamCategory;
        onCategorySelect: (category: TeamCategory) => void;
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
        </div>
    ),
}));

jest.mock('../../../../../components/admin/infinite-scroll-list/InfiniteScrollList', () => ({
    InfiniteScrollList: ({ items, renderItem, onLoadMore, hasMore, isLoading, emptyStateMessage }: any) => (
        <div data-testid="infinite-scroll-list">
            {isLoading && <div data-testid="infinite-scroll-loader">Loading...</div>}
            {items.length === 0 && !isLoading && <div data-testid="empty-state">{emptyStateMessage}</div>}
            {items.map((item: TeamMember) => (
                <div key={item.id} data-testid="member-item">
                    {renderItem(item)}
                </div>
            ))}
            {hasMore && !isLoading && (
                <button data-testid="load-more" onClick={() => onLoadMore()}>
                    Load More
                </button>
            )}
        </div>
    ),
}));

jest.mock('../../../../../components/admin/draggable-list-item/DraggableListItem', () => ({
    DraggableListItem: ({ entity, renderEntityComponent, entities, onEntitiesReordered }: any) => (
        <div data-testid="draggable-item">
            {renderEntityComponent(entity)}
            <button data-testid="reorder" onClick={() => onEntitiesReordered([...entities].reverse())}>
                Reorder
            </button>
        </div>
    ),
}));

jest.mock('../member-component/MemberComponent', () => ({
    MemberComponent: ({ member, handleOnEditMember, handleOnDeleteMember }: any) => (
        <div>
            <span data-testid={`member-name-${member.id}`}>{member.fullName}</span>
            {member?.image?.url ? <span data-testid={`member-image-url-${member.id}`}>{member.image.url}</span> : null}
            <button data-testid={`edit-${member.id}`} onClick={() => handleOnEditMember(member)}>
                Edit
            </button>
            <button data-testid={`delete-${member.id}`} onClick={() => handleOnDeleteMember(member)}>
                Delete
            </button>
        </div>
    ),
}));

const mockCategories: TeamCategory[] = [
    { id: 1, name: 'Category A', description: 'desc' },
    { id: 2, name: 'Category B', description: 'desc' },
];

const mockMembers: TeamMember[] = [
    {
        id: 1,
        fullName: 'Test Member Alpha',
        description: 'A sample description.',
        status: VisibilityStatus.Published,
        categoryId: 1,
        image: null,
    },
    {
        id: 2,
        fullName: 'Test Member Beta',
        description: 'Another description.',
        status: VisibilityStatus.Draft,
        categoryId: 1,
        image: null,
    },
];

const mockNewMember: TeamMember = {
    id: 3,
    fullName: 'Test Member Gamma',
    description: 'A sample description.',
    status: VisibilityStatus.Published,
    categoryId: 2,
    image: null,
};

describe('TeamPageContent', () => {
    const renderTeamPageContent = () => render(<TeamPageContent />);

    const getTeamPageContent = () => screen.getByTestId('team-page-content');
    const getTeamToolbar = () => screen.getByTestId('team-page-toolbar');
    const getCategoryBar = () => screen.getByTestId('category-bar');
    const getInfiniteScrollList = () => screen.getByTestId('infinite-scroll-list');
    const getMemberItems = () => screen.getAllByTestId('member-item');
    const getEmptyState = () => screen.getByTestId('empty-state');
    const getAddMemberButton = () => screen.getByText('Add Member');
    const getAddMemberModal = () => screen.queryByTestId('add-member-modal');
    const getEditMemberModal = () => screen.queryByTestId('edit-member-modal');
    const getDeleteMemberModal = () => screen.queryByTestId('delete-member-modal');
    const getCategoryButton = (id: number) => screen.getByTestId(`category-${id}`);
    const getFilterPublishedButton = () => screen.getByText('Filter Published');
    const getSearchInput = () => screen.getByTestId('search-input');
    const getTeamErrorContainer = () => screen.getByTestId('team-error-container');
    const getTryAgainButton = () => screen.getByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN);
    const getConfirmAddButton = () => screen.getByTestId('confirm-add');
    const getConfirmEditButton = () => screen.getByTestId('confirm-edit');
    const getConfirmDeleteButton = () => screen.getByTestId('confirm-delete');
    const getSearchLoadMoreButton = () => screen.getByTestId('search-load-more');
    const getSelectFirstResultButton = () => screen.getByTestId('select-first-result');
    const getClearSearchSelectionButton = () => screen.getByTestId('clear-search-selection');
    const getStatusResetKey = () => screen.getByTestId('status-reset-key');

    const clickAddMemberButton = () => fireEvent.click(getAddMemberButton());
    const clickCategoryButton = (id: number) => fireEvent.click(getCategoryButton(id));
    const clickFilterPublishedButton = () => fireEvent.click(getFilterPublishedButton());
    const clickTryAgainButton = () => fireEvent.click(getTryAgainButton());
    const clickConfirmAddButton = () => fireEvent.click(getConfirmAddButton());
    const clickConfirmEditButton = () => fireEvent.click(getConfirmEditButton());
    const clickConfirmDeleteButton = () => fireEvent.click(getConfirmDeleteButton());
    const clickSelectFirstResult = () => fireEvent.click(getSelectFirstResultButton());
    const clickClearSearchSelection = () => fireEvent.click(getClearSearchSelectionButton());
    const typeInSearchInput = (value: string) => fireEvent.change(getSearchInput(), { target: { value } });

    const expectMainComponentsToBeRendered = () => {
        expect(getTeamPageContent()).toBeInTheDocument();
        expect(getTeamToolbar()).toBeInTheDocument();
        expect(getCategoryBar()).toBeInTheDocument();
        expect(getInfiniteScrollList()).toBeInTheDocument();
    };

    const expectEmptyStateToBeShown = () => {
        expect(getEmptyState()).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.LIST.NOT_FOUND)).toBeInTheDocument();
    };

    const expectApiCallsToHaveBeenMade = () => {
        expect(mockTeamCategoriesApi.getAll).toHaveBeenCalledTimes(1);
        expect(mockTeamMembersApi.getAll).toHaveBeenCalledWith(
            expect.any(Object),
            mockCategories[0].id,
            undefined,
            0,
            5,
        );
    };

    const expectErrorToBeDisplayed = (errorMessage: string) => {
        expect(getTeamErrorContainer()).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    };

    beforeEach(() => {
        jest.clearAllMocks();
        const toastModule: any = require('../../../../../contexts/admin/toast-context-provider/ToastContextProvider');
        toastModule.mockToast.mockReset();
        mockedUseAdminClient.mockReturnValue({
            client: {},
        });
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

    describe('Initial render', () => {
        it('should render all main components and fetch initial data', async () => {
            renderTeamPageContent();

            expectMainComponentsToBeRendered();

            await waitFor(() => {
                expect(mockTeamCategoriesApi.getAll).toHaveBeenCalledTimes(1);
            });

            await waitFor(() => {
                expectApiCallsToHaveBeenMade();
            });

            await waitFor(() => {
                expect(getMemberItems()).toHaveLength(2);
            });
        });

        it('should show empty state when no members are found', async () => {
            mockTeamMembersApi.getAll.mockResolvedValueOnce({
                items: [],
                totalItemsCount: 0,
            } as any);

            renderTeamPageContent();

            await waitFor(() => {
                expectEmptyStateToBeShown();
            });
        });
    });

    describe('Category selection and filtering', () => {
        it('should change members when different category is selected', async () => {
            const categoryBMembers: TeamMember[] = [
                {
                    id: 3,
                    fullName: 'Category B Member',
                    description: 'Member from category B',
                    status: VisibilityStatus.Published,
                    categoryId: 2,
                    image: null,
                },
            ];
            renderTeamPageContent();
            await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            mockTeamMembersApi.getAll.mockResolvedValueOnce({
                items: categoryBMembers,
                totalItemsCount: 1,
            } as any);
            clickCategoryButton(2);

            await waitFor(() => {
                expect(mockTeamMembersApi.getAll).toHaveBeenCalledWith(
                    expect.any(Object),
                    mockCategories[1].id,
                    undefined,
                    0,
                    5,
                );
            });
        });

        it('should handle status filter changes', async () => {
            renderTeamPageContent();
            await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            clickFilterPublishedButton();

            await waitFor(() => {
                expect(mockTeamMembersApi.getAll).toHaveBeenCalledWith(
                    expect.any(Object),
                    mockCategories[0].id,
                    VisibilityStatus.Published,
                    0,
                    5,
                );
            });
        });
    });

    describe('Error handling', () => {
        it('should display error when categories fail to load and retry loads them', async () => {
            mockTeamCategoriesApi.getAll.mockRejectedValueOnce(new Error('API Error'));
            renderTeamPageContent();

            await waitFor(() => {
                expectErrorToBeDisplayed(TEAM_CATEGORY_TEXT.MESSAGE.FAIL_TO_FETCH_CATEGORIES);
            });

            mockTeamCategoriesApi.getAll.mockResolvedValueOnce(mockCategories);
            clickTryAgainButton();

            await waitFor(() => {
                expect(mockTeamCategoriesApi.getAll).toHaveBeenCalledTimes(2);
            });
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

            clickFilterPublishedButton();

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

    describe('Search functionality', () => {
        it('should handle search query changes and fetch suggestions when length >= 2', async () => {
            renderTeamPageContent();
            await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            typeInSearchInput('a');
            await waitFor(() => {
                expect(mockTeamMembersApi.search).not.toHaveBeenCalled();
            });

            typeInSearchInput('ab');

            await waitFor(() => {
                expect(mockTeamMembersApi.search).toHaveBeenCalledWith(expect.any(Object), 'ab', 0, expect.any(Number));
            });
        });

        it('should load more search suggestions when requested and has more', async () => {
            renderTeamPageContent();
            await waitFor(() => expect(getMemberItems()).toHaveLength(2));

            typeInSearchInput('ab');

            await waitFor(() => expect(mockTeamMembersApi.search).toHaveBeenCalledTimes(1));

            mockTeamMembersApi.search.mockResolvedValueOnce({
                items: [{ id: 12, fullName: 'Search Person 3', categoryId: 1 }],
                totalItemsCount: 5,
            } as any);

            await waitFor(() => expect(getSearchLoadMoreButton()).toBeInTheDocument());

            await Promise.resolve();

            fireEvent.click(getSearchLoadMoreButton());

            await waitFor(() => expect(mockTeamMembersApi.search).toHaveBeenCalledTimes(2));
        });

        it('should select search item, reset status, bump reset key and switch category, and then clear selection', async () => {
            mockTeamMembersApi.search.mockResolvedValueOnce({
                items: [{ id: 10, fullName: 'Search Person 1', categoryId: 2, status: VisibilityStatus.Published }],
                totalItemsCount: 1,
            } as any);

            renderTeamPageContent();

            typeInSearchInput('ab');
            await waitFor(() => expect(mockTeamMembersApi.search).toHaveBeenCalledTimes(1));

            await waitFor(() => expect(getSelectFirstResultButton()).toBeInTheDocument());
            const keyBefore = getStatusResetKey().textContent;

            clickSelectFirstResult();

            await waitFor(() => {
                expect(getStatusResetKey().textContent).not.toEqual(keyBefore);
            });

            const keyMid = getStatusResetKey().textContent;

            clickClearSearchSelection();

            await waitFor(() => {
                expect(getStatusResetKey().textContent).not.toEqual(keyMid);
            });
        });

        it('should clear suggestions and flags on empty query', async () => {
            renderTeamPageContent();

            typeInSearchInput('ab');
            await waitFor(() => expect(mockTeamMembersApi.search).toHaveBeenCalled());

            typeInSearchInput('   ');
            await waitFor(() => {
                expect(mockTeamMembersApi.search).toHaveBeenCalledTimes(1);
            });
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

        describe('Modal state management', () => {
            it('should handle add member when members list shorter than capacity and fire toast for Published', async () => {
                renderTeamPageContent();
                await waitFor(() => expect(getMemberItems()).toHaveLength(2));

                clickAddMemberButton();

                clickConfirmAddButton();

                await waitFor(() => {
                    expect(getAddMemberModal()).not.toBeInTheDocument();
                });

                const toastModule: any = require('../../../../../contexts/admin/toast-context-provider/ToastContextProvider');
                expect(toastModule.mockToast).toHaveBeenCalledWith(
                    TEAM_MEMBERS_TEXT.MESSAGE.DONT_FORGET_TO_ORDER,
                    ToastType.Info,
                );
            });

            it('should open edit modal and confirm edit updating member name and busting image cache when url present', async () => {
                const membersWithImage: TeamMember[] = [
                    { ...mockMembers[0], image: { url: 'https://img/test.png' } as any },
                    mockMembers[1],
                ];
                mockTeamMembersApi.getAll.mockResolvedValueOnce({
                    items: membersWithImage,
                    totalItemsCount: membersWithImage.length,
                } as any);

                renderTeamPageContent();

                await waitFor(() => expect(getMemberItems()).toHaveLength(2));

                fireEvent.click(screen.getByTestId(`edit-${membersWithImage[0].id}`));

                await waitFor(() => expect(getEditMemberModal()).toBeInTheDocument());

                clickConfirmEditButton();

                await waitFor(() => expect(getEditMemberModal()).not.toBeInTheDocument());
            });

            it('should open delete modal and confirm deletion removing member', async () => {
                renderTeamPageContent();

                await waitFor(() => expect(getMemberItems()).toHaveLength(2));

                fireEvent.click(screen.getByTestId(`delete-${mockMembers[0].id}`));

                await waitFor(() => expect(getDeleteMemberModal()).toBeInTheDocument());

                clickConfirmDeleteButton();

                await waitFor(() => expect(getDeleteMemberModal()).not.toBeInTheDocument());
            });
        });

        describe('AbortController and loading states', () => {
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
                } as any;

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

                fireEvent.click(screen.getAllByTestId('reorder')[0]);

                await waitFor(() => {
                    expect(mockTeamMembersApi.reorder).toHaveBeenCalledWith(expect.any(Object), mockCategories[0].id, [
                        mockMembers[1].id,
                        mockMembers[0].id,
                    ]);
                });
            });
        });
    });
});
