import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TeamCategoryModal } from './TeamCategoryModal';
import { ModalMode } from '../../../../../types/admin/common';
import { TeamCategory } from '../../../../../types/admin/team-category';
import { TeamCategoriesApi } from '../../../../../services/api/admin/team/team-categories/team-categories-api';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { TEAM_CATEGORY_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/team-category-schema/team-category-schema';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

jest.mock('../../../../../hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

jest.mock('../../../../../services/api/admin/team/team-categories/team-categories-api', () => ({
    TeamCategoriesApi: {
        create: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock('../../../../../validation/admin/team-category-schema/team-category-schema', () => ({
    TEAM_CATEGORY_VALIDATION_FUNCTIONS: {
        validateName: jest.fn(),
        validateDescription: jest.fn(),
    },
}));

jest.mock('../../../../../components/common/modal/Modal', () => {
    const Modal = ({ children, isOpen, onClose }: any) =>
        isOpen ? (
            <div data-testid="modal">
                <button data-testid="modal-close" onClick={onClose}>
                    Close
                </button>
                <div data-testid="modal-content-area">{children}</div>
            </div>
        ) : null;

    Modal.Title = ({ children }: any) => <div data-testid="modal-title">{children}</div>;
    Modal.Content = ({ children }: any) => <div data-testid="modal-content-slot">{children}</div>;
    Modal.Actions = ({ children }: any) => <div data-testid="modal-actions">{children}</div>;

    return { Modal };
});

jest.mock('../../../../../components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, className }: any) => (
        <button data-testid="button" onClick={onClick} disabled={disabled} className={className}>
            {children}
        </button>
    ),
}));

jest.mock('../../../../../components/admin/hint-box/HintBox', () => ({
    HintBox: ({ title }: any) => <div data-testid="hint-box">{title}</div>,
}));

jest.mock('../../../../../components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, title, onConfirm, onCancel, confirmText, cancelText }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <div data-testid="confirmation-title">{title}</div>
                <button data-testid="confirmation-confirm" onClick={onConfirm}>
                    {confirmText}
                </button>
                <button data-testid="confirmation-cancel" onClick={onCancel}>
                    {cancelText}
                </button>
            </div>
        ) : null,
}));

jest.mock(
    '../../../../../components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup',
    () => ({
        InputWithCharacterLimitGroup: ({
            label,
            error,
            value,
            onChange,
            onBlur,
            name,
            id,
            maxLength,
            disabled,
            isRequired,
        }: any) => (
            <div data-testid={`input-group-${name}`}>
                <label data-testid={`label-${name}`}>
                    {label} {isRequired && '*'}
                </label>
                <input
                    data-testid={`input-${name}`}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    name={name}
                    id={id}
                    maxLength={maxLength}
                    disabled={disabled}
                />
                {error && <div data-testid={`error-${name}`}>{error}</div>}
            </div>
        ),
    }),
);

jest.mock(
    '../../../../../components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({
            label,
            error,
            value,
            onChange,
            onBlur,
            name,
            id,
            maxLength,
            disabled,
            isRequired,
        }: any) => (
            <div data-testid={`textarea-group-${name}`}>
                <label data-testid={`label-${name}`}>
                    {label} {isRequired && '*'}
                </label>
                <textarea
                    data-testid={`textarea-${name}`}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    name={name}
                    id={id}
                    maxLength={maxLength}
                    disabled={disabled}
                />
                {error && <div data-testid={`error-${name}`}>{error}</div>}
            </div>
        ),
    }),
);

jest.mock('../../../../../components/admin/input-groups/single-select-input-group/SingleSelectInputGroup', () => ({
    SingleSelectInputGroup: ({
        id,
        label,
        options,
        getOptionId,
        getOptionName,
        onChange,
        disabled,
        isRequired,
        value,
    }: any) => (
        <div data-testid={`select-group-${id}`}>
            <label data-testid="label-select">
                {label} {isRequired && '*'}
            </label>
            <select
                data-testid="category-select"
                onChange={(e) => {
                    if (e.target.value === '') {
                        onChange(null);
                        return;
                    }
                    const selectedOption = options.find((opt: any) => getOptionId(opt) === parseInt(e.target.value));
                    if (selectedOption) onChange(selectedOption);
                }}
                disabled={disabled}
                value={value ? getOptionId(value) : ''}
            >
                <option value="">Select category</option>
                {options.map((option: any) => (
                    <option key={getOptionId(option)} value={getOptionId(option)}>
                        {getOptionName(option)}
                    </option>
                ))}
            </select>
        </div>
    ),
}));

