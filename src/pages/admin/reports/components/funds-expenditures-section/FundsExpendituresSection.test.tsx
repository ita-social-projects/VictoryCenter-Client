import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FundsExpenditureSection } from './FundsExpendituresSection';
import {
    FUNDS_EXPENDITURES_TEXT,
    FUNDS_EXPENDITURES_VALIDATION,
    PROGRAM_EXPENSES_TEXT,
    REPORTS_TEXT,
} from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import {
    FundsExpendituresSummary,
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
    ReportFundsExpendituresSettings,
    ReportFundsExpendituresSettingsLocalizationDto,
    ProgramExpensesSummary,
} from '@/types/admin/reports';
import { LocalizationLanguage, TranslationStatus } from '@/types/common/language';

const MOCK_FUNDS_EXPENDITURES_SETTINGS: ReportFundsExpendituresSettings = {
    id: 1,
    disclaimerTitle: 'Фінансовий звіт Victory Center за поточний рік. Ми забезпечуємо прозорість кожної гривні.',
    exchangeRate: '42.18',
    programExpendituresReportingYear: 2025,
    hasUnpublishedChanges: false,
};

const MOCK_FUNDS_EXPENDITURES_CATEGORIES: ReportFundsExpendituresCategory[] = [
    { id: 1, name: 'Грантові кошти', type: 'income', localizations: [] },
    { id: 2, name: 'Благодійні внески', type: 'income', localizations: [] },
    { id: 3, name: 'Власні надходження', type: 'income', localizations: [] },
    { id: 4, name: 'Інші надходження', type: 'income', localizations: [] },
    { id: 5, name: 'Адміністративні витрати', type: 'expense', localizations: [] },
    { id: 6, name: 'Програмні витрати', type: 'expense', localizations: [] },
    { id: 7, name: 'Обладнання', type: 'expense', localizations: [] },
    { id: 8, name: 'Заробітна плата', type: 'expense', localizations: [] },
];

const RESERVED_LOOKING_CATEGORIES: ReportFundsExpendituresCategory[] = [
    { id: 101, name: 'ПРОГРАМНІ', type: 'expense', localizations: [] },
    { id: 102, name: 'програмні тест', type: 'expense', localizations: [] },
    { id: 103, name: 'Програмні тест 2', type: 'expense', localizations: [] },
    { id: 104, name: 'Адміністративні витрати', type: 'expense', localizations: [] },
];

const MOCK_FUNDS_EXPENDITURES_RECORDS: ReportFundsExpendituresRecord[] = [
    { id: 1, categoryId: 1, type: 'income', reportingYear: '2025', amountUah: '7265', amountUsd: '4200' },
    { id: 2, categoryId: 5, type: 'expense', reportingYear: '2025', amountUah: '3100', amountUsd: '1800' },
    { id: 3, categoryId: 2, type: 'income', reportingYear: '2025', amountUah: '5800', amountUsd: '3360' },
    { id: 4, categoryId: 6, type: 'expense', reportingYear: '2025', amountUah: '4200', amountUsd: '2430' },
    { id: 5, categoryId: 3, type: 'income', reportingYear: '2025', amountUah: '2400', amountUsd: '1390' },
    { id: 6, categoryId: 7, type: 'expense', reportingYear: '2024', amountUah: '1950', amountUsd: '1130' },
    { id: 7, categoryId: 8, type: 'expense', reportingYear: '2024', amountUah: '5000', amountUsd: '2900' },
];

const MOCK_FUNDS_EXPENDITURES_SUMMARY: FundsExpendituresSummary = {
    totalCollectedUah: 15465,
    totalCollectedUsd: 8950,
    totalSpentUah: 14250,
    totalSpentUsd: 8260,
    incomeCategories: 3,
    expenseCategories: 4,
};

jest.mock('./FundsExpendituresSection.module.scss', () => ({
    section: 'section',
    disclaimer: 'disclaimer',
    'disclaimer-top-row': 'disclaimer-top-row',
    'disclaimer-label': 'disclaimer-label',
    'disclaimer-text-area': 'disclaimer-text-area',
    'disclaimer-text': 'disclaimer-text',
    'disclaimer-textarea-group': 'disclaimer-textarea-group',
    'summary-cards': 'summary-cards',
    'section-header': 'section-header',
    'edit-btn': 'edit-btn',
    'edit-icon': 'edit-icon',
    'section-footer': 'section-footer',
    'footer-button': 'footer-button',
    'translate-btn': 'translate-btn',
}));

const stableAdminClient = {};
jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => stableAdminClient,
}));

const mockAddToast = jest.fn();
jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: () => ({
        addToast: mockAddToast,
    }),
}));

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({
            id,
            label,
            value,
            onChange,
            onBlur,
            error,
        }: {
            id: string;
            label: string;
            value: string;
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
            onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
            error?: string;
        }) => (
            <div data-testid={`textarea-group-${id}`}>
                <label>{label}</label>
                <textarea data-testid={`textarea-${id}`} value={value} onChange={onChange} onBlur={onBlur} />
                {error && <span data-testid={`error-${id}`}>{error}</span>}
            </div>
        ),
    }),
);

const mockUseDataFetch = jest.fn();
jest.mock('@/hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: (props: { initialData: unknown }) => mockUseDataFetch(props),
}));

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: ({ size }: { size?: number }) => <div data-testid="inline-loader">loader-{size ?? 2}</div>,
}));

jest.mock('./components/summary-card/SummaryCard', () => ({
    SummaryCard: ({
        title,
        uah,
        usd,
        count,
        blueTheme,
    }: {
        title: string;
        uah?: number;
        usd?: number;
        count?: number;
        blueTheme?: boolean;
    }) => (
        <div data-testid="summary-card" data-blue={blueTheme} data-title={title}>
            <span>{title}</span>
            {count !== undefined && <span data-testid="count">{count}</span>}
            {uah !== undefined && <span data-testid="uah">{uah}</span>}
            {usd !== undefined && <span data-testid="usd">{usd}</span>}
        </div>
    ),
}));

jest.mock('./components/funds-expenditures-toolbar/FundsExpendituresToolbar', () => ({
    FundsExpendituresToolbar: ({
        categories,
        selectedCategoryId,
        exchangeRate,
        isEditing,
        isAddIncomeDisabled,
        isAddExpenseDisabled,
        onTypeChange,
        onCategoryChange,
        onExchangeRateChange,
        onExchangeRateBlur,
        onAddIncome,
        onAddExpense,
    }: {
        categories: { id: number; name: string }[];
        selectedCategoryId: number | null | undefined;
        exchangeRate: string | null;
        isEditing: boolean;
        isAddIncomeDisabled: boolean;
        isAddExpenseDisabled: boolean;
        onTypeChange: (v: unknown) => void;
        onCategoryChange: (v: unknown) => void;
        onExchangeRateChange: (v: string) => void;
        onExchangeRateBlur: () => void;
        onAddIncome: () => void;
        onAddExpense: () => void;
    }) => (
        <div
            data-testid="funds-toolbar"
            data-category-count={categories.length}
            data-editing={String(isEditing)}
            data-add-income-disabled={String(isAddIncomeDisabled)}
            data-add-expense-disabled={String(isAddExpenseDisabled)}
        >
            <span data-testid="exchange-rate">{exchangeRate}</span>
            <span data-testid="selected-category-id">{selectedCategoryId ?? 'none'}</span>
            <button onClick={() => onTypeChange(undefined)} data-testid="filter-all">
                Filter All
            </button>
            <button onClick={() => onTypeChange('income')} data-testid="filter-income">
                Filter Income
            </button>
            <button onClick={() => onTypeChange('expense')} data-testid="filter-expense">
                Filter Expense
            </button>
            <button onClick={() => onCategoryChange(1)} data-testid="filter-cat-1">
                Filter Cat 1
            </button>
            <button onClick={() => onExchangeRateChange('abc')} data-testid="change-rate-invalid">
                Invalid rate
            </button>
            <button onClick={() => onExchangeRateBlur()} data-testid="blur-rate">
                Blur rate
            </button>
            <button onClick={() => onAddIncome()} data-testid="open-add-income">
                Open add income
            </button>
            <button onClick={() => onAddExpense()} data-testid="open-add-expense">
                Open add expense
            </button>
        </div>
    ),
}));

