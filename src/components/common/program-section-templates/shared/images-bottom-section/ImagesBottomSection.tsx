import { useMemo, useState } from 'react';
import cn from 'classnames';
import { nanoid } from 'nanoid';
import { TitleDescriptionSection } from '../title-description-section/TitleDescriptionSection';
import { ImageValues, Image } from '@/types/common/image';
import baseStyles from './ImagesBottomSection.module.scss';
import { ProgramSectionMode } from '@/types/common/program-sections';
import { PublishedImagesBottomSection } from './PublishedImagesBottomSection';
import { EditableImagesBottomSection } from './EditableImagesBottomSection';

export interface ImageConfig {
    cropWidth: number;
    cropHeight: number;
    minWidth: number;
    minHeight: number;
}

export interface ImagesBottomSectionConfig {
    imageCount: number;
    gridColumns: number;
    imageConfig: ImageConfig;
    elevatedIndices: number[];
    imageLabel: string;
    editableGridColumns?: number;
    editableImageMaxHeight?: number;
    editableImageMaxWidth?: number;
}

export interface ImageHandler {
    handler?: (file: ImageValues | null) => void;
    key: string;
    value: Image | ImageValues | null;
}

export interface ImagesBottomSectionProps {
    title?: string;
    description?: string;
    images: (Image | ImageValues | null)[];
    imageHandlers: ImageHandler[];
    config: ImagesBottomSectionConfig;
    mode?: ProgramSectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    className?: string;
    topSectionClassName?: string;
    bottomSectionClassName?: string;
    imageWrapperClassName?: string;
}

export const ImagesBottomSection = ({
    title = '',
    description = '',
    images,
    imageHandlers,
    config,
    mode = ProgramSectionMode.Published,
    onTitleChange,
    onDescriptionChange,
    className = '',
    topSectionClassName = '',
    bottomSectionClassName = '',
    imageWrapperClassName = '',
}: ImagesBottomSectionProps) => {
    const [errors, setErrors] = useState<string[]>([]);

    const displayedImages = useMemo(() => images.slice(0, config.imageCount), [images, config.imageCount]);
    const displayedImageHandlers = useMemo(
        () => imageHandlers.slice(0, config.imageCount),
        [imageHandlers, config.imageCount],
    );

    const imageKeys = useMemo(
        () => Array.from({ length: displayedImages.length }, () => nanoid()),
        [displayedImages.length],
    );

    const handleSetError = (index: number, error: string | null) => {
        setErrors((prevErrors) => {
            const newErrors = [...prevErrors];
            newErrors[index] = error || '';
            return newErrors;
        });
    };

    return (
        <div
            className={cn(
                baseStyles.container,
                {
                    [baseStyles['form-container']]:
                        mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View,
                },
                className,
            )}
        >
            <TitleDescriptionSection
                title={title}
                description={description}
                className={cn(baseStyles['top-section'], topSectionClassName)}
                titleClassName={mode === ProgramSectionMode.Template ? baseStyles['title-template'] : ''}
                descriptionClassName={mode === ProgramSectionMode.Template ? baseStyles['description-template'] : ''}
                mode={mode}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
            />
            {mode === ProgramSectionMode.Published ? (
                <PublishedImagesBottomSection images={displayedImages} elevatedIndices={config.elevatedIndices} />
            ) : (
                <EditableImagesBottomSection
                    images={displayedImages}
                    imageHandlers={displayedImageHandlers}
                    imageKeys={imageKeys}
                    elevatedIndices={config.elevatedIndices}
                    imageConfig={config.imageConfig}
                    imageLabel={config.imageLabel}
                    mode={mode}
                    bottomSectionClassName={bottomSectionClassName}
                    imageWrapperClassName={imageWrapperClassName}
                    errors={errors}
                    onSetError={handleSetError}
                />
            )}
        </div>
    );
};
