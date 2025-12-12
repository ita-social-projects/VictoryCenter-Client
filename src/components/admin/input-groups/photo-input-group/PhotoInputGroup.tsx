import { InputLabel, InputLabelProps } from '@/components/admin/input-label/InputLabel';
import { InputError, InputErrorProps } from '@/components/admin/input-error/InputError';
import { ImageInput, ImageInputProps } from '@/components/admin/image-input/ImageInput';
import '../input-group.scss';

export interface PhotoInputGroupProps extends Omit<ImageInputProps, 'label' | 'subText'> {
    label?: InputLabelProps['text'];
    isRequired?: InputLabelProps['isRequired'];
    error?: InputErrorProps['error'];
    id: string;
    className?: string;
    imageLabel?: string | null;
    imageSubText?: string | null;
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
    className,
    imageLabel,
    imageSubText,
    cropWidth,
    cropHeight,
    minWidth,
    minHeight,
}: PhotoInputGroupProps) => {
    return (
        <div className="input-group">
            {label && <InputLabel htmlFor={id} text={label} isRequired={isRequired} />}
            <ImageInput
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                setError={setError}
                className={className}
                label={imageLabel}
                subText={imageSubText}
                cropHeight={cropHeight}
                cropWidth={cropWidth}
                minHeight={minHeight}
                minWidth={minWidth}
            />
            <InputError error={error} />
        </div>
    );
};
