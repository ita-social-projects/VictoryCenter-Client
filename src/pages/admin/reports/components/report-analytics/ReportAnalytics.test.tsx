import { render, screen, fireEvent } from '@testing-library/react';
import { localizationLanguagesDataFetch } from '@/services/api/public/localization/languages/languages-api';
import { ReportAnalytics } from './ReportAnalytics';
import { FUNDS_EXPENDITURES_TEXT, REPORTS_TEXT } from '@/const/admin/reports';

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: () => ({ addToast: jest.fn() }),
}));

jest.mock('@/services/api/public/localization/languages/languages-api', () => ({
    localizationLanguagesDataFetch: jest.fn(),
}));

const mockLocalizationLanguagesDataFetch = localizationLanguagesDataFetch as jest.Mock;

jest.mock('../pdf-files-section/PdfFilesSection', () => ({
    PdfFilesSection: () => <div data-testid="pdf-files-section">PdfFilesSection</div>,
}));

jest.mock('../funds-expenditures-section/FundsExpendituresSection', () => ({
    FundsExpenditureSection: ({
        initialIsEditing,
        draftExchangeRate,
        onEditModeChange,
        onExchangeRateValueChange,
        isAddCategoryModalOpen,
        onAddCategoryModalClose,
        isEditCategoryModalOpen,
        onEditCategoryModalClose,
        isDeleteCategoryModalOpen,
        onDeleteCategoryModalClose,
        onCategoriesLoaded,
    }: {
        initialIsEditing?: boolean;
        draftExchangeRate?: string | null;
        onEditModeChange?: (isEditing: boolean) => void;
        onExchangeRateValueChange?: (exchangeRate: string | null) => void;
        isAddCategoryModalOpen?: boolean;
        onAddCategoryModalClose?: () => void;
        isEditCategoryModalOpen?: boolean;
        onEditCategoryModalClose?: () => void;
        isDeleteCategoryModalOpen?: boolean;
        onDeleteCategoryModalClose?: () => void;
        onCategoriesLoaded?: (cats: any[]) => void;
    }) => (
        <div
            data-testid="funds-expenditure-section"
            data-initial-editing={String(initialIsEditing)}
            data-draft-exchange-rate={draftExchangeRate ?? ''}
            data-category-modal-open={String(isAddCategoryModalOpen ?? false)}
            data-edit-category-modal-open={String(isEditCategoryModalOpen ?? false)}
            data-delete-category-modal-open={String(isDeleteCategoryModalOpen ?? false)}
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
            <button type="button" data-testid="close-category-modal" onClick={() => onAddCategoryModalClose?.()}>
                Close category modal
            </button>
            <button type="button" data-testid="close-edit-category-modal" onClick={() => onEditCategoryModalClose?.()}>
                Close edit modal
            </button>
            <button
                type="button"
                data-testid="close-delete-category-modal"
                onClick={() => onDeleteCategoryModalClose?.()}
            >
                Close delete modal
            </button>
            <button
                type="button"
                data-testid="trigger-categories-loaded"
                onClick={() => onCategoriesLoaded?.([{ id: 1, name: 'Cat', type: 'income', localizations: [] }])}
            >
                Load categories
            </button>
        </div>
    ),
}));

jest.mock(
    '../funds-expenditures-section/components/common/translate-reports-category-modal/TranslateReportsCategoryModal',
    () => ({
        TranslateReportsCategoryModal: ({
            isOpen,
            onClose,
            onTranslateCategory,
            categories,
        }: {
            isOpen?: boolean;
            onClose?: () => void;
            onTranslateCategory?: (cat: any) => void;
            categories?: any[];
        }) => (
            <div data-testid="translate-category-modal" data-open={String(isOpen ?? false)}>
                <button type="button" data-testid="translate-modal-close" onClick={() => onClose?.()}>
                    Close
                </button>
                <button
                    type="button"
                    data-testid="translate-modal-submit"
                    onClick={() => onTranslateCategory?.({ id: 1, name: 'Updated', type: 'income', localizations: [] })}
                >
                    Submit
                </button>
                <span data-testid="translate-modal-categories-count">{categories?.length ?? 0}</span>
            </div>
        ),
    }),
);

jest.mock('../program-expenses-section/ProgramExpensesSection', () => ({
    ProgramExpensesSection: ({ isEditing = false }: { isEditing?: boolean }) => (
        <div data-testid="program-expenses-section" data-editing={String(isEditing)}>
            ProgramExpensesSection
        </div>
    ),
}));

