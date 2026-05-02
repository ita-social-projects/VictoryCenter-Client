import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatisticsMetricsList } from './StatisticsMetricsList';
import { Metric, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { TranslationStatus } from '@/types/common/language';

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
        localizations: [
            { language: { id: 1, code: 'uk' }, translationStatus: TranslationStatus.Relevant, name: 'Партнерів' },
        ],
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
});
