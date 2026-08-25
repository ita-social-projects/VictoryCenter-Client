import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventCategoryModal } from './EventCategoryModal';
import { ModalMode } from '@/types/admin/common';
import { EventCategory } from '@/types/admin/event-category';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

const mockValidateName = jest.fn();

jest.mock('@/validation/admin/event-category-schema/event-category-schema', () => ({
    EVENT_CATEGORY_VALIDATION_FUNCTIONS: {
        validateName: (...args: unknown[]) => mockValidateName(...args),
    },
}));

jest.mock('@/components/common/modal/Modal', () => {
    const Modal = ({ isOpen, children, onClose }: any) =>
        isOpen ? (
            <div data-testid="modal">
                <button data-testid="modal-close" onClick={onClose}>
                    Close
                </button>
                {children}
            </div>
        ) : null;

    Modal.Title = ({ children }: any) => <div data-testid="modal-title">{children}</div>;

    Modal.Content = ({ children }: any) => <div data-testid="modal-content">{children}</div>;

    Modal.Actions = ({ children }: any) => <div data-testid="modal-actions">{children}</div>;

    return { Modal };
});

jest.mock('@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup', () => ({
    SingleSelectInputGroup: ({ options, onChange, value, placeholder, disabled }: any) => (
        <select
            data-testid="category-select"
            value={value?.id ?? ''}
            disabled={disabled}
            onChange={(e) => {
                const selected = options.find((category: EventCategory) => category.id === Number(e.target.value));

                if (selected) {
                    onChange(selected);
                }
            }}
        >
            <option value="">{placeholder}</option>

            {options.map((category: EventCategory) => (
                <option key={category.id} value={category.id}>
                    {category.name}
                </option>
            ))}
        </select>
    ),
}));

jest.mock('@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup', () => ({
    InputWithCharacterLimitGroup: ({ value, onChange, onBlur, error, disabled, placeholder, name }: any) => (
        <div>
            <input
                name={name}
                value={value}
                disabled={disabled}
                placeholder={placeholder}
                onChange={onChange}
                onBlur={onBlur}
            />

            {error && <span data-testid="name-error">{error}</span>}
        </div>
    ),
}));

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, disabled, onClick, ...props }: any) => (
        <button {...props} disabled={disabled} onClick={onClick}>
            {children}
        </button>
    ),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, title, onClose, onCancel, onConfirm }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <span>{title}</span>

                <button data-testid="confirmation-close" onClick={onClose}>
                    Close
                </button>

                <button data-testid="confirmation-cancel" onClick={onCancel}>
                    Cancel
                </button>

                <button data-testid="confirmation-confirm" onClick={onConfirm}>
                    Confirm
                </button>
            </div>
        ) : null,
}));

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

const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    categories,
};

