import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { LanguageToolkit } from '@/components/admin/language-toolkit/LanguageToolkit';
import { LocalizationStatuses } from '@/components/admin/localization-statuses/LocalizationStatuses';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { PageLoader } from '@/components/common/page-loader/PageLoader';

import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { MainPageApi } from '@/services/api/admin/main-page/main-page-api';
import { MainPageLocalizationsApi } from '@/services/api/admin/main-page/main-page-localizations-api/main-page-localizations-api';
import {
    ImpactStatistic,
    MAIN_PAGE_FORM_DEFAULTS,
    MainPage,
    MainPageLocalization,
    MainPageFormValues,
    MainPageLocalizationBlock,
    MainPageTranslationStatusDto,
    Metric,
} from '@/types/admin/main-page';
import { ToastType } from '@/types/admin/toast';
import { ImageValues } from '@/types/common/image';
import {
    EntityLocalization,
    EntityWithTranslationStatuses,
    LocalizationLanguage,
    TranslationStatus,
} from '@/types/common/language';
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
import { TranslateMainPageBlockModal } from '../translate-main-page-block-modal/TranslateMainPageBlockModal';
import styles from './MainPageContent.module.scss';

type TabType = 'title' | 'about' | 'statistics' | 'donations' | 'partners';

type TabItem = {
    id: TabType;
    label: string;
    localizationBlock?: MainPageLocalizationBlock;
};

type ErrorStateType = 'languages';

const TABS: TabItem[] = [
    { id: 'title', label: MAIN_PAGE_TEXT.TABS.TITLE, localizationBlock: MainPageLocalizationBlock.Title },
    { id: 'about', label: MAIN_PAGE_TEXT.TABS.ABOUT_US, localizationBlock: MainPageLocalizationBlock.AboutUs },
    {
        id: 'statistics',
        label: MAIN_PAGE_TEXT.TABS.STATISTICS,
        localizationBlock: MainPageLocalizationBlock.ImpactStatistics,
    },
    { id: 'donations', label: MAIN_PAGE_TEXT.TABS.DONATIONS },
    { id: 'partners', label: MAIN_PAGE_TEXT.TABS.PARTNERS, localizationBlock: MainPageLocalizationBlock.Partners },
];

const TRANSLATABLE_BLOCKS = new Set<MainPageLocalizationBlock>([
    MainPageLocalizationBlock.Title,
    MainPageLocalizationBlock.AboutUs,
    MainPageLocalizationBlock.Partners,
]);

const sanitizeMainPageFormValues = (values: MainPageFormValues): MainPageFormValues => ({
    ...values,
    statisticsTitleUa: values.statisticsTitleUa ?? '',
    statisticsTitleEn: values.statisticsTitleEn ?? '',
});

const getLocalizationLanguageCode = (localization: EntityLocalization): string | undefined =>
    localization.language?.code ?? (localization as EntityLocalization & { code?: string }).code;

const getLocalizationLanguageId = (localization: EntityLocalization): number | undefined =>
    localization.language?.id ?? (localization as EntityLocalization & { languageId?: number }).languageId;

const isLocalizationForLanguage = (localization: EntityLocalization, language: LocalizationLanguage) =>
    getLocalizationLanguageId(localization) === language.id ||
    getLocalizationLanguageCode(localization) === language.code;

const getLocalizationStatus = <TLocalization extends EntityLocalization>(
    localizations: TLocalization[] | undefined,
    language: LocalizationLanguage,
) => localizations?.find((localization) => isLocalizationForLanguage(localization, language))?.translationStatus;

const getStatisticsLocalizationStatus = (
    impactStatistics: ImpactStatistic | null | undefined,
    language: LocalizationLanguage,
) => {
    if (!impactStatistics) {
        return undefined;
    }

    const statisticStatus = getLocalizationStatus(impactStatistics.localizations, language);
    const metricStatuses = (impactStatistics.metrics ?? [])
        .map((metric) => getLocalizationStatus(metric.localizations, language))
        .filter((status): status is TranslationStatus => status != null);

    if (!metricStatuses.length) {
        return statisticStatus;
    }

    if (statisticStatus === TranslationStatus.Outdated || metricStatuses.includes(TranslationStatus.Outdated)) {
        return TranslationStatus.Outdated;
    }

    return statisticStatus === TranslationStatus.Relevant &&
        metricStatuses.every((status) => status === TranslationStatus.Relevant)
        ? TranslationStatus.Relevant
        : undefined;
};

