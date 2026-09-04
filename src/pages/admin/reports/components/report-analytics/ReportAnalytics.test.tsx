import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { localizationLanguagesDataFetch } from '@/services/api/public/localization/languages/languages-api';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ReportAnalytics } from './ReportAnalytics';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, REPORTS_TEXT } from '@/const/admin/reports';

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: jest.fn(),
}));

const mockAddToast = jest.fn();
const mockedUseToast = useToast as jest.MockedFunction<typeof useToast>;

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({ adminClient: {} }),
}));

jest.mock('@/services/api/public/localization/languages/languages-api', () => ({
    localizationLanguagesDataFetch: jest.fn(),
}));

const mockLocalizationLanguagesDataFetch = localizationLanguagesDataFetch as jest.Mock;

const mockPublishRecords = jest.fn();
const mockGetSettings = jest.fn();
const mockCancelRecords = jest.fn();
jest.mock('@/services/api/admin/reports/funds-expenditures-api', () => ({
    FundsExpendituresApi: {
        publishRecords: (...args: unknown[]) => mockPublishRecords(...args),
        getSettings: (...args: unknown[]) => mockGetSettings(...args),
        cancelRecords: (...args: unknown[]) => mockCancelRecords(...args),
    },
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel, onClose, title }: any) => {
        const idSuffix = title === 'Опублікувати зміни?' ? 'publish' : 'cancel';
        return (
            <div data-testid={`confirmation-modal-${idSuffix}`} data-open={String(isOpen)}>
                <button type="button" data-testid={`confirm-modal-${idSuffix}`} onClick={onConfirm}>
                    Confirm
                </button>
                <button type="button" data-testid={`cancel-modal-${idSuffix}`} onClick={onCancel}>
                    Cancel
                </button>
                <button type="button" data-testid={`close-modal-${idSuffix}`} onClick={onClose}>
                    Close
                </button>
            </div>
        );
    },
}));

jest.mock('../pdf-files-section/PdfFilesSection', () => ({
    PdfFilesSection: () => <div data-testid="pdf-files-section">PdfFilesSection</div>,
}));

