import cn from 'classnames';
import { TitleDescriptionSection } from '../title-description-section/TitleDescriptionSection';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import styles from './ImagesBottomSection.module.scss';

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
}: ImagesBottomSectionProps) => {
    return (
        <div
            className={cn(styles.container, className, {
                [styles.template]: isTemplate,
                [styles.editable]: isEditable,
            })}
        >
            <TitleDescriptionSection
                title={title}
                description={description}
                className={styles['top-section']}
                isEditable={isEditable}
                isTemplate={isTemplate}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
            />
            <div className={styles['bottom-section']}>
                <div className={styles['images-grid']}>
                    {isEditable
                        ? imageHandlers.map(({ handler, key, value }, index) => (
                              <div
                                  key={key}
                                  className={styles['image-wrapper']}
                                  data-elevated={config.elevatedIndices.includes(index) ? 'true' : undefined}
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
                                      className="program-section-image-input"
                                  />
                              </div>
                          ))
                        : images.map((image, index) => (
                              <div
                                  key={image ? `image-${image}` : `image-${index}`}
                                  className={styles['image-wrapper']}
                                  data-elevated={config.elevatedIndices.includes(index) ? 'true' : undefined}
                              >
                                  <img src={image} alt="" className={styles.image} />
                              </div>
                          ))}
                </div>
            </div>
        </div>
    );
};
