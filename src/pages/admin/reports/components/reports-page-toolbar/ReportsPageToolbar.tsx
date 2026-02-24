import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { Button } from '@/components/admin/button/Button';
import { REPORTS_TEXT } from '@/const/admin/reports';
import { ReactComponent as EditIcon } from '@/assets/icons/edit-disabled.svg';
import styles from './ReportsPageToolbar.module.scss';

export interface ReportsToolbarTab {
    id: 'media-settings' | 'report-analytics';
    label: string;
}

export const TOOLBAR_TABS: ReportsToolbarTab[] = [
    { id: 'media-settings', label: 'Налаштування медіа' },
    { id: 'report-analytics', label: 'Звіт та аналітика' },
];

interface ReportsPageToolbarProps {
    isEditing: boolean;
    isPublishDisabled: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onPublish: () => void;
    selectedTab: ReportsToolbarTab;
    onTabChange: (tab: ReportsToolbarTab) => void;
}

export const ReportsPageToolbar = ({
    isEditing,
    isPublishDisabled,
    onEdit,
    onCancel,
    onPublish,
    selectedTab,
    onTabChange,
}: ReportsPageToolbarProps) => {
    return (
        <div className={styles.toolbar}>
            <CategoryBar<ReportsToolbarTab>
                categories={TOOLBAR_TABS}
                selectedCategory={selectedTab}
                getCategoryDisplayName={(tab) => tab.label}
                getCategoryKey={(tab) => tab.id}
                onCategorySelect={onTabChange}
            />
            {isEditing ? (
                <div className={styles.actions}>
                    <Button buttonStyle="secondary" className={styles.button} onClick={onCancel}>
                        {REPORTS_TEXT.BUTTON.CANCEL}
                    </Button>
                    <Button
                        buttonStyle="primary"
                        className={styles.button}
                        onClick={onPublish}
                        disabled={isPublishDisabled}
                    >
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
