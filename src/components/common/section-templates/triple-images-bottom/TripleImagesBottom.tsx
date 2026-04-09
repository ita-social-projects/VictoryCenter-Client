import cn from 'classnames';
import { ImagesBottomSection } from '../shared/images-bottom-section/ImagesBottomSection';
import { ImageValues, Image } from '@/types/common/image';
import { TRIPLE_IMAGES_CONFIG } from '@/const/admin/programs';
import { SectionMode, SectionTemplate } from '@/types/common/program-sections';
import styles from './TripleImagesBottom.module.scss';
import viewStyles from './ViewTripleImagesBottom.module.scss';

export interface TripleImagesBottomProps {
    title?: string;
    description?: string;
    images?: (Image | ImageValues | null)[];
    mode?: SectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImagesChange?: (index: number, file: ImageValues | null) => void;
    validationResetKey?: number;
}

export const TripleImagesBottom = ({
    title = '',
    description = '',
    images = [null, null, null],
    mode = SectionMode.View,
    onTitleChange,
    onDescriptionChange,
    onImagesChange,
    validationResetKey,
}: TripleImagesBottomProps) => {
    const baseStyles = mode === SectionMode.View ? viewStyles : styles;

    const imageHandlers = images.map((image, index) => ({
        handler: onImagesChange ? (file: ImageValues | null) => onImagesChange(index, file) : undefined,
        key: `image${index + 1}`,
        value: image,
    }));

    return (
        <ImagesBottomSection
            template={SectionTemplate.TripleImagesBottom}
            title={title}
            description={description}
            images={images}
            imageHandlers={imageHandlers}
            config={TRIPLE_IMAGES_CONFIG}
            mode={mode}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
            validationResetKey={validationResetKey}
            className={cn(baseStyles.container, {
                [styles.template]: mode === SectionMode.Template,
                [styles['form-container']]: mode === SectionMode.Edit,
            })}
            bottomSectionClassName={baseStyles['bottom-section']}
            imageWrapperClassName={baseStyles['image-wrapper']}
            imageClassName={baseStyles.image}
        />
    );
};
