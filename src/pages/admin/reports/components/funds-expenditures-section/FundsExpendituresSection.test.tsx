import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FundsExpenditureSection } from './FundsExpendituresSection';
import { FUNDS_EXPENDITURES_TEXT, FUNDS_EXPENDITURES_VALIDATION, REPORTS_TEXT } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import {
    FundsExpendituresSummary,
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
    ReportFundsExpendituresSettings,
} from '@/types/admin/reports';

const MOCK_FUNDS_EXPENDITURES_SETTINGS: ReportFundsExpendituresSettings = {
    id: 1,
    disclaimerTitle: 'Фінансовий звіт Victory Center за поточний рік. Ми забезпечуємо прозорість кожної гривні.',
    exchangeRate: '42.18',
};

const MOCK_FUNDS_EXPENDITURES_CATEGORIES: ReportFundsExpendituresCategory[] = [
    { id: 1, name: 'Грантові кошти', type: 'income' },
    { id: 2, name: 'Благодійні внески', type: 'income' },
    { id: 3, name: 'Власні надходження', type: 'income' },
    { id: 4, name: 'Інші надходження', type: 'income' },
    { id: 5, name: 'Адміністративні витрати', type: 'expense' },
    { id: 6, name: 'Програмні витрати', type: 'expense' },
    { id: 7, name: 'Обладнання', type: 'expense' },
    { id: 8, name: 'Заробітна плата', type: 'expense' },
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
}));

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({}),
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
    }: {
        categories: { id: number; name: string }[];
        selectedCategoryId: number | null | undefined;
        exchangeRate: string | null;
        isEditing: boolean;
        isAddIncomeDisabled: boolean;
        isAddExpenseDisabled: boolean;
        onTypeChange: (v: unknown) => void;
        onCategoryChange: (v: unknown) => void;
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
        </div>
    ),
}));

jest.mock('./components/funds-expenditures-table/FundsExpendituresTable', () => ({
    FundsExpendituresTable: ({
        records,
        isEditing,
        onRecordSave,
    }: {
        records: unknown[];
        isEditing?: boolean;
        onRecordSave?: (recordId: number, data: { categoryId: number; amountUah: string; amountUsd: string }) => void;
    }) => (
        <div data-testid="funds-table" data-record-count={records.length} data-editing={String(isEditing ?? false)}>
            <button
                data-testid="trigger-record-save"
                onClick={() =>
                    onRecordSave?.(1, {
                        categoryId: 1,
                        amountUah: '7300',
                        amountUsd: '173.81',
                    })
                }
            >
                Save row
            </button>
        </div>
    ),
}));

const mockUpdateRecord = jest.fn();
jest.mock('@/services/api/admin/reports/funds-expenditures-api', () => ({
    FundsExpendituresApi: {
        getSettings: jest.fn(),
        getCategories: jest.fn(),
        getRecords: jest.fn(),
        getSummary: jest.fn(),
        updateSettings: jest.fn(),
        updateRecord: (...args: unknown[]) => mockUpdateRecord(...args),
    },
}));

const setupMockDataFetch = (
    settings: ReportFundsExpendituresSettings | null = MOCK_FUNDS_EXPENDITURES_SETTINGS,
    categories: ReportFundsExpendituresCategory[] = MOCK_FUNDS_EXPENDITURES_CATEGORIES,
    records: ReportFundsExpendituresRecord[] = MOCK_FUNDS_EXPENDITURES_RECORDS,
    summary: FundsExpendituresSummary = MOCK_FUNDS_EXPENDITURES_SUMMARY,
    loadingBySlot: Partial<Record<number, boolean>> = {},
) => {
    let callIndex = 0;
    mockUseDataFetch.mockImplementation(({ initialData }: { initialData: unknown }) => {
        const callOrder = callIndex++;
        const slot = callOrder % 4;
        const slotDataMap: Record<number, unknown> = { 0: settings, 1: categories, 2: records, 3: summary };
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
        expect(mockAddToast).toHaveBeenCalledWith(REPORTS_TEXT.MESSAGE.RECORD_UPDATED_SUCCESSFULLY, 'success');
    });

    it('should show retry error toast when record save fails', async () => {
        mockUpdateRecord.mockRejectedValueOnce(new Error('save failed'));

        render(<FundsExpenditureSection />);

        fireEvent.click(screen.getByTestId('trigger-record-save'));

        await screen.findByTestId('funds-table');
        expect(mockAddToast).toHaveBeenCalledWith(REPORTS_TEXT.MESSAGE.RECORD_UPDATE_FAILED_RETRY, 'error');
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
        setupMockDataFetch({ id: 1, disclaimerTitle: null, exchangeRate: '42.18' });
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

        it('should hide edit button while editing', () => {
            render(<FundsExpenditureSection />);
            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT));
            expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT)).not.toBeInTheDocument();
        });

        it('should return to non-editing state when cancel is clicked', () => {
            render(<FundsExpenditureSection />);
            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT));
            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.CANCEL));
            expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-editing', 'false');
        });

        it('should show edit button again after cancel', () => {
            render(<FundsExpenditureSection />);
            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT));
            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.CANCEL));
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
        const getPublishButton = () => screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.PUBLISH);

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

        it('should disable publish button when disclaimer is empty', () => {
            setupMockDataFetch({ id: 1, disclaimerTitle: null, exchangeRate: '42' });
            render(<FundsExpenditureSection />);
            enterEditMode();
            expect(getPublishButton()).toBeDisabled();
        });

        it('should disable publish button when disclaimer has only 1 character', () => {
            render(<FundsExpenditureSection />);
            enterEditMode();
            fireEvent.change(getTextarea(), { target: { value: 'a' } });
            expect(getPublishButton()).toBeDisabled();
        });

        it('should enable publish button when disclaimer has at least 2 characters', () => {
            render(<FundsExpenditureSection />);
            enterEditMode();
            fireEvent.change(getTextarea(), { target: { value: 'ok' } });
            expect(getPublishButton()).not.toBeDisabled();
        });

        it('should enable publish button when disclaimer already has a valid value from settings', () => {
            render(<FundsExpenditureSection />);
            enterEditMode();
            expect(getPublishButton()).not.toBeDisabled();
        });

        it('should disable publish button after a blur validation error', () => {
            render(<FundsExpenditureSection />);
            enterEditMode();
            fireEvent.change(getTextarea(), { target: { value: 'a' } });
            fireEvent.blur(getTextarea());
            expect(getPublishButton()).toBeDisabled();
        });

        it('should reset disclaimer error when cancel is clicked', () => {
            render(<FundsExpenditureSection />);
            enterEditMode();
            fireEvent.change(getTextarea(), { target: { value: '' } });
            fireEvent.blur(getTextarea());
            expect(screen.getByTestId('error-funds-disclaimer')).toBeInTheDocument();

            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.CANCEL));
            fireEvent.click(screen.getByText(FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT));
            expect(screen.queryByTestId('error-funds-disclaimer')).not.toBeInTheDocument();
        });
    });
});