jest.mock('./components/funds-expenditures-table/FundsExpendituresTable', () => ({
    FundsExpendituresTable: ({
        records,
        isEditing,
        selectedRecordIds = [],
        eligibleRecordIds = [],
        onRecordSave,
        onRowEditModeChange,
        onDeleteRecord,
        onSelectAllToggle,
        onToggleRecordSelection,
        onOpenBulkDelete,
        onProgramYearSave,
        programAggregateRow,
    }: any) => {
        const { FUNDS_EXPENDITURES_TEXT: FET } = require('@/const/admin/reports');
        return (
            <div
                data-testid="funds-table"
                data-record-count={records.length}
                data-editing={String(isEditing ?? false)}
                data-has-program-aggregate={String(Boolean(programAggregateRow))}
            >
                <input type="checkbox" aria-label="Select all records" onClick={() => onSelectAllToggle?.(true)} />
                <button
                    data-testid="select-row-1"
                    aria-label="Select record 1"
                    onClick={() => onToggleRecordSelection?.(1)}
                />
                <div data-testid="table-selection-summary" aria-hidden={selectedRecordIds.length === 0}>
                    <div>{FET.BULK.getSelectedLabel(selectedRecordIds.length, eligibleRecordIds.length)}</div>
                    <button data-testid="delete-selected" onClick={() => onOpenBulkDelete?.()}>
                        {FET.BULK.DELETE_BUTTON}
                    </button>
                </div>
                <button
                    data-testid="trigger-record-save"
                    onClick={() => onRecordSave?.(1, { categoryId: 1, amountUah: '7300', amountUsd: '173.81' })}
                >
                    Save row
                </button>
                <button data-testid="trigger-program-year-save" onClick={() => void onProgramYearSave?.('2024')}>
                    Save program year
                </button>
                <button data-testid="row-edit-on" onClick={() => onRowEditModeChange?.(true)}>
                    Row edit on
                </button>
                <button data-testid="row-edit-off" onClick={() => onRowEditModeChange?.(false)}>
                    Row edit off
                </button>
                <button
                    data-testid="trigger-record-delete"
                    onClick={() => onDeleteRecord?.(records[0])}
                    disabled={!isEditing || records.length === 0}
                >
                    Delete row
                </button>
            </div>
        );
    },
}));

jest.mock('./components/common/add-funds-expenditures-category-modal/AddFundsExpendituresCategoryModal', () => ({
    AddFundsExpendituresCategoryModal: ({
        isOpen,
        onClose,
        onSubmit,
    }: {
        isOpen: boolean;
        onClose: () => void;
        onSubmit: (data: { name: string; type: 'income' | 'expense' }) => Promise<boolean>;
    }) => (
        <div data-testid="add-category-modal" data-open={String(isOpen)}>
            <button data-testid="add-category-modal-close" onClick={onClose}>
                Close
            </button>
            <button
                data-testid="add-category-submit-valid"
                onClick={() => void onSubmit({ name: 'Оренда офісу', type: 'expense' })}
            >
                Submit valid category
            </button>
            <button
                data-testid="add-category-submit-reserved"
                onClick={() => void onSubmit({ name: 'Програмні тест 2', type: 'expense' })}
            >
                Submit reserved category
            </button>
        </div>
    ),
}));

jest.mock('./components/common/add-funds-expenditures-record-modal/AddFundsExpendituresRecordModal', () => ({
    AddFundsExpendituresRecordModal: ({
        isOpen,
        onClose,
        transactionType,
        onSubmit,
    }: {
        isOpen: boolean;
        onClose: () => void;
        transactionType: 'income' | 'expense';
        onSubmit: (data: {
            categoryId: number;
            reportingYear: string;
            amountUah: string;
            amountUsd: string;
            type: 'income' | 'expense';
        }) => Promise<boolean>;
    }) => (
        <div data-testid="add-record-modal" data-open={String(isOpen)} data-type={transactionType}>
            <button data-testid="add-record-close" onClick={onClose}>
                Close add record
            </button>
            <button
                data-testid="add-record-submit"
                onClick={() =>
                    void onSubmit({
                        categoryId: 1,
                        reportingYear: '2026',
                        amountUah: '1000',
                        amountUsd: '25',
                        type: transactionType,
                    })
                }
            >
                Submit add record
            </button>
        </div>
    ),
}));

const mockUpdateRecord = jest.fn();
const mockCreateRecord = jest.fn();
const mockUpdateSettings = jest.fn();
const mockDeleteRecord = jest.fn();
const mockBulkDelete = jest.fn();
const mockCreateCategory = jest.fn();
jest.mock('@/services/api/admin/reports/funds-expenditures-api', () => ({
    FundsExpendituresApi: {
        getSettings: jest.fn(),
        getCategories: jest.fn(),
        getRecords: jest.fn(),
        getSummary: jest.fn(),
        updateSettings: (...args: unknown[]) => mockUpdateSettings(...args),
        createRecord: (...args: unknown[]) => mockCreateRecord(...args),
        updateRecord: (...args: unknown[]) => mockUpdateRecord(...args),
        deleteRecord: (...args: unknown[]) => mockDeleteRecord(...args),
        bulkDeleteRecords: (...args: unknown[]) => mockBulkDelete(...args),
        createCategory: (...args: unknown[]) => mockCreateCategory(...args),
    },
}));

const mockProgramExpensesSummaryGet = jest.fn();
jest.mock('@/services/api/admin/reports/program-expenses-api', () => ({
    ProgramExpensesApi: {
        getSummary: (...args: unknown[]) => mockProgramExpensesSummaryGet(...args),
    },
}));

const mockGetByEntityId = jest.fn();
jest.mock(
    '@/services/api/admin/reports/report-funds-expenditures-settings-localizations/report-funds-expenditures-settings-localizations-api',
    () => ({
        ReportFundsExpendituresSettingsLocalizationsApi: {
            getByEntityId: (...args: unknown[]) => mockGetByEntityId(...args),
        },
    }),
);

jest.mock('@/utils/functions/mappers/common/localization/localization-mappers', () => ({
    mapLocalizationDtoToModel: (dto: ReportFundsExpendituresSettingsLocalizationDto) => ({
        ...dto,
        language: dto.localizationInfoDto,
    }),
}));

jest.mock('@/components/admin/localization-statuses/LocalizationStatuses', () => ({
    LocalizationStatuses: ({ localizedEntity }: { localizedEntity: { translationStatuses: unknown[] } }) => (
        <div data-testid="localization-statuses" data-status-count={localizedEntity.translationStatuses.length} />
    ),
}));