describe('EventCategoryModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockValidateName.mockReturnValue(undefined);
    });

    describe('Add mode', () => {
        it('renders add category title', () => {
            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Add} />);

            expect(screen.getByTestId('modal-title')).toHaveTextContent(
                COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.ADD_CATEGORY,
            );
        });

        it('renders name input and does not render category select', () => {
            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Add} />);

            expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument();

            expect(screen.queryByTestId('category-select')).not.toBeInTheDocument();
        });

        it('disables save button when name is empty', () => {
            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Add} />);

            const saveButton = screen.getByRole('button', {
                name: COMMON_TEXT_ADMIN.BUTTON.SAVE,
            });

            expect(saveButton).toBeDisabled();
        });

        it('enables save button when valid name is entered', () => {
            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Add} />);

            const input = screen.getByRole('textbox');

            fireEvent.change(input, {
                target: { value: 'New Category' },
            });

            expect(
                screen.getByRole('button', {
                    name: COMMON_TEXT_ADMIN.BUTTON.SAVE,
                }),
            ).toBeEnabled();
        });

        it('disables save button when name validation fails', () => {
            mockValidateName.mockReturnValue('Name is invalid');

            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Add} />);

            const input = screen.getByRole('textbox');

            fireEvent.change(input, {
                target: { value: 'Invalid name' },
            });

            expect(
                screen.getByRole('button', {
                    name: COMMON_TEXT_ADMIN.BUTTON.SAVE,
                }),
            ).toBeDisabled();
        });

        it('sets validation error on name blur', () => {
            mockValidateName.mockReturnValue('Invalid name');

            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Add} />);

            const input = screen.getByRole('textbox');

            fireEvent.change(input, {
                target: { value: 'Invalid name' },
            });

            fireEvent.blur(input);

            expect(screen.getByTestId('name-error')).toHaveTextContent('Invalid name');

            expect(mockValidateName).toHaveBeenCalledWith('Invalid name');
        });
    });

    describe('Edit mode', () => {
        it('renders edit category title', () => {
            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Edit} />);

            expect(screen.getByTestId('modal-title')).toHaveTextContent(
                COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.EDIT_CATEGORY,
            );
        });

        it('renders category select', () => {
            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Edit} />);

            expect(screen.getByTestId('category-select')).toBeInTheDocument();
        });

        it('disables save button when no category is selected', () => {
            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Edit} />);

            expect(
                screen.getByRole('button', {
                    name: COMMON_TEXT_ADMIN.BUTTON.SAVE,
                }),
            ).toBeDisabled();
        });

        it('fills name input after selecting a category', () => {
            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Edit} />);

            fireEvent.change(screen.getByTestId('category-select'), {
                target: { value: '1' },
            });

            expect(screen.getByRole('textbox')).toHaveValue('Category 1');
        });

        it('disables save button when selected category name was not changed', () => {
            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Edit} />);

            fireEvent.change(screen.getByTestId('category-select'), {
                target: { value: '1' },
            });

            expect(
                screen.getByRole('button', {
                    name: COMMON_TEXT_ADMIN.BUTTON.SAVE,
                }),
            ).toBeDisabled();
        });

        it('enables save button when selected category name is changed', () => {
            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Edit} />);

            fireEvent.change(screen.getByTestId('category-select'), {
                target: { value: '1' },
            });

            fireEvent.change(screen.getByRole('textbox'), {
                target: { value: 'Updated Category' },
            });

            expect(
                screen.getByRole('button', {
                    name: COMMON_TEXT_ADMIN.BUTTON.SAVE,
                }),
            ).toBeEnabled();
        });

        it('keeps save button disabled when only leading and trailing spaces are changed', () => {
            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Edit} />);

            fireEvent.change(screen.getByTestId('category-select'), {
                target: { value: '1' },
            });

            fireEvent.change(screen.getByRole('textbox'), {
                target: { value: '  Category 1  ' },
            });

            expect(
                screen.getByRole('button', {
                    name: COMMON_TEXT_ADMIN.BUTTON.SAVE,
                }),
            ).toBeDisabled();
        });
    });

    describe('close behavior', () => {
        it('calls onClose immediately when form is not dirty', () => {
            const onClose = jest.fn();

            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Add} onClose={onClose} />);

            fireEvent.click(screen.getByTestId('modal-close'));

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        });

        it('shows confirmation modal when form has unsaved changes', () => {
            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Add} />);

            fireEvent.change(screen.getByRole('textbox'), {
                target: { value: 'New Category' },
            });

            fireEvent.click(screen.getByTestId('modal-close'));

            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        });

        it('does not close the modal when confirmation is cancelled', () => {
            const onClose = jest.fn();

            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Add} onClose={onClose} />);

            fireEvent.change(screen.getByRole('textbox'), {
                target: { value: 'New Category' },
            });

            fireEvent.click(screen.getByTestId('modal-close'));
            fireEvent.click(screen.getByTestId('confirmation-cancel'));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        });

        it('closes the modal when unsaved changes are confirmed', () => {
            const onClose = jest.fn();

            render(<EventCategoryModal {...defaultProps} mode={ModalMode.Add} onClose={onClose} />);

            fireEvent.change(screen.getByRole('textbox'), {
                target: { value: 'New Category' },
            });

            fireEvent.click(screen.getByTestId('modal-close'));
            fireEvent.click(screen.getByTestId('confirmation-confirm'));

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        });
    });

    describe('modal opening', () => {
        it('resets form when modal is opened', () => {
            const { rerender } = render(<EventCategoryModal {...defaultProps} isOpen={false} mode={ModalMode.Add} />);

            rerender(<EventCategoryModal {...defaultProps} isOpen mode={ModalMode.Add} />);

            expect(screen.getByRole('textbox')).toHaveValue('');
        });
    });
});
