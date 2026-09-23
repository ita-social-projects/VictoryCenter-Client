import '@testing-library/jest-dom';
import { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
        translationLanguages: [{ id: 2, code: 'en', name: 'English' }],
        selectedLanguage: { code: 'en', id: 2 },
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

jest.mock('@/services/api/admin/events/event-categories-api', () => ({
    EventCategoriesApi: {
        getAll: jest.fn(),
    },
}));

jest.mock('@/components/admin/admin-panel-toolbar/AdminPageToolbar', () => ({
    AdminPanelToolbar: ({
        placeholder,
        AddItemButtonText,
        onAddItem,
        onSearchClear,
        onSuggestionSelect,
        onStatusFilterChange,
        fetchSearchItems,
    }: any) => (
        <div data-testid="events-toolbar">
            <span>{placeholder}</span>
            <button onClick={onAddItem}>{AddItemButtonText}</button>
            <button onClick={onSearchClear}>Clear Search</button>
            <button onClick={() => onSuggestionSelect({})}>Select Suggestion</button>
            <button onClick={() => onStatusFilterChange('ACTIVE')}>Filter Status</button>
            <button onClick={() => fetchSearchItems('query', { offset: 0, limit: 10 })}>Fetch Search</button>
        </div>
    ),
}));

jest.mock('@/components/admin/localization-statuses/LocalizationStatuses', () => ({
    LocalizationStatuses: () => <span data-testid="localization-statuses-mock" />,
}));

const mockOpenAddCategoryModal = jest.fn();
const mockOpenEditCategoryModal = jest.fn();
const mockOpenDeleteCategoryModal = jest.fn();
const mockOpenAddItemModal = jest.fn();

jest.mock('@/hooks/admin/use-modals-state/useModalsState', () => ({
    useModalsState: () => ({
        openModalActions: {
            openAddCategoryModal: mockOpenAddCategoryModal,
            openEditCategoryModal: mockOpenEditCategoryModal,
            openDeleteCategoryModal: mockOpenDeleteCategoryModal,
            openAddItemModal: mockOpenAddItemModal,
        },
    }),
}));

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({
        categories,
        contextMenuOptions,
        onContextMenuOptionSelected,
        renderCategoryExtra,
        getCategoryDisplayName,
    }: any) => (
        <div data-testid="category-bar">
            {categories.map((category: any) => (
                <div key={category.id} data-testid={`category-${category.id}`}>
                    {getCategoryDisplayName ? getCategoryDisplayName(category) : category.name}
                    {renderCategoryExtra && renderCategoryExtra(category)}
                </div>
            ))}

            {contextMenuOptions.map((option: any) => (
                <button key={option.id} onClick={() => onContextMenuOptionSelected(option.id)}>
                    {option.name}
                </button>
            ))}

            <button onClick={() => onContextMenuOptionSelected('unknown')}>Unknown Option</button>
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
        onDraftChange,
        onCancelEdit,
    }: any) => (
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
            <button type="button" onClick={() => onDraftChange && onDraftChange('<p>Draft content</p>')}>
                Draft
            </button>
            <button type="button" onClick={() => onCancelEdit && onCancelEdit()}>
                Cancel
            </button>
        </section>
    ),
}));

const mockedUseAdminClient = useAdminClient as jest.Mock;
const mockedEventCategoriesApi = EventCategoriesApi as jest.Mocked<typeof EventCategoriesApi>;
const mockedEventsApi = EventsApi as jest.Mocked<typeof EventsApi>;

