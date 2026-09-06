import { Metric } from '@/types/admin/main-page';
import { metricEngagement, metricPartners, metricRaised } from '@/utils/test-mocks/statistics-block-mocks';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { StatisticsPreview } from '@/pages/admin/main/components/statistics-block/components/statistics-preview/StatisticsPreview';

const metrics: Metric[] = [metricPartners, metricEngagement];

describe('StatisticsPreview', () => {
    it('renders preview title and metrics', () => {
        render(<StatisticsPreview language="UA" onLanguageChange={() => {}} metrics={metrics} hiddenMetricIds={[]} />);

        expect(screen.getByText(/preview/i)).toBeInTheDocument();
        expect(screen.getByText('Партнерів')).toBeInTheDocument();
        expect(screen.getByText('20+')).toBeInTheDocument();
    });

    it('falls back to metric name when localization is missing', () => {
        render(<StatisticsPreview language="EN" onLanguageChange={() => {}} metrics={metrics} hiddenMetricIds={[]} />);

        expect(screen.getByText('Engagement')).toBeInTheDocument();
    });

    it('formats percent values', () => {
        render(<StatisticsPreview language="EN" onLanguageChange={() => {}} metrics={metrics} hiddenMetricIds={[]} />);

        expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it.each([
        [1234600, '1234600', '1 234 600 грн', '$1 234 600'],
        [5000000.5, '125000.75', '5 000 000,5 грн', '$125 000.75'],
        [0, '0', '0 грн', '$0'],
    ])('formats raised funds with currency when switching languages (%s UAH)', (value, usdValue, uaText, enText) => {
        const raisedMetric: Metric = {
            ...metricRaised,
            value,
            localizations: metricRaised.localizations.map((localization) => ({ ...localization, value: usdValue })),
        };
        const props = {
            onLanguageChange: jest.fn(),
            metrics: [raisedMetric],
            hiddenMetricIds: [],
        };
        const { rerender } = render(<StatisticsPreview {...props} language="UA" />);

        expect(screen.getByText(uaText)).toBeInTheDocument();

        rerender(<StatisticsPreview {...props} language="EN" />);

        expect(screen.getByText(enText)).toBeInTheDocument();
        expect(screen.queryByText(uaText)).not.toBeInTheDocument();
    });

    it('switches language when tab is clicked', () => {
        const onLanguageChange = jest.fn();
        render(
            <StatisticsPreview
                language="UA"
                onLanguageChange={onLanguageChange}
                metrics={metrics}
                hiddenMetricIds={[]}
            />,
        );

        fireEvent.click(screen.getByText('ENG'));
        expect(onLanguageChange).toHaveBeenCalledWith('EN');
    });

    it('switches to UA language when UA tab is clicked', () => {
        const onLanguageChange = jest.fn();
        render(
            <StatisticsPreview
                language="EN"
                onLanguageChange={onLanguageChange}
                metrics={metrics}
                hiddenMetricIds={[]}
            />,
        );

        fireEvent.click(screen.getByText('UKR'));
        expect(onLanguageChange).toHaveBeenCalledWith('UA');
    });

    it('hides metrics by hiddenMetricIds', () => {
        render(
            <StatisticsPreview
                language="UA"
                onLanguageChange={() => {}}
                metrics={metrics}
                hiddenMetricIds={[metricEngagement.id ?? 0]}
            />,
        );

        expect(screen.getByText('Партнерів')).toBeInTheDocument();
        expect(screen.queryByText('Engagement')).not.toBeInTheDocument();
    });

    it('shows EN localization name when language is EN', () => {
        render(<StatisticsPreview language="EN" onLanguageChange={() => {}} metrics={metrics} hiddenMetricIds={[]} />);
        expect(screen.getByText('Partners')).toBeInTheDocument();
    });

    it('formats value with no prefix (default case)', () => {
        const noPrefix: Metric = {
            ...metrics[0],
            id: 3,
            value: 999,
            prefix: undefined,
            name: 'NoPrefix',
            localizations: [],
        };
        render(
            <StatisticsPreview language="UA" onLanguageChange={() => {}} metrics={[noPrefix]} hiddenMetricIds={[]} />,
        );
        expect(screen.getByText('999')).toBeInTheDocument();
    });

    it('hides metrics when id is undefined and hiddenMetricIds includes fallback 0', () => {
        const noIdMetric: Metric = {
            ...metrics[0],
            id: undefined,
            name: 'NoIdMetric',
            localizations: [],
        };

        render(
            <StatisticsPreview
                language="UA"
                onLanguageChange={() => {}}
                metrics={[noIdMetric]}
                hiddenMetricIds={[0]}
            />,
        );

        expect(screen.queryByText('NoIdMetric')).not.toBeInTheDocument();
    });
});
