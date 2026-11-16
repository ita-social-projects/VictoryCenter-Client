import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FaqPanelContent } from './FaqPanelContent';
import { COMMON_TEXT_ADMIN, UI_CONFIG } from '@/const/admin/common';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { VisibilityStatus } from '@/types/admin/common';
import { FaqApi } from '@/services/api/admin/faq/faq-api';
import { FaqQuestion, FaqQuestionDto, VisitorPage } from '@/types/admin/faq';
import { FAQ_TEXT } from '@/const/admin/faq';
import { ToastType } from '@/types/admin/toast';
import axios from 'axios';

const mockPages: VisitorPage[] = [
    { id: 1, title: 'Page A', slug: 'page-a' },
    { id: 2, title: 'Page B', slug: 'page-b' },
    { id: 3, title: 'Page C', slug: 'page-c' },
];

let mockEditedFaqStatus: VisibilityStatus | undefined;
let mockCreatedFaqStatus: VisibilityStatus | undefined;

const createLocalization = (questionText: string, answerText: string) => ({
    language: { id: 1, code: 'ua' },
    translationStatus: 1,
    questionText,
    answerText,
});

const createFaq = (overrides: Partial<FaqQuestion> & { id: number }): FaqQuestion => ({
    questionText: `Test FAQ ${overrides.id}`,
    answerText: 'A sample answer.',
    status: VisibilityStatus.Draft,
    pages: [mockPages[0]],
    localizations: [createLocalization('Питання', 'Відповідь')],
    ...overrides,
});

const mockFaqs: FaqQuestion[] = [
    createFaq({
        id: 1,
        questionText: 'Test FAQ Alpha',
        answerText: 'A sample answer.',
        status: VisibilityStatus.Published,
        pages: [mockPages[0]],
        localizations: [createLocalization('Тест Альфа', 'Відповідь Альфа')],
    }),
    createFaq({
        id: 2,
        questionText: 'Test FAQ Beta',
        answerText: 'Another sample answer.',
        status: VisibilityStatus.Draft,
        pages: [mockPages[1]],
        localizations: [createLocalization('Тест Бета', 'Відповідь Бета')],
    }),
];

const mockNewFaq: FaqQuestion = createFaq({
    id: 3,
    questionText: 'Test FAQ Gamma',
    answerText: 'Yet another sample answer.',
    status: VisibilityStatus.Draft,
    pages: mockPages,
    localizations: [createLocalization('Тест Гамма', 'Відповідь Гамма')],
});

const convertFaqsToDto = (faqs: FaqQuestion[]): FaqQuestionDto[] =>
    faqs.map((faq) => ({
        id: faq.id,
        questionText: faq.questionText,
        answerText: faq.answerText,
        status: faq.status,
        pageIds: faq.pages.map((p) => p.id),
        localizations: faq.localizations.map((l) => ({
            localizationInfoDto: { id: l.language.id, code: l.language.code },
            translationStatus: l.translationStatus,
            entityId: faq.id,
            questionText: l.questionText,
            answerText: l.answerText,
        })),
    }));

const convertFaqToDto = (faq: FaqQuestion): FaqQuestionDto => convertFaqsToDto([faq])[0];

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

jest.mock('@/contexts/admin/visitor-pages-provider/VisitorPagesProvider', () => ({
    VisitorPagesProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useVisitorPages: () => ({
        pages: mockPages,
        isLoading: false,
        error: null,
        refetchPages: jest.fn(),
    }),
}));

const mockAddToast = jest.fn();

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: () => ({
        addToast: mockAddToast,
        toasts: [],
        removeToast: jest.fn(),
    }),
}));

