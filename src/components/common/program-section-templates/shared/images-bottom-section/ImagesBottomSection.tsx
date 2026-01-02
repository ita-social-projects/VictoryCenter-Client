import { useMemo } from 'react';
import cn from 'classnames';
import { nanoid } from 'nanoid';
import { TitleDescriptionSection } from '../title-description-section/TitleDescriptionSection';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import baseStyles from './ImagesBottomSection.module.scss';
import quadStyles from '../../quad-images-bottom/QuadImagesBottom.module.scss';
import tripleStyles from '../../triple-images-bottom/TripleImagesBottom.module.scss';
import dualStyles from '../../dual-images-bottom/DualImagesBottom.module.scss';

const stylesMap = {
    quad: quadStyles,
    triple: tripleStyles,
    dual: dualStyles,
} as const;

export type ImageVariant = keyof typeof stylesMap;

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
    variant: ImageVariant;
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
}

export const ImagesBottomSection = ({
    variant,
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
}: ImagesBottomSectionProps) => {
    const variantStyles = stylesMap[variant];

    const imageKeys = useMemo(() => Array.from({ length: images.length }, () => nanoid()), [images.length]);

    const cx = (name: string) =>
        cn(baseStyles[name as keyof typeof baseStyles], variantStyles[name as keyof typeof variantStyles]);

    return (
        <div
            className={cn(
                cx('container'),
                {
                    [baseStyles.template]: isTemplate,
                    [cx('editable')]: isEditable,
                },
                className,
            )}
        >
            <TitleDescriptionSection
                title={title}
                description={description}
                className={cx('top-section')}
                isEditable={isEditable}
                isTemplate={isTemplate}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
            />
            <div className={cx('bottom-section')}>
                <div className={cx('images-grid')}>
                    {isEditable
                        ? imageHandlers.map(({ handler, key, value }, index) => (
                              <div
                                  key={key}
                                  className={cx('image-wrapper')}
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
                                  />
                              </div>
                          ))
                        : images.map((image, index) => (
                              <div
                                  key={imageKeys[index]}
                                  className={cx('image-wrapper')}
                                  data-elevated={config.elevatedIndices.includes(index) ? 'true' : undefined}
                                  data-testid="image-wrapper"
                              >
                                  <img src={image} alt="" className={cx('image')} />
                              </div>
                          ))}
                </div>
            </div>
        </div>
    );
};
