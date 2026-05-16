import DefaultPlaceholder from '@/assets/images/man-facing-horse-forehead.webp';
import { Button } from '@/components/admin/button/Button';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { ImageUploadForm } from '@/pages/admin/main/components/common/image-upload-form/ImageUploadForm';
import { MainPage, MainPageFormValues, Metric } from '@/types/admin/main-page';
import { useEffect, useState } from 'react';
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
        width: '100%',
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
}

export const StatisticsBlockForm = ({ initialData, isPublishDisabled, onPublish }: StatisticsBlockFormProps) => {
    const [imageError, setImageError] = useState<string | null>(null);
    const [previewLang, setPreviewLang] = useState<'UA' | 'EN'>('UA');

    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [hiddenMetricIds, setHiddenMetricIds] = useState<number[]>([]);

    const {
        control,
        formState: { errors },
    } = useFormContext<MainPageFormValues>();

    useEffect(() => {
        if (initialData?.impactStatistics?.metrics) {
            setMetrics(initialData.impactStatistics.metrics);

            const hiddenIds = initialData.impactStatistics.metrics.filter((m) => m.isHidden).map((m) => m.id as number);
            setHiddenMetricIds(hiddenIds);
        }
    }, [initialData]);

    const handleToggleVisibility = (id: number) => {
        setHiddenMetricIds((prev) => {
            const isCurrentlyHidden = prev.includes(id);
            if (!isCurrentlyHidden && metrics.length - prev.length <= 1) {
                return prev;
            }
            return isCurrentlyHidden ? prev.filter((x) => x !== id) : [...prev, id];
        });
    };

    const handleReorderMetrics = (items: Metric[]) => {
        setMetrics(items);
    };

    return (
        <div className={styles.form}>
            <div className={styles.content}>
                <ImageUploadForm
                    control={control as any}
                    errors={errors}
                    imageError={imageError}
                    setImageError={setImageError}
                    imageConfig={IMAGE_CONFIG}
                    variant="whoWeAre"
                    name="statisticsImage"
                />

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
                    />
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