const mockTranslateDisclaimerModalOnTranslateSuccess = jest.fn();
jest.mock('./components/common/translate-disclaimer-modal/TranslateDisclaimerModal', () => ({
    TranslateDisclaimerModal: ({
        isOpen,
        onClose,
        existingLocalizations,
        onTranslateSuccess,
    }: {
        isOpen: boolean;
        onClose: () => void;
        existingLocalizations: unknown[];
        onTranslateSuccess: (loc: unknown) => void;
    }) => {
        mockTranslateDisclaimerModalOnTranslateSuccess.mockImplementation(onTranslateSuccess);
        return (
            <div
                data-testid="translate-disclaimer-modal"
                data-open={String(isOpen)}
                data-existing-count={existingLocalizations.length}
            >
                <button data-testid="translate-modal-close" onClick={onClose}>
                    Close
                </button>
            </div>
        );
    },
}));

const MOCK_EMPTY_PROGRAM_SUMMARY: ProgramExpensesSummary = { totalAmountUah: 0, totalAmountUsd: 0 };

const setupMockDataFetch = (
    settings: ReportFundsExpendituresSettings | null = MOCK_FUNDS_EXPENDITURES_SETTINGS,
    categories: ReportFundsExpendituresCategory[] = MOCK_FUNDS_EXPENDITURES_CATEGORIES,
    records: ReportFundsExpendituresRecord[] = MOCK_FUNDS_EXPENDITURES_RECORDS,
    summary: FundsExpendituresSummary = MOCK_FUNDS_EXPENDITURES_SUMMARY,
    loadingBySlot: Partial<Record<number, boolean>> = {},
    programExpenses: ProgramExpensesSummary = MOCK_EMPTY_PROGRAM_SUMMARY,
) => {
    let callIndex = 0;
    mockUseDataFetch.mockImplementation(({ initialData }: { initialData: unknown }) => {
        const callOrder = callIndex++;
        // IMPORTANT: slot order must match the order useDataFetch is called in
        // FundsExpendituresSection: 0=settings, 1=categories, 2=records, 3=summary, 4=programExpenses
        // If a new useDataFetch call is added to the component, add a slot here in the same position.
        const slot = callOrder % 5;
        const slotDataMap: Record<number, unknown> = {
            0: settings,
            1: categories,
            2: records,
            3: summary,
            4: programExpenses,
        };
        const data = slotDataMap[slot];
        return {
            data: data ?? initialData,
            isLoading: loadingBySlot[slot] ?? false,
            error: null,
            refetch: jest.fn(),
        };
    });
};

