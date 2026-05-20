import { Metric, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { TranslationStatus } from '@/types/common/language';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { StatisticsMetricsList } from './StatisticsMetricsList';

jest.mock('@/components/admin/draggable-list-item/DraggableListItem', () => ({
    DraggableListItem: ({ renderEntityComponent, entity, idSelector }: any) => {
        const id = idSelector?.(entity);
        return (
            <div data-testid="draggable-row" data-entity-id={id}>
                {renderEntityComponent(entity)}
            </div>
        );
    },
}));

jest.mock('@/components/admin/icon-button/IconButton', () => ({
    IconButton: ({ onClick, disabled, 'aria-label': ariaLabel }: any) => (
        <button
            type="button"
            data-testid={ariaLabel ? `icon-${ariaLabel}` : 'icon-edit'}
            aria-label={ariaLabel}
            onClick={onClick}
            disabled={disabled}
        />
    ),
}));

jest.mock('../statistics-metric-edit-panel/StatisticsMetricEditPanel', () => ({
    StatisticsMetricEditPanel: ({ metric, onSave, onCancel }: any) => (
        <div data-testid="metric-edit-panel">
            <button
                type="button"
                data-testid="save-edit"
                onClick={() => onSave({ ...metric, name: 'Updated Metric' })}
            />
            <button type="button" data-testid="cancel-edit" onClick={onCancel} />
        </div>
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
                onMetricUpdate={jest.fn()}
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
                onMetricUpdate={jest.fn()}
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
                onMetricUpdate={jest.fn()}
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
                onMetricUpdate={jest.fn()}
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
                onMetricUpdate={jest.fn()}
            />,
        );

        fireEvent.click(screen.getAllByTestId('icon-Hide metric')[0]);
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
                onMetricUpdate={jest.fn()}
            />,
        );

        fireEvent.click(screen.getByTestId('icon-Hide metric'));
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
                onMetricUpdate={jest.fn()}
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
                onMetricUpdate={jest.fn()}
            />,
        );
        const eyeButton = screen.getByTestId('icon-Hide metric');
        expect(eyeButton).toBeDisabled();
    });

    it('does not toggle visibility when last metric is visible', () => {
        const onToggleVisibility = jest.fn();
        render(
            <StatisticsMetricsList
                metrics={[metrics[0]]}
                hiddenMetricIds={[]}
                onToggleVisibility={onToggleVisibility}
                onReorder={jest.fn()}
                onMetricUpdate={jest.fn()}
            />,
        );

        fireEvent.click(screen.getByTestId('icon-Hide metric'));
        expect(onToggleVisibility).not.toHaveBeenCalled();
    });

    it('renders edit panel and saves updated metric', () => {
        const onMetricUpdate = jest.fn();
        render(
            <StatisticsMetricsList
                metrics={metrics}
                hiddenMetricIds={[]}
                onToggleVisibility={jest.fn()}
                onReorder={jest.fn()}
                onMetricUpdate={onMetricUpdate}
            />,
        );

        fireEvent.click(screen.getAllByTestId('icon-edit')[0]);
        expect(screen.getByTestId('metric-edit-panel')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('save-edit'));
        expect(onMetricUpdate).toHaveBeenCalledWith([{ ...metrics[0], name: 'Updated Metric' }, metrics[1]]);
    });

    it('closes edit panel on cancel', () => {
        render(
            <StatisticsMetricsList
                metrics={metrics}
                hiddenMetricIds={[]}
                onToggleVisibility={jest.fn()}
                onReorder={jest.fn()}
                onMetricUpdate={jest.fn()}
            />,
        );

        fireEvent.click(screen.getAllByTestId('icon-edit')[0]);
        expect(screen.getByTestId('metric-edit-panel')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('cancel-edit'));
        expect(screen.queryByTestId('metric-edit-panel')).not.toBeInTheDocument();
    });
});
