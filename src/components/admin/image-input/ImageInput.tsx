import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete.svg';
import { ReactComponent as UploadIcon } from '../../../assets/icons/cloud-download.svg';
import { ReactComponent as CropIcon } from '../../../assets/icons/crop.svg';
import classNames from 'classnames';
import './ImageInput.scss';
import './WhoWeAreImageInput.scss';
import { Image, ImageValues } from '../../../types/common/image';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { ConfirmationModal } from '../confirmation-modal/ConfirmationModal';
import { COMMON_IMAGE_TEXT } from '../../../const/admin/image';
import { IMAGE_VALIDATION_FUNCTIONS } from '../../../validation/admin/image-schema/image-schema';
import { CropModal } from '../cropper-modal/CropperModal';
import { IMAGE_DIMENSION_VALIDATION_FUNCTIONS } from '../../../validation/admin/image-dimension-schema/image-dimension-schema';

export interface ImageInputProps {
    value: ImageValues | Image | null;
    onChange: (image: ImageValues | null) => void;
    setError: (error: string | null) => void;
    onBlur?: () => void;
    disabled?: boolean;
    id?: string;
    name?: string;
    className?: string | null;
    label?: string | null;
    subText?: string | null;
    style?: React.CSSProperties;
    height?: number;
    width?: number;
}

export const ImageInput = ({
    className = 'image-input-wrapper',
    label = COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER,
    subText = null,
    setError,
    value,
    onChange,
    onBlur,
    id,
    name,
    disabled = false,
    style,
    height = 1080,
    width = 1920,
}: ImageInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [previewImage, setPreviewImage] = useState<ImageValues | Image | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCropperModal, setShowCropperModal] = useState(false);
    const [rawImage, setRawImage] = useState<ImageValues | Image | null>(null);

    useEffect(() => {
        setPreviewImage(value);
        if (value && 'url' in value) {
            setRawImage(null);
        }
    }, [value]);

    const handleFile = useCallback(
        async (file: File) => {
            setError(null);
            if (!file.type.startsWith('image/')) return;
            const error = await IMAGE_VALIDATION_FUNCTIONS.validateImage(file, width, height);

            if (error) {
                setError(error);
                return;
            }
            const imgItem = await convertFileToBase64(file);

            setRawImage(imgItem);
            setShowCropperModal(true);
        },
        [height, width, setError],
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
        if (file) {
            handleFile(file);
        }
    };

    const handleRemove = () => {
        setError(null);
        setPreviewImage(null);
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
        setShowConfirmModal(false);
    };

    const handleCropCancel = async () => {
        setShowCropperModal(false);

        if (!previewImage) setPreviewImage(rawImage);

        if (previewImage && 'base64' in previewImage) {
            const error = await IMAGE_DIMENSION_VALIDATION_FUNCTIONS.validateImage(previewImage, width, height);
            if (error) {
                setError(error);
            }
        }
    };

    return (
        <div>
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
                aria-label={COMMON_TEXT_ADMIN.INPUT.IMAGE_PLACEHOLDER}
                tabIndex={disabled ? -1 : 0}
                role="button"
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                    disabled={disabled}
                    data-testid="image-input-hidden"
                    id={id}
                    name={name}
                    tabIndex={-1}
                />

                {previewImage ? (
                    <div className="image-preview">
                        <img
                            src={getImageSrc(previewImage)}
                            alt={COMMON_TEXT_ADMIN.ALT.IMAGE_PREVIEW}
                            className="preview-image"
                            data-testid="preview-image"
                        />
                        {!disabled && (
                            <div className="preview-actions">
                                <button
                                    data-testid="remove-photo-button"
                                    type="button"
                                    className="delete-button"
                                    disabled={disabled}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowConfirmModal(true);
                                    }}
                                >
                                    <DeleteIcon className={classNames('delete-icon')} />
                                </button>
                                {rawImage && 'base64' in rawImage ? (
                                    <button
                                        data-testid="crop-photo-button"
                                        type="button"
                                        className="crop-button"
                                        disabled={disabled}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCropperModal(true);
                                        }}
                                    >
                                        <CropIcon className={classNames('crop-icon')} />
                                    </button>
                                ) : null}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="image-placeholder">
                        <UploadIcon className="placeholder-icon" />
                        <span>{label}</span>
                        <span>{subText}</span>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={showConfirmModal}
                isButtonsDisabled={false}
                title={COMMON_IMAGE_TEXT.DELETE.TITLE}
                onConfirm={handleRemove}
                onCancel={() => setShowConfirmModal(false)}
                onClose={() => setShowConfirmModal(false)}
            />
            {showCropperModal && rawImage && 'base64' in rawImage && (
                <CropModal
                    data-testid="cropper"
                    src={rawImage}
                    onChange={(image: ImageValues) => {
                        onChange(image);
                        setError(null);
                        setShowCropperModal(false);
                    }}
                    height={height}
                    width={width}
                    onCancel={handleCropCancel}
                    isOpen={showCropperModal}
                />
            )}
        </div>
    );
};

export const getImageSrc = (image: Image | ImageValues | null) => {
    if (!image) return undefined;

    if ('url' in image && image.url) {
        return image.url;
    }

    if ('base64' in image) {
        return `data:${image.mimeType};base64,${image.base64}`;
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
            });
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
