import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminPanelToolbarProps } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { EventsPageAdmin } from './EventsPageAdmin';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { EventCategoriesApi } from '@/services/api/admin/events/event-categories-api';
import { EventsApi } from '@/services/api/admin/events/events-api';
import { EventCategoryDto } from '@/types/admin/event-category';
import { ToastType } from '@/types/admin/toast';
import { EventItemDto } from '@/types/admin/events';
import { EVENTS_TEXT, EVENT_ITEMS_TEXT, EVENT_NOTIFICATION_TIMERS } from '@/const/admin/events';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

const mockedEventsApi = EventsApi as jest.Mocked<typeof EventsApi>;

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit', () => ({
    useLocalizationToolkit: () => ({
        allLanguages: [{ id: 1, code: 'uk', name: 'Українська' }],
        onLanguageChange: jest.fn(),
        onTranslationStatusFilterChange: jest.fn(),
    }),
}));

jest.mock('@/services/api/admin/events/events-api', () => ({
    EventsApi: {
        getEventsIntroSection: jest.fn(),
        updateEventsIntroSection: jest.fn(),
        fetchEventSearchItems: jest.fn(),
        fetchEvents: jest.fn(),
    },
}));

jest.mock('@/components/admin/admin-panel-toolbar/AdminPageToolbar', () => ({
    AdminPanelToolbar: ({ placeholder, AddItemButtonText, onAddItem }: AdminPanelToolbarProps<any>) => (
        <div data-testid="events-toolbar">
            <span>{placeholder}</span>
            <button onClick={onAddItem}>{AddItemButtonText}</button>
        </div>
    ),
}));

const mockOpenAddCategoryModal = jest.fn();
const mockOpenEditCategoryModal = jest.fn();
const mockOpenAddItemModal = jest.fn();

jest.mock('@/hooks/admin/use-modals-state/useModalsState', () => ({
    useModalsState: () => ({
        openModalActions: {
            openAddCategoryModal: mockOpenAddCategoryModal,
            openEditCategoryModal: mockOpenEditCategoryModal,
            openAddItemModal: mockOpenAddItemModal,
        },
    }),
}));

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({
        categories,
        contextMenuOptions,
        onContextMenuOptionSelected,
        onCategorySelect,
    }: {
        categories: EventCategoryDto[];
        contextMenuOptions: { id: string; name: string }[];
        onContextMenuOptionSelected: (id: string) => void;
        onCategorySelect: (category: EventCategoryDto) => void;
    }) => (
        <div data-testid="category-bar">
            {categories.map((category) => (
                <button
                    key={category.id}
                    type="button"
                    data-testid={`category-${category.id}`}
                    onClick={() => onCategorySelect(category)}
                >
                    {category.name}
                </button>
            ))}

            {contextMenuOptions.map((option) => (
                <button key={option.id} type="button" onClick={() => onContextMenuOptionSelected(option.id)}>
                    {option.name}
                </button>
            ))}
        </div>
    ),
}));

const mockOnAddCategory = jest.fn();
const mockOnUpdateCategory = jest.fn();
const mockOnDeleteCategory = jest.fn();

jest.mock('./event-page-modals/EventsPageModals', () => ({
    EventsPageModals: ({
        onAddCategory,
        onUpdateCategory,
        onDeleteCategory,
    }: {
        onAddCategory: (category: EventCategoryDto) => void;
        onUpdateCategory: (category: EventCategoryDto) => void;
        onDeleteCategory: (categoryId: number) => void;
    }) => {
        mockOnAddCategory.mockImplementation(onAddCategory);
        mockOnUpdateCategory.mockImplementation(onUpdateCategory);
        mockOnDeleteCategory.mockImplementation(onDeleteCategory);

        return <div data-testid="events-page-modals" />;
    },
}));

