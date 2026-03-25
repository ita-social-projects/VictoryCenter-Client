import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import styles from './ReportsPageToolbar.module.scss';

export interface ReportsToolbarTab {
    id: 'media-settings' | 'report-analytics';
    label: string;
}

export const REPORTS_TOOLBAR_TABS: ReportsToolbarTab[] = [
    { id: 'media-settings', label: 'Налаштування медіа' },
    { id: 'report-analytics', label: 'Звіт та аналітика' },
];

interface ReportsPageToolbarProps {
    selectedTab: ReportsToolbarTab;
    onTabSelect: (tab: ReportsToolbarTab) => void;
}

export const ReportsPageToolbar = ({ selectedTab, onTabSelect }: ReportsPageToolbarProps) => {
    return (
        <div className={styles.toolbar}>
            <CategoryBar<ReportsToolbarTab>
                categories={REPORTS_TOOLBAR_TABS}
                selectedCategory={selectedTab}
                getCategoryDisplayName={(tab) => tab.label}
                getCategoryKey={(tab) => tab.id}
                onCategorySelect={onTabSelect}
            />
        </div>
    );
};
