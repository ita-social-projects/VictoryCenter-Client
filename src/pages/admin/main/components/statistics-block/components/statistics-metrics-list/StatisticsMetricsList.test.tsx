import axios from 'axios';
import { Metric } from '@/types/admin/main-page';
import { ToastType } from '@/types/admin/toast';
import { metricPartners, metricRaised } from '@/utils/test-mocks/statistics-block-mocks';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StatisticsMetricsList } from './StatisticsMetricsList';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { MainPageApi } from '@/services/api/admin/main-page/main-page-api';

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

jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');
jest.mock('@/services/api/admin/main-page/main-page-api');

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

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel }: any) =>
        isOpen ? (
            <div data-testid="cancel-modal">
                <button type="button" data-testid="confirm-cancel" onClick={onConfirm} />
                <button type="button" data-testid="dismiss-cancel" onClick={onCancel} />
            </div>
        ) : null,
}));

jest.mock('../statistics-metric-edit-panel/StatisticsMetricEditPanel', () => ({
    StatisticsMetricEditPanel: ({ metric, onSave, onCancel }: any) => (
        <div data-testid="metric-edit-panel">
            <button
                type="button"
                data-testid="save-edit"
                onClick={() => onSave({ ...metric, name: 'Updated Metric' })}
            />
            <button type="button" data-testid="save-edit-no-change" onClick={() => onSave({ ...metric })} />
            <button type="button" data-testid="save-edit-no-id" onClick={() => onSave({ ...metric, id: undefined })} />
            <button type="button" data-testid="save-edit-not-found" onClick={() => onSave({ ...metric, id: 999 })} />
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
    let addToast: jest.Mock;

    const setup = (propsOverrides: Partial<React.ComponentProps<typeof StatisticsMetricsList>> = {}) => {
        addToast = jest.fn();
        (useAdminClient as jest.Mock).mockReturnValue({});
        (useToast as jest.Mock).mockReturnValue({ addToast });
        MainPageApi.updateMetric = jest.fn().mockResolvedValue({ wasModified: true, updatedFields: [] });

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
            onRaisedFundsSyncErrorChange: (finalProps as any).onRaisedFundsSyncErrorChange,
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

    it('renders standard edit panel and saves updated metric', async () => {
        const { onMetricUpdate } = setup();

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        expect(screen.getByTestId('metric-edit-panel')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('save-edit'));
        await waitFor(() => {
            expect(onMetricUpdate).toHaveBeenCalledWith([{ ...metrics[0], name: 'Updated Metric' }, metrics[1]]);
        });
    });

    it('shows success toast and closes panel after successful save', async () => {
        setup();

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        fireEvent.click(screen.getByTestId('save-edit'));

        await waitFor(() => {
            expect(addToast).toHaveBeenCalledWith('Зміни збережено успішно', ToastType.Success, 3000);
            expect(screen.queryByTestId('metric-edit-panel')).not.toBeInTheDocument();
        });
    });

    it('renders raised edit panel and saves updated metric', async () => {
        const { onMetricUpdate } = setup();

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[1]);
        expect(screen.getByTestId('raised-edit-panel')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('save-raised-edit'));
        await waitFor(() => {
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
    });

    it('shows "no changes detected" toast when API returns wasModified=false', async () => {
        setup();
        (MainPageApi.updateMetric as jest.Mock).mockResolvedValue({ wasModified: false });

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        fireEvent.click(screen.getByTestId('save-edit'));

        await waitFor(() => {
            expect(addToast).toHaveBeenCalledWith('Змін не виявлено', ToastType.Info, 3000);
            expect(screen.queryByTestId('metric-edit-panel')).not.toBeInTheDocument();
        });
    });

    it('shows info toast and closes panel when there is nothing to save', async () => {
        setup();

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        fireEvent.click(screen.getByTestId('save-edit-no-change'));

        await waitFor(() => {
            expect(addToast).toHaveBeenCalledWith('Немає змін для збереження', ToastType.Info, 2000);
            expect(screen.queryByTestId('metric-edit-panel')).not.toBeInTheDocument();
        });
        expect(MainPageApi.updateMetric).not.toHaveBeenCalled();
    });

    it('closes panel silently when updated metric has no id', async () => {
        setup();
        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        fireEvent.click(screen.getByTestId('save-edit-no-id'));

        await waitFor(() => {
            expect(screen.queryByTestId('metric-edit-panel')).not.toBeInTheDocument();
        });
        expect(MainPageApi.updateMetric).not.toHaveBeenCalled();
        expect(addToast).not.toHaveBeenCalled();
    });

    it('closes panel silently when original metric is not found', async () => {
        setup();

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        fireEvent.click(screen.getByTestId('save-edit-not-found'));

        await waitFor(() => {
            expect(screen.queryByTestId('metric-edit-panel')).not.toBeInTheDocument();
        });
        expect(MainPageApi.updateMetric).not.toHaveBeenCalled();
    });

    it('shows warning toast on 409 conflict error', async () => {
        const conflictError = { response: { status: 409 } };
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
        setup();
        (MainPageApi.updateMetric as jest.Mock).mockRejectedValue(conflictError);

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        fireEvent.click(screen.getByTestId('save-edit'));

        await waitFor(() => {
            expect(addToast).toHaveBeenCalledWith(
                'Дані змінено іншим користувачем. Перезавантажте сторінку',
                ToastType.Warning,
                3000,
            );
        });

        jest.restoreAllMocks();
    });

    it('shows error toast on generic API failure', async () => {
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);
        setup();
        (MainPageApi.updateMetric as jest.Mock).mockRejectedValue(new Error('Network error'));

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        fireEvent.click(screen.getByTestId('save-edit'));

        await waitFor(() => {
            expect(addToast).toHaveBeenCalledWith('Виникла помилка, спробуйте ще раз', ToastType.Error, 3000);
        });

        jest.restoreAllMocks();
    });

    it('shows error toast when axios error is not 409', async () => {
        const serverError = { response: { status: 500 } };
        jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
        setup();
        (MainPageApi.updateMetric as jest.Mock).mockRejectedValue(serverError);

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        fireEvent.click(screen.getByTestId('save-edit'));

        await waitFor(() => {
            expect(addToast).toHaveBeenCalledWith('Виникла помилка, спробуйте ще раз', ToastType.Error, 3000);
        });

        jest.restoreAllMocks();
    });

    it('closes edit panels on cancel when no pending save', () => {
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

    it('opens confirmation modal when cancelling with a pending save in-flight', async () => {
        setup();
        (MainPageApi.updateMetric as jest.Mock).mockReturnValue(new Promise(() => {}));

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        fireEvent.click(screen.getByTestId('save-edit'));

        await waitFor(() => expect(MainPageApi.updateMetric).toHaveBeenCalled());
        fireEvent.click(screen.getByTestId('cancel-edit'));

        expect(screen.getByTestId('cancel-modal')).toBeInTheDocument();
    });

    it('confirms cancel: closes modal and clears editing state', async () => {
        setup();
        (MainPageApi.updateMetric as jest.Mock).mockReturnValue(new Promise(() => {}));

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        fireEvent.click(screen.getByTestId('save-edit'));

        await waitFor(() => expect(MainPageApi.updateMetric).toHaveBeenCalled());
        fireEvent.click(screen.getByTestId('cancel-edit'));
        expect(screen.getByTestId('cancel-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('confirm-cancel'));

        await waitFor(() => {
            expect(screen.queryByTestId('cancel-modal')).not.toBeInTheDocument();
            expect(screen.queryByTestId('metric-edit-panel')).not.toBeInTheDocument();
        });
    });

    it('dismisses cancel modal without closing edit panel', async () => {
        setup();
        (MainPageApi.updateMetric as jest.Mock).mockReturnValue(new Promise(() => {}));

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        fireEvent.click(screen.getByTestId('save-edit'));

        await waitFor(() => expect(MainPageApi.updateMetric).toHaveBeenCalled());
        fireEvent.click(screen.getByTestId('cancel-edit'));
        expect(screen.getByTestId('cancel-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('dismiss-cancel'));

        expect(screen.queryByTestId('cancel-modal')).not.toBeInTheDocument();
        expect(screen.getByTestId('metric-edit-panel')).toBeInTheDocument();
    });

    it('includes expectedVersion in patch when original metric has rowVersion', async () => {
        const metricWithVersion: Metric = { ...metricPartners, rowVersion: 'AAAA==' };
        setup({ metrics: [metricWithVersion, metricRaised] });

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        fireEvent.click(screen.getByTestId('save-edit'));

        await waitFor(() => {
            expect(MainPageApi.updateMetric).toHaveBeenCalledWith(
                expect.anything(),
                metricWithVersion.id,
                expect.objectContaining({ expectedVersion: 'AAAA==' }),
            );
        });
    });

    it('does not include localization patch when EN name and value are both null after update', async () => {
        const metricNoEn: Metric = {
            ...metricPartners,
            localizations: [{ languageId: 1, name: 'Партнерів' } as any],
        };
        setup({ metrics: [metricNoEn, metricRaised] });

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        fireEvent.click(screen.getByTestId('save-edit'));

        await waitFor(() => {
            expect(MainPageApi.updateMetric).toHaveBeenCalledWith(
                expect.anything(),
                metricNoEn.id,
                expect.not.objectContaining({ localization: expect.anything() }),
            );
        });
    });

    it('shows pendingMetric data in edit panel while save is in-flight', async () => {
        setup();
        (MainPageApi.updateMetric as jest.Mock).mockReturnValue(new Promise(() => {}));

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        fireEvent.click(screen.getByTestId('save-edit'));

        await waitFor(() => {
            expect(MainPageApi.updateMetric).toHaveBeenCalled();
        });

        expect(screen.getByTestId('metric-edit-panel')).toBeInTheDocument();
    });

    it('disables edit button for other metrics while one is being edited', () => {
        setup();

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        expect(screen.getByTestId('metric-edit-panel')).toBeInTheDocument();

        const editButtons = screen.getAllByTestId('icon-Edit metric');
        expect(editButtons[0]).toBeDisabled();
    });

    it('does not open second edit panel when one is already open', () => {
        setup();

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        expect(screen.getByTestId('metric-edit-panel')).toBeInTheDocument();

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[0]);
        expect(screen.queryByTestId('raised-edit-panel')).not.toBeInTheDocument();
        expect(screen.getByTestId('metric-edit-panel')).toBeInTheDocument();
    });

    it('passes raised funds sync error state changes from edit panel to parent', () => {
        const onRaisedFundsSyncErrorChange = jest.fn();
        setup({ onRaisedFundsSyncErrorChange });

        fireEvent.click(screen.getAllByTestId('icon-Edit metric')[1]);
        fireEvent.click(screen.getByTestId('trigger-raised-sync-error'));

        expect(onRaisedFundsSyncErrorChange).toHaveBeenCalledWith(true);
    });

    it('renders non-Raised metrics with a single formatted value', () => {
        setup({ metrics: [metricPartners] });
        expect(screen.getByText('20+')).toBeInTheDocument();
    });

    it('renders Raised metric type with dual currency values', () => {
        setup({ metrics: [metricRaised] });
        expect(screen.getByText('$125,000')).toBeInTheDocument();
    });
});
