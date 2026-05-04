import { render, screen, fireEvent } from '@testing-library/react';
import { ReportAnalytics } from './ReportAnalytics';
import { REPORTS_TEXT } from '@/const/admin/reports';

jest.mock('../pdf-files-section/PdfFilesSection', () => ({
    PdfFilesSection: () => <div data-testid="pdf-files-section">PdfFilesSection</div>,
}));

jest.mock('../funds-expenditures-section/FundsExpendituresSection', () => ({
    FundsExpenditureSection: ({
        initialIsEditing,
        draftExchangeRate,
        onEditModeChange,
        onExchangeRateValueChange,
    }: {
        initialIsEditing?: boolean;
        draftExchangeRate?: string | null;
        onEditModeChange?: (isEditing: boolean) => void;
        onExchangeRateValueChange?: (exchangeRate: string | null) => void;
    }) => (
        <div
            data-testid="funds-expenditure-section"
            data-initial-editing={String(initialIsEditing)}
            data-draft-exchange-rate={draftExchangeRate ?? ''}
        >
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
            <button
                type="button"
                data-testid="change-funds-exchange-rate"
                onClick={() => onExchangeRateValueChange?.('44.20')}
            >
                Change rate
            </button>
            <button type="button" data-testid="deactivate-funds-edit" onClick={() => onEditModeChange?.(false)}>
                Deactivate edit
            </button>
        </div>
    ),
}));

jest.mock('../program-expenses-section/ProgramExpensesSection', () => ({
    ProgramExpensesSection: ({ isEditing = false }: { isEditing?: boolean }) => (
        <div data-testid="program-expenses-section" data-editing={String(isEditing)}>
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

    it('should not pass funds exchange rate draft to program expenses mock', () => {
        render(<ReportAnalytics />);

        fireEvent.click(screen.getByTestId('activate-funds-edit'));
        fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.PROGRAM_EXPENSES));

        expect(screen.getByTestId('program-expenses-section')).toHaveAttribute('data-editing', 'true');
    });

    it('should restore funds edit mode after returning from another tab', () => {
        render(<ReportAnalytics />);

        fireEvent.click(screen.getByTestId('activate-funds-edit'));
        fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.PROGRAM_EXPENSES));
        fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.INCOME_EXPENSES));

        expect(screen.getByTestId('funds-expenditure-section')).toHaveAttribute('data-initial-editing', 'true');
    });

    it('should restore funds exchange rate draft after returning from another tab', () => {
        render(<ReportAnalytics />);

        fireEvent.click(screen.getByTestId('activate-funds-edit'));
        fireEvent.click(screen.getByTestId('change-funds-exchange-rate'));
        fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.PROGRAM_EXPENSES));
        fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.INCOME_EXPENSES));

        expect(screen.getByTestId('funds-expenditure-section')).toHaveAttribute('data-draft-exchange-rate', '44.20');
    });
});
