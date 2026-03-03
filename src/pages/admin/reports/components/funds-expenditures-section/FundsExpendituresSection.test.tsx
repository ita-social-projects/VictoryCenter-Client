import { render, screen } from '@testing-library/react';
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
    disclaimerLabel: 'disclaimerLabel',
    disclaimerTextArea: 'disclaimerTextArea',
    disclaimerText: 'disclaimerText',
    summaryCards: 'summaryCards',
}));

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({}),
}));

// Mock useDataFetch to return the data synchronously
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
            {count !== undefined ? <span data-testid="count">{count}</span> : null}
            {uah !== undefined ? <span data-testid="uah">{uah}</span> : null}
            {usd !== undefined ? <span data-testid="usd">{usd}</span> : null}
        </div>
    ),
}));

jest.mock('./components/funds-expenditures-toolbar/FundsExpendituresToolbar', () => ({
    FundsExpendituresToolbar: ({
        exchangeRate,
        onTypeChange,
        onCategoryChange,
    }: {
        categories: unknown[];
        selectedType: unknown;
        selectedCategoryId: unknown;
        exchangeRate: string | null;
        onTypeChange: (v: unknown) => void;
        onCategoryChange: (v: unknown) => void;
    }) => (
        <div data-testid="funds-toolbar">
            <span data-testid="exchange-rate">{exchangeRate}</span>
            <button onClick={() => onTypeChange('income')} data-testid="filter-income">
                Filter Income
            </button>
            <button onClick={() => onCategoryChange(1)} data-testid="filter-cat-1">
                Filter Cat 1
            </button>
        </div>
    ),
}));

jest.mock('./components/funds-expenditures-table/FundsExpendituresTable', () => ({
    FundsExpendituresTable: ({ records }: { records: unknown[] }) => (
        <div data-testid="funds-table" data-record-count={records.length} />
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
        // 0 = settings, 1 = categories, 2 = records
        const data = callOrder === 0 ? settings : callOrder === 1 ? categories : records;
        return { data: data ?? initialData, isLoading: false, error: null, refetch: jest.fn() };
    });
};

describe('FundsExpenditureSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupMockDataFetch();
    });

    it('should render the disclaimer text', () => {
        render(<FundsExpenditureSection isEditing={false} />);
        expect(screen.getByText(MOCK_FUNDS_EXPENDITURES_SETTINGS.disclaimerTitle!)).toBeInTheDocument();
    });

    it('should render the disclaimer label', () => {
        render(<FundsExpenditureSection isEditing={false} />);
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.DISCLAIMER_LABEL)).toBeInTheDocument();
    });

    it('should render four summary cards', () => {
        render(<FundsExpenditureSection isEditing={false} />);
        const cards = screen.getAllByTestId('summary-card');
        expect(cards).toHaveLength(4);
    });

    it('should render the "Зібрано коштів" summary card', () => {
        render(<FundsExpenditureSection isEditing={false} />);
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.COLLECTED)).toBeInTheDocument();
    });

    it('should render the "Витрачено коштів" summary card', () => {
        render(<FundsExpenditureSection isEditing={false} />);
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.SPENT)).toBeInTheDocument();
    });

    it('should render "Категорії надходжень" summary card', () => {
        render(<FundsExpenditureSection isEditing={false} />);
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.INCOME_CATEGORIES)).toBeInTheDocument();
    });

    it('should render "Категорії витрат" summary card', () => {
        render(<FundsExpenditureSection isEditing={false} />);
        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.SUMMARY_CARDS.EXPENSE_CATEGORIES)).toBeInTheDocument();
    });

    it('should render the toolbar with exchange rate', () => {
        render(<FundsExpenditureSection isEditing={false} />);
        expect(screen.getByTestId('funds-toolbar')).toBeInTheDocument();
        expect(screen.getByTestId('exchange-rate')).toHaveTextContent(MOCK_FUNDS_EXPENDITURES_SETTINGS.exchangeRate!);
    });

    it('should render the table', () => {
        render(<FundsExpenditureSection isEditing={false} />);
        expect(screen.getByTestId('funds-table')).toBeInTheDocument();
    });

    it('should pass all enriched records to the table initially', () => {
        render(<FundsExpenditureSection isEditing={false} />);
        const table = screen.getByTestId('funds-table');
        expect(table).toHaveAttribute('data-record-count', String(MOCK_FUNDS_EXPENDITURES_RECORDS.length));
    });

    it('should not render disclaimer if settings have no disclaimerTitle', () => {
        setupMockDataFetch({ id: 1, disclaimerTitle: null, exchangeRate: '42.18' });
        render(<FundsExpenditureSection isEditing={false} />);
        expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.DISCLAIMER_LABEL)).not.toBeInTheDocument();
    });
});
