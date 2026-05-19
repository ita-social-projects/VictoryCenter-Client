import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { MultiSelectInput } from '@/components/admin/multi-select-input/MultiSelectInput';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';
import { Metric, MetricPrefix } from '@/types/admin/main-page';
import { useState } from 'react';
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

const formatThousands = (value: string | number): string => {
    const raw = String(value).replace(/\D/g, '');
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const parseThousands = (value: string): number => {
    return parseInt(value.replace(/\s/g, ''), 10) || 0;
};

export const StatisticsMetricEditPanel = ({ metric, onSave, onCancel }: StatisticsMetricEditPanelProps) => {
    const initUa = metric.localizations?.find((l) => l.languageId === 1)?.name || '';
    const initEn = metric.localizations?.find((l) => l.languageId === 2)?.name || '';
    const initValue = formatThousands(metric.value);
    const initPrefix = PREFIX_OPTIONS.find((p) => p.id === metric.prefix) || PREFIX_OPTIONS[0];

    const [nameUa, setNameUa] = useState(initUa);
    const [nameEn, setNameEn] = useState(initEn);
    const [value, setValue] = useState(initValue);
    const [prefix, setPrefix] = useState([initPrefix]);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const isChanged = nameUa !== initUa || nameEn !== initEn || value !== initValue || prefix[0].id !== initPrefix.id;

    const isValid = nameUa.trim().length >= 2 && nameEn.trim().length >= 2 && parseThousands(value) > 0;
    const isSaveDisabled = !isChanged || !isValid;

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatThousands(e.target.value);
        setValue(formatted);
    };

    const handleCancelClick = () => {
        if (isChanged) {
            setIsCancelModalOpen(true);
        } else {
            onCancel();
        }
    };

    const handleConfirmCancel = () => {
        setIsCancelModalOpen(false);
        onCancel();
    };

    const handleSave = () => {
        if (isSaveDisabled) return;

        const updatedLocalizations =
            metric.localizations?.map((loc) => {
                if (loc.languageId === 1) return { ...loc, name: nameUa.trim() };
                if (loc.languageId === 2) return { ...loc, name: nameEn.trim() };
                return loc;
            }) || [];

        const updatedMetric: Metric = {
            ...metric,
            value: parseThousands(value),
            prefix: prefix[0].id as MetricPrefix,
            localizations: updatedLocalizations,
        };

        onSave(updatedMetric);
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header}>{MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.TITLE}</div>
            <div className={styles.formGrid}>
                <InputWithCharacterLimitGroup
                    id={`metric-ua-${metric.id}`}
                    name="nameUa"
                    label={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UKR_NAME_LABEL}
                    value={nameUa}
                    onChange={(e) => setNameUa(e.target.value)}
                    maxLength={20}
                    isRequired
                />
                <InputWithCharacterLimitGroup
                    id={`metric-en-${metric.id}`}
                    name="nameEn"
                    label={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.ENG_NAME_LABEL}
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    maxLength={20}
                    isRequired
                />
                <InputWithCharacterLimitGroup
                    id={`metric-val-${metric.id}`}
                    name="value"
                    label={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.VALUE_LABEL}
                    value={value}
                    onChange={handleValueChange}
                    maxLength={15}
                    isRequired
                />
                <div className={styles.prefixGroup}>
                    <label className={styles.prefixLabel}>{MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.PREFIX_LABEL}</label>
                    <MultiSelectInput
                        id={`metric-prefix-${metric.id}`}
                        options={PREFIX_OPTIONS}
                        value={prefix}
                        getOptionId={(opt) => opt.id}
                        getOptionName={(opt) => opt.name}
                        onChange={(selected) =>
                            setPrefix(selected.length ? [selected[selected.length - 1]] : [PREFIX_OPTIONS[0]])
                        }
                    />
                </div>
            </div>
            <div className={styles.actions}>
                <Button buttonStyle="secondary" onClick={handleCancelClick}>
                    {MAIN_PAGE_TEXT.BUTTONS.CANCEL}
                </Button>
                <Button buttonStyle="primary" onClick={handleSave} disabled={isSaveDisabled}>
                    {MAIN_PAGE_TEXT.BUTTONS.SAVE}
                </Button>
            </div>

            <ConfirmationModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.CANCEL_MODAL_TITLE}
                onConfirm={handleConfirmCancel}
                onCancel={() => setIsCancelModalOpen(false)}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />
        </div>
    );
};
