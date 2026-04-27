import { render, screen, fireEvent } from '@testing-library/react';
import { ReportAnalytics } from './ReportAnalytics';
import { REPORTS_TEXT } from '@/const/admin/reports';

jest.mock('../pdf-files-section/PdfFilesSection', () => ({
    PdfFilesSection: () => <div data-testid="pdf-files-section">PdfFilesSection</div>,
}));

jest.mock('../funds-expenditures-section/FundsExpendituresSection', () => ({
    FundsExpenditureSection: ({
        initialIsEditing,
        onEditModeChange,
        onExchangeRateValueChange,
    }: {
        initialIsEditing?: boolean;
        onEditModeChange?: (isEditing: boolean) => void;
        onExchangeRateValueChange?: (exchangeRate: string | null) => void;
    }) => (
        <div data-testid="funds-expenditure-section" data-initial-editing={String(initialIsEditing)}>
            FundsExpenditureSection
            <button
                type="button"
                data-testid="activate-funds-edit"
                onClick={() => {
                    onExchangeRateValueChange?.('42.15');
                    onEditModeChange?.(true);
                }}
            >
                Activate edit
            </button>
            <button type="button" data-testid="deactivate-funds-edit" onClick={() => onEditModeChange?.(false)}>
                Deactivate edit
            </button>
        </div>
    ),
}));

jest.mock('../program-expenses-section/ProgramExpensesSection', () => ({
    ProgramExpensesSection: ({
        isEditing,
        syncedExchangeRate,
    }: {
        isEditing?: boolean;
        syncedExchangeRate?: string | null;
    }) => (
        <div
            data-testid="program-expenses-section"
            data-editing={String(isEditing)}
            data-exchange-rate={syncedExchangeRate ?? ''}
        >
            ProgramExpensesSection
        </div>
    ),
}));

describe('ReportAnalytics', () => {
    it('should render the component with correct title', () => {
        render(<ReportAnalytics />);

        expect(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TITLE)).toBeInTheDocument();
    });

    it('should show first tab as active by default', () => {
        render(<ReportAnalytics />);

        const firstTab = screen.getByText('Доходи та витрати');
        expect(firstTab).toBeInTheDocument();
    });

    it('should render PdfFilesSection when "PDF Файли" tab is selected', () => {
        render(<ReportAnalytics />);

        const pdfTab = screen.getByText('PDF Файли');
        fireEvent.click(pdfTab);

        const pdfSection = screen.getByTestId('pdf-files-section');
        expect(pdfSection).toBeInTheDocument();
    });

    it('should switch between tabs and update content', () => {
        render(<ReportAnalytics />);

        const pdfTab = screen.getByText('PDF Файли');
        fireEvent.click(pdfTab);
        expect(screen.getByTestId('pdf-files-section')).toBeInTheDocument();

        const incomeTab = screen.getByText('Доходи та витрати');
        fireEvent.click(incomeTab);
        expect(screen.queryByTestId('pdf-files-section')).not.toBeInTheDocument();
    });

    it('should keep program expenses in edit mode after funds edit is activated', () => {
        render(<ReportAnalytics />);

        fireEvent.click(screen.getByTestId('activate-funds-edit'));
        fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.PROGRAM_EXPENSES));

        expect(screen.getByTestId('program-expenses-section')).toHaveAttribute('data-editing', 'true');
        expect(screen.getByTestId('program-expenses-section')).toHaveAttribute('data-exchange-rate', '42.15');
    });

    it('should not pass synced exchange rate when funds edit mode is inactive', () => {
        render(<ReportAnalytics />);

        fireEvent.click(screen.getByTestId('activate-funds-edit'));
        fireEvent.click(screen.getByTestId('deactivate-funds-edit'));
        fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.PROGRAM_EXPENSES));

        expect(screen.getByTestId('program-expenses-section')).toHaveAttribute('data-editing', 'false');
        expect(screen.getByTestId('program-expenses-section')).toHaveAttribute('data-exchange-rate', '');
    });

    it('should restore funds edit mode after returning from another tab', () => {
        render(<ReportAnalytics />);

        fireEvent.click(screen.getByTestId('activate-funds-edit'));
        fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.PROGRAM_EXPENSES));
        fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.INCOME_EXPENSES));

        expect(screen.getByTestId('funds-expenditure-section')).toHaveAttribute('data-initial-editing', 'true');
    });
});
