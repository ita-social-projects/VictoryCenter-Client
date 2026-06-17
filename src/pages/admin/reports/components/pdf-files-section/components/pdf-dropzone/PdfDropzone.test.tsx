import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PdfDropzone } from './PdfDropzone';
import { PdfReportsApi } from '@/services/api/admin/reports/pdf-reports/pdf-reports-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { AxiosError } from 'axios';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
jest.mock('@/services/api/admin/reports/pdf-reports/pdf-reports-api');
jest.mock('@/assets/icons/sticky_note.svg', () => ({
    ReactComponent: () => <svg data-testid="file-icon" />,
}));
jest.mock('@/assets/icons/add.svg', () => ({
    ReactComponent: () => <svg data-testid="add-icon" />,
}));

describe('PdfDropzone', () => {
    const mockClient = { get: jest.fn() };
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const mockResult = { id: 1, name: 'test.pdf' };

    let mockOnUploaded: jest.Mock;

    const setup = () => {
        const utils = render(<PdfDropzone onUploaded={mockOnUploaded} languageId={1} />);
        const input = utils.container.querySelector('input[type="file"]') as HTMLInputElement;

        return {
            ...utils,
            input,
        };
    };

    const uploadFile = (input: HTMLInputElement, file: File) => {
        fireEvent.change(input, { target: { files: [file] } });
    };

    const dropFile = (file: File) => {
        const label = screen.getByText(PDF_FILES_SECTION_TEXT.DROPZONE.TITLE).closest('label')!;
        fireEvent.drop(label, {
            dataTransfer: { files: [file] },
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnUploaded = jest.fn();
        (useAdminClient as jest.Mock).mockReturnValue(mockClient);
    });

    it('renders dropzone with title and subtitle', () => {
        setup();

        expect(screen.getByText(PDF_FILES_SECTION_TEXT.DROPZONE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(PDF_FILES_SECTION_TEXT.DROPZONE.SUBTITLE)).toBeInTheDocument();
    });

    it('shows uploading text while uploading', async () => {
        (PdfReportsApi.create as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(mockResult), 100)),
        );

        const { input } = setup();
        uploadFile(input, mockFile);

        expect(await screen.findByText(PDF_FILES_SECTION_TEXT.DROPZONE.UPLOADING)).toBeInTheDocument();
    });

    it('calls onUploaded after successful upload', async () => {
        (PdfReportsApi.create as jest.Mock).mockResolvedValueOnce(mockResult);

        const { input } = setup();
        uploadFile(input, mockFile);

        await waitFor(() => {
            expect(mockOnUploaded).toHaveBeenCalledWith(mockResult);
        });
    });

    it('calls API with correct arguments', async () => {
        (PdfReportsApi.create as jest.Mock).mockResolvedValueOnce(mockResult);

        const { input } = setup();
        uploadFile(input, mockFile);

        await waitFor(() => {
            expect(PdfReportsApi.create).toHaveBeenCalledWith(mockClient, mockFile, 1);
        });
    });

    it('handles file drop', async () => {
        (PdfReportsApi.create as jest.Mock).mockResolvedValueOnce(mockResult);

        setup();
        dropFile(mockFile);

        await waitFor(() => {
            expect(PdfReportsApi.create).toHaveBeenCalledWith(mockClient, mockFile, 1);
        });
    });

    it('restores title after upload', async () => {
        (PdfReportsApi.create as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(mockResult), 100)),
        );

        const { input } = setup();
        uploadFile(input, mockFile);

        expect(await screen.findByText(PDF_FILES_SECTION_TEXT.DROPZONE.UPLOADING)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText(PDF_FILES_SECTION_TEXT.DROPZONE.UPLOADING)).not.toBeInTheDocument();
            expect(screen.getByText(PDF_FILES_SECTION_TEXT.DROPZONE.TITLE)).toBeInTheDocument();
        });
    });

    it('shows error for non-pdf file', async () => {
        const { input } = setup();
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });

        uploadFile(input, file);

        expect(await screen.findByText(PDF_FILES_SECTION_TEXT.DROPZONE.ERROR_INVALID_FORMAT)).toBeInTheDocument();
        expect(PdfReportsApi.create).not.toHaveBeenCalled();
    });

    it('shows error for large file', async () => {
        const { input } = setup();
        const file = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });

        uploadFile(input, file);

        expect(await screen.findByText(PDF_FILES_SECTION_TEXT.DROPZONE.ERROR_FILE_TOO_LARGE)).toBeInTheDocument();
        expect(PdfReportsApi.create).not.toHaveBeenCalled();
    });

    it('shows error when upload fails', async () => {
        (PdfReportsApi.create as jest.Mock).mockRejectedValueOnce(new Error());

        const { input } = setup();
        uploadFile(input, mockFile);

        expect(await screen.findByText(PDF_FILES_SECTION_TEXT.DROPZONE.ERROR_UPLOAD_FAILED)).toBeInTheDocument();
        expect(mockOnUploaded).not.toHaveBeenCalled();
    });

    const mockBackendError = (errors: unknown): AxiosError =>
        ({
            response: {
                data: { errors },
            },
        }) as unknown as AxiosError;

    it.each([[['File size cannot exceed 10 MB']], ['File size cannot exceed 10 MB']])(
        'extracts backend error message: %p',
        async (errors) => {
            (PdfReportsApi.create as jest.Mock).mockRejectedValueOnce(mockBackendError(errors));

            const { input } = setup();
            uploadFile(input, mockFile);

            expect(await screen.findByText('File size cannot exceed 10 MB')).toBeInTheDocument();
            expect(mockOnUploaded).not.toHaveBeenCalled();
        },
    );

    it('falls back to generic error if backend error is invalid', async () => {
        (PdfReportsApi.create as jest.Mock).mockRejectedValueOnce(mockBackendError(undefined));

        const { input } = setup();
        uploadFile(input, mockFile);

        expect(await screen.findByText(PDF_FILES_SECTION_TEXT.DROPZONE.ERROR_UPLOAD_FAILED)).toBeInTheDocument();
        expect(mockOnUploaded).not.toHaveBeenCalled();
    });

    it('should set dragging state on dragOver and remove on dragLeave', () => {
        setup();
        const label = screen.getByText(PDF_FILES_SECTION_TEXT.DROPZONE.TITLE).closest('label')!;

        fireEvent.dragOver(label);
        expect(label.className).toContain('dragging');

        fireEvent.dragLeave(label);
        expect(label.className).not.toContain('dragging');
    });

    it('should not handle drop when no file is present', async () => {
        setup();
        const label = screen.getByText(PDF_FILES_SECTION_TEXT.DROPZONE.TITLE).closest('label')!;

        fireEvent.drop(label, { dataTransfer: { files: [] } });

        await waitFor(() => {
            expect(PdfReportsApi.create).not.toHaveBeenCalled();
        });
    });
});
