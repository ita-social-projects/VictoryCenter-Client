import React from 'react';
import { InputLabel, InputLabelProps } from '../../input-label/InputLabel';
import { InputError, InputErrorProps } from '../../input-error/InputError';
import { ImageInput, ImageInputProps } from '../../image-input/ImageInput';
import '../input-group.scss';

export interface PhotoInputGroupProps extends ImageInputProps {
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
    setError,
}: PhotoInputGroupProps) => {
    return (
        <div className="input-group">
            <InputLabel htmlFor={id} text={label} isRequired={isRequired} />
            <ImageInput
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                setError={setError}
            />
            <InputError error={error} />
        </div>
    );
};
