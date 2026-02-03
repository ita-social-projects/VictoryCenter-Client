import cn from 'classnames';
import { ImagesBottomSection } from '../shared/images-bottom-section/ImagesBottomSection';
import { ImageValues, Image } from '@/types/common/image';
import { QUAD_IMAGES_CONFIG } from '@/const/admin/programs';
import styles from './QuadImagesBottom.module.scss';

export interface QuadImagesBottomProps {
    title?: string;
    description?: string;
    images?: (Image | ImageValues | null)[];
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImagesChange?: (index: number, file: ImageValues | null) => void;
}

export const QuadImagesBottom = ({
    title = '',
    description = '',
    images = [null, null, null, null],
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
