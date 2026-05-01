import { useState } from 'react';
import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { REPORTS_TEXT } from '@/const/admin/reports';
import styles from './ReportAnalytics.module.scss';
import './ReportAnalytics.scss';
import { PdfFilesSection } from '../pdf-files-section/PdfFilesSection';
import { FundsExpenditureSection } from '../funds-expenditures-section/FundsExpendituresSection';
import { ProgramExpensesSection } from '../program-expenses-section/ProgramExpensesSection';

interface ReportAnalyticsTab {
    id: 'income-expenses' | 'program-expenses' | 'pdf-files';
    label: string;
}

const ANALYTICS_TABS: ReportAnalyticsTab[] = [
    { id: 'income-expenses', label: REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.INCOME_EXPENSES },
    { id: 'program-expenses', label: REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.PROGRAM_EXPENSES },
    { id: 'pdf-files', label: REPORTS_TEXT.REPORT_AND_ANALYTICS.TAB.PDF_FILES },
];

export const ReportAnalytics = () => {
    const [activeTab, setActiveTab] = useState<ReportAnalyticsTab>(ANALYTICS_TABS[0]);
    const [isFundsEditing, setIsFundsEditing] = useState(false);
    const [fundsExchangeRateDraft, setFundsExchangeRateDraft] = useState<string | null>();

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
                {activeTab.id === 'pdf-files' && <PdfFilesSection />}
                {activeTab.id === 'income-expenses' && (
                    <FundsExpenditureSection
                        initialIsEditing={isFundsEditing}
                        draftExchangeRate={fundsExchangeRateDraft}
                        onEditModeChange={setIsFundsEditing}
                        onExchangeRateValueChange={setFundsExchangeRateDraft}
                    />
                )}
                {activeTab.id === 'program-expenses' && <ProgramExpensesSection isEditing={isFundsEditing} />}
            </div>
        </div>
    );
};
