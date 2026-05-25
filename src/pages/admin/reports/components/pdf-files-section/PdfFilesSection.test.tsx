import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PdfFilesSection } from './PdfFilesSection';
import { PdfSectionApi } from '@/services/api/admin/reports/pdf-section/pdf-section-api';
import { PdfReportsApi } from '@/services/api/admin/reports/pdf-reports/pdf-reports-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
jest.mock('@/services/api/admin/reports/pdf-section/pdf-section-api');
jest.mock('@/services/api/admin/reports/pdf-reports/pdf-reports-api');
jest.mock('@/hooks/common/use-data-fetch/useDataFetch');
jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');
jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit');

jest.mock('./components/pdf-section-content-block/PdfSectionContentBlock', () => ({
    PdfSectionContentBlock: ({ onAfterSave, onTranslateClick }: any) => (
        <div data-testid="content-block">
            <button onClick={onAfterSave} data-testid="content-block-save">
                Save
            </button>

            <button onClick={onTranslateClick} data-testid="content-block-translate">
                Translate
            </button>
        </div>
    ),
}));

jest.mock('./components/pdf-files-table/PdfFilesTable', () => ({
    PdfFilesTable: ({ files, onDeleteFile, onViewFile, onRenameFile, isDeleting, isRenaming }: any) => (
        <div data-testid="files-table">
            Files Count: {files?.length ?? 0}
            {isDeleting && <span data-testid="is-deleting">Deleting...</span>}
            {isRenaming && <span data-testid="is-renaming">Renaming...</span>}
            <button onClick={() => onDeleteFile && onDeleteFile(1)} data-testid="delete-btn">
                Delete
            </button>
            <button onClick={() => onViewFile && onViewFile(files?.[0])} data-testid="view-btn">
                View
            </button>
            <button onClick={() => onRenameFile && onRenameFile(1, 'New Name')} data-testid="rename-btn">
                Rename
            </button>
        </div>
    ),
}));

jest.mock('./components/language-switcher-buttons/LanguageSwitcherButtons', () => ({
    LanguageSwitcherButtons: () => <div data-testid="lang-switcher">LanguageSwitcher</div>,
}));

jest.mock('./components/pdf-dropzone/PdfDropzone', () => ({
    PdfDropzone: ({ onUploaded }: any) => (
        <button
            data-testid="dropzone"
            onClick={() =>
                onUploaded({ id: 99, name: 'Uploaded.pdf', createdAt: '', fileSizeBytes: 0, blobName: '', priority: 0 })
            }
        >
            Dropzone
        </button>
    ),
}));

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: () => <div data-testid="loader">Loading...</div>,
}));

jest.mock('../translate-pdf-section-modal/TranslatePdfSectionModal', () => ({
    TranslatePdfSectionModal: ({ isOpen, onClose, pdfSection, onTranslatePdfSection }: any) =>
        isOpen ? (
            <div data-testid="translate-modal" onClick={onClose}>
                <button
                    data-testid="confirm-translate-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onTranslatePdfSection({ ...pdfSection, translated: true });
                        onClose();
                    }}
                >
                    Confirm Translation
                </button>
            </div>
        ) : null,
}));

jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit', () => ({
    useLocalizationToolkit: jest.fn(),
}));

