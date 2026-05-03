import { useCallback, useMemo, useState } from 'react';
import { CategoryBar, ContextMenuOption } from '@/components/admin/category-bar/CategoryBar';
import { FUNDS_EXPENDITURES_TEXT, REPORTS_TEXT } from '@/const/admin/reports';
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
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);

    const categoryContextMenuOptions: ContextMenuOption[] = useMemo(
        () => [
            { id: 'add-category', name: FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_CATEGORY },
            { id: 'delete-category', name: FUNDS_EXPENDITURES_TEXT.BUTTON.DELETE_CATEGORY },
        ],
        [],
    );

    const handleCategoryContextMenuOption = useCallback((id: string) => {
        if (id === 'add-category') {
            setIsAddCategoryModalOpen(true);
        } else if (id === 'delete-category') {
            setIsDeleteCategoryModalOpen(true);
        }
    }, []);

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
                displayContextMenuButton={activeTab.id === 'income-expenses'}
                contextMenuOptions={categoryContextMenuOptions}
                onContextMenuOptionSelected={handleCategoryContextMenuOption}
            />
            <div className={styles['tab-content']}>
                {activeTab.id === 'pdf-files' && <PdfFilesSection />}
                {activeTab.id === 'income-expenses' && (
                    <FundsExpenditureSection
                        initialIsEditing={isFundsEditing}
                        draftExchangeRate={fundsExchangeRateDraft}
                        onEditModeChange={setIsFundsEditing}
                        onExchangeRateValueChange={setFundsExchangeRateDraft}
                        isAddCategoryModalOpen={isAddCategoryModalOpen}
                        onAddCategoryModalClose={() => setIsAddCategoryModalOpen(false)}
                        isDeleteCategoryModalOpen={isDeleteCategoryModalOpen}
                        onDeleteCategoryModalClose={() => setIsDeleteCategoryModalOpen(false)}
                    />
                )}
                {activeTab.id === 'program-expenses' && <ProgramExpensesSection />}
            </div>
        </div>
    );
};
