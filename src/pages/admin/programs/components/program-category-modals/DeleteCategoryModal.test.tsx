import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeleteCategoryModal } from './DeleteCategoryModal';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import { ProgramCategory } from '../../../../../types/admin/Programs';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

jest.mock('../../../../../services/api/admin/programs/programs-api');
const mockedProgramsApi = ProgramsApi as jest.Mocked<typeof ProgramsApi>;

jest.mock('../../../../../components/common/modal/Modal', () => {
    const ModalMock = ({ isOpen, onClose, children }: any) =>
        isOpen ? <div data-testid="modal">{children}</div> : null;
    ModalMock.Title = ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>;
    ModalMock.Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
    ModalMock.Actions = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
    return { Modal: ModalMock };
});

jest.mock('../../../../../components/common/button/Button', () => ({
    Button: ({ children, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

jest.mock('../../../../../components/common/hint-box/HintBox', () => ({
    HintBox: ({ title, text }: { title: string; text: string }) => (
        <div data-testid="hint-box">
            <p>{title}</p>
            <p>{text}</p>
        </div>
    ),
}));

describe('DeleteCategoryModal', () => {
    const mockCategories: ProgramCategory[] = [
        { id: 1, name: 'Category without programs', programsCount: 0 },
        { id: 2, name: 'Category with programs', programsCount: 5 },
        { id: 3, name: 'Another empty category', programsCount: 0 },
    ];

    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onDeleteCategory: jest.fn(),
        categories: mockCategories,
    };

    // Helper functions
    const renderDeleteCategoryModal = (overrideProps = {}) =>
        render(<DeleteCategoryModal {...defaultProps} {...overrideProps} />);

    const getModal = () => screen.queryByTestId('modal');
    const getTitle = () => screen.queryByText(PROGRAM_CATEGORY_TEXT.FORM.TITLE.DELETE_CATEGORY);
    const getCategorySelect = () =>
        screen.getByRole('combobox', { name: `* ${PROGRAM_CATEGORY_TEXT.FORM.LABEL.CATEGORY}` });
    const getCancelButton = () => screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
    const getDeleteButton = () => screen.getByText(COMMON_TEXT_ADMIN.BUTTON.DELETE);
    const getHintBox = () => screen.queryByTestId('hint-box');
    const getErrorMessage = () => screen.queryByText(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_CATEGORY);
    const getHasProgramsError = (programsCount: number) =>
        screen.queryByText(PROGRAM_CATEGORY_VALIDATION.programsCount.getHasProgramsCountError(programsCount));

    const clickCancelButton = () => fireEvent.click(getCancelButton());
    const clickDeleteButton = () => fireEvent.click(getDeleteButton());
    const changeCategorySelect = (categoryId: number) =>
        fireEvent.change(getCategorySelect(), { target: { value: categoryId } });

    const expectModalClosed = () => {
        expect(defaultProps.onClose).toHaveBeenCalled();
    };

    const expectModalNotClosed = () => {
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    };

    const expectCategoryDeleted = (categoryId: number) => {
        expect(defaultProps.onDeleteCategory).toHaveBeenCalledWith(categoryId);
    };

    const expectCategoryNotDeleted = () => {
        expect(defaultProps.onDeleteCategory).not.toHaveBeenCalled();
    };

    const expectDeleteApiCalled = (categoryId: number) => {
        expect(mockedProgramsApi.deleteProgramCategory).toHaveBeenCalledWith(categoryId);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render correctly when open', () => {
        renderDeleteCategoryModal();

        expect(getTitle()).toBeInTheDocument();
        expect(getCategorySelect()).toBeInTheDocument();
        expect(getCancelButton()).toBeInTheDocument();
        expect(getDeleteButton()).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
        renderDeleteCategoryModal({ isOpen: false });

        expect(getModal()).not.toBeInTheDocument();
    });

    it('should select the first category by default', () => {
        renderDeleteCategoryModal();

        const select = getCategorySelect() as HTMLSelectElement;
        expect(select.value).toBe(mockCategories[0].id.toString());
    });

    it('should call onClose when the cancel button is clicked', () => {
        renderDeleteCategoryModal();

        clickCancelButton();

        expectModalClosed();
    });

    it('should handle successful category deletion', async () => {
        mockedProgramsApi.deleteProgramCategory.mockResolvedValue(undefined);
        renderDeleteCategoryModal();

        clickDeleteButton();

        await waitFor(() => {
            expectDeleteApiCalled(mockCategories[0].id);
        });

        expectCategoryDeleted(mockCategories[0].id);
        expectModalClosed();
    });

    it('should handle failed deletion and show an error message', async () => {
        mockedProgramsApi.deleteProgramCategory.mockRejectedValue(new Error('API Error'));
        renderDeleteCategoryModal();

        clickDeleteButton();

        expect(await screen.findByText(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_CATEGORY)).toBeInTheDocument();
        expectCategoryNotDeleted();
        expectModalNotClosed();
    });

    it('should disable delete button and show hint for a category with programs', () => {
        renderDeleteCategoryModal();

        changeCategorySelect(mockCategories[1].id);

        expect(getDeleteButton()).toBeDisabled();
        expect(getHintBox()).toBeInTheDocument();
        expect(getHasProgramsError(mockCategories[1].programsCount)).toBeInTheDocument();
    });

    it('should enable delete button for a category without programs', () => {
        renderDeleteCategoryModal();

        changeCategorySelect(mockCategories[1].id);
        expect(getDeleteButton()).toBeDisabled();

        changeCategorySelect(mockCategories[2].id);
        expect(getDeleteButton()).not.toBeDisabled();
        expect(getHintBox()).not.toBeInTheDocument();
    });

    it('should disable all controls while submitting', async () => {
        let resolveRequest!: () => void;
        const longRunningPromise = new Promise<void>((resolve) => {
            resolveRequest = resolve;
        });
        mockedProgramsApi.deleteProgramCategory.mockReturnValue(longRunningPromise);

        renderDeleteCategoryModal();

        const deleteButton = getDeleteButton() as HTMLButtonElement;
        const cancelButton = getCancelButton() as HTMLButtonElement;
        const select = getCategorySelect() as HTMLSelectElement;

        clickDeleteButton();

        await waitFor(() => {
            expect(deleteButton).toBeDisabled();
            expect(cancelButton).toBeDisabled();
            expect(select).toBeDisabled();
        });

        resolveRequest();

        await waitFor(() => {
            expectModalClosed();
        });
    });

    it('should clear the error message when the modal re-opens', async () => {
        mockedProgramsApi.deleteProgramCategory.mockRejectedValue(new Error('API error'));
        const { rerender } = renderDeleteCategoryModal();

        clickDeleteButton();
        await screen.findByText(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_CATEGORY);

        rerender(<DeleteCategoryModal {...defaultProps} isOpen={false} />);
        rerender(<DeleteCategoryModal {...defaultProps} isOpen={true} />);

        expect(getErrorMessage()).not.toBeInTheDocument();
    });
});