jest.mock('../faq-modals/faq-modal/FaqModal', () => ({
    FaqModal: (props: any) => {
        if (!props.isOpen) return null;

        const { ModalMode, VisibilityStatus: Status } = require('@/types/admin/common');
        const isAddMode = props.mode === ModalMode.Add;
        const isEditMode = props.mode === ModalMode.Edit;

        const handleConfirm = () => {
            if (isAddMode && props.onAddFaq) {
                props.onAddFaq({
                    id: 3,
                    questionText: 'Test FAQ Gamma',
                    answerText: 'Yet another sample answer.',
                    status: mockCreatedFaqStatus ?? Status.Draft,
                    pages: mockPages,
                    localizations: [],
                });
            } else if (isEditMode && props.onEditFaq && props.faqToEdit) {
                props.onEditFaq({
                    ...props.faqToEdit,
                    questionText: 'Updated FAQ',
                    status: mockEditedFaqStatus ?? props.faqToEdit.status,
                    pageIds: props.faqToEdit.pages.map((p: any) => p.id),
                    localizations: props.faqToEdit.localizations || [],
                });
            }
            props.onClose();
        };

        return (
            <div data-testid={isAddMode ? 'add-faq-modal' : 'edit-faq-modal'}>
                <h2>{isAddMode ? 'Add FAQ Modal' : 'Edit FAQ Modal'}</h2>
                {isEditMode && props.faqToEdit && <p>Editing: {props.faqToEdit.questionText}</p>}
                {isAddMode && <p>Adding new FAQ</p>}
                <button data-testid={isAddMode ? 'confirm-add' : 'confirm-edit'} onClick={handleConfirm}>
                    {isAddMode ? 'Confirm Add' : 'Confirm Edit'}
                </button>
                <button data-testid={isAddMode ? 'close-add' : 'close-edit'} onClick={props.onClose}>
                    {isAddMode ? 'Close Add' : 'Close Edit'}
                </button>
            </div>
        );
    },
}));

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

