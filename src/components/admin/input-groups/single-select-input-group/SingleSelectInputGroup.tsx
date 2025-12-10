import React from 'react';
import { InputLabel, InputLabelProps } from '@/components/admin/input-label/InputLabel';
import { InputError, InputErrorProps } from '@/components/admin/input-error/InputError';
import { SingleSelectInput, SingleSelectInputProps } from '@/components/common/single-select-input/SingleSelectInput';
import '../input-group.scss';

export interface SingleSelectInputGroupProps<T extends Record<string, any>> extends SingleSelectInputProps<T> {
    label: InputLabelProps['text'];
    isRequired?: InputLabelProps['isRequired'];
    error?: InputErrorProps['error'];
    id: string;
}

export const SingleSelectInputGroup = <T extends Record<string, any>>({
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
}: SingleSelectInputGroupProps<T>) => {
    return (
        <div className="input-group">
            <InputLabel htmlFor={id} text={label} isRequired={isRequired} />
            <SingleSelectInput
                options={options}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                getOptionId={getOptionId}
                getOptionName={getOptionName}
                placeholder={placeholder}
                disabled={disabled}
                id={id}
            />
            <InputError error={error} />
        </div>
    );
};
