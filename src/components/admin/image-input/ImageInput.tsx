import React, { useRef, useState, useCallback, useEffect } from 'react';
import {ReactComponent as DeleteIcon} from '../../../assets/icons/delete.svg';
import {ReactComponent as UploadIcon} from '../../../assets/icons/cloud-download.svg';
import classNames from 'classnames';
import './ImageInput.scss';
import './WhoWeAreImageInput.scss';
import { Image, ImageValues } from '../../../types/common/image';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import {DeleteImageModal} from "./Image-input-modals/DeleteImageModal";

export interface ImageInputProps {
    value: ImageValues | Image | null;
    onChange: (image: ImageValues | null) => void;
    onBlur?: () => void;
    disabled?: boolean;
    id?: string;
    name?: string;
    className?: string | null;
    label?: string | null;
    subText?: string | null;
    style?: React.CSSProperties;
}

export const ImageInput = ({
    className = 'image-input-wrapper',
    label = COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER,
    subText = null,
    value,
    onChange,
    onBlur,
    id,
    name,
    disabled = false,
    style,
}: ImageInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [previewImage, setPreviewImage] = useState<ImageValues | Image | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDeleteImageModalOpen, setIsDeleteImageModalOpen] = useState<boolean>(false);

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

    const handleModal =(value: boolean) =>{
        setIsDeleteImageModalOpen(value);

    }

    const confirmDelete = () => {
        handleRemove(); // Call the function to remove the image
        handleModal(false); // Close the modal
    };

    return (
        <div
            className={classNames(className, {
                'image-input-wrapper-focused': isFocused && !disabled,
                'image-input-wrapper-disabled': disabled,
            })}
            style={style}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlurEvent}
            aria-label={COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER || COMMON_TEXT_ADMIN.INPUT.UPLOAD_IMAGE}
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
                data-testid="image-input-hidden"
                id={id}
                name={name}
                tabIndex={-1}
            />

            {previewImage ? (
                <div className={classNames('image-preview')}>
                    <img
                        src={getImageSrc(previewImage)}
                        alt={COMMON_TEXT_ADMIN.ALT.IMAGE_PREVIEW}
                        className={classNames('preview-image')}
                        data-testid="preview-image"
                    />
                    {!disabled && (
                        <button
                            type="button"
                            className="delete-button"
                            disabled={disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleModal(true);
                            }}
                        >
                            <DeleteIcon
                                className={classNames('delete-icon')}
                            />
                        </button>
                    )}
                </div>
            ) : (
                <div className="image-placeholder">
                    <UploadIcon className="placeholder-icon" />
                    <span>{label}</span>
                    <span>{subText}</span>
                </div>
            )}

            <DeleteImageModal
                isOpen={isDeleteImageModalOpen}
                onClose={() => handleModal(false)}
                onSubmit={confirmDelete}
            />
        </div>
    );
};

export const getImageSrc = (img: Image | ImageValues | null) => {
    if (!img) return undefined;

    if ('url' in img && img.url) {
        return img.url;
    }

    if ('base64' in img) {
        return `data:${img.mimeType};base64,${img.base64}`;
    }

    return undefined;
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
