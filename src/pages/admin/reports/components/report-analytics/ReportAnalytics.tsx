import { useCallback, useEffect, useMemo, useState } from 'react';
import { CategoryBar, ContextMenuOption } from '@/components/admin/category-bar/CategoryBar';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, REPORTS_TEXT } from '@/const/admin/reports';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { localizationLanguagesDataFetch } from '@/services/api/public/localization/languages/languages-api';
import { ReportFundsExpendituresCategory } from '@/types/admin/reports';
import { ToastType } from '@/types/admin/toast';
import { LocalizationLanguage } from '@/types/common/language';
import styles from './ReportAnalytics.module.scss';
import './ReportAnalytics.scss';
import { PdfFilesSection } from '../pdf-files-section/PdfFilesSection';
import { FundsExpenditureSection } from '../funds-expenditures-section/FundsExpendituresSection';
import { ProgramExpensesSection } from '../program-expenses-section/ProgramExpensesSection';
import { TranslateReportsCategoryModal } from '../funds-expenditures-section/components/common/translate-reports-category-modal/TranslateReportsCategoryModal';

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
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<ReportAnalyticsTab>(ANALYTICS_TABS[0]);
    const [isFundsEditing, setIsFundsEditing] = useState(false);
    const [fundsExchangeRateDraft, setFundsExchangeRateDraft] = useState<string | null>();
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
    const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
    const [isTranslateCategoryModalOpen, setIsTranslateCategoryModalOpen] = useState(false);
    const [translationLanguages, setTranslationLanguages] = useState<LocalizationLanguage[]>([]);
    const [categories, setCategories] = useState<ReportFundsExpendituresCategory[]>([]);
    const [isRowEditMode, setIsRowEditMode] = useState(false);

    useEffect(() => {
        localizationLanguagesDataFetch()
            .then((langs) => {
                setTranslationLanguages(langs.filter((l) => l.code !== DEFAULT_LOCALE));
            })
            .catch(() => {
                addToast(COMMON_TEXT_ADMIN.LOCALIZATION.LANGUAGES.MESSAGE.FAILED_TO_FETCH_LANGUAGES, ToastType.Error);
            });
    }, [addToast]);

    const categoryContextMenuOptions: ContextMenuOption[] = useMemo(
        () => [
            { id: 'add-category', name: FUNDS_EXPENDITURES_TEXT.BUTTON.ADD_CATEGORY },
            { id: 'edit-category', name: FUNDS_EXPENDITURES_TEXT.BUTTON.EDIT_CATEGORY },
            { id: 'delete-category', name: FUNDS_EXPENDITURES_TEXT.BUTTON.DELETE_CATEGORY },
            { id: 'translate-category', name: FUNDS_EXPENDITURES_TEXT.BUTTON.TRANSLATE_CATEGORY },
        ],
        [],
    );

    const handleCategoryContextMenuOption = useCallback((id: string) => {
        if (id === 'add-category') {
            setIsAddCategoryModalOpen(true);
        } else if (id === 'edit-category') {
            setIsEditCategoryModalOpen(true);
        } else if (id === 'delete-category') {
            setIsDeleteCategoryModalOpen(true);
        } else if (id === 'translate-category') {
            setIsTranslateCategoryModalOpen(true);
        }
    }, []);

    const handleTranslateCategory = useCallback(
        (updatedCategory: ReportFundsExpendituresCategory) => {
            setCategories((prev) => prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)));
            addToast(COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_SAVED_SUCCESS, ToastType.Success);
        },
        [addToast],
    );

    return (
        <div className={styles['report-analytics']}>
            <h2 className={styles.title}>{REPORTS_TEXT.REPORT_AND_ANALYTICS.TITLE}</h2>
            <CategoryBar<ReportAnalyticsTab>
                className={`report-category-bar ${styles.reportCategoryBar}`}
                categories={ANALYTICS_TABS}
                selectedCategory={activeTab}
                getCategoryDisplayName={(tab) => tab.label}
                getCategoryKey={(tab) => tab.id}
                onCategorySelect={(tab) => {
                    if (!isRowEditMode) {
                        setActiveTab(tab);
                    }
                }}
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
                        isEditCategoryModalOpen={isEditCategoryModalOpen}
                        onEditCategoryModalClose={() => setIsEditCategoryModalOpen(false)}
                        isDeleteCategoryModalOpen={isDeleteCategoryModalOpen}
                        onDeleteCategoryModalClose={() => setIsDeleteCategoryModalOpen(false)}
                        onCategoriesLoaded={setCategories}
                        translationLanguages={translationLanguages}
                        isRowEditMode={isRowEditMode}
                        onRowEditModeChange={setIsRowEditMode}
                    />
                )}
                {activeTab.id === 'program-expenses' && (
                    <ProgramExpensesSection
                        isEditing={isFundsEditing}
                        isRowEditMode={isRowEditMode}
                        onRowEditModeChange={setIsRowEditMode}
                    />
                )}
            </div>

            <TranslateReportsCategoryModal
                isOpen={isTranslateCategoryModalOpen}
                onClose={() => setIsTranslateCategoryModalOpen(false)}
                categories={categories}
                translatedLanguages={translationLanguages}
                onTranslateCategory={handleTranslateCategory}
            />
        </div>
    );
};
