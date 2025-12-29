import cn from 'classnames';
import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_SECTION_IMAGE_CONFIGS } from '@/const/admin/programs';
import styles from './DualImagesBottom.module.scss';

export interface DualImagesBottomProps {
    title?: string;
    description?: string;
    image1?: string;
    image2?: string;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImage1Change?: (file: ImageValues | null) => void;
    onImage2Change?: (file: ImageValues | null) => void;
}

export const DualImagesBottom = ({
    title = '',
    description = '',
    image1 = '',
    image2 = '',
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
    onImage1Change,
    onImage2Change,
}: DualImagesBottomProps) => {
    const images = [image1, image2];
    const imageHandlers = [
        { handler: onImage1Change, key: 'image1', value: image1 },
        { handler: onImage2Change, key: 'image2', value: image2 },
    ];

    return (
        <div
            className={cn(styles.container, {
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
                                  className={`${styles['image-wrapper']} ${index % 2 === 0 ? styles.elevated : ''}`}
                              >
                                  <PhotoInputGroup
                                      id={`section-image-${index + 1}`}
                                      name={`section-image-${index + 1}`}
                                      value={value ? { id: null, url: value, mimeType: '' } : null}
                                      onChange={handler || (() => {})}
                                      setError={() => {}}
                                      cropWidth={PROGRAM_SECTION_IMAGE_CONFIGS.DUAL_IMAGES.cropWidth}
                                      cropHeight={PROGRAM_SECTION_IMAGE_CONFIGS.DUAL_IMAGES.cropHeight}
                                      minWidth={PROGRAM_SECTION_IMAGE_CONFIGS.DUAL_IMAGES.minWidth}
                                      minHeight={PROGRAM_SECTION_IMAGE_CONFIGS.DUAL_IMAGES.minHeight}
                                      imageLabel={COMMON_TEXT_ADMIN.INPUT.DRAG_AND_DROP_FILE_HERE}
                                      imageSubText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                          PROGRAM_SECTION_IMAGE_CONFIGS.DUAL_IMAGES.cropHeight,
                                          PROGRAM_SECTION_IMAGE_CONFIGS.DUAL_IMAGES.cropWidth,
                                      )}
                                      className="program-section-image-input"
                                  />
                              </div>
                          ))
                        : images.map((image, index) => (
                              <div
                                  key={image ? `image-${image}` : `image-${index}`}
                                  className={`${styles['image-wrapper']} ${index % 2 === 0 ? styles.elevated : ''}`}
                              >
                                  <img src={image} alt="" className={styles.image} />
                              </div>
                          ))}
                </div>
            </div>
        </div>
    );
};
