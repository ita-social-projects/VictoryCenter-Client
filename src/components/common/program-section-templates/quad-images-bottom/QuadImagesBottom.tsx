import cn from 'classnames';
import { ImagesBottomSection } from '../shared/images-bottom-section/ImagesBottomSection';
import { ImageValues, Image } from '@/types/common/image';
import { QUAD_IMAGES_CONFIG } from '@/const/admin/programs';
import { ProgramSectionMode } from '@/types/common/program-sections';
import styles from './QuadImagesBottom.module.scss';
import publishedStyles from './PublishedQuadImagesBottom.module.scss';

export interface QuadImagesBottomProps {
    title?: string;
    description?: string;
    images?: (Image | ImageValues | null)[];
    mode?: ProgramSectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImagesChange?: (index: number, file: ImageValues | null) => void;
    validationResetKey?: number;
}

export const QuadImagesBottom = ({
    title = '',
    description = '',
    images = [null, null, null, null],
    mode = ProgramSectionMode.Published,
    onTitleChange,
    onDescriptionChange,
    onImagesChange,
    validationResetKey,
}: QuadImagesBottomProps) => {
    const baseStyles = mode === ProgramSectionMode.Published ? publishedStyles : styles;
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
            mode={mode}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
            validationResetKey={validationResetKey}
            className={cn(baseStyles.container, {
                [styles['form-container']]: mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View,
            })}
            topSectionClassName={baseStyles['top-section']}
            bottomSectionClassName={baseStyles['bottom-section']}
            imageWrapperClassName={baseStyles['image-wrapper']}
        />
    );
};