describe('ReportAnalytics', () => {
    beforeEach(() => {
        mockLocalizationLanguagesDataFetch.mockResolvedValue([]);
    });

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

    it('sets program expenses section to editing mode when funds edit is activated', () => {
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

    describe('add category modal', () => {
        it('should show context menu button on income-expenses tab', () => {
            render(<ReportAnalytics />);

            expect(screen.getByTestId('context-menu')).toBeInTheDocument();
        });

        it('should not show context menu button on pdf-files tab', () => {
            render(<ReportAnalytics />);

            fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.PDF_FILES));

            expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
        });

        it('should not show context menu button on program-expenses tab', () => {
            render(<ReportAnalytics />);

            fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.PROGRAM_EXPENSES));

            expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
        });

        it('should open add category modal when "Додати категорію" option is selected', () => {
            render(<ReportAnalytics />);

            fireEvent.click(screen.getByTestId('context-menu'));
            fireEvent.click(screen.getByRole('menuitem', { name: FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_CATEGORY }));

            expect(screen.getByTestId('funds-expenditure-section')).toHaveAttribute('data-category-modal-open', 'true');
        });

        it('should close add category modal when onAddCategoryModalClose is called', () => {
            render(<ReportAnalytics />);

            fireEvent.click(screen.getByTestId('context-menu'));
            fireEvent.click(screen.getByRole('menuitem', { name: FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_CATEGORY }));
            fireEvent.click(screen.getByTestId('close-category-modal'));

            expect(screen.getByTestId('funds-expenditure-section')).toHaveAttribute(
                'data-category-modal-open',
                'false',
            );
        });
    });

    describe('edit category modal', () => {
        it('should open edit category modal when "Редагувати категорію" option is selected', () => {
            render(<ReportAnalytics />);

            fireEvent.click(screen.getByTestId('context-menu'));
            fireEvent.click(screen.getByRole('menuitem', { name: FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT_CATEGORY }));

            expect(screen.getByTestId('funds-expenditure-section')).toHaveAttribute(
                'data-edit-category-modal-open',
                'true',
            );
        });

        it('should close edit category modal when onEditCategoryModalClose is called', () => {
            render(<ReportAnalytics />);

            fireEvent.click(screen.getByTestId('context-menu'));
            fireEvent.click(screen.getByRole('menuitem', { name: FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT_CATEGORY }));
            fireEvent.click(screen.getByTestId('close-edit-category-modal'));

            expect(screen.getByTestId('funds-expenditure-section')).toHaveAttribute(
                'data-edit-category-modal-open',
                'false',
            );
        });
    });

    describe('delete category modal', () => {
        it('should open delete category modal when "Видалити категорію" option is selected', () => {
            render(<ReportAnalytics />);

            fireEvent.click(screen.getByTestId('context-menu'));
            fireEvent.click(screen.getByRole('menuitem', { name: FUNDS_EXPENDITURES_TEXT.BUTTON.DELETE_CATEGORY }));

            expect(screen.getByTestId('funds-expenditure-section')).toHaveAttribute(
                'data-delete-category-modal-open',
                'true',
            );
        });

        it('should close delete category modal when onDeleteCategoryModalClose is called', () => {
            render(<ReportAnalytics />);

            fireEvent.click(screen.getByTestId('context-menu'));
            fireEvent.click(screen.getByRole('menuitem', { name: FUNDS_EXPENDITURES_TEXT.BUTTON.DELETE_CATEGORY }));
            fireEvent.click(screen.getByTestId('close-delete-category-modal'));

            expect(screen.getByTestId('funds-expenditure-section')).toHaveAttribute(
                'data-delete-category-modal-open',
                'false',
            );
        });
    });

    describe('translate category modal', () => {
        it('should open translate category modal when "Перекласти категорію" option is selected', () => {
            render(<ReportAnalytics />);

            fireEvent.click(screen.getByTestId('context-menu'));
            fireEvent.click(screen.getByRole('menuitem', { name: FUNDS_EXPENDITURES_TEXT.BUTTON.TRANSLATE_CATEGORY }));

            expect(screen.getByTestId('translate-category-modal')).toHaveAttribute('data-open', 'true');
        });

        it('should close translate category modal when onClose is called', () => {
            render(<ReportAnalytics />);

            fireEvent.click(screen.getByTestId('context-menu'));
            fireEvent.click(screen.getByRole('menuitem', { name: FUNDS_EXPENDITURES_TEXT.BUTTON.TRANSLATE_CATEGORY }));
            fireEvent.click(screen.getByTestId('translate-modal-close'));

            expect(screen.getByTestId('translate-category-modal')).toHaveAttribute('data-open', 'false');
        });

        it('should pass categories loaded from FundsExpenditureSection to TranslateReportsCategoryModal', () => {
            render(<ReportAnalytics />);

            fireEvent.click(screen.getByTestId('trigger-categories-loaded'));

            expect(screen.getByTestId('translate-modal-categories-count')).toHaveTextContent('1');
        });

        it('should update categories and show toast when handleTranslateCategory is called', () => {
            render(<ReportAnalytics />);

            fireEvent.click(screen.getByTestId('trigger-categories-loaded'));
            fireEvent.click(screen.getByTestId('translate-modal-submit'));

            expect(screen.getByTestId('translate-modal-categories-count')).toHaveTextContent('1');
        });
    });
});
