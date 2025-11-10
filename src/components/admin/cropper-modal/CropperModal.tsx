import ReactCrop, { centerCrop, Crop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useEffect, useRef, useState } from 'react';
import { Image, ImageValues } from '../../../types/common/image';
import { Modal } from '../../common/modal/Modal';
import { Button } from '../button/Button';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import './CropperModal.scss';

interface CropModalProps {
    src: ImageValues | Image;
    onChange: (value: ImageValues) => void;
    height: number;
    width: number;
    onCancel: () => void;
    isOpen: boolean;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

export const CropModal = ({ src, onChange, width, height, onCancel, isOpen }: CropModalProps) => {
    const [crop, setCrop] = useState<Crop>();
    const [rawImage, setRawImage] = useState<ImageValues | null>(null); // State to hold the Base64 data
    const [displaySrc, setDisplaySrc] = useState<string | null>(null); // New state for the image source to be displayed
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null);

    // This useEffect will run whenever the `src` prop changes
    useEffect(() => {
        if (!src) return;

        if ('url' in src) {
            // It's an image with a URL, so fetch and convert
            fetch(src.url)
                .then((response) => response.blob())
                .then((blob) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = reader.result as string;
                        const parts = base64data.split(',');
                        if (parts.length > 1) {
                            const newRawImage = { base64: parts[1], mimeType: src.mimeType };
                            setRawImage(newRawImage);
                            setDisplaySrc(base64data); // Update the display source with the new data URL
                        }
                    };
                    reader.readAsDataURL(blob);
                })
                .catch((error) => console.error('Error fetching image from URL:', error));
        } else {
            // It's already a Base64 string
            setRawImage(src);
            setDisplaySrc(`data:${src.mimeType};base64,${src.base64}`); // Set the display source directly
        }
    }, [src]);

    const aspectRatio = width / height;

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (completedCrop) {
            setCrop(completedCrop);
        } else {
            const { naturalWidth, naturalHeight } = e.currentTarget;
            setCrop(centerAspectCrop(naturalWidth, naturalHeight, aspectRatio));
        }
    };

    const getCroppedImageBase64 = () => {
        const image = imgRef.current;
        if (!image || !completedCrop) {
            console.error('Image or completed crop not available.');
            return null;
        }
        // ... rest of the cropping logic, which is fine
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('No 2d context');
        }

        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
        );

        return canvas.toDataURL(rawImage?.mimeType);
    };

    const handleSubmit = () => {
        const croppedImageBase64 = getCroppedImageBase64();
        if (croppedImageBase64 && rawImage) {
            const base64Part = croppedImageBase64.split(',')[1];
            onChange({ ...rawImage, base64: base64Part });
            onCancel();
        }
    };

    // Show loading or empty state if image is not ready
    if (!displaySrc) {
        return (
            <Modal isOpen={isOpen} onClose={onCancel}>
                <div>Loading image...</div>
            </Modal>
        );
    }


    return (
        <Modal isOpen={isOpen} onClose={onCancel} maxWidth={`600 px`}>
            <Modal.Title>Редагувати фото</Modal.Title>
            <Modal.Content>
                {/* Прибираємо інлайн-стилі і додаємо клас */}
                <div className="cropper-container">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        minHeight={height}
                        minWidth={width}
                        aspect={aspectRatio}
                    >
                        <img ref={imgRef} src={displaySrc} onLoad={onImageLoad} />
                    </ReactCrop>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onCancel} buttonStyle="secondary">
                    {COMMON_TEXT_ADMIN.BUTTON.NO}
                </Button>
                <Button onClick={handleSubmit} buttonStyle="primary">
                    {COMMON_TEXT_ADMIN.BUTTON.YES}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
