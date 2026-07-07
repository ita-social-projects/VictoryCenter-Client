import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as EyeClosedIcon } from '@/assets/icons/eye-closed.svg';
import { ReactComponent as EyeOpenedIcon } from '@/assets/icons/eye-opened.svg';
import { DraggableListItem } from '@/components/admin/draggable-list-item/DraggableListItem';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { MainPageApi } from '@/services/api/admin/main-page/main-page-api';
import { ToastType } from '@/types/admin/toast';
import { Metric, MetricType, UpdateSingleMetricDto } from '@/types/admin/main-page';
import { formatMetricValue, getMetricName } from '@/utils/functions/formatters/metric-formatters';
import { useState } from 'react';
import { RaisedMetricEditPanel } from '../raised-metric-edit-panel/RaisedMetricEditPanel';
import { StatisticsMetricEditPanel } from '../statistics-metric-edit-panel/StatisticsMetricEditPanel';
import styles from './StatisticsMetricsList.module.scss';

interface StatisticsMetricsListProps {
    metrics: Metric[];
    hiddenMetricIds: number[];
    onToggleVisibility: (id: number) => void;
    onReorder: (items: Metric[]) => void;
    onMetricUpdate: (updatedMetrics: Metric[]) => void;
    onRaisedFundsSyncErrorChange?: (hasError: boolean) => void;
}

export const StatisticsMetricsList = ({
    metrics,
    hiddenMetricIds,
    onToggleVisibility,
    onReorder,
    onMetricUpdate,
    onRaisedFundsSyncErrorChange,
}: StatisticsMetricsListProps) => {
    const client = useAdminClient();
    const { addToast } = useToast();
    const [editingMetricId, setEditingMetricId] = useState<number | null>(null);
    const visibleMetricsCount = metrics.length - hiddenMetricIds.length;

    const getMetricDiff = (original: Metric, updated: Metric): UpdateSingleMetricDto => {
        const patch: UpdateSingleMetricDto = {};
        if (original.value !== updated.value) patch.value = updated.value;
        if (original.name !== updated.name) patch.name = updated.name;
        if (original.prefix !== updated.prefix) patch.prefix = updated.prefix;
        if (original.isAutoSynced !== updated.isAutoSynced) patch.isAutoSynced = updated.isAutoSynced;

        const origEn = original.localizations?.find((l) => l.languageId === 2);
        const updatedEn = updated.localizations?.find((l) => l.languageId === 2);

        if (origEn?.name !== updatedEn?.name || origEn?.value !== updatedEn?.value) {
            patch.localization = {
                languageId: 2,
                name: updatedEn?.name,
                value: updatedEn?.value,
            };
        }

        return patch;
    };

    const handleSaveMetric = async (updatedMetric: Metric) => {
        const originalMetric = metrics.find((m) => m.id === updatedMetric.id);
        if (!originalMetric || !updatedMetric.id) {
            setEditingMetricId(null);
            return;
        }

        const patch = getMetricDiff(originalMetric, updatedMetric);
        if (Object.keys(patch).length === 0) {
            setEditingMetricId(null);
            return;
        }

        try {
            await MainPageApi.updateMetric(client, updatedMetric.id, patch);

            const newMetrics = metrics.map((m) => (m.id === updatedMetric.id ? updatedMetric : m));
            onMetricUpdate(newMetrics);
            setEditingMetricId(null);
            addToast('Зміни збережено успішно', ToastType.Success, 3000);
        } catch (error) {
            addToast('Виникла помилка, спробуйте ще раз', ToastType.Error, 3000);
        }
    };

    const renderRow = (metric: Metric) => {
        if (editingMetricId === metric.id) {
            if (metric.type === MetricType.Raised) {
                return (
                    <RaisedMetricEditPanel
                        metric={metric}
                        onSave={handleSaveMetric}
                        onCancel={() => setEditingMetricId(null)}
                        onSyncErrorChange={onRaisedFundsSyncErrorChange}
                    />
                );
            }

            return (
                <StatisticsMetricEditPanel
                    metric={metric}
                    onSave={handleSaveMetric}
                    onCancel={() => setEditingMetricId(null)}
                />
            );
        }

        const isHidden = hiddenMetricIds.includes(metric.id ?? 0);
        const isLastVisible = !isHidden && visibleMetricsCount <= 1;

        return (
            <div className={styles.row}>
                <p className={`${styles.ua} ${isHidden ? styles.hiddenText : ''}`}>{getMetricName(metric, 'UA')}</p>

                <p className={`${styles.en} ${isHidden ? styles.hiddenText : ''}`}>{getMetricName(metric, 'EN')}</p>

                <div className={styles.values}>
                    {metric.type === MetricType.Raised ? (
                        <div className={styles.raisedValues}>
                            <p className={`${styles.value} ${isHidden ? styles.hiddenText : ''}`}>
                                ₴{formatMetricValue(metric, 'UA')}
                            </p>
                            <p className={`${styles.value} ${isHidden ? styles.hiddenText : ''}`}>
                                ${formatMetricValue(metric, 'EN')}
                            </p>
                        </div>
                    ) : (
                        <p className={`${styles.value} ${isHidden ? styles.hiddenText : ''}`}>
                            {formatMetricValue(metric)}
                        </p>
                    )}
                </div>

                <div className={styles.actions}>
                    <IconButton
                        type="button"
                        DefaultIcon={EditIcon}
                        aria-label="Edit metric"
                        className={styles.iconButton}
                        onClick={() => {
                            if (editingMetricId !== null && editingMetricId !== metric.id) return;
                            setEditingMetricId(metric.id ?? null);
                        }}
                        disabled={editingMetricId !== null && editingMetricId !== metric.id}
                    />
                    <IconButton
                        type="button"
                        aria-label={isHidden ? 'Show metric' : 'Hide metric'}
                        onClick={() => {
                            if (isLastVisible) return;
                            metric.id && onToggleVisibility(metric.id);
                        }}
                        disabled={isLastVisible}
                        DefaultIcon={isHidden ? EyeClosedIcon : EyeOpenedIcon}
                        className={`${styles.iconButton} ${isLastVisible ? styles.disabled : ''}`}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className={styles.list}>
            <div className={styles.header}>{MAIN_PAGE_TEXT.BLOCKS.STATISTICS.METRICS_TITLE}</div>
            <div className={styles.table}>
                {metrics.map((metric) => (
                    <DraggableListItem
                        key={metric.id ?? metric.name}
                        id={metric.id ?? metric.name}
                        entity={metric}
                        entities={metrics}
                        idSelector={(item) => item.id ?? item.name}
                        onEntitiesReordered={onReorder}
                        ariaLabel="Reorder metric"
                        renderEntityComponent={renderRow}
                    />
                ))}
            </div>
        </div>
    );
};
