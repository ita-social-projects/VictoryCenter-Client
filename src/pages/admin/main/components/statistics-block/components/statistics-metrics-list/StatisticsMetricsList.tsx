import axios from 'axios';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as EyeClosedIcon } from '@/assets/icons/eye-closed.svg';
import { ReactComponent as EyeOpenedIcon } from '@/assets/icons/eye-opened.svg';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
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
    const [pendingMetric, setPendingMetric] = useState<Metric | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const visibleMetricsCount = metrics.length - hiddenMetricIds.length;

    const getMetricDiff = (original: Metric, updated: Metric): Partial<UpdateSingleMetricDto> => {
        const patch: Partial<UpdateSingleMetricDto> = {};
        if (original.value !== updated.value) patch.value = updated.value;
        if (original.name !== updated.name) patch.name = updated.name;
        if (original.prefix !== updated.prefix) patch.prefix = updated.prefix;
        if (original.isAutoSynced !== updated.isAutoSynced) patch.isAutoSynced = updated.isAutoSynced;

        const origEn = original.localizations?.find((l) => l.languageId === 2);
        const updatedEn = updated.localizations?.find((l) => l.languageId === 2);

        const origEnName = origEn?.name ?? null;
        const updatedEnName = updatedEn?.name ?? null;
        const origEnValue = origEn?.value ?? null;
        const updatedEnValue = updatedEn?.value ?? null;

        if (origEnName !== updatedEnName || origEnValue !== updatedEnValue) {
            if (updatedEnName !== null || updatedEnValue !== null) {
                patch.localization = {
                    languageId: 2,
                    name: updatedEnName ?? undefined,
                    value: updatedEnValue ?? undefined,
                };
            }
        }

        if (Object.keys(patch).length > 0 && original.rowVersion) {
            patch.expectedVersion = original.rowVersion;
        }

        return patch;
    };

    const handleSaveMetric = async (updatedMetric: Metric) => {
        const originalMetric = metrics.find((m) => m.id === updatedMetric.id);
        if (!originalMetric || !updatedMetric.id) {
            setEditingMetricId(null);
            setPendingMetric(null);
            return;
        }

        const patch = getMetricDiff(originalMetric, updatedMetric);
        if (Object.keys(patch).length === 0) {
            addToast('Немає змін для збереження', ToastType.Info, 2000);
            setEditingMetricId(null);
            setPendingMetric(null);
            return;
        }

        try {
            setPendingMetric(updatedMetric);
            const response = await MainPageApi.updateMetric(client, updatedMetric.id, patch as UpdateSingleMetricDto);

            if (response.wasModified) {
                const newMetrics = metrics.map((m) => (m.id === updatedMetric.id ? updatedMetric : m));
                onMetricUpdate(newMetrics);
                setEditingMetricId(null);
                setPendingMetric(null);
                addToast('Зміни збережено успішно', ToastType.Success, 3000);
            } else {
                setEditingMetricId(null);
                setPendingMetric(null);
                addToast('Змін не виявлено', ToastType.Info, 3000);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                addToast('Дані змінено іншим користувачем. Перезавантажте сторінку', ToastType.Warning, 3000);
            } else {
                addToast('Виникла помилка, спробуйте ще раз', ToastType.Error, 3000);
            }
        }
    };

    const handleCancelEdit = () => {
        if (pendingMetric) {
            setIsCancelModalOpen(true);
        } else {
            setEditingMetricId(null);
        }
    };

    const confirmCancelEdit = () => {
        setIsCancelModalOpen(false);
        setPendingMetric(null);
        setEditingMetricId(null);
    };

    const renderRow = (metric: Metric) => {
        if (editingMetricId === metric.id) {
            const currentMetric = pendingMetric?.id === metric.id ? pendingMetric : metric;
            if (metric.type === MetricType.Raised) {
                return (
                    <RaisedMetricEditPanel
                        metric={currentMetric}
                        onSave={handleSaveMetric}
                        onCancel={handleCancelEdit}
                        onSyncErrorChange={onRaisedFundsSyncErrorChange}
                    />
                );
            }

            return (
                <StatisticsMetricEditPanel
                    metric={currentMetric}
                    onSave={handleSaveMetric}
                    onCancel={handleCancelEdit}
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

            <ConfirmationModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.CANCEL_MODAL_TITLE}
                onConfirm={confirmCancelEdit}
                onCancel={() => setIsCancelModalOpen(false)}
            />
        </div>
    );
};
