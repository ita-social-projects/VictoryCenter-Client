import cn from 'classnames';
import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_SECTION_IMAGE_CONFIGS } from '@/const/admin/programs';
import styles from './TrippleImagesBottom.module.scss';

export interface TrippleImagesBottomProps {
    title?: string;
    description?: string;
    image1?: string;
    image2?: string;
    image3?: string;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImage1Change?: (file: ImageValues | null) => void;
    onImage2Change?: (file: ImageValues | null) => void;
    onImage3Change?: (file: ImageValues | null) => void;
}

export const TrippleImagesBottom = ({
    title = '',
    description = '',
    image1 = '',
    image2 = '',
    image3 = '',
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
    onImage1Change,
    onImage2Change,
    onImage3Change,
}: TrippleImagesBottomProps) => {
    const images = [image1, image2, image3];
    const imageHandlers = [onImage1Change, onImage2Change, onImage3Change];

    return (
        <div
            className={cn(styles.container, {
                [styles.template]: isTemplate,
                [styles.editable]: isEditable,
            })}
        >
            {isEditable ? (
                <>
                    <TitleDescriptionSection
                        title={title}
                        description={description}
                        className={styles['top-section']}
                        isEditable={true}
                        onTitleChange={onTitleChange}
                        onDescriptionChange={onDescriptionChange}
                    />
                    <div className={styles['bottom-section']}>
                        <div className={styles['images-grid']}>
                            {imageHandlers.map((handler, index) => (
                                <div
                                    key={index}
                                    className={`${styles['image-wrapper']} ${index % 2 === 0 ? styles.elevated : ''}`}
                                >
                                    <PhotoInputGroup
                                        id={`section-image-${index + 1}`}
                                        name={`section-image-${index + 1}`}
                                        value={null}
                                        onChange={handler || (() => {})}
                                        setError={() => {}}
                                        cropWidth={PROGRAM_SECTION_IMAGE_CONFIGS.TRIPLE_IMAGES.cropWidth}
                                        cropHeight={PROGRAM_SECTION_IMAGE_CONFIGS.TRIPLE_IMAGES.cropHeight}
                                        minWidth={PROGRAM_SECTION_IMAGE_CONFIGS.TRIPLE_IMAGES.minWidth}
                                        minHeight={PROGRAM_SECTION_IMAGE_CONFIGS.TRIPLE_IMAGES.minHeight}
                                        imageLabel={COMMON_TEXT_ADMIN.INPUT.DRAG_AND_DROP_FILE_HERE}
                                        imageSubText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                            PROGRAM_SECTION_IMAGE_CONFIGS.TRIPLE_IMAGES.cropHeight,
                                            PROGRAM_SECTION_IMAGE_CONFIGS.TRIPLE_IMAGES.cropWidth,
                                        )}
                                        className="program-section-image-input"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <TitleDescriptionSection
                        title={title}
                        description={description}
                        className={styles['top-section']}
                        isTemplate={isTemplate}
                    />
                    <div className={styles['bottom-section']}>
                        <div className={styles['images-grid']}>
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`${styles['image-wrapper']} ${index % 2 === 0 ? styles.elevated : ''}`}
                                >
                                    <img src={image} alt="" className={styles.image} />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
