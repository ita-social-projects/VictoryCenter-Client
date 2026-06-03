import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { MAIN_PAGE_TEXT, MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { Control, Controller, FieldErrors } from 'react-hook-form';

interface MetricNameFieldsProps {
    metricId: number | undefined;
    control: Control<any>;
    errors: FieldErrors<any>;
    idPrefix?: string;
}

export const MetricNameFields = ({ metricId, control, errors, idPrefix = 'metric' }: MetricNameFieldsProps) => (
    <>
        <Controller
            name="nameUa"
            control={control}
            render={({ field: { onChange, onBlur, value, name } }) => (
                <InputWithCharacterLimitGroup
                    id={`${idPrefix}-ua-${metricId}`}
                    name={name}
                    label={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.UKR_NAME_LABEL}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    error={errors.nameUa?.message as string}
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
                    id={`${idPrefix}-en-${metricId}`}
                    name={name}
                    label={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.ENG_NAME_LABEL}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    error={errors.nameEn?.message as string}
                    maxLength={MAIN_PAGE_VALIDATION.editPanel.name.max}
                    isRequired
                />
            )}
        />
    </>
);
