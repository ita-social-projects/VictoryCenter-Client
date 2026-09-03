import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DeleteEventCategoryModal } from './DeleteEventCategoryModal';
import { EventCategoriesApi } from '@/services/api/admin/events/event-categories-api';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EVENT_CATEGORY_VALIDATION } from '@/const/admin/events';
import { EventCategoryDto } from '@/types/admin/event-category';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(() => ({})),
}));

jest.mock('@/services/api/admin/events/event-categories-api', () => ({
    EventCategoriesApi: {
        delete: jest.fn(),
    },
}));

jest.mock('@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup', () => ({
    SingleSelectInputGroup: ({
        options,
        onChange,
        value,
        disabled,
    }: {
        options: EventCategoryDto[];
        onChange: (category: EventCategoryDto) => void;
        value?: EventCategoryDto;
        disabled?: boolean;
    }) => (
        <select
            data-testid="category-select"
            value={value?.id ?? ''}
            disabled={disabled}
            onChange={(event) => {
                const category = options.find((item) => item.id === Number(event.target.value));

                if (category) {
                    onChange(category);
                }
            }}
        >
            <option value="">Select category</option>
            {options.map((category) => (
                <option key={category.id} value={category.id}>
                    {category.name}
                </option>
            ))}
        </select>
    ),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({
        isOpen,
        isButtonsDisabled,
        onClose,
        onCancel,
        onConfirm,
    }: {
        isOpen: boolean;
        isButtonsDisabled: boolean;
        onClose: () => void;
        onCancel: () => void;
        onConfirm: () => void;
    }) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <button onClick={onConfirm} disabled={isButtonsDisabled}>
                    Confirm delete
                </button>
                <button onClick={onCancel} disabled={isButtonsDisabled}>
                    Cancel
                </button>
                <button onClick={onClose} disabled={isButtonsDisabled}>
                    Close
                </button>
            </div>
        ) : null,
}));

describe('DeleteEventCategoryModal', () => {
    const categories: EventCategoryDto[] = [
        {
            id: 1,
            name: 'Category 1',
            relatedEventNewsCount: 0,
        },
        {
            id: 2,
            name: 'Category 2',
            relatedEventNewsCount: 3,
        },
    ];

    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderModal = () => {
        render(
            <DeleteEventCategoryModal isOpen={true} categories={categories} onClose={onClose} onConfirm={onConfirm} />,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders delete modal with category select and action buttons', () => {
        renderModal();

        expect(screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.DELETE_CATEGORY)).toBeInTheDocument();

        expect(screen.getByTestId('category-select')).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.CANCEL,
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.DELETE,
            }),
        ).toBeInTheDocument();
    });

    it('disables Delete button when no category is selected', () => {
        renderModal();

        expect(
            screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.DELETE,
            }),
        ).toBeDisabled();
    });

    it('enables Delete button when category without related records is selected', async () => {
        const user = userEvent.setup();

        renderModal();

        await user.selectOptions(screen.getByTestId('category-select'), '1');

        expect(
            screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.DELETE,
            }),
        ).toBeEnabled();
    });

    it('disables Delete button and shows hint when selected category has related records', async () => {
        const user = userEvent.setup();

        renderModal();

        await user.selectOptions(screen.getByTestId('category-select'), '2');

        expect(
            screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.DELETE,
            }),
        ).toBeDisabled();

        expect(
            screen.getByText(EVENT_CATEGORY_VALIDATION.eventItemsCount.getHasEventNewsCountError(3)),
        ).toBeInTheDocument();

        expect(
            screen.getByText(EVENT_CATEGORY_VALIDATION.eventItemsCount.getRelocationOrRemovalHint()),
        ).toBeInTheDocument();
    });

    it('opens confirmation modal when Delete button is clicked', async () => {
        const user = userEvent.setup();

        renderModal();

        await user.selectOptions(screen.getByTestId('category-select'), '1');

        await user.click(
            screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.DELETE,
            }),
        );

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    });

    it('closes confirmation modal when confirmation is cancelled', async () => {
        const user = userEvent.setup();

        renderModal();

        await user.selectOptions(screen.getByTestId('category-select'), '1');

        await user.click(
            screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.DELETE,
            }),
        );

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });

    it('successfully deletes selected category', async () => {
        const user = userEvent.setup();

        (EventCategoriesApi.delete as jest.Mock).mockResolvedValue(undefined);

        renderModal();

        await user.selectOptions(screen.getByTestId('category-select'), '1');

        await user.click(
            screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.DELETE,
            }),
        );

        await user.click(screen.getByRole('button', { name: 'Confirm delete' }));

        await waitFor(() => {
            expect(EventCategoriesApi.delete).toHaveBeenCalledTimes(1);
        });

        expect(EventCategoriesApi.delete).toHaveBeenCalledWith(undefined, 1);
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onConfirm).toHaveBeenCalledWith(1);
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });

    it('shows error message when category deletion fails', async () => {
        const user = userEvent.setup();

        (EventCategoriesApi.delete as jest.Mock).mockRejectedValue(new Error('Delete failed'));

        renderModal();

        await user.selectOptions(screen.getByTestId('category-select'), '1');

        await user.click(
            screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.DELETE,
            }),
        );

        await user.click(screen.getByRole('button', { name: 'Confirm delete' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.FAIL_TO_DELETE_CATEGORY,
        );

        expect(onConfirm).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });

    it('disables controls while deletion is submitting', async () => {
        const user = userEvent.setup();

        let resolveDelete!: () => void;

        (EventCategoriesApi.delete as jest.Mock).mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolveDelete = resolve;
                }),
        );

        renderModal();

        await user.selectOptions(screen.getByTestId('category-select'), '1');

        await user.click(
            screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.DELETE,
            }),
        );

        await user.click(screen.getByRole('button', { name: 'Confirm delete' }));

        await waitFor(() => {
            expect(screen.getByTestId('category-select')).toBeDisabled();
        });

        expect(
            screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.CANCEL,
            }),
        ).toBeDisabled();

        resolveDelete();

        await waitFor(() => {
            expect(onConfirm).toHaveBeenCalledWith(1);
        });
    });

    it('does not close the main modal while confirmation modal is open', async () => {
        const user = userEvent.setup();

        renderModal();

        await user.selectOptions(screen.getByTestId('category-select'), '1');

        await user.click(
            screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.DELETE,
            }),
        );

        await user.click(
            screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.CANCEL,
            }),
        );

        expect(onClose).not.toHaveBeenCalled();
    });
});
