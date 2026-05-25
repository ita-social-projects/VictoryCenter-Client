import { Metric, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { TranslationStatus } from '@/types/common/language';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { StatisticsMetricsList } from './StatisticsMetricsList';

jest.mock('@/components/admin/draggable-list-item/DraggableListItem', () => ({
    DraggableListItem: ({ renderEntityComponent, entity }: any) => (
        <div data-testid="draggable-row">{renderEntityComponent(entity)}</div>
    ),
}));

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
        ],
    },
    {
        id: 2,
        name: 'Engagement',
        value: 50,
        type: MetricType.Partners,
        prefix: MetricPrefix.Percent,
        isHidden: false,
        priority: 2,
        localizations: [],
    },
];

describe('StatisticsMetricsList', () => {
    it('renders metrics list', () => {
        render(
            <StatisticsMetricsList
                metrics={metrics}
                hiddenMetricIds={[]}
                onToggleVisibility={jest.fn()}
                onReorder={jest.fn()}
            />,
        );

        expect(screen.getByText('Партнерів')).toBeInTheDocument();
        expect(screen.getByText('20+')).toBeInTheDocument();
    });

    it('falls back to metric name when localization is missing', () => {
        render(
            <StatisticsMetricsList
                metrics={metrics}
                hiddenMetricIds={[]}
                onToggleVisibility={jest.fn()}
                onReorder={jest.fn()}
            />,
        );

        expect(screen.getByText('Engagement')).toBeInTheDocument();
    });

    it('formats percent values', () => {
        render(
            <StatisticsMetricsList
                metrics={metrics}
                hiddenMetricIds={[]}
                onToggleVisibility={jest.fn()}
                onReorder={jest.fn()}
            />,
        );

        expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('uses "Show metric" label when metric is hidden', () => {
        render(
            <StatisticsMetricsList
                metrics={metrics}
                hiddenMetricIds={[2]}
                onToggleVisibility={jest.fn()}
                onReorder={jest.fn()}
            />,
        );

        expect(screen.getByLabelText('Show metric')).toBeInTheDocument();
    });

    it('calls onToggleVisibility on eye click', () => {
        const onToggleVisibility = jest.fn();
        render(
            <StatisticsMetricsList
                metrics={metrics}
                hiddenMetricIds={[]}
                onToggleVisibility={onToggleVisibility}
                onReorder={jest.fn()}
            />,
        );

        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[1]); // eye button
        expect(onToggleVisibility).toHaveBeenCalledWith(1);
    });

    it('does not call onToggleVisibility when metric id is missing', () => {
        const onToggleVisibility = jest.fn();
        render(
            <StatisticsMetricsList
                metrics={[{ ...metrics[0], id: undefined } as Metric]}
                hiddenMetricIds={[]}
                onToggleVisibility={onToggleVisibility}
                onReorder={jest.fn()}
            />,
        );

        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[1]);
        expect(onToggleVisibility).not.toHaveBeenCalled();
    });

    it('formats value with no prefix (default case)', () => {
        const noPrefix: Metric = {
            ...metrics[0],
            id: 3,
            value: 100,
            prefix: undefined,
            localizations: [],
            name: 'NoPrefix',
        };
        render(
            <StatisticsMetricsList
                metrics={[noPrefix]}
                hiddenMetricIds={[]}
                onToggleVisibility={jest.fn()}
                onReorder={jest.fn()}
            />,
        );
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('disables toggle button for last visible metric', () => {
        render(
            <StatisticsMetricsList
                metrics={[metrics[0]]}
                hiddenMetricIds={[]}
                onToggleVisibility={jest.fn()}
                onReorder={jest.fn()}
            />,
        );
        const buttons = screen.getAllByRole('button');
        const eyeButton = buttons[1];
        expect(eyeButton).toBeDisabled();
    });
});
