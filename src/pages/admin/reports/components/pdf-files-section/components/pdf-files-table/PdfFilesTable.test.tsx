import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PdfFilesTable } from './PdfFilesTable';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import { PdfReportDto } from '@/types/admin/pdf-section';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => {
    const { COMMON_TEXT_ADMIN } = jest.requireActual('@/const/admin/common');
    return {
        ConfirmationModal: ({ isOpen, onConfirm, onCancel, title, isButtonsDisabled, className }: any) =>
            isOpen ? (
                <div data-testid="delete-confirmation-modal" role="dialog" className={className}>
                    <h2>{title}</h2>
                    <button onClick={onCancel} disabled={isButtonsDisabled}>
                        {COMMON_TEXT_ADMIN.BUTTON.NO}
                    </button>
                    <button onClick={onConfirm} disabled={isButtonsDisabled}>
                        {COMMON_TEXT_ADMIN.BUTTON.YES}
                    </button>
                </div>
            ) : null,
    };
});

jest.mock('@/assets/icons/eye-opened.svg', () => ({
    ReactComponent: () => <svg data-testid="eye-icon" />,
}));
jest.mock('@/assets/icons/file.svg', () => ({
    ReactComponent: () => <svg data-testid="file-icon" />,
}));
jest.mock('@/assets/icons/not-found.svg', () => ({
    ReactComponent: () => <svg data-testid="not-found-icon" />,
}));
jest.mock('@/components/admin/icon-button/IconButton', () => ({
    IconButton: ({ onClick, disabled, 'aria-label': ariaLabel }: any) => (
        <button onClick={onClick} disabled={disabled} aria-label={ariaLabel} />
    ),
}));