const mockCategories: TeamCategory[] = [
    { id: 1, name: 'Category 1', description: 'Description 1', teamMembersCount: 5 },
    { id: 2, name: 'Category 2', description: 'Description 2', teamMembersCount: 3 },
];

const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
};

const mockCreatedCategory: TeamCategory = {
    id: 3,
    name: 'New Category',
    description: 'New Description',
    teamMembersCount: 0,
};

const mockUpdatedCategory: TeamCategory = {
    id: 1,
    name: 'Updated Category',
    description: 'Updated Description',
    teamMembersCount: 5,
};

const createAddProps = (overrides: any = {}): any => ({
    mode: ModalMode.Add,
    isOpen: true,
    onClose: jest.fn(),
    categories: mockCategories,
    onAddCategory: jest.fn(),
    ...overrides,
});

const createEditProps = (overrides: any = {}): any => ({
    mode: ModalMode.Edit,
    isOpen: true,
    onClose: jest.fn(),
    categories: mockCategories,
    onEditCategory: jest.fn(),
    ...overrides,
});

const getMockedApi = () => TeamCategoriesApi as jest.Mocked<typeof TeamCategoriesApi>;
const getMockedValidation = () =>
    TEAM_CATEGORY_VALIDATION_FUNCTIONS as jest.Mocked<typeof TEAM_CATEGORY_VALIDATION_FUNCTIONS>;
const getMockedUseAdminClient = () => useAdminClient as jest.MockedFunction<typeof useAdminClient>;

