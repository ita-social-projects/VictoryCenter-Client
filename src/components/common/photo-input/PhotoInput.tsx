import React, { useRef, useState, useCallback, useEffect } from 'react';
import DeleteIcon from '../../../assets/icons/delete.svg';
import UploadIcon from '../../../assets/icons/cloud-download.svg';
import classNames from 'classnames';
import './photo-input.scss';
import { ImageValues } from '../../../types/Image';
import { mapImageToBase64 } from '../../../utils/functions/mapImageToBase64';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

interface PhotoInputProps {
    value: ImageValues | null;
    onChange: (image: ImageValues | null) => void;
    onBlur?: () => void;
    disabled?: boolean;
    error?: boolean;
    id?: string;
    name?: string;
}

export const PhotoInput = ({ value, onChange, onBlur, id, name, disabled = false }: PhotoInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [previewImage, setPreviewImage] = useState<ImageValues | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (value) {
            setPreviewImage(value);
        }
    }, [value]);

    const handleFile = useCallback(
        async (file: File) => {
            if (!file.type.startsWith('image/')) return;
            const imgItem = await convertFileToBase64(file);
            onChange(imgItem);
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

    const handleMouseEnter = () => {
        if (!disabled) setIsFocused(true);
    };

    const handleMouseLeave = () => {
        if (!disabled) setIsFocused(false);
    };

    const handleFocus = () => {
        if (!disabled) setIsFocused(true);
    };

    const handleBlurEvent = () => {
        if (!disabled) setIsFocused(false);
        if (onBlur) {
            onBlur();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
        }
    };

    const handleClick = () => {
        if (!disabled) inputRef.current?.click();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleRemove = () => {
        setPreviewImage(null);
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div
            className={classNames('photo-input-wrapper', {
                'photo-input-wrapper-focused': isFocused && !disabled,
                'photo-input-wrapper-disabled': disabled,
            })}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlurEvent}
            aria-label={COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER || 'Upload photo'}
            tabIndex={disabled ? -1 : 0}
            role="button"
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
                id={id}
                name={name}
                tabIndex={-1}
            />

            {previewImage ? (
                <div className="photo-preview">
                    <img
                        src={mapImageToBase64(previewImage) ?? undefined}
                        alt={COMMON_TEXT_ADMIN.ALT.IMAGE_PREVIEW}
                        className="preview-image"
                        data-testid="preview-image"
                    />
                    {!disabled && (
                        <button
                            type="button"
                            className="delete-button"
                            disabled={disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                        >
                            <img src={DeleteIcon} alt={COMMON_TEXT_ADMIN.ALT.DELETE} className="delete-icon" />
                        </button>
                    )}
                </div>
            ) : (
                <div className="photo-placeholder">
                    <img src={UploadIcon} alt={COMMON_TEXT_ADMIN.ALT.UPLOAD} className="placeholder-icon" />
                    <span>{COMMON_TEXT_ADMIN.INPUT.PHOTO_PLACEHOLDER}</span>
                </div>
            )}
        </div>
    );
};

export function convertFileToBase64(file: File): Promise<ImageValues> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            const parts = result.split(',');
            if (parts.length !== 2) {
                reject(new Error('Invalid data URL format'));
                return;
            }
            resolve({
                base64: parts[1],
                mimeType: file.type,
                size: file.size,
            });
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
