import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PdfDropzone } from './PdfDropzone';
import { PdfReportsApi } from '@/services/api/admin/reports/pdf-reports/pdf-reports-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
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
    const mockOnUploaded = jest.fn();
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const mockResult = { id: 1, name: 'test.pdf' };

    const getInput = (container: HTMLElement) => container.querySelector('input[type="file"]') as HTMLInputElement;

    beforeEach(() => {
        jest.clearAllMocks();
        (useAdminClient as jest.Mock).mockReturnValue(mockClient);
    });

    it('should render dropzone with title and subtitle', () => {
        render(<PdfDropzone onUploaded={mockOnUploaded} />);

        expect(screen.getByText(PDF_FILES_SECTION_TEXT.DROPZONE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(PDF_FILES_SECTION_TEXT.DROPZONE.SUBTITLE)).toBeInTheDocument();
    });

    it('should show uploading text while file is being uploaded', async () => {
        (PdfReportsApi.create as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(mockResult), 100)),
        );

        const { container } = render(<PdfDropzone onUploaded={mockOnUploaded} />);

        fireEvent.change(getInput(container), { target: { files: [mockFile] } });

        expect(await screen.findByText(PDF_FILES_SECTION_TEXT.DROPZONE.UPLOADING)).toBeInTheDocument();
    });

    it('should call onUploaded with result after successful upload', async () => {
        (PdfReportsApi.create as jest.Mock).mockResolvedValueOnce(mockResult);

        const { container } = render(<PdfDropzone onUploaded={mockOnUploaded} />);

        fireEvent.change(getInput(container), { target: { files: [mockFile] } });

        await waitFor(() => {
            expect(mockOnUploaded).toHaveBeenCalledWith(mockResult);
        });
    });

    it('should show error for non-pdf file', async () => {
        const nonPdfFile = new File(['content'], 'test.txt', { type: 'text/plain' });

        const { container } = render(<PdfDropzone onUploaded={mockOnUploaded} />);

        fireEvent.change(getInput(container), { target: { files: [nonPdfFile] } });

        expect(await screen.findByText(PDF_FILES_SECTION_TEXT.DROPZONE.ERROR_INVALID_FORMAT)).toBeInTheDocument();
        expect(PdfReportsApi.create).not.toHaveBeenCalled();
    });

    it('should show error when upload fails', async () => {
        (PdfReportsApi.create as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));

        const { container } = render(<PdfDropzone onUploaded={mockOnUploaded} />);

        fireEvent.change(getInput(container), { target: { files: [mockFile] } });

        expect(await screen.findByText(PDF_FILES_SECTION_TEXT.DROPZONE.ERROR_UPLOAD_FAILED)).toBeInTheDocument();
        expect(mockOnUploaded).not.toHaveBeenCalled();
    });

    it('should call PdfReportsApi.create with correct arguments', async () => {
        (PdfReportsApi.create as jest.Mock).mockResolvedValueOnce(mockResult);

        const { container } = render(<PdfDropzone onUploaded={mockOnUploaded} />);

        fireEvent.change(getInput(container), { target: { files: [mockFile] } });

        await waitFor(() => {
            expect(PdfReportsApi.create).toHaveBeenCalledWith(mockClient, mockFile);
        });
    });

    it('should handle file drop', async () => {
        (PdfReportsApi.create as jest.Mock).mockResolvedValueOnce(mockResult);

        render(<PdfDropzone onUploaded={mockOnUploaded} />);

        const label = screen.getByText(PDF_FILES_SECTION_TEXT.DROPZONE.TITLE).closest('label')!;

        fireEvent.drop(label, {
            dataTransfer: { files: [mockFile] },
        });

        await waitFor(() => {
            expect(PdfReportsApi.create).toHaveBeenCalledWith(mockClient, mockFile);
        });
    });

    it('should restore title text after successful upload', async () => {
        (PdfReportsApi.create as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(mockResult), 100)),
        );

        const { container } = render(<PdfDropzone onUploaded={mockOnUploaded} />);

        fireEvent.change(getInput(container), { target: { files: [mockFile] } });

        expect(await screen.findByText(PDF_FILES_SECTION_TEXT.DROPZONE.UPLOADING)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText(PDF_FILES_SECTION_TEXT.DROPZONE.UPLOADING)).not.toBeInTheDocument();
            expect(screen.getByText(PDF_FILES_SECTION_TEXT.DROPZONE.TITLE)).toBeInTheDocument();
        });
    });
});
