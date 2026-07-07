import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';

import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { MultiSelectInput } from '@/components/admin/multi-select-input/MultiSelectInput';
import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { Metric, MetricLocalization, MetricPrefix } from '@/types/admin/main-page';
import { formatWithSpaces, parseFormattedNumber } from '@/utils/functions/formatters/format-number';
import {
    MetricFormValues,
    metricEditSchema,
} from '@/validation/admin/main-page-schema/metric-edit-schema/metric-edit-schema';
import { MetricEditActions } from '../common/metric-edit-actions/MetricEditActions';
import { MetricNameFields } from '../common/metric-name-fields/MetricNameFields';

import styles from './StatisticsMetricEditPanel.module.scss';

interface StatisticsMetricEditPanelProps {
    metric: Metric;
    onSave: (updatedMetric: Metric) => void;
    onCancel: () => void;
}

const PREFIX_OPTIONS = [
    { id: MetricPrefix.None, name: MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.PREFIX_NONE },
    { id: MetricPrefix.Plus, name: '+' },
    { id: MetricPrefix.Percent, name: '%' },
];

export const StatisticsMetricEditPanel = ({ metric, onSave, onCancel }: StatisticsMetricEditPanelProps) => {
    const defaultNameUa = metric.name || metric.localizations?.find((l) => l.languageId === 1)?.name || '';
    const defaultNameEn = metric.localizations?.find((l) => l.languageId === 2)?.name || '';
    const defaultValueStr = formatWithSpaces(metric.value ?? 0);
    const defaultPrefix = metric.prefix ?? MetricPrefix.None;

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm<MetricFormValues>({
        mode: 'all',
        resolver: yupResolver(metricEditSchema),
        defaultValues: {
            nameUa: defaultNameUa,
            nameEn: defaultNameEn,
            value: defaultValueStr,
            prefix: defaultPrefix,
        },
    });

    const currentNameUa = watch('nameUa');
    const currentNameEn = watch('nameEn');
    const currentValue = watch('value');
    const currentPrefix = watch('prefix');

    const isFormDirty =
        currentNameUa.trim() !== defaultNameUa.trim() ||
        currentNameEn.trim() !== defaultNameEn.trim() ||
        currentValue !== defaultValueStr ||
        currentPrefix !== defaultPrefix;

    const handleValueChange = (raw: string) => {
        if (!raw) return '';
        const stripped = raw.replace(/\s/g, '');
        if (stripped === '-') return '-';
        if (/^-?\d+$/.test(stripped)) {
            return formatWithSpaces(stripped);
        }
        return raw;
    };

    const onValidSubmit = (data: MetricFormValues) => {
        const parsedValue = parseFormattedNumber(data.value) ?? 0;
        const cleanEnName = data.nameEn.trim();
        const updatedLocalizations =
            metric.localizations?.map((loc) => {
                if (loc.languageId === 1) return { ...loc, name: data.nameUa.trim() };
                if (loc.languageId === 2) return { ...loc, name: cleanEnName, value: loc.value ?? String(parsedValue) };
                return loc;
            }) || [];

        if (!updatedLocalizations.some((l) => l.languageId === 2)) {
            updatedLocalizations.push({
                entityId: metric.id,
                languageId: 2,
                name: cleanEnName,
                value: String(parsedValue),
            } as MetricLocalization);
        }

        const updatedMetric: Metric = {
            ...metric,
            name: data.nameUa.trim(),
            value: parsedValue,
            prefix: data.prefix,
            localizations: updatedLocalizations,
        };

        onSave(updatedMetric);
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header}>{MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.TITLE}</div>

            <div className={styles.formGrid}>
                <MetricNameFields metricId={metric.id} control={control} errors={errors} />

                <Controller
                    name="value"
                    control={control}
                    render={({ field: { onChange, onBlur, value, name } }) => (
                        <InputWithCharacterLimitGroup
                            id={`metric-val-${metric.id}`}
                            name={name}
                            label={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.VALUE_LABEL}
                            value={value}
                            onChange={(e) => onChange(handleValueChange(e.target.value))}
                            onBlur={onBlur}
                            error={errors.value?.message}
                            maxLength={15}
                            isRequired
                        />
                    )}
                />

                <div className={styles.prefixGroup}>
                    <label className={styles.prefixLabel}>{MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.PREFIX_LABEL}</label>
                    <Controller
                        name="prefix"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <MultiSelectInput
                                id={`metric-prefix-${metric.id}`}
                                options={PREFIX_OPTIONS}
                                value={[PREFIX_OPTIONS.find((p) => p.id === value) ?? PREFIX_OPTIONS[0]]}
                                getOptionId={(opt) => opt.id}
                                getOptionName={(opt) => opt.name}
                                onChange={(selected) => {
                                    const next = selected.find((opt) => opt.id !== value);
                                    onChange(next?.id ?? value ?? MetricPrefix.None);
                                }}
                            />
                        )}
                    />
                </div>
            </div>

            <MetricEditActions
                isFormDirty={isFormDirty}
                isValid={isValid}
                onCancel={onCancel}
                onSave={handleSubmit(onValidSubmit)}
            />
        </div>
    );
};
