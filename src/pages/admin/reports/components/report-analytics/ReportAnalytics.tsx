import { useState } from 'react';
import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { REPORTS_TEXT } from '@/const/admin/reports';
import styles from './ReportAnalytics.module.scss';
import './ReportAnalytics.scss';
import { PdfFilesSection } from '../pdf-files-section/PdfFilesSection';

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
        <div className={styles['report-analytics']}>
            <h2 className={styles.title}>{REPORTS_TEXT.REPORT_AND_ANALYTICS.TITLE}</h2>
            <CategoryBar<ReportAnalyticsTab>
                className={`report-category-bar ${styles.reportCategoryBar}`}
                categories={ANALYTICS_TABS}
                selectedCategory={activeTab}
                getCategoryDisplayName={(tab) => tab.label}
                getCategoryKey={(tab) => tab.id}
                onCategorySelect={setActiveTab}
            />
            <div className={styles['tab-content']}>
                {activeTab.id === 'pdf-files' && <PdfFilesSection isEditing={isEditing} />}
                {activeTab.id === 'income-expenses' && <div></div>}
                {activeTab.id === 'program-expenses' && <div></div>}
            </div>
        </div>
    );
};