jest.mock('../faq-modals/translate-faq-modal/TranslateFaqModal', () => ({
    TranslateFaqModal: (props: any) => {
        if (!props.isOpen) return null;

        const { VisibilityStatus: Status } = require('@/types/admin/common');

        return (
            <div data-testid="translate-faq-modal">
                <p>Translate FAQ Modal</p>
                <button
                    data-testid="confirm-translate"
                    onClick={() =>
                        props.onTranslateFaq({
                            id: props.faqToTranslate?.id ?? 1,
                            questionText: 'Translated question',
                            answerText: 'Translated answer',
                            status: props.faqToTranslate?.status ?? Status.Draft,
                            pages: props.faqToTranslate?.pages ?? [],
                            localizations: props.faqToTranslate?.localizations ?? [],
                        })
                    }
                >
                    Confirm Translate
                </button>
                <button data-testid="close-translate" onClick={props.onClose}>
                    Close Translate
                </button>
            </div>
        );
    },
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

let lastToolbarProps: any = null;

jest.mock('@/components/admin/admin-panel-toolbar/AdminPageToolbar', () => {
    const { VisibilityStatus: Status } = require('@/types/admin/common');

    return {
        AdminPanelToolbar: (props: any) => {
            lastToolbarProps = props;

            return (
                <div data-testid="admin-panel-toolbar">
                    <input
                        data-testid="search-input"
                        type="text"
                        placeholder={props.placeholder}
                        onChange={(e) => props.onSearchClear(e.target.value)}
                    />
                    <button
                        data-testid="filter-published"
                        onClick={() => props.onStatusFilterChange?.(Status.Published)}
                    >
                        Filter Published
                    </button>
                    <button data-testid="filter-draft" onClick={() => props.onStatusFilterChange?.(Status.Draft)}>
                        Filter Draft
                    </button>
                    <button data-testid="filter-clear" onClick={() => props.onStatusFilterChange?.(undefined)}>
                        Clear Filters
                    </button>
                    <button data-testid="add-faq-button" onClick={props.onAddItem}>
                        Add FAQ
                    </button>
                </div>
            );
        },
    };
});

export const getLastToolbarProps = () => lastToolbarProps;

jest.mock('../faq-component/FaqComponent', () => ({
    FaqComponent: ({ faq, handleOnDeleteFaq, handleOnEditFaq, handleOnTranslateFaq }: any) => (
        <div data-testid={`faq-component-${faq.id}`}>
            <div data-testid={`faq-question-${faq.id}`}>{faq.questionText}</div>
            <div data-testid={`faq-answer-${faq.id}`}>{faq.answerText}</div>
            <button data-testid={`edit-faq-${faq.id}`} onClick={() => handleOnEditFaq(faq)}>
                Edit
            </button>
            <button data-testid={`delete-faq-${faq.id}`} onClick={() => handleOnDeleteFaq(faq)}>
                Delete
            </button>
            <button data-testid={`translate-faq-${faq.id}`} onClick={() => handleOnTranslateFaq(faq)}>
                Translate
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

describe('FaqPanelContent', () => {
    const renderFaqPanelContent = () => render(<FaqPanelContent />);

    const renderPanelWithFaqs = async (expectedCount = mockFaqs.length) => {
        const view = renderFaqPanelContent();
        await waitFor(() => expect(getFaqItems()).toHaveLength(expectedCount));
        return view;
    };

    const getFaqItems = () => screen.getAllByTestId('faq-item');
    const getAddFaqModal = () => screen.queryByTestId('add-faq-modal');
    const getEditFaqModal = () => screen.queryByTestId('edit-faq-modal');
    const getDeleteFaqModal = () => screen.queryByTestId('delete-faq-modal');
    const getTranslateFaqModal = () => screen.queryByTestId('translate-faq-modal');
    const getFaqErrorContainer = () => screen.getByTestId('faq-error-container');
    const getCategoryButton = (id: number) => screen.getByTestId(`category-${id}`);

    const click = (testId: string) => fireEvent.click(screen.getByTestId(testId));
    const clickAddFaqButton = () => click('add-faq-button');
    const clickFilterPublishedButton = () => click('filter-published');
    const clickEditFaqButton = (id: number) => click(`edit-faq-${id}`);
    const clickDeleteFaqButton = (id: number) => click(`delete-faq-${id}`);
    const clickTranslateFaqButton = (id: number) => click(`translate-faq-${id}`);

    const dragFaq = (fromId: number, toId: number) => {
        const draggedId = String(fromId);
        fireEvent.dragStart(screen.getByTestId(`draggable-item-${fromId}`), {
            dataTransfer: { setData: jest.fn(), getData: jest.fn().mockReturnValue(draggedId) },
        });
        fireEvent.drop(screen.getByTestId(`draggable-item-${toId}`), {
            dataTransfer: { getData: jest.fn().mockReturnValue(draggedId) },
        });
    };

    const editFaqAndConfirm = (id: number, statusAfterEdit?: VisibilityStatus) => {
        mockEditedFaqStatus = statusAfterEdit;
        clickEditFaqButton(id);
        click('confirm-edit');
    };

    const addFaqAndConfirm = (statusOfCreatedFaq?: VisibilityStatus) => {
        mockCreatedFaqStatus = statusOfCreatedFaq;
        clickAddFaqButton();
        click('confirm-add');
    };

    const selectSuggestion = (faqId: number) =>
        act(() => {
            getLastToolbarProps().onSuggestionSelect(faqId);
        });

    const clearSearch = () => fireEvent.change(screen.getByTestId('search-input'), { target: { value: '' } });

    const mockGetAllOnce = (faqs: FaqQuestion[], totalItemsCount = faqs.length) =>
        mockFaqApi.getAll.mockResolvedValueOnce({ items: convertFaqsToDto(faqs), totalItemsCount });

    const mockGetById = (faq: FaqQuestion, overrides: Partial<FaqQuestionDto> = {}) =>
        mockFaqApi.getById.mockResolvedValue({ ...convertFaqToDto(faq), ...overrides });

    const getAllArgs = (pageId: number, status?: VisibilityStatus | string, offset: unknown = 0) => [
        expect.anything(),
        pageId,
        0,
        status,
        offset,
        expect.any(Number),
    ];

    const expectGetAllCalledWith = (pageId: number, status?: VisibilityStatus | string, offset: unknown = 0) =>
        expect(mockFaqApi.getAll).toHaveBeenCalledWith(...getAllArgs(pageId, status, offset));

    const expectActiveTab = (activeId: number) =>
        mockPages.forEach((page) => {
            const button = getCategoryButton(page.id);
            if (page.id === activeId) {
                expect(button).toBeDisabled();
            } else {
                expect(button).not.toBeDisabled();
            }
        });

    beforeEach(() => {
        jest.clearAllMocks();
        mockEditedFaqStatus = undefined;
        mockCreatedFaqStatus = undefined;

        (global as any).AbortController = function () {
            return {
                signal: { aborted: false },
                abort: jest.fn(),
            };
        };

        mockedUseAdminClient.mockReturnValue({ client: {} });

        mockFaqApi.getAll = jest.fn().mockResolvedValue({
            items: convertFaqsToDto(mockFaqs),
            totalItemsCount: mockFaqs.length,
        });
        mockFaqApi.getById = jest.fn();
        mockFaqApi.reorder = jest.fn().mockResolvedValue({});
        mockFaqApi.fetchFaqSearchItems = jest.fn().mockResolvedValue([]);

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
            expect(screen.getByTestId('toast-container')).toBeInTheDocument();

            await waitFor(() => {
                expect(mockFaqApi.getAll).toHaveBeenCalledTimes(1);
                expectGetAllCalledWith(1);
            });

            await waitFor(() => expect(getFaqItems()).toHaveLength(2));
        });

        it('should show empty state when no faqs are found', async () => {
            mockGetAllOnce([]);

            renderFaqPanelContent();

            await waitFor(() => {
                expect(screen.getByTestId('empty-state')).toBeInTheDocument();
                expect(screen.getByText(COMMON_TEXT_ADMIN.LIST.NOT_FOUND)).toBeInTheDocument();
            });
        });
    });

    describe('Category selection and filtering', () => {
        it('should change faqs when different category is selected', async () => {
            await renderPanelWithFaqs();
            mockGetAllOnce([mockFaqs[1]]);

            click('category-2');

            await waitFor(() => expectGetAllCalledWith(2));
        });

        it.each([
            ['published', 'filter-published', VisibilityStatus.Published, mockFaqs[0]],
            ['draft', 'filter-draft', VisibilityStatus.Draft, mockFaqs[1]],
        ])('should handle %s status filter changes', async (_name, buttonTestId, status, faq) => {
            await renderPanelWithFaqs();
            mockGetAllOnce([faq]);

            click(buttonTestId);

            await waitFor(() => expectGetAllCalledWith(1, status));
        });

        it('should clear filters when clear filter button is clicked', async () => {
            await renderPanelWithFaqs();
            mockGetAllOnce([mockFaqs[0]]);

            clickFilterPublishedButton();
            await waitFor(() => expect(mockFaqApi.getAll).toHaveBeenCalledTimes(2));

            mockGetAllOnce(mockFaqs);
            click('filter-clear');

            await waitFor(() => expectGetAllCalledWith(1, undefined));
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

            mockGetAllOnce(mockFaqs);
            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN));

            await waitFor(() => expect(mockFaqApi.getAll).toHaveBeenCalledTimes(2));
        });

        it.each([
            ['canceled axios', { name: 'CanceledError', message: 'Request canceled' }],
            ['abort', { name: 'AbortError', message: 'The operation was aborted' }],
        ])('should handle %s errors gracefully', async (_name, error) => {
            mockFaqApi.getAll.mockRejectedValueOnce(error);

            renderFaqPanelContent();

            await waitFor(() => expect(mockFaqApi.getAll).toHaveBeenCalled());
            expect(screen.queryByTestId('faq-error-container')).not.toBeInTheDocument();
        });

        it('should handle reorder errors', async () => {
            await renderPanelWithFaqs();
            mockFaqApi.reorder.mockRejectedValueOnce(new Error('Reorder error'));

            dragFaq(1, 2);

            await waitFor(() => {
                expect(getFaqErrorContainer()).toBeInTheDocument();
                expect(screen.getByText(FAQ_TEXT.MESSAGE.FAIL_TO_REORDER_FAQ)).toBeInTheDocument();
            });
        });
    });

    describe('Modal operations', () => {
        it('should open and close add FAQ modal', async () => {
            await renderPanelWithFaqs();

            clickAddFaqButton();
            expect(getAddFaqModal()).toBeInTheDocument();

            click('close-add');
            expect(getAddFaqModal()).not.toBeInTheDocument();
        });

        it('should add a new FAQ', async () => {
            await renderPanelWithFaqs();

            addFaqAndConfirm();

            await waitFor(() => {
                expect(getAddFaqModal()).not.toBeInTheDocument();
                expect(getFaqItems()).toHaveLength(3);
            });
        });

        it('should open and close edit FAQ modal', async () => {
            await renderPanelWithFaqs();

            clickEditFaqButton(1);
            expect(getEditFaqModal()).toBeInTheDocument();

            click('close-edit');
            expect(getEditFaqModal()).not.toBeInTheDocument();
        });

        it('should edit an existing FAQ', async () => {
            await renderPanelWithFaqs();

            editFaqAndConfirm(1);

            await waitFor(() => expect(getEditFaqModal()).not.toBeInTheDocument());
        });

        it('should open and close delete FAQ modal', async () => {
            await renderPanelWithFaqs();

            clickDeleteFaqButton(1);
            expect(getDeleteFaqModal()).toBeInTheDocument();

            click('close-delete');
            expect(getDeleteFaqModal()).not.toBeInTheDocument();
        });

        it('should delete an existing FAQ', async () => {
            await renderPanelWithFaqs();

            clickDeleteFaqButton(1);
            expect(getDeleteFaqModal()).toBeInTheDocument();

            click('confirm-delete');

            await waitFor(() => {
                expect(getDeleteFaqModal()).not.toBeInTheDocument();
                expect(getFaqItems()).toHaveLength(1);
            });
        });

        it('should not open multiple modals at the same time', async () => {
            await renderPanelWithFaqs();

            clickAddFaqButton();
            expect(getAddFaqModal()).toBeInTheDocument();

            clickEditFaqButton(1);
            expect(getEditFaqModal()).not.toBeInTheDocument();
            expect(getAddFaqModal()).toBeInTheDocument();

            click('close-add');

            clickEditFaqButton(1);
            expect(getEditFaqModal()).toBeInTheDocument();
        });

        it('should not open delete modal when another modal is open', async () => {
            await renderPanelWithFaqs();

            clickAddFaqButton();
            expect(getAddFaqModal()).toBeInTheDocument();

            clickDeleteFaqButton(1);
            expect(getDeleteFaqModal()).not.toBeInTheDocument();
            expect(getAddFaqModal()).toBeInTheDocument();

            click('close-add');

            clickDeleteFaqButton(1);
            expect(getDeleteFaqModal()).toBeInTheDocument();
        });

        it('should open and close translate FAQ modal', async () => {
            await renderPanelWithFaqs();

            clickTranslateFaqButton(1);
            expect(getTranslateFaqModal()).toBeInTheDocument();

            click('close-translate');
            expect(getTranslateFaqModal()).not.toBeInTheDocument();
        });

        it('should handle translate success and show toast', async () => {
            await renderPanelWithFaqs();

            clickTranslateFaqButton(1);
            expect(getTranslateFaqModal()).toBeInTheDocument();

            click('confirm-translate');

            await waitFor(() => {
                expect(getTranslateFaqModal()).not.toBeInTheDocument();
                expect(mockAddToast).toHaveBeenCalledWith(
                    COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_PUBLISHED_SUCCESS,
                    expect.anything(),
                );
            });
        });
    });

    describe('Infinite scrolling', () => {
        it('should load more faqs when load more button is clicked', async () => {
            mockGetAllOnce(mockFaqs, 4);

            renderFaqPanelContent();

            await waitFor(() => {
                expect(getFaqItems()).toHaveLength(2);
                expect(screen.getByTestId('load-more')).toBeInTheDocument();
            });

            mockGetAllOnce(
                [
                    createFaq({ id: 3, questionText: 'Test FAQ Gamma', status: VisibilityStatus.Published }),
                    createFaq({
                        id: 4,
                        questionText: 'Test FAQ Delta',
                        status: VisibilityStatus.Draft,
                        pages: [mockPages[1]],
                    }),
                ],
                4,
            );

            click('load-more');

            await waitFor(() => {
                expect(mockFaqApi.getAll).toHaveBeenCalledTimes(2);
                expectGetAllCalledWith(1, undefined, expect.any(Number));
            });

            await waitFor(() => {
                expect(getFaqItems()).toHaveLength(4);
                expect(screen.queryByTestId('load-more')).not.toBeInTheDocument();
            });
        });
    });

    describe('Search functionality', () => {
        it('should handle search input changes', async () => {
            await renderPanelWithFaqs();

            fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'test search query' } });
            expect(screen.getByTestId('search-input')).toHaveValue('test search query');
        });

        it('passes maxCharactersToSearch for FAQ to AdminPanelToolbar', async () => {
            renderFaqPanelContent();

            await waitFor(() => {
                expect(getLastToolbarProps().maxCharactersToSearch).toBe(
                    UI_CONFIG.SEARCH_BAR.MAX_CHARACTERS_FOR_SEARCH.FAQ,
                );
            });
        });

        it('passes placeholder and add button text to AdminPanelToolbar', async () => {
            renderFaqPanelContent();

            await waitFor(() => {
                const props = getLastToolbarProps();
                expect(props.placeholder).toBe(FAQ_TEXT.PLACEHOLDER.SEARCH_FAQ);
                expect(props.AddItemButtonText).toBe(FAQ_TEXT.BUTTON.ADD_FAQ);
            });
        });

        it('delegates fetch search items to FaqApi', async () => {
            const fetchSearchItemsMock = jest.fn().mockResolvedValue([]);
            mockFaqApi.fetchFaqSearchItems.mockImplementation(fetchSearchItemsMock);

            renderFaqPanelContent();

            await waitFor(() => expect(getLastToolbarProps()).toBeTruthy());

            const pagination = { offset: 2, limit: 7, requestOptions: { cancellationSignal: 'signal' } } as any;
            await getLastToolbarProps().fetchSearchItems('query', pagination);

            expect(fetchSearchItemsMock).toHaveBeenCalledWith({ client: {} }, 'query', 2, 7, 'signal');
        });

        it('clears search and refetches faq list when search is cleared', async () => {
            renderFaqPanelContent();
            await waitFor(() => expect(mockFaqApi.getAll).toHaveBeenCalledTimes(1));

            const input = screen.getByTestId('search-input');
            fireEvent.change(input, { target: { value: 'test' } });
            clearSearch();

            await waitFor(() => {
                expect(mockFaqApi.getAll).toHaveBeenLastCalledWith(...getAllArgs(1));
            });
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
            const mockUpdateListSize = jest.fn();
            jest.spyOn(global, 'addEventListener').mockImplementation((event, handler) => {
                if (event === 'resize') {
                    mockUpdateListSize.mockImplementation(handler as any);
                }
            });

            renderFaqPanelContent();
            mockUpdateListSize();

            expect(mockUpdateListSize).toHaveBeenCalled();
        });
    });

    describe('Reminder toast ("set display order")', () => {
        const expectReminderToast = (shouldBeShown: boolean) => {
            if (shouldBeShown) {
                expect(mockAddToast).toHaveBeenCalledWith(FAQ_TEXT.MESSAGE.DONT_FORGET_TO_ORDER, ToastType.Info);
                expect(mockAddToast).toHaveBeenCalledTimes(1);
            } else {
                expect(mockAddToast).not.toHaveBeenCalledWith(FAQ_TEXT.MESSAGE.DONT_FORGET_TO_ORDER, ToastType.Info);
            }
        };

        it.each([
            ['a draft FAQ is published via the edit modal', 2, VisibilityStatus.Published, true],
            ['a draft FAQ is saved as a draft', 2, VisibilityStatus.Draft, false],
            ['an already published FAQ is edited and stays published', 1, VisibilityStatus.Published, false],
            ['a published FAQ is moved back to draft', 1, VisibilityStatus.Draft, false],
        ])('edit mode: when %s', async (_name, faqId, statusAfterEdit, shouldBeShown) => {
            await renderPanelWithFaqs();

            editFaqAndConfirm(faqId, statusAfterEdit);

            await waitFor(() => expect(getEditFaqModal()).not.toBeInTheDocument());
            expectReminderToast(shouldBeShown);
        });

        it.each([
            ['published', VisibilityStatus.Published, true],
            ['draft', VisibilityStatus.Draft, false],
        ])('add mode: when a %s FAQ is created', async (_name, status, shouldBeShown) => {
            await renderPanelWithFaqs();

            addFaqAndConfirm(status);

            await waitFor(() => expect(getAddFaqModal()).not.toBeInTheDocument());
            expectReminderToast(shouldBeShown);
        });
    });

    describe('Search suggestion selection syncs the active tab', () => {
        it('switches to the tab of the selected FAQ when it belongs to another tab', async () => {
            mockGetById(mockFaqs[1]);
            await renderPanelWithFaqs();
            expectActiveTab(1);

            selectSuggestion(2);

            await waitFor(() => expectActiveTab(2));
            expect(mockFaqApi.getById).toHaveBeenCalledWith(expect.anything(), 2);
            await waitFor(() => {
                expect(screen.getByTestId('faq-question-2')).toHaveTextContent('Test FAQ Beta');
            });
        });

        it.each([
            ['belongs to it', {}],
            ['belongs to several tabs including the current one', { pageIds: [1, 2] }],
        ])('keeps the current tab when the selected FAQ %s', async (_name, dtoOverrides) => {
            mockGetById(mockFaqs[0], dtoOverrides);
            await renderPanelWithFaqs();

            selectSuggestion(1);

            await waitFor(() => expect(mockFaqApi.getById).toHaveBeenCalledWith(expect.anything(), 1));
            await waitFor(() => expect(getFaqItems()).toHaveLength(1));
            expectActiveTab(1);
        });

        it('does not move the user back after they manually pick another tab', async () => {
            mockGetById(mockFaqs[1]);
            await renderPanelWithFaqs();

            selectSuggestion(2);
            await waitFor(() => expectActiveTab(2));

            click('category-3');

            await waitFor(() => expectActiveTab(3));
        });

        it('loads the list of the highlighted tab after the search is cleared', async () => {
            mockGetById(mockFaqs[1]);
            await renderPanelWithFaqs();

            selectSuggestion(2);
            await waitFor(() => expectActiveTab(2));

            clearSearch();

            await waitFor(() => {
                expect(mockFaqApi.getAll).toHaveBeenLastCalledWith(...getAllArgs(2));
            });
        });
    });

    describe('Edge cases', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        const mockVisitorPages = (value: Record<string, unknown>, once = false) => {
            const spy = jest.spyOn(
                require('@/contexts/admin/visitor-pages-provider/VisitorPagesProvider'),
                'useVisitorPages',
            );
            const result = { pages: [], isLoading: false, error: null, refetchPages: jest.fn(), ...value };
            return once ? spy.mockReturnValueOnce(result) : spy.mockReturnValue(result);
        };

        it('should handle case when no visitor pages are available', async () => {
            mockVisitorPages({}, true);

            renderFaqPanelContent();

            await waitFor(() => expect(mockFaqApi.getAll).not.toHaveBeenCalled());
        });

        it('should handle visitor pages loading state', () => {
            mockVisitorPages({ isLoading: true }, true);

            renderFaqPanelContent();

            expect(screen.getByTestId('infinite-scroll-loader')).toBeInTheDocument();
        });

        it('should handle visitor pages error', async () => {
            mockVisitorPages({ error: new Error('Failed to fetch pages') });

            renderFaqPanelContent();

            await waitFor(() => {
                expect(getFaqErrorContainer()).toBeInTheDocument();
                expect(screen.getByText(FAQ_TEXT.MESSAGE.FAIL_TO_FETCH_PAGES)).toBeInTheDocument();
            });
        });

        it('should retry fetching pages when error type is Pages', async () => {
            const mockRefetchPages = jest.fn();
            mockVisitorPages({ error: new Error('Failed to fetch pages'), refetchPages: mockRefetchPages });

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

            const faqToAdd = { ...mockNewFaq, pages: [{ id: 1, title: 'Selected Page', slug: 'selected' }] };
            handleAddFaq(faqToAdd);

            expect(mockSetFaqs).toHaveBeenCalledWith([...mockFaqs, faqToAdd]);
            expect(mockSetHasMore).not.toHaveBeenCalled();

            jest.clearAllMocks();

            const faqWithDifferentPage = { ...mockNewFaq, pages: [{ id: 999, title: 'Other Page', slug: 'other' }] };
            handleAddFaq(faqWithDifferentPage);

            expect(mockSetFaqs).not.toHaveBeenCalled();
            expect(mockSetHasMore).toHaveBeenCalledWith(true);
            expect(hasMoreRef.current).toBe(true);
        });
    });

    describe('Additional coverage tests', () => {
        describe('FAQ filtering and visibility', () => {
            it('should remove FAQ from list when edited to not match status filter', async () => {
                await renderPanelWithFaqs();
                mockGetAllOnce([mockFaqs[0]]);
                clickFilterPublishedButton();
                await waitFor(() => expect(getFaqItems()).toHaveLength(1));

                editFaqAndConfirm(1);

                await waitFor(() => expect(getEditFaqModal()).not.toBeInTheDocument());
            });
        });

        describe('AbortController behavior', () => {
            const createAbortController = (abort = jest.fn()) => ({ signal: { aborted: false }, abort });

            it('should abort previous request when new fetch is triggered', async () => {
                const mockAbort = jest.fn();
                (global as any).AbortController = jest.fn(() => createAbortController(mockAbort));

                await renderPanelWithFaqs();

                (global as any).AbortController = jest.fn(() => createAbortController());
                mockGetAllOnce(mockFaqs);

                clickFilterPublishedButton();

                await waitFor(() => expect(mockAbort).toHaveBeenCalled());
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
                    return { items: convertFaqsToDto(mockFaqs), totalItemsCount: 2 };
                });

                renderFaqPanelContent();

                await waitFor(() => expect(mockFaqApi.getAll).toHaveBeenCalled());
            });
        });

        describe('FAQ additions with filters', () => {
            it('should handle adding FAQ with status filter applied', async () => {
                await renderPanelWithFaqs();
                mockGetAllOnce([mockFaqs[1]]);
                click('filter-draft');
                await waitFor(() => expect(getFaqItems()).toHaveLength(1));

                clickAddFaqButton();
                expect(getAddFaqModal()).toBeInTheDocument();
                click('confirm-add');

                await waitFor(() => expect(getAddFaqModal()).not.toBeInTheDocument());
            });
        });

        describe('Drag and drop reordering', () => {
            it('should not reorder when dragging item to itself', async () => {
                await renderPanelWithFaqs();

                dragFaq(1, 1);

                expect(mockFaqApi.reorder).not.toHaveBeenCalled();
            });

            it('should handle reorder cancel error gracefully', async () => {
                await renderPanelWithFaqs();
                mockFaqApi.reorder.mockRejectedValueOnce({ name: 'CanceledError', message: 'Request canceled' });

                dragFaq(1, 2);

                await waitFor(() => expect(mockFaqApi.reorder).toHaveBeenCalled());
                expect(screen.queryByTestId('faq-error-container')).not.toBeInTheDocument();
            });
        });

        describe('Fetch with filters', () => {
            it('should fetch with translation status filter', async () => {
                renderFaqPanelContent();

                await waitFor(() => expectGetAllCalledWith(1));
            });

            it.each([
                ['status filter changes', () => clickFilterPublishedButton(), mockFaqs[0]],
                ['selected page changes', () => click('category-2'), mockFaqs[1]],
            ])('should reset list when %s', async (_name, trigger, faqAfterChange) => {
                await renderPanelWithFaqs();
                mockGetAllOnce([faqAfterChange]);

                trigger();

                await waitFor(() => {
                    expect(mockFaqApi.getAll).toHaveBeenCalledTimes(2);
                    expect(mockFaqApi.getAll.mock.calls[1][4]).toBe(0);
                });
            });
        });
    });
});
