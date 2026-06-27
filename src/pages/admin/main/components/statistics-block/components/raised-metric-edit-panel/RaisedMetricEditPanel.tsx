import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { Toggle } from '@/components/admin/toggle/Toggle';
import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { FundsExpendituresApi } from '@/services/api/admin/reports/funds-expenditures-api';
import { Metric, MetricLocalization, MetricPrefix } from '@/types/admin/main-page';
import {
    formatCurrencyInput,
    formatWithSpaces,
    normalizeFormattedNumber,
    parseFormattedNumber,
} from '@/utils/functions/formatters/format-number';
import {
    RaisedMetricFormValues,
    raisedMetricEditSchema,
} from '@/validation/admin/main-page-schema/metric-edit-schema/metric-edit-schema';
import { MetricEditActions } from '../common/metric-edit-actions/MetricEditActions';
import { MetricNameFields } from '../common/metric-name-fields/MetricNameFields';
import styles from './RaisedMetricEditPanel.module.scss';

interface RaisedMetricEditPanelProps {
    metric: Metric;
    onSave?: (updatedMetric: Metric) => void;
    onCancel: () => void;
    onSyncErrorChange?: (hasError: boolean) => void;
}

export const RaisedMetricEditPanel = ({ metric, onSave, onCancel, onSyncErrorChange }: RaisedMetricEditPanelProps) => {
    const client = useAdminClient();
    const [isSyncConfirmOpen, setIsSyncConfirmOpen] = useState(false);
    const [isFetchingSyncPreview, setIsFetchingSyncPreview] = useState(false);

    const defaultNameUa = metric.name || '';
    const usdLocalization = metric.localizations?.find((l) => l.languageId === 2);
    const defaultNameEn = usdLocalization?.name || '';

    const defaultIsAutoSynced = metric.isAutoSynced ?? false;

    const defaultValueUah = formatWithSpaces(metric.value ?? 0);
    const parsedDefaultValueUsd = usdLocalization?.value ? parseFormattedNumber(usdLocalization.value) : null;
    const defaultValueUsd = formatWithSpaces(parsedDefaultValueUsd ?? usdLocalization?.value ?? 0);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid },
    } = useForm<RaisedMetricFormValues>({
        mode: 'onChange',
        resolver: yupResolver(raisedMetricEditSchema),
        defaultValues: {
            nameUa: defaultNameUa,
            nameEn: defaultNameEn,
            isAutoSynced: defaultIsAutoSynced,
            valueUah: defaultValueUah,
            valueUsd: defaultValueUsd,
        },
    });

    const currentNameUa = watch('nameUa');
    const currentNameEn = watch('nameEn');
    const currentIsAutoSynced = watch('isAutoSynced');
    const currentValueUah = watch('valueUah');
    const currentValueUsd = watch('valueUsd');

    const isFormDirty =
        currentNameUa.trim() !== defaultNameUa.trim() ||
        currentNameEn.trim() !== defaultNameEn.trim() ||
        currentIsAutoSynced !== defaultIsAutoSynced ||
        currentValueUah !== defaultValueUah ||
        currentValueUsd !== defaultValueUsd;

    const onValidSubmit = (data: RaisedMetricFormValues) => {
        const cleanUsdValue = normalizeFormattedNumber(data.valueUsd);
        const cleanUahValue = parseFormattedNumber(data.valueUah) ?? 0;

        let updatedLocalizations =
            metric.localizations?.map((loc) => {
                if (loc.languageId === 1) return { ...loc, name: data.nameUa.trim() };
                if (loc.languageId === 2)
                    return {
                        ...loc,
                        name: data.nameEn.trim(),
                        value: cleanUsdValue,
                    };
                return loc;
            }) || [];

        if (!updatedLocalizations.some((l) => l.languageId === 2)) {
            updatedLocalizations.push({
                languageId: 2,
                name: data.nameEn.trim(),
                value: cleanUsdValue,
            } as MetricLocalization);
        }

        const updatedMetric: Metric = {
            ...metric,
            name: data.nameUa.trim(),
            value: cleanUahValue,
            prefix: metric.prefix ?? MetricPrefix.None,
            localizations: updatedLocalizations,
            isAutoSynced: data.isAutoSynced,
        };

        if (onSave) onSave(updatedMetric);
    };

    const closeSyncConfirm = () => {
        setIsSyncConfirmOpen(false);
    };

    const handleSyncToggleChange = (checked: boolean) => {
        if (!checked) {
            setValue('isAutoSynced', false, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
            onSyncErrorChange?.(false);
            return;
        }

        setIsSyncConfirmOpen(true);
    };

    const handleSyncCancel = () => {
        setValue('isAutoSynced', false, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
        closeSyncConfirm();
    };

    const handleSyncConfirm = async () => {
        setIsFetchingSyncPreview(true);

        try {
            const summary = await FundsExpendituresApi.getSummary(client);

            setValue('isAutoSynced', true, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
            setValue('valueUah', formatWithSpaces(summary.totalCollectedUah), {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
            setValue('valueUsd', formatWithSpaces(summary.totalCollectedUsd), {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
            onSyncErrorChange?.(false);
            closeSyncConfirm();
        } catch (error) {
            setValue('isAutoSynced', false, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
            onSyncErrorChange?.(true);
            closeSyncConfirm();
        } finally {
            setIsFetchingSyncPreview(false);
        }
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header}>{MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.TITLE}</div>

            <div className={styles.formGrid}>
                <MetricNameFields metricId={metric.id} control={control} errors={errors} idPrefix="raised-metric" />
            </div>

            <div className={styles.divider} />

            <div className={styles.syncRow}>
                <span className={styles.syncText}>
                    {currentIsAutoSynced
                        ? MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.SYNC_ON_TEXT
                        : MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.SYNC_OFF_TEXT}
                </span>

                <Controller
                    name="isAutoSynced"
                    control={control}
                    render={({ field: { value } }) => (
                        <Toggle
                            id={`sync-toggle-${metric.id}`}
                            checked={value}
                            onChange={handleSyncToggleChange}
                            ariaLabel="Автоматична синхронізація"
                        />
                    )}
                />
            </div>

            <div className={styles.formGrid}>
                <Controller
                    name="valueUah"
                    control={control}
                    render={({ field: { onChange, onBlur, value, name } }) => (
                        <InputWithCharacterLimitGroup
                            id={`raised-val-uah-${metric.id}`}
                            name={name}
                            label={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UAH_VALUE_LABEL}
                            value={value}
                            onChange={(e) => onChange(formatCurrencyInput(e.target.value))}
                            onBlur={onBlur}
                            error={errors.valueUah?.message}
                            maxLength={15}
                            isRequired
                            disabled={currentIsAutoSynced}
                        />
                    )}
                />

                <Controller
                    name="valueUsd"
                    control={control}
                    render={({ field: { onChange, onBlur, value, name } }) => (
                        <InputWithCharacterLimitGroup
                            id={`raised-val-usd-${metric.id}`}
                            name={name}
                            label={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.USD_VALUE_LABEL}
                            value={value}
                            onChange={(e) => onChange(formatCurrencyInput(e.target.value))}
                            onBlur={onBlur}
                            error={errors.valueUsd?.message}
                            maxLength={15}
                            isRequired
                            disabled={currentIsAutoSynced}
                        />
                    )}
                />
            </div>

            <MetricEditActions
                isFormDirty={isFormDirty}
                isValid={isValid}
                onCancel={onCancel}
                onSave={handleSubmit(onValidSubmit)}
            />

            <ConfirmationModal
                isOpen={isSyncConfirmOpen}
                title={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.SYNC_CONFIRM_TITLE}
                onConfirm={handleSyncConfirm}
                onCancel={handleSyncCancel}
                onClose={handleSyncCancel}
                isButtonsDisabled={isFetchingSyncPreview}
            />
        </div>
    );
};
