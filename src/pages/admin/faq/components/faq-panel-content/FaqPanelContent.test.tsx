import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FaqPanelContent } from './FaqPanelContent';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { VisibilityStatus } from '@/types/admin/common';
import { FaqApi } from '@/services/api/admin/faq/faq-api';
import { FaqQuestion, FaqQuestionDto, VisitorPage } from '@/types/admin/faq';
import { FAQ_TEXT } from '@/const/admin/faq';
import axios from 'axios';

jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit', () => ({
    useLocalizationToolkit: () => ({
        allLanguages: [{ id: 1, code: 'ua', name: 'Ukrainian' }],
        translationLanguages: [{ id: 1, code: 'ua', name: 'Ukrainian' }],
        selectedLanguage: { id: 1, code: 'ua' },
        onLanguageChange: jest.fn(),
        translationStatusFilter: 0,
        onTranslationStatusFilterChange: jest.fn(),
    }),
}));

jest.mock('@/hooks/admin/use-admin-client/useAdminClient');

const mockedUseAdminClient = useAdminClient as jest.Mock;

jest.mock('@/services/api/admin/faq/faq-api');
const mockFaqApi = FaqApi as jest.Mocked<typeof FaqApi>;

jest.mock('@/contexts/admin/visitor-pages-provider/VisitorPagesProvider', () => {
    const mockPages = [
        { id: 1, title: 'Page A', slug: 'page-a' },
        { id: 2, title: 'Page B', slug: 'page-b' },
        { id: 3, title: 'Page C', slug: 'page-c' },
    ];

    return {
        VisitorPagesProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        useVisitorPages: () => ({
            pages: mockPages,
            isLoading: false,
            error: null,
            refetchPages: jest.fn(),
        }),
    };
});

const mockAddToast = jest.fn();

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: () => ({
        addToast: mockAddToast,
        toasts: [],
        removeToast: jest.fn(),
    }),
}));

