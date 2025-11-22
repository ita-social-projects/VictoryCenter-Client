import React from 'react';
import { InputLabel, InputLabelProps } from '../../input-label/InputLabel';
import { InputError, InputErrorProps } from '../../input-error/InputError';
import { MultiSelectInput, MultiSelectInputProps } from '../../multi-select-input/MultiSelectInput';
import styles from '../input-group.module.scss';

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
        <div className={styles['input-group']}>
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
