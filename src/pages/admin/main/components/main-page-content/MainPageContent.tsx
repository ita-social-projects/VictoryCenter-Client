import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { PageLoader } from '@/components/common/page-loader/PageLoader';

import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { MainPageApi } from '@/services/api/admin/main-page/main-page-api';
import { MAIN_PAGE_FORM_DEFAULTS, MainPage, MainPageFormValues } from '@/types/admin/main-page';
import { ToastType } from '@/types/admin/toast';
import {
    mapFormValuesToMainPagePatch,
    mapMainPageToFormValues,
} from '@/utils/functions/mappers/admin/main-page/main-page-mappers';
import { MainPageValidationSchema } from '@/validation/admin/main-page-schema/main-page-schema';

import { AboutUsBlockForm } from '../about-us-block/AboutUsBlockForm';
import { MainPagePublishModal } from '../main-page-publish-modal/MainPagePublishModal';
import { PartnersBlockForm } from '../partners-block/PartnersBlockForm';
import { StatisticsBlockForm } from '../statistics-block/StatisticsBlockForm';
import { TitleBlockForm } from '../title-block/TitleBlockForm';
import styles from './MainPageContent.module.scss';

type TabType = 'title' | 'about' | 'statistics' | 'donations' | 'partners';

type TabItem = {
    id: TabType;
    label: string;
};

const TABS: TabItem[] = [
    { id: 'title', label: MAIN_PAGE_TEXT.TABS.TITLE },
    { id: 'about', label: MAIN_PAGE_TEXT.TABS.ABOUT_US },
    { id: 'statistics', label: MAIN_PAGE_TEXT.TABS.STATISTICS },
    { id: 'donations', label: MAIN_PAGE_TEXT.TABS.DONATIONS },
    { id: 'partners', label: MAIN_PAGE_TEXT.TABS.PARTNERS },
];

export const MainPageContent = () => {
    const client = useAdminClient();
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState<TabType>('title');
    const [originalData, setOriginalData] = useState<MainPage | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [pendingPublishData, setPendingPublishData] = useState<MainPageFormValues | null>(null);

    const savedValuesRef = useRef<MainPageFormValues>(MAIN_PAGE_FORM_DEFAULTS);

    const methods = useForm<MainPageFormValues>({
        mode: 'onBlur',
        reValidateMode: 'onChange',
        defaultValues: MAIN_PAGE_FORM_DEFAULTS,
        resolver: yupResolver(MainPageValidationSchema),
        shouldFocusError: true,
    });

    const handleTabSelect = (tab: TabItem) => {
        setActiveTab(tab.id);
    };

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            setIsLoading(true);
            try {
                const { page, languages } = await MainPageApi.get(client);
                if (!isMounted) return;

                setOriginalData(page);
                const values = mapMainPageToFormValues(page, languages);
                savedValuesRef.current = values;

                if (!methods.formState.isDirty) {
                    methods.reset(values);
                }
            } catch (error) {
                addToast('Помилка завантаження даних', ToastType.Error, 3000);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        void loadData();

        return () => {
            isMounted = false;
        };
    }, [client, methods, addToast]);

    const handlePublishClick = (data: MainPageFormValues) => {
        setPendingPublishData(data);
        setIsPublishModalOpen(true);
    };

    const handleConfirmPublish = async () => {
        if (!pendingPublishData || isPublishing) return;

        setIsPublishModalOpen(false);
        setIsPublishing(true);

        try {
            const { languages } = await MainPageApi.get(client);
            const patch = mapFormValuesToMainPagePatch(pendingPublishData, originalData, languages);

            const { page, languages: updatedLanguages } = await MainPageApi.publish(client, patch, languages);

            setOriginalData(page);
            const nextValues = mapMainPageToFormValues(page, updatedLanguages);
            savedValuesRef.current = nextValues;

            methods.reset(nextValues);

            addToast('Зміни успішно опубліковано', ToastType.Success, 3000);
        } catch (error) {
            addToast('Помилка під час публікації змін', ToastType.Error, 3000);
        } finally {
            setIsPublishing(false);
            setPendingPublishData(null);
        }
    };

    const handleCancelPublish = () => {
        setIsPublishModalOpen(false); // 1.1. closes a pop-up
        setPendingPublishData(null);
    };

    const selectedTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

    if (isLoading || !originalData) {
        return <PageLoader />;
    }

    const isPublishDisabled = !methods.formState.isDirty || !methods.formState.isValid || isPublishing;

    return (
        <div className={styles.wrapper}>
            <div className={styles.toolbar}>
                <div className={styles['toolbar-bottom']}>
                    <div className={styles['tabs-wrapper']}>
                        <CategoryBar<TabItem>
                            categories={TABS}
                            selectedCategory={selectedTab}
                            getCategoryDisplayName={(tab) => tab.label}
                            getCategoryKey={(tab) => tab.id}
                            onCategorySelect={handleTabSelect}
                        />
                    </div>
                </div>
            </div>

            <div className={styles['main-content']}>
                <FormProvider {...methods}>
                    <form className={styles['main-page-form']}>
                        {activeTab === 'title' && <TitleBlockForm initialData={originalData} />}
                        {activeTab === 'about' && <AboutUsBlockForm initialData={originalData} />}
                        {activeTab === 'statistics' && <StatisticsBlockForm />}
                        {activeTab === 'donations' && <div>Блок "{MAIN_PAGE_TEXT.TABS.DONATIONS}" в розробці</div>}
                        {activeTab === 'partners' && <PartnersBlockForm initialData={originalData} />}
                    </form>
                </FormProvider>
            </div>

            <MainPagePublishModal
                isOpen={isPublishModalOpen}
                onConfirm={handleConfirmPublish}
                onCancel={handleCancelPublish}
            />

            <ToastContainer />
        </div>
    );
};

export default MainPageContent;