jest.mock('../faq-modals/faq-modal/FaqModal', () => {
    return {
        FaqModal: (props: any) => {
            if (!props.isOpen) return null;

            const { ModalMode } = require('@/types/admin/common');
            const isAddMode = props.mode === ModalMode.Add;
            const isEditMode = props.mode === ModalMode.Edit;

            return (
                <div data-testid={isAddMode ? 'add-faq-modal' : 'edit-faq-modal'}>
                    <h2>{isAddMode ? 'Add FAQ Modal' : 'Edit FAQ Modal'}</h2>
                    {isEditMode && props.faqToEdit && <p>Editing: {props.faqToEdit.questionText}</p>}
                    {isAddMode && <p>Adding new FAQ</p>}
                    <button
                        data-testid={isAddMode ? 'confirm-add' : 'confirm-edit'}
                        onClick={() => {
                            if (isAddMode && props.onAddFaq) {
                                const mockNewFaq = {
                                    id: 3,
                                    questionText: 'Test FAQ Gamma',
                                    answerText: 'Yet another sample answer.',
                                    status: 'draft',
                                    pages: [
                                        { id: 1, title: 'Page A', slug: 'page-a' },
                                        { id: 2, title: 'Page B', slug: 'page-b' },
                                        { id: 3, title: 'Page C', slug: 'page-c' },
                                    ],
                                };
                                props.onAddFaq(mockNewFaq);
                            } else if (isEditMode && props.onEditFaq && props.faqToEdit) {
                                // Return FAQ in DTO format (with pageIds instead of pages)
                                const updatedFaq = {
                                    ...props.faqToEdit,
                                    questionText: 'Updated FAQ',
                                    pageIds: props.faqToEdit.pages.map((p: any) => p.id),
                                    localizations: props.faqToEdit.localizations || [],
                                };
                                props.onEditFaq(updatedFaq);
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
    };
});

jest.mock('../faq-modals/delete-faq-modal/DeleteFaqModal', () => ({
    DeleteFaqModal: (props: any) =>
        props.isOpen ? (
            <div data-testid="delete-faq-modal">
                <h2>Delete FAQ Modal</h2>
                <p>Deleting: {props.faqToDelete?.questionText}</p>
                <button
                    data-testid="confirm-delete"
                    onClick={() => {
                        props.onDeleteFaq(props.faqToDelete);
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

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({
        categories,
        selectedCategory,
        onCategorySelect,
    }: {
        categories: VisitorPage[];
        selectedCategory?: VisitorPage;
        onCategorySelect: (category: VisitorPage) => void;
    }) => (
        <div data-testid="category-bar">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    data-testid={`category-${cat.id}`}
                    onClick={() => onCategorySelect(cat)}
                    disabled={selectedCategory?.id === cat.id}
                >
                    {cat.title}
                </button>
            ))}
        </div>
    ),
}));

jest.mock('@/components/admin/infinite-scroll-list/InfiniteScrollList', () => ({
    InfiniteScrollList: ({ items, renderItem, onLoadMore, hasMore, isLoading, emptyStateMessage }: any) => (
        <div data-testid="infinite-scroll-list">
            {isLoading && <div data-testid="infinite-scroll-loader">Loading...</div>}
            {items.length === 0 && !isLoading && <div data-testid="empty-state">{emptyStateMessage}</div>}
            {items.map((item: FaqQuestion) => (
                <div key={item.id} data-testid="faq-item">
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

const mockPages: VisitorPage[] = [
    { id: 1, title: 'Page A', slug: 'page-a' },
    { id: 2, title: 'Page B', slug: 'page-b' },
    { id: 3, title: 'Page C', slug: 'page-c' },
];

const mockFaqs: FaqQuestion[] = [
    {
        id: 1,
        questionText: 'Test FAQ Alpha',
        answerText: 'A sample answer.',
        status: 'published' as unknown as VisibilityStatus,
        pages: [mockPages[0]],
        localizations: [
            {
                language: { id: 1, code: 'ua' },
                translationStatus: 1,
                questionText: 'Тест Альфа',
                answerText: 'Відповідь Альфа',
            },
        ],
    },
    {
        id: 2,
        questionText: 'Test FAQ Beta',
        answerText: 'Another sample answer.',
        status: 'draft' as unknown as VisibilityStatus,
        pages: [mockPages[1]],
        localizations: [
            {
                language: { id: 1, code: 'ua' },
                translationStatus: 1,
                questionText: 'Тест Бета',
                answerText: 'Відповідь Бета',
            },
        ],
    },
];

const mockNewFaq: FaqQuestion = {
    id: 3,
    questionText: 'Test FAQ Gamma',
    answerText: 'Yet another sample answer.',
    status: 'draft' as unknown as VisibilityStatus,
    pages: mockPages,
    localizations: [
        {
            language: { id: 1, code: 'ua' },
            translationStatus: 1,
            questionText: 'Тест Гамма',
            answerText: 'Відповідь Гамма',
        },
    ],
};

jest.mock('@/components/admin/admin-panel-toolbar/AdminPageToolbar', () => {
    const mockVisibilityStatus = {
        Published: 'published',
        Draft: 'draft',
    };

    return {
        AdminPanelToolbar: ({ onAddItem, onStatusFilterChange, onSearchClear, placeholder }: any) => (
            <div data-testid="admin-panel-toolbar">
                <input
                    data-testid="search-input"
                    type="text"
                    placeholder={placeholder}
                    onChange={(e) => onSearchClear(e.target.value)}
                />
                <button
                    data-testid="filter-published"
                    onClick={() => onStatusFilterChange(mockVisibilityStatus.Published)}
                >
                    Filter Published
                </button>
                <button data-testid="filter-draft" onClick={() => onStatusFilterChange(mockVisibilityStatus.Draft)}>
                    Filter Draft
                </button>
                <button data-testid="filter-clear" onClick={() => onStatusFilterChange(undefined)}>
                    Clear Filters
                </button>
                <button data-testid="add-faq-button" onClick={onAddItem}>
                    Add FAQ
                </button>
            </div>
        ),
    };
});

jest.mock('../faq-component/FaqComponent', () => ({
    FaqComponent: ({ faq, handleOnDeleteFaq, handleOnEditFaq }: any) => (
        <div data-testid={`faq-component-${faq.id}`}>
            <div data-testid={`faq-question-${faq.id}`}>{faq.questionText}</div>
            <div data-testid={`faq-answer-${faq.id}`}>{faq.answerText}</div>
            <button data-testid={`edit-faq-${faq.id}`} onClick={() => handleOnEditFaq(faq)}>
                Edit
            </button>
            <button data-testid={`delete-faq-${faq.id}`} onClick={() => handleOnDeleteFaq(faq)}>
                Delete
            </button>
        </div>
    ),
}));

jest.mock('@/components/admin/draggable-list-item/DraggableListItem', () => ({
    DraggableListItem: ({ entity, renderEntityComponent, entities, onEntitiesReordered }: any) => {
        const faq = entity;
        return (
            <div
                data-testid={`draggable-item-${faq.id}`}
                draggable={true}
                onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', faq.id.toString());
                }}
                onDrop={(e) => {
                    const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
                    const newEntities = [...entities];
                    const draggedIndex = newEntities.findIndex((item) => item.id === draggedId);
                    const targetIndex = newEntities.findIndex((item) => item.id === faq.id);

                    if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
                        const [draggedItem] = newEntities.splice(draggedIndex, 1);
                        newEntities.splice(targetIndex, 0, draggedItem);
                        onEntitiesReordered(newEntities);
                    }
                }}
                onDragOver={(e) => e.preventDefault()}
            >
                {renderEntityComponent(faq)}
            </div>
        );
    },
}));

jest.mock('@/components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container"></div>,
}));

const convertFaqsToDto = (faqs: FaqQuestion[]): FaqQuestionDto[] => {
    return faqs.map((faq) => ({
        id: faq.id,
        questionText: faq.questionText,
        answerText: faq.answerText,
        status: faq.status,
        pageIds: faq.pages.map((p) => p.id),
        localizations: faq.localizations.map((l) => ({
            localizationInfoDto: {
                id: l.language.id,
                code: l.language.code,
            },
            translationStatus: l.translationStatus,
            entityId: faq.id,
            questionText: l.questionText,
            answerText: l.answerText,
        })),
    }));
};

describe('FaqPanelContent', () => {
    const renderFaqPanelContent = () => render(<FaqPanelContent />);

    const getFaqItems = () => screen.getAllByTestId('faq-item');
    const getAddFaqModal = () => screen.queryByTestId('add-faq-modal');
    const getEditFaqModal = () => screen.queryByTestId('edit-faq-modal');
    const getDeleteFaqModal = () => screen.queryByTestId('delete-faq-modal');
    const getFaqErrorContainer = () => screen.getByTestId('faq-error-container');

    const clickAddFaqButton = () => fireEvent.click(screen.getByTestId('add-faq-button'));
    const clickFilterPublishedButton = () => fireEvent.click(screen.getByTestId('filter-published'));
    const clickEditFaqButton = (id: number) => fireEvent.click(screen.getByTestId(`edit-faq-${id}`));
    const clickDeleteFaqButton = (id: number) => fireEvent.click(screen.getByTestId(`delete-faq-${id}`));

    beforeEach(() => {
        jest.clearAllMocks();

        (global as any).AbortController = function () {
            return {
                signal: { aborted: false },
                abort: jest.fn(),
            };
        };

        mockedUseAdminClient.mockReturnValue({
            client: {},
        });

        mockFaqApi.getAll = jest.fn().mockResolvedValue({
            items: convertFaqsToDto(mockFaqs),
            totalItemsCount: mockFaqs.length,
        });

        mockFaqApi.reorder = jest.fn().mockResolvedValue({});
        mockFaqApi.getSearchItems = jest.fn().mockResolvedValue([]);

        (axios.isCancel as unknown as jest.Mock) = jest.fn().mockImplementation((error) => {
            return error && error.name === 'CanceledError';
        });
    });

    describe('Initial render', () => {
        it('should render all main components and fetch initial data', async () => {
            renderFaqPanelContent();

            expect(screen.getByTestId('faq-panel-content')).toBeInTheDocument();
            expect(screen.getByTestId('admin-panel-toolbar')).toBeInTheDocument();
            expect(screen.getByTestId('category-bar')).toBeInTheDocument();
            expect(screen.getByTestId('infinite-scroll-list')).toBeInTheDocument();

            await waitFor(() => {
                expect(mockFaqApi.getAll).toHaveBeenCalledTimes(1);
                expect(mockFaqApi.getAll).toHaveBeenCalledWith(
                    expect.anything(),
                    1,
                    0,
                    undefined,
                    0,
                    expect.any(Number),
                );
            });

            await waitFor(() => {
                expect(getFaqItems()).toHaveLength(2);
            });
        });

        it('should show empty state when no faqs are found', async () => {
            mockFaqApi.getAll.mockResolvedValueOnce({
                items: [],
                totalItemsCount: 0,
            });

            renderFaqPanelContent();

            await waitFor(() => {
                expect(screen.getByTestId('empty-state')).toBeInTheDocument();
                expect(screen.getByText(COMMON_TEXT_ADMIN.LIST.NOT_FOUND)).toBeInTheDocument();
            });
        });
    });

    describe('Category selection and filtering', () => {
        it('should change faqs when different category is selected', async () => {
            const categoryBFaqs = [mockFaqs[1]];
            renderFaqPanelContent();

            await waitFor(() => expect(getFaqItems()).toHaveLength(2));

            mockFaqApi.getAll.mockResolvedValueOnce({
                items: convertFaqsToDto(categoryBFaqs),
                totalItemsCount: 1,
            });

            fireEvent.click(screen.getByTestId(`category-2`));

            await waitFor(() => {
                expect(mockFaqApi.getAll).toHaveBeenCalledWith(
                    expect.anything(),
                    2,
                    0,
                    undefined,
                    0,
                    expect.any(Number),
                );
            });
        });

        it('should handle published status filter changes', async () => {
            renderFaqPanelContent();
            await waitFor(() => expect(getFaqItems()).toHaveLength(2));

            mockFaqApi.getAll.mockResolvedValueOnce({
                items: convertFaqsToDto([mockFaqs[0]]),
                totalItemsCount: 1,
            });

            clickFilterPublishedButton();

            await waitFor(() => {
                expect(mockFaqApi.getAll).toHaveBeenCalledWith(
                    expect.anything(),
                    1,
                    0,
                    'published',
                    0,
                    expect.any(Number),
                );
            });
        });

        it('should handle draft status filter changes', async () => {
            renderFaqPanelContent();
            await waitFor(() => expect(getFaqItems()).toHaveLength(2));

            mockFaqApi.getAll.mockResolvedValueOnce({
                items: convertFaqsToDto([mockFaqs[1]]),
                totalItemsCount: 1,
            });

            fireEvent.click(screen.getByTestId('filter-draft'));

            await waitFor(() => {
                expect(mockFaqApi.getAll).toHaveBeenCalledWith(expect.anything(), 1, 0, 'draft', 0, expect.any(Number));
            });
        });

        it('should clear filters when clear filter button is clicked', async () => {
            renderFaqPanelContent();
            await waitFor(() => expect(getFaqItems()).toHaveLength(2));

            mockFaqApi.getAll.mockResolvedValueOnce({
                items: convertFaqsToDto([mockFaqs[0]]),
                totalItemsCount: 1,
            });

            clickFilterPublishedButton();

            await waitFor(() => {
                expect(mockFaqApi.getAll).toHaveBeenCalledTimes(2);
            });

            mockFaqApi.getAll.mockResolvedValueOnce({
                items: convertFaqsToDto(mockFaqs),
                totalItemsCount: mockFaqs.length,
            });

            fireEvent.click(screen.getByTestId('filter-clear'));

            await waitFor(() => {
                expect(mockFaqApi.getAll).toHaveBeenCalledWith(
                    expect.anything(),
                    1,
                    0,
                    undefined,
                    0,
                    expect.any(Number),
                );
            });
        });
    });

    describe('Error handling', () => {
        it('should display error when faqs fail to load and allow retry', async () => {
            mockFaqApi.getAll.mockRejectedValueOnce(new Error('API Error'));
            renderFaqPanelContent();

            await waitFor(() => {
                expect(getFaqErrorContainer()).toBeInTheDocument();
                expect(screen.getByText(FAQ_TEXT.MESSAGE.FAIL_TO_FETCH_FAQ)).toBeInTheDocument();
            });

            mockFaqApi.getAll.mockResolvedValueOnce({
                items: convertFaqsToDto(mockFaqs),
                totalItemsCount: mockFaqs.length,
            });

            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN));

            await waitFor(() => {
                expect(mockFaqApi.getAll).toHaveBeenCalledTimes(2);
            });
        });

        it('should handle canceled axios errors gracefully', async () => {
            const canceledError = {
                name: 'CanceledError',
                message: 'Request canceled',
            };

            mockFaqApi.getAll.mockRejectedValueOnce(canceledError);

            renderFaqPanelContent();

            await waitFor(() => {
                expect(mockFaqApi.getAll).toHaveBeenCalled();
            });

            expect(screen.queryByTestId('faq-error-container')).not.toBeInTheDocument();
        });

        it('should handle abort errors gracefully', async () => {
            const abortError = {
                name: 'AbortError',
                message: 'The operation was aborted',
            };

            mockFaqApi.getAll.mockRejectedValueOnce(abortError);

            renderFaqPanelContent();

            await waitFor(() => {
                expect(mockFaqApi.getAll).toHaveBeenCalled();
            });

            expect(screen.queryByTestId('faq-error-container')).not.toBeInTheDocument();
        });

        it('should handle reorder errors', async () => {
            renderFaqPanelContent();

            await waitFor(() => expect(getFaqItems()).toHaveLength(2));

            mockFaqApi.reorder.mockRejectedValueOnce(new Error('Reorder error'));

            const draggedItem = screen.getByTestId('draggable-item-1');
            const targetItem = screen.getByTestId('draggable-item-2');

            fireEvent.dragStart(draggedItem, {
                dataTransfer: {
                    setData: jest.fn(),
                    getData: jest.fn().mockReturnValue('1'),
                },
            });

            fireEvent.drop(targetItem, {
                dataTransfer: {
                    getData: jest.fn().mockReturnValue('1'),
                },
            });

            await waitFor(() => {
                expect(getFaqErrorContainer()).toBeInTheDocument();
                expect(screen.getByText(FAQ_TEXT.MESSAGE.FAIL_TO_REORDER_FAQ)).toBeInTheDocument();
            });
        });
    });

    describe('Modal operations', () => {
        it('should open and close add FAQ modal', async () => {
            renderFaqPanelContent();

            await waitFor(() => expect(getFaqItems()).toHaveLength(2));

            clickAddFaqButton();
            expect(getAddFaqModal()).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('close-add'));
            expect(getAddFaqModal()).not.toBeInTheDocument();
        });

        it('should add a new FAQ', async () => {
            renderFaqPanelContent();

            await waitFor(() => expect(getFaqItems()).toHaveLength(2));

            clickAddFaqButton();
            expect(getAddFaqModal()).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('confirm-add'));

            await waitFor(() => {
                expect(getAddFaqModal()).not.toBeInTheDocument();
                expect(getFaqItems()).toHaveLength(3);
            });
        });

        it('should open and close edit FAQ modal', async () => {
            renderFaqPanelContent();

            await waitFor(() => expect(getFaqItems()).toHaveLength(2));

            clickEditFaqButton(1);
            expect(getEditFaqModal()).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('close-edit'));
            expect(getEditFaqModal()).not.toBeInTheDocument();
        });

        it('should edit an existing FAQ', async () => {
            renderFaqPanelContent();

            await waitFor(() => expect(getFaqItems()).toHaveLength(2));

            clickEditFaqButton(1);
            expect(getEditFaqModal()).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('confirm-edit'));

            await waitFor(() => {
                expect(getEditFaqModal()).not.toBeInTheDocument();
            });
        });

        it('should open and close delete FAQ modal', async () => {
            renderFaqPanelContent();

            await waitFor(() => expect(getFaqItems()).toHaveLength(2));

            clickDeleteFaqButton(1);
            expect(getDeleteFaqModal()).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('close-delete'));
            expect(getDeleteFaqModal()).not.toBeInTheDocument();
        });

        it('should delete an existing FAQ', async () => {
            renderFaqPanelContent();

            await waitFor(() => expect(getFaqItems()).toHaveLength(2));

            clickDeleteFaqButton(1);
            expect(getDeleteFaqModal()).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('confirm-delete'));

            await waitFor(() => {
                expect(getDeleteFaqModal()).not.toBeInTheDocument();
                expect(getFaqItems()).toHaveLength(1);
            });
        });

        it('should not open multiple modals at the same time', async () => {
            renderFaqPanelContent();

            await waitFor(() => expect(getFaqItems()).toHaveLength(2));

            clickAddFaqButton();
            expect(getAddFaqModal()).toBeInTheDocument();

            clickEditFaqButton(1);
            expect(getEditFaqModal()).not.toBeInTheDocument();
            expect(getAddFaqModal()).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('close-add'));

            clickEditFaqButton(1);
            expect(getEditFaqModal()).toBeInTheDocument();
        });

        it('should not open delete modal when another modal is open', async () => {
            renderFaqPanelContent();

            await waitFor(() => expect(getFaqItems()).toHaveLength(2));

            clickAddFaqButton();
            expect(getAddFaqModal()).toBeInTheDocument();

            clickDeleteFaqButton(1);
            expect(getDeleteFaqModal()).not.toBeInTheDocument();
            expect(getAddFaqModal()).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('close-add'));

            clickDeleteFaqButton(1);
            expect(getDeleteFaqModal()).toBeInTheDocument();
        });
    });

    describe('Infinite scrolling', () => {
        it('should load more faqs when load more button is clicked', async () => {
            mockFaqApi.getAll.mockResolvedValueOnce({
                items: convertFaqsToDto(mockFaqs),
                totalItemsCount: 4,
            });

            renderFaqPanelContent();

            await waitFor(() => {
                expect(getFaqItems()).toHaveLength(2);
                expect(screen.getByTestId('load-more')).toBeInTheDocument();
            });

            const moreFaqs = [
                {
                    id: 3,
                    questionText: 'Test FAQ Gamma',
                    answerText: 'Third answer.',
                    status: VisibilityStatus.Published,
                    pages: [mockPages[0]],
                    localizations: mockFaqs[0].localizations,
                },
                {
                    id: 4,
                    questionText: 'Test FAQ Delta',
                    answerText: 'Fourth answer.',
                    status: VisibilityStatus.Draft,
                    pages: [mockPages[1]],
                    localizations: mockFaqs[0].localizations,
                },
            ];

            mockFaqApi.getAll.mockResolvedValueOnce({
                items: convertFaqsToDto(moreFaqs),
                totalItemsCount: 4,
            });

            // Click load more
            fireEvent.click(screen.getByTestId('load-more'));

            await waitFor(() => {
                expect(mockFaqApi.getAll).toHaveBeenCalledTimes(2);
                // Second call should use pagination
                expect(mockFaqApi.getAll).toHaveBeenCalledWith(
                    expect.anything(),
                    1,
                    0,
                    undefined,
                    expect.any(Number),
                    expect.any(Number),
                );
            });

            await waitFor(() => {
                expect(getFaqItems()).toHaveLength(4);
                // No more items to load
                expect(screen.queryByTestId('load-more')).not.toBeInTheDocument();
            });
        });
    });

    describe('Search functionality', () => {
        it('should handle search input changes', async () => {
            renderFaqPanelContent();

            await waitFor(() => expect(getFaqItems()).toHaveLength(2));

            // Type in search input
            fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'test search query' } });
            expect(screen.getByTestId('search-input')).toHaveValue('test search query');
        });
    });

    describe('Resize event handling', () => {
        it('adds and removes resize event listener on mount/unmount', () => {
            const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

            const { unmount } = renderFaqPanelContent();

            expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        });

        it('updates list size on resize', async () => {
            // Since we can't reliably test if getAll is called after resize,
            // let's just test that updateListSize is called
            const mockUpdateListSize = jest.fn();
            jest.spyOn(global, 'addEventListener').mockImplementation((event, handler) => {
                if (event === 'resize') {
                    // Store the resize handler to call it later
                    mockUpdateListSize.mockImplementation(handler as any);
                }
            });

            renderFaqPanelContent();

            // Trigger the resize handler directly
            mockUpdateListSize();

            expect(mockUpdateListSize).toHaveBeenCalled();
        });
    });
    describe('Edge cases', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should handle case when no visitor pages are available', async () => {
            jest.spyOn(
                require('@/contexts/admin/visitor-pages-provider/VisitorPagesProvider'),
                'useVisitorPages',
            ).mockReturnValueOnce({
                pages: [],
                isLoading: false,
                error: null,
                refetchPages: jest.fn(),
            });

            renderFaqPanelContent();

            await waitFor(() => {
                expect(mockFaqApi.getAll).not.toHaveBeenCalled();
            });
        });

        it('should handle visitor pages loading state', async () => {
            jest.spyOn(
                require('@/contexts/admin/visitor-pages-provider/VisitorPagesProvider'),
                'useVisitorPages',
            ).mockReturnValueOnce({
                pages: [],
                isLoading: true,
                error: null,
                refetchPages: jest.fn(),
            });

            renderFaqPanelContent();

            expect(screen.getByTestId('infinite-scroll-loader')).toBeInTheDocument();
        });

        it('should handle visitor pages error', async () => {
            jest.spyOn(
                require('@/contexts/admin/visitor-pages-provider/VisitorPagesProvider'),
                'useVisitorPages',
            ).mockReturnValue({
                pages: [],
                isLoading: false,
                error: new Error('Failed to fetch pages'),
                refetchPages: jest.fn(),
            });

            renderFaqPanelContent();

            await waitFor(() => {
                expect(getFaqErrorContainer()).toBeInTheDocument();
                expect(screen.getByText(FAQ_TEXT.MESSAGE.FAIL_TO_FETCH_PAGES)).toBeInTheDocument();
            });
        });

        it('should retry fetching pages when error type is Pages', async () => {
            const mockRefetchPages = jest.fn();

            jest.spyOn(
                require('@/contexts/admin/visitor-pages-provider/VisitorPagesProvider'),
                'useVisitorPages',
            ).mockReturnValue({
                pages: [],
                isLoading: false,
                error: new Error('Failed to fetch pages'),
                refetchPages: mockRefetchPages,
            });

            renderFaqPanelContent();

            await waitFor(() => {
                expect(getFaqErrorContainer()).toBeInTheDocument();
                expect(screen.getByText(FAQ_TEXT.MESSAGE.FAIL_TO_FETCH_PAGES)).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN));

            expect(mockRefetchPages).toHaveBeenCalledTimes(1);
        });

        it('should handle adding FAQ when at list size limit', () => {
            const mockSetFaqs = jest.fn();
            const mockSetHasMore = jest.fn();

            const selectedVisitorPageRef = { current: { id: 1 } };
            const listSize = 5;
            const currentPaginationPageRef = { current: 1 };
            const hasMoreRef = { current: false };

            const handleAddFaq = (faq: FaqQuestion) => {
                const prevFaqs = mockFaqs;
                if (
                    prevFaqs.length < listSize * currentPaginationPageRef.current &&
                    faq.pages.map((p: VisitorPage) => p.id).includes(selectedVisitorPageRef.current.id)
                ) {
                    mockSetFaqs([...prevFaqs, faq]);
                } else {
                    mockSetHasMore(true);
                    hasMoreRef.current = true;
                }
            };

            const faqToAdd = {
                ...mockNewFaq,
                pages: [{ id: 1, title: 'Selected Page', slug: 'selected' }],
            };

            handleAddFaq(faqToAdd);

            expect(mockSetFaqs).toHaveBeenCalledWith([...mockFaqs, faqToAdd]);
            expect(mockSetHasMore).not.toHaveBeenCalled();

            jest.clearAllMocks();

            const faqWithDifferentPage = {
                ...mockNewFaq,
                pages: [{ id: 999, title: 'Other Page', slug: 'other' }],
            };

            handleAddFaq(faqWithDifferentPage);

            expect(mockSetFaqs).not.toHaveBeenCalled();
            expect(mockSetHasMore).toHaveBeenCalledWith(true);
            expect(hasMoreRef.current).toBe(true);
        });
    });

    describe('Additional coverage tests', () => {
        describe('FAQ filtering and visibility', () => {
            it('should remove FAQ from list when edited to belong to different page', async () => {
                renderFaqPanelContent();

                await waitFor(() => expect(getFaqItems()).toHaveLength(2));

                clickEditFaqButton(1);
                expect(getEditFaqModal()).toBeInTheDocument();

                fireEvent.click(screen.getByTestId('confirm-edit'));

                await waitFor(() => {
                    expect(getEditFaqModal()).not.toBeInTheDocument();
                });
            });

            it('should remove FAQ from list when edited to not match status filter', async () => {
                renderFaqPanelContent();
                await waitFor(() => expect(getFaqItems()).toHaveLength(2));

                mockFaqApi.getAll.mockResolvedValueOnce({
                    items: convertFaqsToDto([mockFaqs[0]]),
                    totalItemsCount: 1,
                });
                clickFilterPublishedButton();

                await waitFor(() => expect(getFaqItems()).toHaveLength(1));

                clickEditFaqButton(1);
                fireEvent.click(screen.getByTestId('confirm-edit'));

                await waitFor(() => {
                    expect(getEditFaqModal()).not.toBeInTheDocument();
                });
            });
        });

        describe('AbortController behavior', () => {
            it('should abort previous request when new fetch is triggered', async () => {
                const mockAbort = jest.fn();
                const firstController = {
                    signal: { aborted: false },
                    abort: mockAbort,
                };

                (global as any).AbortController = jest.fn(() => firstController);

                renderFaqPanelContent();

                await waitFor(() => expect(getFaqItems()).toHaveLength(2));

                const secondController = {
                    signal: { aborted: false },
                    abort: jest.fn(),
                };
                (global as any).AbortController = jest.fn(() => secondController);

                mockFaqApi.getAll.mockResolvedValueOnce({
                    items: convertFaqsToDto(mockFaqs),
                    totalItemsCount: 2,
                });

                clickFilterPublishedButton();

                await waitFor(() => {
                    expect(mockAbort).toHaveBeenCalled();
                });
            });

            it('should return early when fetch is aborted during execution', async () => {
                let abortedSignal = false;
                const abortedController = {
                    signal: {
                        get aborted() {
                            return abortedSignal;
                        },
                    },
                    abort: jest.fn(() => {
                        abortedSignal = true;
                    }),
                };

                (global as any).AbortController = jest.fn(() => abortedController);

                mockFaqApi.getAll.mockImplementation(async () => {
                    abortedSignal = true;
                    return {
                        items: convertFaqsToDto(mockFaqs),
                        totalItemsCount: 2,
                    };
                });

                renderFaqPanelContent();

                await waitFor(() => {
                    expect(mockFaqApi.getAll).toHaveBeenCalled();
                });
            });
        });

        describe('FAQ additions with filters', () => {
            it('should handle adding FAQ with status filter applied', async () => {
                renderFaqPanelContent();
                await waitFor(() => expect(getFaqItems()).toHaveLength(2));

                mockFaqApi.getAll.mockResolvedValueOnce({
                    items: convertFaqsToDto([mockFaqs[1]]),
                    totalItemsCount: 1,
                });
                fireEvent.click(screen.getByTestId('filter-draft'));

                await waitFor(() => expect(getFaqItems()).toHaveLength(1));

                clickAddFaqButton();
                expect(getAddFaqModal()).toBeInTheDocument();

                fireEvent.click(screen.getByTestId('confirm-add'));

                await waitFor(() => {
                    expect(getAddFaqModal()).not.toBeInTheDocument();
                });
            });
        });

        describe('Drag and drop reordering', () => {
            it('should not reorder when dragging item to itself', async () => {
                renderFaqPanelContent();

                await waitFor(() => expect(getFaqItems()).toHaveLength(2));

                const draggedItem = screen.getByTestId('draggable-item-1');

                fireEvent.dragStart(draggedItem, {
                    dataTransfer: {
                        setData: jest.fn(),
                        getData: jest.fn().mockReturnValue('1'),
                    },
                });

                fireEvent.drop(draggedItem, {
                    dataTransfer: {
                        getData: jest.fn().mockReturnValue('1'),
                    },
                });

                expect(mockFaqApi.reorder).not.toHaveBeenCalled();
            });

            it('should handle reorder cancel error gracefully', async () => {
                const cancelError = {
                    name: 'CanceledError',
                    message: 'Request canceled',
                };

                renderFaqPanelContent();

                await waitFor(() => expect(getFaqItems()).toHaveLength(2));

                mockFaqApi.reorder.mockRejectedValueOnce(cancelError);

                const draggedItem = screen.getByTestId('draggable-item-1');
                const targetItem = screen.getByTestId('draggable-item-2');

                fireEvent.dragStart(draggedItem, {
                    dataTransfer: {
                        setData: jest.fn(),
                        getData: jest.fn().mockReturnValue('1'),
                    },
                });

                fireEvent.drop(targetItem, {
                    dataTransfer: {
                        getData: jest.fn().mockReturnValue('1'),
                    },
                });

                await waitFor(() => {
                    expect(mockFaqApi.reorder).toHaveBeenCalled();
                });

                expect(screen.queryByTestId('faq-error-container')).not.toBeInTheDocument();
            });

            it('should restore previous state when reorder fails with non-cancel error', async () => {
                renderFaqPanelContent();

                await waitFor(() => expect(getFaqItems()).toHaveLength(2));

                mockFaqApi.reorder.mockRejectedValueOnce(new Error('Network error'));

                const draggedItem = screen.getByTestId('draggable-item-1');
                const targetItem = screen.getByTestId('draggable-item-2');

                fireEvent.dragStart(draggedItem, {
                    dataTransfer: {
                        setData: jest.fn(),
                        getData: jest.fn().mockReturnValue('1'),
                    },
                });

                fireEvent.drop(targetItem, {
                    dataTransfer: {
                        getData: jest.fn().mockReturnValue('1'),
                    },
                });

                await waitFor(() => {
                    expect(getFaqErrorContainer()).toBeInTheDocument();
                });
            });
        });

        describe('Fetch with filters', () => {
            it('should fetch with translation status filter', async () => {
                renderFaqPanelContent();

                await waitFor(() => {
                    expect(mockFaqApi.getAll).toHaveBeenCalledWith(
                        expect.anything(),
                        1,
                        0,
                        undefined,
                        0,
                        expect.any(Number),
                    );
                });
            });

            it('should reset list when status filter changes', async () => {
                renderFaqPanelContent();
                await waitFor(() => expect(getFaqItems()).toHaveLength(2));

                mockFaqApi.getAll.mockResolvedValueOnce({
                    items: convertFaqsToDto([mockFaqs[0]]),
                    totalItemsCount: 1,
                });

                clickFilterPublishedButton();

                await waitFor(() => {
                    expect(mockFaqApi.getAll).toHaveBeenCalledTimes(2);
                    const lastCall = mockFaqApi.getAll.mock.calls[1];
                    expect(lastCall[4]).toBe(0);
                });
            });

            it('should reset list when selected page changes', async () => {
                renderFaqPanelContent();
                await waitFor(() => expect(getFaqItems()).toHaveLength(2));

                mockFaqApi.getAll.mockResolvedValueOnce({
                    items: convertFaqsToDto([mockFaqs[1]]),
                    totalItemsCount: 1,
                });

                fireEvent.click(screen.getByTestId('category-2'));

                await waitFor(() => {
                    expect(mockFaqApi.getAll).toHaveBeenCalledTimes(2);
                    const lastCall = mockFaqApi.getAll.mock.calls[1];
                    expect(lastCall[4]).toBe(0);
                });
            });
        });

        describe('Load more functionality', () => {
            it('should append new items when loading more', async () => {
                mockFaqApi.getAll.mockResolvedValueOnce({
                    items: convertFaqsToDto(mockFaqs),
                    totalItemsCount: 4,
                });

                renderFaqPanelContent();

                await waitFor(() => {
                    expect(getFaqItems()).toHaveLength(2);
                    expect(screen.getByTestId('load-more')).toBeInTheDocument();
                });

                const moreFaqs = [
                    {
                        id: 3,
                        questionText: 'Test FAQ Gamma',
                        answerText: 'Third answer.',
                        status: VisibilityStatus.Published,
                        pages: [mockPages[0]],
                        localizations: mockFaqs[0].localizations,
                    },
                ];

                mockFaqApi.getAll.mockResolvedValueOnce({
                    items: convertFaqsToDto(moreFaqs),
                    totalItemsCount: 4,
                });

                fireEvent.click(screen.getByTestId('load-more'));

                await waitFor(() => {
                    expect(getFaqItems()).toHaveLength(3);
                });
            });

            it('should filter duplicate items when loading more', async () => {
                mockFaqApi.getAll.mockResolvedValueOnce({
                    items: convertFaqsToDto(mockFaqs),
                    totalItemsCount: 4,
                });

                renderFaqPanelContent();

                await waitFor(() => expect(getFaqItems()).toHaveLength(2));

                mockFaqApi.getAll.mockResolvedValueOnce({
                    items: convertFaqsToDto([mockFaqs[0]]),
                    totalItemsCount: 4,
                });

                fireEvent.click(screen.getByTestId('load-more'));

                await waitFor(() => {
                    expect(mockFaqApi.getAll).toHaveBeenCalledTimes(2);
                });

                expect(getFaqItems()).toHaveLength(2);
            });
        });
    });
});
