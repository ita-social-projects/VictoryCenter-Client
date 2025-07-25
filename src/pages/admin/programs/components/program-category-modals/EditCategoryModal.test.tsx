import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EditCategoryModal } from './EditCategoryModal';
import { ProgramCategory } from '../../../../../types/ProgramAdminPage';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';

jest.mock('../../../../../const/admin/programs', () => ({
    PROGRAM_CATEGORY_TEXT: {
        FORM: {
            TITLE: { EDIT_CATEGORY: 'Редагувати категорію' },
            LABEL: {
                NAME: 'Назва категорії',
                CATEGORY: 'Категорія',
            },
            MESSAGE: { FAIL_TO_UPDATE_CATEGORY: 'Помилка оновлення категорії' },
        },
    },
    PROGRAM_CATEGORY_VALIDATION: {
        name: {
            min: 2,
            max: 50,
            getRequiredError: () => "Назва обов'язкова",
            getMinError: () => 'Мінімум 2 символи',
            getMaxError: () => 'Максимум 50 символів',
            getCategoryWithThisNameAlreadyExistsError: () => 'Категорія з такою назвою вже існує',
        },
    },
}));

jest.mock('../../../../../const/admin/common', () => ({
    COMMON_TEXT_ADMIN: {
        BUTTON: { SAVE: 'Зберегти', YES: 'Так', NO: 'Ні' },
        QUESTION: { CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE: 'Зміни буде втрачено. Продовжити?' },
    },
}));

const MOCKED_TEXT = {
    EDIT_CATEGORY: 'Редагувати категорію',
    SAVE_BUTTON: 'Зберегти',
    YES_BUTTON: 'Так',
    CHANGES_LOST_QUESTION: 'Зміни буде втрачено. Продовжити?',
    FAIL_TO_UPDATE: 'Помилка оновлення категорії',
    NAME_REQUIRED: "Назва обов'язкова",
    NAME_MIN_ERROR: 'Мінімум 2 символи',
    DUPLICATE_NAME_ERROR: 'Категорія з такою назвою вже існує',
    CATEGORY_LABEL: 'Категорія',
    NAME_LABEL: 'Назва категорії',
};

const mockCategories: ProgramCategory[] = [
    { id: 1, name: 'First Category', programsCount: 5 },
    { id: 2, name: 'Second Category', programsCount: 3 },
    { id: 3, name: 'Third Category', programsCount: 0 },
];

const updatedCategory: ProgramCategory = { id: 1, name: 'Updated Category', programsCount: 5 };

const mockOnClose = jest.fn();
const mockOnEditCategory = jest.fn();

// Mock компонентів
jest.mock('../../../../../components/common/modal/Modal', () => {
    const MockModal = ({
        isOpen,
        children,
        onClose,
    }: {
        isOpen: boolean;
        children: React.ReactNode;
        onClose: () => void;
    }) =>
        isOpen ? (
            <div data-testid="modal">
                <button data-testid="modal-close" onClick={onClose}>
                    ×
                </button>
                {children}
            </div>
        ) : null;

    MockModal.Title = ({ children }: { children: React.ReactNode }) => <h2 data-testid="modal-title">{children}</h2>;
    MockModal.Content = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="modal-content">{children}</div>
    );
    MockModal.Actions = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="modal-actions">{children}</div>
    );

    return { Modal: MockModal };
});

jest.mock('../../../../../components/common/button/Button', () => ({
    Button: ({
        children,
        onClick,
        disabled,
        type,
        form,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
        type?: 'submit' | 'button';
        form?: string;
    }) => (
        <button data-testid="save-button" onClick={onClick} disabled={disabled} type={type} form={form}>
            {children}
        </button>
    ),
}));

jest.mock('../../../../../components/common/hint-box/HintBox', () => ({
    HintBox: ({ title }: { title: string }) => <div data-testid="hint-box">{title}</div>,
}));

jest.mock('../../../../../components/common/input-with-character-limit/InputWithCharacterLimit', () => ({
    InputWithCharacterLimit: ({
        onChange,
        onBlur,
        value,
        disabled,
    }: {
        onChange: (e: any) => void;
        onBlur: (e: any) => void;
        value: string;
        disabled?: boolean;
    }) => (
        <input
            data-testid="category-name-input"
            onChange={onChange}
            onBlur={onBlur}
            value={value || ''}
            disabled={disabled}
        />
    ),
}));

