import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProgramCategoryModal } from './ProgramCategoryModal';
import { ProgramCategory } from '../../../../../types/admin/Programs';
import { ProgramsApi } from '../../../../../services/api/admin/programs/programs-api';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

const mockCategory: ProgramCategory = { id: 1, name: 'Test Category', programsCount: 0 };
const mockCategories: ProgramCategory[] = [
    { id: 1, name: 'Existing Category', programsCount: 5 },
    { id: 2, name: 'Another Category', programsCount: 3 },
];

const mockOnClose = jest.fn();
const mockOnAddCategory = jest.fn();
const mockOnEditCategory = jest.fn();

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
    InputWithCharacterLimit: ({ onChange, onBlur, value, disabled }: any) => (
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
    ProgramsApi: {
        addProgramCategory: jest.fn(),
        editProgramCategory: jest.fn(),
    },
}));

const mockedProgramsApi = ProgramsApi as jest.Mocked<typeof ProgramsApi>;

describe('ProgramCategoryModal', () => {
    const baseProps = {
        isOpen: true,
        onClose: mockOnClose,
        categories: mockCategories,
    };

    const addModeProps = {
        ...baseProps,
        mode: 'add' as const,
        onAddCategory: mockOnAddCategory,
    };

    const editModeProps = {
        ...baseProps,
        mode: 'edit' as const,
        onEditCategory: mockOnEditCategory,
    };

    const renderModal = (props: any) => render(<ProgramCategoryModal {...props} />);

    const getNameInput = () => screen.getByTestId('category-name-input');
    const getSaveButton = () => screen.getByTestId('save-button');
    const getModalCloseButton = () => screen.getByTestId('modal-close');
    const getQuestionModal = () => screen.queryByTestId('question-modal');
    const getQuestionConfirmButton = () => screen.getByTestId('question-confirm');
    const getQuestionCancelButton = () => screen.getByTestId('question-cancel');
    const getCategorySelect = () => screen.getByTestId('category-select');

    const changeNameInput = (value: string) => fireEvent.change(getNameInput(), { target: { value } });
    const blurNameInput = () => fireEvent.blur(getNameInput());
    const clickSaveButton = () => fireEvent.click(getSaveButton());
    const clickConfirmButtonInSaveConfirmPopup = () => fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));
    const clickModalClose = () => fireEvent.click(getModalCloseButton());
    const changeCategorySelect = (value: string) => fireEvent.change(getCategorySelect(), { target: { value } });

    const expectModalClosed = () => {
        expect(mockOnClose).toHaveBeenCalled();
        expect(getQuestionModal()).not.toBeInTheDocument();
    };

    const expectModalNotClosed = () => {
        expect(mockOnClose).not.toHaveBeenCalled();
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Add mode', () => {
        describe('Initial render', () => {
            it('should render modal with correct elements for add mode', () => {
                renderModal(addModeProps);

                expect(screen.getByTestId('modal')).toBeInTheDocument();
                expect(screen.getByText(PROGRAM_CATEGORY_TEXT.FORM.TITLE.ADD_CATEGORY)).toBeInTheDocument();
                expect(getNameInput()).toBeInTheDocument();
                expect(getSaveButton()).toBeDisabled();
                expect(screen.queryByTestId('category-select')).not.toBeInTheDocument();
            });

            it('should not render when isOpen is false', () => {
                renderModal({ ...addModeProps, isOpen: false });
                expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
            });

            it('should have correct form id for add mode', () => {
                renderModal(addModeProps);
                const form = document.getElementById('add-program-category-form');
                expect(form).toBeInTheDocument();
            });
        });

        describe('Form validation', () => {
            it.each([
                { value: '', error: PROGRAM_CATEGORY_VALIDATION.name.getRequiredError(), description: 'empty name' },
                { value: 'A', error: PROGRAM_CATEGORY_VALIDATION.name.getMinError(), description: 'short name' },
                {
                    value: 'Existing Category',
                    error: PROGRAM_CATEGORY_VALIDATION.name.getCategoryWithThisNameAlreadyExistsError(),
                    description: 'duplicate name',
                },
            ])('should show validation error for $description', async ({ value, error }) => {
                renderModal(addModeProps);

                changeNameInput(value);
                if (value !== 'Existing Category') {
                    blurNameInput();
                }

                await waitFor(() => {
                    expect(screen.getByText(error)).toBeInTheDocument();
                });
            });

            it('should show duplicate name hint for case insensitive match', async () => {
                renderModal(addModeProps);

                changeNameInput('EXISTING CATEGORY');

                await waitFor(() => {
                    expect(screen.getByTestId('hint-box')).toBeInTheDocument();
                    expect(
                        screen.getByText(PROGRAM_CATEGORY_VALIDATION.name.getCategoryWithThisNameAlreadyExistsError()),
                    ).toBeInTheDocument();
                });
            });

            it('should enable save button for valid name', async () => {
                renderModal(addModeProps);

                changeNameInput('Valid Category');

                await waitFor(() => {
                    expect(getSaveButton()).not.toBeDisabled();
                });
            });

            it('should disable save button for whitespace only name', () => {
                renderModal(addModeProps);

                changeNameInput('   ');

                expect(getSaveButton()).toBeDisabled();
            });
        });

        describe('Form submission', () => {
            it('should successfully create category', async () => {
                mockedProgramsApi.addProgramCategory.mockResolvedValue(mockCategory);
                renderModal(addModeProps);

                changeNameInput('New Category');
                clickSaveButton();

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
                renderModal(addModeProps);

                changeNameInput('  New Category  ');
                clickSaveButton();

                await waitFor(() => {
                    expect(mockedProgramsApi.addProgramCategory).toHaveBeenCalledWith({
                        id: null,
                        name: 'New Category',
                    });
                });
            });

            it('should show error when API fails', async () => {
                mockedProgramsApi.addProgramCategory.mockRejectedValue(new Error('API Error'));
                renderModal(addModeProps);

                changeNameInput('New Category');
                clickSaveButton();

                await waitFor(() => {
                    expect(
                        screen.getByText(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_CATEGORY),
                    ).toBeInTheDocument();
                });
            });

            it('should not submit with duplicate name', () => {
                renderModal(addModeProps);

                changeNameInput('Existing Category');
                clickSaveButton();

                expect(mockedProgramsApi.addProgramCategory).not.toHaveBeenCalled();
            });

            it('should not submit when already submitting', async () => {
                let resolvePromise: (value: any) => void;
                const promise = new Promise<ProgramCategory>((resolve) => {
                    resolvePromise = resolve;
                });
                mockedProgramsApi.addProgramCategory.mockReturnValue(promise);

                renderModal(addModeProps);

                changeNameInput('New Category');
                clickSaveButton();
                clickSaveButton(); // Second click while submitting

                await waitFor(() => {
                    expect(mockedProgramsApi.addProgramCategory).toHaveBeenCalledTimes(1);
                });

                await act(async () => {
                    resolvePromise!(mockCategory);
                });
            });
        });

        describe('Modal closing', () => {
            it('should close directly when no changes', () => {
                renderModal(addModeProps);

                clickModalClose();

                expectModalClosed();
            });

            it('should show confirmation when closing with changes', () => {
                renderModal(addModeProps);

                changeNameInput('Some text');
                clickModalClose();

                expect(getQuestionModal()).toBeInTheDocument();
                expect(
                    screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE),
                ).toBeInTheDocument();
                expectModalNotClosed();
            });

            it('should close when confirming changes loss', () => {
                renderModal(addModeProps);

                changeNameInput('Some text');
                clickModalClose();
                fireEvent.click(getQuestionConfirmButton());

                expectModalClosed();
            });

            it('should cancel closing when clicking No', () => {
                renderModal(addModeProps);

                changeNameInput('Some text');
                clickModalClose();
                fireEvent.click(getQuestionCancelButton());

                expect(getQuestionModal()).not.toBeInTheDocument();
                expectModalNotClosed();
            });

            it('should not close when submitting', async () => {
                let resolvePromise: (value: any) => void;
                const promise = new Promise<ProgramCategory>((resolve) => {
                    resolvePromise = resolve;
                });
                mockedProgramsApi.addProgramCategory.mockReturnValue(promise);

                renderModal(addModeProps);

                changeNameInput('New Category');
                clickSaveButton();
                clickModalClose();

                expectModalNotClosed();

                await act(async () => {
                    resolvePromise!(mockCategory);
                });
            });
        });

        describe('useEffect behavior', () => {
            it('should reset form when modal opens', async () => {
                mockedProgramsApi.addProgramCategory.mockRejectedValue(new Error('API Error'));
                const { rerender } = renderModal(addModeProps);

                // Create error state
                changeNameInput('New Category');
                clickSaveButton();

                await waitFor(() => {
                    expect(
                        screen.getByText(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_CATEGORY),
                    ).toBeInTheDocument();
                });

                // Reopen modal
                rerender(<ProgramCategoryModal {...addModeProps} isOpen={false} />);
                rerender(<ProgramCategoryModal {...addModeProps} isOpen={true} />);

                expect(
                    screen.queryByText(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_CATEGORY),
                ).not.toBeInTheDocument();
                expect(getNameInput()).toHaveValue('');
            });
        });
    });

    describe('Edit mode', () => {
        describe('Initial render', () => {
            it('should render modal with correct elements for edit mode', () => {
                renderModal(editModeProps);

                expect(screen.getByTestId('modal')).toBeInTheDocument();
                expect(screen.getByText(PROGRAM_CATEGORY_TEXT.FORM.TITLE.EDIT_CATEGORY)).toBeInTheDocument();
                expect(getNameInput()).toBeInTheDocument();
                expect(getCategorySelect()).toBeInTheDocument();
                expect(getSaveButton()).toBeDisabled(); // Disabled because no changes yet
            });

            it('should have correct form id for edit mode', () => {
                renderModal(editModeProps);
                const form = document.getElementById('edit-program-category-form');
                expect(form).toBeInTheDocument();
            });

            it('should populate form with first category by default', () => {
                renderModal(editModeProps);

                expect(getCategorySelect()).toHaveValue('1');
                expect(getNameInput()).toHaveValue('Existing Category');
            });

            it('should render all categories in select', () => {
                renderModal(editModeProps);

                const options = screen.getAllByRole('option');
                expect(options).toHaveLength(2);
                expect(options[0]).toHaveTextContent('Existing Category');
                expect(options[1]).toHaveTextContent('Another Category');
            });

            it('should handle empty categories array', () => {
                renderModal({ ...editModeProps, categories: [] });

                expect(getCategorySelect()).toBeInTheDocument();
                expect(getNameInput()).toHaveValue('');
            });
        });

        describe('Category selection', () => {
            it('should update form when selecting different category', () => {
                renderModal(editModeProps);

                changeCategorySelect('2');

                expect(getCategorySelect()).toHaveValue('2');
                expect(getNameInput()).toHaveValue('Another Category');
            });

            it('should reset form when selecting invalid category', () => {
                renderModal(editModeProps);

                changeCategorySelect('999');

                expect(getNameInput()).toHaveValue('');
            });

            it('should disable select when submitting', async () => {
                let resolvePromise: (value: any) => void;
                const promise = new Promise<ProgramCategory>((resolve) => {
                    resolvePromise = resolve;
                });
                mockedProgramsApi.editProgramCategory.mockReturnValue(promise);

                renderModal(editModeProps);

                changeNameInput('Updated Category');
                clickSaveButton();

                // Click ye in confirmation popup of edit mode
                clickConfirmButtonInSaveConfirmPopup();

                await waitFor(() => {
                    expect(getCategorySelect()).toBeDisabled();
                });

                await act(async () => {
                    resolvePromise!(mockCategory);
                });
            });
        });

        describe('Form validation', () => {
            it('should enable save button when name is changed', () => {
                renderModal(editModeProps);

                changeNameInput('Updated Category');

                expect(getSaveButton()).not.toBeDisabled();
            });

            it('should disable save button when name is same as original', () => {
                renderModal(editModeProps);

                changeNameInput('Different Name');
                expect(getSaveButton()).not.toBeDisabled();

                changeNameInput('Existing Category'); // Back to original

                expect(getSaveButton()).toBeDisabled();
            });

            it('should show duplicate error when name matches other category', () => {
                renderModal(editModeProps);

                changeNameInput('Another Category');

                expect(screen.getByTestId('hint-box')).toBeInTheDocument();
                expect(
                    screen.getByText(PROGRAM_CATEGORY_VALIDATION.name.getCategoryWithThisNameAlreadyExistsError()),
                ).toBeInTheDocument();
            });

            it('should not show duplicate error when name matches current category', () => {
                renderModal(editModeProps);

                changeNameInput('Existing Category');

                expect(screen.queryByTestId('hint-box')).not.toBeInTheDocument();
            });

            it('should handle case insensitive duplicate check excluding current category', () => {
                renderModal(editModeProps);

                changeNameInput('ANOTHER CATEGORY');

                expect(screen.getByTestId('hint-box')).toBeInTheDocument();
            });

            it.each([
                { value: '', error: PROGRAM_CATEGORY_VALIDATION.name.getRequiredError(), description: 'empty name' },
                { value: 'A', error: PROGRAM_CATEGORY_VALIDATION.name.getMinError(), description: 'short name' },
            ])('should show validation error for $description', async ({ value, error }) => {
                renderModal(editModeProps);

                changeNameInput(value);
                blurNameInput();

                await waitFor(() => {
                    expect(screen.getByText(error)).toBeInTheDocument();
                });
            });
        });

        describe('Form submission', () => {
            it('should successfully update category', async () => {
                const updatedCategory = { ...mockCategory, name: 'Updated Category' };
                mockedProgramsApi.editProgramCategory.mockResolvedValue(updatedCategory);
                renderModal(editModeProps);

                changeNameInput('Updated Category');
                clickSaveButton();

                clickConfirmButtonInSaveConfirmPopup();

                await waitFor(() => {
                    expect(mockedProgramsApi.editProgramCategory).toHaveBeenCalledWith({
                        id: 1,
                        name: 'Updated Category',
                    });
                    expect(mockOnEditCategory).toHaveBeenCalledWith(updatedCategory);
                    expect(mockOnClose).toHaveBeenCalled();
                });
            });

            it('should trim whitespace from name', async () => {
                const updatedCategory = { ...mockCategory, name: 'Updated Category' };
                mockedProgramsApi.editProgramCategory.mockResolvedValue(updatedCategory);
                renderModal(editModeProps);

                changeNameInput('  Updated Category  ');
                clickSaveButton();

                clickConfirmButtonInSaveConfirmPopup();

                await waitFor(() => {
                    expect(mockedProgramsApi.editProgramCategory).toHaveBeenCalledWith({
                        id: 1,
                        name: 'Updated Category',
                    });
                });
            });

            it('should show error when API fails', async () => {
                mockedProgramsApi.editProgramCategory.mockRejectedValue(new Error('API Error'));
                renderModal(editModeProps);

                changeNameInput('Updated Category');
                clickSaveButton();

                clickConfirmButtonInSaveConfirmPopup();

                await waitFor(() => {
                    expect(
                        screen.getByText(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_CATEGORY),
                    ).toBeInTheDocument();
                });
            });

            it('should not submit with duplicate name', () => {
                renderModal(editModeProps);

                changeNameInput('Another Category');
                clickSaveButton();

                expect(mockedProgramsApi.editProgramCategory).not.toHaveBeenCalled();
            });

            it('should not submit when no category selected', async () => {
                renderModal({ ...editModeProps, categories: [] });

                changeNameInput('Some Name');
                clickSaveButton();

                await waitFor(async () => {
                    expect(mockedProgramsApi.editProgramCategory).not.toHaveBeenCalled();
                });
            });

            it('should not submit when already submitting', async () => {
                let resolvePromise: (value: any) => void;
                const promise = new Promise<ProgramCategory>((resolve) => {
                    resolvePromise = resolve;
                });
                mockedProgramsApi.editProgramCategory.mockReturnValue(promise);

                renderModal(editModeProps);

                changeNameInput('Updated Category');
                clickSaveButton();

                clickConfirmButtonInSaveConfirmPopup();

                clickSaveButton(); // Second click while submitting

                await waitFor(() => {
                    expect(mockedProgramsApi.editProgramCategory).toHaveBeenCalledTimes(1);
                });

                await act(async () => {
                    resolvePromise!(mockCategory);
                });
            });
        });

        describe('Modal closing', () => {
            it('should close directly when no changes', () => {
                renderModal(editModeProps);

                clickModalClose();

                expectModalClosed();
            });

            it('should show confirmation when name is changed', () => {
                renderModal(editModeProps);

                changeNameInput('Updated Name');
                clickModalClose();

                expect(getQuestionModal()).toBeInTheDocument();
                expectModalNotClosed();
            });

            it('should close when confirming changes loss', () => {
                renderModal(editModeProps);

                changeNameInput('Updated Name');
                clickModalClose();
                fireEvent.click(getQuestionConfirmButton());

                expectModalClosed();
            });
        });

        describe('useEffect behavior', () => {
            it('should reset form when modal opens in edit mode', async () => {
                mockedProgramsApi.editProgramCategory.mockRejectedValue(new Error('API Error'));
                const { rerender } = renderModal(editModeProps);

                // Create error state
                changeCategorySelect('2');
                changeNameInput('Updated Category');
                clickSaveButton();

                clickConfirmButtonInSaveConfirmPopup();

                await waitFor(() => {
                    expect(
                        screen.getByText(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_CATEGORY),
                    ).toBeInTheDocument();
                });

                // Reopen modal
                rerender(<ProgramCategoryModal {...editModeProps} isOpen={false} />);
                rerender(<ProgramCategoryModal {...editModeProps} isOpen={true} />);

                expect(
                    screen.queryByText(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_CATEGORY),
                ).not.toBeInTheDocument();
                expect(getCategorySelect()).toHaveValue('1');
                expect(getNameInput()).toHaveValue('Existing Category');
            });

            it('should update selected category when categories prop changes', () => {
                const { rerender } = renderModal(editModeProps);

                const newCategories = [{ id: 3, name: 'New First Category', programsCount: 1 }];
                rerender(<ProgramCategoryModal {...editModeProps} categories={newCategories} />);

                expect(getCategorySelect()).toHaveValue('3');
                expect(getNameInput()).toHaveValue('New First Category');
            });
        });
    });

    describe('Shared functionality', () => {
        it('should disable input when submitting', async () => {
            let resolvePromise: (value: ProgramCategory) => void;
            const pendingPromise = new Promise<ProgramCategory>((resolve) => {
                resolvePromise = resolve;
            });

            mockedProgramsApi.addProgramCategory.mockReturnValue(pendingPromise);

            renderModal(addModeProps);
            changeNameInput('New Category');
            clickSaveButton();

            expect(getNameInput()).toBeDisabled();

            await act(async () => {
                resolvePromise!(mockCategory);
            });
        });
    });
});
