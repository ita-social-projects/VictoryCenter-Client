import React from 'react';
import { InputLabel, InputLabelProps } from '@/components/admin/input-label/InputLabel';
import { InputError, InputErrorProps } from '@/components/admin/input-error/InputError';
import { MultiSelectInput, MultiSelectInputProps } from '@/components/admin/multi-select-input/MultiSelectInput';
import '../input-group.scss';

export interface MultiSelectInputGroupProps<T> extends MultiSelectInputProps<T> {
    label: InputLabelProps['text'];
    isRequired?: InputLabelProps['isRequired'];
    error?: InputErrorProps['error'];
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
    placeholder,
    disabled,
    error,
}: MultiSelectInputGroupProps<T>) => {
    return (
        <div className="input-group">
            <InputLabel htmlFor={id} text={label} isRequired={isRequired} />
            <MultiSelectInput
                id={id}
                options={options}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                getOptionId={getOptionId}
                getOptionName={getOptionName}
                placeholder={placeholder}
                disabled={disabled}
            />
            <InputError error={error} />
        </div>
    );
};
