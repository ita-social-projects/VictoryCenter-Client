import React, { useRef, useState, useCallback, useEffect } from 'react';
import DeleteIcon from '../../../assets/icons/delete.svg';
import UploadIcon from '../../../assets/icons/cloud-download.svg';
import classNames from 'classnames';
import './photo-input.scss';

interface PhotoInputProps {
    value: File | string | null;
    onChange: (file: File | string | null) => void;
    onBlur?: () => void;
    disabled?: boolean;
    error?: boolean;
    id?: string;
    name?: string;
}

const PhotoInput = ({ value, onChange, onBlur, disabled = false }: PhotoInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Generate preview when file is selected
    useEffect(() => {
        if (value) {
            if (value instanceof File) {
                const objectUrl = URL.createObjectURL(value);
                setPreviewUrl(objectUrl);
                return () => URL.revokeObjectURL(objectUrl);
            } else if (typeof value === 'string') {
                setPreviewUrl(value);
                return () => {};
            }
        } else {
            setPreviewUrl(null);
        }
    }, [value]);

    // Handle file drop or selection
    const handleFile = useCallback(
        (file: File) => {
            if (!file.type.startsWith('image/')) return;
            onChange(file);
        },
        [onChange],
    );

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
        setIsFocused(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled) setIsFocused(true);
    };

    const handleDragLeave = () => {
        setIsFocused(false);
    };

    const handleClick = () => {
        if (!disabled) inputRef.current?.click();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleRemove = () => {
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div
            className={classNames('photo-input-wrapper', {
                'photo-input-wrapper-focused': isFocused,
                'photo-input-wrapper-disabled': disabled,
            })}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                onBlur={onBlur}
                style={{ display: 'none' }}
                disabled={disabled}
                data-testid="photo-input-hidden"
            />

            {previewUrl ? (
                <div className="photo-preview">
                    <img src={previewUrl} alt="Preview" className="preview-image" />
                    <button
                        type="button"
                        className="delete-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemove();
                        }}
                    >
                        <img src={DeleteIcon} alt="Видалити" className="delete-icon" />
                    </button>
                </div>
            ) : (
                <div className="photo-placeholder">
                    <img src={UploadIcon} alt="Upload" className="placeholder-icon" />
                    <span>Перетягніть файл сюди або натисніть для завантаження</span>
                </div>
            )}
        </div>
    );
};

export default PhotoInput;
