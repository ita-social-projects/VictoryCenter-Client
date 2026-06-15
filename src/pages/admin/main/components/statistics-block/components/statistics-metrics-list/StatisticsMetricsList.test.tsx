import { Metric } from '@/types/admin/main-page';
import { metricPartners, metricRaised } from '@/utils/test-mocks/statistics-block-mocks';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { StatisticsMetricsList } from './StatisticsMetricsList';

const normalizeSpaces = (value: string) => value.replace(/\u00a0/g, ' ');

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

jest.mock('../raised-metric-edit-panel/RaisedMetricEditPanel', () => ({
    RaisedMetricEditPanel: ({ metric, onSave, onCancel, onSyncErrorChange }: any) => (
        <div data-testid="raised-edit-panel">
            <button
                type="button"
                data-testid="save-raised-edit"
                onClick={() =>
                    onSave({
                        ...metric,
                        name: 'Updated Raised',
                        isAutoSynced: true,
                        localizations: metric.localizations?.map((loc: any) =>
                            loc.languageId === 1 ? { ...loc, name: 'Updated Raised' } : loc,
                        ),
                    })
                }
            />
            <button type="button" data-testid="trigger-raised-sync-error" onClick={() => onSyncErrorChange?.(true)} />
            <button type="button" data-testid="cancel-raised-edit" onClick={onCancel} />
        </div>
    ),
}));

const metrics: Metric[] = [metricPartners, metricRaised];

describe('StatisticsMetricsList', () => {
    const setup = (propsOverrides: Partial<React.ComponentProps<typeof StatisticsMetricsList>> = {}) => {
        const defaultProps = {
            metrics,
            hiddenMetricIds: [],
            onToggleVisibility: jest.fn(),
            onReorder: jest.fn(),
            onMetricUpdate: jest.fn(),
        };

        const finalProps = { ...defaultProps, ...propsOverrides };
        render(<StatisticsMetricsList {...finalProps} />);

        return {
            onToggleVisibility: finalProps.onToggleVisibility,
            onMetricUpdate: finalProps.onMetricUpdate,
            onRaisedFundsSyncErrorChange: finalProps.onRaisedFundsSyncErrorChange,
        };
    };

    it('renders metrics list correctly', () => {
        setup();
        expect(screen.getByText('Партнерів')).toBeInTheDocument();
        expect(screen.getByText('Partners')).toBeInTheDocument();
        expect(screen.getByText('20+')).toBeInTheDocument();
    });

    it('renders both UAH and USD values with symbols for Raised metric type', () => {
        setup();
        const raisedUahEl = screen.getByText((content) => normalizeSpaces(content).includes('₴5 000 000'));
        expect(raisedUahEl).toBeInTheDocument();

        const raisedUsdEl = screen.getByText('$125,000');
        expect(raisedUsdEl).toBeInTheDocument();
    });

    it('falls back to metric name when localization is missing', () => {
        const metricWithoutLoc: Metric = {
            ...metrics[0],
            id: 99,
            name: 'NoLocName',
            localizations: [],
        };
        setup({ metrics: [metricWithoutLoc] });

        const elements = screen.getAllByText('NoLocName');
        expect(elements).toHaveLength(2);
    });

    it('uses "Show metric" label when metric is hidden', () => {
        setup({ hiddenMetricIds: [2] });
        expect(screen.getByLabelText('Show metric')).toBeInTheDocument();
    });

    it('calls onToggleVisibility on eye click', () => {
        const { onToggleVisibility } = setup();
        fireEvent.click(screen.getAllByTestId('icon-Hide metric')[0]);
        expect(onToggleVisibility).toHaveBeenCalledWith(1);
    });

    it('does not call onToggleVisibility when metric id is missing', () => {
        const { onToggleVisibility } = setup({ metrics: [{ ...metrics[0], id: undefined } as Metric] });
        fireEvent.click(screen.getByTestId('icon-Hide metric'));
        expect(onToggleVisibility).not.toHaveBeenCalled();
    });

    it('disables toggle button for last visible metric', () => {
        setup({ metrics: [metrics[0]] });
        const eyeButton = screen.getByTestId('icon-Hide metric');
        expect(eyeButton).toBeDisabled();
    });

    it('does not toggle visibility when last metric is visible', () => {
        const { onToggleVisibility } = setup({ metrics: [metrics[0]] });
        fireEvent.click(screen.getByTestId('icon-Hide metric'));
        expect(onToggleVisibility).not.toHaveBeenCalled();
    });

    it('renders standard edit panel and saves updated metric', () => {
        const { onMetricUpdate } = setup();

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        expect(screen.getByTestId('metric-edit-panel')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('save-edit'));
        expect(onMetricUpdate).toHaveBeenCalledWith([{ ...metrics[0], name: 'Updated Metric' }, metrics[1]]);
    });

    it('renders raised edit panel and saves updated metric', () => {
        const { onMetricUpdate } = setup();

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[1]);
        expect(screen.getByTestId('raised-edit-panel')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('save-raised-edit'));
        expect(screen.queryByTestId('raised-edit-panel')).not.toBeInTheDocument();
        expect(onMetricUpdate).toHaveBeenCalledWith([
            metrics[0],
            {
                ...metrics[1],
                name: 'Updated Raised',
                isAutoSynced: true,
                localizations: metrics[1].localizations?.map((loc: any) =>
                    loc.languageId === 1 ? { ...loc, name: 'Updated Raised' } : loc,
                ),
            },
        ]);
    });

    it('passes raised funds sync error state changes from edit panel to parent', () => {
        const onRaisedFundsSyncErrorChange = jest.fn();
        setup({ onRaisedFundsSyncErrorChange });

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[1]);
        fireEvent.click(screen.getByTestId('trigger-raised-sync-error'));

        expect(onRaisedFundsSyncErrorChange).toHaveBeenCalledWith(true);
    });

    it('closes edit panels on cancel', () => {
        setup();

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        expect(screen.getByTestId('metric-edit-panel')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('cancel-edit'));
        expect(screen.queryByTestId('metric-edit-panel')).not.toBeInTheDocument();

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[1]);
        expect(screen.getByTestId('raised-edit-panel')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('cancel-raised-edit'));
        expect(screen.queryByTestId('raised-edit-panel')).not.toBeInTheDocument();
    });
});
