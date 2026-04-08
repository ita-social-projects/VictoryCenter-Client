import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PdfFilesSection } from './PdfFilesSection';
import { PdfSectionApi } from '@/services/api/admin/reports/pdf-section/pdf-section-api';
import { PdfReportsApi } from '@/services/api/admin/reports/pdf-reports/pdf-reports-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
jest.mock('@/services/api/admin/reports/pdf-section/pdf-section-api');
jest.mock('@/services/api/admin/reports/pdf-reports/pdf-reports-api');
jest.mock('@/hooks/common/use-data-fetch/useDataFetch');
jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');

jest.mock('./components/pdf-section-content-block/PdfSectionContentBlock', () => ({
    PdfSectionContentBlock: () => <div data-testid="content-block">ContentBlock</div>,
}));

jest.mock('./components/pdf-files-table/PdfFilesTable', () => ({
    PdfFilesTable: ({ files, onDeleteFile, onViewFile, isDeleting }: any) => (
        <div data-testid="files-table">
            Files Count: {files?.length ?? 0}
            {isDeleting && <span data-testid="is-deleting">Deleting...</span>}
            <button onClick={() => onDeleteFile && onDeleteFile(1)} data-testid="delete-btn">
                Delete
            </button>
            <button onClick={() => onViewFile && onViewFile(files?.[0])} data-testid="view-btn">
                View
            </button>
        </div>
    ),
}));

jest.mock('./components/language-switcher-buttons/LanguageSwitcherButtons', () => ({
    LanguageSwitcherButtons: () => <div data-testid="lang-switcher">LanguageSwitcher</div>,
}));

jest.mock('./components/pdf-dropzone/PdfDropzone', () => ({
    PdfDropzone: () => <div data-testid="dropzone">Dropzone</div>,
}));

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: () => <div data-testid="loader">Loading...</div>,
}));

const mockCreateObjectURL = jest.fn(() => 'blob:http://localhost/mock-blob-url');
const mockWindowOpen = jest.fn();

