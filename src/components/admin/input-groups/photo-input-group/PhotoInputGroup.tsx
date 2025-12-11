import React from 'react';
import { InputLabel, InputLabelProps } from '@/components/admin/input-label/InputLabel';
import { InputError, InputErrorProps } from '@/components/admin/input-error/InputError';
import { ImageInput, ImageInputProps } from '@/components/admin/image-input/ImageInput';
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
    width,
    height,
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
                height={height}
                width={width}
            />
            <InputError error={error} />
        </div>
    );
};
