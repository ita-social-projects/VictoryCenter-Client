import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeleteTeamCategoryModal } from './DeleteTeamCategoryModal';
import { TeamCategory } from '@/types/admin/team-category';
import { TeamCategoriesApi } from '@/services/api/admin/team/team-categories/team-categories-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { TEAM_CATEGORY_VALIDATION } from '@/const/admin/team';

jest.mock('@/services/api/admin/team/team-categories/team-categories-api', () => ({
    TeamCategoriesApi: {
        delete: jest.fn(),
    },
}));

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

jest.mock('@/components/common/modal/Modal', () => {
    const Modal = ({ children, isOpen, onClose }: any) =>
        isOpen ? (
            <div data-testid="modal">
                <button data-testid="close-modal" onClick={onClose}>
                    Close
                </button>
                <div data-testid="modal-content-area">{children}</div>
            </div>
        ) : null;

    Modal.Title = ({ children }: any) => <div data-testid="modal-title">{children}</div>;
    Modal.Content = ({ children }: any) => <div data-testid="modal-content">{children}</div>;
    Modal.Actions = ({ children }: any) => <div data-testid="modal-actions">{children}</div>;

    return { Modal };
});

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, buttonStyle }: any) => (
        <button
            data-testid={buttonStyle === 'secondary' ? 'cancel-button' : 'delete-button'}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    ),
}));

jest.mock('@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup', () => ({
    SingleSelectInputGroup: ({
        label,
        options,
        getOptionId,
        getOptionName,
        onChange,
        disabled,
        isRequired,
        value,
    }: any) => (
        <div data-testid="select-input-group">
            <label data-testid="select-label">
                {label} {isRequired && '*'}
            </label>
            <select
                data-testid="category-select"
                onChange={(e) => {
                    if (e.target.value === '') {
                        onChange(null);
                        return;
                    }
                    const selectedId = parseInt(e.target.value);
                    const selectedOption = options.find((opt: any) => getOptionId(opt) === selectedId);
                    if (selectedOption) onChange(selectedOption);
                }}
                disabled={disabled}
                value={value ? getOptionId(value) : ''}
            >
                <option value="">Select category...</option>
                {options.map((option: any) => (
                    <option key={getOptionId(option)} value={getOptionId(option)}>
                        {getOptionName(option)}
                    </option>
                ))}
            </select>
        </div>
    ),
}));

jest.mock('@/components/admin/hint-box/HintBox', () => ({
    HintBox: ({ title, text }: any) => (
        <div data-testid="hint-box">
            <div data-testid="hint-title">{title}</div>
            {text && <div data-testid="hint-text">{text}</div>}
        </div>
    ),
}));

const mockCategoriesEmpty: TeamCategory[] = [];

const mockCategoriesWithMembers: TeamCategory[] = [
    { id: 1, name: 'Category 1', description: 'Description 1', localizations: [], teamMembersCount: 5 },
    { id: 2, name: 'Category 2', description: 'Description 2', localizations: [], teamMembersCount: 3 },
];

const mockCategoriesNoMembers: TeamCategory[] = [
    { id: 10, name: 'Empty Category 1', description: 'Description 1', localizations: [], teamMembersCount: 0 },
    { id: 20, name: 'Empty Category 2', description: 'Description 2', localizations: [], teamMembersCount: 0 },
];

const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
};

const createProps = (overrides: any = {}): any => ({
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    categories: mockCategoriesWithMembers,
    ...overrides,
});

const getMockedApi = () => TeamCategoriesApi as jest.Mocked<typeof TeamCategoriesApi>;
const getMockedUseAdminClient = () => useAdminClient as jest.MockedFunction<typeof useAdminClient>;

const openConfirmationAndConfirm = async () => {
    fireEvent.click(screen.getByTestId('delete-button'));
    await act(async () => {
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));
    });
};

const getMainModal = () => screen.getAllByTestId('modal')[0];