beforeAll(() => {
    global.URL.createObjectURL = mockCreateObjectURL as any;
    global.window.open = mockWindowOpen as any;
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe('PdfFilesSection', () => {
    const mockClient = { get: jest.fn() };
    const mockAddToast = jest.fn();
    const mockSectionData = { title: 'Test Title', description: 'Test Desc' };
    const mockFilesResponse = { items: [{ id: 1 }, { id: 2 }], totalItemsCount: 2 };
    const mockRefetch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAdminClient as jest.Mock).mockReturnValue(mockClient);
        (useToast as jest.Mock).mockReturnValue({ addToast: mockAddToast });
        mockCreateObjectURL.mockReturnValue('blob:http://localhost/mock-blob-url');
    });

    it('should show loader when section or files are loading', () => {
        (useDataFetch as jest.Mock).mockReturnValue({
            data: null,
            isLoading: true,
            refetch: mockRefetch,
        });

        render(<PdfFilesSection />);
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should render all components when data is loaded', () => {
        (useDataFetch as jest.Mock)
            .mockReturnValueOnce({ data: mockSectionData, isLoading: false, refetch: mockRefetch })
            .mockReturnValueOnce({ data: mockFilesResponse.items, isLoading: false, refetch: mockRefetch });

        render(<PdfFilesSection />);

        expect(screen.getByTestId('content-block')).toBeInTheDocument();
        expect(screen.getByTestId('files-table')).toHaveTextContent('Files Count: 2');
        expect(screen.getByTestId('lang-switcher')).toBeInTheDocument();
        expect(screen.getByTestId('dropzone')).toBeInTheDocument();
    });

    it('should use correct API calls in fetch handlers', async () => {
        let capturedFetchSection: any;
        let capturedFetchFiles: any;

        (useDataFetch as jest.Mock).mockImplementation(({ fetchHandler }) => {
            if (!capturedFetchSection) capturedFetchSection = fetchHandler;
            else capturedFetchFiles = fetchHandler;
            return { data: [], isLoading: false, refetch: mockRefetch };
        });

        render(<PdfFilesSection />);

        await capturedFetchSection();
        expect(PdfSectionApi.getPdfSection).toHaveBeenCalledWith(mockClient);

        (PdfReportsApi.getAll as jest.Mock).mockResolvedValueOnce(mockFilesResponse);
        const filesResult = await capturedFetchFiles();

        expect(PdfReportsApi.getAll).toHaveBeenCalledWith(mockClient, { offset: 0, limit: 1000 });
        expect(filesResult).toEqual(mockFilesResponse.items);
    });

    it('should provide default empty content if sectionData is null', () => {
        (useDataFetch as jest.Mock)
            .mockReturnValueOnce({ data: null, isLoading: false, refetch: mockRefetch })
            .mockReturnValueOnce({ data: [], isLoading: false, refetch: mockRefetch });

        render(<PdfFilesSection />);

        expect(screen.getByTestId('content-block')).toBeInTheDocument();
        expect(screen.getByTestId('files-table')).toHaveTextContent('Files Count: 0');
    });

    it('should call delete API and refetch files on file deletion', async () => {
        let callCount = 0;
        (useDataFetch as jest.Mock).mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
                return { data: mockSectionData, isLoading: false, refetch: mockRefetch };
            }
            return { data: mockFilesResponse.items, isLoading: false, refetch: mockRefetch };
        });

        (PdfReportsApi.delete as jest.Mock).mockResolvedValueOnce(undefined);

        render(<PdfFilesSection />);

        const deleteBtn = screen.getByTestId('delete-btn');
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(PdfReportsApi.delete).toHaveBeenCalledWith(mockClient, 1);
            expect(mockAddToast).toHaveBeenCalledWith(PDF_FILES_SECTION_TEXT.DELETE_SUCCESS, ToastType.Success);
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('should show error toast when deletion fails', async () => {
        let callCount = 0;
        (useDataFetch as jest.Mock).mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
                return { data: mockSectionData, isLoading: false, refetch: mockRefetch };
            }
            return { data: mockFilesResponse.items, isLoading: false, refetch: mockRefetch };
        });

        (PdfReportsApi.delete as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

        render(<PdfFilesSection />);

        const deleteBtn = screen.getByTestId('delete-btn');
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(PDF_FILES_SECTION_TEXT.DELETE_ERROR, ToastType.Error);
        });
    });

    it('should fetch and open PDF file when view button is clicked', async () => {
        const mockPdfBlob = new Blob(['PDF content'], { type: 'application/pdf' });

        let callCount = 0;
        (useDataFetch as jest.Mock).mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
                return { data: mockSectionData, isLoading: false, refetch: mockRefetch };
            }
            return { data: mockFilesResponse.items, isLoading: false, refetch: mockRefetch };
        });

        (PdfReportsApi.fetchById as jest.Mock).mockResolvedValueOnce(mockPdfBlob);

        render(<PdfFilesSection />);

        const viewBtn = screen.getByTestId('view-btn');
        fireEvent.click(viewBtn);

        await waitFor(() => {
            expect(PdfReportsApi.fetchById).toHaveBeenCalledWith(mockClient, mockFilesResponse.items[0].id);
            expect(mockCreateObjectURL).toHaveBeenCalledWith(mockPdfBlob);
            expect(mockWindowOpen).toHaveBeenCalledWith('blob:http://localhost/mock-blob-url', '_blank');
        });
    });

    it('should show error toast when PDF download fails', async () => {
        let callCount = 0;
        (useDataFetch as jest.Mock).mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
                return { data: mockSectionData, isLoading: false, refetch: mockRefetch };
            }
            return { data: mockFilesResponse.items, isLoading: false, refetch: mockRefetch };
        });

        (PdfReportsApi.fetchById as jest.Mock).mockRejectedValueOnce(new Error('Download failed'));

        render(<PdfFilesSection />);

        const viewBtn = screen.getByTestId('view-btn');
        fireEvent.click(viewBtn);

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(PDF_FILES_SECTION_TEXT.VIEW_ERROR, ToastType.Error);
        });
    });
});
