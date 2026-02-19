import { useId, useMemo, useState } from 'react';
import cn from 'classnames';
import { TitleDescriptionSection } from '../title-description-section/TitleDescriptionSection';
import { ImageValues, Image } from '@/types/common/image';
import baseStyles from './ImagesBottomSection.module.scss';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
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
    swiperBreakpoints?: Record<number, { slidesPerView: number | 'auto' }>;
}

export interface ImageHandler {
    handler?: (file: ImageValues | null) => void;
    key: string;
    value: Image | ImageValues | null;
}

export interface ImagesBottomSectionProps {
    template: ProgramSectionTemplate;
    title?: string;
    description?: string;
    images: (Image | ImageValues | null)[];
    imageHandlers: ImageHandler[];
    config: ImagesBottomSectionConfig;
    mode?: ProgramSectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    validationResetKey?: number;
    className?: string;
    topSectionClassName?: string;
    bottomSectionClassName?: string;
    imageWrapperClassName?: string;
    imageClassName?: string;
}

export const ImagesBottomSection = ({
    template,
    title = '',
    description = '',
    images,
    imageHandlers,
    config,
    mode = ProgramSectionMode.Published,
    onTitleChange,
    onDescriptionChange,
    validationResetKey,
    className = '',
    topSectionClassName = '',
    bottomSectionClassName = '',
    imageWrapperClassName = '',
    imageClassName = '',
}: ImagesBottomSectionProps) => {
    const idPrefix = useId();
    const [errors, setErrors] = useState<string[]>([]);

    const displayedImages = useMemo(() => images.slice(0, config.imageCount), [images, config.imageCount]);
    const displayedImageHandlers = useMemo(
        () => imageHandlers.slice(0, config.imageCount),
        [imageHandlers, config.imageCount],
    );

    const imageKeys = useMemo(
        () => Array.from({ length: displayedImages.length }, (_, index) => `${idPrefix}-image-${index}`),
        [displayedImages.length, idPrefix],
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
                template={template}
                title={title}
                description={description}
                className={cn(baseStyles['top-section'], topSectionClassName)}
                titleClassName={mode === ProgramSectionMode.Template ? baseStyles['title-template'] : ''}
                descriptionClassName={mode === ProgramSectionMode.Template ? baseStyles['description-template'] : ''}
                mode={mode}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
                validationResetKey={validationResetKey}
            />

            {mode === ProgramSectionMode.Published ? (
                <PublishedImagesBottomSection
                    images={displayedImages}
                    config={config}
                    bottomSectionClassName={bottomSectionClassName}
                    imageWrapperClassName={imageWrapperClassName}
                    imageClassName={imageClassName}
                />
            ) : (
                <EditableImagesBottomSection
                    images={displayedImages}
                    imageHandlers={displayedImageHandlers}
                    imageKeys={imageKeys}
                    config={config}
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
