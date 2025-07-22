import { TEAM_LABEL_DRAG_DROP, TEAM_LABEL_PHOTO } from '../../../../../const/team';
import CloudDownload from '../../../../../assets/icons/cloud-download.svg';
import React from 'react';
import { convertFileToBase64 } from '../../../../../utils/functions/fileConverter';
import { mapImageToBase64 } from '../../../../../utils/functions/mapImageToBase64';
import { ImageValues} from '../../../../../types/Image';

type ImageUploadFieldProps = {
    onChange: (image: ImageValues) => void;
    image: ImageValues | null;
};

export function ImageUploadField({ onChange, image }: ImageUploadFieldProps) {
    const [activeImage, setActiveImage] = React.useState<ImageValues | null>(image ?? null);

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const imgItem = await convertFileToBase64(files[0]);
            setActiveImage(imgItem);
            onChange(imgItem);
        }
    };

    const handleFileDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
                const imgItem = await convertFileToBase64(files[0]);
                onChange(imgItem);
                setActiveImage(imgItem);
        }
    };

    return (
        <div className="form-group form-group-image">
            <span>
                <span className="form-group-image-required">*</span>
                {TEAM_LABEL_PHOTO}
            </span>
            <div className="form-group-image-details">
                <label
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    htmlFor="image"
                    className="form-group-image-choose-file"
                >
                    <div
                        className={`form-group-image-choose-file-inner ${activeImage ? 'active' : ''}`}
                        data-testid="drop-area"
                    >
                        {activeImage ? (
                            <img src={mapImageToBase64(image) ?? undefined} alt="photo" />
                        ) : (
                            <>
                                <img src={CloudDownload} alt="cloud-download" />
                                <span>{TEAM_LABEL_DRAG_DROP}</span>
                            </>
                        )}
                    </div>
                </label>
                <input
                    data-testid="image"
                    onChange={handleInputChange}
                    name="img"
                    type="file"
                    id="image"
                    accept="image/*"
                />
                <div className="form-group-image-loaded"></div>
            </div>
        </div>
    );
}
