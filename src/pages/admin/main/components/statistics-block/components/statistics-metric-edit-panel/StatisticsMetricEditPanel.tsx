import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { MultiSelectInput } from '@/components/admin/multi-select-input/MultiSelectInput';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { Metric, MetricPrefix } from '@/types/admin/main-page';
import {
    MetricFormValues,
    metricEditSchema,
} from '@/validation/admin/main-page-schema/metric-edit-schema/metric-edit-schema';

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
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors, isDirty, isValid },
    } = useForm<MetricFormValues>({
        mode: 'onBlur',
        resolver: yupResolver(metricEditSchema),
        defaultValues: {
            nameUa: metric.localizations?.find((l) => l.languageId === 1)?.name || '',
            nameEn: metric.localizations?.find((l) => l.languageId === 2)?.name || '',
            value: String(metric.value).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
            prefix: metric.prefix || MetricPrefix.None,
        },
    });

    const onValidSubmit = (data: MetricFormValues) => {
        const updatedLocalizations =
            metric.localizations?.map((loc) => {
                if (loc.languageId === 1) return { ...loc, name: data.nameUa.trim() };
                if (loc.languageId === 2) return { ...loc, name: data.nameEn.trim() };
                return loc;
            }) || [];

        const updatedMetric: Metric = {
            ...metric,
            value: parseInt(data.value.replace(/\s/g, ''), 10),
            prefix: data.prefix,
            localizations: updatedLocalizations,
        };

        onSave(updatedMetric);
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
                            id={`metric-ua-${metric.id}`}
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
                            id={`metric-en-${metric.id}`}
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

                <Controller
                    name="value"
                    control={control}
                    render={({ field: { onChange, onBlur, value, name } }) => (
                        <InputWithCharacterLimitGroup
                            id={`metric-val-${metric.id}`}
                            name={name}
                            label={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.VALUE_LABEL}
                            value={value}
                            onChange={(e) =>
                                onChange(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' '))
                            }
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
                                value={[PREFIX_OPTIONS.find((p) => p.id === value) || PREFIX_OPTIONS[0]]}
                                getOptionId={(opt) => opt.id}
                                getOptionName={(opt) => opt.name}
                                onChange={(selected) => onChange(selected[0]?.id || MetricPrefix.None)}
                            />
                        )}
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <Button buttonStyle="secondary" onClick={() => (isDirty ? setIsCancelModalOpen(true) : onCancel())}>
                    {MAIN_PAGE_TEXT.BUTTONS.CANCEL}
                </Button>
                <Button buttonStyle="primary" onClick={handleSubmit(onValidSubmit)} disabled={!isDirty || !isValid}>
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
