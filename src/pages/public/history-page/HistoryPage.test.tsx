import { render, screen, waitFor } from '@testing-library/react';
import { HistoryPage } from './HistoryPage';
import { PublicHistoryApi } from '@/services/api/public/history/history-api';
import { HistorySection as HistorySectionComponent } from './history-section/HistorySection';
import { SectionTemplate } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';
import { HistorySection } from '@/types/public/history-page';

jest.mock('@/services/api/public/history/history-api');
jest.mock('./history-hero/HistoryHero', () => ({
    HistoryHero: () => <div data-testid="history-hero" />,
}));
jest.mock('./history-section/HistorySection');
jest.mock('./history-quote/HistoryQuote', () => ({
    HistoryQuote: () => <div data-testid="history-quote" />,
}));

const MockedHistorySection = HistorySectionComponent as jest.Mock;

const makeSection = (id: number, order: number, year: string | null = null): HistorySection => ({
    id,
    template: SectionTemplate.TextOnly,
    order,
    contents: [
        {
            id: id * 10,
            contentType: ContentType.Title,
            order: 0,
            title: year ? `${year} — Текст` : null,
            description: null,
            image: null,
            localizations: [],
        },
    ],
});

describe('HistoryPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        MockedHistorySection.mockImplementation(({ section }) => <div data-testid={`section-${section.id}`} />);
    });

    it('should show loader while data is loading', () => {
        (PublicHistoryApi.getSections as jest.Mock).mockImplementation(() => new Promise(() => {}));

        render(<HistoryPage />);

        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should show error state when API call fails', async () => {
        (PublicHistoryApi.getSections as jest.Mock).mockRejectedValue(new Error('fetch error'));

        render(<HistoryPage />);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });

    it('should render hero, timeline, sections and quote when data loads', async () => {
        (PublicHistoryApi.getSections as jest.Mock).mockResolvedValue([makeSection(1, 0)]);

        render(<HistoryPage />);

        await waitFor(() => {
            expect(screen.getByTestId('history-hero')).toBeInTheDocument();
            expect(screen.getByTestId('section-1')).toBeInTheDocument();
            expect(screen.getByTestId('history-quote')).toBeInTheDocument();
        });
    });

    it('should render sections sorted by order', async () => {
        const sections = [makeSection(3, 2), makeSection(1, 0), makeSection(2, 1)];
        (PublicHistoryApi.getSections as jest.Mock).mockResolvedValue(sections);

        render(<HistoryPage />);

        await waitFor(() => {
            const calls = MockedHistorySection.mock.calls.map((call) => call[0].section.id);
            expect(calls).toEqual([1, 2, 3]);
        });
    });

    it('should show year label only for first section with a given year', async () => {
        const sections = [makeSection(1, 0, '2024'), makeSection(2, 1, '2024'), makeSection(3, 2, '2025')];
        (PublicHistoryApi.getSections as jest.Mock).mockResolvedValue(sections);

        render(<HistoryPage />);

        await waitFor(() => {
            const calls = MockedHistorySection.mock.calls;
            const [first, second, third] = calls.map((call) => call[0]);

            expect(first.showYearLabel).toBe(true);
            expect(second.showYearLabel).toBe(false);
            expect(third.showYearLabel).toBe(true);
        });
    });

    it('should render nothing in sections list when API returns empty array', async () => {
        (PublicHistoryApi.getSections as jest.Mock).mockResolvedValue([]);

        render(<HistoryPage />);

        await waitFor(() => {
            expect(MockedHistorySection).not.toHaveBeenCalled();
            expect(screen.getByTestId('history-hero')).toBeInTheDocument();
        });
    });

    it('should use array index as key when section id is undefined', async () => {
        const sectionWithoutId = { ...makeSection(1, 0), id: undefined as unknown as number };
        (PublicHistoryApi.getSections as jest.Mock).mockResolvedValue([sectionWithoutId]);

        render(<HistoryPage />);

        await waitFor(() => {
            expect(MockedHistorySection).toHaveBeenCalledTimes(1);
            expect(screen.getByTestId('section-undefined')).toBeInTheDocument();
        });
    });
});
