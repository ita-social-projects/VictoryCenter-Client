import { Metric, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { TranslationStatus } from '@/types/common/language';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { StatisticsPreview } from './StatisticsPreview';

const metrics: Metric[] = [
    {
        id: 1,
        name: 'Партнерів',
        value: 20,
        type: MetricType.Partners,
        prefix: MetricPrefix.Plus,
        isHidden: false,
        priority: 1,
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
        isHidden: false,
        priority: 2,
        localizations: [],
    },
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
});
