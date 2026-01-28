import { useMemo } from 'react';
import cn from 'classnames';
import { nanoid } from 'nanoid';
import { TitleDescriptionSection } from '../title-description-section/TitleDescriptionSection';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import baseStyles from './ImagesBottomSection.module.scss';
import { PROGRAM_VALIDATION } from '@/const/admin/programs';

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

export interface ImagesBottomSectionProps {
    title?: string;
    description?: string;
    images: string[];
    imageHandlers: Array<{ handler?: (file: ImageValues | null) => void; key: string; value: string }>;
    config: ImagesBottomSectionConfig;
    isTemplate?: boolean;
    isEditable?: boolean;
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
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
    className = '',
    topSectionClassName = '',
    bottomSectionClassName = '',
    imageWrapperClassName = '',
}: ImagesBottomSectionProps) => {
    const effectiveImages = useMemo(() => images.slice(0, config.imageCount), [images, config.imageCount]);
    const effectiveImageHandlers = useMemo(
        () => imageHandlers.slice(0, config.imageCount),
        [imageHandlers, config.imageCount],
    );

    const imageKeys = useMemo(
        () => Array.from({ length: effectiveImages.length }, () => nanoid()),
        [effectiveImages.length],
    );

    return (
        <div
            className={cn(
                baseStyles.container,
                {
                    [baseStyles.editable]: isEditable,
                },
                className,
            )}
        >
            <TitleDescriptionSection
                title={title}
                description={description}
                className={cn(baseStyles['top-section'], topSectionClassName)}
                titleClassName={isTemplate ? baseStyles['title-template'] : ''}
                descriptionClassName={isTemplate ? baseStyles['description-template'] : ''}
                isEditable={isEditable}
                isTemplate={isTemplate}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
            />
            <div className={cn(baseStyles['bottom-section'], bottomSectionClassName)}>
                <div className={baseStyles['images-grid']}>
                    {isEditable
                        ? effectiveImageHandlers.map(({ handler, key, value }, index) => (
                              <div
                                  key={key}
                                  className={cn(baseStyles['image-wrapper'], imageWrapperClassName)}
                                  data-elevated={config.elevatedIndices.includes(index) ? 'true' : undefined}
                                  data-testid="image-wrapper"
                              >
                                  <PhotoInputGroup
                                      id={`section-image-${index + 1}`}
                                      name={`section-image-${index + 1}`}
                                      value={value ? { id: null, url: value, mimeType: '' } : null}
                                      onChange={handler || (() => {})}
                                      setError={() => {}}
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
                                  />
                              </div>
                          ))
                        : effectiveImages.map((image, index) => (
                              <div
                                  key={imageKeys[index]}
                                  className={cn(baseStyles['image-wrapper'], imageWrapperClassName)}
                                  data-elevated={config.elevatedIndices.includes(index) ? 'true' : undefined}
                                  data-testid="image-wrapper"
                              >
                                  <img src={image} alt="" className={baseStyles.image} />
                              </div>
                          ))}
                </div>
            </div>
        </div>
    );
};
