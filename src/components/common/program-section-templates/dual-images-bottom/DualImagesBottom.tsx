import cn from 'classnames';
import { ImagesBottomSection } from '../shared/images-bottom-section/ImagesBottomSection';
import { ImageValues, Image } from '@/types/common/image';
import { DUAL_IMAGES_CONFIG } from '@/const/admin/programs';
import { ProgramSectionMode } from '@/types/common/program-sections';
import styles from './DualImagesBottom.module.scss';

export interface DualImagesBottomProps {
    title?: string;
    description?: string;
    images?: (Image | ImageValues | null)[];
    mode?: ProgramSectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImagesChange?: (index: number, file: ImageValues | null) => void;
}

export const DualImagesBottom = ({
    title = '',
    description = '',
    images = [null, null],
    mode = ProgramSectionMode.Published,
    onTitleChange,
    onDescriptionChange,
    onImagesChange,
}: DualImagesBottomProps) => {
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
            config={DUAL_IMAGES_CONFIG}
            mode={mode}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
            className={cn(styles.container, {
                [styles['form-container']]: mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View,
            })}
            topSectionClassName={styles['top-section']}
            bottomSectionClassName={styles['bottom-section']}
            imageWrapperClassName={styles['image-wrapper']}
        />
    );
};
