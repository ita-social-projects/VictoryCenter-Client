import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as EyeClosedIcon } from '@/assets/icons/eye-closed.svg';
import { ReactComponent as EyeOpenedIcon } from '@/assets/icons/eye-opened.svg';
import { DraggableListItem } from '@/components/admin/draggable-list-item/DraggableListItem';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { Metric } from '@/types/admin/main-page';
import { formatMetricValue, getMetricName } from '@/utils/functions/formatters/metric-formatters';
import styles from './StatisticsMetricsList.module.scss';

interface StatisticsMetricsListProps {
    metrics: Metric[];
    hiddenMetricIds: number[];
    onToggleVisibility: (id: number) => void;
    onReorder: (items: Metric[]) => void;
}

export const StatisticsMetricsList = ({
    metrics,
    hiddenMetricIds,
    onToggleVisibility,
    onReorder,
}: StatisticsMetricsListProps) => {
    const visibleMetricsCount = metrics.length - hiddenMetricIds.length;
    const renderRow = (metric: Metric) => {
        const isHidden = hiddenMetricIds.includes(metric.id ?? 0);
        const isLastVisible = !isHidden && visibleMetricsCount <= 1;

        return (
            <div className={styles.row}>
                <div className={styles.labels}>
                    <p className={`${styles.ua} ${isHidden ? styles.hiddenText : ''}`}>{getMetricName(metric)}</p>
                </div>

                <div className={styles.values}>
                    <p className={`${styles.value} ${isHidden ? styles.hiddenText : ''}`}>
                        {formatMetricValue(metric)}
                    </p>
                </div>

                <div className={styles.actions}>
                    <IconButton type="button" DefaultIcon={EditIcon} className={styles.iconButton} />
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
