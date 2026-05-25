import { Metric } from '@/types/admin/main-page';
import { metricEngagement, metricPartners } from '@/utils/test-mocks/statistics-block-mocks';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { StatisticsPreview } from './StatisticsPreview';

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
        render(<StatisticsPreview language="UA" onLanguageChange={() => {}} metrics={metrics} hiddenMetricIds={[2]} />);

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
