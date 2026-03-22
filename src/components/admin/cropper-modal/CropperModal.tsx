import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, ImageValues } from '../../../types/common/image';
import { Modal } from '../../common/modal/Modal';
import { Button } from '../button/Button';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import './CropperModal.scss';
import { CROPPER_CONSTANTS } from '../../../const/admin/cropper';
import { InlineLoader } from '../../common/inline-loader/InlineLoader';
import { getCroppedImageBase64 } from '../../../utils/functions/get-cropped-image-base-64/get-cropped-image-base-64';

interface CropModalProps {
    src: ImageValues | null;
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
        setRawImage(src);
        setDisplaySrc(`data:${src.mimeType};base64,${src.base64}`);

        setCrop(undefined);
        setCompletedCrop(undefined);
    }, [src]);

    const recalculateCrop = useCallback(
        (img: HTMLImageElement) => {
            const { naturalWidth: naturalImageWidth, width: currentRenderedWidth, height: currentRenderedHeight } = img;

            if (!currentRenderedWidth || !currentRenderedHeight || !naturalImageWidth) return;

            const scaleX = currentRenderedWidth / naturalImageWidth;

            const displayCropWidth = width * scaleX;
            const displayCropHeight = height * scaleX;

            const x = (currentRenderedWidth - displayCropWidth) / 2;
            const y = (currentRenderedHeight - displayCropHeight) / 2;

            const centeredCrop: PixelCrop = {
                unit: 'px',
                width: displayCropWidth,
                height: displayCropHeight,
                x: Math.max(x, 0),
                y: Math.max(y, 0),
            };

            setCrop(centeredCrop);
            setCompletedCrop(centeredCrop);
        },
        [width, height],
    );

    const onImageLoaded = (img: HTMLImageElement) => {
        imgRef.current = img;
        setNaturalWidth(img.naturalWidth);
        recalculateCrop(img);
    };

    useEffect(() => {
        const img = imgRef.current;
        if (!img) return;

        const handleResize = () => {
            recalculateCrop(img);
        };

        window.addEventListener('resize', handleResize);

        let resizeObserver: ResizeObserver | null = null;

        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => {
                recalculateCrop(img);
            });

            resizeObserver.observe(img);
            recalculateCrop(img);
        }

        return () => {
            resizeObserver?.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [naturalWidth, recalculateCrop]);

    const handleSubmit = () => {
        const cropToUse = completedCrop || crop;
        const croppedImageBase64 = getCroppedImageBase64(imgRef.current, cropToUse, width, height, rawImage);
        if (croppedImageBase64 && rawImage) {
            const base64Part = croppedImageBase64.split(',')[1];
            onChange({ base64: base64Part, mimeType: rawImage.mimeType });
        }
    };

    const onCropChange = (newCrop: PixelCrop) => {
        const currentCrop = crop as PixelCrop;
        if (!currentCrop?.width || !currentCrop?.height) return;

        const fixedWidth = currentCrop.width;
        const fixedHeight = currentCrop.height;

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
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            maxWidth={`min(calc(100vw - 32px), ${naturalWidth ? Math.min(1200, Math.max(800, naturalWidth)) : 800}px)`}
        >
            <Modal.Title>{CROPPER_CONSTANTS.TITLE}</Modal.Title>
            <Modal.Content>
                <div className="cropper-container" style={{ display: 'flex', justifyContent: 'center' }}>
                    {displaySrc ? (
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
                    ) : (
                        <InlineLoader size={8} />
                    )}
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
