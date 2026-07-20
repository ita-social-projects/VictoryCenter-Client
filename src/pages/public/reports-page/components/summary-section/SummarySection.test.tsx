import React from 'react';
import { render, screen } from '@testing-library/react';
import { SummarySection } from './SummarySection';
import { useLocale } from '@/hooks/common/use-locale/useLocale';

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: jest.fn(),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('@/services/api/public/localization/languages/languages-api', () => ({
    localizationLanguagesDataFetch: jest.fn(),
}));

jest.mock('@/services/api/public/reports/reports-api', () => ({
    ReportsPublicApi: {
        getPublishedReports: jest.fn(),
    },
}));

const mockLocalizationLanguagesDataFetch = require('@/services/api/public/localization/languages/languages-api').localizationLanguagesDataFetch;
const mockGetPublishedReports = require('@/services/api/public/reports/reports-api').ReportsPublicApi.getPublishedReports;

const MOCK_DATA = {
    funding: { totalUah: 100000, totalUsd: 2352.94, items: [{ label: 'Funding 1', amountUah: 20, amountUsd: 0.47 }] },
    expenses: { totalUah: 10, totalUsd: 0.24, items: [{ label: 'Expense 1', amountUah: 10, amountUsd: 0.24 }] },
    programs: { items: [{ label: 'Program 1', amountUah: 30, amountUsd: 0.71 }] },
    settings: { disclaimerTitle: 'Test currency disclaimer text' },
    mediaSettings: {
        collectedFunds: { title: 'Зібрано', imageUrl: null },
        changedLives: { title: 'Змінених життів', imageUrl: null, value: 205 }
    }
};

jest.mock('./stat-card', () => ({
    StatCard: ({ label, value, currency, formattedValue }: any) => (
        <div data-testid="stat-card">
            {label}: {formattedValue !== undefined ? formattedValue : `${value} ${currency ?? ''}`}
        </div>
    ),
}));

jest.mock('./expenses-breakdown-chart', () => ({
    ExpensesBreakdownChart: ({ items, formatAmount }: any) => (
        <div data-testid="expenses-chart">
            {JSON.stringify(items)}
            {items[0] ? formatAmount(items[0].amount) : ''}
        </div>
    ),
}));

jest.mock('./funding-sources-chart', () => ({
    FundingSourcesChart: ({ items, formatAmount }: any) => (
        <div data-testid="funding-chart">
            {JSON.stringify(items)}
            {items[0] ? formatAmount(items[0].amount) : ''}
        </div>
    ),
}));

jest.mock('./programs-allocation-chart', () => ({
    ProgramsAllocationChart: ({ items, formatAmount }: any) => (
        <div data-testid="programs-chart">
            {JSON.stringify(items)}
            {items[0] ? formatAmount(items[0].amount) : ''}
        </div>
    ),
}));

const mockUseLocale = useLocale as jest.Mock;