describe('PdfFilesSection', () => {
    const mockClient = { get: jest.fn() };
    const mockAddToast = jest.fn();
    const mockSectionData = { title: 'Test Title', description: 'Test Desc', localizations: [] };
    const mockFilesResponse = { items: [{ id: 1 }, { id: 2 }], totalItemsCount: 2 };
    const mockRefetch = jest.fn();
    const mockCreateObjectURL = jest.fn(() => 'blob:http://localhost/mock-blob-url');
    const mockWindowOpen = jest.fn();
    let originalCreateObjectURL: any;
    let originalWindowOpen: any;

    const setupDataFetchMock = (options: { setData?: jest.Mock; filesData?: any[] } = {}) => {
        (useDataFetch as jest.Mock).mockImplementation(({ initialData }) => {
            if (initialData === null) {
                return {
                    data: mockSectionData,
                    isLoading: false,
                    refetch: mockRefetch,
                    setData: options.setData ?? jest.fn(),
                };
            }
            return { data: options.filesData ?? mockFilesResponse.items, isLoading: false, refetch: mockRefetch };
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        originalCreateObjectURL = global.URL.createObjectURL;
        originalWindowOpen = global.window.open;
        global.URL.createObjectURL = mockCreateObjectURL as any;
        global.window.open = mockWindowOpen as any;
        (useAdminClient as jest.Mock).mockReturnValue(mockClient);
        (useToast as jest.Mock).mockReturnValue({ addToast: mockAddToast });
        const { useLocalizationToolkit } = require('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit');
        (useLocalizationToolkit as jest.Mock).mockReturnValue({ translationLanguages: [] });
        mockCreateObjectURL.mockReturnValue('blob:http://localhost/mock-blob-url');
        (useLocalizationToolkit as jest.Mock).mockReturnValue({ translationLanguages: [] });
    });

    afterEach(() => {
        global.URL.createObjectURL = originalCreateObjectURL;
        global.window.open = originalWindowOpen;
        jest.restoreAllMocks();
        jest.useRealTimers();
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
        setupDataFetchMock();

        (PdfReportsApi.delete as jest.Mock).mockResolvedValueOnce(undefined);

        render(<PdfFilesSection />);

        const deleteBtn = screen.getByTestId('delete-btn');
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(PdfReportsApi.delete).toHaveBeenCalledWith(mockClient, 1);
            expect(mockAddToast).toHaveBeenCalledWith(PDF_FILES_SECTION_TEXT.MESSAGE.DELETE_SUCCESS, ToastType.Success);
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('should show error toast when deletion fails', async () => {
        setupDataFetchMock();

        (PdfReportsApi.delete as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

        render(<PdfFilesSection />);

        const deleteBtn = screen.getByTestId('delete-btn');
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(PDF_FILES_SECTION_TEXT.MESSAGE.DELETE_ERROR, ToastType.Error);
        });
    });

    it('should fetch and open PDF file when view button is clicked', async () => {
        const mockPdfBlob = new Blob(['PDF content'], { type: 'application/pdf' });

        setupDataFetchMock();

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
        setupDataFetchMock();

        (PdfReportsApi.fetchById as jest.Mock).mockRejectedValueOnce(new Error('Download failed'));

        render(<PdfFilesSection />);

        const viewBtn = screen.getByTestId('view-btn');
        fireEvent.click(viewBtn);

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(PDF_FILES_SECTION_TEXT.MESSAGE.VIEW_ERROR, ToastType.Error);
        });
    });

    it('should call rename API and refetch files on success', async () => {
        const updatedFile = { id: 1, name: 'New Name' };
        setupDataFetchMock();

        (PdfReportsApi.rename as jest.Mock).mockResolvedValueOnce(updatedFile);

        render(<PdfFilesSection />);

        fireEvent.click(screen.getByTestId('rename-btn'));

        await waitFor(() => {
            expect(PdfReportsApi.rename).toHaveBeenCalledWith(mockClient, 1, 'New Name');
            expect(mockAddToast).toHaveBeenCalledWith(PDF_FILES_SECTION_TEXT.MESSAGE.RENAME_SUCCESS, ToastType.Success);
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('should show error toast when rename fails', async () => {
        setupDataFetchMock();

        (PdfReportsApi.rename as jest.Mock).mockRejectedValueOnce(new Error('Rename failed'));

        render(<PdfFilesSection />);

        fireEvent.click(screen.getByTestId('rename-btn'));

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(PDF_FILES_SECTION_TEXT.MESSAGE.RENAME_ERROR, ToastType.Error);
        });
    });

    it('should show isRenaming indicator while rename is in progress', async () => {
        setupDataFetchMock();

        let resolveRename: (value: any) => void;
        (PdfReportsApi.rename as jest.Mock).mockReturnValueOnce(
            new Promise((resolve) => {
                resolveRename = resolve;
            }),
        );

        render(<PdfFilesSection />);

        fireEvent.click(screen.getByTestId('rename-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('is-renaming')).toBeInTheDocument();
        });

        resolveRename!({ id: 1, name: 'New Name' });

        await waitFor(() => {
            expect(screen.queryByTestId('is-renaming')).not.toBeInTheDocument();
        });
    });

    it('should add uploaded file to the list', async () => {
        setupDataFetchMock({ filesData: [] });

        render(<PdfFilesSection />);

        expect(screen.getByTestId('files-table')).toHaveTextContent('Files Count: 0');
        fireEvent.click(screen.getByTestId('dropzone'));
        expect(screen.getByTestId('files-table')).toHaveTextContent('Files Count: 1');
    });

    describe('Translation Modal', () => {
        it('should open translation modal when translate button is clicked', async () => {
            setupDataFetchMock();

            render(<PdfFilesSection />);

            fireEvent.click(screen.getByTestId('content-block-translate'));

            await waitFor(() => {
                expect(screen.getByTestId('translate-modal')).toBeInTheDocument();
            });
        });

        it('should close translation modal when onClose is called', async () => {
            setupDataFetchMock();

            render(<PdfFilesSection />);

            fireEvent.click(screen.getByTestId('content-block-translate'));

            await waitFor(() => {
                expect(screen.getByTestId('translate-modal')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('translate-modal'));

            await waitFor(() => {
                expect(screen.queryByTestId('translate-modal')).not.toBeInTheDocument();
            });
        });

        it('should show success toast when translation is saved', async () => {
            setupDataFetchMock();

            render(<PdfFilesSection />);

            fireEvent.click(screen.getByTestId('content-block-translate'));

            await waitFor(() => {
                expect(screen.getByTestId('translate-modal')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('confirm-translate-btn'));

            await waitFor(() => {
                expect(mockAddToast).toHaveBeenCalledWith(
                    COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_SAVED_SUCCESS,
                    ToastType.Success,
                );
            });
        });

        it('should update section data after successful translation', async () => {
            const mockSetData = jest.fn();

            (useDataFetch as jest.Mock).mockImplementation(({ initialData }) => {
                if (initialData === null) {
                    return { data: mockSectionData, isLoading: false, refetch: mockRefetch, setData: mockSetData };
                }
                return { data: mockFilesResponse.items, isLoading: false, refetch: mockRefetch };
            });

            render(<PdfFilesSection />);

            fireEvent.click(screen.getByTestId('content-block-translate'));

            await waitFor(() => {
                expect(screen.getByTestId('translate-modal')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('confirm-translate-btn'));

            await waitFor(() => {
                expect(mockSetData).toHaveBeenCalledWith(expect.objectContaining({ translated: true }));
            });

            await waitFor(() => {
                expect(screen.queryByTestId('translate-modal')).not.toBeInTheDocument();
            });
        });
    });

    it('should refetch section on save', async () => {
        setupDataFetchMock();

        render(<PdfFilesSection />);
        fireEvent.click(screen.getByTestId('content-block-save'));

        await waitFor(() => {
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('should revoke object URL after opening PDF', async () => {
        jest.useFakeTimers();
        const mockPdfBlob = new Blob(['PDF content'], { type: 'application/pdf' });
        mockWindowOpen.mockReturnValueOnce({});

        setupDataFetchMock();

        (PdfReportsApi.fetchById as jest.Mock).mockResolvedValueOnce(mockPdfBlob);
        const mockRevokeObjectURL = jest.fn();
        global.URL.revokeObjectURL = mockRevokeObjectURL;

        render(<PdfFilesSection />);
        fireEvent.click(screen.getByTestId('view-btn'));

        await waitFor(() => {
            expect(mockWindowOpen).toHaveBeenCalled();
        });

        jest.advanceTimersByTime(1500);
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-blob-url');
    });
});
