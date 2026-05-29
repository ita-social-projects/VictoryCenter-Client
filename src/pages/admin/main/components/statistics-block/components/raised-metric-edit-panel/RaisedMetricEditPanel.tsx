import { Button } from '@/components/admin/button/Button';
import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { Metric } from '@/types/admin/main-page';

import styles from './RaisedMetricEditPanel.module.scss';

interface RaisedMetricEditPanelProps {
    metric: Metric;
    onCancel: () => void;
}

export const RaisedMetricEditPanel = ({ metric, onCancel }: RaisedMetricEditPanelProps) => {
    return (
        <div className={styles.panel}>
            <div className={styles.header}>{MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.TITLE}</div>

            <div style={{ padding: '24px 0', color: '#666', fontSize: '14px' }}>
                Редагування метрики "{metric.name}" наразі недоступне.
            </div>

            <div className={styles.actions}>
                <Button buttonStyle="secondary" onClick={onCancel}>
                    {MAIN_PAGE_TEXT.BUTTONS.CANCEL}
                </Button>
                <Button buttonStyle="primary" disabled>
                    {MAIN_PAGE_TEXT.BUTTONS.SAVE}
                </Button>
            </div>
        </div>
    );
};