describe('SummarySection', () => {
    beforeEach(() => {
        mockUseLocale.mockReturnValue({ isEn: false, currentLanguage: 'uk' });
        mockLocalizationLanguagesDataFetch.mockResolvedValue([{ id: 1, code: 'uk' }, { id: 2, code: 'en' }]);
        mockGetPublishedReports.mockResolvedValue(MOCK_DATA);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders collected stat card with UAH currency by default', async () => {
        render(<SummarySection />);

        const cards = await screen.findAllByTestId('stat-card');
        expect(cards[0]).toHaveTextContent('Зібрано: 100 000 грн');
    });

    it('renders collected stat card with pre-formatted USD value when English is active', async () => {
        mockUseLocale.mockReturnValue({ isEn: true, currentLanguage: 'en' });

        render(<SummarySection />);

        const cards = await screen.findAllByTestId('stat-card');
        expect(cards[0]).toHaveTextContent('Зібрано: 2 352 USD');
    });

    it('renders lives changed card with static data', async () => {
        render(<SummarySection />);

        const cards = await screen.findAllByTestId('stat-card');
        expect(cards[1]).toHaveTextContent('Змінених життів: 205');
    });

    it('does not render disclaimer when UAH is active', async () => {
        mockUseLocale.mockReturnValue({ isEn: false, currentLanguage: 'uk' });
        mockGetPublishedReports.mockResolvedValue({ ...MOCK_DATA, settings: { disclaimerTitle: null } });

        render(<SummarySection />);

        await screen.findAllByTestId('stat-card');
        expect(screen.queryByText('Test currency disclaimer text')).not.toBeInTheDocument();
    });

    it('renders disclaimer for the report summary', async () => {
        mockUseLocale.mockReturnValue({ isEn: true, currentLanguage: 'en' });

        render(<SummarySection />);

        expect(await screen.findByText('Test currency disclaimer text')).toBeInTheDocument();
    });

    it('does not render disclaimer when English is active but disclaimer text is missing', async () => {
        mockUseLocale.mockReturnValue({ isEn: true, currentLanguage: 'en' });
        mockGetPublishedReports.mockResolvedValue({ ...MOCK_DATA, settings: { disclaimerTitle: null } });

        render(<SummarySection />);

        await screen.findAllByTestId('stat-card');
        expect(screen.queryByText('Test currency disclaimer text')).not.toBeInTheDocument();
    });

    it('passes correct data to Expenses chart', async () => {
        render(<SummarySection />);

        const chart = await screen.findByTestId('expenses-chart');
        const expectedData = [{ label: 'Expense 1', amountUah: 10, amountUsd: 0.24, amount: 10, percent: 100 }];
        expect(chart).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('passes correct data to Funding chart', async () => {
        render(<SummarySection />);

        const chart = await screen.findByTestId('funding-chart');
        const expectedData = [{ label: 'Funding 1', amountUah: 20, amountUsd: 0.47, amount: 20 }];
        expect(chart).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('passes correct data to Programs chart', async () => {
        render(<SummarySection />);

        const chart = await screen.findByTestId('programs-chart');
        const expectedData = [{ label: 'Program 1', amountUah: 30, amountUsd: 0.71, amount: 30 }];
        expect(chart).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('renders error message when API returns non-404 error', async () => {
        mockGetPublishedReports.mockRejectedValue(new Error('Network error'));
        render(<SummarySection />);
        expect(await screen.findByText('summary.error')).toBeInTheDocument();
    });

    it('calculates 0 percent when totalExpenses is 0', async () => {
        mockGetPublishedReports.mockResolvedValue({
            ...MOCK_DATA,
            expenses: { totalUah: 0, totalUsd: 0, items: [{ label: 'Expense 1', amountUah: 0, amountUsd: 0 }] }
        });
        render(<SummarySection />);

        const chart = await screen.findByTestId('expenses-chart');
        const expectedData = [{ label: 'Expense 1', amountUah: 0, amountUsd: 0, amount: 0, percent: 0 }];
        expect(chart).toHaveTextContent(JSON.stringify(expectedData));
    });

    it('uses fallback titles for collected and changed lives when missing', async () => {
        mockGetPublishedReports.mockResolvedValue({
            ...MOCK_DATA,
            mediaSettings: {
                collectedFunds: { title: '', imageUrl: null },
                changedLives: { title: '', imageUrl: null, value: 0 }
            }
        });
        render(<SummarySection />);

        const cards = await screen.findAllByTestId('stat-card');
        expect(cards[0]).toHaveTextContent('summary.collected: 100 000 грн');
        expect(cards[1]).toHaveTextContent('summary.lives: 0');
    });

    it('handles when language is not found gracefully', async () => {
        mockLocalizationLanguagesDataFetch.mockResolvedValue([{ id: 1, code: 'fr' }]); // No en or uk
        render(<SummarySection />);
        expect(screen.queryByText('summary.error')).not.toBeInTheDocument();
    });
});
