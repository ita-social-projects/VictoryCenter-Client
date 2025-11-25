import ReactCrop, { centerCrop, Crop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useEffect, useRef, useState } from 'react';
import { Image, Image as Img, ImageValues } from '../../../types/common/image';
import { Modal } from '../../common/modal/Modal';
import { Button } from '../button/Button';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import './CropperModal.scss';

interface CropModalProps {
    src: ImageValues | Img | null;
    onChange: (value: ImageValues) => void;
    height: number;
    width: number;
    onCancel: () => void;
    isOpen: boolean;
}

export const CropModal = ({ src, onChange, width, height, onCancel, isOpen }: CropModalProps) => {
    const [crop, setCrop] = useState<Crop>();
    const [displaySrc, setDisplaySrc] = useState<string | null>(null);
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null);
    const [rawImage, setRawImage] = useState<ImageValues | Image | null>(null);
    const [naturalWidth, setNaturalWidth] = useState<number | null>(null);
    const aspectRatio = width / height;

    useEffect(() => {
        if (!src) {
            setRawImage(null);
            setDisplaySrc(null);
            return;
        }

        if ('base64' in src) {
            setRawImage(src);
            setDisplaySrc(`data:${src.mimeType};base64,${src.base64}`);
        } else {
            setRawImage(src);
            setDisplaySrc(src.url);
        }

        setCrop(undefined);
        setCompletedCrop(undefined);
    }, [src]);

    const getCroppedImageBase64 = () => {
        const image = imgRef.current;
        const cropToUse = completedCrop || crop;

        if (!image || !cropToUse) {
            return null;
        }

        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('No 2d context');
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        let sourceX, sourceY, sourceWidth, sourceHeight;

        if (cropToUse.unit === '%') {
            sourceX = (cropToUse.x / 100) * image.naturalWidth;
            sourceY = (cropToUse.y / 100) * image.naturalHeight;
            sourceWidth = (cropToUse.width / 100) * image.naturalWidth;
            sourceHeight = (cropToUse.height / 100) * image.naturalHeight;
        } else {
            sourceX = cropToUse.x * scaleX;
            sourceY = cropToUse.y * scaleY;
            sourceWidth = cropToUse.width * scaleX;
            sourceHeight = cropToUse.height * scaleY;
        }

        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);

        return canvas.toDataURL(rawImage?.mimeType || 'image/jpeg');
    };

    const handleSubmit = () => {
        try {
            const croppedImageBase64 = getCroppedImageBase64();
            if (croppedImageBase64 && rawImage) {
                const base64Part = croppedImageBase64.split(',')[1];
                onChange({ base64: base64Part, mimeType: rawImage.mimeType });
                onCancel();
            }
        } catch (e) {
            console.error('Error cropping image:', e);
        }
    };

    const onImageLoaded = (img: HTMLImageElement) => {
        imgRef.current = img;

        const { naturalWidth, naturalHeight, width: renderedWidth, height: renderedHeight } = img;

        setNaturalWidth(naturalWidth);



        const scaleX = renderedWidth / naturalWidth;
        const scaleY = renderedHeight / naturalHeight;

        const displayCropWidth = width * scaleX;
        const displayCropHeight = height * scaleY;

        const x = (renderedWidth - displayCropWidth) / 2;
        const y = (renderedHeight - displayCropHeight) / 2;

        const centeredCrop: PixelCrop = {
            unit: 'px',
            width: displayCropWidth,
            height: displayCropHeight,
            x: x,
            y: y,
        };

        setCrop(centeredCrop);
        setCompletedCrop(centeredCrop);
    };

    const onCropChange = (newCrop: PixelCrop) => {
        if (!crop?.width || !crop?.height) return;

        const fixedWidth = crop.width;
        const fixedHeight = crop.height;

        const img = imgRef.current;
        if (!img) return;

        let newX = newCrop.x;
        let newY = newCrop.y;

        if (newX + fixedWidth > img.width) {
            newX = img.width - fixedWidth;
        }
        if (newX < 0) newX = 0;

        if (newY + fixedHeight > img.height) {
            newY = img.height - fixedHeight;
        }
        if (newY < 0) newY = 0;

        setCrop({
            unit: 'px',
            x: newX,
            y: newY,
            width: fixedWidth,
            height: fixedHeight,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onCancel} maxWidth={`${naturalWidth ? Math.min(1000, naturalWidth) : 1000}px`}>
            <Modal.Title>Редагувати фото</Modal.Title>
            <Modal.Content>
                {!displaySrc ? (
                    <div>Loading image...</div>
                ) : (
                    <div className="cropper-container" style={{ display: 'flex', justifyContent: 'center' }}>
                        <ReactCrop
                            crop={crop}
                            onChange={onCropChange}
                            onComplete={(pixelCrop) => {
                                setCompletedCrop(pixelCrop);
                            }}
                            minWidth={crop?.width}
                            maxWidth={crop?.width}
                            minHeight={crop?.height}
                            maxHeight={crop?.height}
                            keepSelection
                            aspect={aspectRatio}

                        >
                            <img
                                ref={imgRef}
                                src={displaySrc}
                                crossOrigin="anonymous"
                                alt="Crop target"
                                onLoad={(e) => onImageLoaded(e.currentTarget)}
                                style={{ maxWidth: '100%', maxHeight: '70vh' }}
                            />
                        </ReactCrop>
                    </div>
                )}
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
