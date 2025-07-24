import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeleteCategoryModal } from './DeleteCategoryModal';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import { ProgramCategory } from '../../../../../types/ProgramAdminPage';

jest.mock('../../../../../services/api/admin/programs/programs-api');
const mockedProgramsApi = ProgramsApi as jest.Mocked<typeof ProgramsApi>;

const TEXT = {
    TITLE: 'Delete category',
    LABEL: {
        CATEGORY: 'Category',
    },
    MESSAGE: {
        FAIL_TO_DELETE: 'Failed to delete category.',
    },
    HINT: {
        TITLE: (count: number) => `This category has ${count} programs`,
        TEXT: 'To delete it, you need to either relocate the programs or delete them.',
    },
    BUTTON: {
        CANCEL: 'Cancel',
        DELETE: 'Delete',
    },
};

jest.mock('../../../../../const/admin/programs', () => ({
    PROGRAM_CATEGORY_TEXT: {
        FORM: {
            TITLE: { DELETE_CATEGORY: TEXT.TITLE },
            LABEL: { CATEGORY: TEXT.LABEL.CATEGORY },
            MESSAGE: { FAIL_TO_DELETE_CATEGORY: TEXT.MESSAGE.FAIL_TO_DELETE },
        },
    },
    PROGRAM_CATEGORY_VALIDATION: {
        programsCount: {
            getHasProgramsCountError: TEXT.HINT.TITLE,
            getRelocationOrRemovalHint: () => TEXT.HINT.TEXT,
        },
    },
}));

jest.mock('../../../../../const/admin/common', () => ({
    COMMON_TEXT_ADMIN: {
        BUTTON: {
            CANCEL: TEXT.BUTTON.CANCEL,
            DELETE: TEXT.BUTTON.DELETE,
        },
    },
}));

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

    let mockProps: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockProps = {
            isOpen: true,
            onClose: jest.fn(),
            onDeleteCategory: jest.fn(),
            categories: mockCategories,
        };
    });

    it('should render correctly when open', () => {
        render(<DeleteCategoryModal {...mockProps} />);
        expect(screen.getByText(TEXT.TITLE)).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /Category/i })).toBeInTheDocument();
        expect(screen.getByText(TEXT.BUTTON.CANCEL)).toBeInTheDocument();
        expect(screen.getByText(TEXT.BUTTON.DELETE)).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
        render(<DeleteCategoryModal {...mockProps} isOpen={false} />);
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should select the first category by default', () => {
        render(<DeleteCategoryModal {...mockProps} />);
        const select = screen.getByRole('combobox', { name: /Category/i }) as HTMLSelectElement;
        expect(select.value).toBe(mockCategories[0].id.toString());
    });

    it('should call onClose when the cancel button is clicked', () => {
        render(<DeleteCategoryModal {...mockProps} />);
        fireEvent.click(screen.getByText(TEXT.BUTTON.CANCEL));
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle successful category deletion', async () => {
        mockedProgramsApi.deleteCategory.mockResolvedValue(undefined);
        render(<DeleteCategoryModal {...mockProps} />);

        fireEvent.click(screen.getByText(TEXT.BUTTON.DELETE));

        await waitFor(() => {
            expect(mockedProgramsApi.deleteCategory).toHaveBeenCalledWith(mockCategories[0].id);
        });

        expect(mockProps.onDeleteCategory).toHaveBeenCalledWith(mockCategories[0].id);
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle failed deletion and show an error message', async () => {
        mockedProgramsApi.deleteCategory.mockRejectedValue(new Error('API Error'));
        render(<DeleteCategoryModal {...mockProps} />);

        fireEvent.click(screen.getByText(TEXT.BUTTON.DELETE));

        expect(await screen.findByText(TEXT.MESSAGE.FAIL_TO_DELETE)).toBeInTheDocument();
        expect(mockProps.onDeleteCategory).not.toHaveBeenCalled();
        expect(mockProps.onClose).not.toHaveBeenCalled();
    });

    it('should disable delete button and show hint for a category with programs', () => {
        render(<DeleteCategoryModal {...mockProps} />);
        const select = screen.getByRole('combobox', { name: /Category/i });

        fireEvent.change(select, { target: { value: mockCategories[1].id } });

        expect(screen.getByText(TEXT.BUTTON.DELETE)).toBeDisabled();
        expect(screen.getByTestId('hint-box')).toBeInTheDocument();
        expect(screen.getByText(TEXT.HINT.TITLE(mockCategories[1].programsCount))).toBeInTheDocument();
    });

    it('should enable delete button for a category without programs', () => {
        render(<DeleteCategoryModal {...mockProps} />);
        const select = screen.getByRole('combobox', { name: /Category/i });

        fireEvent.change(select, { target: { value: mockCategories[1].id } });
        expect(screen.getByText(TEXT.BUTTON.DELETE)).toBeDisabled();

        fireEvent.change(select, { target: { value: mockCategories[2].id } });
        expect(screen.getByText(TEXT.BUTTON.DELETE)).not.toBeDisabled();
        expect(screen.queryByTestId('hint-box')).not.toBeInTheDocument();
    });

    it('should disable all controls while submitting', async () => {
        let resolveRequest!: () => void;
        const longRunningPromise = new Promise<void>((resolve) => {
            resolveRequest = resolve;
        });
        mockedProgramsApi.deleteCategory.mockReturnValue(longRunningPromise);

        render(<DeleteCategoryModal {...mockProps} />);

        const deleteButton = screen.getByText<HTMLButtonElement>(TEXT.BUTTON.DELETE);
        const cancelButton = screen.getByText<HTMLButtonElement>(TEXT.BUTTON.CANCEL);
        const select = screen.getByRole('combobox', { name: /Category/i }) as HTMLSelectElement;

        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(deleteButton).toBeDisabled();
            expect(cancelButton).toBeDisabled();
            expect(select).toBeDisabled();
        });

        resolveRequest();

        await waitFor(() => {
            expect(mockProps.onClose).toHaveBeenCalled();
        });
    });

    it('should clear the error message when the modal re-opens', async () => {
        mockedProgramsApi.deleteCategory.mockRejectedValue(new Error('API error'));
        const { rerender } = render(<DeleteCategoryModal {...mockProps} />);

        fireEvent.click(screen.getByText(TEXT.BUTTON.DELETE));
        await screen.findByText(TEXT.MESSAGE.FAIL_TO_DELETE);

        rerender(<DeleteCategoryModal {...mockProps} isOpen={false} />);
        rerender(<DeleteCategoryModal {...mockProps} isOpen={true} />);

        expect(screen.queryByText(TEXT.MESSAGE.FAIL_TO_DELETE)).not.toBeInTheDocument();
    });
});
