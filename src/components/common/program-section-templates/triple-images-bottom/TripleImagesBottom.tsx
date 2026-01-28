import cn from 'classnames';
import { ImagesBottomSection } from '../shared/images-bottom-section/ImagesBottomSection';
import { ImageValues, Image } from '@/types/common/image';
import { TRIPLE_IMAGES_CONFIG } from '@/const/admin/programs';
import { ProgramSectionMode } from '@/types/common/program-sections';
import styles from './TripleImagesBottom.module.scss';

export interface TripleImagesBottomProps {
    title?: string;
    description?: string;
    images?: (Image | ImageValues | null)[];
    mode?: ProgramSectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImagesChange?: (index: number, file: ImageValues | null) => void;
}

export const TripleImagesBottom = ({
    title = '',
    description = '',
    images = [null, null, null],
    mode = ProgramSectionMode.Published,
    onTitleChange,
    onDescriptionChange,
    onImagesChange,
}: TripleImagesBottomProps) => {
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
            config={TRIPLE_IMAGES_CONFIG}
            mode={mode}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
            className={cn(styles.container, {
                [styles.editable]: mode === ProgramSectionMode.Edit,
            })}
            topSectionClassName={styles['top-section']}
            bottomSectionClassName={styles['bottom-section']}
            imageWrapperClassName={styles['image-wrapper']}
        />
    );
};
