import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeleteProgramModal, DeleteProgramModalProps } from './DeleteProgramModal';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import { Program } from '../../../../../types/ProgramAdminPage';

jest.mock('../../../../../services/api/admin/programs/programs-api');
const mockedProgramsApi = ProgramsApi as jest.Mocked<typeof ProgramsApi>;

const TEXT = {
    TITLE: 'Delete program?',
    ERROR: 'Failed to delete the program.',
    BUTTON: {
        CANCEL: 'Cancel',
        DELETE: 'Delete',
    },
};

jest.mock('../../../../../const/admin/programs', () => ({
    PROGRAMS_TEXT: {
        FORM: {
            TITLE: { DELETE_PROGRAM: TEXT.TITLE },
            MESSAGE: { FAIL_TO_DELETE_PROGRAM: TEXT.ERROR },
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
    const ModalMock = ({ isOpen, onClose, children, 'data-testid': dataTestId }: any) =>
        isOpen ? (
            <div data-testid={dataTestId}>
                <button data-testid="modal-close-btn" onClick={onClose}>
                    X
                </button>
                {children}
            </div>
        ) : null;

    ModalMock.Title = ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>;
    ModalMock.Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
    ModalMock.Actions = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

    return {
        __esModule: true,
        Modal: ModalMock,
    };
});

describe('DeleteProgramModal', () => {
    const mockProgram: Program = {
        id: 1,
        name: 'Test program',
        description: 'Description',
        status: 'Published',
        img: 'test.jpg',
        categories: [],
    };

    let mockProps: DeleteProgramModalProps;

    beforeEach(() => {
        jest.clearAllMocks();
        mockProps = {
            isOpen: true,
            onClose: jest.fn(),
            onDeleteProgram: jest.fn(),
            programToDelete: mockProgram,
        };
    });

    it('should render correctly when open', () => {
        render(<DeleteProgramModal {...mockProps} />);

        expect(screen.getByText(TEXT.TITLE)).toBeInTheDocument();
        expect(screen.getByText(TEXT.BUTTON.CANCEL)).toBeInTheDocument();
        expect(screen.getByText(TEXT.BUTTON.DELETE)).toBeInTheDocument();
        expect(screen.queryByText(TEXT.ERROR)).not.toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
        mockProps.isOpen = false;
        render(<DeleteProgramModal {...mockProps} />);

        expect(screen.queryByTestId('delete-program-modal')).not.toBeInTheDocument();
    });

    it('should call onClose when the cancel button is clicked', () => {
        render(<DeleteProgramModal {...mockProps} />);
        fireEvent.click(screen.getByText(TEXT.BUTTON.CANCEL));
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle successful deletion', async () => {
        mockedProgramsApi.deleteProgram.mockResolvedValue();
        render(<DeleteProgramModal {...mockProps} />);

        fireEvent.click(screen.getByText(TEXT.BUTTON.DELETE));

        await waitFor(() => {
            expect(mockedProgramsApi.deleteProgram).toHaveBeenCalledWith(mockProgram.id);
        });

        expect(mockProps.onDeleteProgram).toHaveBeenCalledWith(mockProgram);
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle failed deletion and show an error message', async () => {
        mockedProgramsApi.deleteProgram.mockRejectedValue(new Error('API Error'));
        render(<DeleteProgramModal {...mockProps} />);

        fireEvent.click(screen.getByText(TEXT.BUTTON.DELETE));

        const errorMessage = await screen.findByText(TEXT.ERROR);
        expect(errorMessage).toBeInTheDocument();

        expect(mockedProgramsApi.deleteProgram).toHaveBeenCalledWith(mockProgram.id);
        expect(mockProps.onDeleteProgram).not.toHaveBeenCalled();
        expect(mockProps.onClose).not.toHaveBeenCalled();
    });

    it('should disable buttons while submitting', async () => {
        let resolveRequest!: () => void;
        const longRunningPromise = new Promise<void>((resolve) => {
            resolveRequest = resolve;
        });
        mockedProgramsApi.deleteProgram.mockReturnValue(longRunningPromise);

        render(<DeleteProgramModal {...mockProps} />);

        const deleteButton = screen.getByText<HTMLButtonElement>(TEXT.BUTTON.DELETE);
        const cancelButton = screen.getByText<HTMLButtonElement>(TEXT.BUTTON.CANCEL);

        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(deleteButton).toBeDisabled();
            expect(cancelButton).toBeDisabled();
        });

        resolveRequest();

        await waitFor(() => {
            expect(mockProps.onClose).toHaveBeenCalled();
        });
    });

    it('should not do anything if programToDelete is null', () => {
        mockProps.programToDelete = null;
        render(<DeleteProgramModal {...mockProps} />);

        fireEvent.click(screen.getByText(TEXT.BUTTON.DELETE));

        expect(mockedProgramsApi.deleteProgram).not.toHaveBeenCalled();
    });

    it('should clear error on close', async () => {
        mockedProgramsApi.deleteProgram.mockRejectedValue(new Error('API Error'));
        const { rerender } = render(<DeleteProgramModal {...mockProps} />);
        fireEvent.click(screen.getByText(TEXT.BUTTON.DELETE));
        await screen.findByText(TEXT.ERROR);

        fireEvent.click(screen.getByText(TEXT.BUTTON.CANCEL));
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);

        rerender(<DeleteProgramModal {...mockProps} isOpen={false} />);
        rerender(<DeleteProgramModal {...mockProps} isOpen={true} />);

        expect(screen.queryByText(TEXT.ERROR)).not.toBeInTheDocument();
    });
});
