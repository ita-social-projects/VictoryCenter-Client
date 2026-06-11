import DefaultPlaceholder from '@/assets/images/two-horses-gray.webp';
import { Button } from '@/components/admin/button/Button';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { ImageUploadForm } from '@/pages/admin/main/components/common/image-upload-form/ImageUploadForm';
import { MainPageApi } from '@/services/api/admin/main-page/main-page-api';
import { MainPage, MainPageFormValues, Metric, MetricType } from '@/types/admin/main-page';
import { ToastType } from '@/types/admin/toast';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StatisticsMetricsList } from './components/statistics-metrics-list/StatisticsMetricsList';
import { StatisticsPreview } from './components/statistics-preview/StatisticsPreview';

import styles from './StatisticsBlockForm.module.scss';

const IMAGE_CONFIG = {
    cropWidth: 1440,
    cropHeight: 860,
    minWidth: 1440,
    minHeight: 860,
    label: 'Додайте файл сюди',
    subText: 'Розмір: 1440x860',
    style: {
        width: '640px',
        aspectRatio: '1440 / 860',
        backgroundImage: `linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)), url(${DefaultPlaceholder})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
};

interface StatisticsBlockFormProps {
    initialData: MainPage | null;
    isPublishDisabled: boolean;
    onPublish: () => void;
    onMetricsChange?: (metrics: Metric[]) => void;
}

export const StatisticsBlockForm = ({
    initialData,
    isPublishDisabled,
    onPublish,
    onMetricsChange,
}: StatisticsBlockFormProps) => {
    const client = useAdminClient();
    const { addToast } = useToast();

    const [imageError, setImageError] = useState<string | null>(null);
    const [previewLang, setPreviewLang] = useState<'UA' | 'EN'>('UA');

    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [hiddenMetricIds, setHiddenMetricIds] = useState<number[]>([]);
    const [hasRaisedFundsSyncError, setHasRaisedFundsSyncError] = useState(false);
    const initialMetricsRef = useRef<Metric[]>([]);

    const {
        control,
        setValue,
        formState: { errors, defaultValues },
    } = useFormContext<MainPageFormValues>();

    const toComparableMetrics = (items: Metric[]) =>
        items.map((metric) => ({
            id: metric.id ?? null,
            value: metric.value,
            name: metric.name ?? '',
            type: metric.type,
            prefix: metric.prefix,
            isHidden: metric.isHidden,
            priority: metric.priority,
            isAutoSynced: metric.isAutoSynced ?? false,
            localizations: (metric.localizations ?? [])
                .map((loc) => ({
                    languageId: loc.languageId ?? null,
                    name: (loc.name ?? '').trim(),
                    value: loc.value ? String(loc.value).trim() : '',
                }))
                .sort((a, b) => (a.languageId ?? 0) - (b.languageId ?? 0)),
        }));

    const areMetricsEqual = (left: Metric[], right: Metric[]) =>
        JSON.stringify(toComparableMetrics(left)) === JSON.stringify(toComparableMetrics(right));

    const hasMetricSyncError = (metric: Metric) =>
        metric.type === MetricType.Raised &&
        Boolean(metric.isAutoSyncFailed || metric.autoSyncError || metric.syncError);

    useEffect(() => {
        if (initialData?.impactStatistics?.metrics) {
            const apiMetrics = initialData.impactStatistics.metrics;
            setMetrics(apiMetrics);
            initialMetricsRef.current = apiMetrics;
            setHasRaisedFundsSyncError(apiMetrics.some(hasMetricSyncError));

            const hiddenIds = apiMetrics.filter((m) => m.isHidden).map((m) => m.id as number);
            setHiddenMetricIds(hiddenIds);
        }
    }, [initialData]);

    const handleToggleVisibility = async (id: number) => {
        const isCurrentlyHidden = hiddenMetricIds.includes(id);
        const willBeHidden = !isCurrentlyHidden;

        if (willBeHidden && metrics.length - hiddenMetricIds.length <= 1) {
            return;
        }

        setHiddenMetricIds((prev) => (willBeHidden ? [...prev, id] : prev.filter((x) => x !== id)));

        try {
            await MainPageApi.updateMetricVisibility(client, id, { isHidden: willBeHidden });
        } catch (error) {
            addToast(MAIN_PAGE_TEXT.ERRORS.TOGGLE_VISIBILITY_FAILED, ToastType.Error, 3000);
            setHiddenMetricIds((prev) => (isCurrentlyHidden ? [...prev, id] : prev.filter((x) => x !== id)));
        }
    };

    const handleReorderMetrics = async (items: Metric[]) => {
        setMetrics(items);

        const statisticId = initialData?.impactStatistics?.id;
        if (!statisticId) return;

        const orderedIds = items.map((item) => item.id as number).filter(Boolean);

        try {
            await MainPageApi.reorderMetrics(client, { statisticId, orderedIds });
        } catch (error) {
            addToast(MAIN_PAGE_TEXT.ERRORS.REORDER_FAILED, ToastType.Error, 3000);
            if (initialData?.impactStatistics?.metrics) {
                setMetrics(initialData.impactStatistics.metrics);
            }
        }
    };

    const handleMetricUpdate = (updatedMetrics: Metric[]) => {
        const hasChanges = !areMetricsEqual(updatedMetrics, initialMetricsRef.current);

        setMetrics(updatedMetrics);
        onMetricsChange?.(updatedMetrics);

        if (!hasChanges) {
            const originalFormMetrics = defaultValues?.metrics || [];

            setValue('metrics', originalFormMetrics as Metric[], {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        } else {
            setValue('metrics', updatedMetrics, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        }
    };

    return (
        <div className={styles.form}>
            <div className={styles.content}>
                <div className={styles['image-section']}>
                    <ImageUploadForm
                        control={control as any}
                        errors={errors}
                        imageError={imageError}
                        setImageError={setImageError}
                        imageConfig={IMAGE_CONFIG}
                        variant="whoWeAre"
                        name="statisticsImage"
                    />
                </div>

                <div className={styles['right-section']}>
                    <StatisticsPreview
                        language={previewLang}
                        onLanguageChange={setPreviewLang}
                        metrics={metrics}
                        hiddenMetricIds={hiddenMetricIds}
                    />

                    <div className={styles['title-section']}>
                        <Controller
                            name="statisticsTitleUa"
                            control={control}
                            render={({ field: { onChange, value, onBlur } }) => (
                                <InputWithCharacterLimitGroup
                                    id="statistics-title-ua"
                                    name={COMMON_TEXT_ADMIN.TYPE.TITLE}
                                    label={MAIN_PAGE_TEXT.BLOCKS.STATISTICS.TITLE_UA_LABEL}
                                    value={value}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    error={errors.statisticsTitleUa?.message}
                                    maxLength={MAIN_PAGE_VALIDATION.statisticsBlock.title.max}
                                    isRequired
                                />
                            )}
                        />

                        <Controller
                            name="statisticsTitleEn"
                            control={control}
                            render={({ field: { onChange, value, onBlur } }) => (
                                <InputWithCharacterLimitGroup
                                    id="statistics-title-en"
                                    name={COMMON_TEXT_ADMIN.TYPE.TITLE}
                                    label={MAIN_PAGE_TEXT.BLOCKS.STATISTICS.TITLE_EN_LABEL}
                                    value={value}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    error={errors.statisticsTitleEn?.message}
                                    maxLength={MAIN_PAGE_VALIDATION.statisticsBlock.title.max}
                                    isRequired
                                />
                            )}
                        />
                    </div>

                    <StatisticsMetricsList
                        metrics={metrics}
                        hiddenMetricIds={hiddenMetricIds}
                        onToggleVisibility={handleToggleVisibility}
                        onReorder={handleReorderMetrics}
                        onMetricUpdate={handleMetricUpdate}
                        onRaisedFundsSyncErrorChange={setHasRaisedFundsSyncError}
                    />

                    {hasRaisedFundsSyncError && (
                        <p className={styles.error}>{MAIN_PAGE_TEXT.ERRORS.RAISED_FUNDS_SYNC_FAILED}</p>
                    )}
                </div>
            </div>

            <div className={styles.actions}>
                <Button
                    type="button"
                    buttonStyle="primary"
                    disabled={isPublishDisabled || !!imageError}
                    className={styles['publish-button']}
                    onClick={onPublish}
                >
                    {MAIN_PAGE_TEXT.BUTTONS.PUBLISH}
                </Button>
            </div>
        </div>
    );
};
