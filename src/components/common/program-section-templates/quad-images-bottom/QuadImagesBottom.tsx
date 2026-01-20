import cn from 'classnames';
import { ImagesBottomSection, ImagesBottomSectionConfig } from '../shared/images-bottom-section/ImagesBottomSection';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_SECTION_IMAGE_CONFIGS } from '@/const/admin/programs';
import styles from './QuadImagesBottom.module.scss';

export interface QuadImagesBottomProps {
    title?: string;
    description?: string;
    images?: string[];
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImagesChange?: (index: number, file: ImageValues | null) => void;
}

const QUAD_IMAGES_CONFIG: ImagesBottomSectionConfig = {
    imageCount: 4,
    gridColumns: 4,
    imageConfig: PROGRAM_SECTION_IMAGE_CONFIGS.QUAD_IMAGES,
    elevatedIndices: [0, 2],
    imageLabel: COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE,
    editableGridColumns: 4,
    editableImageMaxHeight: 390,
    editableImageMaxWidth: 360,
};

export const QuadImagesBottom = ({
    title = '',
    description = '',
    images = ['', '', '', ''],
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
    onImagesChange,
}: QuadImagesBottomProps) => {
    const imageHandlers = images.map((image, index) => ({
        handler: onImagesChange ? (file: ImageValues | null) => onImagesChange(index, file) : undefined,
        key: `image${index + 1}`,
        value: image,
    }));

    return (
        <ImagesBottomSection
            title={title}
            description={description}
            images={images}
            imageHandlers={imageHandlers}
            config={QUAD_IMAGES_CONFIG}
            isTemplate={isTemplate}
            isEditable={isEditable}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
            className={cn(styles.container, {
                [styles.editable]: isEditable,
            })}
            topSectionClassName={styles['top-section']}
            bottomSectionClassName={styles['bottom-section']}
            imageWrapperClassName={styles['image-wrapper']}
        />
    );
};
