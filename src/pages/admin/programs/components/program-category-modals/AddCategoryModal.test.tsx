import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AddCategoryModal } from './AddCategoryModal';
import { ProgramCategory } from '../../../../../types/ProgramAdminPage';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';

jest.mock('../../../../../const/admin/programs', () => ({
    PROGRAM_CATEGORY_TEXT: {
        FORM: {
            TITLE: { ADD_CATEGORY: 'Додати категорію' },
            LABEL: { NAME: 'Назва категорії' },
            MESSAGE: { FAIL_TO_CREATE_CATEGORY: 'Помилка створення категорії' },
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
    ADD_CATEGORY: 'Додати категорію',
    SAVE_BUTTON: 'Зберегти',
    YES_BUTTON: 'Так',
    CHANGES_LOST_QUESTION: 'Зміни буде втрачено. Продовжити?',
    FAIL_TO_CREATE: 'Помилка створення категорії',
    NAME_REQUIRED: "Назва обов'язкова",
    NAME_MIN_ERROR: 'Мінімум 2 символи',
    DUPLICATE_NAME_ERROR: 'Категорія з такою назвою вже існує',
};

const mockCategory: ProgramCategory = { id: 1, name: 'Test Category', programsCount: 0 };
const mockCategories: ProgramCategory[] = [{ id: 1, name: 'Existing Category', programsCount: 5 }];

const mockOnClose = jest.fn();
const mockOnAddCategory = jest.fn();

jest.mock('../../../../../components/common/modal/Modal', () => {
    const MockModal = ({ isOpen, children, onClose }: any) =>
        isOpen ? (
            <div data-testid="modal">
                <button data-testid="modal-close" onClick={onClose}>
                    ×
                </button>
                {children}
            </div>
        ) : null;

    MockModal.Title = ({ children }: any) => <h2 data-testid="modal-title">{children}</h2>;
    MockModal.Content = ({ children }: any) => <div data-testid="modal-content">{children}</div>;
    MockModal.Actions = ({ children }: any) => <div data-testid="modal-actions">{children}</div>;

    return { Modal: MockModal };
});

jest.mock('../../../../../components/common/button/Button', () => ({
    Button: ({ children, onClick, disabled, type, form }: any) => (
        <button data-testid="save-button" onClick={onClick} disabled={disabled} type={type} form={form}>
            {children}
        </button>
    ),
}));

jest.mock('../../../../../components/common/hint-box/HintBox', () => ({
    HintBox: ({ title }: any) => <div data-testid="hint-box">{title}</div>,
}));

jest.mock('../../../../../components/common/input-with-character-limit/InputWithCharacterLimit', () => ({
    InputWithCharacterLimit: ({ onChange, onBlur, value }: any) => (
        <input data-testid="category-name-input" onChange={onChange} onBlur={onBlur} value={value || ''} />
    ),
}));

jest.mock('../../../../../components/common/question-modal/QuestionModal', () => ({
    QuestionModal: ({ isOpen, title, confirmText, onConfirm, onCancel }: any) =>
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
    default: { addProgramCategory: jest.fn() },
}));

const mockedProgramsApi = ProgramsApi as jest.Mocked<typeof ProgramsApi>;

describe('AddCategoryModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onAddCategory: mockOnAddCategory,
        categories: mockCategories,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Initial render', () => {
        it('should render modal with correct elements', () => {
            render(<AddCategoryModal {...defaultProps} />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
            expect(screen.getByText(MOCKED_TEXT.ADD_CATEGORY)).toBeInTheDocument();
            expect(screen.getByTestId('category-name-input')).toBeInTheDocument();
            expect(screen.getByTestId('save-button')).toBeDisabled();
        });

        it('should not render when isOpen is false', () => {
            render(<AddCategoryModal {...defaultProps} isOpen={false} />);
            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });
    });

    describe('Form validation', () => {
        it('should show validation error for empty name', async () => {
            render(<AddCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.blur(input);

            await waitFor(() => {
                expect(screen.getByText(MOCKED_TEXT.NAME_REQUIRED)).toBeInTheDocument();
            });
        });

        it('should show validation error for short name', async () => {
            render(<AddCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'A' } });
            fireEvent.blur(input);

            await waitFor(() => {
                expect(screen.getByText(MOCKED_TEXT.NAME_MIN_ERROR)).toBeInTheDocument();
            });
        });

        it('should show duplicate name error', async () => {
            render(<AddCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Existing Category' } });

            await waitFor(() => {
                expect(screen.getByText(MOCKED_TEXT.DUPLICATE_NAME_ERROR)).toBeInTheDocument();
            });
        });

        it('should enable save button for valid name', async () => {
            render(<AddCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Valid Category' } });

            await waitFor(() => {
                expect(screen.getByTestId('save-button')).not.toBeDisabled();
            });
        });
    });

    describe('Form submission', () => {
        it('should successfully create category', async () => {
            mockedProgramsApi.addProgramCategory.mockResolvedValue(mockCategory);
            render(<AddCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'New Category' } });

            const saveButton = screen.getByTestId('save-button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockedProgramsApi.addProgramCategory).toHaveBeenCalledWith({
                    id: null,
                    name: 'New Category',
                });
                expect(mockOnAddCategory).toHaveBeenCalledWith(mockCategory);
                expect(mockOnClose).toHaveBeenCalled();
            });
        });

        it('should trim whitespace from name', async () => {
            mockedProgramsApi.addProgramCategory.mockResolvedValue(mockCategory);
            render(<AddCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: '  New Category  ' } });

            const saveButton = screen.getByTestId('save-button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockedProgramsApi.addProgramCategory).toHaveBeenCalledWith({
                    id: null,
                    name: 'New Category',
                });
            });
        });

        it('should show error when API fails', async () => {
            mockedProgramsApi.addProgramCategory.mockRejectedValue(new Error('API Error'));
            render(<AddCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'New Category' } });

            const saveButton = screen.getByTestId('save-button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText(MOCKED_TEXT.FAIL_TO_CREATE)).toBeInTheDocument();
            });
        });

        it('should not submit with duplicate name', () => {
            render(<AddCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Existing Category' } });

            const saveButton = screen.getByTestId('save-button');
            fireEvent.click(saveButton);

            expect(mockedProgramsApi.addProgramCategory).not.toHaveBeenCalled();
        });
    });

    describe('Modal closing', () => {
        it('should close directly when no changes', () => {
            render(<AddCategoryModal {...defaultProps} />);

            fireEvent.click(screen.getByTestId('modal-close'));

            expect(mockOnClose).toHaveBeenCalled();
            expect(screen.queryByTestId('question-modal')).not.toBeInTheDocument();
        });

        it('should show confirmation when closing with changes', () => {
            render(<AddCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Some text' } });

            fireEvent.click(screen.getByTestId('modal-close'));

            expect(screen.getByTestId('question-modal')).toBeInTheDocument();
            expect(screen.getByText(MOCKED_TEXT.CHANGES_LOST_QUESTION)).toBeInTheDocument();
            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('should close when confirming changes loss', () => {
            render(<AddCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Some text' } });

            fireEvent.click(screen.getByTestId('modal-close'));
            fireEvent.click(screen.getByTestId('question-confirm'));

            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should cancel closing when clicking No', () => {
            render(<AddCategoryModal {...defaultProps} />);

            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'Some text' } });

            fireEvent.click(screen.getByTestId('modal-close'));
            fireEvent.click(screen.getByTestId('question-cancel'));

            expect(screen.queryByTestId('question-modal')).not.toBeInTheDocument();
            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    describe('useEffect behavior', () => {
        it('should reset form when modal opens', async () => {
            mockedProgramsApi.addProgramCategory.mockRejectedValue(new Error('API Error'));
            const { rerender } = render(<AddCategoryModal {...defaultProps} />);

            // Create error state
            const input = screen.getByTestId('category-name-input');
            fireEvent.change(input, { target: { value: 'New Category' } });
            fireEvent.click(screen.getByTestId('save-button'));

            await waitFor(() => {
                expect(screen.getByText(MOCKED_TEXT.FAIL_TO_CREATE)).toBeInTheDocument();
            });

            // Reopen modal
            rerender(<AddCategoryModal {...defaultProps} isOpen={false} />);
            rerender(<AddCategoryModal {...defaultProps} isOpen={true} />);

            expect(screen.queryByText(MOCKED_TEXT.FAIL_TO_CREATE)).not.toBeInTheDocument();
        });
    });
});
