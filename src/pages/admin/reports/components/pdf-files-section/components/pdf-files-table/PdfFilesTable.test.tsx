import { render, screen } from '@testing-library/react';
import { PdfFilesTable } from './PdfFilesTable';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import { PdfReportDto } from '@/types/admin/pdf-section';

jest.mock('@/assets/icons/eye-opened.svg', () => ({
    ReactComponent: () => <svg data-testid="eye-icon" />,
}));
jest.mock('@/assets/icons/file.svg', () => ({
    ReactComponent: () => <svg data-testid="file-icon" />,
}));
jest.mock('@/assets/icons/not-found.svg', () => ({
    ReactComponent: () => <svg data-testid="not-found-icon" />,
}));

describe('PdfFilesTable', () => {
    const mockFiles: PdfReportDto[] = [
        {
            id: 1,
            name: 'Report_2024.pdf',
            createdAt: '2024-01-15T12:00:00Z',
            fileSizeBytes: 102400, // 100 KB
            fileUrl: 'http://test.com/1.pdf',
        },
        {
            id: 2,
            name: 'Audit_Final.pdf',
            createdAt: '2024-02-20T15:30:00Z',
            fileSizeBytes: 204800, // 200 KB
            fileUrl: 'http://test.com/2.pdf',
        },
    ] as any;

    const defaultProps = {
        files: mockFiles,
        isEditing: false,
        onViewFile: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
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

        expect(screen.getByText('15.01.2024')).toBeInTheDocument();

        expect(screen.getByText('100 KB')).toBeInTheDocument();
        expect(screen.getByText('200 KB')).toBeInTheDocument();
    });

    it('should show "no files" message when files array is empty', () => {
        render(<PdfFilesTable {...defaultProps} files={[]} />);

        expect(screen.getByText(PDF_FILES_SECTION_TEXT.TABLE.NO_FILES)).toBeInTheDocument();
        expect(screen.getByTestId('not-found-icon')).toBeInTheDocument();
    });

    it('should render icons for each file row', () => {
        render(<PdfFilesTable {...defaultProps} />);

        const fileIcons = screen.getAllByTestId('file-icon');
        const eyeIcons = screen.getAllByTestId('eye-icon');

        expect(fileIcons).toHaveLength(mockFiles.length);
        expect(eyeIcons).toHaveLength(mockFiles.length);
    });

    it('should render file-name span with correct text', () => {
        render(<PdfFilesTable {...defaultProps} />);
        const fileName = screen.getByText('Report_2024.pdf');
        expect(fileName).toHaveClass('file-name');
    });
});
