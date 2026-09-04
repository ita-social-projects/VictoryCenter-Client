import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { CategoryBar, ContextMenuOption } from '@/components/admin/category-bar/CategoryBar';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { Button } from '@/components/admin/button/Button';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, REPORTS_TEXT } from '@/const/admin/reports';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { FundsExpendituresApi } from '@/services/api/admin/reports/funds-expenditures-api';
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
    const [exchangeRateDraft, setExchangeRateDraft] = useState<string | null>(null);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
    const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
    const [isTranslateCategoryModalOpen, setIsTranslateCategoryModalOpen] = useState(false);
    const [translationLanguages, setTranslationLanguages] = useState<LocalizationLanguage[]>([]);
    const [categories, setCategories] = useState<ReportFundsExpendituresCategory[]>([]);
    const [isRowEditMode, setIsRowEditMode] = useState(false);

    const adminClient = useAdminClient();
    const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
    const [incomeCount, setIncomeCount] = useState(0);
    const [expenseCount, setExpenseCount] = useState(0);
    const [programRecordsCount, setProgramRecordsCount] = useState(0);
    const [isFundsValid, setIsFundsValid] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [renderKey, setRenderKey] = useState(0);
    const saveSettingsCallbackRef = useRef<(() => Promise<boolean>) | null>(null);
    const refetchSettingsRef = useRef<(() => void) | null>(null);

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

    const isPublishEnabled =
        hasUnpublishedChanges && incomeCount >= 2 && expenseCount >= 2 && programRecordsCount >= 1 && isFundsValid;

    const handlePublishClick = useCallback(() => {
        setIsPublishModalOpen(true);
    }, []);

    const handlePublishConfirm = useCallback(async () => {
        setIsPublishing(true);
        try {
            if (saveSettingsCallbackRef.current) {
                const isSaved = await saveSettingsCallbackRef.current();
                if (!isSaved) {
                    setIsPublishing(false);
                    return;
                }
            }

            await FundsExpendituresApi.publishRecords(adminClient);

            addToast('Зміни успішно опубліковано', ToastType.Success, 3000);
            setHasUnpublishedChanges(false);
            setIsFundsEditing(false);
            setIsRowEditMode(false);
            setIsPublishModalOpen(false);
            refetchSettingsRef.current?.();
        } catch {
            addToast(REPORTS_TEXT.MESSAGE.FAIL_TO_UPDATE_REPORT, ToastType.Error);
        } finally {
            setIsPublishing(false);
        }
    }, [adminClient, addToast]);

    const handleCancelClick = useCallback(() => {
        setIsCancelModalOpen(true);
    }, []);

    const handleCancelConfirm = useCallback(async () => {
        setIsCancelling(true);
        try {
            await FundsExpendituresApi.cancelRecords(adminClient);
            setHasUnpublishedChanges(false);
            setIsFundsEditing(false);
            setIsRowEditMode(false);
            setIsCancelModalOpen(false);
            setRenderKey((prev) => prev + 1);
            refetchSettingsRef.current?.();
        } catch {
            addToast('Не вдалося відмінити зміни', ToastType.Error);
        } finally {
            setIsCancelling(false);
        }
    }, [adminClient, addToast]);

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
            <div className={styles['tab-content']} key={renderKey}>
                {activeTab.id === 'pdf-files' && <PdfFilesSection />}
                <div style={{ display: activeTab.id === 'income-expenses' ? 'block' : 'none' }}>
                    <FundsExpenditureSection
                        isEditing={isFundsEditing}
                        draftExchangeRate={exchangeRateDraft}
                        onEditModeChange={setIsFundsEditing}
                        onExchangeRateValueChange={setExchangeRateDraft}
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
                        onValidationChange={setIsFundsValid}
                        onCountsChange={(counts) => {
                            setIncomeCount(counts.income);
                            setExpenseCount(counts.expense);
                        }}
                        onDataChange={() => setHasUnpublishedChanges(true)}
                        registerSaveCallback={(saveFn) => {
                            saveSettingsCallbackRef.current = saveFn;
                        }}
                        onUnpublishedChangesChange={setHasUnpublishedChanges}
                        registerRefetchSettingsCallback={(fn) => {
                            refetchSettingsRef.current = fn;
                        }}
                    />
                </div>
                <div style={{ display: activeTab.id === 'program-expenses' ? 'block' : 'none' }}>
                    <ProgramExpensesSection
                        isEditing={isFundsEditing}
                        isRowEditMode={isRowEditMode}
                        onRowEditModeChange={setIsRowEditMode}
                        onCountsChange={setProgramRecordsCount}
                        onDataChange={() => setHasUnpublishedChanges(true)}
                        exchangeRate={exchangeRateDraft}
                    />
                </div>
            </div>

            <TranslateReportsCategoryModal
                isOpen={isTranslateCategoryModalOpen}
                onClose={() => setIsTranslateCategoryModalOpen(false)}
                categories={categories}
                translatedLanguages={translationLanguages}
                onTranslateCategory={handleTranslateCategory}
            />

            {isFundsEditing && activeTab.id !== 'pdf-files' && (
                <div className={styles['section-footer']}>
                    <Button buttonStyle="secondary" className={styles['footer-button']} onClick={handleCancelClick}>
                        {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                    </Button>
                    <Button
                        buttonStyle="primary"
                        className={styles['footer-button']}
                        onClick={handlePublishClick}
                        disabled={!isPublishEnabled || isRowEditMode}
                    >
                        Опублікувати
                    </Button>
                </div>
            )}

            <ConfirmationModal
                isOpen={isPublishModalOpen}
                title="Опублікувати зміни?"
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                isButtonsDisabled={isPublishing}
                onConfirm={handlePublishConfirm}
                onCancel={() => setIsPublishModalOpen(false)}
                onClose={() => setIsPublishModalOpen(false)}
            />
            <ConfirmationModal
                isOpen={isCancelModalOpen}
                title="Зміни будуть втрачені. Бажаєте продовжити?"
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                isButtonsDisabled={isCancelling}
                onConfirm={handleCancelConfirm}
                onCancel={() => setIsCancelModalOpen(false)}
                onClose={() => setIsCancelModalOpen(false)}
            />
        </div>
    );
};