describe('TeamCategoryModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getMockedUseAdminClient().mockReturnValue(mockClient as any);
        getMockedValidation().validateName.mockReturnValue(undefined);
        getMockedValidation().validateDescription.mockReturnValue(undefined);
        getMockedApi().create.mockResolvedValue(mockCreatedCategory);
        getMockedApi().update.mockResolvedValue(mockUpdatedCategory);
    });

    describe('Add Mode', () => {
        it('does not render category selection in add mode', () => {
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            expect(screen.queryByTestId('category-select')).not.toBeInTheDocument();
        });

        it('initializes form with empty values', () => {
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name') as HTMLInputElement;
            const descriptionTextarea = screen.getByTestId('textarea-description') as HTMLTextAreaElement;

            expect(nameInput.value).toBe('');
            expect(descriptionTextarea.value).toBe('');
        });

        it('shows error message when API call fails', async () => {
            getMockedApi().create.mockRejectedValue(new Error('API Error'));
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            const descriptionTextarea = screen.getByTestId('textarea-description');
            const submitButton = screen.getByTestId('button');

            userEvent.type(nameInput, 'New Category');
            userEvent.type(descriptionTextarea, 'New Description');

            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.FAIL_TO_CREATE_CATEGORY),
                ).toBeInTheDocument();
            });
        });
    });

    describe('Edit Mode', () => {
        it('renders category selection in edit mode', () => {
            const props = createEditProps();
            render(<TeamCategoryModal {...props} />);

            expect(screen.getByTestId('category-select')).toBeInTheDocument();
        });

        it('initializes form with first category data when modal opens', () => {
            const props = createEditProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name') as HTMLInputElement;
            const descriptionTextarea = screen.getByTestId('textarea-description') as HTMLTextAreaElement;

            expect(nameInput.value).toBe(mockCategories[0].name);
            expect(descriptionTextarea.value).toBe(mockCategories[0].description);
        });

        it('updates form when different category is selected', async () => {
            const props = createEditProps();
            render(<TeamCategoryModal {...props} />);

            const categorySelect = screen.getByTestId('category-select');

            fireEvent.change(categorySelect, { target: { value: '2' } });

            await waitFor(() => {
                const nameInput = screen.getByTestId('input-name') as HTMLInputElement;
                const descriptionTextarea = screen.getByTestId('textarea-description') as HTMLTextAreaElement;

                expect(nameInput.value).toBe(mockCategories[1].name);
                expect(descriptionTextarea.value).toBe(mockCategories[1].description);
            });
        });

        it('shows save confirmation modal before submitting changes', async () => {
            const props = createEditProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            const submitButton = screen.getByTestId('button');

            userEvent.clear(nameInput);
            userEvent.type(nameInput, 'Updated Name');

            fireEvent.click(submitButton);

            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
            expect(screen.getByTestId('confirmation-title')).toHaveTextContent(COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES);
        });

        it('calls onEditCategory and closes modal on successful submit', async () => {
            const props = createEditProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            const submitButton = screen.getByTestId('button');

            userEvent.clear(nameInput);
            userEvent.type(nameInput, 'Updated Category');

            fireEvent.click(submitButton);

            const confirmButton = screen.getByTestId('confirmation-confirm');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(getMockedApi().update).toHaveBeenCalledWith(mockClient, {
                    id: mockCategories[0].id,
                    name: 'Updated Category',
                    description: mockCategories[0].description,
                });
                expect(props.onEditCategory).toHaveBeenCalledWith(mockUpdatedCategory);
                expect(props.onClose).toHaveBeenCalled();
            });
        });

        it('shows error message when update API call fails', async () => {
            getMockedApi().update.mockRejectedValue(new Error('API Error'));
            const props = createEditProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            const submitButton = screen.getByTestId('button');

            userEvent.clear(nameInput);
            userEvent.type(nameInput, 'Updated Category');

            fireEvent.click(submitButton);

            const confirmButton = screen.getByTestId('confirmation-confirm');
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(
                    screen.getByText(COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.FAIL_TO_UPDATE_CATEGORY),
                ).toBeInTheDocument();
            });
        });

        it('handles empty categories array in edit mode', () => {
            const props = createEditProps({ categories: [] });
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name') as HTMLInputElement;
            const descriptionTextarea = screen.getByTestId('textarea-description') as HTMLTextAreaElement;

            expect(nameInput.value).toBe('');
            expect(descriptionTextarea.value).toBe('');
        });
    });

    describe('Form Validation', () => {
        it('shows validation errors on blur', async () => {
            getMockedValidation().validateName.mockReturnValue('Name error');
            getMockedValidation().validateDescription.mockReturnValue('Description error');

            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            const descriptionTextarea = screen.getByTestId('textarea-description');

            fireEvent.blur(nameInput);
            fireEvent.blur(descriptionTextarea);

            await waitFor(() => {
                expect(screen.getByTestId('error-name')).toHaveTextContent('Name error');
                expect(screen.getByTestId('error-description')).toHaveTextContent('Description error');
            });
        });

        it('does not show duplicate name hint for same category in edit mode', async () => {
            const props = createEditProps();
            render(<TeamCategoryModal {...props} />);

            expect(screen.queryByTestId('hint-box')).not.toBeInTheDocument();
        });

        it('disables submit button when form has validation errors', () => {
            getMockedValidation().validateName.mockReturnValue('Name error');

            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const submitButton = screen.getByTestId('button');
            expect(submitButton).toBeDisabled();
        });

        it('disables submit button when form has empty fields', () => {
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const submitButton = screen.getByTestId('button');
            expect(submitButton).toBeDisabled();
        });

        it('disables submit button when duplicate name is detected', async () => {
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            const descriptionTextarea = screen.getByTestId('textarea-description');

            userEvent.type(nameInput, 'Category 1');
            userEvent.type(descriptionTextarea, 'Some description');

            const submitButton = screen.getByTestId('button');
            expect(submitButton).toBeDisabled();
        });

        it('disables submit button in edit mode when no changes are made', () => {
            const props = createEditProps();
            render(<TeamCategoryModal {...props} />);

            const submitButton = screen.getByTestId('button');
            expect(submitButton).toBeDisabled();
        });
    });

    describe('Modal Close Behavior', () => {
        it('closes modal directly when no changes are made', () => {
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const closeButton = screen.getByTestId('modal-close');
            fireEvent.click(closeButton);

            expect(props.onClose).toHaveBeenCalled();
        });

        it('shows close confirmation when form is dirty', async () => {
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            userEvent.type(nameInput, 'Some text');

            const closeButton = screen.getByTestId('modal-close');
            fireEvent.click(closeButton);

            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
            expect(screen.getByTestId('confirmation-title')).toHaveTextContent(
                COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE,
            );
        });

        it('closes modal when close confirmation is confirmed', async () => {
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            userEvent.type(nameInput, 'Some text');

            const closeButton = screen.getByTestId('modal-close');
            fireEvent.click(closeButton);

            const confirmButton = screen.getByTestId('confirmation-confirm');
            fireEvent.click(confirmButton);

            expect(props.onClose).toHaveBeenCalled();
        });

        it('does not close modal when close confirmation is cancelled', async () => {
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            userEvent.type(nameInput, 'Some text');

            const closeButton = screen.getByTestId('modal-close');
            fireEvent.click(closeButton);

            const cancelButton = screen.getByTestId('confirmation-cancel');
            fireEvent.click(cancelButton);

            expect(props.onClose).not.toHaveBeenCalled();
        });

        it('prevents closing modal when submitting', async () => {
            let resolvePromise: (value: TeamCategory) => void;
            const slowPromise = new Promise<TeamCategory>((resolve) => {
                resolvePromise = resolve;
            });
            getMockedApi().create.mockReturnValue(slowPromise);
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            const descriptionTextarea = screen.getByTestId('textarea-description');
            const submitButton = screen.getByTestId('button');

            userEvent.type(nameInput, 'New Category');
            userEvent.type(descriptionTextarea, 'New Description');

            fireEvent.click(submitButton);

            // Try to close modal during submission
            const closeButton = screen.getByTestId('modal-close');
            fireEvent.click(closeButton);

            expect(props.onClose).not.toHaveBeenCalled();

            resolvePromise!(mockCreatedCategory);
        });
    });

    describe('Modal Lifecycle', () => {
        it('resets form and error state when modal opens', () => {
            const props = createAddProps({ isOpen: false });
            const { rerender } = render(<TeamCategoryModal {...props} />);

            rerender(<TeamCategoryModal {...props} isOpen={true} />);

            const nameInput = screen.getByTestId('input-name') as HTMLInputElement;
            const descriptionTextarea = screen.getByTestId('textarea-description') as HTMLTextAreaElement;

            expect(nameInput.value).toBe('');
            expect(descriptionTextarea.value).toBe('');
        });
    });

    describe('Confirmation Modals', () => {
        it('closes save confirmation modal when cancelled', async () => {
            const props = createEditProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            const submitButton = screen.getByTestId('button');

            userEvent.clear(nameInput);
            userEvent.type(nameInput, 'Updated Name');

            fireEvent.click(submitButton);

            const cancelButton = screen.getByTestId('confirmation-cancel');
            fireEvent.click(cancelButton);

            expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        });

        it('closes close confirmation modal when cancelled', async () => {
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            userEvent.type(nameInput, 'Some text');

            const closeButton = screen.getByTestId('modal-close');
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
            });

            const cancelButton = screen.getByTestId('confirmation-cancel');
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
            });
        });
    });

    describe('Edge Cases', () => {
        it('handles case-insensitive duplicate name detection', async () => {
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');

            // Enter name with different case
            userEvent.type(nameInput, 'CATEGORY 1');

            await waitFor(() => {
                expect(screen.getByTestId('hint-box')).toBeInTheDocument();
            });
        });

        it('trims whitespace when checking for duplicate names', async () => {
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');

            // Enter name with whitespace
            userEvent.type(nameInput, '  Category 1  ');

            await waitFor(() => {
                expect(screen.getByTestId('hint-box')).toBeInTheDocument();
            });
        });

        it('prevents duplicate submissions', async () => {
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            const descriptionTextarea = screen.getByTestId('textarea-description');
            const submitButton = screen.getByTestId('button');

            userEvent.type(nameInput, 'New Category');
            userEvent.type(descriptionTextarea, 'New Description');

            fireEvent.click(submitButton);
            fireEvent.click(submitButton);
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(getMockedApi().create).toHaveBeenCalledTimes(1);
            });
        });

        it('early returns when trying to submit in edit mode without selected category', async () => {
            const props = createEditProps({ categories: [] });
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            const descriptionTextarea = screen.getByTestId('textarea-description');
            const submitButton = screen.getByTestId('button');

            userEvent.type(nameInput, 'Some Name');
            userEvent.type(descriptionTextarea, 'Some Description');

            fireEvent.click(submitButton);

            expect(getMockedApi().update).not.toHaveBeenCalled();
        });

        it('handles category selection when category not found in list', () => {
            // Test the scenario where no categories are available in edit mode
            // This exercises the else branch in handleCategoryChange where selectedCategory becomes null
            const props = createEditProps({ categories: [] });
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name') as HTMLInputElement;
            const descriptionTextarea = screen.getByTestId('textarea-description') as HTMLTextAreaElement;

            // When no categories are available, form should be reset to empty
            expect(nameInput.value).toBe('');
            expect(descriptionTextarea.value).toBe('');
        });

        it('prevents form submission early when validation errors exist', async () => {
            getMockedValidation().validateName.mockReturnValue('Name error');

            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const nameInput = screen.getByTestId('input-name');
            const descriptionTextarea = screen.getByTestId('textarea-description');
            const submitButton = screen.getByTestId('button');

            userEvent.type(nameInput, 'Bad Name');
            userEvent.type(descriptionTextarea, 'Some Description');

            fireEvent.click(submitButton);

            // Should not call API due to validation errors
            expect(getMockedApi().create).not.toHaveBeenCalled();
        });

        it('prevents default form submission behavior', () => {
            const props = createAddProps();
            render(<TeamCategoryModal {...props} />);

            const form = document.querySelector('.team-category-modal-form') as HTMLFormElement;
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });

            const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');

            form.dispatchEvent(submitEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });
    });
});
