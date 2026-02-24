import { useState } from 'react';
import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { REPORTS_TEXT } from '@/const/admin/reports';
import styles from './ReportAnalytics.module.scss';
import './ReportAnalytics.scss';

interface ReportAnalyticsTab {
    id: 'income-expenses' | 'program-expenses' | 'pdf-files';
    label: string;
}

const ANALYTICS_TABS: ReportAnalyticsTab[] = [
    { id: 'income-expenses', label: 'Доходи та витрати' },
    { id: 'program-expenses', label: 'Програмні витрати' },
    { id: 'pdf-files', label: 'PDF Файли' },
];

interface ReportAnalyticsProps {
    isEditing: boolean;
}

export const ReportAnalytics = ({ isEditing }: ReportAnalyticsProps) => {
    const [activeTab, setActiveTab] = useState<ReportAnalyticsTab>(ANALYTICS_TABS[0]);

    return (
        <div className={styles.reportAnalytics}>
            <h2 className={styles.title}>{REPORTS_TEXT.REPORT_AND_ANALYTICS.TITLE}</h2>
            <CategoryBar<ReportAnalyticsTab>
                className={`report-category-bar ${styles.reportCategoryBar}`}
                categories={ANALYTICS_TABS}
                selectedCategory={activeTab}
                getCategoryDisplayName={(tab) => tab.label}
                getCategoryKey={(tab) => tab.id}
                onCategorySelect={setActiveTab}
            />
            <div>
                {activeTab.id === 'pdf-files' && <div>PDF files tab</div>}
                {activeTab.id === 'income-expenses' && <div>Income expenses tab</div>}
                {activeTab.id === 'program-expenses' && <div>Program expenses tab</div>}
            </div>
        </div>
    );
};
