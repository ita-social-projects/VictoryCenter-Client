import '@testing-library/jest-dom';
import { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminPanelToolbarProps } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { EventsPageAdmin } from './EventsPageAdmin';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { EventCategoriesApi } from '@/services/api/admin/events/event-categories-api';
import { EventsApi } from '@/services/api/admin/events/events-api';
import { EventCategoryDto } from '@/types/admin/event-category';
import { EVENTS_TEXT } from '@/const/admin/events';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

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
    }: {
        categories: EventCategoryDto[];
        contextMenuOptions: { id: string; name: string }[];
        onContextMenuOptionSelected: (id: string) => void;
    }) => (
        <div data-testid="category-bar">
            {categories.map((category) => (
                <div key={category.id} data-testid={`category-${category.id}`}>
                    {category.name}
                </div>
            ))}

            {contextMenuOptions.map((option) => (
                <button key={option.id} onClick={() => onContextMenuOptionSelected(option.id)}>
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
const mockedEventsApi = EventsApi as jest.Mocked<typeof EventsApi>;

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

    beforeEach(() => {
        mockedUseAdminClient.mockReturnValue({});
        mockedEventCategoriesApi.getAll.mockResolvedValue([]);
        mockedEventsApi.updateEventsIntroSection.mockReset();
        mockedEventsApi.getEventsIntroSection.mockResolvedValue({
            eventsBlockTitle: '<p>Loaded title</p>',
            pageDescription: '<p>Loaded description</p>',
        });
        mockOpenAddCategoryModal.mockClear();
        mockOpenEditCategoryModal.mockClear();
        mockOpenAddItemModal.mockClear();
        mockOnAddCategory.mockClear();
        mockOnUpdateCategory.mockClear();
        mockOnDeleteCategory.mockClear();
    });

    it('renders the toolbar with the events placeholder and add-item text', async () => {
        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(mockedEventCategoriesApi.getAll).toHaveBeenCalled();
        });

        expect(screen.getByTestId('events-page-content')).toBeInTheDocument();
        expect(screen.getByTestId('events-toolbar')).toBeInTheDocument();
        expect(screen.getByText(EVENTS_TEXT.PLACEHOLDER.SEARCH_EVENTS)).toBeInTheDocument();
        expect(screen.getByText(EVENTS_TEXT.BUTTON.ADD_EVENT)).toBeInTheDocument();
    });

    it('renders both content sections and changes edit mode for the selected section only', async () => {
        const user = userEvent.setup();

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(mockedEventCategoriesApi.getAll).toHaveBeenCalled();
        });

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
        let resolveIntroSection: (section: { eventsBlockTitle: string; pageDescription: string }) => void;
        mockedEventsApi.getEventsIntroSection.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveIntroSection = resolve;
            }),
        );

        render(<EventsPageAdmin />);

        const descriptionId = EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID;
        const editButton = screen.getByRole('button', { name: `Редагувати ${descriptionId}` });
        expect(editButton).toBeDisabled();

        await act(async () => {
            resolveIntroSection!({
                eventsBlockTitle: '<p>Loaded title</p>',
                pageDescription: '<p>Loaded description</p>',
            });
        });

        await waitFor(() => {
            expect(editButton).toBeEnabled();
        });
    });

    it('prevents another intro section publish while a publish request is pending', async () => {
        const user = userEvent.setup();
        let resolvePublish: (section: { eventsBlockTitle: string; pageDescription: string }) => void;
        mockedEventsApi.updateEventsIntroSection.mockReturnValueOnce(
            new Promise((resolve) => {
                resolvePublish = resolve;
            }),
        );

        render(<EventsPageAdmin />);

        const descriptionId = EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID;
        const titleId = EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID;

        await waitFor(() => {
            expect(screen.getByRole('button', { name: `Опублікувати ${descriptionId}` })).toBeEnabled();
        });

        await user.click(screen.getByRole('button', { name: `Опублікувати ${descriptionId}` }));

        expect(mockedEventsApi.updateEventsIntroSection).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button', { name: `Опублікувати ${descriptionId}` })).toBeDisabled();
        expect(screen.getByRole('button', { name: `Опублікувати ${titleId}` })).toBeDisabled();

        await act(async () => {
            resolvePublish!({
                eventsBlockTitle: '<p>Loaded title</p>',
                pageDescription: '<p>Updated content</p>',
            });
        });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: `Опублікувати ${descriptionId}` })).toBeEnabled();
            expect(screen.getByRole('button', { name: `Опублікувати ${titleId}` })).toBeEnabled();
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

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('renders an events page content error when intro content fetch fails', async () => {
        mockedEventsApi.getEventsIntroSection.mockRejectedValueOnce(new Error('Failed to fetch intro content'));

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_FETCH_DATA)).toBeInTheDocument();
        });

        const descriptionId = EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID;
        const titleId = EVENTS_TEXT.PAGE_CONTENT.SECTION.EVENTS_BLOCK_TITLE.ID;
        expect(screen.getByRole('button', { name: `Редагувати ${descriptionId}` })).toBeDisabled();
        expect(screen.getByRole('button', { name: `Редагувати ${titleId}` })).toBeDisabled();
    });

    it('renders a publish error when the intro section update fails', async () => {
        const user = userEvent.setup();
        mockedEventsApi.updateEventsIntroSection.mockRejectedValueOnce(new Error('Failed to publish intro content'));

        render(<EventsPageAdmin />);

        const descriptionId = EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID;
        await waitFor(() => {
            expect(screen.getByRole('button', { name: `Опублікувати ${descriptionId}` })).toBeEnabled();
        });

        await user.click(screen.getByRole('button', { name: `Опублікувати ${descriptionId}` }));

        await waitFor(() => {
            expect(screen.getByText(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_PUBLISH_CHANGES)).toBeInTheDocument();
        });
    });

    it('renders add category context menu option', async () => {
        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(mockedEventCategoriesApi.getAll).toHaveBeenCalled();
        });

        expect(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_CATEGORY)).toBeInTheDocument();
    });

    it('renders edit category context menu option', async () => {
        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(mockedEventCategoriesApi.getAll).toHaveBeenCalled();
        });

        expect(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.EDIT_CATEGORY)).toBeInTheDocument();
    });

    it('opens add category modal when add option is selected', async () => {
        const user = userEvent.setup();

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(mockedEventCategoriesApi.getAll).toHaveBeenCalled();
        });

        await user.click(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_CATEGORY));

        expect(mockOpenAddCategoryModal).toHaveBeenCalledTimes(1);
    });

    it('opens edit category modal when edit option is selected', async () => {
        const user = userEvent.setup();

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(mockedEventCategoriesApi.getAll).toHaveBeenCalled();
        });

        await user.click(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.EDIT_CATEGORY));

        expect(mockOpenEditCategoryModal).toHaveBeenCalledTimes(1);
    });

    it('opens add event modal when add event button is clicked', async () => {
        const user = userEvent.setup();

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(mockedEventCategoriesApi.getAll).toHaveBeenCalled();
        });

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

        await act(async () => {
            mockOnAddCategory(newCategory);
        });

        expect(screen.getByText('Category 3')).toBeInTheDocument();
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

        await act(async () => {
            mockOnUpdateCategory(updatedCategory);
        });

        expect(screen.getByText('Updated Category')).toBeInTheDocument();
        expect(screen.queryByText('Category 1')).not.toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
    });

    it('deletes an existing category from the categories list', async () => {
        mockedEventCategoriesApi.getAll.mockResolvedValue(categories);

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Category 1')).toBeInTheDocument();
            expect(screen.getByText('Category 2')).toBeInTheDocument();
        });

        await act(async () => {
            mockOnDeleteCategory(1);
        });

        expect(screen.queryByText('Category 1')).not.toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
    });
});