describe('PdfFilesTable', () => {
    const mockFiles: PdfReportDto[] = [
        {
            id: 1,
            name: 'Report_2024.pdf',
            createdAt: '2024-01-15T12:00:00Z',
            fileSizeBytes: 102400, // 100 KB
            blobName: 'blob-1',
            priority: 0,
        },
        {
            id: 2,
            name: 'Audit_Final.pdf',
            createdAt: '2024-02-20T15:30:00Z',
            fileSizeBytes: 204800, // 200 KB
            blobName: 'blob-2',
            priority: 1,
        },
    ];

    const mockOnDeleteFile = jest.fn();

    const defaultProps = {
        files: mockFiles,
        onViewFile: jest.fn(),
        onDeleteFile: mockOnDeleteFile,
        isDeleting: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render view button for each file', () => {
        render(<PdfFilesTable {...defaultProps} />);

        const viewButtons = screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.VIEW);
        expect(viewButtons).toHaveLength(mockFiles.length);
    });

    it('should render table headers correctly', () => {
        render(<PdfFilesTable {...defaultProps} />);

        expect(screen.getByText(PDF_FILES_SECTION_TEXT.TABLE.HEADER.NAME)).toBeInTheDocument();
        expect(screen.getByText(PDF_FILES_SECTION_TEXT.TABLE.HEADER.DATE_TIME)).toBeInTheDocument();
        expect(screen.getByText(PDF_FILES_SECTION_TEXT.TABLE.HEADER.SIZE)).toBeInTheDocument();
        expect(screen.getByText(PDF_FILES_SECTION_TEXT.TABLE.HEADER.ACTIONS)).toBeInTheDocument();
    });

    it('should render file list correctly', () => {
        render(<PdfFilesTable {...defaultProps} />);

        expect(screen.getByText('Report_2024.pdf')).toBeInTheDocument();
        expect(screen.getByText('Audit_Final.pdf')).toBeInTheDocument();

        expect(screen.getByText('100 KB')).toBeInTheDocument();
        expect(screen.getByText('200 KB')).toBeInTheDocument();
    });

    it('should show "no files" message when files array is empty', () => {
        render(<PdfFilesTable {...defaultProps} files={[]} />);

        expect(screen.getByText(PDF_FILES_SECTION_TEXT.TABLE.NO_FILES)).toBeInTheDocument();
        expect(screen.getByTestId('not-found-icon')).toBeInTheDocument();
    });

    it('should render delete button for each file', () => {
        render(<PdfFilesTable {...defaultProps} />);

        const deleteButtons = screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.DELETE);
        expect(deleteButtons).toHaveLength(mockFiles.length);
    });

    it('should show delete confirmation modal when delete button is clicked', async () => {
        const user = userEvent.setup();
        render(<PdfFilesTable {...defaultProps} />);

        const deleteButtons = screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.DELETE);
        await user.click(deleteButtons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('delete-confirmation-modal')).toBeInTheDocument();
            expect(screen.getByText(PDF_FILES_SECTION_TEXT.DELETE_CONFIRMATION.TITLE)).toBeInTheDocument();
        });
    });

    it('should call onDeleteFile when delete confirmation is confirmed', async () => {
        const user = userEvent.setup();
        render(<PdfFilesTable {...defaultProps} />);

        const deleteButtons = screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.DELETE);
        await user.click(deleteButtons[0]);

        const confirmButton = await screen.findByText(COMMON_TEXT_ADMIN.BUTTON.YES);
        await user.click(confirmButton);

        await waitFor(() => {
            expect(mockOnDeleteFile).toHaveBeenCalledWith(mockFiles[0].id);
        });
    });

    it('should close modal without calling onDeleteFile when delete is cancelled', async () => {
        const user = userEvent.setup();
        render(<PdfFilesTable {...defaultProps} />);

        const deleteButtons = screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.DELETE);
        await user.click(deleteButtons[0]);

        const cancelButton = await screen.findByText(COMMON_TEXT_ADMIN.BUTTON.NO);
        await user.click(cancelButton);

        await waitFor(() => {
            expect(mockOnDeleteFile).not.toHaveBeenCalled();
            expect(screen.queryByTestId('delete-confirmation-modal')).not.toBeInTheDocument();
        });
    });

    it('should disable delete button when isDeleting is true', () => {
        render(<PdfFilesTable {...defaultProps} isDeleting={true} />);

        const deleteButtons = screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.DELETE);
        deleteButtons.forEach((button) => {
            expect(button).toBeDisabled();
        });
    });

    it('should disable modal buttons when isDeleting is true', async () => {
        const user = userEvent.setup();
        // First render with isDeleting={false} to open the modal
        const { rerender } = render(<PdfFilesTable {...defaultProps} isDeleting={false} />);

        const deleteButtons = screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.DELETE);
        await user.click(deleteButtons[0]);

        // Wait for modal to appear
        await waitFor(() => {
            expect(screen.getByTestId('delete-confirmation-modal')).toBeInTheDocument();
        });

        // Modal is now open, verify buttons are not disabled
        let confirmButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES);
        let cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO);
        expect(confirmButton).not.toBeDisabled();
        expect(cancelButton).not.toBeDisabled();

        // Now re-render with isDeleting={true}
        rerender(<PdfFilesTable {...defaultProps} isDeleting={true} />);

        // Buttons should now be disabled
        confirmButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES);
        cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO);
        expect(confirmButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
    });

    it('should call onViewFile when view button is clicked', async () => {
        const user = userEvent.setup();
        const mockOnViewFile = jest.fn();
        render(<PdfFilesTable {...defaultProps} onViewFile={mockOnViewFile} />);

        const viewButtons = screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.VIEW);
        await user.click(viewButtons[0]);

        await waitFor(() => {
            expect(mockOnViewFile).toHaveBeenCalledWith(mockFiles[0]);
        });
    });

    it('should call onViewFile with correct file when multiple view buttons are present', async () => {
        const user = userEvent.setup();
        const mockOnViewFile = jest.fn();
        render(<PdfFilesTable {...defaultProps} onViewFile={mockOnViewFile} />);

        const viewButtons = screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.VIEW);
        await user.click(viewButtons[1]);

        await waitFor(() => {
            expect(mockOnViewFile).toHaveBeenCalledWith(mockFiles[1]);
        });
    });

    it('should allow multiple view button clicks for different files', async () => {
        const user = userEvent.setup();
        const mockOnViewFile = jest.fn();
        render(<PdfFilesTable {...defaultProps} onViewFile={mockOnViewFile} />);

        const viewButtons = screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.VIEW);

        await user.click(viewButtons[0]);
        await waitFor(() => {
            expect(mockOnViewFile).toHaveBeenNthCalledWith(1, mockFiles[0]);
        });

        await user.click(viewButtons[1]);
        await waitFor(() => {
            expect(mockOnViewFile).toHaveBeenNthCalledWith(2, mockFiles[1]);
        });

        expect(mockOnViewFile).toHaveBeenCalledTimes(2);
    });
});