describe('FundsExpenditureSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupMockDataFetch();
        mockGetByEntityId.mockResolvedValue([]);
    });

    it('should show success toast when record is saved from table', async () => {
        mockUpdateRecord.mockResolvedValueOnce({
            id: 1,
            categoryId: 1,
            type: 'income',
            reportingYear: '2025',
            amountUah: '7300',
            amountUsd: '173.81',
        });

        render(<FundsExpenditureSection />);

        fireEvent.click(screen.getByTestId('trigger-record-save'));

        await screen.findByTestId('funds-table');
        expect(mockAddToast).toHaveBeenCalledWith(
            FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_UPDATED_SUCCESSFULLY,
            'success',
        );
    });

    it('should show retry error toast when record save fails', async () => {
        mockUpdateRecord.mockRejectedValueOnce(new Error('save failed'));

        render(<FundsExpenditureSection />);

        fireEvent.click(screen.getByTestId('trigger-record-save'));

        await screen.findByTestId('funds-table');
        expect(mockAddToast).toHaveBeenCalledWith(FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_UPDATE_FAILED_RETRY, 'error');
    });

    it('should render the disclaimer text', () => {
        render(<FundsExpenditureSection />);
        expect(screen.getByText(MOCK_FUNDS_EXPENDITURES_SETTINGS.disclaimerTitle!)).toBeInTheDocument();
    });

    it('should render the disclaimer label', () => {
        render(<FundsExpenditureSection />);
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.DISCLAIMER_LABEL)).toBeInTheDocument();
    });

    it('should render four summary cards', () => {
        render(<FundsExpenditureSection />);
        const cards = screen.getAllByTestId('summary-card');
        expect(cards).toHaveLength(4);
    });

    it('should render the "Ð—Ñ–Ð±Ñ€Ð°Ð½Ð¾ ÐºÐ¾ÑˆÑ‚Ñ–Ð²" summary card', () => {
        render(<FundsExpenditureSection />);
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.COLLECTED)).toBeInTheDocument();
    });

    it('should render the "Ð’Ð¸Ñ‚Ñ€Ð°Ñ‡ÐµÐ½Ð¾ ÐºÐ¾ÑˆÑ‚Ñ–Ð²" summary card', () => {
        render(<FundsExpenditureSection />);
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.SPENT)).toBeInTheDocument();
    });

    it('should render "ÐšÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ñ–Ñ— Ð½Ð°Ð´Ñ…Ð¾Ð´Ð¶ÐµÐ½ÑŒ" summary card', () => {
        render(<FundsExpenditureSection />);
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.INCOME_CATEGORIES)).toBeInTheDocument();
    });

    it('should render "ÐšÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ñ–Ñ— Ð²Ð¸Ñ‚Ñ€Ð°Ñ‚" summary card', () => {
        render(<FundsExpenditureSection />);
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.EXPENSE_CATEGORIES)).toBeInTheDocument();
    });

    it('should render the toolbar with exchange rate', () => {
        render(<FundsExpenditureSection />);
        expect(screen.getByTestId('funds-toolbar')).toBeInTheDocument();
        expect(screen.getByTestId('exchange-rate')).toHaveTextContent(MOCK_FUNDS_EXPENDITURES_SETTINGS.exchangeRate!);
    });

    it('should render the table', () => {
        render(<FundsExpenditureSection />);
        expect(screen.getByTestId('funds-table')).toBeInTheDocument();
    });

    it('should call handleProgramYearSave when triggered from table', async () => {
        mockUpdateSettings.mockResolvedValueOnce({ id: 1 });
        render(<FundsExpenditureSection isEditing />);
        fireEvent.click(screen.getByTestId('trigger-program-year-save'));
        await waitFor(() => {
            expect(mockUpdateSettings).toHaveBeenCalled();
            expect(mockAddToast).toHaveBeenCalledWith(
                FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_UPDATED_SUCCESSFULLY,
                'success',
            );
        });
    });

    it('should show error when handleProgramYearSave fails', async () => {
        mockUpdateSettings.mockRejectedValueOnce(new Error('fail'));
        render(<FundsExpenditureSection isEditing />);
        fireEvent.click(screen.getByTestId('trigger-program-year-save'));
        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(
                FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_UPDATE_FAILED_RETRY,
                'error',
            );
        });
    });

    it('should render loader when funds and expenditures data is loading', () => {
        setupMockDataFetch(null, [], [], MOCK_FUNDS_EXPENDITURES_SUMMARY, {
            0: true,
            1: true,
            2: true,
            3: true,
        });

        render(<FundsExpenditureSection />);

        expect(screen.getByTestId('inline-loader')).toBeInTheDocument();
        expect(screen.queryByTestId('funds-table')).not.toBeInTheDocument();
    });

    it('should pass all enriched records to the table initially', () => {
        render(<FundsExpenditureSection />);
        const table = screen.getByTestId('funds-table');
        expect(table).toHaveAttribute('data-record-count', String(MOCK_FUNDS_EXPENDITURES_RECORDS.length));
    });

    it('should not render disclaimer if settings have no disclaimerTitle', () => {
        setupMockDataFetch({
            id: 1,
            disclaimerTitle: null,
            exchangeRate: '42.18',
            programExpendituresReportingYear: 2025,
            hasUnpublishedChanges: false,
        });
        render(<FundsExpenditureSection />);
        expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.DISCLAIMER_LABEL)).not.toBeInTheDocument();
    });

    it('should filter records by type when type filter is applied', () => {
        render(<FundsExpenditureSection />);

        fireEvent.click(screen.getByTestId('filter-income'));

        const table = screen.getByTestId('funds-table');

        expect(table).toHaveAttribute('data-record-count', '3');
    });

    it('should filter records by category when category filter is applied', () => {
        render(<FundsExpenditureSection />);

        fireEvent.click(screen.getByTestId('filter-cat-1'));

        const table = screen.getByTestId('funds-table');
        expect(table).toHaveAttribute('data-record-count', '1');
    });

    it('should reset category when type changes', () => {
        render(<FundsExpenditureSection />);

        fireEvent.click(screen.getByTestId('filter-cat-1'));
        expect(screen.getByTestId('selected-category-id')).toHaveTextContent('1');

        fireEvent.click(screen.getByTestId('filter-income'));
        expect(screen.getByTestId('selected-category-id')).toHaveTextContent('none');
    });

    it('should pass all categories to toolbar when income type is selected', () => {
        render(<FundsExpenditureSection />);

        fireEvent.click(screen.getByTestId('filter-income'));

        expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-category-count', '8');
    });

    it('should pass all categories to toolbar when expense type is selected', () => {
        render(<FundsExpenditureSection />);

        fireEvent.click(screen.getByTestId('filter-expense'));

        expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-category-count', '8');
    });

    it('should pass all categories to toolbar when no type is selected', () => {
        render(<FundsExpenditureSection />);

        expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-category-count', '8');
    });

    it('should pass the program aggregate row when no filters are selected', () => {
        render(<FundsExpenditureSection />);

        expect(screen.getByTestId('funds-table')).toHaveAttribute('data-has-program-aggregate', 'true');
    });

    it('should pass the program aggregate row when expense type is selected', () => {
        render(<FundsExpenditureSection />);

        fireEvent.click(screen.getByTestId('filter-expense'));

        expect(screen.getByTestId('funds-table')).toHaveAttribute('data-has-program-aggregate', 'true');
    });

    it('should not pass the program aggregate row when income type is selected', () => {
        render(<FundsExpenditureSection />);

        fireEvent.click(screen.getByTestId('filter-income'));

        expect(screen.getByTestId('funds-table')).toHaveAttribute('data-has-program-aggregate', 'false');
    });

    it('should not pass the program aggregate row when a category is selected', () => {
        render(<FundsExpenditureSection />);

        fireEvent.click(screen.getByTestId('filter-cat-1'));

        expect(screen.getByTestId('funds-table')).toHaveAttribute('data-has-program-aggregate', 'false');
    });

    describe('edit mode', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            setupMockDataFetch();
        });

        it('should start in read mode', () => {
            render(<FundsExpenditureSection />);
            expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-editing', 'false');
        });

        it('should show edit button when not editing', () => {
            render(<FundsExpenditureSection />);
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT)).toBeInTheDocument();
        });

        it('should enter edit mode when edit button is clicked', () => {
            render(<FundsExpenditureSection />);
            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT));
            expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-editing', 'true');
        });

        it('should show error when creating reserved category', async () => {
            render(<FundsExpenditureSection isAddCategoryModalOpen />);
            const submitBtn = screen.getByTestId('add-category-submit-reserved');
            fireEvent.click(submitBtn);
            expect(mockAddToast).toHaveBeenCalledWith(
                FUNDS_EXPENDITURES_TEXT.MESSAGE.CATEGORY_CREATE_FAILED_RETRY,
                'error',
            );
        });

        it('should successfully create valid category', async () => {
            render(<FundsExpenditureSection isAddCategoryModalOpen />);
            mockCreateCategory.mockResolvedValueOnce({ id: 9 });
            const submitBtn = screen.getByTestId('add-category-submit-valid');
            fireEvent.click(submitBtn);
            await waitFor(() => {
                expect(mockAddToast).toHaveBeenCalledWith(
                    FUNDS_EXPENDITURES_TEXT.MESSAGE.CATEGORY_CREATED_SUCCESSFULLY,
                    'success',
                );
            });
        });

        it('should delete record successfully', async () => {
            render(<FundsExpenditureSection isEditing />);
            fireEvent.click(screen.getByTestId('trigger-record-delete'));
            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));
            await waitFor(() => {
                expect(mockDeleteRecord).toHaveBeenCalled();
                expect(mockAddToast).toHaveBeenCalledWith(
                    FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_DELETED_SUCCESSFULLY,
                    'success',
                );
            });
        });

        it('should show error when deleting record fails', async () => {
            mockDeleteRecord.mockRejectedValueOnce(new Error('fail'));
            render(<FundsExpenditureSection isEditing />);
            fireEvent.click(screen.getByTestId('trigger-record-delete'));
            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));
            await waitFor(() => {
                expect(mockAddToast).toHaveBeenCalledWith(
                    FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_DELETE_FAILED_RETRY,
                    'error',
                );
            });
        });

        it('should save settings when registered save function is called', async () => {
            let saveFn: (() => Promise<boolean>) | undefined;
            const registerSaveCallback = (fn: () => Promise<boolean>) => {
                saveFn = fn;
            };
            render(<FundsExpenditureSection isEditing registerSaveCallback={registerSaveCallback} />);

            mockUpdateSettings.mockResolvedValueOnce({
                id: 1,
                disclaimerTitle: 'saved',
                exchangeRate: '42.18',
            });

            expect(saveFn).toBeDefined();
            const success = await saveFn!();
            expect(success).toBe(true);
        });

        it('should show error when registered save function fails', async () => {
            let saveFn: (() => Promise<boolean>) | undefined;
            const registerSaveCallback = (fn: () => Promise<boolean>) => {
                saveFn = fn;
            };
            render(<FundsExpenditureSection isEditing registerSaveCallback={registerSaveCallback} />);

            mockUpdateSettings.mockRejectedValueOnce(new Error('fail'));

            expect(saveFn).toBeDefined();
            const success = await saveFn!();
            expect(success).toBe(false);
            expect(mockAddToast).toHaveBeenCalledWith(REPORTS_TEXT.MESSAGE.FAIL_TO_UPDATE_REPORT, 'error');
        });

        it('should propagate edit mode to table when edit button is clicked', () => {
            render(<FundsExpenditureSection />);
            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT));
            expect(screen.getByTestId('funds-table')).toHaveAttribute('data-editing', 'true');
        });

        it('should show disclaimer textarea in edit mode', () => {
            render(<FundsExpenditureSection />);
            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT));
            expect(screen.getByTestId('textarea-group-funds-disclaimer')).toBeInTheDocument();
        });

        it('should show disclaimer label inside textarea in edit mode', () => {
            render(<FundsExpenditureSection />);
            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT));
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.DISCLAIMER_LABEL)).toBeInTheDocument();
        });

        it('should initialize disclaimer textarea with settings value after entering edit mode', () => {
            render(<FundsExpenditureSection />);
            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT));
            const textarea = screen.getByTestId('textarea-funds-disclaimer');
            expect(textarea).toHaveValue(MOCK_FUNDS_EXPENDITURES_SETTINGS.disclaimerTitle);
        });

        it('should initialize edit values from settings when mounted in edit mode', () => {
            render(<FundsExpenditureSection isEditing />);

            expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-editing', 'true');
            expect(screen.getByTestId('textarea-funds-disclaimer')).toHaveValue(
                MOCK_FUNDS_EXPENDITURES_SETTINGS.disclaimerTitle,
            );
            expect(screen.getByTestId('exchange-rate')).toHaveTextContent(
                MOCK_FUNDS_EXPENDITURES_SETTINGS.exchangeRate!,
            );
        });

        it('should initialize exchange rate from draft value when mounted in edit mode', () => {
            render(<FundsExpenditureSection isEditing draftExchangeRate="44.20" />);

            expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-editing', 'true');
            expect(screen.getByTestId('exchange-rate')).toHaveTextContent('44.20');
        });

        it('should hide edit button while editing', () => {
            render(<FundsExpenditureSection />);
            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT));
            expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT)).not.toBeInTheDocument();
        });

        it('should return to read mode and show edit button when isEditing changes to false', () => {
            const { rerender } = render(<FundsExpenditureSection isEditing={true} />);
            expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-editing', 'true');
            expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT)).not.toBeInTheDocument();

            rerender(<FundsExpenditureSection isEditing={false} />);
            expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-editing', 'false');
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT)).toBeInTheDocument();
        });
    });

    describe('disclaimer validation', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            setupMockDataFetch();
        });

        const enterEditMode = () => fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT));
        const getTextarea = () => screen.getByTestId('textarea-funds-disclaimer');

        it('should show required error when blurring an empty disclaimer', () => {
            render(<FundsExpenditureSection />);
            enterEditMode();
            fireEvent.change(getTextarea(), { target: { value: '' } });
            fireEvent.blur(getTextarea());
            expect(screen.getByTestId('error-funds-disclaimer')).toHaveTextContent(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
            );
        });

        it('should show min-length error when blurring with 1 character', () => {
            render(<FundsExpenditureSection />);
            enterEditMode();
            fireEvent.change(getTextarea(), { target: { value: 'a' } });
            fireEvent.blur(getTextarea());
            expect(screen.getByTestId('error-funds-disclaimer')).toHaveTextContent(
                COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(FUNDS_EXPENDITURES_VALIDATION.disclaimer.min),
            );
        });

        it('should clear error when disclaimer is corrected and blurred', () => {
            render(<FundsExpenditureSection />);
            enterEditMode();
            fireEvent.change(getTextarea(), { target: { value: '' } });
            fireEvent.blur(getTextarea());
            expect(screen.getByTestId('error-funds-disclaimer')).toBeInTheDocument();

            fireEvent.change(getTextarea(), { target: { value: 'valid disclaimer text' } });
            fireEvent.blur(getTextarea());
            expect(screen.queryByTestId('error-funds-disclaimer')).not.toBeInTheDocument();
        });

        it('should normalize consecutive spaces to a single space when typing', () => {
            render(<FundsExpenditureSection />);
            enterEditMode();
            fireEvent.change(getTextarea(), { target: { value: 'one  two   three' } });
            expect(getTextarea()).toHaveValue('one two three');
        });

        it('should trim and normalize spaces on blur', () => {
            render(<FundsExpenditureSection />);
            enterEditMode();
            fireEvent.change(getTextarea(), { target: { value: '  leading and trailing  ' } });
            fireEvent.blur(getTextarea());
            expect(getTextarea()).toHaveValue('leading and trailing');
        });

        it('should call onValidationChange with false when disclaimer is empty', () => {
            const mockOnValidationChange = jest.fn();
            render(<FundsExpenditureSection isEditing onValidationChange={mockOnValidationChange} />);
            fireEvent.change(getTextarea(), { target: { value: '' } });
            expect(mockOnValidationChange).toHaveBeenCalledWith(false);
        });

        it('should call onValidationChange with true when disclaimer is valid', () => {
            const mockOnValidationChange = jest.fn();
            render(<FundsExpenditureSection isEditing onValidationChange={mockOnValidationChange} />);
            fireEvent.change(getTextarea(), { target: { value: 'valid text' } });
            expect(mockOnValidationChange).toHaveBeenCalledWith(true);
        });

        it('should not throw if onValidationChange and onDataChange are omitted', () => {
            render(<FundsExpenditureSection isEditing />);
            fireEvent.change(getTextarea(), { target: { value: 'valid text' } });
            fireEvent.click(screen.getByTestId('change-rate-invalid'));
            // Implicitly asserts no error was thrown
        });

        it('should call onDataChange when disclaimer changes', () => {
            const mockOnDataChange = jest.fn();
            render(<FundsExpenditureSection isEditing onDataChange={mockOnDataChange} />);
            fireEvent.change(getTextarea(), { target: { value: 'new text' } });
            expect(mockOnDataChange).toHaveBeenCalled();
        });

        it('should call onDataChange when exchange rate changes', () => {
            const mockOnDataChange = jest.fn();
            render(<FundsExpenditureSection isEditing onDataChange={mockOnDataChange} />);
            fireEvent.click(screen.getByTestId('change-rate-invalid'));
            expect(mockOnDataChange).toHaveBeenCalled();
        });

        it('should call onValidationChange with false when disclaimer has only 1 character', () => {
            const mockOnValidationChange = jest.fn();
            render(<FundsExpenditureSection isEditing onValidationChange={mockOnValidationChange} />);
            fireEvent.change(getTextarea(), { target: { value: 'a' } });
            expect(mockOnValidationChange).toHaveBeenCalledWith(false);
        });

        it('should call onValidationChange with true when disclaimer already has a valid value from settings', () => {
            const mockOnValidationChange = jest.fn();
            render(<FundsExpenditureSection isEditing onValidationChange={mockOnValidationChange} />);
            expect(mockOnValidationChange).toHaveBeenCalledWith(true);
        });

        it('should reset disclaimer error when isEditing becomes false', () => {
            const { rerender } = render(<FundsExpenditureSection isEditing={true} />);
            fireEvent.change(getTextarea(), { target: { value: '' } });
            fireEvent.blur(getTextarea());
            expect(screen.getByTestId('error-funds-disclaimer')).toBeInTheDocument();

            rerender(<FundsExpenditureSection isEditing={false} />);
            rerender(<FundsExpenditureSection isEditing={true} />);
            expect(screen.queryByTestId('error-funds-disclaimer')).not.toBeInTheDocument();
        });

        it('should show exchange-rate error and disable add actions after invalid rate change and blur', () => {
            const mockOnValidationChange = jest.fn();
            render(<FundsExpenditureSection isEditing onValidationChange={mockOnValidationChange} />);

            fireEvent.click(screen.getByTestId('change-rate-invalid'));
            fireEvent.click(screen.getByTestId('blur-rate'));

            expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-add-income-disabled', 'true');
            expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-add-expense-disabled', 'true');
            expect(mockOnValidationChange).toHaveBeenCalledWith(false);
        });

        it('should open and close add income modal from toolbar controls', () => {
            render(<FundsExpenditureSection />);

            expect(screen.getByTestId('add-record-modal')).toHaveAttribute('data-open', 'false');
            fireEvent.click(screen.getByTestId('open-add-income'));
            expect(screen.getByTestId('add-record-modal')).toHaveAttribute('data-open', 'true');
            expect(screen.getByTestId('add-record-modal')).toHaveAttribute('data-type', 'income');

            fireEvent.click(screen.getByTestId('add-record-close'));
            expect(screen.getByTestId('add-record-modal')).toHaveAttribute('data-open', 'false');
        });

        it('should open expense record modal from toolbar controls', () => {
            render(<FundsExpenditureSection />);

            fireEvent.click(screen.getByTestId('open-add-expense'));
            expect(screen.getByTestId('add-record-modal')).toHaveAttribute('data-open', 'true');
            expect(screen.getByTestId('add-record-modal')).toHaveAttribute('data-type', 'expense');
        });

        it('should create income record successfully and show success toast', async () => {
            mockCreateRecord.mockResolvedValueOnce({
                id: 999,
                categoryId: 1,
                type: 'income',
                reportingYear: '2026',
                amountUah: '1000',
                amountUsd: '25',
            });

            render(<FundsExpenditureSection />);

            fireEvent.click(screen.getByTestId('open-add-income'));
            fireEvent.click(screen.getByTestId('add-record-submit'));

            expect(await screen.findByTestId('funds-table')).toBeInTheDocument();
            expect(mockCreateRecord).toHaveBeenCalled();
            expect(mockAddToast).toHaveBeenCalledWith(
                FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_CREATED_SUCCESSFULLY,
                'success',
            );
            await waitFor(() => {
                expect(screen.getByTestId('add-record-modal')).toHaveAttribute('data-open', 'false');
            });
        });

        it('should show error toast when income record creation fails', async () => {
            mockCreateRecord.mockRejectedValueOnce(new Error('create failed'));

            render(<FundsExpenditureSection />);

            fireEvent.click(screen.getByTestId('open-add-income'));
            fireEvent.click(screen.getByTestId('add-record-submit'));

            expect(await screen.findByTestId('add-record-modal')).toHaveAttribute('data-open', 'true');
            expect(mockAddToast).toHaveBeenCalledWith(
                FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_CREATE_FAILED_RETRY,
                'error',
            );
        });

        it('should delete record after confirmation and show success toast', async () => {
            mockDeleteRecord.mockResolvedValueOnce(undefined);

            render(<FundsExpenditureSection />);

            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT));
            expect(screen.getByTestId('funds-table')).toHaveAttribute(
                'data-record-count',
                String(MOCK_FUNDS_EXPENDITURES_RECORDS.length),
            );

            fireEvent.click(screen.getByTestId('trigger-record-delete'));
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE.TITLE)).toBeInTheDocument();

            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));

            await waitFor(() => {
                expect(mockDeleteRecord).toHaveBeenCalledWith({}, 1);
                expect(mockAddToast).toHaveBeenCalledWith(
                    FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_DELETED_SUCCESSFULLY,
                    'success',
                );
                expect(screen.getByTestId('funds-table')).toHaveAttribute(
                    'data-record-count',
                    String(MOCK_FUNDS_EXPENDITURES_RECORDS.length - 1),
                );
                expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE.TITLE)).not.toBeInTheDocument();
            });
        });

        it('should show delete error toast and keep modal open when delete fails', async () => {
            mockDeleteRecord.mockRejectedValueOnce(new Error('delete failed'));

            render(<FundsExpenditureSection />);

            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT));
            fireEvent.click(screen.getByTestId('trigger-record-delete'));
            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));

            await waitFor(() => {
                expect(mockDeleteRecord).toHaveBeenCalledWith({}, 1);
                expect(mockAddToast).toHaveBeenCalledWith(
                    FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_DELETE_FAILED_RETRY,
                    'error',
                );
                expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE.TITLE)).toBeInTheDocument();
                expect(screen.getByTestId('funds-table')).toHaveAttribute(
                    'data-record-count',
                    String(MOCK_FUNDS_EXPENDITURES_RECORDS.length),
                );
            });
        });

        it('should close delete confirmation modal on cancel', () => {
            render(<FundsExpenditureSection />);

            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT));
            fireEvent.click(screen.getByTestId('trigger-record-delete'));

            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE.TITLE)).toBeInTheDocument();

            fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO));

            expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.MODAL.DELETE.TITLE)).not.toBeInTheDocument();
        });
    });

    describe('add category modal', () => {
        it('should render add category modal as closed by default', () => {
            render(<FundsExpenditureSection />);

            expect(screen.getByTestId('add-category-modal')).toHaveAttribute('data-open', 'false');
        });

        it('should render add category modal as open when isAddCategoryModalOpen is true', () => {
            render(<FundsExpenditureSection isAddCategoryModalOpen onAddCategoryModalClose={jest.fn()} />);

            expect(screen.getByTestId('add-category-modal')).toHaveAttribute('data-open', 'true');
        });

        it('should call onAddCategoryModalClose when modal close is triggered', () => {
            const mockClose = jest.fn();
            render(<FundsExpenditureSection isAddCategoryModalOpen onAddCategoryModalClose={mockClose} />);

            fireEvent.click(screen.getByTestId('add-category-modal-close'));

            expect(mockClose).toHaveBeenCalledTimes(1);
        });

        it('rejects creating a category with a reserved name and does not call the API', async () => {
            render(<FundsExpenditureSection isAddCategoryModalOpen onAddCategoryModalClose={jest.fn()} />);

            fireEvent.click(screen.getByTestId('add-category-submit-reserved'));

            await waitFor(() => {
                expect(mockAddToast).toHaveBeenCalledWith(
                    FUNDS_EXPENDITURES_TEXT.MESSAGE.CATEGORY_CREATE_FAILED_RETRY,
                    'error',
                );
            });
            expect(mockCreateCategory).not.toHaveBeenCalled();
        });

        it('creates a category with a non-reserved name', async () => {
            mockCreateCategory.mockResolvedValueOnce({
                id: 1,
                name: 'Оренда офісу',
                type: 'expense',
                localizations: [],
            });

            render(<FundsExpenditureSection isAddCategoryModalOpen onAddCategoryModalClose={jest.fn()} />);

            fireEvent.click(screen.getByTestId('add-category-submit-valid'));

            await waitFor(() => {
                expect(mockCreateCategory).toHaveBeenCalledWith(stableAdminClient, {
                    name: 'Оренда офісу',
                    type: 'expense',
                });
            });
            expect(mockAddToast).toHaveBeenCalledWith(
                FUNDS_EXPENDITURES_TEXT.MESSAGE.CATEGORY_CREATED_SUCCESSFULLY,
                'success',
            );
        });
    });

    describe('delete category modal', () => {
        it('excludes real-world reserved "Програмні"-like category names from the category dropdown', () => {
            setupMockDataFetch(undefined, RESERVED_LOOKING_CATEGORIES);
            render(<FundsExpenditureSection isDeleteCategoryModalOpen onDeleteCategoryModalClose={jest.fn()} />);

            fireEvent.click(
                screen.getByRole('button', {
                    name: FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.CATEGORY_PLACEHOLDER,
                }),
            );

            expect(screen.queryByRole('button', { name: 'ПРОГРАМНІ' })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'програмні тест' })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Програмні тест 2' })).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Адміністративні витрати' })).toBeInTheDocument();
        });
    });

    describe('edit category modal', () => {
        it('excludes real-world reserved "Програмні"-like category names from the category dropdown', () => {
            setupMockDataFetch(undefined, RESERVED_LOOKING_CATEGORIES);
            render(<FundsExpenditureSection isEditCategoryModalOpen onEditCategoryModalClose={jest.fn()} />);

            fireEvent.click(
                screen.getByRole('button', {
                    name: FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.CATEGORY_PLACEHOLDER,
                }),
            );

            expect(screen.queryByRole('button', { name: 'ПРОГРАМНІ' })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'програмні тест' })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Програмні тест 2' })).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Адміністративні витрати' })).toBeInTheDocument();
        });
    });
});

