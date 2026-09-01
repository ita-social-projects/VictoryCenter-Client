import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { EventsPageAdmin } from './EventsPageAdmin';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { AdminPanelToolbarProps } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { EVENTS_TEXT } from '@/const/admin/events';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EventCategoriesApi } from '@/services/api/admin/events/event-categories-api';
import { EventCategory } from '@/types/admin/event-category';
import { act } from 'react';

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
        fetchEventSearchItems: jest.fn(),
        fetchEvents: jest.fn(),
    },
}));

jest.mock('@/components/admin/admin-panel-toolbar/AdminPageToolbar', () => ({
    AdminPanelToolbar: ({ placeholder, AddItemButtonText }: AdminPanelToolbarProps<any>) => (
        <div data-testid="events-toolbar">
            <span>{placeholder}</span>
            <span>{AddItemButtonText}</span>
        </div>
    ),
}));

const mockOpenAddCategoryModal = jest.fn();
const mockOpenEditCategoryModal = jest.fn();

jest.mock('@/hooks/admin/use-modals-state/useModalsState', () => ({
    useModalsState: () => ({
        openModalActions: {
            openAddCategoryModal: mockOpenAddCategoryModal,
            openEditCategoryModal: mockOpenEditCategoryModal,
        },
    }),
}));

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({
        categories,
        contextMenuOptions,
        onContextMenuOptionSelected,
    }: {
        categories: EventCategory[];
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

jest.mock('./event-page-modals/EventsPageModals', () => ({
    EventsPageModals: ({
        onAddCategory,
        onUpdateCategory,
    }: {
        onAddCategory: (category: EventCategory) => void;
        onUpdateCategory: (category: EventCategory) => void;
    }) => {
        mockOnAddCategory.mockImplementation(onAddCategory);
        mockOnUpdateCategory.mockImplementation(onUpdateCategory);

        return <div data-testid="events-page-modals" />;
    },
}));

const mockedUseAdminClient = useAdminClient as jest.Mock;

jest.mock('./event-categories/event-categories-api', () => ({
    EventCategoriesApi: {
        getAll: jest.fn(),
    },
}));

const mockedEventCategoriesApi = EventCategoriesApi as jest.Mocked<typeof EventCategoriesApi>;

describe('EventsPageAdmin', () => {
    const categories: EventCategory[] = [
        {
            id: 1,
            name: 'Category 1',
        },
        {
            id: 2,
            name: 'Category 2',
        },
    ];

    beforeEach(() => {
        mockedUseAdminClient.mockReturnValue({});
        mockedEventCategoriesApi.getAll.mockResolvedValue([]);
        mockOpenAddCategoryModal.mockClear();
        mockOpenEditCategoryModal.mockClear();
        mockOnAddCategory.mockClear();
        mockOnUpdateCategory.mockClear();
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

    it('adds a new category to the categories list', async () => {
        mockedEventCategoriesApi.getAll.mockResolvedValue(categories);

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(screen.getByText('Category 1')).toBeInTheDocument();
            expect(screen.getByText('Category 2')).toBeInTheDocument();
        });

        const newCategory: EventCategory = {
            id: 3,
            name: 'Category 3',
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

        const updatedCategory: EventCategory = {
            id: 1,
            name: 'Updated Category',
        };

        await act(async () => {
            mockOnUpdateCategory(updatedCategory);
        });

        expect(screen.getByText('Updated Category')).toBeInTheDocument();
        expect(screen.queryByText('Category 1')).not.toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
    });
});