export const MainPageContent = () => {
    const client = useAdminClient();
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState<TabType>('title');
    const [originalData, setOriginalData] = useState<MainPage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasLoadError, setHasLoadError] = useState(false);

    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [translationBlock, setTranslationBlock] = useState<MainPageLocalizationBlock | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [pendingPublishData, setPendingPublishData] = useState<MainPageFormValues | null>(null);

    const [currentMetrics, setCurrentMetrics] = useState<Metric[]>([]);
    const [translationStatuses, setTranslationStatuses] = useState<MainPageTranslationStatusDto[]>([]);

    const savedValuesRef = useRef<MainPageFormValues>(MAIN_PAGE_FORM_DEFAULTS);
    const isMountedRef = useRef(true);

    const methods = useForm<MainPageFormValues>({
        mode: 'onBlur',
        reValidateMode: 'onChange',
        defaultValues: MAIN_PAGE_FORM_DEFAULTS,
        resolver: yupResolver(MainPageValidationSchema),
        shouldFocusError: true,
    });

    const loadMainPageData = useCallback(
        async (showLoader = true) => {
            if (showLoader) {
                setIsLoading(true);
            }

            try {
                const { page, languages } = await MainPageApi.get(client);
                if (!isMountedRef.current) return;

                setHasLoadError(false);
                setOriginalData(page);

                const values = mapMainPageToFormValues(page, languages);
                const sanitizedValues = sanitizeMainPageFormValues(values);

                savedValuesRef.current = sanitizedValues;
                methods.reset(sanitizedValues, { keepDefaultValues: false });
            } catch (error) {
                if (!isMountedRef.current) return;

                setHasLoadError(true);
                addToast('Помилка завантаження даних', ToastType.Error, 3000);
            } finally {
                if (showLoader && isMountedRef.current) {
                    setIsLoading(false);
                }
            }
        },
        [addToast, client, methods],
    );

    const handleTabSelect = (tab: TabItem) => {
        setActiveTab(tab.id);
    };

    const setErrorState = useCallback(
        (message: string, _type: ErrorStateType) => {
            addToast(message, ToastType.Error, 3000);
        },
        [addToast],
    );

    const { allLanguages, translationLanguages, selectedLanguage, onLanguageChange } = useLocalizationToolkit({
        setErrorState,
    });

    useEffect(() => {
        isMountedRef.current = true;

        const loadData = async () => {
            await loadMainPageData();
        };

        void loadData();

        return () => {
            isMountedRef.current = false;
        };
    }, [loadMainPageData]);

    useEffect(() => {
        if (!originalData?.id || !selectedLanguage || !translationLanguages.length) {
            return;
        }

        let isMounted = true;
        const isDefaultLanguage = selectedLanguage.code === DEFAULT_LOCALE;
        const statusLanguageId = isDefaultLanguage ? translationLanguages[0].id : selectedLanguage.id;

        const loadLocalizationData = async () => {
            try {
                const statuses = await MainPageLocalizationsApi.getStatuses(client, originalData.id!, statusLanguageId);
                if (isMounted) {
                    setTranslationStatuses(statuses);
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    if (isMounted) setTranslationStatuses([]);
                } else {
                    addToast('Помилка завантаження статусів перекладу', ToastType.Error, 3000);
                }
            }

            const baseValues = sanitizeMainPageFormValues(mapMainPageToFormValues(originalData, allLanguages));

            if (isDefaultLanguage) {
                if (isMounted) {
                    savedValuesRef.current = baseValues;
                    methods.reset(baseValues, { keepDefaultValues: false });
                }
                return;
            }

            try {
                const localization = await MainPageLocalizationsApi.getByLanguageId(
                    client,
                    originalData.id!,
                    selectedLanguage.id,
                );

                if (!isMounted) return;

                const localizedValues = sanitizeMainPageFormValues({
                    ...baseValues,
                    titleEn: localization.title ?? baseValues.titleEn,
                    descriptionEn: localization.description ?? baseValues.descriptionEn,
                    aboutUsTitleEn: localization.mainAboutUs?.title ?? baseValues.aboutUsTitleEn,
                    aboutUsDescriptionEn: localization.mainAboutUs?.description ?? baseValues.aboutUsDescriptionEn,
                    partnersTitleEn: localization.mainPartners?.title ?? baseValues.partnersTitleEn,
                    partnersDescriptionEn: localization.mainPartners?.description ?? baseValues.partnersDescriptionEn,
                });

                savedValuesRef.current = localizedValues;
                methods.reset(localizedValues, { keepDefaultValues: false });
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    if (!isMounted) return;

                    const fallbackValues = sanitizeMainPageFormValues({
                        ...baseValues,
                        titleEn: baseValues.titleEn,
                        descriptionEn: baseValues.descriptionEn,
                        aboutUsTitleEn: baseValues.aboutUsTitleEn,
                        aboutUsDescriptionEn: baseValues.aboutUsDescriptionEn,
                        partnersTitleEn: baseValues.partnersTitleEn,
                        partnersDescriptionEn: baseValues.partnersDescriptionEn,
                    });

                    savedValuesRef.current = fallbackValues;
                    methods.reset(fallbackValues, { keepDefaultValues: false });
                } else {
                    addToast('Помилка завантаження перекладу', ToastType.Error, 3000);
                }
            }
        };

        void loadLocalizationData();

        return () => {
            isMounted = false;
        };
    }, [client, originalData, selectedLanguage, translationLanguages, allLanguages, methods, addToast]);

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

            const sanitizedNextValues = sanitizeMainPageFormValues(nextValues);

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
    const canTranslateActiveBlock =
        translationLanguages.length > 0 &&
        selectedTab.localizationBlock != null &&
        TRANSLATABLE_BLOCKS.has(selectedTab.localizationBlock);

    const handleOpenTranslationModal = () => {
        if (
            translationLanguages.length === 0 ||
            selectedTab.localizationBlock == null ||
            !TRANSLATABLE_BLOCKS.has(selectedTab.localizationBlock)
        ) {
            return;
        }

        setTranslationBlock(selectedTab.localizationBlock);
    };

    const handleCloseTranslationModal = () => {
        setTranslationBlock(null);
    };

    const handleTranslationSuccess = async () => {
        await loadMainPageData(false);
        setTranslationBlock(null);
        addToast(COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_PUBLISHED_SUCCESS, ToastType.Success, 3000);
    };

    const isReadOnlyLanguage = selectedLanguage ? selectedLanguage.code !== DEFAULT_LOCALE : false;
    const getBlockTranslationStatus = (block: MainPageLocalizationBlock) =>
        translationStatuses.find((status) => status.block === block)?.translationStatus;
    const getBlockLocalizationStatus = (block: MainPageLocalizationBlock, language: LocalizationLanguage) => {
        switch (block) {
            case MainPageLocalizationBlock.Title:
                return getLocalizationStatus<MainPageLocalization>(originalData?.localizations, language);
            case MainPageLocalizationBlock.AboutUs:
                return getLocalizationStatus(originalData?.mainAboutUs?.localizations, language);
            case MainPageLocalizationBlock.Partners:
                return getLocalizationStatus(originalData?.mainPartners?.localizations, language);
            case MainPageLocalizationBlock.ImpactStatistics:
                return getStatisticsLocalizationStatus(originalData?.impactStatistics, language);
            default:
                return undefined;
        }
    };
    const getTabTranslationStatusEntity = (tab: TabItem): EntityWithTranslationStatuses => {
        if (tab.localizationBlock == null) {
            return { translationStatuses: [] };
        }

        const fallbackTranslationStatus = getBlockTranslationStatus(tab.localizationBlock);
        const translationStatusesByLanguage = translationLanguages
            .map((language) => {
                const translationStatus =
                    getBlockLocalizationStatus(tab.localizationBlock!, language) ?? fallbackTranslationStatus;

                return translationStatus == null
                    ? null
                    : {
                          languageId: language.id,
                          translationStatus,
                      };
            })
            .filter((status): status is NonNullable<typeof status> => status != null);

        return {
            translationStatuses: translationStatusesByLanguage,
        };
    };

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
                <div className={styles['toolbar-top']}>
                    <LanguageToolkit languages={allLanguages} onLanguageChange={onLanguageChange} />
                </div>
                <div className={styles['toolbar-bottom']}>
                    <div className={styles['tabs-wrapper']}>
                        <CategoryBar<TabItem>
                            categories={TABS}
                            selectedCategory={selectedTab}
                            getCategoryDisplayName={(tab) => tab.label}
                            getCategoryKey={(tab) => tab.id}
                            onCategorySelect={handleTabSelect}
                            renderCategoryExtra={(tab) => {
                                const localizedEntity = getTabTranslationStatusEntity(tab);

                                return (
                                    <LocalizationStatuses
                                        languages={translationLanguages}
                                        localizedEntity={localizedEntity}
                                    />
                                );
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className={styles['main-content']}>
                {canTranslateActiveBlock && (
                    <div className={styles['content-actions']}>
                        <IconButton
                            aria-label={COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION}
                            type="button"
                            onClick={handleOpenTranslationModal}
                            DefaultIcon={ACTION_ICONS.translate.default}
                        />
                    </div>
                )}

                <FormProvider {...methods}>
                    <div className={styles['main-page-form']}>
                        {activeTab === 'title' && (
                            <TitleBlockForm
                                isPublishDisabled={isPublishDisabled}
                                onPublish={onPublish}
                                isReadOnly={isReadOnlyLanguage}
                            />
                        )}
                        {activeTab === 'about' && (
                            <AboutUsBlockForm
                                isPublishDisabled={isPublishDisabled}
                                onPublish={onPublish}
                                isReadOnly={isReadOnlyLanguage}
                            />
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
                            <PartnersBlockForm
                                isPublishDisabled={isPublishDisabled}
                                onPublish={onPublish}
                                isReadOnly={isReadOnlyLanguage}
                            />
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

            <TranslateMainPageBlockModal
                isOpen={translationBlock != null}
                onClose={handleCloseTranslationModal}
                page={originalData}
                block={translationBlock}
                translatedLanguages={translationLanguages}
                onTranslated={handleTranslationSuccess}
            />

            <ToastContainer />
        </div>
    );
};

export default MainPageContent;