describe('FundsExpenditureSection bulk delete flow', () => {
    const settingsMock = {
        id: 1,
        exchangeRate: '40',
        disclaimerTitle: 'Disclaimer',
        programExpendituresReportingYear: 2025,
        hasUnpublishedChanges: false,
    };
    const categoriesMock: ReportFundsExpendituresCategory[] = [
        { id: 1, name: 'A', type: 'income', localizations: [] },
        { id: 2, name: 'B', type: 'income', localizations: [] },
        { id: 3, name: PROGRAM_EXPENSES_TEXT.TABLE.TYPE_LABEL, type: 'expense', localizations: [] },
    ];
    const recordsMock: ReportFundsExpendituresRecord[] = [
        { id: 1, categoryId: 1, type: 'income', reportingYear: '2025', amountUah: '100', amountUsd: '10' },
        { id: 2, categoryId: 2, type: 'income', reportingYear: '2025', amountUah: '200', amountUsd: '20' },
        { id: 3, categoryId: 3, type: 'expense', reportingYear: '2025', amountUah: '300', amountUsd: '30' },
    ];
    const summaryMock: FundsExpendituresSummary = {
        totalCollectedUah: 0,
        totalCollectedUsd: 0,
        totalSpentUah: 0,
        totalSpentUsd: 0,
        incomeCategories: 1,
        expenseCategories: 1,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        setupMockDataFetch(settingsMock, categoriesMock, recordsMock, summaryMock);
        mockGetByEntityId.mockResolvedValue([]);
    });

    it('select all via header checkbox and cancel bulk delete clears selection', async () => {
        render(<FundsExpenditureSection isEditing={true} />);

        fireEvent.click(screen.getByLabelText('Select all records'));

        await waitFor(() => {
            expect(screen.getByTestId('table-selection-summary')).toHaveAttribute('aria-hidden', 'false');
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.BULK.getSelectedLabel(2, 2))).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('delete-selected'));
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.BULK.DELETE_CONFIRM_TITLE)).toBeInTheDocument();

        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO));

        await waitFor(() => {
            expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.BULK.DELETE_CONFIRM_TITLE)).not.toBeInTheDocument();
            expect(screen.getByTestId('table-selection-summary')).toHaveAttribute('aria-hidden', 'true');
        });
    });

    it('confirms bulk delete calls API and shows success toast', async () => {
        mockBulkDelete.mockResolvedValue(undefined);

        render(<FundsExpenditureSection isEditing={true} />);

        fireEvent.click(screen.getByLabelText('Select all records'));

        await waitFor(() => {
            expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.BULK.getSelectedLabel(2, 2))).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('delete-selected'));
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));

        await waitFor(() => {
            expect(mockBulkDelete).toHaveBeenCalledWith(expect.anything(), [1, 2]);
            expect(mockAddToast).toHaveBeenCalledWith(FUNDS_EXPENDITURES_TEXT.BULK.DELETE_SUCCESS, 'success');
        });
    });
});

