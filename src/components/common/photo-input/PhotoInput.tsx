import React, { useRef, useState, useCallback, useEffect } from 'react';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import DeleteIcon from '../../../assets/icons/delete.svg';
import UploadIcon from '../../../assets/icons/cloud-download.svg';
import classNames from 'classnames';
import './photo-input.scss';

interface PhotoInputProps {
    value: File | string | null;
    onChange: (file: File | string | null) => void;
    onBlur?: () => void;
    disabled?: boolean;
    id?: string;
    name?: string;
}

export const PhotoInput = ({ value, onChange, onBlur, id, name, disabled = false }: PhotoInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

    const handleClick = () => {
        if (!disabled) inputRef.current?.click();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
        }
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
            {previewUrl ? (
                <div className="photo-preview">
                    <img src={previewUrl} alt="Preview" className="preview-image" data-testid="preview-image" />
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
