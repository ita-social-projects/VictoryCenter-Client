import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeleteProgramModal, DeleteProgramModalProps } from './DeleteProgramModal';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { ProgramsApi } from '../../../../../services/api/admin/programs/programs-api';
import { VisibilityStatus } from '../../../../../types/admin/common';
import { Program } from '../../../../../types/admin/Programs';

jest.mock('../../../../../services/api/admin/programs/programs-api');
const mockedProgramsApi = ProgramsApi as jest.Mocked<typeof ProgramsApi>;

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

jest.mock('../../../../../components/common/button/Button', () => ({
    Button: ({ children, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

describe('DeleteProgramModal', () => {
    const mockProgram: Program = {
        id: 1,
        name: 'Test program',
        description: 'Description',
        status: VisibilityStatus.Published,
        img: null,
        categories: [],
    };

    const defaultProps: DeleteProgramModalProps = {
        isOpen: true,
        onClose: jest.fn(),
        onDeleteProgram: jest.fn(),
        programToDelete: mockProgram,
    };

    // Helper functions
    const renderDeleteProgramModal = (overrideProps: Partial<DeleteProgramModalProps> = {}) =>
        render(<DeleteProgramModal {...defaultProps} {...overrideProps} />);

    const getCancelButton = () => screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
    const getDeleteButton = () => screen.getByText(COMMON_TEXT_ADMIN.BUTTON.DELETE);
    const getModal = () => screen.queryByTestId('delete-program-modal');
    const getErrorMessage = () => screen.queryByText(PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_PROGRAM);
    const getTitle = () => screen.queryByText(PROGRAMS_TEXT.FORM.TITLE.DELETE_PROGRAM);

    const clickCancelButton = () => fireEvent.click(getCancelButton());
    const clickDeleteButton = () => fireEvent.click(getDeleteButton());

    const expectModalClosed = () => {
        expect(defaultProps.onClose).toHaveBeenCalled();
    };

    const expectModalNotClosed = () => {
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    };

    const expectProgramDeleted = () => {
        expect(defaultProps.onDeleteProgram).toHaveBeenCalledWith(mockProgram);
    };

    const expectProgramNotDeleted = () => {
        expect(defaultProps.onDeleteProgram).not.toHaveBeenCalled();
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render correctly when open', () => {
            renderDeleteProgramModal();

            expect(getTitle()).toBeInTheDocument();
            expect(getCancelButton()).toBeInTheDocument();
            expect(getDeleteButton()).toBeInTheDocument();
            expect(getErrorMessage()).not.toBeInTheDocument();
        });

        it('should not render when isOpen is false', () => {
            renderDeleteProgramModal({ isOpen: false });

            expect(getModal()).not.toBeInTheDocument();
        });
    });

    describe('User interactions', () => {
        it('should call onClose when the cancel button is clicked', () => {
            renderDeleteProgramModal();

            clickCancelButton();

            expectModalClosed();
        });

        it('should not do anything if programToDelete is null', () => {
            renderDeleteProgramModal({ programToDelete: null });

            clickDeleteButton();

            expect(mockedProgramsApi.deleteProgram).not.toHaveBeenCalled();
        });
    });

    describe('Program deletion', () => {
        it('should handle successful deletion', async () => {
            mockedProgramsApi.deleteProgram.mockResolvedValue();
            renderDeleteProgramModal();

            clickDeleteButton();

            await waitFor(() => {
                expect(mockedProgramsApi.deleteProgram).toHaveBeenCalledWith(mockProgram.id);
            });

            expectProgramDeleted();
            expectModalClosed();
        });

        it('should handle failed deletion and show an error message', async () => {
            mockedProgramsApi.deleteProgram.mockRejectedValue(new Error('API Error'));
            renderDeleteProgramModal();

            clickDeleteButton();

            const errorMessage = await screen.findByText(PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_PROGRAM);
            expect(errorMessage).toBeInTheDocument();

            expect(mockedProgramsApi.deleteProgram).toHaveBeenCalledWith(mockProgram.id);
            expectProgramNotDeleted();
            expectModalNotClosed();
        });

        it('should disable buttons while submitting', async () => {
            let resolveRequest!: () => void;
            const longRunningPromise = new Promise<void>((resolve) => {
                resolveRequest = resolve;
            });
            mockedProgramsApi.deleteProgram.mockReturnValue(longRunningPromise);

            renderDeleteProgramModal();

            clickDeleteButton();

            await waitFor(() => {
                expect(getDeleteButton()).toBeDisabled();
                expect(getCancelButton()).toBeDisabled();
            });

            resolveRequest();

            await waitFor(() => {
                expectModalClosed();
            });
        });
    });

    describe('Error handling', () => {
        it('should clear error on close', async () => {
            mockedProgramsApi.deleteProgram.mockRejectedValue(new Error('API Error'));
            const { rerender } = renderDeleteProgramModal();

            clickDeleteButton();
            await screen.findByText(PROGRAMS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_PROGRAM);

            clickCancelButton();
            expectModalClosed();

            rerender(<DeleteProgramModal {...defaultProps} isOpen={false} />);
            rerender(<DeleteProgramModal {...defaultProps} isOpen={true} />);

            expect(getErrorMessage()).not.toBeInTheDocument();
        });
    });
});