const MOCK_LANG_EN: LocalizationLanguage = { id: 2, code: 'en', name: 'Англійська' };

const MOCK_LOCALIZATION_DTO: ReportFundsExpendituresSettingsLocalizationDto = {
    entityId: 1,
    disclaimerTitle: 'Financial report',
    localizationInfoDto: { id: 2, code: 'en' },
    translationStatus: TranslationStatus.Relevant,
};

describe('FundsExpenditureSection disclaimer localizations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupMockDataFetch();
        mockGetByEntityId.mockResolvedValue([]);
    });

    it('fetches disclaimer localizations on mount when settings are loaded', async () => {
        render(<FundsExpenditureSection />);

        await waitFor(() => {
            expect(mockGetByEntityId).toHaveBeenCalledWith(expect.anything(), MOCK_FUNDS_EXPENDITURES_SETTINGS.id);
        });
    });

    it('does not fetch disclaimer localizations when settings have no id', async () => {
        setupMockDataFetch(null);
        render(<FundsExpenditureSection />);

        await waitFor(() => {
            expect(mockGetByEntityId).not.toHaveBeenCalled();
        });
    });

    it('renders localization-statuses indicator when disclaimer is visible', async () => {
        render(<FundsExpenditureSection />);

        await waitFor(() => {
            expect(screen.getByTestId('localization-statuses')).toBeInTheDocument();
        });
    });

    it('passes fetched localizations to the indicator', async () => {
        mockGetByEntityId.mockResolvedValue([MOCK_LOCALIZATION_DTO]);

        render(<FundsExpenditureSection translationLanguages={[MOCK_LANG_EN]} />);

        await waitFor(() => {
            expect(screen.getByTestId('localization-statuses')).toHaveAttribute('data-status-count', '1');
        });
    });

    it('renders translate disclaimer modal closed by default', () => {
        render(<FundsExpenditureSection />);

        expect(screen.getByTestId('translate-disclaimer-modal')).toHaveAttribute('data-open', 'false');
    });

    it('passes existing localizations to the translate modal', async () => {
        mockGetByEntityId.mockResolvedValue([MOCK_LOCALIZATION_DTO]);

        render(<FundsExpenditureSection translationLanguages={[MOCK_LANG_EN]} />);

        await waitFor(() => {
            expect(screen.getByTestId('translate-disclaimer-modal')).toHaveAttribute('data-existing-count', '1');
        });
    });

    it('updates localization indicator when translate success fires', async () => {
        mockGetByEntityId.mockResolvedValue([]);

        render(<FundsExpenditureSection translationLanguages={[MOCK_LANG_EN]} />);

        await waitFor(() => {
            expect(screen.getByTestId('localization-statuses')).toHaveAttribute('data-status-count', '0');
        });

        const newLocalization = {
            disclaimerTitle: 'Financial report',
            language: { id: 2, code: 'en' },
            translationStatus: TranslationStatus.Relevant,
        };
        mockTranslateDisclaimerModalOnTranslateSuccess(newLocalization);

        await waitFor(() => {
            expect(screen.getByTestId('localization-statuses')).toHaveAttribute('data-status-count', '1');
        });
    });

    it('replaces localization in indicator when same language is re-translated', async () => {
        const outdatedDto: ReportFundsExpendituresSettingsLocalizationDto = {
            ...MOCK_LOCALIZATION_DTO,
            translationStatus: TranslationStatus.Outdated,
        };
        mockGetByEntityId.mockResolvedValue([outdatedDto]);

        render(<FundsExpenditureSection translationLanguages={[MOCK_LANG_EN]} />);

        await waitFor(() => {
            expect(screen.getByTestId('localization-statuses')).toHaveAttribute('data-status-count', '1');
        });

        const updatedLocalization = {
            disclaimerTitle: 'Updated report',
            language: { id: 2, code: 'en' },
            translationStatus: TranslationStatus.Relevant,
        };
        mockTranslateDisclaimerModalOnTranslateSuccess(updatedLocalization);

        await waitFor(() => {
            expect(screen.getByTestId('localization-statuses')).toHaveAttribute('data-status-count', '1');
        });
    });

    it('refetches disclaimer localizations after successful save via registerSaveCallback', async () => {
        let saveFn: (() => Promise<boolean>) | undefined;
        const registerSaveCallback = (fn: () => Promise<boolean>) => {
            saveFn = fn;
        };

        mockUpdateSettings.mockResolvedValueOnce({
            id: 1,
            disclaimerTitle: 'Updated disclaimer',
            exchangeRate: '44.00',
        });

        render(<FundsExpenditureSection isEditing registerSaveCallback={registerSaveCallback} />);

        await waitFor(() => {
            expect(mockGetByEntityId).toHaveBeenCalled();
        });
        const callsAfterMount = mockGetByEntityId.mock.calls.length;

        if (saveFn) {
            await saveFn();
        }

        await waitFor(() => {
            expect(mockGetByEntityId.mock.calls.length).toBeGreaterThan(callsAfterMount);
        });
    });

    it('does not refetch disclaimer localizations when save via registerSaveCallback fails', async () => {
        let saveFn: (() => Promise<boolean>) | undefined;
        const registerSaveCallback = (fn: () => Promise<boolean>) => {
            saveFn = fn;
        };

        mockUpdateSettings.mockRejectedValueOnce(new Error('publish failed'));

        render(<FundsExpenditureSection isEditing registerSaveCallback={registerSaveCallback} />);

        await waitFor(() => {
            expect(mockGetByEntityId).toHaveBeenCalled();
        });

        mockGetByEntityId.mockClear();
        if (saveFn) {
            await saveFn();
        }

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(REPORTS_TEXT.MESSAGE.FAIL_TO_UPDATE_REPORT, 'error');
        });

        expect(mockGetByEntityId).not.toHaveBeenCalled();
    });
});