const setupSlowDelete = () => {
    let resolvePromise!: () => void;
    const slowPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
    });
    getMockedApi().delete.mockReturnValue(slowPromise);
    return () => resolvePromise();
};

describe('DeleteTeamCategoryModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getMockedUseAdminClient().mockReturnValue(mockClient as any);
        getMockedApi().delete.mockResolvedValue(undefined);
    });

    describe('Component Structure', () => {
        it('does not render modal when isOpen is false', () => {
            const props = createProps({ isOpen: false });
            render(<DeleteTeamCategoryModal {...props} />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });
    });

    describe('Category Selection', () => {
        it('initializes with first category selected when modal opens', () => {
            const props = createProps();
            render(<DeleteTeamCategoryModal {...props} />);

            const categorySelect = screen.getByTestId('category-select') as HTMLSelectElement;
            expect(categorySelect.value).toBe(mockCategoriesWithMembers[0].id.toString());
        });

        it('does not initialize category when no categories are provided', () => {
            const props = createProps({ categories: mockCategoriesEmpty });
            render(<DeleteTeamCategoryModal {...props} />);

            const categorySelect = screen.getByTestId('category-select') as HTMLSelectElement;
            expect(categorySelect.value).toBe('');
        });

        it('resets error and selects first category when modal reopens', async () => {
            getMockedApi().delete.mockRejectedValueOnce(new Error('API Error'));
            const props = createProps({ isOpen: false, categories: mockCategoriesNoMembers });
            const { rerender } = render(<DeleteTeamCategoryModal {...props} />);

            rerender(<DeleteTeamCategoryModal {...props} isOpen={true} />);
            await openConfirmationAndConfirm();

            await waitFor(() => {
                expect(
                    screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.FAIL_TO_DELETE_CATEGORY),
                ).toBeInTheDocument();
            });

            rerender(<DeleteTeamCategoryModal {...props} isOpen={false} />);
            rerender(<DeleteTeamCategoryModal {...props} isOpen={true} categories={mockCategoriesWithMembers} />);

            expect(
                screen.queryByText(COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.FAIL_TO_DELETE_CATEGORY),
            ).not.toBeInTheDocument();
            const categorySelect = screen.getByTestId('category-select') as HTMLSelectElement;
            expect(categorySelect.value).toBe(mockCategoriesWithMembers[0].id.toString());
        });
    });

    describe('Team Members Validation', () => {
        it('shows hint box when selected category has team members', () => {
            const props = createProps();
            render(<DeleteTeamCategoryModal {...props} />);

            expect(screen.getByTestId('hint-box')).toBeInTheDocument();
            expect(screen.getByTestId('hint-title')).toHaveTextContent(
                TEAM_CATEGORY_VALIDATION.teamMembersCount.getHasTeamMembersCountError(
                    mockCategoriesWithMembers[0].teamMembersCount,
                ),
            );
            expect(screen.getByTestId('hint-text')).toHaveTextContent(
                TEAM_CATEGORY_VALIDATION.teamMembersCount.getRelocationOrRemovalHint(),
            );
        });

        it('does not show hint box when selected category has no team members', () => {
            const props = createProps({ categories: mockCategoriesNoMembers });
            render(<DeleteTeamCategoryModal {...props} />);

            expect(screen.queryByTestId('hint-box')).not.toBeInTheDocument();
        });

        it('updates hint box when switching to category with team members', async () => {
            const mixedCategories = [
                { id: 1, name: 'Empty Category', description: 'Description 1', teamMembersCount: 0 },
                { id: 2, name: 'Category with Members', description: 'Description 2', teamMembersCount: 3 },
            ];

            const props = createProps({ categories: mixedCategories });
            render(<DeleteTeamCategoryModal {...props} />);

            expect(screen.queryByTestId('hint-box')).not.toBeInTheDocument();

            const categorySelect = screen.getByTestId('category-select');
            fireEvent.change(categorySelect, { target: { value: '2' } });

            await waitFor(() => {
                expect(screen.getByTestId('hint-box')).toBeInTheDocument();
                expect(screen.getByTestId('hint-title')).toHaveTextContent(
                    TEAM_CATEGORY_VALIDATION.teamMembersCount.getHasTeamMembersCountError(3),
                );
            });
        });

        it('hides hint box when switching to category without team members', async () => {
            const mixedCategories = [
                { id: 1, name: 'Category with Members', description: 'Description 1', teamMembersCount: 3 },
                { id: 2, name: 'Empty Category', description: 'Description 2', teamMembersCount: 0 },
            ];

            const props = createProps({ categories: mixedCategories });
            render(<DeleteTeamCategoryModal {...props} />);

            expect(screen.getByTestId('hint-box')).toBeInTheDocument();

            const categorySelect = screen.getByTestId('category-select');
            fireEvent.change(categorySelect, { target: { value: '2' } });

            await waitFor(() => {
                expect(screen.queryByTestId('hint-box')).not.toBeInTheDocument();
            });
        });
    });

    describe('Delete Button State', () => {
        it('disables delete button when category has team members', () => {
            const props = createProps();
            render(<DeleteTeamCategoryModal {...props} />);

            const deleteButton = screen.getByTestId('delete-button');
            expect(deleteButton).toBeDisabled();
        });

        it('enables delete button when category has no team members', () => {
            const props = createProps({ categories: mockCategoriesNoMembers });
            render(<DeleteTeamCategoryModal {...props} />);

            const deleteButton = screen.getByTestId('delete-button');
            expect(deleteButton).not.toBeDisabled();
        });

        it('disables delete button during submission', async () => {
            const resolveDelete = setupSlowDelete();
            const props = createProps({ categories: mockCategoriesNoMembers });
            render(<DeleteTeamCategoryModal {...props} />);

            await openConfirmationAndConfirm();

            expect(within(getMainModal()).getByTestId('delete-button')).toBeDisabled();
            await act(async () => resolveDelete());
        });
    });

    describe('Deletion Workflow', () => {
        it('calls API and triggers onConfirm when delete is confirmed in confirmation modal', async () => {
            const props = createProps({ categories: mockCategoriesNoMembers });
            render(<DeleteTeamCategoryModal {...props} />);

            await openConfirmationAndConfirm();

            await waitFor(() => {
                expect(getMockedApi().delete).toHaveBeenCalledWith(mockClient, mockCategoriesNoMembers[0].id);
                expect(props.onConfirm).toHaveBeenCalledWith(mockCategoriesNoMembers[0].id);
                expect(props.onClose).toHaveBeenCalled();
            });
        });

        it('shows error message when deletion fails after confirmation', async () => {
            getMockedApi().delete.mockRejectedValue(new Error('API Error'));

            const props = createProps({ categories: mockCategoriesNoMembers });
            render(<DeleteTeamCategoryModal {...props} />);

            await openConfirmationAndConfirm();

            await waitFor(() => {
                expect(
                    screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.FAIL_TO_DELETE_CATEGORY),
                ).toBeInTheDocument();
            });

            expect(props.onConfirm).not.toHaveBeenCalled();
            expect(props.onClose).not.toHaveBeenCalled();
        });

        it('does not open confirmation modal or call API when category has team members', () => {
            const props = createProps();
            render(<DeleteTeamCategoryModal {...props} />);

            const deleteButton = screen.getByTestId('delete-button');
            fireEvent.click(deleteButton);

            expect(screen.queryByText(COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.DELETE_CATEGORY_CONFIRM)).not.toBeInTheDocument();
            expect(getMockedApi().delete).not.toHaveBeenCalled();
            expect(props.onConfirm).not.toHaveBeenCalled();
            expect(props.onClose).not.toHaveBeenCalled();
        });

        it('does not open confirmation modal or call API when no category is selected', () => {
            const props = createProps({ categories: mockCategoriesEmpty });
            render(<DeleteTeamCategoryModal {...props} />);

            fireEvent.click(screen.getByTestId('delete-button'));

            expect(screen.queryByText(COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.DELETE_CATEGORY_CONFIRM)).not.toBeInTheDocument();
            expect(getMockedApi().delete).not.toHaveBeenCalled();
            expect(props.onConfirm).not.toHaveBeenCalled();
            expect(props.onClose).not.toHaveBeenCalled();
        });

        it('closes confirmation modal when "NO" is clicked without calling API', () => {
            const props = createProps({ categories: mockCategoriesNoMembers });
            render(<DeleteTeamCategoryModal {...props} />);

            fireEvent.click(screen.getByTestId('delete-button'));
            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO));

            expect(getMockedApi().delete).not.toHaveBeenCalled();
            expect(props.onConfirm).not.toHaveBeenCalled();
            expect(props.onClose).not.toHaveBeenCalled();
        });
    });

    describe('Modal Close Behavior', () => {
        it('closes modal when close button is clicked', () => {
            const props = createProps();
            render(<DeleteTeamCategoryModal {...props} />);

            const closeButton = screen.getByTestId('close-modal');
            fireEvent.click(closeButton);

            expect(props.onClose).toHaveBeenCalled();
        });

        it('closes modal when cancel button is clicked', () => {
            const props = createProps();
            render(<DeleteTeamCategoryModal {...props} />);

            const cancelButton = screen.getByTestId('cancel-button');
            fireEvent.click(cancelButton);

            expect(props.onClose).toHaveBeenCalled();
        });

        it('prevents closing main modal during submission', async () => {
            const resolveDelete = setupSlowDelete();
            const props = createProps({ categories: mockCategoriesNoMembers });
            render(<DeleteTeamCategoryModal {...props} />);

            await openConfirmationAndConfirm();

            const mainModal = getMainModal();
            fireEvent.click(within(mainModal).getByTestId('close-modal'));
            fireEvent.click(within(mainModal).getByTestId('cancel-button'));

            expect(props.onClose).not.toHaveBeenCalled();
            await act(async () => resolveDelete());
        });

        it('disables cancel button during submission', async () => {
            const resolveDelete = setupSlowDelete();
            const props = createProps({ categories: mockCategoriesNoMembers });
            render(<DeleteTeamCategoryModal {...props} />);

            await openConfirmationAndConfirm();

            expect(within(getMainModal()).getByTestId('cancel-button')).toBeDisabled();
            await act(async () => resolveDelete());
        });
    });

    describe('Select Input Properties', () => {
        it('disables select input during submission', async () => {
            const resolveDelete = setupSlowDelete();
            const props = createProps({ categories: mockCategoriesNoMembers });
            render(<DeleteTeamCategoryModal {...props} />);
            await openConfirmationAndConfirm();

            const categorySelect = screen.getByTestId('category-select');
            expect(categorySelect).toBeDisabled();
            await act(async () => resolveDelete());
        });
    });

    describe('Edge Cases', () => {
        it('handles category change with undefined/null values', async () => {
            const props = createProps();
            render(<DeleteTeamCategoryModal {...props} />);

            const categorySelect = screen.getByTestId('category-select');

            // Select empty option
            fireEvent.change(categorySelect, { target: { value: '' } });

            await waitFor(() => {
                const select = categorySelect as HTMLSelectElement;
                expect(select.value).toBe('');
            });

            const deleteButton = screen.getByTestId('delete-button');
            // When no category is selected, button should be disabled
            expect(deleteButton).toBeDisabled();
        });
    });

    describe('Error State Management', () => {
        it('displays error message in correct container', async () => {
            getMockedApi().delete.mockRejectedValue(new Error('API Error'));

            const props = createProps({ categories: mockCategoriesNoMembers });
            render(<DeleteTeamCategoryModal {...props} />);
            await openConfirmationAndConfirm();

            await waitFor(() => {
                const errorContainer = document.querySelector('.team-category-modal-error-container');
                expect(errorContainer).toBeInTheDocument();
                expect(errorContainer).toHaveTextContent(
                    COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.FAIL_TO_DELETE_CATEGORY,
                );
            });
        });
    });
});
