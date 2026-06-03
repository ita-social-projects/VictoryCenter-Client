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
jest.mock('@/assets/icons/checkmark.svg', () => ({
    ReactComponent: () => <svg data-testid="checkmark-icon" />,
}));
jest.mock('@/assets/icons/cross.svg', () => ({
    ReactComponent: () => <svg data-testid="cross-icon" />,
}));
jest.mock('@/components/admin/icon-button/IconButton', () => ({
    IconButton: ({ onClick, disabled, 'aria-label': ariaLabel }: any) => (
        <button onClick={onClick} disabled={disabled} aria-label={ariaLabel} />
    ),
}));

jest.mock('@/validation/admin/reports-schema/pdf-file-rename-schema/pdf-file-rename-schema', () => ({
    PDF_FILE_RENAME_VALIDATION_FUNCTIONS: {
        validateName: jest.fn((value) => {
            if (value.length < 2) return 'Не менше 2 символів';
            if (value.length > 50) return 'Не більше 50 символів';
            return undefined;
        }),
    },
}));

describe('PdfFilesTable', () => {
    const { PDF_FILE_RENAME_VALIDATION_FUNCTIONS } = jest.requireMock(
        '@/validation/admin/reports-schema/pdf-file-rename-schema/pdf-file-rename-schema',
    );

    const enterEditMode = async (user: ReturnType<typeof userEvent.setup>, fileIndex = 0) => {
        const editButtons = screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.EDIT);
        await user.click(editButtons[fileIndex]);
        return screen.getByDisplayValue(mockFiles[fileIndex].name) as HTMLInputElement;
    };

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
    const mockOnRenameFile = jest.fn();

    const defaultProps = {
        files: mockFiles,
        onViewFile: jest.fn(),
        onDeleteFile: mockOnDeleteFile,
        onRenameFile: mockOnRenameFile,
        isDeleting: false,
        isRenaming: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        PDF_FILE_RENAME_VALIDATION_FUNCTIONS.validateName.mockImplementation((value: string) => {
            if (value.length < 2) return 'Не менше 2 символів';
            if (value.length > 50) return 'Не більше 50 символів';
            return undefined;
        });
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

    it('should disable all delete buttons when a file is being renamed', async () => {
        const user = userEvent.setup();
        render(<PdfFilesTable {...defaultProps} />);

        await enterEditMode(user);

        screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.DELETE).forEach((button) => {
            expect(button).toBeDisabled();
        });
    });

    it('should disable modal buttons when isDeleting is true', async () => {
        const user = userEvent.setup();
        const { rerender } = render(<PdfFilesTable {...defaultProps} isDeleting={false} />);

        const deleteButtons = screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.DELETE);
        await user.click(deleteButtons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('delete-confirmation-modal')).toBeInTheDocument();
        });

        let confirmButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES);
        let cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO);
        expect(confirmButton).not.toBeDisabled();
        expect(cancelButton).not.toBeDisabled();

        rerender(<PdfFilesTable {...defaultProps} isDeleting={true} />);

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

    describe('rename functionality', () => {
        it('should render edit button for each file', () => {
            render(<PdfFilesTable {...defaultProps} />);

            const editButtons = screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.EDIT);
            expect(editButtons).toHaveLength(mockFiles.length);
        });

        it('should enter edit mode when edit button is clicked', async () => {
            const user = userEvent.setup();
            render(<PdfFilesTable {...defaultProps} />);

            const input = await enterEditMode(user);
            expect(input).toBeInTheDocument();
        });

        it('should disable all edit buttons when one is in edit mode', async () => {
            const user = userEvent.setup();
            render(<PdfFilesTable {...defaultProps} />);

            await enterEditMode(user);

            screen.getAllByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.EDIT).forEach((button) => {
                expect(button).toBeDisabled();
            });
        });

        it('should show accept and cancel buttons in edit mode', async () => {
            const user = userEvent.setup();
            render(<PdfFilesTable {...defaultProps} />);

            await enterEditMode(user);

            expect(screen.getByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.ACCEPT_RENAME)).toBeInTheDocument();
            expect(screen.getByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.CANCEL_RENAME)).toBeInTheDocument();
        });

        it('should cancel edit mode when cancel button is clicked', async () => {
            const user = userEvent.setup();
            render(<PdfFilesTable {...defaultProps} />);

            await enterEditMode(user);

            const cancelButton = screen.getByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.CANCEL_RENAME);
            await user.click(cancelButton);

            expect(screen.queryByDisplayValue(mockFiles[0].name)).not.toBeInTheDocument();
        });

        it('should call onRenameFile with correct parameters when accept button is clicked', async () => {
            const user = userEvent.setup();
            render(<PdfFilesTable {...defaultProps} />);

            const input = await enterEditMode(user);
            await user.clear(input);
            await user.type(input, 'New Name');

            await user.click(screen.getByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.ACCEPT_RENAME));

            await waitFor(() => {
                expect(mockOnRenameFile).toHaveBeenCalledWith(mockFiles[0].id, 'New Name');
            });
        });

        it('should show error when validation fails on accept', async () => {
            const user = userEvent.setup();
            render(<PdfFilesTable {...defaultProps} />);

            const input = await enterEditMode(user);
            await user.clear(input);
            await user.type(input, 'AB');

            PDF_FILE_RENAME_VALIDATION_FUNCTIONS.validateName.mockReturnValueOnce('Помилка валідації');

            await user.click(screen.getByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.ACCEPT_RENAME));

            await waitFor(() => {
                expect(screen.getByText('Помилка валідації')).toBeInTheDocument();
            });
        });

        it('should show error message when rename request fails', async () => {
            mockOnRenameFile.mockRejectedValueOnce(new Error('Server error'));
            const user = userEvent.setup();
            render(<PdfFilesTable {...defaultProps} />);

            const input = await enterEditMode(user);
            await user.clear(input);
            await user.type(input, 'Valid Name');

            await user.click(screen.getByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.ACCEPT_RENAME));

            await waitFor(() => {
                expect(screen.getByText('Помилка при збереженні')).toBeInTheDocument();
            });
        });

        it('should disable accept and cancel buttons when isRenaming is true', async () => {
            const user = userEvent.setup();
            const { rerender } = render(<PdfFilesTable {...defaultProps} isRenaming={false} />);

            await enterEditMode(user);

            rerender(<PdfFilesTable {...defaultProps} isRenaming={true} />);

            expect(screen.getByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.ACCEPT_RENAME)).toBeDisabled();
            expect(screen.getByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.CANCEL_RENAME)).toBeDisabled();
        });

        it('should normalize spaces (trim and collapse) in the input', async () => {
            const user = userEvent.setup();
            render(<PdfFilesTable {...defaultProps} />);

            const input = await enterEditMode(user);
            await user.clear(input);
            await user.type(input, '  New  Name  With   Spaces  ');

            const acceptButton = screen.getByLabelText(PDF_FILES_SECTION_TEXT.ACTIONS.FILE.ACCEPT_RENAME);
            await user.click(acceptButton);

            await waitFor(() => {
                expect(mockOnRenameFile).toHaveBeenCalledWith(mockFiles[0].id, 'New Name With Spaces');
            });
        });

        it('should disable accept button when name is empty', async () => {
            const user = userEvent.setup();
            render(<PdfFilesTable {...defaultProps} />);

            const input = await enterEditMode(user);
            await user.clear(input);

            const acceptButton = screen.getByLabelText(
                PDF_FILES_SECTION_TEXT.ACTIONS.FILE.ACCEPT_RENAME,
            ) as HTMLButtonElement;
            expect(acceptButton).toBeDisabled();
        });

        it('should disable accept button when validation fails', async () => {
            const user = userEvent.setup();
            render(<PdfFilesTable {...defaultProps} />);

            const input = await enterEditMode(user);
            await user.clear(input);
            await user.type(input, 'A');

            const acceptButton = screen.getByLabelText(
                PDF_FILES_SECTION_TEXT.ACTIONS.FILE.ACCEPT_RENAME,
            ) as HTMLButtonElement;
            expect(acceptButton).toBeDisabled();
        });
    });
});
