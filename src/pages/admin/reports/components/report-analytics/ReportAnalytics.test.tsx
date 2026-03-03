import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReportAnalytics } from './ReportAnalytics';
import { REPORTS_TEXT } from '@/const/admin/reports';

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: require('@/utils/test-mocks/test-mocks').MockCategoryBar,
}));

jest.mock('../funds-expenditures-section/FundsExpendituresSection', () => ({
    FundsExpenditureSection: ({ isEditing }: { isEditing: boolean }) => (
        <div data-testid="mock-funds-section" data-is-editing={String(isEditing)} />
    ),
}));

jest.mock('../pdf-files-section/PdfFilesSection', () => ({
    PdfFilesSection: ({ isEditing }: { isEditing: boolean }) => (
        <div data-testid="mock-pdf-section" data-is-editing={String(isEditing)} />
    ),
}));

describe('ReportAnalytics', () => {
    it('should render the title', () => {
        render(<ReportAnalytics isEditing={false} />);
        expect(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TITLE)).toBeInTheDocument();
    });

    it('should render category bar with all three tabs', () => {
        render(<ReportAnalytics isEditing={false} />);
        expect(screen.getByTestId('mock-category-bar')).toBeInTheDocument();
        expect(screen.getByText('Доходи та витрати')).toBeInTheDocument();
        expect(screen.getByText('Програмні витрати')).toBeInTheDocument();
        expect(screen.getByText('PDF Файли')).toBeInTheDocument();
    });

    it('should render FundsExpenditureSection by default', () => {
        render(<ReportAnalytics isEditing={false} />);
        expect(screen.getByTestId('mock-funds-section')).toBeInTheDocument();
        expect(screen.queryByTestId('mock-pdf-section')).not.toBeInTheDocument();
    });

    it('should switch to PDF section when PDF tab is clicked', () => {
        render(<ReportAnalytics isEditing={false} />);
        fireEvent.click(screen.getByTestId('tab-pdf-files'));
        expect(screen.getByTestId('mock-pdf-section')).toBeInTheDocument();
        expect(screen.queryByTestId('mock-funds-section')).not.toBeInTheDocument();
    });

    it('should pass isEditing true to child section', () => {
        render(<ReportAnalytics isEditing={true} />);
        expect(screen.getByTestId('mock-funds-section')).toHaveAttribute('data-is-editing', 'true');
    });

    it('should pass isEditing false to child section', () => {
        render(<ReportAnalytics isEditing={false} />);
        expect(screen.getByTestId('mock-funds-section')).toHaveAttribute('data-is-editing', 'false');
    });

    it('should switch back to income-expenses tab when clicked', () => {
        render(<ReportAnalytics isEditing={false} />);
        fireEvent.click(screen.getByTestId('tab-pdf-files'));
        fireEvent.click(screen.getByTestId('tab-income-expenses'));
        expect(screen.getByTestId('mock-funds-section')).toBeInTheDocument();
        expect(screen.queryByTestId('mock-pdf-section')).not.toBeInTheDocument();
    });
});