jest.mock('./editable-header-section/EditableHeaderSection', () => ({
    EditableHeaderSection: ({
        sectionId,
        mode,
        onEnterEditMode,
        onPublish,
        initialPublishedHtml,
        isPublishDisabled,
        disabled,
    }: {
        sectionId: string;
        mode: 'edit' | 'view';
        onEnterEditMode: () => void;
        onPublish: (value: string) => void;
        initialPublishedHtml: string;
        isPublishDisabled?: boolean;
        disabled?: boolean;
    }) => (
        <section data-testid={`${sectionId}-section`}>
            <span>{mode}</span>
            <span data-testid={`${sectionId}-html`}>{initialPublishedHtml}</span>

            <button type="button" onClick={onEnterEditMode} aria-label={`Редагувати ${sectionId}`} disabled={disabled}>
                Edit section
            </button>

            <button
                type="button"
                onClick={() => onPublish('<p>Updated content</p>')}
                aria-label={`Опублікувати ${sectionId}`}
                disabled={isPublishDisabled}
            >
                Publish section
            </button>
        </section>
    ),
}));

const mockedUseAdminClient = useAdminClient as jest.Mock;

jest.mock('@/services/api/admin/events/event-categories-api', () => ({
    EventCategoriesApi: {
        getAll: jest.fn(),
    },
}));

const mockedEventCategoriesApi = EventCategoriesApi as jest.Mocked<typeof EventCategoriesApi>;

jest.mock('@/components/admin/infinite-scroll-list/InfiniteScrollList', () => ({
    InfiniteScrollList: ({
        items,
        onLoadMore,
        hasMore,
        isLoading,
        emptyStateMessage,
        emptyStateAction,
        renderItem,
    }: {
        items: EventItemDto[];
        onLoadMore: () => void;
        hasMore: boolean;
        isLoading: boolean;
        emptyStateMessage: string;
        emptyStateAction: React.ReactNode;
        renderItem: (item: EventItemDto) => React.ReactNode;
    }) => (
        <div data-testid="infinite-scroll-list">
            {items.length === 0 ? (
                <>
                    <div>{emptyStateMessage}</div>
                    {emptyStateAction}
                </>
            ) : (
                items.map((item) => (
                    <div key={item.id} data-testid={`event-item-${item.id}`}>
                        {renderItem(item)}
                    </div>
                ))
            )}

            <button type="button" data-testid="load-more-events" onClick={onLoadMore} disabled={!hasMore || isLoading}>
                Load more
            </button>
        </div>
    ),
}));

jest.mock('./event-item-component/EventItemComponent', () => ({
    EventItemComponent: ({ item }: { item: EventItemDto }) => (
        <div data-testid={`rendered-event-${item.id}`}>
            <span>{item.title}</span>
            <span>{item.description}</span>
        </div>
    ),
}));

const mockAddToast = jest.fn();

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: () => ({
        toasts: [],
        addToast: mockAddToast,
    }),
}));

jest.mock('@/components/admin/draggable-list-item/DraggableListItem', () => ({
    DraggableListItem: ({
        entity,
        renderEntityComponent,
    }: {
        entity: EventItemDto;
        renderEntityComponent: (item: EventItemDto) => React.ReactNode;
    }) => <div data-testid={`draggable-event-${entity.id}`}>{renderEntityComponent(entity)}</div>,
}));

class ResizeObserverMock {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
});

Object.defineProperty(global, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
});

const renderEventsPage = async () => {
    render(<EventsPageAdmin />);

    await waitFor(() => {
        expect(mockedEventCategoriesApi.getAll).toHaveBeenCalled();
        expect(mockedEventsApi.getEventsIntroSection).toHaveBeenCalled();
    });

    await waitFor(() => {
        expect(screen.getByTestId('events-page-content')).toBeInTheDocument();
    });
};