jest.mock('../funds-expenditures-section/FundsExpendituresSection', () => ({
    FundsExpenditureSection: ({
        isEditing,
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
        onValidationChange,
        onCountsChange,
        onDataChange,
        registerSaveCallback,
        onRowEditModeChange,
    }: {
        isEditing?: boolean;
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
        onValidationChange?: (valid: boolean) => void;
        onCountsChange?: (counts: any) => void;
        onDataChange?: () => void;
        registerSaveCallback?: (cb: () => Promise<boolean>) => void;
        onRowEditModeChange?: (isRowEditMode: boolean) => void;
    }) => (
        <div
            data-testid="funds-expenditure-section"
            data-is-editing={String(isEditing)}
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
            <button
                type="button"
                data-testid="trigger-funds-data"
                onClick={() => {
                    onValidationChange?.(true);
                    onCountsChange?.({ income: 2, expense: 2 });
                    onDataChange?.();
                    registerSaveCallback?.(async () => true);
                }}
            >
                Set Valid Funds Data
            </button>
            <button
                type="button"
                data-testid="trigger-funds-save-fail"
                onClick={() => {
                    registerSaveCallback?.(async () => false);
                }}
            >
                Set Fail Save
            </button>
            <button type="button" data-testid="start-row-edit" onClick={() => onRowEditModeChange?.(true)}>
                Start row edit
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
    ProgramExpensesSection: ({ onCountsChange, onDataChange }: any) => (
        <div data-testid="program-expenses-section">
            ProgramExpensesSection
            <button
                type="button"
                data-testid="trigger-program-data"
                onClick={() => {
                    onCountsChange?.(1);
                    onDataChange?.();
                }}
            >
                Set Program Data
            </button>
        </div>
    ),
}));

describe('ReportAnalytics', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalizationLanguagesDataFetch.mockResolvedValue([]);
        mockedUseToast.mockReturnValue({ addToast: mockAddToast } as any);
        mockGetSettings.mockResolvedValue({ hasUnpublishedChanges: false });
    });

    it('should render the component with correct title', () => {
        render(<ReportAnalytics />);

        expect(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TITLE)).toBeInTheDocument();
    });

    it('should show error toast when language fetch fails', async () => {
        mockLocalizationLanguagesDataFetch.mockRejectedValue(new Error('Network error'));

        render(<ReportAnalytics />);

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(
                COMMON_TEXT_ADMIN.LOCALIZATION.LANGUAGES.MESSAGE.FAILED_TO_FETCH_LANGUAGES,
                'error',
            );
        });
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

    it('should restore funds edit mode after returning from another tab', () => {
        render(<ReportAnalytics />);

        fireEvent.click(screen.getByTestId('activate-funds-edit'));
        fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.PROGRAM_EXPENSES));
        fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.INCOME_EXPENSES));

        expect(screen.getByTestId('funds-expenditure-section')).toHaveAttribute('data-is-editing', 'true');
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
            expect(mockAddToast).toHaveBeenCalled();
        });
    });

    describe('Publish functionality', () => {
        it('should enable publish button when data is valid and changes exist', () => {
            render(<ReportAnalytics />);
            fireEvent.click(screen.getByTestId('activate-funds-edit'));

            fireEvent.click(screen.getByTestId('trigger-funds-data'));
            fireEvent.click(screen.getByTestId('trigger-program-data'));

            const publishButton = screen.getByText('Опублікувати');
            expect(publishButton).not.toBeDisabled();
        });

        it('should open publish modal on publish click', () => {
            render(<ReportAnalytics />);
            fireEvent.click(screen.getByTestId('activate-funds-edit'));
            fireEvent.click(screen.getByTestId('trigger-funds-data'));
            fireEvent.click(screen.getByTestId('trigger-program-data'));

            fireEvent.click(screen.getByText('Опублікувати'));
            expect(screen.getByTestId('confirmation-modal-publish')).toHaveAttribute('data-open', 'true');
        });

        it('should handle publish confirm successfully', async () => {
            mockPublishRecords.mockResolvedValueOnce({});
            render(<ReportAnalytics />);
            fireEvent.click(screen.getByTestId('activate-funds-edit'));
            fireEvent.click(screen.getByTestId('trigger-funds-data'));
            fireEvent.click(screen.getByTestId('trigger-program-data'));

            fireEvent.click(screen.getByText('Опублікувати'));
            fireEvent.click(screen.getByTestId('confirm-modal-publish'));

            await waitFor(() => {
                expect(mockPublishRecords).toHaveBeenCalled();
                expect(mockAddToast).toHaveBeenCalledWith('Зміни успішно опубліковано', 'success', 3000);
            });
            expect(screen.queryByText('Опублікувати')).not.toBeInTheDocument(); // should exit edit mode
        });

        it('should handle publish save settings failure', async () => {
            render(<ReportAnalytics />);
            fireEvent.click(screen.getByTestId('activate-funds-edit'));
            fireEvent.click(screen.getByTestId('trigger-funds-data'));
            fireEvent.click(screen.getByTestId('trigger-funds-save-fail'));
            fireEvent.click(screen.getByTestId('trigger-program-data'));

            fireEvent.click(screen.getByText('Опублікувати'));
            fireEvent.click(screen.getByTestId('confirm-modal-publish'));

            await waitFor(() => {
                expect(mockPublishRecords).not.toHaveBeenCalled();
            });
        });

        it('should handle publish records API error', async () => {
            mockPublishRecords.mockRejectedValueOnce(new Error('fail'));
            render(<ReportAnalytics />);
            fireEvent.click(screen.getByTestId('activate-funds-edit'));
            fireEvent.click(screen.getByTestId('trigger-funds-data'));
            fireEvent.click(screen.getByTestId('trigger-program-data'));

            fireEvent.click(screen.getByText('Опублікувати'));
            fireEvent.click(screen.getByTestId('confirm-modal-publish'));

            await waitFor(() => {
                expect(mockAddToast).toHaveBeenCalledWith(REPORTS_TEXT.MESSAGE.FAIL_TO_UPDATE_REPORT, 'error');
            });
        });

        it('should close publish modal when cancelled', () => {
            render(<ReportAnalytics />);
            fireEvent.click(screen.getByTestId('activate-funds-edit'));
            fireEvent.click(screen.getByTestId('trigger-funds-data'));
            fireEvent.click(screen.getByTestId('trigger-program-data'));

            fireEvent.click(screen.getByText('Опублікувати'));
            fireEvent.click(screen.getByTestId('cancel-modal-publish'));

            expect(screen.getByTestId('confirmation-modal-publish')).toHaveAttribute('data-open', 'false');
        });

        it('should close publish modal when close is clicked', () => {
            render(<ReportAnalytics />);
            fireEvent.click(screen.getByTestId('activate-funds-edit'));
            fireEvent.click(screen.getByTestId('trigger-funds-data'));
            fireEvent.click(screen.getByTestId('trigger-program-data'));

            fireEvent.click(screen.getByText('Опублікувати'));
            fireEvent.click(screen.getByTestId('close-modal-publish'));

            expect(screen.getByTestId('confirmation-modal-publish')).toHaveAttribute('data-open', 'false');
        });
    });

    describe('Cancel functionality', () => {
        it('should open cancel modal when Cancel is clicked', () => {
            render(<ReportAnalytics />);
            fireEvent.click(screen.getByTestId('activate-funds-edit'));
            expect(screen.getByText('Опублікувати')).toBeInTheDocument();

            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL));
            expect(screen.getByTestId('confirmation-modal-cancel')).toHaveAttribute('data-open', 'true');
        });

        it('should close cancel modal when NO is clicked', () => {
            render(<ReportAnalytics />);
            fireEvent.click(screen.getByTestId('activate-funds-edit'));
            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL));

            fireEvent.click(screen.getByTestId('cancel-modal-cancel'));
            expect(screen.getByTestId('confirmation-modal-cancel')).toHaveAttribute('data-open', 'false');
        });

        it('should cancel records and exit edit mode when YES is clicked', async () => {
            mockCancelRecords.mockResolvedValueOnce({});
            render(<ReportAnalytics />);
            fireEvent.click(screen.getByTestId('activate-funds-edit'));
            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL));

            fireEvent.click(screen.getByTestId('confirm-modal-cancel'));

            await waitFor(() => {
                expect(mockCancelRecords).toHaveBeenCalled();
            });
            expect(screen.queryByText('Опублікувати')).not.toBeInTheDocument();
        });

        it('should show error toast if cancel records fails', async () => {
            mockCancelRecords.mockRejectedValueOnce(new Error('fail'));
            render(<ReportAnalytics />);
            fireEvent.click(screen.getByTestId('activate-funds-edit'));
            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL));

            fireEvent.click(screen.getByTestId('confirm-modal-cancel'));

            await waitFor(() => {
                expect(mockAddToast).toHaveBeenCalledWith('Не вдалося відмінити зміни', 'error');
            });
        });

        it('should keep sub-tabs blocked while a row is being edited', () => {
            render(<ReportAnalytics />);
            fireEvent.click(screen.getByTestId('activate-funds-edit'));
            fireEvent.click(screen.getByTestId('start-row-edit'));

            fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.PDF_FILES));

            expect(screen.queryByTestId('pdf-files-section')).not.toBeInTheDocument();
        });

        it('should unblock sub-tabs after cancelling edit mode while a row was being edited (#3799)', async () => {
            mockCancelRecords.mockResolvedValueOnce({});
            render(<ReportAnalytics />);
            fireEvent.click(screen.getByTestId('activate-funds-edit'));
            fireEvent.click(screen.getByTestId('start-row-edit'));
            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL));

            fireEvent.click(screen.getByTestId('confirm-modal-cancel'));

            await waitFor(() => {
                expect(mockCancelRecords).toHaveBeenCalled();
            });

            fireEvent.click(screen.getByText(REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.PDF_FILES));

            expect(screen.getByTestId('pdf-files-section')).toBeInTheDocument();
        });
    });
});
