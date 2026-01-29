import { useMemo, useState } from 'react';
import cn from 'classnames';
import { nanoid } from 'nanoid';
import { TitleDescriptionSection } from '../title-description-section/TitleDescriptionSection';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues, Image } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import baseStyles from './ImagesBottomSection.module.scss';
import publishedBaseStyles from './PublishedImagesBottomSection.module.scss';
import { PROGRAM_VALIDATION } from '@/const/admin/programs';
import { ProgramSectionMode } from '@/types/common/program-sections';

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
    const styles = mode === ProgramSectionMode.Published ? publishedBaseStyles : baseStyles;

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
                styles.container,
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
            <div className={cn(styles['bottom-section'], bottomSectionClassName)}>
                <div className={styles['images-grid']}>
                    {mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View
                        ? displayedImageHandlers.map(({ handler, key, value }, index) => (
                              <div
                                  key={key}
                                  className={cn(styles['image-wrapper'], imageWrapperClassName)}
                                  data-elevated={config.elevatedIndices.includes(index) ? 'true' : undefined}
                                  data-testid="image-wrapper"
                              >
                                  <PhotoInputGroup
                                      id={`section-image-${index + 1}`}
                                      name={`section-image-${index + 1}`}
                                      value={value}
                                      onChange={handler || (() => {})}
                                      setError={(error) => handleSetError(index, error)}
                                      error={errors[index]}
                                      cropWidth={config.imageConfig.cropWidth}
                                      cropHeight={config.imageConfig.cropHeight}
                                      minWidth={config.imageConfig.minWidth}
                                      minHeight={config.imageConfig.minHeight}
                                      imageLabel={config.imageLabel}
                                      imageSubText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                          config.imageConfig.cropHeight,
                                          config.imageConfig.cropWidth,
                                      )}
                                      variant="programSection"
                                      maxSizeMB={PROGRAM_VALIDATION.images.maxSizeMB}
                                      disabled={mode === ProgramSectionMode.View}
                                  />
                              </div>
                          ))
                        : displayedImages.map((image, index) => {
                              const imageSrc = getImageSrc(image);
                              return (
                                  <div
                                      key={imageKeys[index]}
                                      className={cn(styles['image-wrapper'], imageWrapperClassName)}
                                      data-elevated={config.elevatedIndices.includes(index) ? 'true' : undefined}
                                      data-testid="image-wrapper"
                                  >
                                      {imageSrc && (
                                          <img
                                              src={imageSrc}
                                              alt={`Program section ${index + 1}`}
                                              className={styles.image}
                                          />
                                      )}
                                  </div>
                              );
                          })}
                </div>
            </div>
        </div>
    );
};
