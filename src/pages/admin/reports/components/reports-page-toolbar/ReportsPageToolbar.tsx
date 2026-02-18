import { useState } from 'react';
import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { Button } from '@/components/admin/button/Button';
import { REPORTS_TEXT } from '@/const/admin/reports';
import { ReactComponent as EditIcon } from '@/assets/icons/edit-disabled.svg';
import styles from './ReportsPageToolbar.module.scss';

interface ReportsToolbarTab {
    id: 'media-settings' | 'report-analytics';
    label: string;
}

const TOOLBAR_TABS: ReportsToolbarTab[] = [
    { id: 'media-settings', label: 'Налаштування медіа' },
    { id: 'report-analytics', label: 'Звіт та аналітика' },
];

interface ReportsPageToolbarProps {
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onPublish: () => void;
}

export const ReportsPageToolbar = ({ isEditing, onEdit, onCancel, onPublish }: ReportsPageToolbarProps) => {
    const [selectedTab, setSelectedTab] = useState<ReportsToolbarTab>(TOOLBAR_TABS[0]);

    return (
        <div className={styles.toolbar}>
            <CategoryBar<ReportsToolbarTab>
                categories={TOOLBAR_TABS}
                selectedCategory={selectedTab}
                getCategoryDisplayName={(tab) => tab.label}
                getCategoryKey={(tab) => tab.id}
                onCategorySelect={setSelectedTab}
            />
            {isEditing ? (
                <div className={styles.actions}>
                    <Button buttonStyle="secondary" className={styles.button} onClick={onCancel}>
                        {REPORTS_TEXT.BUTTON.CANCEL}
                    </Button>
                    <Button buttonStyle="primary" className={styles.button} onClick={onPublish}>
                        {REPORTS_TEXT.BUTTON.PUBLISH}
                    </Button>
                </div>
            ) : (
                <Button buttonStyle="primary" className={styles.button} onClick={onEdit}>
                    <EditIcon />
                    {REPORTS_TEXT.BUTTON.EDIT_PAGE}
                </Button>
            )}
        </div>
    );
};
