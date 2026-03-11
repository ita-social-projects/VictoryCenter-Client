import { render, screen, fireEvent } from '@testing-library/react';
import { ReportAnalytics } from './ReportAnalytics';
import { REPORTS_TEXT } from '@/const/admin/reports';

jest.mock('../pdf-files-section/PdfFilesSection', () => ({
    PdfFilesSection: ({ isEditing }: { isEditing: boolean }) => (
        <div data-testid="pdf-files-section">PdfFilesSection - Editing: {String(isEditing)}</div>
    ),
}));

jest.mock('../funds-expenditures-section/FundsExpendituresSection', () => ({
    FundsExpenditureSection: () => (
        <div data-testid="funds-expenditure-section">FundsExpenditureSection</div>
    ),
}));

describe('ReportAnalytics', () => {
    it('should render the component with correct title', () => {
        render(<ReportAnalytics isEditing={false} />);

        expect(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TITLE)).toBeInTheDocument();
    });

    it('should show first tab as active by default', () => {
        render(<ReportAnalytics isEditing={false} />);

        const firstTab = screen.getByText('Доходи та витрати');
        expect(firstTab).toBeInTheDocument();
    });

    it('should render PdfFilesSection when "PDF Файли" tab is selected', () => {
        render(<ReportAnalytics isEditing={true} />);

        const pdfTab = screen.getByText('PDF Файли');
        fireEvent.click(pdfTab);

        const pdfSection = screen.getByTestId('pdf-files-section');
        expect(pdfSection).toBeInTheDocument();
        expect(pdfSection).toHaveTextContent('Editing: true');
    });

    it('should switch between tabs and update content', () => {
        render(<ReportAnalytics isEditing={false} />);

        const pdfTab = screen.getByText('PDF Файли');
        fireEvent.click(pdfTab);
        expect(screen.getByTestId('pdf-files-section')).toBeInTheDocument();

        const incomeTab = screen.getByText('Доходи та витрати');
        fireEvent.click(incomeTab);
        expect(screen.queryByTestId('pdf-files-section')).not.toBeInTheDocument();
    });

    it('should pass isEditing prop correctly to PdfFilesSection', () => {
        const { rerender } = render(<ReportAnalytics isEditing={false} />);

        fireEvent.click(screen.getByText('PDF Файли'));
        expect(screen.getByTestId('pdf-files-section')).toHaveTextContent('Editing: false');

        rerender(<ReportAnalytics isEditing={true} />);
        expect(screen.getByTestId('pdf-files-section')).toHaveTextContent('Editing: true');
    });
});
