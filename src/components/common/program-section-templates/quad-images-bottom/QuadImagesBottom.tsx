import cn from 'classnames';
import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_SECTION_IMAGE_CONFIGS } from '@/const/admin/programs';
import styles from './QuadImagesBottom.module.scss';

export interface QuadImagesBottomProps {
    title?: string;
    description?: string;
    image1?: string;
    image2?: string;
    image3?: string;
    image4?: string;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImage1Change?: (file: ImageValues | null) => void;
    onImage2Change?: (file: ImageValues | null) => void;
    onImage3Change?: (file: ImageValues | null) => void;
    onImage4Change?: (file: ImageValues | null) => void;
}

export const QuadImagesBottom = ({
    title = '',
    description = '',
    image1 = '',
    image2 = '',
    image3 = '',
    image4 = '',
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
    onImage1Change,
    onImage2Change,
    onImage3Change,
    onImage4Change,
}: QuadImagesBottomProps) => {
    const images = [image1, image2, image3, image4];
    const imageHandlers = [
        { handler: onImage1Change, key: 'image1', value: image1 },
        { handler: onImage2Change, key: 'image2', value: image2 },
        { handler: onImage3Change, key: 'image3', value: image3 },
        { handler: onImage4Change, key: 'image4', value: image4 },
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
                                  className={`${styles['image-wrapper']} ${index % 2 === 1 ? styles.elevated : ''}`}
                              >
                                  <PhotoInputGroup
                                      id={`section-image-${index + 1}`}
                                      name={`section-image-${index + 1}`}
                                      value={value ? { id: null, url: value, mimeType: '' } : null}
                                      onChange={handler || (() => {})}
                                      setError={() => {}}
                                      cropWidth={PROGRAM_SECTION_IMAGE_CONFIGS.QUAD_IMAGES.cropWidth}
                                      cropHeight={PROGRAM_SECTION_IMAGE_CONFIGS.QUAD_IMAGES.cropHeight}
                                      minWidth={PROGRAM_SECTION_IMAGE_CONFIGS.QUAD_IMAGES.minWidth}
                                      minHeight={PROGRAM_SECTION_IMAGE_CONFIGS.QUAD_IMAGES.minHeight}
                                      imageLabel={COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE}
                                      imageSubText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                          PROGRAM_SECTION_IMAGE_CONFIGS.QUAD_IMAGES.cropHeight,
                                          PROGRAM_SECTION_IMAGE_CONFIGS.QUAD_IMAGES.cropWidth,
                                      )}
                                      className="program-section-image-input"
                                  />
                              </div>
                          ))
                        : images.map((image, index) => (
                              <div
                                  key={image ? `image-${image}` : `image-${index}`}
                                  className={`${styles['image-wrapper']} ${index % 2 === 1 ? styles.elevated : ''}`}
                              >
                                  <img src={image} alt="" className={styles.image} />
                              </div>
                          ))}
                </div>
            </div>
        </div>
    );
};
