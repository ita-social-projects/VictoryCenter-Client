import React from 'react';
import { InputLabel, InputLabelProps } from '../../input-label/InputLabel';
import { InputError, InputErrorProps } from '../../input-error/InputError';
import { PhotoInput, PhotoInputProps } from '../../photo-input/PhotoInput';
import '../input-group.scss';

export interface PhotoInputGroupProps extends PhotoInputProps {
    label: InputLabelProps['text'];
    isRequired?: InputLabelProps['isRequired'];
    error?: InputErrorProps['error'];
    id: string;
}

export const PhotoInputGroup = ({
    label,
    isRequired,
    id,
    name,
    value,
    onChange,
    onBlur,
    disabled,
    error,
}: PhotoInputGroupProps) => {
    return (
        <div className="input-group">
            <InputLabel htmlFor={id} text={label} isRequired={isRequired} />
            <PhotoInput id={id} name={name} value={value} onChange={onChange} onBlur={onBlur} disabled={disabled} />
            <InputError error={error} />
        </div>
    );
};