describe('EventsPageAdmin', () => {
    const categories: any[] = [
        {
            id: 1,
            name: 'Category 1',
            relatedEventNewsCount: 0,
            localizations: [{ language: { code: 'en' }, name: 'Localized Cat 1' }],
        },
        { id: 2, name: 'Category 2', relatedEventNewsCount: 0 },
    ];

    beforeEach(() => {
        mockedUseAdminClient.mockReturnValue({});
        mockedEventCategoriesApi.getAll.mockResolvedValue(categories);
        mockedEventsApi.updateEventsIntroSection.mockReset();
        mockedEventsApi.getEventsIntroSection.mockResolvedValue({
            eventsBlockTitle: '<p>Loaded title</p>',
            pageDescription: '<p>Loaded description</p>',
        });
        mockOpenAddCategoryModal.mockClear();
        mockOpenEditCategoryModal.mockClear();
        mockOpenDeleteCategoryModal.mockClear();
        mockOpenAddItemModal.mockClear();
        mockOnAddCategory.mockClear();
        mockOnUpdateCategory.mockClear();
        mockOnDeleteCategory.mockClear();
    });

    it('renders the toolbar with the events placeholder and add-item text', async () => {
        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Localized Cat 1')).toBeInTheDocument();
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

    it('drafts content and cancels edit mode successfully', async () => {
        const user = userEvent.setup();
        render(<EventsPageAdmin />);
        await waitFor(() => expect(mockedEventsApi.getEventsIntroSection).toHaveBeenCalled());

        const descriptionId = EVENTS_TEXT.PAGE_CONTENT.SECTION.PAGE_DESCRIPTION.ID;

        await user.click(screen.getByRole('button', { name: `Редагувати ${descriptionId}` }));
        expect(screen.getByTestId(`${descriptionId}-section`)).toHaveTextContent('edit');

        await user.click(screen.getAllByText('Draft')[0]);
        await user.click(screen.getAllByText('Cancel')[0]);

        expect(screen.getByTestId(`${descriptionId}-section`)).toHaveTextContent('view');
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

    it('executes toolbar inline callbacks without errors', async () => {
        const user = userEvent.setup();
        render(<EventsPageAdmin />);

        await user.click(screen.getByText('Clear Search'));
        await user.click(screen.getByText('Select Suggestion'));
        await user.click(screen.getByText('Filter Status'));
        await user.click(screen.getByText('Fetch Search'));

        expect(mockedEventsApi.fetchEventSearchItems).toHaveBeenCalledWith(
            expect.anything(),
            'query',
            0,
            10,
            undefined,
        );
    });

    it('does not render an error message when there is no error', async () => {
        const { container } = render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Localized Cat 1')).toBeInTheDocument();
        });

        expect(container.querySelector('.error-message')).not.toBeInTheDocument();
    });

    it('renders an error message when categories fetch fails', async () => {
        const errorMessage = COMMON_TEXT_ADMIN.CATEGORIES.MESSAGE.FAIL_TO_FETCH_CATEGORIES;
        mockedEventCategoriesApi.getAll.mockRejectedValueOnce(new Error('Fetch failed'));

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
            expect(screen.getByText('Localized Cat 1')).toBeInTheDocument();
        });

        expect(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_CATEGORY)).toBeInTheDocument();
    });

    it('renders edit category context menu option', async () => {
        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Localized Cat 1')).toBeInTheDocument();
        });

        expect(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.EDIT_CATEGORY)).toBeInTheDocument();
    });

    it('opens add category modal when add option is selected', async () => {
        const user = userEvent.setup();

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Localized Cat 1')).toBeInTheDocument();
        });

        await user.click(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.ADD_CATEGORY));

        expect(mockOpenAddCategoryModal).toHaveBeenCalledTimes(1);
    });

    it('opens edit category modal when edit option is selected', async () => {
        const user = userEvent.setup();

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Localized Cat 1')).toBeInTheDocument();
        });

        await user.click(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.BUTTON.EDIT_CATEGORY));

        expect(mockOpenEditCategoryModal).toHaveBeenCalledTimes(1);
    });

    it('does nothing when an unknown context menu option is selected', async () => {
        const user = userEvent.setup();
        render(<EventsPageAdmin />);

        await waitFor(() => expect(screen.getByText('Localized Cat 1')).toBeInTheDocument());
        await user.click(screen.getByText('Unknown Option'));

        expect(mockOpenAddCategoryModal).not.toHaveBeenCalled();
        expect(mockOpenEditCategoryModal).not.toHaveBeenCalled();
        expect(mockOpenDeleteCategoryModal).not.toHaveBeenCalled();
    });

    it('opens add event modal when add event button is clicked', async () => {
        const user = userEvent.setup();

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Localized Cat 1')).toBeInTheDocument();
        });

        await user.click(screen.getByText(EVENTS_TEXT.BUTTON.ADD_EVENT));

        expect(mockOpenAddItemModal).toHaveBeenCalledTimes(1);
    });

    it('adds a new category to the categories list', async () => {
        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Localized Cat 1')).toBeInTheDocument();
            expect(screen.getByText('Category 2')).toBeInTheDocument();
        });

        const newCategory: any = {
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
        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Localized Cat 1')).toBeInTheDocument();
            expect(screen.getByText('Category 2')).toBeInTheDocument();
        });

        const updatedCategory: any = {
            id: 1,
            name: 'Updated Category',
            relatedEventNewsCount: 0,
        };

        await act(async () => {
            mockOnUpdateCategory(updatedCategory);
        });

        expect(screen.getByText('Updated Category')).toBeInTheDocument();
        expect(screen.queryByText('Localized Cat 1')).not.toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
    });

    it('updates a non-selected category without changing the selected category state', async () => {
        render(<EventsPageAdmin />);
        await waitFor(() => expect(screen.getByText('Localized Cat 1')).toBeInTheDocument());

        const updatedCategory2: any = {
            id: 2,
            name: 'Updated Category 2',
            relatedEventNewsCount: 0,
        };

        await act(async () => mockOnUpdateCategory(updatedCategory2));

        expect(screen.getByText('Updated Category 2')).toBeInTheDocument();
        expect(screen.getByText('Localized Cat 1')).toBeInTheDocument();
    });

    it('deletes an existing category from the categories list', async () => {
        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Localized Cat 1')).toBeInTheDocument();
            expect(screen.getByText('Category 2')).toBeInTheDocument();
        });

        await act(async () => {
            mockOnDeleteCategory(1);
        });

        expect(screen.queryByText('Localized Cat 1')).not.toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
    });

    it('deletes a non-selected category without changing the list integrity', async () => {
        render(<EventsPageAdmin />);
        await waitFor(() => expect(screen.getByText('Localized Cat 1')).toBeInTheDocument());

        await act(async () => mockOnDeleteCategory(2));

        expect(screen.queryByText('Category 2')).not.toBeInTheDocument();
        expect(screen.getByText('Localized Cat 1')).toBeInTheDocument();
    });

    it('deletes the last category and clears the selection state gracefully', async () => {
        render(<EventsPageAdmin />);
        await waitFor(() => expect(screen.getByText('Localized Cat 1')).toBeInTheDocument());

        await act(async () => {
            mockOnDeleteCategory(1);
            mockOnDeleteCategory(2);
        });

        expect(screen.queryByText('Localized Cat 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Category 2')).not.toBeInTheDocument();
    });
});