describe('FundsExpenditureSection handleProgramYearSave', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupMockDataFetch();
        mockGetByEntityId.mockResolvedValue([]);
    });

    it('should call updateSettings with the new year and current settings values', async () => {
        mockUpdateSettings.mockResolvedValueOnce(MOCK_FUNDS_EXPENDITURES_SETTINGS);

        render(<FundsExpenditureSection />);
        fireEvent.click(screen.getByTestId('trigger-program-year-save'));

        await waitFor(() => {
            expect(mockUpdateSettings).toHaveBeenCalledWith(stableAdminClient, {
                disclaimerTitle: MOCK_FUNDS_EXPENDITURES_SETTINGS.disclaimerTitle,
                exchangeRate: MOCK_FUNDS_EXPENDITURES_SETTINGS.exchangeRate,
                programExpendituresReportingYear: 2024,
            });
        });
    });

    it('should show success toast after year is saved', async () => {
        mockUpdateSettings.mockResolvedValueOnce(MOCK_FUNDS_EXPENDITURES_SETTINGS);

        render(<FundsExpenditureSection />);
        fireEvent.click(screen.getByTestId('trigger-program-year-save'));

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(
                FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_UPDATED_SUCCESSFULLY,
                'success',
            );
        });
    });

    it('should show error toast when year save fails', async () => {
        mockUpdateSettings.mockRejectedValueOnce(new Error('update failed'));

        render(<FundsExpenditureSection />);
        fireEvent.click(screen.getByTestId('trigger-program-year-save'));

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(
                FUNDS_EXPENDITURES_TEXT.MESSAGE.RECORD_UPDATE_FAILED_RETRY,
                'error',
            );
        });
    });

    it('should use the newly saved year in saveSettings, not the stale settings value', async () => {
        let saveFn: (() => Promise<boolean>) | undefined;
        const registerSaveCallback = (fn: () => Promise<boolean>) => {
            saveFn = fn;
        };

        mockUpdateSettings.mockResolvedValueOnce(MOCK_FUNDS_EXPENDITURES_SETTINGS); // year save
        mockUpdateSettings.mockResolvedValueOnce(MOCK_FUNDS_EXPENDITURES_SETTINGS); // publish

        render(<FundsExpenditureSection isEditing registerSaveCallback={registerSaveCallback} />);
        const initialSaveFn = saveFn;

        fireEvent.click(screen.getByTestId('trigger-program-year-save'));

        await waitFor(() => {
            expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
            expect(saveFn).toBeDefined();
            expect(saveFn).not.toBe(initialSaveFn);
        });

        if (saveFn) {
            await saveFn();
        }

        await waitFor(() => expect(mockUpdateSettings).toHaveBeenCalledTimes(2));
        expect(mockUpdateSettings).toHaveBeenLastCalledWith(
            stableAdminClient,
            expect.objectContaining({ programExpendituresReportingYear: 2024 }),
        );
    });

    it('should call onExchangeRateValueChange with valid exchange rate', () => {
        const onExchangeRateValueChange = jest.fn();

        render(
            <FundsExpenditureSection
                isEditing
                draftExchangeRate="41.25"
                onExchangeRateValueChange={onExchangeRateValueChange}
            />,
        );

        fireEvent.click(screen.getByTestId('blur-rate'));

        expect(onExchangeRateValueChange).toHaveBeenCalledWith('41,25');
    });

    it('should call onExchangeRateValueChange with invalid exchange rate', () => {
        const onExchangeRateValueChange = jest.fn();

        render(
            <FundsExpenditureSection
                isEditing
                draftExchangeRate={null}
                onExchangeRateValueChange={onExchangeRateValueChange}
            />,
        );

        fireEvent.click(screen.getByTestId('change-rate-invalid'));

        expect(onExchangeRateValueChange).toHaveBeenCalledWith('abc');
    });
});

describe('FundsExpenditureSection fetch handler delegation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupMockDataFetch();
        mockGetByEntityId.mockResolvedValue([]);
    });

    it('fetchProgramSummary calls ProgramExpensesApi.getSummary with the admin client', async () => {
        const capturedFetchHandlers: Array<(opts?: object) => unknown> = [];
        // Wrap the slot-based impl so stable data refs are preserved (avoids infinite re-renders)
        const slotImpl = mockUseDataFetch.getMockImplementation()!;
        mockUseDataFetch.mockImplementation((props: any) => {
            capturedFetchHandlers.push(props.fetchHandler);
            return slotImpl(props);
        });

        mockProgramExpensesSummaryGet.mockResolvedValueOnce({ totalAmountUah: 500, totalAmountUsd: 200 });
        render(<FundsExpenditureSection />);

        // slot 4 = fetchProgramSummary (5th useDataFetch call in the component)
        const result = await capturedFetchHandlers[4]({});

        expect(mockProgramExpensesSummaryGet).toHaveBeenCalledWith(stableAdminClient, {});
        expect(result).toEqual({ totalAmountUah: 500, totalAmountUsd: 200 });
    });
});
