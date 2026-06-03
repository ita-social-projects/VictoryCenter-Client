import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { PageLoader } from '@/components/common/page-loader/PageLoader';

import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { MainPageApi } from '@/services/api/admin/main-page/main-page-api';
import { MAIN_PAGE_FORM_DEFAULTS, MainPage, MainPageFormValues, Metric } from '@/types/admin/main-page';
import { ToastType } from '@/types/admin/toast';
import { ImageValues } from '@/types/common/image';
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
    const [hasLoadError, setHasLoadError] = useState(false);

    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [pendingPublishData, setPendingPublishData] = useState<MainPageFormValues | null>(null);

    const [currentMetrics, setCurrentMetrics] = useState<Metric[]>([]);

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
                setHasLoadError(false);
                setOriginalData(page);

                const values = mapMainPageToFormValues(page, languages);

                const sanitizedValues = {
                    ...values,
                    statisticsTitleUa: values.statisticsTitleUa ?? '',
                    statisticsTitleEn: values.statisticsTitleEn ?? '',
                };

                savedValuesRef.current = sanitizedValues;

                methods.reset(sanitizedValues, { keepDefaultValues: false });
            } catch (error) {
                setHasLoadError(true);
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
            let dataToPublish = { ...pendingPublishData };

            if (dataToPublish.image && !('id' in dataToPublish.image)) {
                const uploaded = await ImageApi.post(client, dataToPublish.image as ImageValues);
                dataToPublish.image = uploaded;
            }

            if (dataToPublish.statisticsImage && !('id' in dataToPublish.statisticsImage)) {
                const uploaded = await ImageApi.post(client, dataToPublish.statisticsImage as ImageValues);
                dataToPublish.statisticsImage = uploaded;
            }

            const patch = mapFormValuesToMainPagePatch(
                dataToPublish,
                originalData,
                languages,
                currentMetrics.length ? currentMetrics : undefined,
            );

            const { page, languages: updatedLanguages } = await MainPageApi.publish(client, patch, languages);

            setOriginalData(page);
            const nextValues = mapMainPageToFormValues(page, updatedLanguages);

            const sanitizedNextValues = {
                ...nextValues,
                statisticsTitleUa: nextValues.statisticsTitleUa ?? '',
                statisticsTitleEn: nextValues.statisticsTitleEn ?? '',
            };

            savedValuesRef.current = sanitizedNextValues;

            methods.reset(sanitizedNextValues, { keepDefaultValues: false });
            setCurrentMetrics([]);

            addToast('Зміни успішно опубліковано', ToastType.Success, 3000);
        } catch (error) {
            addToast('Помилка під час публікації змін', ToastType.Error, 3000);
        } finally {
            setIsPublishing(false);
            setPendingPublishData(null);
        }
    };

    const handleCancelPublish = () => {
        setIsPublishModalOpen(false);
        setPendingPublishData(null);
    };

    const selectedTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

    if (isLoading) {
        return <PageLoader />;
    }

    if (!originalData) {
        return hasLoadError ? <div>{MAIN_PAGE_TEXT.ERRORS.LOAD_FAILED}</div> : <PageLoader />;
    }

    const isPublishDisabled = !methods.formState.isDirty || !methods.formState.isValid || isPublishing;
    const onPublish = methods.handleSubmit(handlePublishClick);

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
                    <div className={styles['main-page-form']}>
                        {activeTab === 'title' && (
                            <TitleBlockForm isPublishDisabled={isPublishDisabled} onPublish={onPublish} />
                        )}
                        {activeTab === 'about' && (
                            <AboutUsBlockForm isPublishDisabled={isPublishDisabled} onPublish={onPublish} />
                        )}
                        {activeTab === 'statistics' && (
                            <StatisticsBlockForm
                                initialData={originalData}
                                isPublishDisabled={isPublishDisabled}
                                onPublish={onPublish}
                                onMetricsChange={setCurrentMetrics}
                            />
                        )}
                        {activeTab === 'donations' && <div>Блок "{MAIN_PAGE_TEXT.TABS.DONATIONS}" в розробці</div>}
                        {activeTab === 'partners' && (
                            <PartnersBlockForm isPublishDisabled={isPublishDisabled} onPublish={onPublish} />
                        )}
                    </div>
                </FormProvider>
            </div>

            <MainPagePublishModal
                isOpen={isPublishModalOpen}
                onConfirm={handleConfirmPublish}
                onCancel={handleCancelPublish}
                isButtonsDisabled={isPublishing}
            />

            <ToastContainer />
        </div>
    );
};

export default MainPageContent;