jest.mock('../../../../../components/common/question-modal/QuestionModal', () => ({
    QuestionModal: ({
        isOpen,
        title,
        confirmText,
        onConfirm,
        onCancel,
    }: {
        isOpen: boolean;
        title: string;
        confirmText: string;
        onConfirm: () => void;
        onCancel: () => void;
    }) =>
        isOpen ? (
            <div data-testid="question-modal">
                <p>{title}</p>
                <button data-testid="question-confirm" onClick={onConfirm}>
                    {confirmText}
                </button>
                <button data-testid="question-cancel" onClick={onCancel}>
                    Ні
                </button>
            </div>
        ) : null,
}));

jest.mock('../../../../../services/api/admin/programs/programs-api', () => ({
    __esModule: true,
    default: { editCategory: jest.fn() },
}));

const mockedProgramsApi = ProgramsApi as jest.Mocked<typeof ProgramsApi>;

describe('EditCategoryModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onEditCategory: mockOnEditCategory,
        categories: mockCategories,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Initial render', () => {
        it('should render modal with correct elements', () => {
            render(<EditCategoryModal {...defaultProps} />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
            expect(screen.getByText(MOCKED_TEXT.EDIT_CATEGORY)).toBeInTheDocument();
            expect(screen.getByTestId('category-select')).toBeInTheDocument();
            expect(screen.getByTestId('category-name-input')).toBeInTheDocument();
            expect(screen.getByTestId('save-button')).toBeDisabled();
        });

        it('should not render when isOpen is false', () => {
            render(<EditCategoryModal {...defaultProps} isOpen={false} />);
            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('should initialize with first category selected', () => {
            render(<EditCategoryModal {...defaultProps} />);

            const select = screen.getByTestId('category-select');
            const input = screen.getByTestId('category-name-input');

            expect(select).toHaveValue('1');
            expect(input).toHaveValue('First Category');
        });

        it('should render all categories in select', () => {
            render(<EditCategoryModal {...defaultProps} />);

            mockCategories.forEach((category) => {
                expect(screen.getByText(category.name)).toBeInTheDocument();
            });
        });

        it('should handle empty categories array', () => {
            render(<EditCategoryModal {...defaultProps} categories={[]} />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
            expect(screen.queryByRole('option')).not.toBeInTheDocument();
        });
    });

    describe('Category selection', () => {
        it('should change selected category and update name input', () => {
            render(<EditCategoryModal {...defaultProps} />);

            const select = screen.getByTestId('category-select');
            fireEvent.change(select, { target: { value: '2' } });

            expect(select).toHaveValue('2');

            const input = screen.getByTestId('category-name-input');
            expect(input).toHaveValue('Second Category');
        });

        it('should reset form when changing category', () => {
            render(<EditCategoryModal {...defaultProps} />);

            // Change name first
            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Modified Name' } });
            expect(input).toHaveValue('Modified Name');

            // Change category
            const select = screen.getByTestId('category-select');
            fireEvent.change(select, { target: { value: '2' } });

            // Should reset to original name
            expect(input).toHaveValue('Second Category');
        });

        it('should handle invalid category selection', () => {
            render(<EditCategoryModal {...defaultProps} />);

            const select = screen.getByTestId('category-select');
            fireEvent.change(select, { target: { value: '999' } });

            // Should keep previous value
            expect(select).toHaveValue('1');
        });
    });

    describe('Form validation', () => {
        it('should show validation error for empty name', async () => {
            render(<EditCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: '' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(screen.getByText(MOCKED_TEXT.NAME_REQUIRED)).toBeInTheDocument();
            });
        });

        it('should show validation error for short name', async () => {
            render(<EditCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'A' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(screen.getByText(MOCKED_TEXT.NAME_MIN_ERROR)).toBeInTheDocument();
            });
        });

        it('should show duplicate name error for different category', async () => {
            render(<EditCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Second Category' } });

            await waitFor(() => {
                expect(screen.getByText(MOCKED_TEXT.DUPLICATE_NAME_ERROR)).toBeInTheDocument();
            });
        });

        it('should not show duplicate error for same category name', async () => {
            render(<EditCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            // Keep the same name as selected category
            fireEvent.change(input, { target: { value: 'First Category' } });

            await waitFor(() => {
                expect(screen.queryByText(MOCKED_TEXT.DUPLICATE_NAME_ERROR)).not.toBeInTheDocument();
            });
        });

        it('should enable save button for valid changes', async () => {
            render(<EditCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Valid New Name' } });

            await waitFor(() => {
                expect(screen.getByTestId('save-button')).not.toBeDisabled();
            });
        });

        it('should disable save button when no changes made', () => {
            render(<EditCategoryModal {...defaultProps} />);

            expect(screen.getByTestId('save-button')).toBeDisabled();
        });
    });

    describe('Form submission', () => {
        it('should successfully update category', async () => {
            mockedProgramsApi.editCategory.mockResolvedValue(updatedCategory);
            render(<EditCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Updated Category' } });

            const saveButton = screen.getByTestId('save-button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockedProgramsApi.editCategory).toHaveBeenCalledWith({
                    id: 1,
                    name: 'Updated Category',
                });
                expect(mockOnEditCategory).toHaveBeenCalledWith(updatedCategory);
                expect(mockOnClose).toHaveBeenCalled();
            });
        });

        it('should trim whitespace from name', async () => {
            mockedProgramsApi.editCategory.mockResolvedValue(updatedCategory);
            render(<EditCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: '  Updated Category  ' } });

            const saveButton = screen.getByTestId('save-button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockedProgramsApi.editCategory).toHaveBeenCalledWith({
                    id: 1,
                    name: 'Updated Category',
                });
            });
        });

        it('should show error when API fails', async () => {
            mockedProgramsApi.editCategory.mockRejectedValue(new Error('API Error'));
            render(<EditCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Updated Category' } });

            const saveButton = screen.getByTestId('save-button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText(MOCKED_TEXT.FAIL_TO_UPDATE)).toBeInTheDocument();
            });
        });

        it('should not submit with duplicate name', () => {
            render(<EditCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Second Category' } });

            const saveButton = screen.getByTestId('save-button');
            fireEvent.click(saveButton);

            expect(mockedProgramsApi.editCategory).not.toHaveBeenCalled();
        });
    });

    describe('Modal closing', () => {
        it('should close directly when no changes', () => {
            render(<EditCategoryModal {...defaultProps} />);

            fireEvent.click(screen.getByTestId('modal-close'));

            expect(mockOnClose).toHaveBeenCalled();
            expect(screen.queryByTestId('question-modal')).not.toBeInTheDocument();
        });

        it('should show confirmation when closing with changes', () => {
            render(<EditCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Modified Name' } });

            fireEvent.click(screen.getByTestId('modal-close'));

            expect(screen.getByTestId('question-modal')).toBeInTheDocument();
            expect(screen.getByText(MOCKED_TEXT.CHANGES_LOST_QUESTION)).toBeInTheDocument();
            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('should close when confirming changes loss', () => {
            render(<EditCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Modified Name' } });

            fireEvent.click(screen.getByTestId('modal-close'));
            fireEvent.click(screen.getByTestId('question-confirm'));

            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should cancel closing when clicking No', () => {
            render(<EditCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Modified Name' } });

            fireEvent.click(screen.getByTestId('modal-close'));
            fireEvent.click(screen.getByTestId('question-cancel'));

            expect(screen.queryByTestId('question-modal')).not.toBeInTheDocument();
            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    describe('useEffect behavior', () => {
        it('should reset form and error when modal opens', async () => {
            mockedProgramsApi.editCategory.mockRejectedValue(new Error('API Error'));
            const { rerender } = render(<EditCategoryModal {...defaultProps} />);

            // Create error state
            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Updated Category' } });
            fireEvent.click(screen.getByTestId('save-button'));

            await waitFor(() => {
                expect(screen.getByText(MOCKED_TEXT.FAIL_TO_UPDATE)).toBeInTheDocument();
            });

            // Reopen modal
            rerender(<EditCategoryModal {...defaultProps} isOpen={false} />);
            rerender(<EditCategoryModal {...defaultProps} isOpen={true} />);

            await waitFor(() => {
                expect(screen.getByTestId('category-name-input')).toHaveValue('First Category');
            });

            expect(screen.queryByText(MOCKED_TEXT.FAIL_TO_UPDATE)).not.toBeInTheDocument();
        });

        it('should handle categories change when modal is open', () => {
            const { rerender } = render(<EditCategoryModal {...defaultProps} />);

            const newCategories = [
                { id: 4, name: 'New First Category', programsCount: 1 },
                { id: 5, name: 'New Second Category', programsCount: 2 },
            ];

            rerender(<EditCategoryModal {...defaultProps} categories={newCategories} />);

            const input = screen.getByTestId('category-name-input');
            expect(input).toHaveValue('New First Category');
        });
    });
});
