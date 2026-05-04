import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/admin/button/Button';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { MOCK_MAIN_PAGE_DATA } from '@/utils/mock-data/admin/main-page/main-page';
import { StatisticsBlockValidationSchema } from '@/validation/admin/main-page-schema/main-page-schema';
import { StatisticsBlockFormValues, STATISTICS_BLOCK_FORM_DEFAULTS, Metric } from '@/types/admin/main-page';
import DefaultPlaceholder from '@/assets/images/man-facing-horse-forehead.webp';
import { ImageUploadForm } from '@/pages/admin/main/components/common/image-upload-form/ImageUploadForm';

import { StatisticsPreview } from './components/statistics-preview/StatisticsPreview';
import { StatisticsMetricsList } from './components/statistics-metrics-list/StatisticsMetricsList';

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

export const StatisticsBlockForm = () => {
    const [imageError, setImageError] = useState<string | null>(null);
    const [previewLang, setPreviewLang] = useState<'UA' | 'EN'>('UA');

    const impactStatistics = MOCK_MAIN_PAGE_DATA.impactStatistics;
    const [metrics, setMetrics] = useState<Metric[]>(() => impactStatistics?.metrics ?? []);
    const [hiddenMetricIds, setHiddenMetricIds] = useState<number[]>([]);

    const {
        control,
        reset,
        formState: { errors, isDirty, isValid },
    } = useForm<StatisticsBlockFormValues>({
        mode: 'onChange',
        resolver: yupResolver(StatisticsBlockValidationSchema),
        defaultValues: STATISTICS_BLOCK_FORM_DEFAULTS,
    });

    useEffect(() => {
        const getTitle = (code: 'uk' | 'en') =>
            impactStatistics?.localizations?.find((l) => l.language.code === code)?.title ??
            impactStatistics?.title ??
            '';

        reset({
            titleUa: getTitle('uk'),
            titleEn: getTitle('en'),
            image: impactStatistics?.image ?? null,
        });
    }, [impactStatistics, reset]);

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
                    control={control}
                    errors={errors}
                    imageError={imageError}
                    setImageError={setImageError}
                    imageConfig={IMAGE_CONFIG}
                    variant="whoWeAre"
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
                            name="titleUa"
                            control={control}
                            render={({ field: { onChange, value, onBlur } }) => (
                                <InputWithCharacterLimitGroup
                                    id="statistics-title-ua"
                                    name={COMMON_TEXT_ADMIN.TYPE.TITLE}
                                    label={MAIN_PAGE_TEXT.BLOCKS.STATISTICS.TITLE_UA_LABEL}
                                    value={value}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    error={errors.titleUa?.message}
                                    maxLength={MAIN_PAGE_VALIDATION.statisticsBlock.title.max}
                                    isRequired
                                />
                            )}
                        />

                        <Controller
                            name="titleEn"
                            control={control}
                            render={({ field: { onChange, value, onBlur } }) => (
                                <InputWithCharacterLimitGroup
                                    id="statistics-title-en"
                                    name={COMMON_TEXT_ADMIN.TYPE.TITLE}
                                    label={MAIN_PAGE_TEXT.BLOCKS.STATISTICS.TITLE_EN_LABEL}
                                    value={value}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    error={errors.titleEn?.message}
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
                    disabled={!isDirty || !isValid || !!imageError}
                    className={styles['publish-button']}
                >
                    {MAIN_PAGE_TEXT.BUTTONS.PUBLISH}
                </Button>
            </div>
        </div>
    );
};