describe('EventsPageAdmin', () => {
    const categories: EventCategoryDto[] = [
        {
            id: 1,
            name: 'Category 1',
            relatedEventNewsCount: 0,
        },
        {
            id: 2,
            name: 'Category 2',
            relatedEventNewsCount: 0,
        },
    ];

    const eventItems: EventItemDto[] = [
        {
            id: 101,
            title: 'First event',
            description: 'First event description',
            publishedAt: '2024-01-15T00:00:00.000Z',
            status: 1,
        } as EventItemDto,
        {
            id: 102,
            title: 'Second event',
            description: 'Second event description',
            publishedAt: '2024-02-15T00:00:00.000Z',
            status: 0,
        } as EventItemDto,
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        mockedUseAdminClient.mockReturnValue({});

        mockedEventCategoriesApi.getAll.mockResolvedValue([]);

        mockedEventsApi.fetchEvents.mockResolvedValue({
            items: [],
            totalItemsCount: 0,
        });

        mockedEventsApi.getEventsIntroSection.mockResolvedValue({
            eventsBlockTitle: '<p>Loaded title</p>',
            pageDescription: '<p>Loaded description</p>',
        });

        mockedEventsApi.updateEventsIntroSection.mockResolvedValue({
            eventsBlockTitle: '<p>Loaded title</p>',
            pageDescription: '<p>Loaded description</p>',
        });

        mockAddToast.mockClear();
        mockOpenAddCategoryModal.mockClear();
        mockOpenEditCategoryModal.mockClear();
        mockOpenAddItemModal.mockClear();

        mockOnAddCategory.mockClear();
        mockOnUpdateCategory.mockClear();
        mockOnDeleteCategory.mockClear();
    });

    it('renders the toolbar with the events placeholder and add-item text', async () => {
        await renderEventsPage();

        expect(screen.getByTestId('events-toolbar')).toBeInTheDocument();
        expect(screen.getByText(EVENTS_TEXT.PLACEHOLDER.SEARCH_EVENTS)).toBeInTheDocument();
        expect(screen.getByText(EVENTS_TEXT.BUTTON.ADD_EVENT)).toBeInTheDocument();
    });

    it('renders both content sections and changes edit mode for the selected section only', async () => {
        const user = userEvent.setup();

        await renderEventsPage();

        const descriptionId = EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID;
        const titleId = EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID;

        expect(screen.getByTestId(`${descriptionId}-section`)).toHaveTextContent('view');
        expect(screen.getByTestId(`${titleId}-section`)).toHaveTextContent('view');

        await user.click(screen.getByRole('button', { name: `Редагувати ${descriptionId}` }));

        expect(screen.getByTestId(`${descriptionId}-section`)).toHaveTextContent('edit');
        expect(screen.getByTestId(`${titleId}-section`)).toHaveTextContent('view');

        await user.click(screen.getByRole('button', { name: `Редагувати ${titleId}` }));

        expect(screen.getByTestId(`${descriptionId}-section`)).toHaveTextContent('view');
        expect(screen.getByTestId(`${titleId}-section`)).toHaveTextContent('edit');
    });

    it('loads intro content and passes each API value to its matching section', async () => {
        render(<EventsPageAdmin />);

        const descriptionId = EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID;
        const titleId = EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID;

        await waitFor(() => {
            expect(mockedEventsApi.getEventsIntroSection).toHaveBeenCalled();
            expect(screen.getByTestId(`${descriptionId}-html`)).toHaveTextContent('<p>Loaded description</p>');
            expect(screen.getByTestId(`${titleId}-html`)).toHaveTextContent('<p>Loaded title</p>');
        });
    });

    it('disables intro section editing until the published content is loaded', async () => {
        type IntroSection = {
            eventsBlockTitle: string;
            pageDescription: string;
        };

        let resolveIntroSection!: (section: IntroSection) => void;

        const introSectionPromise = new Promise<IntroSection>((resolve) => {
            resolveIntroSection = resolve;
        });

        mockedEventsApi.getEventsIntroSection.mockReturnValueOnce(introSectionPromise);

        render(<EventsPageAdmin />);

        const descriptionId = EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID;

        const editButton = screen.getByRole('button', {
            name: `Редагувати ${descriptionId}`,
        });

        expect(editButton).toBeDisabled();

        await waitFor(() => {
            resolveIntroSection({
                eventsBlockTitle: '<p>Loaded title</p>',
                pageDescription: '<p>Loaded description</p>',
            });
        });

        await introSectionPromise;

        await waitFor(() => {
            expect(editButton).toBeEnabled();
        });
    });

    it('prevents another intro section publish while a publish request is pending', async () => {
        type IntroSection = {
            eventsBlockTitle: string;
            pageDescription: string;
        };

        const user = userEvent.setup();

        let resolvePublish!: (section: IntroSection) => void;

        const publishPromise = new Promise<IntroSection>((resolve) => {
            resolvePublish = resolve;
        });

        mockedEventsApi.updateEventsIntroSection.mockReturnValueOnce(publishPromise);

        render(<EventsPageAdmin />);

        const descriptionId = EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID;
        const titleId = EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID;

        await waitFor(() => {
            expect(
                screen.getByRole('button', {
                    name: `Опублікувати ${descriptionId}`,
                }),
            ).toBeEnabled();
        });

        await user.click(
            screen.getByRole('button', {
                name: `Опублікувати ${descriptionId}`,
            }),
        );

        expect(mockedEventsApi.updateEventsIntroSection).toHaveBeenCalledTimes(1);
        expect(
            screen.getByRole('button', {
                name: `Опублікувати ${descriptionId}`,
            }),
        ).toBeDisabled();
        expect(
            screen.getByRole('button', {
                name: `Опублікувати ${titleId}`,
            }),
        ).toBeDisabled();

        await waitFor(() => {
            resolvePublish({
                eventsBlockTitle: '<p>Loaded title</p>',
                pageDescription: '<p>Updated content</p>',
            });
        });

        await publishPromise;

        await waitFor(() => {
            expect(
                screen.getByRole('button', {
                    name: `Опублікувати ${descriptionId}`,
                }),
            ).toBeEnabled();

            expect(
                screen.getByRole('button', {
                    name: `Опублікувати ${titleId}`,
                }),
            ).toBeEnabled();
        });
    });

    it('does not render an error message when there is no error', async () => {
        const { container } = render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(mockedEventCategoriesApi.getAll).toHaveBeenCalled();
        });

        expect(container.querySelector('.error-message')).not.toBeInTheDocument();
    });

    it('renders an error message when categories fetch fails', async () => {
        const errorMessage = COMMON_TEXT_ADMIN.CATEGORIES.MESSAGE.FAIL_TO_FETCH_CATEGORIES;

        mockedEventCategoriesApi.getAll.mockRejectedValueOnce(new Error(errorMessage));

        render(<EventsPageAdmin />);

        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });

    it('disables intro section editing when intro content fetch fails', async () => {
        mockedEventsApi.getEventsIntroSection.mockRejectedValueOnce(new Error('Failed to fetch intro content'));

        render(<EventsPageAdmin />);

        const descriptionId = EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID;
        const titleId = EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID;

        await waitFor(() => {
            expect(
                screen.getByRole('button', {
                    name: `Редагувати ${descriptionId}`,
                }),
            ).toBeDisabled();

            expect(
                screen.getByRole('button', {
                    name: `Редагувати ${titleId}`,
                }),
            ).toBeDisabled();
        });

        expect(mockAddToast).not.toHaveBeenCalled();
    });

    it('allows another publish attempt after a publish failure', async () => {
        const user = userEvent.setup();

        mockedEventsApi.updateEventsIntroSection.mockRejectedValueOnce(new Error('Failed to publish intro content'));

        render(<EventsPageAdmin />);

        const descriptionId = EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID;

        await waitFor(() => {
            expect(
                screen.getByRole('button', {
                    name: `Опублікувати ${descriptionId}`,
                }),
            ).toBeEnabled();
        });

        await user.click(
            screen.getByRole('button', {
                name: `Опублікувати ${descriptionId}`,
            }),
        );

        await waitFor(() => {
            expect(mockedEventsApi.updateEventsIntroSection).toHaveBeenCalledTimes(1);

            expect(
                screen.getByRole('button', {
                    name: `Опублікувати ${descriptionId}`,
                }),
            ).toBeEnabled();
        });

        expect(mockAddToast).not.toHaveBeenCalled();
    });

    it('renders add category context menu option', async () => {
        await renderEventsPage();

        expect(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_CATEGORY)).toBeInTheDocument();
    });

    it('renders edit category context menu option', async () => {
        await renderEventsPage();

        expect(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.EDIT_CATEGORY)).toBeInTheDocument();
    });

    it('opens add category modal when add option is selected', async () => {
        const user = userEvent.setup();

        await renderEventsPage();

        await user.click(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_CATEGORY));

        expect(mockOpenAddCategoryModal).toHaveBeenCalledTimes(1);
    });

    it('opens edit category modal when edit option is selected', async () => {
        const user = userEvent.setup();

        await renderEventsPage();

        await user.click(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.EDIT_CATEGORY));

        expect(mockOpenEditCategoryModal).toHaveBeenCalledTimes(1);
    });

    it('opens add event modal when add event button is clicked', async () => {
        const user = userEvent.setup();

        await renderEventsPage();

        await user.click(screen.getByText(EVENTS_TEXT.BUTTON.ADD_EVENT));

        expect(mockOpenAddItemModal).toHaveBeenCalledTimes(1);
    });

    it('adds a new category to the categories list', async () => {
        mockedEventCategoriesApi.getAll.mockResolvedValue(categories);

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Category 1')).toBeInTheDocument();
            expect(screen.getByText('Category 2')).toBeInTheDocument();
        });

        const newCategory: EventCategoryDto = {
            id: 3,
            name: 'Category 3',
            relatedEventNewsCount: 0,
        };

        await waitFor(() => {
            mockOnAddCategory(newCategory);
            expect(screen.getByText('Category 3')).toBeInTheDocument();
        });
    });

    it('updates an existing category in the categories list', async () => {
        mockedEventCategoriesApi.getAll.mockResolvedValue(categories);

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Category 1')).toBeInTheDocument();
            expect(screen.getByText('Category 2')).toBeInTheDocument();
        });

        const updatedCategory: EventCategoryDto = {
            id: 1,
            name: 'Updated Category',
            relatedEventNewsCount: 0,
        };

        await waitFor(() => {
            mockOnUpdateCategory(updatedCategory);
            expect(screen.getByText('Updated Category')).toBeInTheDocument();
            expect(screen.queryByText('Category 1')).not.toBeInTheDocument();
            expect(screen.getByText('Category 2')).toBeInTheDocument();
        });
    });

    it('deletes an existing category from the categories list', async () => {
        mockedEventCategoriesApi.getAll.mockResolvedValue(categories);

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Category 1')).toBeInTheDocument();
            expect(screen.getByText('Category 2')).toBeInTheDocument();
        });

        await waitFor(() => {
            mockOnDeleteCategory(1);
            expect(screen.queryByText('Category 1')).not.toBeInTheDocument();
            expect(screen.getByText('Category 2')).toBeInTheDocument();
        });
    });

    it('fetches and renders event items for the selected category', async () => {
        mockedEventCategoriesApi.getAll.mockResolvedValue(categories);

        mockedEventsApi.fetchEvents.mockResolvedValue({
            items: eventItems,
            totalItemsCount: eventItems.length,
        });

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(mockedEventsApi.fetchEvents).toHaveBeenCalledWith({}, categories[0].id, 0, 5);
        });

        expect(await screen.findByTestId('rendered-event-101')).toBeInTheDocument();
        expect(screen.getByText('First event')).toBeInTheDocument();
        expect(screen.getByText('First event description')).toBeInTheDocument();

        expect(screen.getByTestId('rendered-event-102')).toBeInTheDocument();
        expect(screen.getByText('Second event')).toBeInTheDocument();
    });

    it('renders the empty state when there are no event items', async () => {
        mockedEventCategoriesApi.getAll.mockResolvedValue(categories);

        mockedEventsApi.fetchEvents.mockResolvedValue({
            items: [],
            totalItemsCount: 0,
        });

        render(<EventsPageAdmin />);

        expect(await screen.findByText(EVENT_ITEMS_TEXT.NO_RECORDS)).toBeInTheDocument();
    });

    it('loads more event items when the load-more action is triggered', async () => {
        const user = userEvent.setup();

        mockedEventCategoriesApi.getAll.mockResolvedValue(categories);

        mockedEventsApi.fetchEvents
            .mockResolvedValueOnce({
                items: [eventItems[0]],
                totalItemsCount: 2,
            })
            .mockResolvedValueOnce({
                items: [eventItems[1]],
                totalItemsCount: 2,
            });

        render(<EventsPageAdmin />);

        expect(await screen.findByTestId('rendered-event-101')).toBeInTheDocument();

        await user.click(screen.getByTestId('load-more-events'));

        await waitFor(() => {
            expect(mockedEventsApi.fetchEvents).toHaveBeenNthCalledWith(2, {}, categories[0].id, 5, 5);
        });

        expect(screen.getByTestId('rendered-event-101')).toBeInTheDocument();
        expect(await screen.findByTestId('rendered-event-102')).toBeInTheDocument();
    });

    it('does not load more items when there are no more events', async () => {
        const user = userEvent.setup();

        mockedEventCategoriesApi.getAll.mockResolvedValue(categories);

        mockedEventsApi.fetchEvents.mockResolvedValue({
            items: eventItems,
            totalItemsCount: eventItems.length,
        });

        render(<EventsPageAdmin />);

        expect(await screen.findByTestId('rendered-event-101')).toBeInTheDocument();

        const loadMoreButton = screen.getByTestId('load-more-events');

        expect(loadMoreButton).toBeDisabled();

        await user.click(loadMoreButton);

        expect(mockedEventsApi.fetchEvents).toHaveBeenCalledTimes(1);
    });

    it('shows a toast when fetching event items fails', async () => {
        mockedEventCategoriesApi.getAll.mockResolvedValue(categories);
        mockedEventsApi.fetchEvents.mockRejectedValueOnce(new Error('Request failed'));

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(
                EVENT_ITEMS_TEXT.MESSAGE.FAILED_TO_FETCH_ITEMS,
                ToastType.Error,
                EVENT_NOTIFICATION_TIMERS.SYNC_ERROR_MS,
            );
        });
    });

    it('fetches event items for another selected category', async () => {
        const user = userEvent.setup();

        mockedEventCategoriesApi.getAll.mockResolvedValue(categories);

        mockedEventsApi.fetchEvents
            .mockResolvedValueOnce({
                items: [eventItems[0]],
                totalItemsCount: 1,
            })
            .mockResolvedValueOnce({
                items: [eventItems[1]],
                totalItemsCount: 1,
            });

        render(<EventsPageAdmin />);

        expect(await screen.findByTestId('rendered-event-101')).toBeInTheDocument();

        await user.click(screen.getByTestId('category-2'));

        await waitFor(() => {
            expect(mockedEventsApi.fetchEvents).toHaveBeenNthCalledWith(2, {}, categories[1].id, 0, 5);

            expect(screen.getByTestId('rendered-event-102')).toBeInTheDocument();
        });

        expect(screen.queryByTestId('rendered-event-101')).not.toBeInTheDocument();
    });
});
