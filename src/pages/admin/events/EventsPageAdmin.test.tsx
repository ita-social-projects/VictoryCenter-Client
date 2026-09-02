import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { EventsPageAdmin } from './EventsPageAdmin';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { AdminPanelToolbarProps } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { EVENTS_TEXT } from '@/const/admin/events';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EventCategoriesApi } from './event-categories/event-categories-api';

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
        contextMenuOptions,
        onContextMenuOptionSelected,
    }: {
        contextMenuOptions: { id: string; name: string }[];
        onContextMenuOptionSelected: (id: string) => void;
    }) => (
        <div data-testid="category-bar">
            {contextMenuOptions.map((option) => (
                <button key={option.id} onClick={() => onContextMenuOptionSelected(option.id)}>
                    {option.name}
                </button>
            ))}
        </div>
    ),
}));

jest.mock('./event-page-modals/EventsPageModals', () => ({
    EventsPageModals: () => <div data-testid="events-page-modals" />,
}));

const mockedUseAdminClient = useAdminClient as jest.Mock;

jest.mock('./event-categories/event-categories-api', () => ({
    EventCategoriesApi: {
        getAll: jest.fn(),
    },
}));

const mockedEventCategoriesApi = EventCategoriesApi as jest.Mocked<typeof EventCategoriesApi>;

describe('EventsPageAdmin', () => {
    beforeEach(() => {
        mockedUseAdminClient.mockReturnValue({});
        mockedEventCategoriesApi.getAll.mockResolvedValue([]);
        mockOpenAddCategoryModal.mockClear();
        mockOpenEditCategoryModal.mockClear();
        mockOpenAddItemModal.mockClear();
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

    it('opens add event modal when add event button is clicked', async () => {
        const user = userEvent.setup();

        render(<EventsPageAdmin />);

        await waitFor(() => {
            expect(mockedEventCategoriesApi.getAll).toHaveBeenCalled();
        });

        await user.click(screen.getByText(EVENTS_TEXT.BUTTON.ADD_EVENT));

        expect(mockOpenAddItemModal).toHaveBeenCalledTimes(1);
    });
});
