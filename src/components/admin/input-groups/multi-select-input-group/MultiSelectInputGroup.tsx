import { MultiSelectInput, MultiSelectInputProps } from '@/components/admin/multi-select-input/MultiSelectInput';
import { InputError, InputErrorProps } from '@/components/admin/input-error/InputError';
import { InputLabel, InputLabelProps } from '@/components/admin/input-label/InputLabel';
import cn from 'classnames';
import '../input-group.scss';

export interface MultiSelectInputGroupProps<T> extends MultiSelectInputProps<T> {
    label: InputLabelProps['text'];
    isRequired?: InputLabelProps['isRequired'];
    error?: InputErrorProps['error'];
    className?: string;
}

export const MultiSelectInputGroup = <T,>({
    label,
    isRequired,
    id,
    options,
    value,
    onChange,
    onBlur,
    getOptionId,
    getOptionName,
    getDisplayValue,
    isOptionSelected,
    placeholder,
    disabled,
    error,
    className,
}: MultiSelectInputGroupProps<T>) => {
    return (
        <div className={cn('input-group', className)}>
            <InputLabel htmlFor={id} text={label} isRequired={isRequired} />
            <MultiSelectInput
                id={id}
                options={options}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                getOptionId={getOptionId}
                getOptionName={getOptionName}
                getDisplayValue={getDisplayValue}
                isOptionSelected={isOptionSelected}
                placeholder={placeholder}
                disabled={disabled}
            />
            <InputError error={error} />
        </div>
    );
};
