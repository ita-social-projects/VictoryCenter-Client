import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { Toggle } from '@/components/admin/toggle/Toggle';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { Metric, MetricLocalization, MetricPrefix } from '@/types/admin/main-page';
import { formatNumberInput, formatWithSpaces } from '@/utils/functions/formatters/format-number';
import {
    RaisedMetricFormValues,
    raisedMetricEditSchema,
} from '@/validation/admin/main-page-schema/metric-edit-schema/metric-edit-schema';

import styles from './RaisedMetricEditPanel.module.scss';

interface RaisedMetricEditPanelProps {
    metric: Metric;
    onSave?: (updatedMetric: Metric) => void;
    onCancel: () => void;
}

export const RaisedMetricEditPanel = ({ metric, onSave, onCancel }: RaisedMetricEditPanelProps) => {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const defaultNameUa = metric.name || '';
    const usdLocalization = metric.localizations?.find((l) => l.languageId === 2);
    const defaultNameEn = usdLocalization?.name || '';

    const defaultIsAutoSynced = false;

    const defaultValueUah = formatWithSpaces(metric.value ?? 0);
    const defaultValueUsd = formatWithSpaces(usdLocalization?.value ? parseInt(usdLocalization.value, 10) : 0);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm<RaisedMetricFormValues>({
        mode: 'onBlur',
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
        const cleanUsdValue = data.valueUsd.replace(/\s/g, '');

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
            value: parseInt(data.valueUah.replace(/\s/g, ''), 10),
            prefix: metric.prefix ?? MetricPrefix.None,
            localizations: updatedLocalizations,
        };

        if (onSave) onSave(updatedMetric);
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header}>{MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.TITLE}</div>

            <div className={styles.formGrid}>
                <Controller
                    name="nameUa"
                    control={control}
                    render={({ field: { onChange, onBlur, value, name } }) => (
                        <InputWithCharacterLimitGroup
                            id={`raised-metric-ua-${metric.id}`}
                            name={name}
                            label={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UKR_NAME_LABEL}
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={errors.nameUa?.message}
                            maxLength={MAIN_PAGE_VALIDATION.editPanel.name.max}
                            isRequired
                        />
                    )}
                />

                <Controller
                    name="nameEn"
                    control={control}
                    render={({ field: { onChange, onBlur, value, name } }) => (
                        <InputWithCharacterLimitGroup
                            id={`raised-metric-en-${metric.id}`}
                            name={name}
                            label={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.ENG_NAME_LABEL}
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            error={errors.nameEn?.message}
                            maxLength={MAIN_PAGE_VALIDATION.editPanel.name.max}
                            isRequired
                        />
                    )}
                />
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
                    render={({ field: { onChange, value } }) => (
                        <Toggle id={`sync-toggle-${metric.id}`} checked={value} onChange={onChange} />
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
                            onChange={(e) => onChange(formatNumberInput(e.target.value))}
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
                            onChange={(e) => onChange(formatNumberInput(e.target.value))}
                            onBlur={onBlur}
                            error={errors.valueUsd?.message}
                            maxLength={15}
                            isRequired
                            disabled={currentIsAutoSynced}
                        />
                    )}
                />
            </div>

            <div className={styles.actions}>
                <Button buttonStyle="secondary" onClick={() => (isFormDirty ? setIsCancelModalOpen(true) : onCancel())}>
                    {MAIN_PAGE_TEXT.BUTTONS.CANCEL}
                </Button>
                <Button buttonStyle="primary" onClick={handleSubmit(onValidSubmit)} disabled={!isFormDirty || !isValid}>
                    {MAIN_PAGE_TEXT.BUTTONS.SAVE}
                </Button>
            </div>

            <ConfirmationModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.CANCEL_MODAL_TITLE}
                onConfirm={() => {
                    setIsCancelModalOpen(false);
                    onCancel();
                }}
                onCancel={() => setIsCancelModalOpen(false)}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />
        </div>
    );
};
