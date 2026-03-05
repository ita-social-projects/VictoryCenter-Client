import { render, screen } from '@testing-library/react';
import { PdfFilesSection } from './PdfFilesSection';
import { PdfSectionApi } from '@/services/api/admin/reports/pdf-section/pdf-section-api';
import { PdfReportsApi } from '@/services/api/admin/reports/pdf-reports/pdf-reports-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
jest.mock('@/services/api/admin/reports/pdf-section/pdf-section-api');
jest.mock('@/services/api/admin/reports/pdf-reports/pdf-reports-api');
jest.mock('@/hooks/common/use-data-fetch/useDataFetch');

jest.mock('./components/pdf-section-content-block/PdfSectionContentBlock', () => ({
    PdfSectionContentBlock: ({ isEditing }: { isEditing: boolean }) => (
        <div data-testid="content-block">ContentBlock - Editing: {String(isEditing)}</div>
    ),
}));

jest.mock('./components/pdf-files-table/PdfFilesTable', () => ({
    PdfFilesTable: ({ files, isEditing }: { files: any[]; isEditing: boolean }) => (
        <div data-testid="files-table">
            Table - Editing: {String(isEditing)}, Files Count: {files?.length ?? 0}
        </div>
    ),
}));

jest.mock('./components/language-switcher-buttons/LanguageSwitcherButtons', () => ({
    LanguageSwitcherButtons: () => <div data-testid="lang-switcher">LanguageSwitcher</div>,
}));

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: () => <div data-testid="loader">Loading...</div>,
}));

describe('PdfFilesSection', () => {
    const mockClient = { get: jest.fn() };
    const mockSectionData = { title: 'Test Title', description: 'Test Desc' };
    const mockFilesResponse = { items: [{ id: 1 }, { id: 2 }], totalItemsCount: 2 };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAdminClient as jest.Mock).mockReturnValue(mockClient);
    });

    it('should show loader when section or files are loading', () => {
        (useDataFetch as jest.Mock).mockReturnValue({
            data: null,
            isLoading: true,
        });

        render(<PdfFilesSection isEditing={false} />);
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should render all components when data is loaded', () => {
        (useDataFetch as jest.Mock)
            .mockReturnValueOnce({ data: mockSectionData, isLoading: false })
            .mockReturnValueOnce({ data: mockFilesResponse.items, isLoading: false });

        render(<PdfFilesSection isEditing={false} />);

        expect(screen.getByTestId('content-block')).toBeInTheDocument();
        expect(screen.getByTestId('files-table')).toHaveTextContent('Files Count: 2');
    });

    it('should use correct API calls in fetch handlers', async () => {
        let capturedFetchSection: any;
        let capturedFetchFiles: any;

        (useDataFetch as jest.Mock).mockImplementation(({ fetchHandler }) => {
            if (!capturedFetchSection) capturedFetchSection = fetchHandler;
            else capturedFetchFiles = fetchHandler;
            return { data: [], isLoading: false };
        });

        render(<PdfFilesSection isEditing={false} />);

        await capturedFetchSection();
        expect(PdfSectionApi.getPdfSection).toHaveBeenCalledWith(mockClient);

        (PdfReportsApi.getAll as jest.Mock).mockResolvedValueOnce(mockFilesResponse);
        const filesResult = await capturedFetchFiles();

        expect(PdfReportsApi.getAll).toHaveBeenCalledWith(mockClient, { offset: 0, limit: 1000 });
        expect(filesResult).toEqual(mockFilesResponse.items);
    });

    it('should provide default empty content if sectionData is null', () => {
        (useDataFetch as jest.Mock)
            .mockReturnValueOnce({ data: null, isLoading: false })
            .mockReturnValueOnce({ data: [], isLoading: false });

        render(<PdfFilesSection isEditing={false} />);

        expect(screen.getByTestId('content-block')).toBeInTheDocument();
        expect(screen.getByTestId('files-table')).toHaveTextContent('Files Count: 0');
    });
});
