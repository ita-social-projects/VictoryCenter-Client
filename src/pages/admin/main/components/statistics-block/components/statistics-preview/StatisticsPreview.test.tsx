import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatisticsPreview } from './StatisticsPreview';
import { Metric, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { TranslationStatus } from '@/types/common/language';

const metrics: Metric[] = [
    {
        id: 1,
        name: 'Партнерів',
        value: 20,
        type: MetricType.Partners,
        prefix: MetricPrefix.Plus,
        localizations: [
            { language: { id: 1, code: 'uk' }, translationStatus: TranslationStatus.Relevant, name: 'Партнерів' },
            { language: { id: 2, code: 'en' }, translationStatus: TranslationStatus.Relevant, name: 'Partners' },
        ],
    },
    {
        id: 2,
        name: 'Engagement',
        value: 50,
        type: MetricType.Programs,
        prefix: MetricPrefix.Percent,
        localizations: [],
    } as Metric,
];

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

    it('hides metrics by hiddenMetricIds', () => {
        render(<StatisticsPreview language="UA" onLanguageChange={() => {}} metrics={metrics} hiddenMetricIds={[2]} />);

        expect(screen.getByText('Партнерів')).toBeInTheDocument();
        expect(screen.queryByText('Engagement')).not.toBeInTheDocument();
    });
});
