import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FundsExpenditureSection } from './FundsExpendituresSection';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import {
    MOCK_FUNDS_EXPENDITURES_CATEGORIES,
    MOCK_FUNDS_EXPENDITURES_RECORDS,
    MOCK_FUNDS_EXPENDITURES_SETTINGS,
} from '@/utils/mock-data/admin/funds-expenditures-mock';
import {
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
    ReportFundsExpendituresSettings,
} from '@/types/admin/reports';

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

jest.mock(
    '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup',
    () => ({
        TextAreaWithCharacterLimitGroup: ({
            id,
            label,
            value,
            onChange,
        }: {
            id: string;
            label: string;
            value: string;
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
        }) => (
            <div data-testid={`textarea-group-${id}`}>
                <label>{label}</label>
                <textarea data-testid={`textarea-${id}`} value={value} onChange={onChange} />
            </div>
        ),
    }),
);

const mockUseDataFetch = jest.fn();
jest.mock('@/hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: (props: { initialData: unknown }) => mockUseDataFetch(props),
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
        selectedType: unknown;
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
    FundsExpendituresTable: ({ records, isEditing }: { records: unknown[]; isEditing?: boolean }) => (
        <div data-testid="funds-table" data-record-count={records.length} data-editing={String(isEditing ?? false)} />
    ),
}));

const setupMockDataFetch = (
    settings: ReportFundsExpendituresSettings | null = MOCK_FUNDS_EXPENDITURES_SETTINGS,
    categories: ReportFundsExpendituresCategory[] = MOCK_FUNDS_EXPENDITURES_CATEGORIES,
    records: ReportFundsExpendituresRecord[] = MOCK_FUNDS_EXPENDITURES_RECORDS,
) => {
    let callIndex = 0;
    mockUseDataFetch.mockImplementation(({ initialData }: { initialData: unknown }) => {
        const callOrder = callIndex++;
        const slot = callOrder % 3;
        const slotDataMap: Record<number, unknown> = { 0: settings, 1: categories, 2: records };
        const data = slotDataMap[slot];
        return { data: data ?? initialData, isLoading: false, error: null, refetch: jest.fn() };
    });
};

describe('FundsExpenditureSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupMockDataFetch();
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

        expect(table).toHaveAttribute('data-record-count', '5');
    });

    it('should filter records by category when category filter is applied', () => {
        render(<FundsExpenditureSection />);

        fireEvent.click(screen.getByTestId('filter-cat-1'));

        const table = screen.getByTestId('funds-table');
        expect(table).toHaveAttribute('data-record-count', '2');
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

        expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-category-count', '7');
    });

    it('should pass all categories to toolbar when expense type is selected', () => {
        render(<FundsExpenditureSection />);

        fireEvent.click(screen.getByTestId('filter-expense'));

        expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-category-count', '7');
    });

    it('should pass all categories to toolbar when no type is selected', () => {
        render(<FundsExpenditureSection />);

        expect(screen.getByTestId('funds-toolbar')).toHaveAttribute('data-category-count', '7');
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
});
